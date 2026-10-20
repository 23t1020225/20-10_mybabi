// Animated heart tree, laid out in the reference video's coordinate system.
class HeartTree {
    constructor(canvas, onBloomed) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.onBloomed = onBloomed;
        this.hitHearts = [];
        this.bursts = [];
        this.landings = [];
        this.restingHearts = [];
        this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
        this.canvas.style.pointerEvents = 'auto';
        this.canvas.addEventListener('pointerdown', event => {
            this.press = { x: event.clientX, y: event.clientY };
        });
        this.canvas.addEventListener('pointerup', event => {
            if (!this.press || Math.hypot(event.clientX-this.press.x,event.clientY-this.press.y)>12) return;
            this.press = null;
            const hit = this.findHeart(event.clientX,event.clientY);
            if (hit) this.burstHeart(hit);
        });
        this.canvas.addEventListener('pointercancel', () => { this.press = null; });
        this.canvas.addEventListener('pointermove', event => {
            this.canvas.style.cursor = this.findHeart(event.clientX,event.clientY) ? 'pointer' : 'default';
        });
        this.colors = ['#fa0063','#ee009f','#ff5ab7','#fb91c3','#e81a39','#ffef35','#ffd33e','#f68b37','#ffb779','#c5009c'];
        this.resize = () => {
            this.W = canvas.parentElement.clientWidth; this.H = canvas.parentElement.clientHeight;
            const dpr = Math.min(devicePixelRatio || 1, 2);
            canvas.width = this.W*dpr; canvas.height = this.H*dpr;
            canvas.style.width = this.W+'px'; canvas.style.height = this.H+'px';
            this.ctx.setTransform(dpr,0,0,dpr,0,0);
        };
        this.resize(); window.addEventListener('resize',this.resize);
        new ResizeObserver(this.resize).observe(canvas.parentElement);
    }
    start() {
        this.started = performance.now(); this.notified = false; this.leaves = []; this.falling = []; this.landings = []; this.bursts = []; this.restingHearts = [];
        const outline = Array.from({length:120},(_,i)=>{ const a=i/120*Math.PI*2; return [Math.sin(a)**3, -(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))/16]; });
        const inside = (x,y) => { let hit=false; for(let i=0,j=119;i<120;j=i++) { const a=outline[i],b=outline[j]; if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit; } return hit; };
        while (this.leaves.length < 760) {
            const x = Math.random()*2.3-1.15, y = Math.random()*2.3-1.15;
            if (!inside(x,y)) continue;
            this.leaves.push({x:x*280,y:y*280, size:9+Math.random()*9, angle:Math.random()*5-2.5, color:this.colors[Math.floor(Math.random()*this.colors.length)]});
        }
        this.branches = [];
        const branch = (x,y,len,angle,width,depth) => {
            const ex=x+Math.sin(angle)*len, ey=y-Math.cos(angle)*len;
            this.branches.push({x,y,ex,ey,width,depth});
            if(depth<4) { branch(ex,ey,len*.69,angle-.42,width*.58,depth+1); branch(ex,ey,len*.73,angle+.48,width*.57,depth+1); }
        };
        branch(0,684,190,-.02,30,0);
        const frame = now => { this.draw((now-this.started)/1000); this.raf=requestAnimationFrame(frame); };
        this.raf=requestAnimationFrame(frame);
    }
    heart(x,y,r,angle,color,alpha=1) {
        const c=this.ctx; c.save(); c.translate(x,y); c.rotate(angle); c.globalAlpha=alpha; c.fillStyle=color;
        c.beginPath(); c.moveTo(0,r*.8); c.bezierCurveTo(-r*1.8,-r*.3,-r*.7,-r*1.4,0,-r*.55); c.bezierCurveTo(r*.7,-r*1.4,r*1.8,-r*.3,0,r*.8); c.fill(); c.restore();
    }
    findHeart(clientX,clientY) {
        const rect=this.canvas.getBoundingClientRect();
        const x=(clientX-rect.left)*this.W/rect.width;
        const y=(clientY-rect.top)*this.H/rect.height;
        let closest=null, distance=Infinity;
        for(const hit of this.hitHearts) {
            const d=Math.hypot(x-hit.x,y-hit.y);
            if(!hit.leaf.popped && d<=Math.max(20,hit.size*1.5) && d<distance) { closest=hit; distance=d; }
        }
        return closest;
    }
    burstHeart(hit) {
        hit.leaf.popped=true;
        const colors=['#ef5da8','#ff9dce','#eab53b','#ffd36b'];
        this.bursts.push({x:hit.x,y:hit.y,size:hit.size,color:hit.leaf.color,angle:hit.angle,born:performance.now(),
            particles:Array.from({length:30},(_,i)=>({angle:i/30*Math.PI*2+(Math.random()-.5)*.3,speed:32+Math.random()*70,radius:1+Math.random()*2,color:colors[i%colors.length],twinkle:Math.random()*Math.PI*2}))});
        if(this.bursts.length>12) this.bursts.shift();
        this.canvas.style.cursor='default';
    }
    drawBursts() {
        const c=this.ctx, now=performance.now();
        this.bursts=this.bursts.filter(b=>now-b.born<1500);
        for(const b of this.bursts) {
            const age=(now-b.born)/1000;
            if(age<.2) {
                const progress=age/.2;
                this.heart(b.x,b.y,b.size*(1+progress*.7),b.angle,b.color,1-progress*.3);
                continue;
            }
            const t=age-.2, fade=Math.max(0,1-t/1.3);
            c.save();
            if(t<.4 && !this.reducedMotion.matches) {
                c.globalAlpha=(1-t/.4)*.4;c.strokeStyle='#ed82b6';c.lineWidth=1;
                c.beginPath();c.arc(b.x,b.y,8+t*75,0,Math.PI*2);c.stroke();
            }
            for(const p of b.particles) {
                const travel=this.reducedMotion.matches?0:(1-Math.exp(-t*2.6))*p.speed;
                const x=b.x+Math.cos(p.angle)*travel;
                const y=b.y+Math.sin(p.angle)*travel+(this.reducedMotion.matches?0:t*t*22);
                const r=p.radius*(.5+.5*fade);
                c.globalAlpha=fade*(.65+.35*Math.sin(t*14+p.twinkle)**2);
                c.fillStyle=p.color;c.shadowColor=p.color;c.shadowBlur=7;
                c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();
                if(p.radius>2.3) {
                    c.strokeStyle=p.color;c.lineWidth=.9;
                    c.beginPath();c.moveTo(x-r*2.4,y);c.lineTo(x+r*2.4,y);
                    c.moveTo(x,y-r*2.4);c.lineTo(x,y+r*2.4);c.stroke();
                }
            }
            c.restore();
        }
    }
    landHeart(leaf,x,t) {
        leaf.landed=true;
        const size=leaf.size*.7;
        this.landings.push({x,y:684-size*1.2,size,color:leaf.color,angle:leaf.angle+t-leaf.born,born:t,
            particles:Array.from({length:6},(_,i)=>({vx:(i-2.5)*(7+Math.random()*3),height:5+Math.random()*11,size:1+Math.random()*1.2,color:i%2?'#eab53b':'#ef7fb5'}))});
        if(this.landings.length>24) this.landings.shift();
        this.restingHearts.push({x,y:687+Math.random()*10,size:4+Math.random()*3,angle:Math.random()*1.5-.75,born:t+.2});
        if(this.restingHearts.length>15) this.restingHearts.shift();
    }
    drawGround(root,t) {
        const c=this.ctx;
        c.save();c.translate(root,684);c.scale(1,.14);
        const glow=c.createRadialGradient(0,0,8,0,0,300);
        glow.addColorStop(0,'#b9608c42');glow.addColorStop(.4,'#d98fb33d');
        glow.addColorStop(.75,'#eaa8ca18');glow.addColorStop(1,'#eaa8ca00');
        c.fillStyle=glow;c.fillRect(-305,-305,610,610);c.restore();
        if(t>3.5) {
            const fade=Math.min(1,(t-3.5)/1.5);
            [[-162,10,7,-.4],[-106,-2,6,.5],[-62,17,7,-.8],[52,8,7,.4],[115,-1,6,-.7],[183,12,6,.7],[-6,22,5,.6]].forEach((p,i)=>{
                this.heart(root+p[0],684+p[1],p[2],p[3],i%2?'#eb8cb6':'#dc5d95',.6*fade);
            });
        }
    }
    drawRestingHearts(t) {
        this.restingHearts=this.restingHearts.filter(l=>t-l.born<8);
        for(const l of this.restingHearts) {
            const age=t-l.born;
            if(age<0)continue;
            const alpha=Math.min(1,age*3)*Math.min(.65,(8-age)/2);
            this.heart(l.x,l.y,l.size,l.angle,'#df77a4',alpha);
        }
    }
    drawLandings(t) {
        const c=this.ctx;
        this.landings=this.landings.filter(l=>t-l.born<.8);
        for(const l of this.landings) {
            const age=t-l.born;
            if(age<.2) {
                const bounce=this.reducedMotion.matches?0:Math.sin(age/.2*Math.PI)*7;
                this.heart(l.x,l.y-bounce,l.size,l.angle,l.color,1-age*2);
                continue;
            }
            const p=(age-.2)/.6,fade=1-p;
            c.save();
            if(!this.reducedMotion.matches) {
                c.save();c.translate(l.x,684);c.scale(1,.22);
                c.globalAlpha=fade*.6;c.strokeStyle='#df8fb6';c.lineWidth=1.5;
                c.beginPath();c.arc(0,0,7+p*85,0,Math.PI*2);c.stroke();c.restore();
            }
            for(const particle of l.particles) {
                const x=l.x+(this.reducedMotion.matches?0:particle.vx*p);
                const y=682-(this.reducedMotion.matches?0:Math.sin(p*Math.PI)*particle.height);
                c.globalAlpha=fade*.8;c.fillStyle=particle.color;c.shadowColor=particle.color;c.shadowBlur=4;
                c.beginPath();c.arc(x,y,particle.size*(.5+.5*fade),0,Math.PI*2);c.fill();
            }
            c.restore();
        }
    }
    draw(t) {
        const c=this.ctx, mobile=this.W<601;
        c.clearRect(0,0,this.W,this.H); c.save();
        let sx=this.W/1180,sy=this.H/788,ox=0,oy=0;
        if(mobile) { const s=Math.min(this.W/680,this.H*.40/740); sx=sy=s;ox=this.W/2-590*s;oy=this.H*.58; }
        c.translate(ox,oy);c.scale(sx,sy);
        this.hitHearts=[];
        const shift=Math.min(1,Math.max(0,(t-7)/1.4));
        const root=590+(mobile?0:250*shift);
        // Share the same coordinates with the photo layer, including dock resizes.
        const photoWidth=(mobile?170:130)*sx;
        const photoLayout={mobile,anchors:(mobile?[[root,270]]:[[root-155,270],[root+145,260],[root,435]]).map(([x,y])=>({left:ox+x*sx-photoWidth/2,top:oy+y*sy,width:photoWidth}))};
        const layoutKey=JSON.stringify(photoLayout);
        if(layoutKey!==this.photoLayoutKey) {
            this.photoLayoutKey=layoutKey;
            this.canvas.treePhotoLayout=photoLayout;
            this.canvas.dispatchEvent(new CustomEvent('tree-photo-layout',{detail:photoLayout}));
        }
        this.drawGround(root,t);
        c.save();
        c.beginPath(); c.rect(0,0,1180,684); c.clip();
        if(t<1.1) this.heart(root,Math.min(675,t*t*570),7,0,'#d60044');
        for(const b of this.branches) {
            const p=Math.min(1,Math.max(0,(t-1.1-b.depth*.48)/.8)); if(!p)continue;
            const branchTone=c.createLinearGradient(root+b.x-b.width,b.y,root+b.x+b.width,b.y);
            branchTone.addColorStop(0,'#805364');branchTone.addColorStop(.45,'#593746');branchTone.addColorStop(1,'#684353');
            c.strokeStyle=branchTone; c.lineCap='round'; c.lineWidth=b.width;
            const tipX=root+b.x+(b.ex-b.x)*p,tipY=b.y+(b.ey-b.y)*p;
            c.beginPath();c.moveTo(root+b.x,b.y);
            c.quadraticCurveTo(root+b.x+(b.ex-b.x)*p*.35+(b.depth?4:2)*p,b.y+(b.ey-b.y)*p*.6,tipX,tipY);c.stroke();
        }
        // Plum wood with a subtle rose-lit edge and a softly flared base.
        if(t>3.5) {
            const wood=c.createLinearGradient(root-36,0,root+35,0);
            wood.addColorStop(0,'#805364');wood.addColorStop(.38,'#593746');
            wood.addColorStop(.75,'#684353');wood.addColorStop(1,'#986b7c');
            c.fillStyle=wood;c.beginPath();c.moveTo(root-38,684);
            c.bezierCurveTo(root-18,674,root-7,565,root-5,400);
            c.lineTo(root+10,400);c.bezierCurveTo(root+9,544,root+17,670,root+35,684);
            c.quadraticCurveTo(root,688,root-38,684);c.fill();
            c.fillStyle='#e9a8c329';c.beginPath();c.moveTo(root+9,425);
            c.bezierCurveTo(root+8,542,root+13,635,root+24,674);
            c.lineTo(root+19,672);c.bezierCurveTo(root+8,615,root+5,521,root+7,425);c.fill();
        }
        this.leaves.forEach((l,i)=>{const p=Math.min(1,Math.max(0,(t-3.4-i/310)/.55)); if(p)this.heart(root+l.x,295+l.y,l.size*p,l.angle,l.color,.9);});
        if(t>6) {
            if(Math.random()<.24) { const l=this.leaves[Math.floor(Math.random()*this.leaves.length)]; this.falling.push({...l,x:root+l.x,y:295+l.y,born:t}); }
            // Keep high leaves alive long enough to reach the ground.
            this.falling=this.falling.filter(l=>!l.popped && !l.landed && t-l.born<14);
            this.falling.forEach(l=>{
                const age=t-l.born,x=l.x-Math.sin(age)*35-age*12,y=l.y+age*55;
                if(y+l.size*.7*1.2>=684) { this.landHeart(l,x,t); return; }
                this.heart(x,y,l.size*.7,l.angle+age,l.color);
                const px=ox+x*sx,py=oy+y*sy;
                if(y<670 && px>0 && px<this.W && py>0 && py<this.H) {
                    this.hitHearts.push({leaf:l,x:px,y:py,size:l.size*.7*Math.sqrt(sx*sy),angle:l.angle+age});
                }
            });
        }
        c.restore();
        this.drawRestingHearts(t);
        this.drawLandings(t);
        c.restore();
        this.drawBursts();
        if(t>8.4&&!this.notified) {this.notified=true; this.onBloomed?.();}
    }
}

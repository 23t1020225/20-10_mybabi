// ── Falling Petal Particle System (stage 1) ──────────────────────

class Petal {
    constructor(canvas) {
        this.canvas = canvas;
        this.reset();
    }
    reset() {
        const c = this.canvas;
        this.x = Math.random() * c.width;
        this.y = -30;
        this.size = 4 + Math.random() * 9;
        this.speedY = 0.7 + Math.random() * 1.4;
        this.speedX = (Math.random() - 0.5) * 0.7;
        this.sway = Math.random() * Math.PI * 2;
        this.swaySpeed = 0.02 + Math.random() * 0.025;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.05;
        // pinks and rose tones from the video
        const hue = 330 + Math.random() * 30;
        const sat = 60 + Math.random() * 30;
        const lig = 70 + Math.random() * 20;
        this.color = `hsl(${hue},${sat}%,${lig}%)`;
        this.alpha = 0.5 + Math.random() * 0.5;
    }
    update() {
        this.sway += this.swaySpeed;
        this.x += this.speedX + Math.sin(this.sway) * 1.0;
        this.y += this.speedY;
        this.rotation += this.rotSpeed;
        if (this.y > this.canvas.height + 30) this.reset();
    }
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        // small rounded heart shape
        const s = this.size;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.3);
        ctx.bezierCurveTo(-s * 0.7, -s * 0.5, -s * 1.2, s * 0.4, 0, s * 1.3);
        ctx.bezierCurveTo( s * 1.2,  s * 0.4,  s * 0.7,-s * 0.5, 0, s * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

function startPetalSystem(canvas) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resize() {
        canvas.width  = window.innerWidth  * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width  = window.innerWidth  + 'px';
        canvas.style.height = window.innerHeight + 'px';
    }
    resize();
    window.addEventListener('resize', resize);

    const petals = Array.from({ length: 38 }, () => {
        const p = new Petal(canvas);
        p.y = Math.random() * canvas.height / dpr; // start scattered
        return p;
    });

    let running = true;
    function frame() {
        if (!running) return;
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        petals.forEach(p => { p.update(); p.draw(ctx); });
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return () => { running = false; };
}

// Photos follow the tree's own coordinates rather than viewport percentages.
class TreeMemories {
    constructor(canvas, photos, onOpen, onChange) {
        this.photos=photos;this.onChange=onChange;this.cache=new Map();
        this.active=false;this.paused=false;this.generation=0;this.nextIndex=0;this.interval=6500;
        this.layer=document.createElement('div');this.layer.className='tree-memories';this.layer.hidden=true;
        this.layer.setAttribute('aria-label','Ảnh kỷ niệm treo trên cây');
        this.buttons=Array.from({length:3},(_,slot)=>{
            const button=document.createElement('button');button.type='button';button.className='tree-memory';button.hidden=true;
            const string=document.createElement('span');string.className='tree-memory-string';string.setAttribute('aria-hidden','true');
            const bow=document.createElement('span');bow.className='tree-memory-bow';bow.textContent='🎀';bow.setAttribute('aria-hidden','true');
            const image=document.createElement('img');image.draggable=false;
            button.append(string,bow,image);button.style.setProperty('--memory-tilt',`${[-5,5,-3][slot]}deg`);
            button.style.setProperty('--memory-delay',`${slot*.22}s`);
            button.addEventListener('click',()=>onOpen(Number(button.dataset.photoIndex)));
            this.layer.appendChild(button);return button;
        });
        canvas.parentElement.appendChild(this.layer);
        canvas.addEventListener('tree-photo-layout',event=>this.layout(event.detail));
        if(canvas.treePhotoLayout)this.layout(canvas.treePhotoLayout);
    }
    layout(layout) {
        const previous=this.count;
        this.count=layout.anchors.length;
        this.buttons.forEach((button,index)=>{
            const anchor=layout.anchors[index];
            if(!anchor){button.hidden=true;return;}
            button.style.left=`${anchor.left}px`;button.style.top=`${anchor.top}px`;button.style.width=`${anchor.width}px`;
        });
        if(this.active && previous!==this.count)this.refresh();
    }
    load(index) {
        if(!this.cache.has(index)) {
            const image=new Image();image.src=this.photos[index];
            this.cache.set(index,image.decode().then(()=>image));
        }
        return this.cache.get(index);
    }
    async refresh() {
        clearTimeout(this.timer);
        const generation=++this.generation;
        if(!this.active || !this.photos.length || !this.count)return;
        const selected=[];let attempts=0;
        while(selected.length<this.count && attempts<this.photos.length) {
            const index=(this.nextIndex+attempts++)%this.photos.length;
            try { const image=await this.load(index);selected.push({index,image}); } catch { /* Skip unavailable images. */ }
            if(generation!==this.generation || !this.active)return;
        }
        this.layer.hidden=!selected.length;
        this.buttons.forEach((button,slot)=>{
            const photo=selected[slot];button.classList.remove('arrived','departing');button.hidden=!photo;
            if(!photo)return;
            button.dataset.photoIndex=photo.index;button.setAttribute('aria-label',`Xem ảnh kỷ niệm ${photo.index+1}`);
            const image=button.querySelector('img');image.src=photo.image.src;image.alt=`Ảnh kỷ niệm ${photo.index+1}`;
            void button.offsetWidth;button.classList.add('arrived');
        });
        if(selected.length) {
            this.nextIndex=(selected[selected.length-1].index+1)%this.photos.length;
            this.onChange(selected[0].index);
            this.schedule();
        }
    }
    schedule() {
        clearTimeout(this.timer);
        if(!this.active || this.paused)return;
        this.timer=setTimeout(()=>{
            this.buttons.forEach(button=>button.classList.add('departing'));
            this.timer=setTimeout(()=>this.refresh(),350);
        },this.interval);
    }
    start() { this.active=true;this.paused=false;this.layer.classList.remove('paused');this.refresh(); }
    stop() { this.active=false;this.generation++;clearTimeout(this.timer);this.layer.hidden=true; }
    pause() { this.paused=true;clearTimeout(this.timer);this.layer.classList.add('paused'); }
    resume() { this.paused=false;this.layer.classList.remove('paused');this.buttons.forEach(button=>button.classList.remove('departing'));this.schedule(); }
}

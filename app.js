// ── Application Coordinator ───────────────────────────────────────

const LETTER_TEXT = `Gửi babi cụa anhhh...
Chúc công chúa của anh một ngày 20/10 thật vui vẻ và hạnh phúc nhéee ❤️ 🌷 Anh mong em lúc nào cũng giữ được nụ cười xinh xắn trên môi, luôn vui vẻ, bình an và gặp thật nhiều điều tốt đẹp trong cuộc sống. Cảm ơn em vì đã xuất hiện và trở thành một phần đặc biệt trong thế giới của anh. Anh không biết sau này sẽ có bao nhiêu điều thay đổi, nhưng anh mong mình vẫn có thể ở bên cạnh em, cùng em chia sẻ những niềm vui, an ủi em những lúc buồn và yêu thương em bằng tất cả sự chân thành của mình. Anh không hứa sẽ khiến mọi ngày của em đều hoàn hảo, nhưng anh sẽ cố gắng để em luôn cảm nhận được rằng mình được yêu thương và trân trọng. Chúc cô gái của anh ngày 20/10 ngập tràn hoa, quà, niềm vui và đặc biệt là thật nhiều tình yêu từ anh nhaaa.

Yêu em nhiều lắmmm, bé yêu của anh ❤️ 🌷 🐻`;

// Photos shown in the album and on the memory tree.
// Nội dung các ngăn kỷ niệm có thể thay đổi tại đây.
const KEEPSAKE_NOTE = 'Babii cụa anh, buổi trưa nhớ phải ăn đúng giờ nghe chưa, hong được bỏ bữa kẻo anh lo đó nghenn  ♡';
const KEEPSAKE_WISHES = ['Ngắm hoàng hôn cùng nhau','Cùng nhau đu trend tíc tóccc', 'Chụp Photobooth', 'Đi ăn mì cayyy', 'Dành một ngày chỉ để ở bên nhau'];

const PHOTOS = [
    'images/anh1.JPG',
    'images/anh2.JPG',
    'images/anh3.JPG',
    'images/anh4.JPG',
    'images/anh5.JPG',
    'images/anh6.JPG',
    'images/anh7.JPG',
    'images/anh8.JPG',
    'images/anh9.JPG',
    'images/anh10.JPG',
    'images/anh11.JPG',
    'images/anh12.JPG',
    'images/anh13.JPG',
    'images/anh14.JPG',
    'images/anh15.JPG',
];

let photoIndex     = 0;
let lightboxIndex  = 0;
let stopPetals     = null;

document.addEventListener('DOMContentLoaded', () => {
    const stagePuzzle = document.getElementById('stage-puzzle');
    const stageMain   = document.getElementById('stage-main');
    const petalCanvas = document.getElementById('petal-canvas');
    const treeCanvas  = document.getElementById('tree-canvas');
    const letterCard  = document.getElementById('letter-card');
    const letterBody  = document.getElementById('letter-body');
    const viewBtn     = document.getElementById('view-photos-btn');
    const lightbox    = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    document.querySelector('.letter-footer').appendChild(document.querySelector('.letter-bunny'));
    const characters = Array.from(LETTER_TEXT);
    let textNode;
    const rollBtn = document.getElementById('roll-letter-btn');
    const home = document.getElementById('keepsake-home');
    const detail = document.getElementById('keepsake-detail');
    const detailContent = document.getElementById('keepsake-content');
    const status = document.getElementById('keepsake-status');
    let rolling = false;
    let returnFocus = viewBtn;

    // ── Start petals during puzzle
    if (petalCanvas) {
        stopPetals = startPetalSystem(petalCanvas);
    }

    // ── Init puzzle
    new PuzzleGame('puzzle-mount', {
        imageSrc: 'images/screen.JPG',
        onComplete: () => {
            // Start music on puzzle complete
            window.startMusic();

            // Fade out puzzle, show tree stage
            stagePuzzle.classList.add('fade-out');
            if (stopPetals) stopPetals();

            setTimeout(() => {
                stagePuzzle.style.display = 'none';
                stageMain.style.display   = 'block';
                stageMain.classList.add('fade-in');
                initTreeStage();
            }, 700);
        }
    });

    // ── Tree stage
    function initTreeStage() {
        const tree = new HeartTree(treeCanvas, () => {
            // Tree fully bloomed → show letter
            setTimeout(() => {
                letterCard.classList.add('visible');
                startTypewriter();
            }, 600);
        });
        tree.start();
    }

    // ── Typewriter
    function startTypewriter() {
        let i = 0;
        letterBody.textContent = '';
        textNode = document.createTextNode('');
        letterBody.appendChild(textNode);

        function tick() {
            if (i < characters.length) {
                textNode.appendData(characters[i]);
                letterBody.parentElement.scrollTop = letterBody.parentElement.scrollHeight;
                i++;
                setTimeout(tick, 16);
            } else {
                // Letter complete → hang photos on the tree.
                letterBody.parentElement.scrollTop = 0;
                rollBtn.hidden = false;
                startTreePhotos();
            }
        }
        tick();
    }

    const treeMemories = new TreeMemories(treeCanvas, PHOTOS, index => openPhoto(index), index => {
        photoIndex = index;
        viewBtn.classList.add('visible');
    });
    function startTreePhotos() { treeMemories.start(); }

    function openPhoto(index = photoIndex) {
        if (!PHOTOS.length) return;
        returnFocus = document.activeElement;
        lightboxIndex = index;
        lightboxImg.src = PHOTOS[lightboxIndex];
        lightboxImg.alt = `Ảnh kỷ niệm ${lightboxIndex + 1}`;
        lightbox.classList.add('active');
        treeMemories.pause();
        lightboxClose.focus();
    }
    function closePhoto() {
        lightbox.classList.remove('active');
        treeMemories.resume();
        if (returnFocus instanceof HTMLElement && returnFocus.isConnected) returnFocus.focus();
    }
    viewBtn.addEventListener('click', () => openPhoto());
    lightboxClose.addEventListener('click', closePhoto);
    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) closePhoto();
    });

    function showHome() {
        home.hidden = false;
        detail.hidden = true;
        status.textContent = 'Thư đã được cất gọn. Hộp kỷ niệm đã mở.';
        home.querySelector('button').focus();
    }
    function rollLetter() {
        if (rolling || rollBtn.hidden || letterCard.hidden) return;
        rolling = true;
        rollBtn.disabled = true;
        treeMemories.stop();
        viewBtn.classList.remove('visible');
        letterCard.style.setProperty('--unrolled-height', `${letterCard.getBoundingClientRect().height}px`);
        letterCard.classList.add('rolling-up');
        status.textContent = 'Đang cuộn thư…';
        const done = () => {
            letterCard.hidden = true;
            letterCard.classList.remove('rolling-up');
            letterCard.style.removeProperty('--unrolled-height');
            rollBtn.disabled = false;
            rolling = false;
            showHome();
        };
        setTimeout(done, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 2800);
    }
    rollBtn.addEventListener('click', rollLetter);
    let pullY = null;
    rollBtn.addEventListener('pointerdown', e => { pullY = e.clientY; rollBtn.setPointerCapture(e.pointerId); });
    rollBtn.addEventListener('pointerup', e => { if (pullY !== null && pullY - e.clientY > 30) rollLetter(); pullY = null; });
    rollBtn.addEventListener('pointercancel', () => { pullY = null; });

    function openKeepsake(name) {
        home.hidden = true;
        detail.hidden = true;
        if (name === 'letter') {
            letterCard.hidden = false;
            letterCard.classList.add('visible');
            startTreePhotos();
            rollBtn.focus();
            status.textContent = 'Đã mở lại lá thư.';
            return;
        }
        detailContent.replaceChildren();
        const heading = document.createElement('h2');
        heading.textContent = { album: 'Những nụ cười anh thích', notes: 'Một lời nhắn cho hôm nay', wishes: 'Chuyện nhỏ mình cùng làm' }[name];
        detailContent.appendChild(heading);
        if (name === 'album') {
            const grid = document.createElement('div');
            grid.className = 'keepsake-album';
            PHOTOS.forEach((src, index) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'album-photo';
                button.setAttribute('aria-label', `Mở ảnh kỷ niệm ${index + 1}`);
                const image = document.createElement('img');
                image.src = src; image.alt = `Kỷ niệm ${index + 1}`; image.loading = 'lazy';
                image.addEventListener('error', () => { button.hidden = true; });
                button.appendChild(image);
                button.addEventListener('click', () => openPhoto(index));
                grid.appendChild(button);
            });
            detailContent.appendChild(grid);
        } else if (name === 'notes') {
            const note = document.createElement('p'); note.className = 'keepsake-note';
            note.textContent = KEEPSAKE_NOTE; detailContent.appendChild(note);
        } else if (name === 'wishes') {
            const list = document.createElement('ul'); list.className = 'keepsake-wishes';
            KEEPSAKE_WISHES.forEach(text => { const item = document.createElement('li'); item.textContent = `♡  ${text}`; list.appendChild(item); });
            detailContent.appendChild(list);
        }
        detail.hidden = false;
        detail.scrollTop = 0;
        document.getElementById('keepsake-back').focus();
        status.textContent = heading.textContent;
    }
    document.querySelectorAll('[data-keepsake]').forEach(button => {
        button.addEventListener('click', () => openKeepsake(button.dataset.keepsake));
    });
    document.getElementById('keepsake-back').addEventListener('click', showHome);

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) closePhoto();
        if (lightbox.classList.contains('active') && ['ArrowLeft','ArrowRight'].includes(e.key)) {
            e.preventDefault();
            lightboxIndex = (lightboxIndex + (e.key === 'ArrowRight' ? 1 : PHOTOS.length - 1)) % PHOTOS.length;
            lightboxImg.src = PHOTOS[lightboxIndex];
            lightboxImg.alt = `Ảnh kỷ niệm ${lightboxIndex + 1}`;
        }
    });
});

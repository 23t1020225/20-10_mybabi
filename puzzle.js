// ── Puzzle Game (3×3 tile-swap) ──────────────────────────────────

class PuzzleGame {
    constructor(containerId, options = {}) {
        this.container   = document.getElementById(containerId);
        this.imageSrc    = options.imageSrc || 'image/screen.JPG';
        this.onComplete  = options.onComplete || (() => {});
        this.gridSize    = 3;
        this.tiles       = [];
        this.selectedSlot = null;
        this.completed   = false;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="puzzle-card">
                <div class="puzzle-header">
                    <span class="heart-icon">💝</span>
                    <span class="puzzle-title">Ghép Ảnh</span>
                    <span class="heart-icon">💝</span>
                </div>
                <div class="puzzle-grid-wrapper">
                    <div class="puzzle-grid" id="puzzle-grid"></div>
                </div>
                <div class="puzzle-footer">
                    <div class="puzzle-status-row">
                        <span class="puzzle-status-label">Đã chính xác</span>
                        <span class="puzzle-status-percent" id="pct">0%</span>
                    </div>
                    <div class="puzzle-progress-bar">
                        <div class="puzzle-progress-fill" id="pfill"></div>
                    </div>
                </div>
                <button class="puzzle-hint-btn" id="puzzle-auto-btn">⚡ Hoàn thành nhanh</button>
            </div>`;

        this.gridEl  = document.getElementById('puzzle-grid');
        this.pctEl   = document.getElementById('pct');
        this.fillEl  = document.getElementById('pfill');

        // ── initial shuffle matching the video start state
        // Video at 0:01 shows tile 0 (top-left) correct, middle/bottom scrambled
        // We'll start with a mid-progress scramble so the player has fun solving it
        this.tiles = [8, 1, 6, 0, 7, 3, 5, 4, 2];

        this.render();
        this.updateProgress();
    }

    render() {
        this.gridEl.innerHTML = '';
        this.tiles.forEach((origIdx, slotIdx) => {
            const tile = document.createElement('button');
            tile.className = 'puzzle-tile';
            tile.type = 'button';
            tile.setAttribute('aria-label', `Mảnh ảnh ${origIdx + 1}, vị trí ${slotIdx + 1}`);
            tile.dataset.slot = slotIdx;

            const col = origIdx % 3;
            const row = Math.floor(origIdx / 3);
            tile.style.cssText = `
                background-image: url('${this.imageSrc}');
                background-size: 300% 300%;
                background-position: ${col * 50}% ${row * 50}%;
            `;

            if (!this.completed) {
                tile.addEventListener('click', () => this.handleClick(slotIdx));
            } else {
                tile.style.cursor = 'default';
            }

            // highlight correct positions subtly
            if (origIdx === slotIdx) {
                tile.style.filter = 'brightness(1.04)';
            }

            this.gridEl.appendChild(tile);
        });
    }

    handleClick(slotIdx) {
        if (this.completed) return;

        // Start music on first interaction
        if (window.startMusic) window.startMusic();

        const tiles = this.gridEl.querySelectorAll('.puzzle-tile');

        if (this.selectedSlot === null) {
            this.selectedSlot = slotIdx;
            tiles[slotIdx].classList.add('selected');
        } else if (this.selectedSlot === slotIdx) {
            tiles[slotIdx].classList.remove('selected');
            this.selectedSlot = null;
        } else {
            // Swap
            const a = this.selectedSlot, b = slotIdx;
            [this.tiles[a], this.tiles[b]] = [this.tiles[b], this.tiles[a]];
            this.selectedSlot = null;
            this.render();
            this.updateProgress();
        }
    }

    updateProgress() {
        const correct = this.tiles.filter((v, i) => v === i).length;
        const pct = Math.round((correct / 9) * 100);
        this.pctEl.textContent  = `${pct}%`;
        this.fillEl.style.width = `${pct}%`;

        if (pct === 100 && !this.completed) {
            this.completed = true;
            this.gridEl.classList.add('solved');
            setTimeout(() => this.onComplete(), 1500);
        }
    }
}


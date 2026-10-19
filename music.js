// Keep the record, buttons and volume in sync with actual audio playback.
(() => {
    const audio = document.getElementById('bg-audio');
    const player = document.getElementById('music-player');
    const disc = document.getElementById('music-btn');
    const play = document.getElementById('music-play');
    const expand = document.getElementById('music-expand');
    const details = document.getElementById('music-details');
    const volume = document.getElementById('music-volume');
    const output = document.getElementById('music-volume-value');
    const status = document.getElementById('music-status');
    let started = false;
    let userPaused = false;
    let playPending = false;
    // Reserve the dock's actual height so expanding volume never covers the tree.
    const phoneLayout = matchMedia('(max-width: 600px)');
    function sizeDock() {
        document.documentElement.style.setProperty('--music-dock-height', phoneLayout.matches ? `${Math.ceil(player.getBoundingClientRect().height)}px` : '0px');
    }
    new ResizeObserver(sizeDock).observe(player);
    phoneLayout.addEventListener('change', sizeDock);
    window.addEventListener('resize', sizeDock);
    sizeDock();
    audio.volume = Number(volume.value) / 100;

    function sync() {
        const playing = !audio.paused && !audio.ended && !audio.error;
        player.classList.toggle('playing', playing);
        [disc, play].forEach(button => {
            button.setAttribute('aria-label', playing ? 'Tạm dừng nhạc' : 'Phát nhạc');
            button.setAttribute('aria-pressed', String(playing));
        });
        play.textContent = playing ? 'Ⅱ' : '▶';
        status.textContent = playing ? (audio.muted || audio.volume === 0 ? 'Đang phát · Âm lượng đang tắt' : 'Đang phát một chút yêu thương') : (started ? 'Nhạc đã tạm dừng' : 'Chạm để nghe một chút thương');
    }
    async function requestPlay() {
        if (playPending) return;
        playPending = true;
        try {
            await audio.play();
            if (userPaused) { audio.pause(); return; }
            started = true;
            removeUnlockListeners();
            sync();
        } catch (error) {
            sync();
            if (!userPaused) status.textContent = error.name === 'NotAllowedError' ? 'Chạm màn hình để bật nhạc ♡' : 'Chạm nút phát để thử lại nhé';
        } finally { playPending = false; }
    }
    // Puzzle interactions may start music, but respect a deliberate pause.
    window.startMusic = () => { if (!started && !userPaused) return requestPlay(); };
    function toggle() {
        if (audio.paused && !playPending) { userPaused = false; requestPlay(); }
        else { userPaused = true; removeUnlockListeners(); audio.pause(); }
    }
    function unlock(event) {
        if (player.contains(event.target) || userPaused || started) return;
        if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
        requestPlay();
    }
    function removeUnlockListeners() {
        document.removeEventListener('click', unlock);
        document.removeEventListener('touchend', unlock);
        document.removeEventListener('keydown', unlock);
    }
    disc.addEventListener('click', toggle);
    play.addEventListener('click', toggle);
    expand.addEventListener('click', () => {
        details.hidden = !details.hidden;
        expand.setAttribute('aria-expanded', String(!details.hidden));
        expand.setAttribute('aria-label', details.hidden ? 'Mở điều khiển âm lượng' : 'Thu gọn điều khiển âm lượng');
    });
    document.addEventListener('click', event => {
        if (!details.hidden && !player.contains(event.target)) {
            details.hidden = true;
            expand.setAttribute('aria-expanded', 'false');
            expand.setAttribute('aria-label', 'Mở điều khiển âm lượng');
        }
    });
    volume.addEventListener('input', () => { audio.volume = Number(volume.value) / 100; });
    audio.addEventListener('volumechange', () => {
        volume.value = Math.round(audio.volume * 100);
        output.textContent = `${volume.value}%`;
        sync();
    });
    ['play', 'playing', 'pause', 'ended'].forEach(event => audio.addEventListener(event, sync));
    audio.addEventListener('waiting', () => { player.classList.remove('playing'); status.textContent = 'Đang tải giai điệu…'; });
    audio.addEventListener('error', () => { sync(); status.textContent = 'Chưa tải được nhạc, thử lại nhé'; });
    sync();
    document.addEventListener('click', unlock);
    document.addEventListener('touchend', unlock, { passive: true });
    document.addEventListener('keydown', unlock);
    requestPlay();
})();

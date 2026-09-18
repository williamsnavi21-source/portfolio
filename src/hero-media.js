/**
 * [INPUT]: 首页预览 VIDEO 节点、连续位置、动画偏好与唤醒回调。
 * [OUTPUT]: createHeroMedia，按需播放当前转场两侧预览并释放解码资源。
 * [POS]: 首页媒体生命周期；不加载原片，给画布与 DOM 回退提供相同视频帧。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
export function createHeroMedia(videos, wake, reduced) {
  const abort = new AbortController(), { signal } = abort;
  const requested = new Set(), rejected = new Set();
  let position = 0, enabled = false, disposed = false;
  const blocked = () => document.hidden || document.body.classList.contains('menu-open') || document.body.classList.contains('player-open');
  function sync(next = position, ready = enabled) {
    position = next; enabled = ready;
    videos.forEach((video, index) => {
      const active = !reduced && enabled && !blocked() && (index === Math.floor(position) || index === Math.ceil(position));
      if (!active) { video.pause(); return; }
      if (!video.hasAttribute('src') && video.dataset.src) { video.src = video.dataset.src; video.load(); }
      if (video.paused && !requested.has(video) && !rejected.has(video) && video.hasAttribute('src')) {
        requested.add(video);
        video.play().then(() => {
          if (disposed || blocked() || !enabled || (index !== Math.floor(position) && index !== Math.ceil(position))) video.pause();
        }).catch(error => { if (error.name !== 'AbortError') rejected.add(video); }).finally(() => requested.delete(video));
      }
    });
  }
  videos.forEach(video => {
    video.muted = true;
    video.addEventListener('loadeddata', () => { video.parentElement.classList.add('video-ready'); wake(); }, { signal });
    video.addEventListener('playing', wake, { signal });
    video.addEventListener('error', () => { rejected.add(video); video.parentElement.classList.remove('video-ready'); wake(); }, { signal });
  });
  const resume = () => { sync(); wake(); };
  const overlays = new MutationObserver(resume);
  overlays.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', resume, { signal });
  document.addEventListener('pointerup', () => { rejected.clear(); sync(); }, { signal });
  return {
    sync,
    isPlaying: () => videos.some(video => !video.paused && !video.ended),
    dispose() {
      disposed = true; enabled = false; abort.abort(); overlays.disconnect();
      videos.forEach(video => { video.pause(); video.removeAttribute('src'); video.load(); });
    },
  };
}

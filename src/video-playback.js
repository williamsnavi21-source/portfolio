/**
 * [INPUT]: VIDEO、作品原片/可选兼容地址、media-url.js 与状态回调。
 * [OUTPUT]: createVideoPlayback，播放、一次兼容回退和释放控制器。
 * [POS]: 弹层与详情共用的播放生命周期；区分手势限制与媒体错误，销毁后不重试。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { mediaUrl } from './media-url.js';

export function createVideoPlayback(video, project, onState = () => {}) {
  let disposed = false, compatible = false, generation = 0;
  const events = new AbortController();
  const report = state => { if (!disposed) onState(state, compatible); };
  function useCompatibility() {
    if (disposed || compatible || !project.compatSrc) return false;
    compatible = true;
    setSource(project.compatSrc);
    void play();
    return true;
  }
  function failed() {
    if (!disposed && !useCompatibility()) report('error');
  }
  async function play() {
    if (disposed) return;
    if (video.error) setSource(compatible ? project.compatSrc : project.src);
    const attempt = generation;
    report('loading');
    try { await video.play(); }
    catch (error) {
      if (disposed || generation !== attempt || error.name === 'AbortError') return;
      if (error.name === 'NotAllowedError') report('tap');
      else failed();
    }
  }
  function setSource(source) {
    generation++;
    video.src = mediaUrl(source);
    video.load();
    report('ready');
  }
  video.addEventListener('error', failed, { signal: events.signal });
  video.addEventListener('playing', () => report('playing'), { signal: events.signal });
  video.addEventListener('waiting', () => report('loading'), { signal: events.signal });
  setSource(project.src);
  return {
    play, useCompatibility,
    dispose() {
      disposed = true; generation++; events.abort();
      video.pause(); video.removeAttribute('src'); video.load();
    },
  };
}

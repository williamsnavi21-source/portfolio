/**
 * [INPUT]: 精选素材、media-url.js 地址、播放回调、hero-motion.js 几何、hero-renderer.js 画布、hero-media.js 生命周期。
 * [OUTPUT]: mountHero，连续滚动、拖拽、惯性吸附、入场与生命周期。
 * [POS]: 首页控制器；标题和封面共享 position，不用离散锁定吞掉交互。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { clamp, damp, projectedTarget, titleGeometry } from './hero-motion.js';
import { createHeroRenderer } from './hero-renderer.js';
import { createHeroMedia } from './hero-media.js';
import { mediaUrl as url } from './media-url.js';

export function mountHero(container, films, openPlayer, reduced) {
  const abort = new AbortController(), { signal } = abort;
  let position = 0, target = 0, selected = 0, frame = 0, lastFrame = 0;
  let dragging = false, pointer = null, lastY = 0, startY = 0, lastMove = 0, velocity = 0;
  let didDrag = false, suppressClickUntil = 0, snapTimer = 0, disposed = false;
  let entranceStart = null, entrance = reduced ? 1 : 0, readyToEnter = false;
  let paintedPosition = null, paintedEntrance = null;
  let renderer = null;
  const max = films.length - 1;
  const escape = value => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  container.innerHTML = `<section class="hero" aria-label="精选影像" tabindex="0">
    <div class="hero-frames" aria-hidden="true">${films.map((p,i) => `<div class="hero-frame ${i===0?'active':''}"><img src="${url(p.poster)}" alt="" decoding="async" ${i===0?'fetchpriority="high"':''} draggable="false"><video ${p.preview?`data-src="${url(p.preview)}"`:''} muted loop playsinline preload="none" disablepictureinpicture tabindex="-1"></video></div>`).join('')}</div>
    <canvas class="hero-canvas" aria-hidden="true"></canvas>
    <button class="hero-hit" aria-label="放大播放${escape(films[0].title)}"></button>
    <div class="hero-meta"><div class="hero-credit">WANG FILMS</div><div class="hero-category" aria-live="polite">${films[0].category}</div></div>
    <div class="slide-dots" aria-label="选择精选影片">${films.map((p,i) => `<button aria-label="切换到${escape(p.title)}" data-slide="${i}"><span></span></button>`).join('')}</div>
    <div class="title-reel" aria-label="影片目录"><div class="reel-cylinder">${films.map((p,i) => `<button class="reel-title" data-slide="${i}"><span>${escape(p.title)}</span></button>`).join('')}</div></div>
  </section>`;
  const hero = container.querySelector('.hero');
  const images = [...hero.querySelectorAll('img')];
  const videos = [...hero.querySelectorAll('video')];
  const media = createHeroMedia(videos,wake,reduced);
  const frames = [...hero.querySelectorAll('.hero-frame')];
  const titles = [...hero.querySelectorAll('.reel-title')];
  const dots = [...hero.querySelectorAll('.slide-dots button')];
  const hit = hero.querySelector('.hero-hit');
  const category = hero.querySelector('.hero-category');
  const canvas = hero.querySelector('canvas');
  const blocked = () => document.body.classList.contains('menu-open') || document.body.classList.contains('player-open');

  function wake() {
    if (!disposed && !frame && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function paint() {
    if (paintedPosition === position && paintedEntrance === entrance) {
      hero.classList.toggle('canvas-ready',Boolean(renderer?.draw(position,entrance)));
      return;
    }
    paintedPosition = position; paintedEntrance = entrance;
    const nearest = Math.round(position);
    const introRotation = reduced ? 0 : (1 - entrance) * 2.6;
    titles.forEach((title,index) => {
      const geometry = titleGeometry(index, position - introRotation);
      title.style.transform = geometry.transform;
      title.style.opacity = geometry.opacity * entrance;
      title.style.pointerEvents = geometry.opacity > .15 ? 'auto' : 'none';
      title.tabIndex = geometry.opacity > .15 ? 0 : -1;
      title.classList.toggle('current',index === nearest);
      title.setAttribute('aria-label',`${films[index].title}${index === nearest ? '，观看影片' : ''}`);
      dots[index].setAttribute('aria-current',String(index === nearest));
      frames[index].classList.toggle('active',index === nearest);
    });
    if (selected !== nearest) {
      selected = nearest; category.textContent = films[selected].category;
      hit.setAttribute('aria-label',`放大播放${films[selected].title}`);
      if (!reduced) category.animate([{opacity:0,transform:'translate(-50%, 8px)'},{opacity:1,transform:'translate(-50%, -50%)'}],{duration:400,easing:'cubic-bezier(.16,1,.3,1)'});
    }
    hero.dataset.position = position.toFixed(4);
    hero.style.setProperty('--entrance', entrance);
    hero.classList.toggle('canvas-ready',Boolean(renderer?.draw(position,entrance)));
  }
  function tick(now) {
    frame = 0;
    if (disposed || document.hidden) return;
    const delta = lastFrame ? now - lastFrame : 16.667; lastFrame = now;
    position = reduced ? target : damp(position,target,delta);
    if (readyToEnter && entrance < 1) {
      entranceStart ??= now;
      const progress = clamp((now - entranceStart) / 1600,0,1);
      entrance = 1 - Math.pow(1-progress,4);
    }
    paint();
    media.sync(position,readyToEnter);
    if (position !== target || (readyToEnter && entrance < 1) || dragging || media.isPlaying()) wake();
  }
  function enter() {
    readyToEnter = true; entranceStart = null;
    hero.classList.add('entering'); wake();
  }
  function settle() {
    snapTimer = 0;
    target = projectedTarget(target,velocity,films.length); velocity = 0; wake();
  }
  function scheduleSnap() { clearTimeout(snapTimer); snapTimer = setTimeout(settle,160); }
  function select(index) {
    if (blocked()) return;
    clearTimeout(snapTimer); target = clamp(index,0,max); velocity = 0; wake();
  }
  function play() {
    if (!blocked() && performance.now() > suppressClickUntil) openPlayer(films[Math.round(position)]);
  }
  hero.querySelectorAll('[data-slide]').forEach(button => button.addEventListener('click',event => {
    event.stopPropagation();
    if (performance.now() < suppressClickUntil) return;
    const index = Number(button.dataset.slide);
    if (button.classList.contains('reel-title') && index === Math.round(position)) play();
    else select(index);
  },{signal}));
  hit.addEventListener('click',play,{signal});
  hero.addEventListener('wheel',event => {
    if (blocked() || event.ctrlKey) return;
    event.preventDefault();
    const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? hero.clientHeight : 1);
    target = clamp(target + pixels / 150,0,max);
    velocity = 0;
    if (reduced) target = clamp(Math.round(target),0,max);
    scheduleSnap(); wake();
  },{passive:false,signal});
  hero.addEventListener('pointerdown',event => {
    if (blocked() || dragging || event.button !== 0) return;
    clearTimeout(snapTimer);
    pointer = event.pointerId; dragging = true; didDrag = false;
    startY = lastY = event.clientY; lastMove = performance.now(); velocity = 0;
    hero.classList.add('dragging'); wake();
  },{signal});
  hero.addEventListener('pointermove',event => {
    if (!dragging || pointer !== event.pointerId) return;
    const now = performance.now(), elapsed = Math.max(now-lastMove,1);
    const distance = lastY - event.clientY;
    if (Math.abs(event.clientY-startY) > 6) {
      didDrag = true;
      if (!hero.hasPointerCapture(pointer)) hero.setPointerCapture(pointer);
    }
    if (didDrag) {
      event.preventDefault();
      const change = distance / 75;
      target = clamp(target+change,0,max);
      velocity = velocity*.4 + change/elapsed*.6;
    }
    lastY = event.clientY; lastMove = now; wake();
  },{signal});
  function endDrag(event) {
    if (!dragging || event.pointerId !== pointer) return;
    dragging = false; hero.classList.remove('dragging');
    if (didDrag) suppressClickUntil = performance.now()+400;
    if (performance.now()-lastMove > 100) velocity = 0;
    if (hero.hasPointerCapture(pointer)) hero.releasePointerCapture(pointer);
    pointer = null; settle();
  }
  hero.addEventListener('pointerup',endDrag,{signal});
  hero.addEventListener('pointercancel',endDrag,{signal});
  window.addEventListener('blur',() => {
    if (!dragging) return;
    dragging = false; pointer = null; velocity = 0;
    hero.classList.remove('dragging'); settle();
  },{signal});
  document.addEventListener('keydown',event => {
    if (blocked() || !['ArrowDown','ArrowUp','PageDown','PageUp','Home','End'].includes(event.key)) return;
    event.preventDefault();
    select(event.key==='Home'?0:event.key==='End'?max:Math.round(target)+(['ArrowDown','PageDown'].includes(event.key)?1:-1));
  },{signal});
  document.addEventListener('visibilitychange',() => {if(!document.hidden){lastFrame=0;wake();}},{signal});
  canvas.addEventListener('webglcontextlost',event => {event.preventDefault();hero.classList.remove('canvas-ready');},{signal});
  canvas.addEventListener('webglcontextrestored',() => {renderer?.dispose();renderer=createHeroRenderer(canvas,images,videos,wake);wake();},{signal});
  if (!reduced) renderer = createHeroRenderer(canvas,images,videos,wake);
  const resize = new ResizeObserver(wake); resize.observe(hero);
  document.addEventListener('site:revealed',enter,{once:true,signal});
  if (!document.querySelector('.intro')) enter();
  paint(); wake();
  return () => {
    disposed=true;abort.abort();clearTimeout(snapTimer);cancelAnimationFrame(frame);
    resize.disconnect();media.dispose();renderer?.dispose();
  };
}

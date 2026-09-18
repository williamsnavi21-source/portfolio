/**
 * [INPUT]: projects.json、media-url.js 资源地址，hero.js 首页、about.js 个人介绍、player.js 大屏播放器、video-playback.js 兼容回退、History API。
 * [OUTPUT]: 个人影视站的路由、导航、分类浏览（AIGC 图片置后）、播放器和联系流程。
 * [POS]: 前端编排入口；不编造素材未提供的年份、客户与履历。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { mountHero } from './hero.js';
import { mountAbout } from './about.js';
import { openPlayer, closePlayer } from './player.js';
import { createVideoPlayback } from './video-playback.js';
import { mediaUrl as asset } from './media-url.js';
const main = document.querySelector('main');
const menu = document.querySelector('#menu');
const toggle = document.querySelector('.menu-toggle');
const curtain = document.querySelector('.page-curtain');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const email = '973132021@qq.com';
const categories = ['纪录片','微电影','宣传片','AIGC'];
const en = {'纪录片':'DOCUMENTARY','微电影':'SHORT FILM','宣传片':'COMMERCIAL','AIGC':'GENERATIVE FILM'};
let projects = [], cleanup = ()=>{}, transition = false, view = 'grid';
const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const duration = seconds => seconds ? `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}` : 'STILL IMAGE';
function setMenu(open, restore=false) {
  document.body.classList.toggle('menu-open',open);
  toggle.setAttribute('aria-expanded',String(open));
  toggle.setAttribute('aria-label',open?'关闭菜单':'打开菜单');
  menu.inert=!open;
  if(restore)toggle.focus();
}
toggle.addEventListener('click',()=>setMenu(toggle.getAttribute('aria-expanded')!=='true'));
document.addEventListener('click',event=>{if(!event.target.closest('.navigation'))setMenu(false);});
document.addEventListener('keydown',event=>{if(event.key==='Escape')setMenu(false,true);});
document.addEventListener('click',event=>{
  const play=event.target.closest('[data-play]');
  if(play){event.preventDefault();setMenu(false);const project=projects.find(p=>p.id===play.dataset.play);if(project)openPlayer(project);return;}
  const link=event.target.closest('a');
  if(!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button!==0)return;
  const url=new URL(link.href);
  if(url.origin!==location.origin || link.target || url.hash)return;
  event.preventDefault();navigate(url.pathname+url.search);
});
window.addEventListener('popstate',()=>render());
async function navigate(url) {
  if(transition)return;
  setMenu(false);transition=true;
  curtain.classList.add('cover');
  if(!reduced)await new Promise(r=>setTimeout(r,350));
  history.pushState({},'',url);render();
  main.focus({preventScroll:true});
  curtain.classList.remove('cover');curtain.classList.add('reveal');
  setTimeout(()=>{curtain.classList.remove('reveal');transition=false;},reduced?0:450);
}
function footer() {
  return `<footer class="footer"><div class="footer-top"><a href="mailto:${email}">${email} ↗</a><span>WANG FILMS<br>影像创作者</span><a href="/contact">LET’S MAKE A FILM ↗</a></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} WANG FILMS</span><a href="/">BACK TO HOME ↑</a><span>ALL RIGHTS RESERVED</span></div></footer>`;
}
function card(p) {
  return `<a class="work-card" data-play="${p.id}" href="/works/${p.id}" aria-label="放大${p.type==='video'?'播放':'查看'}${escape(p.title)}"><img src="${asset(p.poster)}" alt="${escape(p.title)}" loading="lazy" width="${p.width}" height="${p.height}"><div class="card-overlay"><span class="card-duration">${duration(p.duration)}</span><span class="card-play">${p.type==='video'?'▷':'↗'}</span><div class="card-info"><h2>${escape(p.title)}</h2><div><span>WANG FILMS</span><span>${en[p.category]}</span></div></div></div></a>`;
}
function works() {
  const query=new URLSearchParams(location.search);
  const category=categories.includes(query.get('category'))?query.get('category'):'全部';
  const filtered=projects.filter(p=>category==='全部'||p.category===category)
    .sort((a,b)=>Number(a.category==='AIGC'&&a.type==='image')-Number(b.category==='AIGC'&&b.type==='image'));
  main.innerHTML=`<section class="works-page"><div class="works-toolbar"><h1>WORKS <span class="work-count">${filtered.length}</span></h1><div class="view-switch" aria-label="作品展示方式"><button data-view="grid" aria-pressed="${view==='grid'}">GRID</button><button data-view="list" aria-pressed="${view==='list'}">LIST</button></div></div><div class="work-filters" aria-label="作品分类">${['全部',...categories].map(c=>`<button data-category="${c}" aria-pressed="${category===c}">${c}<sup>${projects.filter(p=>c==='全部'||p.category===c).length}</sup></button>`).join('')}</div><div class="works-collection ${view}" aria-live="polite">${filtered.map(card).join('')}</div></section>${footer()}`;
  main.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.view;works();}));
  main.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{
    history.replaceState({},'',b.dataset.category==='全部'?'/works':`/works?category=${encodeURIComponent(b.dataset.category)}`);works();
  }));
}
function detail(id) {
  const p=projects.find(p=>p.id===id);
  if(!p){notFound();return;}
  document.title=`${p.title} — WANG FILMS`;
  const index=projects.indexOf(p),prev=projects[(index-1+projects.length)%projects.length],next=projects[(index+1)%projects.length];
  main.innerHTML=`<article class="detail-page"><div class="detail-media ${p.type==='image'?'is-image':''}">${p.type==='image'?`<img src="${asset(p.src)}" alt="${escape(p.title)}">`:`<video controls playsinline preload="metadata" poster="${asset(p.poster)}" aria-label="${escape(p.title)}"></video><button class="big-play" aria-label="播放${escape(p.title)}">▶</button><p class="video-error" hidden>影片暂时无法播放。<a href="${asset(p.src)}" download>下载原片观看 ↗</a></p>`}</div><div class="detail-body"><h1>${escape(p.title)}</h1><div class="detail-info"><div><span>(INFO)</span><dl><div><dt>作品类型</dt><dd>${p.category}</dd></div><div><dt>时长</dt><dd>${duration(p.duration)}</dd></div><div><dt>画幅</dt><dd>${p.width} × ${p.height}</dd></div></dl></div><div><span>(CREATOR)</span><dl><div><dt>作品集</dt><dd>WANG FILMS</dd></div>${p.subcategory?`<div><dt>系列</dt><dd>${p.subcategory}</dd></div>`:''}<div><dt>联系</dt><dd><a href="mailto:${email}">${email}</a></dd></div></dl></div></div><div class="detail-navigation"><a href="/works/${prev.id}">← PREVIOUS WORK</a><a href="/works">ALL WORKS</a><a href="/works/${next.id}">NEXT WORK →</a></div></div></article>${footer()}`;
  const video=main.querySelector('video');
  if(video){
    const play=main.querySelector('.big-play');
    const message=main.querySelector('.video-error');
    const compatible=document.createElement('button');compatible.className='detail-compatible';compatible.textContent='兼容播放';compatible.hidden=!p.compatSrc;
    main.querySelector('.detail-media').append(compatible);
    const controller=createVideoPlayback(video,p,(state,usingCompatibility)=>{
      message.hidden=state!=='error';
      if(state==='tap'||state==='error')play.classList.remove('hidden');
      compatible.disabled=usingCompatibility;compatible.textContent=usingCompatibility?'兼容线路':'兼容播放';
    });
    play.addEventListener('click',controller.play);
    compatible.addEventListener('click',controller.useCompatibility);
    video.addEventListener('playing',()=>play.classList.add('hidden'));
    video.addEventListener('pause',()=>play.classList.remove('hidden'));
    cleanup=controller.dispose;
  }
}
function about() {
  cleanup=mountAbout(main,projects,footer(),reduced);
}
function contact() {
  main.innerHTML=`<section class="contact-page"><div class="contact-heading"><span>LET’S CREATE SOMETHING</span><h1>LET’S<br>TALK.</h1><p>让下一个故事，从一次交流开始。</p><a class="contact-email" href="mailto:${email}">${email} ↗</a><button class="copy-email">复制邮箱</button><p class="copy-status" role="status"></p></div><form class="contact-form"><label>你的称呼 / NAME<input required name="name" autocomplete="name" placeholder="如何称呼你"></label><label>联系邮箱 / EMAIL<input required name="email" type="email" autocomplete="email" placeholder="you@example.com"></label><label>项目类型 / PROJECT<select name="category"><option>纪录片</option><option>微电影</option><option>宣传片</option><option>AIGC</option><option>其他合作</option></select></label><label>项目想法 / MESSAGE<textarea required name="message" rows="4" placeholder="聊聊你的想法、计划与时间安排"></textarea></label><button class="submit-button" type="submit">创建邮件草稿 <span>↗</span></button><p class="form-note">将在你的邮件应用中打开草稿，由你确认发送。</p><p class="form-status" role="status"></p></form></section>${footer()}`;
  main.querySelector('.copy-email').addEventListener('click',async()=>{
    const status=main.querySelector('.copy-status');
    try{await navigator.clipboard.writeText(email);status.textContent='邮箱已复制';}catch{status.textContent=`请手动复制：${email}`;}
  });
  main.querySelector('form').addEventListener('submit',event=>{
    event.preventDefault();const data=new FormData(event.target);
    const subject=`${data.get('category')}合作 · ${data.get('name')}`;
    const body=`称呼：${data.get('name')}\n邮箱：${data.get('email')}\n项目类型：${data.get('category')}\n\n${data.get('message')}`;
    const url=`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const status=main.querySelector('.form-status');
    status.innerHTML=`草稿已准备，<a href="${url}">点击打开邮件应用 ↗</a>。若未配置邮件应用，可复制邮箱手动联系。`;
    location.href=url;
  });
}
function notFound(){main.innerHTML=`<section class="not-found"><span>404 / OUT OF FRAME</span><h1>这一帧，不在这里。</h1><a href="/works">返回作品集 ↗</a></section>`;}
function render(){
  closePlayer();cleanup();cleanup=()=>{};window.scrollTo(0,0);setMenu(false);
  document.title='WANG FILMS · 影像创作者';
  const route=location.pathname.replace(/\/$/,'')||'/';
  document.body.classList.toggle('is-home',route==='/');
  if(route==='/')cleanup=mountHero(main,projects.filter(p=>p.featured>=0).sort((a,b)=>a.featured-b.featured),openPlayer,reduced);
  else if(route==='/works'||route==='/works-listing')works();
  else if(route.startsWith('/works/'))detail(route.split('/')[2]);
  else if(route==='/about')about();
  else if(route==='/contact')contact();
  else notFound();
}
function intro(){
  const element=document.querySelector('.intro');
  const reveal=()=>document.dispatchEvent(new Event('site:revealed'));
  let seen=false;try{seen=sessionStorage.getItem('wang-intro');sessionStorage.setItem('wang-intro','1');}catch{}
  if(seen||reduced){element.remove();reveal();return;}
  element.classList.add('playing');const start=performance.now();
  function tick(now){const progress=Math.min(1,(now-start)/1300);element.querySelector('.intro-count').textContent=String(Math.floor(progress*100)).padStart(3,'0');element.style.setProperty('--progress',progress);if(progress<1)requestAnimationFrame(tick);else{element.classList.add('complete');reveal();setTimeout(()=>element.remove(),850);}}
  requestAnimationFrame(tick);
}
try{
  const response=await fetch('/src/projects.json');if(!response.ok)throw new Error('作品索引不可用');
  projects=await response.json();if(!projects.length)throw new Error('作品索引为空');
  render();intro();
}catch(error){document.querySelector('.intro').remove();main.innerHTML='<section class="not-found"><h1>作品暂未加载</h1><p>请刷新页面重试。</p><button onclick="location.reload()">重新加载</button></section>';}

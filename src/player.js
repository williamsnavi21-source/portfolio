/**
 * [INPUT]: 单项作品、原始视频路径与 media-url.js 资源地址解析。
 * [OUTPUT]: openPlayer / closePlayer，原生 dialog 大屏播放器。
 * [POS]: 首页、作品卡片共享的媒体层；关闭即释放媒体并恢复焦点。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
let current=null, previousFocus=null;
import { mediaUrl as url } from './media-url.js';
export function closePlayer(){
  if(!current)return;
  const dialog=current;current=null;
  const video=dialog.querySelector('video');
  if(video){video.pause();video.removeAttribute('src');video.load();}
  dialog.close();dialog.remove();document.body.classList.remove('player-open');
  previousFocus?.focus({preventScroll:true});
}
export function openPlayer(project){
  closePlayer();previousFocus=document.activeElement;
  const dialog=document.createElement('dialog');dialog.className='player-dialog';
  dialog.setAttribute('aria-label',`${project.title}，放大播放`);
  const header=document.createElement('div');header.className='player-header';
  const title=document.createElement('span');title.textContent=project.title;
  const close=document.createElement('button');close.className='player-close';close.textContent='关闭 CLOSE ×';close.setAttribute('aria-label','关闭播放器');
  header.append(title,close);
  const media=document.createElement(project.type==='image'?'img':'video');
  media.src=url(project.src);
  if(project.type==='image')media.alt=project.title;
  else{media.controls=true;media.playsInline=true;media.preload='metadata';media.poster=url(project.poster);}
  const bottom=document.createElement('div');bottom.className='player-bottom';
  const category=document.createElement('span');category.textContent=`WANG FILMS / ${project.category}`;
  const detail=document.createElement('a');detail.href=`/works/${project.id}`;detail.textContent='作品详情 ↗';detail.addEventListener('click',closePlayer);
  bottom.append(category,detail);dialog.append(header,media,bottom);document.body.append(dialog);
  current=dialog;document.body.classList.add('player-open');dialog.showModal();close.focus();
  close.addEventListener('click',closePlayer);
  dialog.addEventListener('cancel',event=>{event.preventDefault();closePlayer();});
  dialog.addEventListener('click',event=>{if(event.target===dialog)closePlayer();});
  if(project.type==='video'){
    media.addEventListener('error',()=>{
      const message=document.createElement('p');message.className='player-error';message.textContent='无法在当前浏览器播放。';
      const download=document.createElement('a');download.href=url(project.src);download.download='';download.textContent='下载原片 ↗';message.append(download);bottom.replaceChildren(message);
    },{once:true});
    media.play().catch(()=>{});
  }
}

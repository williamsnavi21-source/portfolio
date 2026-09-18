/**
 * [INPUT]: 单项作品、media-url.js 资源地址、video-playback.js 一次兼容回退。
 * [OUTPUT]: openPlayer / closePlayer，原生 dialog 大屏播放器。
 * [POS]: 首页、作品卡片共享的媒体层；关闭即释放媒体并恢复焦点。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
let current=null, previousFocus=null, playback=null;
import { mediaUrl as url } from './media-url.js';
import { createVideoPlayback } from './video-playback.js';
export function closePlayer(){
  if(!current)return;
  const dialog=current;current=null;
  playback?.dispose();playback=null;
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
  if(project.type==='image'){media.alt=project.title;media.src=url(project.src);}
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
    const status=document.createElement('span');status.className='playback-status';status.setAttribute('role','status');
    const retry=document.createElement('button');retry.textContent='点击播放';retry.hidden=true;
    const compatible=document.createElement('button');compatible.textContent='兼容播放';compatible.hidden=!project.compatSrc;
    const download=document.createElement('a');download.href=url(project.src);download.download='';download.textContent='下载原片 ↗';download.hidden=true;
    const actions=document.createElement('div');actions.className='playback-actions';actions.append(status,retry,compatible,download);bottom.prepend(actions);
    const controller=createVideoPlayback(media,project,(state,usingCompatibility)=>{
      status.textContent={ready:'',loading:'正在加载影片…',playing:'',tap:'请点击播放',error:'影片加载失败，请重试。'}[state];
      retry.hidden=!['tap','error'].includes(state);download.hidden=state!=='error';
      compatible.disabled=usingCompatibility;compatible.textContent=usingCompatibility?'兼容线路':'兼容播放';
    });
    playback=controller;retry.addEventListener('click',controller.play);compatible.addEventListener('click',controller.useCompatibility);
    void controller.play();
  }
}

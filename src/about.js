/**
 * [INPUT]: 用户确认的履历、服务单位、本人肖像，film-44 页头、独立 AIGC 分类封面、media-url.js 与公共页脚。
 * [OUTPUT]: mountAbout，个人介绍页面及可清理的滚动提亮动效。
 * [POS]: About 内容与呈现控制器；真实事实集中于本页，不扩展为未经确认的奖项或背书。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
const biography = '4年行业经验，具有政企宣传片、纪录片、汇报片、短视频、AIGC制作等多种视频剪辑经验，熟练影视后期制作全流程。能够精准把控影片节奏、画面选择与音效设计，确保让成片既符合商业传播需求，又兼具视觉质感，准时交付。';
const approach = '我热衷于探索新的剪辑手法，并将其变为触动人心的视觉现实。我相信，剪辑是影像的第二次叙事。';
const ai = '拥抱AI内容时代，熟练AI全流程制作，现已将前沿AIGC影像与音频工具深度融入工作流。致力于将传统影视的审美底蕴与AI生成技术结合，探索更高效、前卫的视觉表达。';
const clients = ['福建国网','中国三峡','中国华电','中国华能','榕发','兴业银行','招标集团','快奥森多','数字峰会','福建广电','奥飞娱乐'];
const services = [['纪录片','DOCUMENTARY'],['微电影','SHORT FILM'],['宣传片','COMMERCIAL'],['AIGC','GENERATIVE FILM']];
import { mediaUrl as asset } from './media-url.js';
const revealText = text => `<p class="reading-reveal" aria-label="${text}"><span aria-hidden="true">${[...text].map(char=>`<span>${char}</span>`).join('')}</span></p>`;

export function mountAbout(container, projects, footer, reduced) {
  const cover = projects.find(p=>p.id==='film-44');
  container.innerHTML = `<article class="about-page">
    <header class="about-hero"><img src="${asset(cover.src)}" alt="AIGC 人物影像作品：粉发人物坐在户外长椅上" fetchpriority="high"><div><span>影像创作者 / WANG FILMS</span><h1>ABOUT WANG</h1></div></header>
    <section class="about-introduction" aria-label="个人介绍">
      <div class="about-copy"><span class="about-label">( ABOUT ME )</span>${revealText(biography)}${revealText(approach)}<a class="text-link" href="/works">EXPLORE MY WORK ↗</a></div>
      <figure class="about-portrait"><img src="/assets/wang-portrait.jpg" alt="WANG FILMS 影像创作者本人肖像" width="1400" height="1876" loading="lazy"><figcaption><span>WANG FILMS</span><span>影像创作者 · 4年行业经验</span></figcaption></figure>
      <div class="about-copy about-ai"><span class="about-label">( A NEW WAY TO CREATE )</span><h2>拥抱 AI 内容时代。</h2>${revealText(ai)}</div>
    </section>
    <section class="about-clients" aria-labelledby="clients-heading"><div class="clients-heading"><span class="about-label">( SELECTED CLIENTS )</span><h2 id="clients-heading">服务单位</h2></div>
      <div class="government-client"><h3>福建各政府部门</h3><p>水利厅 / 住建厅 / 矿山局 / 应急厅 / 气象局 / 渔业局 / 文旅局</p></div>
      <ul class="client-grid">${clients.map(client=>`<li>${client}</li>`).join('')}</ul>
    </section>
    <div class="category-stack">${services.map(([category,label])=>{const film=projects.find(p=>p.category===category);const poster=category==='AIGC'?'assets/aigc-category-node37.jpg':film.poster;return `<a class="category-banner" href="/works?category=${encodeURIComponent(category)}"><img loading="lazy" src="${asset(poster)}" alt=""><div><span>[ ${category} ]</span><h2>${label}</h2></div><span class="category-arrow">↗</span></a>`;}).join('')}</div>
  </article>${footer}`;
  if (reduced) return () => {};
  const paragraphs = [...container.querySelectorAll('.reading-reveal')].map(element=>({element,chars:[...element.querySelectorAll('span > span')],last:-1}));
  let frame = 0;
  function paint() {
    frame = 0;
    const height = window.innerHeight;
    paragraphs.forEach(item=>{
      const rect = item.element.getBoundingClientRect();
      const progress = Math.max(0,Math.min(1,(height*.88-rect.top)/(rect.height+height*.3)));
      const count = Math.ceil(progress*item.chars.length);
      if(count===item.last)return;
      item.chars.forEach((char,index)=>char.classList.toggle('read',index<count));item.last=count;
    });
  }
  const wake=()=>{if(!frame)frame=requestAnimationFrame(paint);};
  paragraphs.forEach(({element})=>element.classList.add('is-animated'));
  window.addEventListener('scroll',wake,{passive:true});window.addEventListener('resize',wake);wake();
  return ()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',wake);window.removeEventListener('resize',wake);};
}

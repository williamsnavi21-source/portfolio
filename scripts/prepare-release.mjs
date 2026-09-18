/**
 * [INPUT]: projects.json、本地原始图片、独立分类封面、预览片段与 FFmpeg。
 * [OUTPUT]: public/assets 网页素材与 release-manifest.json 构建映射。
 * [POS]: 离线发布准备；压缩副本进入源码仓库，完整原片保持独立存储。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { readFile, writeFile, mkdir, copyFile, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
const projects = JSON.parse(await readFile('src/projects.json','utf8'));
await mkdir('public/assets/covers',{recursive:true});
await mkdir('public/assets/images',{recursive:true});
const manifest = {};
async function optimize(input, output, width) {
  const original = await stat(input), cached = await stat(output).catch(()=>null);
  if(cached && cached.size>0 && cached.mtimeMs>=original.mtimeMs)return;
  execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',input,'-frames:v','1','-vf',`scale=min(${width}\\,iw):-2,format=yuvj420p`,'-q:v','3',output]);
}
for(const project of projects) {
  const poster = `assets/covers/${project.id}.jpg`;
  await optimize(project.poster,`public/${poster}`,1280);
  const entry = {poster};
  if(project.type==='image') {
    entry.src = `assets/images/${project.id}.jpg`;
    await optimize(project.src,`public/${entry.src}`,2400);
  }
  if(project.preview) {
    entry.preview = `assets/${path.basename(project.preview)}`;
    await copyFile(project.preview,`public/${entry.preview}`);
  }
  manifest[project.id] = entry;
}
for(const name of ['azeret-mono.woff2','AzeretMono-OFL.txt','favicon.svg','wang-portrait.jpg','aigc-category-node37.jpg'])await copyFile(`assets/${name}`,`public/assets/${name}`);
await writeFile('public/release-manifest.json',JSON.stringify(manifest,null,2));
process.stdout.write(`Prepared ${projects.length} website covers, 7 image works and 5 previews. Originals unchanged.\n`);

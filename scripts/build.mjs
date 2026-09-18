/**
 * [INPUT]: 前端源码、public 发布素材、HTTPS MEDIA_BASE_URL、可选 LINZHI_COMPAT_PATH。
 * [OUTPUT]: dist 静态站与指向独立存储的生产作品索引。
 * [POS]: 云端和本地共用的确定性构建；缺少媒体配置时阻止不完整发布。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { readFile,writeFile,mkdir,readdir,copyFile,cp,rm,stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output = path.join(root,'dist');
const source = path.join(root,'src');
const base = process.env.MEDIA_BASE_URL;
if(!base)throw new Error('请先配置 MEDIA_BASE_URL：完整影片上传并验证后才能构建生产站点。');
const media = new URL(base);
if(media.protocol!=='https:' || media.username || media.password || media.search || media.hash)throw new Error('MEDIA_BASE_URL 必须是不含凭据和查询参数的 HTTPS 根地址。');
const projects = JSON.parse(await readFile(path.join(source,'projects.json'),'utf8'));
const manifest = JSON.parse(await readFile(path.join(root,'public/release-manifest.json'),'utf8'));
const compatPath = process.env.LINZHI_COMPAT_PATH;
if(compatPath && compatPath!=='/playback/film-04.mp4')throw new Error('兼容入口必须为已配置的固定影片路径。');
const prepared = projects.map(project=>{
  const entry = manifest[project.id];
  if(!entry?.poster || (project.type==='image'&&!entry.src) || (project.featured>=0&&!entry.preview))throw new Error(`发布素材不完整：${project.id}，请运行 npm run prepare:release。`);
  const src = project.type==='image' ? entry.src : media.href.replace(/\/$/,'')+'/'+project.src.split('/').map(encodeURIComponent).join('/');
  return {...project,...entry,src,posterSource:null,...(project.id==='film-04'&&compatPath?{compatSrc:compatPath}:{})};
});
for(const entry of Object.values(manifest))for(const resource of Object.values(entry)) {
  const resolved = path.resolve(root,'public',resource);
  if(!resolved.startsWith(path.join(root,'public')+path.sep) || !(await stat(resolved)).isFile())throw new Error('发布资源路径非法或不存在');
}
// ---- 只清理当前项目的派生 dist，原始目录永远不在删除范围 ----
if(path.dirname(output)!==root || path.basename(output)!=='dist')throw new Error('拒绝清理非构建目录');
await rm(output,{recursive:true,force:true});
await mkdir(path.join(output,'src'),{recursive:true});
await copyFile(path.join(root,'index.html'),path.join(output,'index.html'));
for(const file of await readdir(source))if(/\.(js|css)$/.test(file))await copyFile(path.join(source,file),path.join(output,'src',file));
await cp(path.join(root,'public/assets'),path.join(output,'assets'),{recursive:true});
await writeFile(path.join(output,'src/projects.json'),JSON.stringify(prepared,null,2));
process.stdout.write(`Built ${prepared.length} works into dist. Full films served by ${media.origin}.\n`);

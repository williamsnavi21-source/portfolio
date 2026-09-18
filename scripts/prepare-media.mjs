/**
 * [INPUT]: 工作区四类原片、本人肖像与 FFmpeg / FFprobe。
 * [OUTPUT]: assets 内封面、首页预览，src/projects.json 作品索引。
 * [POS]: 离线素材流水线；网站只消费其生成索引，原片保持不变。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { readdir, mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
await mkdir('assets', { recursive: true });
await mkdir('src', { recursive: true });
const categories = ['纪录片', '微电影', '宣传片', 'AIGC'];
const featuredNames = ['重返林芝', '唐卡纪录片', '《时间的两端》', '浦韵新章 城载千年', 'molii女团MV'];
const previewStarts = [139, 43, 9, 22, 10];
const previous = JSON.parse(await readFile('src/projects.json','utf8').catch(()=>'[]'));
const ids = new Map(previous.map(project=>[project.src,project.id]));
let nextId = Math.max(0,...previous.map(project=>Number(project.id.slice(5)))) + 1;
const files = [];
async function walk(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) await walk(file);
    else if (/\.mp4$/i.test(file) || (/ip设计/.test(file) && /\.png$/i.test(file))) files.push(file);
  }
}
for (const category of categories) await walk(category);
const projects = [];
async function exists(file) { try { return (await stat(file)).size > 0; } catch { return false; } }
for (const [index, file] of files.entries()) {
  const source = file.split(path.sep).join('/');
  const id = ids.get(source) || `film-${String(nextId++).padStart(2, '0')}`;
  const name = path.basename(file, path.extname(file));
  const isImage = /\.png$/i.test(file);
  const info = JSON.parse(execFileSync('ffprobe', ['-v','quiet','-show_format','-show_streams','-of','json',file], { encoding: 'utf8' }));
  const video = info.streams.find(s => s.codec_type === 'video');
  const duration = Number(info.format.duration || 0);
  let poster = `assets/${id}.jpg`;
  const siblings = await readdir(path.dirname(file));
  const uploaded = siblings.find(name => name.startsWith(path.basename(file) + '.') && /\.png$/i.test(name));
  const posterSource = uploaded ? path.join(path.dirname(file), uploaded).split(path.sep).join('/') : null;
  const videoDuration = Number(video?.duration || duration);
  const seek = isImage ? [] : ['-ss', String(Math.min(videoDuration * .22, 32))];
  if (posterSource) poster = posterSource;
  else if (process.argv.includes('--refresh-posters') || !await exists(poster)) execFileSync('ffmpeg', ['-hide_banner','-loglevel','error','-y',...seek,'-i',file,'-frames:v','1','-vf','scale=1280:-2,format=yuvj420p','-q:v','3',poster]);
  const featured = featuredNames.indexOf(name);
  let preview = null;
  if (featured >= 0) {
    preview = `assets/${id}-preview-12s-v2.mp4`;
    if (!await exists(preview)) execFileSync('ffmpeg', ['-hide_banner','-loglevel','error','-y','-ss',String(previewStarts[featured]),'-i',file,'-t','12','-an','-vf','scale=1280:-2,fps=24','-c:v','libx264','-preset','veryfast','-crf','26','-pix_fmt','yuv420p','-movflags','+faststart',preview]);
  }
  projects.push({id,title:name.replace(/[《》]/g,''),category:file.split(path.sep)[0],subcategory:file.split(path.sep).length>2?file.split(path.sep)[1]:null,src:file.split(path.sep).join('/'),poster,posterSource,preview,featured,duration:Math.round(duration),width:video?.width,height:video?.height,type:isImage?'image':'video'});
  process.stdout.write(`${index+1}/${files.length} ${name}\n`);
}
await writeFile('src/projects.json', JSON.stringify(projects, null, 2));
if (!await exists('assets/wang-portrait.jpg')) execFileSync('ffmpeg', ['-hide_banner','-loglevel','error','-y','-i','本人介绍/图片1.png','-vf','scale=1400:-2','-frames:v','1','-q:v','2','assets/wang-portrait.jpg']);
process.stdout.write(`Prepared ${projects.length} projects.\n`);

/**
 * [INPUT]: 作品索引、原始资源、FFprobe 与运行在 localhost:3000 的服务。
 * [OUTPUT]: 资源完整性、12 秒无声预览、真实封面匹配、HTTP 路由和媒体 Range 验证结果。
 * [POS]: 不依赖外部库的客观验收入口，浏览器用户流另记 validation.md。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const projects=JSON.parse(await readFile('src/projects.json','utf8'));
assert.equal(new Set(projects.map(p=>p.id)).size,projects.length);
for(const p of projects){for(const file of [p.src,p.poster])assert.ok((await stat(file)).size>0,file);if(p.posterSource)assert.equal(p.poster,p.posterSource);}
assert.equal(projects.filter(p=>p.featured>=0).length,5);
assert.equal(projects.find(p=>p.title==='molii女团MV').id,'film-22','新增图片不能改变已有作品链接');
for(const p of projects.filter(p=>p.featured>=0)){
  assert.ok(p.preview && (await stat(p.preview)).size>0,`${p.title} preview exists`);
  const media=JSON.parse(execFileSync('ffprobe',['-v','quiet','-show_format','-show_streams','-of','json',p.preview],{encoding:'utf8'}));
  assert.ok(Number(media.format.duration)>=10&&Number(media.format.duration)<=15,`${p.title} preview length`);
  assert.ok(media.streams.every(s=>s.codec_type==='video'),`${p.title} preview has no audio`);
}
assert.ok((await stat('assets/wang-portrait.jpg')).size>0);
const base='http://localhost:3000';
for(const route of ['/','/works','/about','/contact',`/works/${projects[0].id}`]){const r=await fetch(base+route);assert.equal(r.status,200);assert.match(await r.text(),/WANG FILMS/);}
const source='/'+projects[0].src.split('/').map(encodeURIComponent).join('/');
const ranged=await fetch(base+source,{headers:{Range:'bytes=0-1023'}});
assert.equal(ranged.status,206);assert.equal((await ranged.arrayBuffer()).byteLength,1024);assert.match(ranged.headers.get('content-range'),/^bytes 0-1023\//);
const head=await fetch(base+source,{method:'HEAD'});assert.equal(head.status,200);assert.ok(Number(head.headers.get('content-length'))>1024);
const invalid=await fetch(base+source,{headers:{Range:'bytes=999999999999-'}});assert.equal(invalid.status,416);
assert.equal((await fetch(base+'/package.json')).status,404);
assert.equal((await fetch(base+'/assets/no-such-file.jpg')).status,404);
console.log(`PASS: ${projects.length} projects, ${projects.filter(p=>p.posterSource).length} uploaded covers, 5 silent 10–15s previews, portrait, 5 routes, byte-range/HEAD/invalid-range and path restrictions.`);

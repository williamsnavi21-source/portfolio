/**
 * [INPUT]: 项目目录的页面、索引、生成资源及原始媒体。
 * [OUTPUT]: 本机 HTTP 服务，支持 SPA 页面及媒体字节范围请求。
 * [POS]: 零依赖开发服务器；只暴露网站需要的目录，拒绝路径穿越。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import http from 'node:http';
import { stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const port = Number(process.env.PORT || 3000);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.mp4':'video/mp4','.svg':'image/svg+xml','.woff2':'font/woff2'};
const folders = new Set(['src','assets','纪录片','微电影','宣传片','AIGC']);
http.createServer(async (req, res) => {
  try {
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
    const raw = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const segments = raw.split('/').filter(Boolean);
    if (segments.some(s => s === '..' || s.includes('\\') || s.includes('\0'))) { res.writeHead(403).end(); return; }
    let relative = segments.join('/');
    if (!relative || ['about','contact','works','works-listing'].includes(segments[0])) relative = 'index.html';
    else if (relative !== 'index.html' && !folders.has(segments[0])) { res.writeHead(404).end('Not found'); return; }
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const info = await stat(file);
    if (!info.isFile()) { res.writeHead(404).end(); return; }
    const headers = {'Content-Type':types[path.extname(file)] || 'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':relative.startsWith('assets/')?'public, max-age=3600':'no-cache','X-Content-Type-Options':'nosniff'};
    let start = 0, end = info.size - 1, status = 200;
    if (req.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (!match || (!match[1] && !match[2])) { res.writeHead(416,{'Content-Range':`bytes */${info.size}`}).end(); return; }
      start = match[1] ? Number(match[1]) : Math.max(0, info.size - Number(match[2]));
      end = match[1] && match[2] ? Math.min(Number(match[2]),end) : end;
      if (start > end || start >= info.size) { res.writeHead(416,{'Content-Range':`bytes */${info.size}`}).end(); return; }
      status = 206; headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
    }
    headers['Content-Length'] = end - start + 1;
    res.writeHead(status, headers);
    if (req.method === 'HEAD') res.end();
    else createReadStream(file, {start,end}).on('error',()=>res.destroy()).pipe(res);
  } catch (error) { res.writeHead(error.code === 'ENOENT' ? 404 : 400).end('Resource unavailable'); }
}).listen(port, '127.0.0.1', () => process.stdout.write(`WANG FILMS http://localhost:${port}\n`));

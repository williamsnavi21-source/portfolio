/**
 * [INPUT]: 本地素材相对路径或生产索引中的 HTTPS 地址。
 * [OUTPUT]: mediaUrl，供所有页面统一解析本地与托管素材。
 * [POS]: 资源边界；本地中文文件名按段编码，远程地址保留已有编码。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
export function mediaUrl(value) {
  if (/^https:\/\//i.test(value)) return new URL(value).href;
  if (/^[a-z][a-z\d+.-]*:/i.test(value) || value.startsWith('//')) throw new Error('不支持的素材地址');
  return '/' + value.replace(/^\//,'').split('/').map(encodeURIComponent).join('/');
}

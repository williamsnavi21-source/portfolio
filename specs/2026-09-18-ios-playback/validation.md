# 验证
- 原文件 1,144,243,271 字节，1800.064 秒，1920×1080，25fps，H.264 High Level 4.0 / yuv420p + AAC-LC。moov offset=20，mdat offset=914788，已经 fast start。
- OSS Range bytes=0-1 返回 206、Content-Length=2、Content-Range=bytes 0-1/1144243271、Content-Type=video/mp4，但带 attachment 和 x-oss-force-download:true。
- 依据：https://help.aliyun.com/zh/oss/how-to-play-videos-online-in-oss 说明默认 OSS 域名强制下载；https://vercel.com/docs/routing/rewrites 支持固定外部来源 rewrite。未直接绑定大陆 OSS 自定义域名，因为先前备案核验未完成。
- 待验：兼容入口 Range 和内容、回退状态测试、两入口浏览器播放、生产发布和用户真实 iPhone 复验。
- 路由部署 490aba7 后，https://navivideo.me/playback/film-04.mp4 的 Range 0-1、500000000-500001023、1144242247-1144243270 均 206，Content-Range 和长度正确；Content-Disposition=inline、Content-Type=video/mp4。远端三个片段与本地原片对应字节逐一相等。验证使用 Node fetch 默认 TLS 校验和现有系统代理，不关闭证书校验；仅读取约 2KB 原片。
- npm run build 退出 0，44 作品；LINZHI_COMPAT_PATH 仅为 film-04 注入 compatSrc，原 src 保留。npm run check 退出 0，既有素材/路由/动效检查与新播放状态测试全通过。
- 新测试覆盖 NotAllowedError 不切换、媒体错误只回退一次、失败后可手动重新 load、旧 play Promise 拒绝不污染新源、关闭后不重新加载、无兼容源作品保持原错误语义。它们不等于 iPhone 真机解码测试。

# 验证
- 原文件 1,144,243,271 字节，1800.064 秒，1920×1080，25fps，H.264 High Level 4.0 / yuv420p + AAC-LC。moov offset=20，mdat offset=914788，已经 fast start。
- OSS Range bytes=0-1 返回 206、Content-Length=2、Content-Range=bytes 0-1/1144243271、Content-Type=video/mp4，但带 attachment 和 x-oss-force-download:true。
- 依据：https://help.aliyun.com/zh/oss/how-to-play-videos-online-in-oss 说明默认 OSS 域名强制下载；https://vercel.com/docs/routing/rewrites 支持固定外部来源 rewrite。未直接绑定大陆 OSS 自定义域名，因为先前备案核验未完成。
- 待验：兼容入口 Range 和内容、回退状态测试、两入口浏览器播放、生产发布和用户真实 iPhone 复验。

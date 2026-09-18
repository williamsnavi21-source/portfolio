# iPhone 完整影片播放修复
## Why
用户实测《重返林芝》在 iPhone 微信和 Safari 均出现“无法在当前浏览器播放”。桌面成功不能证明 iOS 兼容。
## What
为 film-04 增加同源兼容播放入口；原 OSS 直连失败后只自动切换一次，也可由访客点击兼容播放。首页弹层和作品详情行为一致；自动播放被拒绝时允许手动播放，关闭弹层后停止所有后续加载。
## Constraints
原片保持不变。实测 H.264 High 4.0 / yuv420p / AAC-LC，moov 位于文件开头，源站 Range 206；源站带 Content-Disposition: attachment 和 x-oss-force-download:true。强制下载头是已确认的协议问题，但尚不能证明是用户手机唯一根因。兼容入口必须验证 inline、video/mp4、首/中/末字节 Range 206 与正确内容，不使用服务函数把 1.14GB 文件读入内存。限定此一对象，不建任意 URL 代理、不变更 OSS 权限、不购买服务。
兼容回源使用现有 Vercel 外部 rewrite，会消耗 Vercel 流量；正常直连和其他作品不走兼容入口。不能把模拟窄屏或桌面 Chrome 当成真实 Safari 验收。
## Out of Scope
批量转码、迁移所有影片、更换 DNS、备案、购买 CDN、改动影片内容。

# 执行计划
1. 生成可重建网页素材与严格构建入口，保持 localhost 行为。
2. 验证缺少媒体地址构建会失败、产物不含原片或凭据、完整页面回归。
3. 用户最新改选阿里云 OSS；确认 OSS 开通状态、地域和计费后，创建专用桶并分片上传 37 部影片，检查 HTTPS 与 Range，设置真实媒体根地址。
4. 接入 Netlify 项目并部署验收合格的产物，验证平台域名；接入 Git 后验证自动部署。
5. 绑定 navivideo.me，验证 HTTPS 与生产分支自动部署。

状态：1–3 完成。37 部影片已上传，用户确认公开读取；专用桶 wang-films-media 已设公共读、关闭桶级阻止公共访问。37 个对象 HTTPS HEAD 均为 200 且长度与本地一致，抽检 Range 为 206。netlify.toml 已设置真实 MEDIA_BASE_URL，本地构建和检查通过。4 正在发布：CLI getSite 可读取正确项目，但 deploy 返回 Project not found，改用 Netlify 插件提供的官方发布入口。5 尚未切换 DNS，不得报告已上线。

上传暂存：.tools/oss-upload/films/ 使用原片硬链接保留原目录，37 个文件合计 9,430,865,421 字节，不额外拷贝原片。控制台扫描显示 37 文件、8994.0MB，对象前缀为 films/。后续 MEDIA_BASE_URL 必须包含 /films（待真实 HTTPS 接通后配置），不能把存储桶根直接用作媒体根。

Cloudflare R2 路线已被用户新选择取代，不再创建 R2 资源或迁移 DNS。网站仍使用 Netlify；影片直接使用 OSS 自带 HTTPS 地址，不额外创建 media 子域和证书。Agent 承担配置和上传，仅登录验证、必要计费/协议确认由用户完成。

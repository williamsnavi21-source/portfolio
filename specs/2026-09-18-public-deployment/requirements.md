# 公网部署与自动更新

## Why
用户要求把现有作品集部署上线、继续修改后自动更新，并使用已有阿里云域名 navivideo.me。

## What
- 用户最新指定 Netlify；前端部署到其 Netlify 账号，代码接入 Git 后推送生产分支触发更新。
- 用户最新改选阿里云 OSS，37 部完整视频约 9.5GB 独立存储；首页预览、封面、肖像和图片作品随静态站部署。
- 正式构建必须配置有效 HTTPS 媒体根地址；缺失时构建失败，禁止发布原片链接失效的空壳。
- 先验证平台域名页面和媒体，再绑定 navivideo.me；DNS 目标以项目实际返回值为准。
- 修改后提交并推送才触发部署，本地仅保存不等于线上更新；新增影片需先上传存储，再更新索引。

## Constraints
不覆盖原片；只生成可重建发布素材与 dist。原片、凭据和工具缓存不进入 Git。保持本地预览行为。用户自行完成账号登录、账单开通及必要授权；不收集密码、不承诺零费用、不改无关 DNS。

## Out of Scope
新增 CMS 编辑后台、购买套餐、注册新域名、视频内容改剪、系统开机自启。

## 决策状态
域名使用 navivideo.me。用户最新明确改选阿里云 OSS，取代 Cloudflare R2；先接完整影片再上线的条件已满足。Netlify 正式发布、阿里云 DNS 切换、HTTPS 证书已完成。GitHub 私有仓库 williamsnavi21-source/wang-films 已创建；源码推送与自动部署正在接入。线上授权替代此前仅本地的范围限制，上传范围限本站展示所需素材。
Netlify site ID: b1dc3ff1-fa20-446a-8331-cf66c3afd824；team slug: williamsnavi21-source，Free 团队。正式部署 ID 6aacc877e99a5a8204ea94d4。此前媒体未就绪导致的审批阻碍已在上传及验证完成后解除。
影片使用 OSS 自带 HTTPS 域名 wang-films-media.oss-cn-hangzhou.aliyuncs.com/films，已验证文件与 Range 响应。网页绑定 navivideo.me，DNS 托管、注册和续费保留阿里云。取消 Cloudflare Zone/DNS 迁移计划，不再开通 R2。用户确认域名已有 ICP 备案并选择中国大陆。专用桶 wang-films-media 为杭州、标准存储、本地冗余。37 部原片共 9,430,865,421 字节已上传；用户明确授权公开读取，已关闭此桶的阻止公共访问并保存公共读 ACL，不允许公共写。浏览器已验证正式首页和完整影片连续播放。

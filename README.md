# WANG FILMS · 影像创作者

在此目录运行：

```powershell
npm start
```

浏览器打开 http://localhost:3000 。无需安装依赖，要求 Node.js 20.11+。

本地预览依赖服务进程持续运行。电脑重启或关闭服务后，已打开页面仍可能保留文字，但尚未加载的图片会显示裂图。此时重新运行 `npm start`，保持终端打开，再刷新页面；不需要重新生成图片。

首页：滚轮、上下方向键或滑动切换精选作品；点击封面／当前片名放大播放。右上方菜单可进入作品、关于与联系。
首页精选自动循环播放 12 秒静音预览，打开菜单／播放器时暂停；点击播放完整原片。减少动画偏好下显示静态封面。
首页动效：鼠标／触摸拖拽与滚轮驱动连续画布转场、圆柱片名及惯性吸附；每次进入页面都有入场动画。首次会话片头只播放一次。
作品页：四类筛选，GRID / LIST 切换，点击封面播放；播放器底部可进入详情，Escape 关闭。
联系：973132021@qq.com；表单只在本地组装邮件草稿，由访客在邮件应用中发送。
关于：真实个人经历、AI 制作理念、服务单位与本人肖像；内容维护在 `src/about.js`。

## 素材维护
原片位于 `纪录片/`、`微电影/`、`宣传片/`、`AIGC/`，本地原片未改动；37 部影片已上传到阿里云 OSS 专用桶 wang-films-media 的 films/ 目录。
已有 11 张与影片同名前缀的上传 PNG 用作封面，其余使用抽帧。作品数据在 `src/projects.json`。
新增素材后安装 FFmpeg 并运行 `npm run media` 重建索引、缺失封面和精选预览；已有作品 ID 保持稳定。
首页精选顺序与预览起点在 `scripts/prepare-media.mjs` 的 featuredNames / previewStarts 中配置。片段均为 12 秒；调整起点后同步修改预览文件版本名以重新生成。
本人照片保留在 `本人介绍/图片1.png`，网站使用 `assets/wang-portrait.jpg` 优化副本。

运行中执行 `npm run check` 验证资源及 HTTP 播放契约。
详细证据与已知边界见 `specs/2026-09-17-film-portfolio/validation.md`。

已知原片问题：《快奥森多宣传片片头》画面轨仅 0.24 秒、音频约 149 秒；需要原素材更新后才能恢复完整画面。
完整影片已接入阿里云 OSS（杭州），37 个文件合计 9,430,865,421 字节。网页正式发布及域名切换状态以部署规格的 validation.md 为准。

## 公网发布准备
现有网址：https://navivideo.me ，DNS 仍指向 Netlify，国内直连未通过验收。用户已同意迁至阿里云大陆 OSS，74 个前端文件已上传且内容校验通过、SPA 路由已配置；阿里云查询域名显示“未备案”，因此尚未绑定 OSS 域名或切换 DNS，等待备案或托管地域决策。Netlify 作为回退版本保留。GitHub 私有源码仓库已创建，自动部署尚未接通，保存本地文件不会自动更新网站。
1. 本地运行 `npm run prepare:release`，生成 public 内可提交的网页素材副本（需要 FFmpeg）；原片不改动。
2. 将完整影片按原目录结构上传所选对象存储，确认 HTTPS 和 Range 可用。
3. 在部署平台配置真实的 `MEDIA_BASE_URL`，运行 `npm run build` 生成 dist。缺少地址会阻止构建。
4. Git 仓库连接部署平台后，推送到生产分支触发自动更新；仅保存本地文件不会自动上线。新素材须先重新生成素材与发布副本，新增影片须上传对象存储。
5. 平台地址验收通过后再绑定 navivideo.me，并按平台给出的记录修改阿里云 DNS。
Netlify 使用根目录 netlify.toml：构建命令 npm run build，发布目录 dist，包含 About / Contact / Works 的深链路由。项目管理地址：https://app.netlify.com/projects/wang-films 。仅创建项目不等于网站已上线。
netlify.toml 已配置真实媒体根地址 https://wang-films-media.oss-cn-hangzhou.aliyuncs.com/films；本地构建时需把同一地址设置为 MEDIA_BASE_URL 环境变量。当前 dist 已使用该地址重新构建。

About 下方 AIGC 分类入口使用独立封面 `assets/aigc-category-node37.jpg`（来源：用户指定的 `E:/AI项目/士气课程/第四周/图片节点_37_-_副本.png`），不参与作品计数；`npm run prepare:release` 同步该文件到发布素材。

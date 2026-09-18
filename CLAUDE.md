# WANG FILMS — 个人影视作品网站
Node.js 24 + 原生 ES Modules + WebGL + CSS + FFmpeg（素材准备）。无需安装前端依赖。

Mission：以全屏影像展示创作者作品，让访客浏览四类作品、播放原片并通过邮箱联系。
参考：https://veylt-films.framer.media/ 。品牌 WANG FILMS · 影像创作者；邮箱 973132021@qq.com。
最新确认交互：首页播放精选作品 12 秒无声循环预览，上传图片作为加载占位与作品卡片封面；点击打开 dialog 播放完整原片。
首页以连续位置同时驱动 WebGL 视频转场和三维圆柱标题；每次进入均执行页面入场，首次会话片头单独管理。无 WebGL 时使用 DOM 视频，减少动画时使用静态封面。菜单／播放器打开或页面隐藏时暂停预览。
About 使用用户提供的 4 年行业经验、剪辑与 AI 工作流、服务单位名单及本人肖像；正文滚动提亮。

<directory>
src/ - 页面、作品数据与交互动效
scripts/ - 本地 HTTP 服务、素材准备与验证
assets/ - 从原始素材生成的封面与预览片段
public/ - 生产发布的轻量素材和映射，可提交源码仓库
dist/ - build.mjs 生成的生产静态站，不提交仓库
specs/2026-09-17-film-portfolio/ - 本次规格、执行计划、验证证据
specs/2026-09-18-public-deployment/ - 域名、视频存储及自动部署规格与进展
纪录片/、微电影/、宣传片/、AIGC/ - 用户原始作品，只读保留
本人介绍/ - 用户提供的原始个人照片，只读；网站使用 assets 优化副本
</directory>
<config>
package.json - 启动、生成素材、验证入口
index.html - 语义页面入口与元数据
netlify.toml - 迁移前 Netlify 发布配置，保留回退；包含共用 OSS 媒体根地址
vercel.json - 先前准备的 Vercel 配置，当前不使用该平台发布
.gitignore / .vercelignore - 排除原片、凭据与不需发布的本地文件
</config>

约束：不编造履历、客户、奖项、年份；原片不改动。用户最新同意网页从 Netlify 迁至阿里云大陆 OSS，解决国内直连问题；视频仍在既有 films/，域名仍为 navivideo.me，DNS 留在阿里云，R2 已取消。Netlify 保留为回退，不再作为目标生产托管。不能将部署准备称为已完成迁移，需验证本机直连、HTTPS 和浏览器用户流。前端通过 HTTPS 读取影片；本地预览路径保持不变。所有模块小于 800 行。Node 本地 HTTP 提供媒体 Range 请求。
路线：参考观察与规格 → 素材索引 → 页面和动效 → 桌面／手机用户流验证。
迁移状态：74 个前端文件已上传至既有 OSS，内容校验和 SPA 配置通过；阿里云域名查询显示 navivideo.me 未备案，待用户决定备案或地域，域名与 HTTPS 尚未迁移，自动部署未接通。详细当前证据见 specs/2026-09-18-public-deployment/validation.md 首节。

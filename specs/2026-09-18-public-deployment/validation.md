# 部署验收
- 没有 MEDIA_BASE_URL 时构建必须失败；正式产物仅包含前端必需文件。
- 44 张封面、7 个图片作品及 5 部短预览存在；37 部完整影片使用 HTTPS 存储地址。
- 本地首页、分类、播放器、About 与联系保持可用。
- 线上页面、媒体 Range、域名证书正常；部署提交 SHA 与生产分支一致。

当前尚未部署，无公网验收结果。

## 最新状态：改用 OSS 并已开通（2026-09-18）
- 后续复核：浏览器连接已恢复，读取 OSS overview 显示已登录主账号，初始 Bucket 列表为空。用户确认域名已有备案并选择中国大陆。
- 已创建 wang-films-media；控制台“创建成功”明确显示杭州、标准存储、本地冗余、私有、阻止公共访问开启。Endpoint 为 oss-cn-hangzhou.aliyuncs.com；未开通附加日志、备份或加速。
- PowerShell 按 src/projects.json 的 video 条目创建 .tools/oss-upload/films/ 硬链接暂存，退出码 0；共 37 个文件、9,430,865,421 字节。控制台文件夹扫描显示 37 文件、8994.0MB；对象目录保留 films/AIGC/... 等路径。尚未点击正式上传，等候按量计费与公开读取确认。
- 用户取消 R2，选择阿里云 OSS；以下 R2 接入记录仅保留历史，不再作为执行计划。
- 用户确认登录，提供的 codex-clipboard-8c9e3530-5dbf-42e4-8a9b-52e020b25a1d.png 显示“恭喜，开通成功”“您已经成功开通对象存储服务”。这是用户提供的开通证据，尚未通过账号 API 独立核验。
- 本回合 cua.getState 报 Browsers: nodeRepl.fetch request failed；重置浏览器工具后重试仍失败。无法取得任何可操作标签页，不能据此推断用户未登录。
- 当前没有可调用的阿里云连接器，尚未创建 OSS 桶、上传影片或修改 DNS；需要恢复浏览器控制通道后继续。

## 本地准备验证（2026-09-18）
- npm run prepare:release：退出码 0，生成 44 张网页封面、7 张图片作品副本、5 部预览；保留原始素材。
- Node assert + spawnSync 构建检查：退出码 0；缺少 MEDIA_BASE_URL 时构建失败；中文本地路径编码正确，HTTPS 已编码地址不重复编码，不接受 javascript 协议。
- 使用保留测试域 https://media.example.invalid 执行构建成功，73 个文件共约 19.31 MB；37 部完整影片指向外部地址、7 张图片本地托管，仅含 5 部 12 秒预览 MP4，不含完整原片。此 dist 仅验证打包，不能作为上线结果。
- npm run check：退出码 0；素材、首页预览、Range、页面路由与动画数值检查通过。
- 浏览器 /works?category=AIGC 网格和列表各 25 项，AIGC 图片置后；/about 个人介绍和原分类封面正常输出。
- 尚未验证真实对象存储、生产域名、远程构建和 Git 自动部署；尚未创建云端项目、仓库或修改 DNS。

## 2026-09-18 Netlify / R2 接入状态
- 用户明确指定 Netlify 并确认新建 wang-films；已创建 site b1dc3ff1-fa20-446a-8331-cf66c3afd824，团队 williamsnavi21-source（Free）。仅项目壳，无本站发布内容。
- Netlify CLI 官方安装成功，用户通过 OAuth ticket 授权；login --check 返回 authorized。凭据由 CLI 保存，不写入仓库或本文档。
- netlify.toml 已配置 dist 构建和 About、Contact、Works 深链，.netlify/state.json 绑定真实站点，已加入 Git 忽略。
- npm run check 退出码 0，44 项资源与本地路由、Range、动画数学验证通过。
- 用户选择先接完整影片存储再完整上线，并选定 Cloudflare R2。
- Cloudflare 插件已安装；当前会话没有可调用 Cloudflare 账号工具。浏览器访问 Cloudflare 控制台超时，无法核实账户和 R2 开通状态。Wrangler whoami 显示未登录。
- Wrangler OAuth 请求被自动审批拒绝：workers:write 超出用户 R2 存储授权。未创建 OAuth 会话、未保存 Cloudflare 凭据。后续改用限定本站 R2 bucket 的 S3 对象上传凭据，不扩大到 Workers 管理。
- 直接部署 Netlify 被自动审批拒绝：完整影片存储与验收未完成。未通过其他方式绕过；先完成 R2 上传、真实 HTTPS/Range 和构建验收再重试。
- 当前 DNS 只读检查：navivideo.me NS 为 dns17/dns18.hichina.com；www CNAME 为 ns1.vercel-dns.com。未修改记录。
- 下一步依赖用户登录 Cloudflare 并自行完成 R2 开通/账单。随后创建专用桶、受限上传凭据、上传 37 部影片、接通 media.navivideo.me，验收后发布 Netlify 并切换网站域名。DNS 迁移前必须获取完整现有记录。

## 当前阻碍复核（2026-09-18）
用户要求尽量全部代为操作。Cloudflare 插件本回合已提供可用账号 API（此前不可用状态已过时）。通过官方 API 读取 R2 bucket 列表返回错误 10042：Please enable R2 through the Cloudflare Dashboard，确认 R2 尚未启用，而非仅凭据缺失。未执行 bucket 创建或上传。打开对应官网 R2 页面时内置浏览器超时，已提供直接入口。用户仅需完成官网开通及必要计费确认，其余部署操作继续由 Agent 承担；不再要求用户手动创建 bucket 或配置网站。

## 当前有效证据：OSS 接通与发布中（2026-09-18）
以下状态取代上方历史记录中的“未上传”“待公开读取”和 R2 计划。
- 控制台重试《艺圃之光：跨越百年的报国之路》后显示上传成功 37、失败 0、上传中 0。
- 用户明确回复“允许公开读取，继续上线”。仅对专用桶 wang-films-media 关闭桶级阻止公共访问并保存公共读；上传、修改、删除仍需账号授权。
- Node fetch 对 src/projects.json 的 37 个视频拼接真实 OSS URL，HEAD 全部 200、video/mp4、Content-Length 与本地一致；合计 9,430,865,421 字节。抽检 Range bytes=0-31 返回 206、Content-Range bytes 0-31/923134347。
- MEDIA_BASE_URL=https://wang-films-media.oss-cn-hangzhou.aliyuncs.com/films；npm run build 退出 0，44 个作品；npm run check 退出 0，资源、路由、Range 与动画数学检查通过。旧服务退出造成的 ECONNREFUSED 已通过重新启动本地服务消除。
- Netlify CLI api getSite 可读正确 site b1dc3ff1-fa20-446a-8331-cf66c3afd824，但 deploy 两次返回 Project not found。当前尝试插件返回的官方 @netlify/mcp 发布入口，暂存只含前端源码、发布素材与构建配置，80 文件约 19.62 MB，无原片或凭据。
- Netlify 访客权限已取消团队登录及密码要求，符合公开作品站的用途。
- 阿里云 DNS 现有记录已完整读取，总计 2 条：@ A 216.198.79.1；www CNAME ns1.vercel-dns.com；均默认线路、TTL 10 分钟、启用。尚未修改，保留为回退值。
- 待完成：实际公网发布、浏览器完整影片播放、网站域名绑定和 HTTPS、Git 自动部署。

## 正式发布与域名验收（2026-09-18）
- CLI 去掉 --site 参数、使用项目既有 .netlify/state.json 后成功发布：73 assets、exit 0、Deploy is live；部署 6aacc877e99a5a8204ea94d4，production https://wang-films.netlify.app。@netlify/mcp 尝试因服务端 500 失败，未作为成功证据。
- Node fetch 验证平台域名 /、/about、/works?category=AIGC、/contact 均 200；/src/projects.json 返回 44 条。
- 浏览器点击首页“放大播放重返林芝”：dialog video readyState 4、paused false、currentTime 66.56831、duration 1800.064、1920×1080；currentSrc 为真实 OSS HTTPS 对象地址。
- Netlify API 保存 custom_domain=navivideo.me、domain_aliases=[www.navivideo.me]；公共生产站无登录/密码要求。
- 阿里云 DNS @ A 已改 75.2.60.5（13:26），www CNAME 已改 wang-films.netlify.app（13:30），其他属性不变。权威 DNS 查询和后续本机 DNS 均确认新值。回退值保留在上一节。
- Netlify TLS API 返回 state=issued，证书覆盖 navivideo.me 与 www.navivideo.me，到期 2026-12-17，renewable=true；已启用 force_ssl。
- 浏览器 https://navivideo.me 成功呈现 WANG FILMS 首页、5 部精选影片及菜单。命令行直连自定义域名出现 ECONNRESET，与浏览器成功结果存在网络环境差异，不能据此承诺所有网络访问速度。
- GitHub 登录后创建 Private 仓库 https://github.com/williamsnavi21-source/wang-films；本地 git init -b main，origin 绑定该仓库。97 个文件已提交为 8407afb，git diff --cached --check 退出 0；原片、工具缓存及凭据被排除。尚未 push；Git Credential Manager 设备授权等待用户确认账号级权限。Netlify 浏览器通过现有 GitHub 登录成功，无需重复登录。

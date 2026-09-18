# 验收与证据
## 本地裂图排查与恢复（2026-09-18）
- 现象：AIGC 列表保留布局、片名，封面全部出现裂图。
- 实测根因：Node 请求 localhost:3000 返回 ECONNREFUSED（IPv4 / IPv6）；Get-NetTCPConnection 未找到 3000 端口监听。服务停止，无法确定此前停止的具体触发原因；抽查 film-40.jpg 为有效 Baseline JPEG 1280×1708。
- 处理：通过 PowerShell Start-Process -WindowStyle Hidden 独立启动既有 scripts/server.mjs，绑定仍为 127.0.0.1；未改图片、索引、布局或启动项。README 补充停止服务后的恢复方式。
- 资源证据：逐项 GET 全部 44 个封面 URL，HTTP 均为 200、MIME 均为 image/*，返回字节与本地文件逐一相等。
- UI 证据：浏览器访问 /works?category=AIGC 并滚动加载全部卡片，total=25、loaded=25、broken=[]；截图确认首屏 5 张人物图与画板封面正常显示。
- 回归：npm run check 退出码 0；资源／预览／HTTP／Range 和圆柱动效检查通过。

## 最新迭代：12 秒预览与个人介绍（2026-09-17）
本节替代下文历史记录中的“静态首页”和 39 项数量；历史测量仍保留作为对照。

- `npm run media -- --refresh-posters`：退出码 0。44 项（37 视频、7 图片），新增 5 张 IP 图片分配 film-40–44，原有 ID 保留。原文件未修改。
- 五部精选预览均为 12 秒、H.264、24fps、1280 宽、无音轨，FFprobe 已验证。总计约 9.7MB，首页按需加载当前转场两侧；未操作的影片 src 为空。肖像原 PNG 约 6MB，网站 JPEG 为 305,612 字节，保留完整竖幅。
- `npm run check`：退出码 0；44 项资源、11 个上传封面、5 个短预览、肖像、稳定 ID、路由／Range／HEAD／416 与圆柱动效测试全部通过。新增及修改 JS 的 `node --check` 均为 0。
- 桌面首页实测：首视频 readyState=4、duration=12、muted=true、paused=false，时间从 0.021693 推进到 9.676276；canvas-ready。菜单打开五个预览全部 paused=true；关闭恢复。
- 点击唐卡影片指示器后仅该预览继续播放，上一部 paused=true；当前标题投影 y582.297、高29.405、rotateX(0deg) translateZ(125px)，保留前次测得的原站几何。
- 打开唐卡原片：duration=2700.074667、currentTime=15.778733、readyState=4、paused=false，同时所有首页预览暂停。关闭后预览恢复，实测 paused=false、time=9.325692。
- 390×844 首页拖拽 (280,520)→(280,400)：中间 position=1.7320，转场两侧视频同时播放，上一部暂停，dialog=false；截图可见圆柱标题与视频转场。
- 360×800 首页：innerWidth=scrollWidth=360，预览 loop=true、readyState=4，时间持续推进；截图确认导航、片名、身份与指示器显示。点击重返林芝后原片 duration=1800.064、readyState=4、paused=false，预览暂停。
- About 桌面与 390px 截图已检查：用户完整介绍、AI 段落、7 个政府部门名称与 11 个其他服务单位均可读。肖像 naturalWidth=1400、移动宽335px，完整比例；服务单位两列，每列167.5px；document.scrollWidth=375 小于 innerWidth=390。滚动后 148 个介绍字符已提亮。
- 浏览器 error/warn 日志为空。新增视频播放循环未增加每帧重复标题 DOM 更新，只有位置或入场变化才更新标题样式。

剩余验证边界：原站本轮访问两次超时，沿用前次真实 DOM 几何与视觉记录；自建视频转场着色器及首次片头未取得逐帧一致证据，不声称 100% 复刻。iOS/Android 真机、系统减少动画偏好未实机验证。

## 历史验收（以下静态首页决策已被最新用户请求替代）
## 自动化证据（2026-09-17）
- `node --check src/app.js`、`node --check src/hero.js`、`node --check src/player.js`：退出码 0。
- `node scripts/verify.mjs`：退出码 0。39 项资源存在；11 张上传图准确匹配；5 个页面 HTTP 200；视频 Range 206、1024 字节与 Content-Range 正确；HEAD、416、非站点路径拒绝通过。
- FFprobe 检查全部 37 个视频，均为 H.264。另有 2 项 PNG 作品。
- 素材发现：`宣传片/快奥森多宣传片片头.mp4` 画面轨 0.24 秒、音频 149.312 秒。保留原片；抽帧脚本按画面轨时长定位，避免越界空输出。

## 浏览器实际用户流
- 1280×720 首页：上传的《重返林芝》封面全屏显示；居中 300×38 导航；点击封面打开 dialog，video readyState=4、paused=false、currentTime>0。
- Escape 关闭：dialog 已移除、video 数量归零，焦点回到原入口。
- 点击指示器、ArrowDown：当前片名从《重返林芝》变为《唐卡纪录片》，首页 video 数量仍为零。
- 390×844：手机首页、菜单、作品网格、列表、放大播放器、联系页均已截图观察。
- 分类筛选：纪录片 4、微电影 2、宣传片 13、AIGC 20、全部 39；列表切换后保留当前分类。
- 390px 放大《唐卡纪录片》：播放进度实测 11.566927 秒，readyState=4，点击关闭返回作品列表。
- 作品播放器 → 作品详情：《时间的两端》标题正确，dialog 关闭；点击 NEXT WORK 进入《蝶变按钮2》。
- 关于页通过菜单可达，有 4 个分类入口。
- 联系邮箱为 mailto:973132021@qq.com；必填字段 name/email/message 已核对。未发送邮件。
- 浏览器 error 日志为空。已加载作品封面未见损坏图片（broken=0）。

## 响应式证据
作品页实测：360px 单列，390px 单列，768px 双列，1280px 三列，1440px 三列；全部无横向溢出。联系页 360px 与 390px 均无溢出。

## 参考比对与边界
已观察原站桌面首页、菜单、作品网格、详情、关于页及 390×844 手机首页。保留全屏影像、300px 浮动导航、半透明菜单、透视片名轮播、黑底网格／列表、全幅播放器。Azeret Mono 字体已本地保存。
个人化差异：按用户要求使用静态上传图片并增加大屏播放；四类筛选代替团队展示；真实邮箱和个人文案；不复制虚构奖项、客户和团队。
尚未认证：原站所有动效逐帧／逐像素一致、iOS/Android 真机触摸、系统减少动画偏好实测。减少动画与触摸代码已实现，但未把实现本身计作实机验证。邮箱表单仅生成草稿，不承诺后端发送。

## 首页动效修复验收
问题根因：旧版把原站连续圆柱旋转做成直线标题平移，封面只做遮罩，且 900ms 切换锁吞掉连续输入；页面入场与会话片头未分离。修复后使用独立连续位置、惯性吸附与 WebGL 静态图绘制。

一手测量：原站 canvas 标记 `three.js r160`；标题外层 x460/y482/360×230（1280×720 视口），bottom 8，perspective 680；当前标题 rotateX(0deg) translateZ(125px)，相邻间隔 23deg；第 3 项距离 opacity 0.079。已按实测参数复建。

实际浏览器结果：
- 桌面稳定帧：圆柱外框 x460/y482/360×230，当前标题 rotateX(0deg) translateZ(125px)，与原站投影基准一致。
- ArrowDown 动画中间帧：position=0.4119，当前首标题 rotateX(9.4744deg)，画布 `canvas-ready=true`；截图显示两张封面之间的形变转场。
- 鼠标从 (700,520) 拖至 (700,310)：捕获 position=3.6347；dragging=false，dialog 不存在，证明松手惯性与防误点击均生效。
- 滚轮中间帧：position=0.6097，标题已经进入下一作品，画布持续渲染。
- 刷新后不重播首次片头时：entrance=0.4533098，标题 rotateX(-32.6921deg)；截图可见入场，不再直接呈现静止终态。
- 手机菜单展开中间帧：五项 opacity 分别约 .972/.934/.876/.788/.662，纵向位移递增；确认错峰动画实际执行。
- 390×844 与 360×800 均无横向溢出；360px 转场位置 1.7147，画布仍可用。
- 手机点击《重返林芝》：dialog=true，video.readyState=4、paused=false；关闭正常。
- `node scripts/verify-motion.mjs`：退出码 0；几何、透明度、60/120Hz 一致性、惯性端点与收敛通过。
- `node scripts/verify.mjs`：退出码 0；39 项素材与原有服务契约回归通过。

真实性边界：圆柱几何和页面结构依据原站实际 DOM；当前 WebGL 图像着色器是本地重建，不是原站着色器源码。额外源码读取被自动审批服务额度耗尽阻断，未绕过审批；因此不宣称着色器或首次片头与原站逐帧一致。图片代替背景视频是用户明确要求。

## 2026-09-18 AIGC 图片顺序
用户确认 7 张静态图片置后，保留原封面。只在 app.js 作品列表的筛选副本上稳定排序；不改 projects.json。
- 浏览器 /works?category=AIGC：25 项，前 18 项为 film-22–39 视频，后 7 项为 film-40–44、film-20、film-21 图片；GRID 与 LIST 实测顺序一致。
- /about AIGC 分类入口仍使用 /assets/film-40.jpg；首页精选索引与各作品封面未改。
- npm run check：退出码 0，44 项素材、11 张上传封面、5 部静音预览、肖像、路由和 Range、运动数学验证通过。

## 2026-09-18 About 封面及脸部裁切
- 指定 E:/AI项目/士气课程/第四周/微信图片_20260917221830_411_2.png 与工作区同名副本 SHA256 一致（E559DAB27A850B6174C4D3CBE167DC71607FB1456FCC6CC3C12B43B8DA7FE580）。About 改用对应 film-44 的 src；线上构建仍通过该作品现有发布映射提供图片，无需新增原图。
- AIGC 分类封面保留 film-40，仅改变 object-position / transform-origin 为 50% 23%，露出双眼至下巴。
- 浏览器桌面截图确认顶部为粉发人物，底部黑发人物面部可见；390×844 截图确认两张图面部均可见，documentElement.scrollWidth 未超出 innerWidth。临时视口已恢复。
- node --check src/about.js：退出码 0。只改变 About 展示，不改变作品列表排序与首页精选。

## 2026-09-18 AIGC 分类封面替换
- 按最新标注，将 About 下方 AIGC 分类入口换为 E:/AI项目/士气课程/第四周/图片节点_37_-_副本.png，未选择带 (1) 后缀的另一张图片。
- 原图保持只读；FFmpeg 导出同尺寸 JPG 到 assets/aigc-category-node37.jpg，prepare-release 将其复制到 public/assets，支持后续生产打包。未增加作品索引，顶部 film-44 封面不变。
- 浏览器桌面与 390×844 截图均确认新粉发人物图片、脸部可见；DOM 图片 naturalWidth=2048，src=/assets/aigc-category-node37.jpg，手机无横向溢出。视口已恢复。
- npm run prepare:release、node --check src/about.js 均退出码 0。

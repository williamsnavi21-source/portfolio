# src/
> L2 | 父级: ../CLAUDE.md
app.js: 页面路由、公共导航、作品筛选与内容渲染；列表中 AIGC 图片置后，不改变分类封面所用索引；委托 hero.js、about.js 与 player.js。
hero.js: 连续位置控制器，统一滚轮、指针拖拽、惯性吸附、键盘、片名和封面的入场。
hero-motion.js: 与刷新率无关的阻尼／吸附和实测圆柱几何纯函数，供自动化测试复核。
hero-renderer.js: 原生 WebGL 视频帧转场，封面加载回退，共享连续位置并释放 GPU 资源。
hero-media.js: 按需加载当前转场两侧的短预览，管理静音播放、菜单／弹窗／后台暂停与退出释放。
hero.css: 首页独立视觉真源，360×230 圆柱标题、680px 透视、300px 导航外围对齐。
about.js: 用户真实介绍、肖像与服务单位，使用 film-44 页头及独立 aigc-category-node37.jpg 分类封面，提供 mountAbout 和可清理的逐字滚动提亮。
about.css: About 全幅页头、窄栏正文、完整肖像和客户名单的响应式布局；AIGC 分类封面以 60%/30% 焦点保留脸部。
player.js: 原生 dialog 放大播放器，统一首页与作品卡片的播放、关闭与焦点恢复。
video-playback.js: 弹层和详情共用的播放控制器；直连错误后仅尝试一次兼容地址，手势限制显示手动播放，销毁阻止迟到回调。
style.css: 公共导航、菜单、非首页页面、播放器与页面过渡；首页视觉由 hero.css 隔离。
projects.json: prepare-media.mjs 生成的真实作品索引；含路径、封面、时长与精选序号。
media-url.js: 各页面共享的素材路径边界，本地中文路径编码与线上 HTTPS 地址兼容。
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

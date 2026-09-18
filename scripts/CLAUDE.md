# scripts/
> L2 | 父级: ../CLAUDE.md
prepare-media.mjs: 从原作品生成封面、12 秒无声预览、优化肖像及索引；沿用已存在的作品 ID，新增素材不改变旧链接；不改动输入。
server.mjs: Node HTTP 静态服务，按允许路径读取资源并支持视频 Range、HEAD 和 SPA 路由。
verify.mjs: 验证作品、肖像、10–15 秒无声预览及 HTTP 服务契约，保存可重复运行的检查入口。
verify-motion.mjs: 验证圆柱投影、惯性边界、阻尼收敛及 60/120Hz 刷新率一致性。
prepare-release.mjs: 生成 public 网页媒体及发布映射，复制独立 AIGC 分类封面，压缩副本不修改原始素材。
build.mjs: 从前端与 public 生成 dist，将完整影片指向 MEDIA_BASE_URL，缺失配置时拒绝构建。
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

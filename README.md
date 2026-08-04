# V10.0C.1 稳定修复版

本版修复V10.0C初始化阶段缺少核心变量与工具函数的问题。该问题会导致：
- 典籍卡片和知识专项不显示；
- 大多数按钮没有绑定点击事件；
- 看图题无法启动；
- 学习统计停留在静态初始值。

## 修复文件
1. index.html
2. service-worker.js
3. manifest.webmanifest
4. README.md
5. UPGRADE_COMPARISON.txt

## GitHub更新
至少替换仓库根目录中的：
- index.html
- service-worker.js
- manifest.webmanifest

部署完成后，Safari应关闭原页面并重新打开。若仍显示旧版，可删除主屏幕旧图标后重新添加。

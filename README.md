# The Four Classics Inquisitor V10.0C.2 · 大陆稳定版

## 本次解决的两个问题

### 1. 顶部条幅遮挡页面
V10.0C.1使用了 `position: sticky`，导致顶部导航在滚动和答题过程中始终占据屏幕。
本版改为普通文档布局，导航会随页面自然滚走，不再遮挡选项和题目。

### 2. 中国大陆看图题加载失败
原版由Safari直接连接Wikimedia Commons，部分中国大陆网络可能无法访问。
本版新增Cloudflare Pages `_worker.js` 图片代理：
- 用户浏览器只访问当前小程序域名；
- Cloudflare服务器代为获取馆藏图片；
- 图片在Cloudflare边缘缓存30天；
- 第一次成功后，Service Worker还会在本机缓存；
- 代理失败时再尝试原始地址，并显示可理解的错误提示，不会卡死整个答题流程。

## 上传要求
必须把以下5个变化文件上传至仓库根目录：
- index.html
- _worker.js（新增，必须位于根目录）
- service-worker.js
- manifest.webmanifest
- README.md

`_worker.js`只在Cloudflare Pages生效；GitHub Pages本身不支持服务器代理。

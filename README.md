# The Four Classics Inquisitor V11.1.1 · 初始化修复版

## 故障根因
V11.1替换名著博物馆页面后，代码仍绑定已删除的museumCuratedBtn和museumAllBtn。浏览器执行到这里报错，后续首页渲染和按钮绑定全部中断。

## 修复内容
- 删除废弃绑定。
- 恢复首页动态内容和全部主要按钮。
- 对旧博物馆统计元素增加安全保护。
- 保留权威馆藏入口模式。

## 最快升级
替换index.html、service-worker.js、manifest.webmanifest及说明文件即可；images、assets、data无需重新上传。

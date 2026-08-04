# 项目架构

V10.4起，名著博物馆资源统一由 data/museum.json 管理。

图片策略：
1. 本地导览封面：images/museum/<book>/*.jpg
2. 原始馆藏来源：remoteImage/source，仅用于来源追溯
3. 页面显示：本地优先，失败时回退App图标

后续扩充馆藏时，应先增加本地文件，再追加museum.json记录。

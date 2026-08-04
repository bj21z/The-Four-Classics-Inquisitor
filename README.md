# The Four Classics Inquisitor V10.4 · 本地馆藏核心版

## 本版解决的问题
V10.3博物馆图片依赖境外馆藏地址，在部分中国大陆网络和Safari环境中会显示问号。本版增加50张本地数字馆藏导览封面，博物馆正常浏览不再依赖境外图片。

## 核心结构
- data/museum.json：统一馆藏索引
- images/museum/honglou：红楼梦馆
- images/museum/xiyou：西游记馆
- images/museum/sanguo：三国演义馆
- images/museum/shuihu：水浒传馆
- docs：架构、路线图、测试与已知限制

## 真实性说明
本版包含50张本地“数字馆藏导览封面”，用于稳定展示和内容导航。它们不是冒充历史原作的图片。原始馆藏来源仍记录在数据和ATTRIBUTION.md中。

## 从V10.3升级
建议使用完整项目包全量替换，因为本次新增images/museum、data/museum.json和docs目录。

# 代理、反射与 Vue2 响应式局限

[← 返回索引](../index.md)

> 摘自 `profile/essay.md` 后半部分

---

# 代理与反射
## 代理基础
> 创建空代理
```javascript

```

## Vue2 问题分析
1. 需要响应化的数据较大时，递归遍历性能不好，消耗较大
2. 新增或删除不能响应式
3. 数组响应化需要额外的实现
4. 修改语法有限制

# 浏览器内核
|浏览器|内核（渲染引擎）|JavaScript引擎|
|-----|-----|-----|
|IE|Trident 内核，俗称 IE 内核|
|Chrome|以前是 Webkit 内核，现在是 Blink 内核|V8|
|Firefox|Gecko内核|SpiderMonkey|
|Safari|Webkit内核|JavaScriptCore（又称Nitro）|
|Opera|Blink内核|
|360、猎豹|IE + Chrome双内核|
|搜狗、QQ|Trident(兼容模式) + Webkit(高速模式)|
|百度浏览器|IE 内核|
## 渲染引擎
## JS 引擎




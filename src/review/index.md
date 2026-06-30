# 个人复习库

> 从 `profile` 学习仓库**批量迁移**的高频复习内容（含完整代码）。与 [算法](../data-structures-and-algorithms/)、[代码片段](../code-snippets/)、[后端路线图](../backend/roadmap) 互补。

---

## 怎么用

| 场景 | 推荐章节 |
|------|----------|
| 刷 JS 手写 | [手写题速查](./js-handwritten-cookbook) → [Array/Function/Object 分篇](./js-handwritten/array-methods) |
| 补原型/继承/Proxy | [JS 对象与继承](./js-oop-prototype) · [Proxy 与 Vue2 局限](./proxy-vue2-notes) |
| 算法刷题 | [LeetCode 题解 1–6](./algorithms/leetcode-solutions-1) · [排序/搜索 Set](./algorithms/sort-implementations) |
| Vue 响应式源码 | [mini 实现合集](./vue/reactivity-implementations) · [Vue2 数组劫持](./vue/vue2-array-method) |
| TypeScript 速查 | [TS 笔记](./typescript/notes) |
| Node / Koa | [Koa 与 HTTP 手写](./node/koa-and-http) |
| 查 profile 原文 | [来源索引](./profile-source-map) |

---

## 章节索引

### 基础与浏览器

| 章 | 说明 |
|----|------|
| [JS 对象与继承](./js-oop-prototype) | 工厂/原型/继承链（essay 前半） |
| [Proxy 与 Vue2 局限](./proxy-vue2-notes) | 代理基础、Vue2 响应式问题（essay 后半） |
| [JS 手写题速查](./js-handwritten-cookbook) | 防抖节流、Promise、深拷贝等摘要 |
| [浏览器与运行时](./browser-runtime) | 内核、作用域链、事件循环 |
| [前端复习路线](./frontend-roadmap) | JS/CSS/源码/算法学习资源 |

### JS 手写题（profile 完整代码）

| 章 | 说明 |
|----|------|
| [Array 篇](./js-handwritten/array-methods) | map/filter/reduce/flat 等 10 题 |
| [Function 篇](./js-handwritten/function-methods) | call/apply/bind/柯里化 |
| [Object 篇](./js-handwritten/object-methods) | new/create/深拷贝/继承 |
| [ES6 篇](./js-handwritten/es6-methods) | class/map/set |
| [Ajax 与 JSONP](./js-handwritten/ajax-jsonp) | 手写请求 |
| [MyPromise](./js-handwritten/promise-mypromise) | 完整 Promise 实现 |
| [其他与工具函数](./js-handwritten/misc-utils) | 发布订阅、数组转树、防抖节流 |

### 算法

| 章 | 说明 |
|----|------|
| [算法模式笔记](./algorithm-patterns) | LRU、滑动窗口、DP 题单摘要 |
| [排序实现](./algorithms/sort-implementations) | 冒泡/快排/归并等 6 种 |
| [二分与 BST](./algorithms/search-and-tree) | 二分查找、二叉搜索树 |
| [LeetCode 题解 1–6](./algorithms/leetcode-solutions-1) | profile 31 题完整代码 |
| [进阶算法 2024–2025](./algorithms/advanced-algorithms-2024-2025) | 堆排序、并查集、背包、并发 |

### Vue / TS / Node

| 章 | 说明 |
|----|------|
| [Vue 响应式 mini 实现](./vue/reactivity-implementations) | vuecore / kvue / vue3 练习 |
| [Vue2 数组方法笔记](./vue/vue2-array-method) | 数组劫持原理 |
| [TypeScript 笔记](./typescript/notes) | 完整 TS 学习笔记 |
| [Koa 与 HTTP 手写](./node/koa-and-http) | 洋葱模型、body 解析、mini-axios |

### 元信息

| 章 | 说明 |
|----|------|
| [Profile 来源索引](./profile-source-map) | profile 目录 → blog 对照表 |

---

## 与现有文档的关系

```text
profile（原始练习代码，按年月归档）
        ↓ 批量迁移（scripts/migrate-profile-to-review.mjs）
review/（本模块 — 复习向、可检索、含完整代码）
        ↓ 交叉链接
code-snippets/ · data-structures-and-algorithms/ · backend/
```

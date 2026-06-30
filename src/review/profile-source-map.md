# Profile 来源索引

[← 返回索引](./index)

> `c:\learn\profile` 与 blog `review/` 模块的对照表。有价值且 blog 缺失的内容已通过 `scripts/migrate-profile-to-review.mjs` 批量迁入。**个人面经、公司向题单等隐私内容不纳入 blog。**

---

## 已完整迁移到 review/

| profile 来源 | blog 位置 | 说明 |
|--------------|-----------|------|
| `essay.md`（对象/继承） | [js-oop-prototype](./js-oop-prototype) | 前半部分摘要 |
| `essay.md`（代理/Vue2） | [proxy-vue2-notes](./proxy-vue2-notes) | 后半部分 |
| `JavaScript/JavaScript手写题/Array篇/` | [js-handwritten/array-methods](./js-handwritten/array-methods) | 10 个 .js |
| `JavaScript/JavaScript手写题/Function篇/` | [js-handwritten/function-methods](./js-handwritten/function-methods) | 6 个 .js |
| `JavaScript/JavaScript手写题/Object篇/` | [js-handwritten/object-methods](./js-handwritten/object-methods) | 3 个 .js |
| `JavaScript/JavaScript手写题/ES6篇/` | [js-handwritten/es6-methods](./js-handwritten/es6-methods) | 2 个 .js |
| `JavaScript/JavaScript手写题/ajax与jsonp/` | [js-handwritten/ajax-jsonp](./js-handwritten/ajax-jsonp) | 2 个 .js |
| `JavaScript/JavaScript手写题/Promise篇/MyPromise.js` | [js-handwritten/promise-mypromise](./js-handwritten/promise-mypromise) | 完整实现 |
| `JavaScript/JavaScript手写题/其他/`、`防抖节流/` | [js-handwritten/misc-utils](./js-handwritten/misc-utils) | 13 段 |
| `utils/debounce/`、`utils/throttle/` | [js-handwritten/misc-utils](./js-handwritten/misc-utils) | 同上 |
| `algorithm/learningJavaScriptDataStructsAndAlgorithms/sort/` | [algorithms/sort-implementations](./algorithms/sort-implementations) | 6 种排序 |
| `algorithm/.../search/`、`tree/binary-tree/` | [algorithms/search-and-tree](./algorithms/search-and-tree) | 二分、BST |
| `algorithm/leetCode/code/*.js`（31 题） | [algorithms/leetcode-solutions-1](./algorithms/leetcode-solutions-1)～[6](./algorithms/leetcode-solutions-6) | 完整题解 |
| `2025/07-out/`、`2024/08-out/` 进阶算法 | [algorithms/advanced-algorithms-2024-2025](./algorithms/advanced-algorithms-2024-2025) | 堆/并查集/背包等 |
| `JavaScript/typescript/test/ts-notes.md` | [typescript/notes](./typescript/notes) | TS 笔记 |
| `vuecore/reactivity.js`、`2025/01-out/vue3/` 等 | [vue/reactivity-implementations](./vue/reactivity-implementations) | 5 份实现 |
| `front-end-frame/vuejs/vuejs/core/array-method.md` | [vue/vue2-array-method](./vue/vue2-array-method) | 数组劫持 |
| `2025/05-out/koa/`、`2024/07-out/middleware/` 等 | [node/koa-and-http](./node/koa-and-http) | Koa/axios |
| `browser-work-principle/` | [browser-runtime](./browser-runtime) | 摘要 |
| `interview/frontEndOfInterview/README.md` | [frontend-roadmap](./frontend-roadmap) | 学习路线（仅资源索引） |

---

## 刻意不迁入（隐私 / 个人向）

| profile 来源 | 原因 |
|--------------|------|
| `interview/code/面试/面经/` | 个人面经记录 |
| `interview/面试题总结.js` | 个人整理笔记 |
| `interview/interview/vue.md` | 与 blog `interview/vue` 重复，且源自个人整理 |
| `algorithm/leetCode/code/myLeetCodeList.md` | 公司向刷题清单 |
| `interview/frontEndOfInterview/面试*.js` | 面经代码整理 |

---

## 已有 blog 专题（交叉链接，不重复迁移）

| profile 目录 | blog 位置 |
|--------------|-----------|
| `design-pattern/` | [design-patterns](../design-patterns/) · [backend/design-patterns](../backend/design-patterns/) |
| `server/learnJava/` | [backend/java](../backend/java/core-java/) |
| `learn-notes` 黑马 JavaWeb | [learn-notes](../learn-notes/) |
| LeetCode 专题页 | [data-structures-and-algorithms/leetcode](../data-structures-and-algorithms/leetcode/) |

---

## 保留在 profile、按需本地打开

| 类型 | 示例 | 原因 |
|------|------|------|
| 年月 HTML 实验页 | `2024/05-out/week3/*.html` | 交互 demo，非 Markdown |
| 第三方 clone | `front-end-frame/vuejs/vue2源码刨析/vuejs2.0/` | 体积大、非原创 |
| 含敏感信息 | `profile/README.md` | git 凭证 — **勿提交** |

---

## 重新生成 review 代码页

```bash
cd c:/learn/blog
node scripts/migrate-profile-to-review.mjs
```

---

## 下一步

- [复习库首页](./index)
- [后端路线图](../backend/roadmap)

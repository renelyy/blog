# JS 手写题速查

[← 返回索引](./index)

> 整理自 profile `JavaScript/JavaScript手写题/` 与 `utils/`，与 [interview/js](../interview/js/) 对照复习。
>
> **完整源码**已迁入分篇：[Array](./js-handwritten/array-methods) · [Function](./js-handwritten/function-methods) · [Object](./js-handwritten/object-methods) · [ES6](./js-handwritten/es6-methods) · [Ajax](./js-handwritten/ajax-jsonp) · [MyPromise](./js-handwritten/promise-mypromise) · [其他](./js-handwritten/misc-utils)

---

## ⭐ 防抖 debounce

**语义：** 连续触发只执行**最后一次**（或 leading 立即执行）。

```javascript
function debounce(fn, wait, immediate = false) {
  let timer
  return function (...args) {
    const ctx = this
    if (timer) clearTimeout(timer)
    if (immediate && !timer) {
      fn.apply(ctx, args)
    }
    timer = setTimeout(() => {
      if (!immediate) fn.apply(ctx, args)
      timer = null
    }, wait)
  }
}
```

带 `cancel`：见 profile `防抖节流/防抖函数debounce.js`。

---

## ⭐ 节流 throttle

**语义：** 固定时间间隔内最多执行一次。

```javascript
function throttle(fn, delay) {
  let last = 0
  return function (...args) {
    const now = Date.now()
    if (now - last >= delay) {
      last = now
      fn.apply(this, args)
    }
  }
}
```

---

## ⭐ 深拷贝（面试版）

```javascript
function deepClone(val, cache = new WeakMap()) {
  if (val === null || typeof val !== 'object') return val
  if (val instanceof Date) return new Date(val)
  if (val instanceof RegExp) return new RegExp(val)
  if (cache.has(val)) return cache.get(val)

  const res = Array.isArray(val) ? [] : {}
  cache.set(val, res)
  for (const key of Reflect.ownKeys(val)) {
    if (Object.prototype.hasOwnProperty.call(val, key)) {
      res[key] = deepClone(val[key], cache)
    }
  }
  return res
}
```

完整版（含 DOM 等）：见 [Object 篇](./js-handwritten/object-methods)。

---

## ⭐ 手写 new

```javascript
function myNew(Constructor, ...args) {
  const obj = Object.create(Constructor.prototype)
  const ret = Constructor.apply(obj, args)
  return ret instanceof Object ? ret : obj
}
```

---

## ⭐ 手写 instanceof

```javascript
function myInstanceof(obj, Constructor) {
  let proto = Object.getPrototypeOf(obj)
  const prototype = Constructor.prototype
  while (proto) {
    if (proto === prototype) return true
    proto = Object.getPrototypeOf(proto)
  }
  return false
}
```

---

## ⭐ call / apply / bind

```javascript
Function.prototype.myCall = function (ctx, ...args) {
  ctx = ctx ?? globalThis
  const key = Symbol('fn')
  ctx[key] = this
  const ret = ctx[key](...args)
  delete ctx[key]
  return ret
}

Function.prototype.myBind = function (ctx, ...preset) {
  const fn = this
  return function (...args) {
    return fn.apply(ctx, [...preset, ...args])
  }
}
```

---

## ⭐ 数组转树

```javascript
function arrayToTree(list, rootId = null) {
  const map = new Map(list.map(item => [item.id, { ...item, children: [] }]))
  const roots = []
  for (const node of map.values()) {
    if (node.parentId === rootId) {
      roots.push(node)
    } else {
      const parent = map.get(node.parentId)
      parent?.children.push(node)
    }
  }
  return roots
}
```

递归版：profile `其他/数组转树.js`。

---

## ⭐ 数组扁平化

```javascript
function flatten(arr, depth = Infinity) {
  return depth <= 0 ? arr : arr.reduce(
    (acc, cur) => acc.concat(Array.isArray(cur) ? flatten(cur, depth - 1) : cur),
    []
  )
}
// 或 arr.flat(depth)
```

---

## ⭐ 发布订阅 EventEmitter

```javascript
class EventEmitter {
  #events = new Map()
  on(type, fn) {
    if (!this.#events.has(type)) this.#events.set(type, new Set())
    this.#events.get(type).add(fn)
    return () => this.off(type, fn)
  }
  off(type, fn) {
    this.#events.get(type)?.delete(fn)
  }
  emit(type, ...args) {
    this.#events.get(type)?.forEach(fn => fn(...args))
  }
}
```

---

## ⭐ Promise 简易版

状态：`pending → fulfilled | rejected`，`then` 异步、支持链式。

完整实现：profile `Promise篇/MyPromise.js`（含 `resolvePromise` 与 A+ 简化）。

---

## ⭐ 并发控制（批量请求）

```javascript
async function pool(limit, tasks) {
  const ret = []
  const executing = new Set()
  for (const task of tasks) {
    const p = Promise.resolve().then(task).then(v => {
      executing.delete(p)
      return v
    })
    ret.push(p)
    executing.add(p)
    if (executing.size >= limit) {
      await Promise.race(executing)
    }
  }
  return Promise.all(ret)
}
```

profile：`2022/01-out/异步控制并发数.js`。

---

## ⭐ sleep

```javascript
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
```

---

## 📌 按专题在 profile 中的位置

| 专题 | profile 路径 |
|------|----------------|
| Array | `JavaScript/JavaScript手写题/Array篇/` |
| Function | `Function篇/`（call/bind/柯里化） |
| Object | `Object篇/`（new/create/继承） |
| Promise | `Promise篇/MyPromise.js` |
| ajax/jsonp | `ajax与jsonp/` |

更全题目列表 → [Array / Function / Object 分篇](./js-handwritten/array-methods)。

---

## 下一步

- [算法模式笔记](./algorithm-patterns)
- [LeetCode 题解](./algorithms/leetcode-solutions-1)

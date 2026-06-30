# Vue2 数组方法劫持笔记

[← 返回索引](../index.md)

> 迁移自 `profile/front-end-frame/vuejs/vuejs/core/array-method.md`

---

1. slice 方法返回一个新的数组对象，这一对象是由 begin 和 end 决定的原数组的浅拷贝
（包括 begin 不包括 end），原始数组不会被改变
```js
let a = [1, 3, 2, 5, 8]
let b = a.slice() // [1, 3, 2, 5, 8]
let c = a.slice(0, 3) // [1, 3, 2]
```
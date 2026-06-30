# 浏览器与运行时

[← 返回索引](./index)

> 整理自 profile `browser-work-principle/`、`essay.md` 浏览器内核表。

---

## ⭐ 浏览器内核一览

| 浏览器 | 渲染引擎 | JS 引擎 |
|--------|----------|---------|
| Chrome | Blink（原 WebKit） | V8 |
| Firefox | Gecko | SpiderMonkey |
| Safari | WebKit | JavaScriptCore (Nitro) |
| Edge | Blink | V8 |
| IE | Trident | — |

**渲染引擎：** HTML/CSS 解析 → DOM/CSSOM → 布局 → 绘制 → 合成。  
**JS 引擎：** 解析、编译（Ignition）、优化（TurboFan）、GC。

---

## ⭐ 作用域链（profile 经典题）

```javascript
var myName = '极客时间'
function foo() {
  var myName = '极客邦'
  bar()
}
function bar() {
  console.log(myName)  // 极客时间 — bar 的词法环境在全局
}
foo()
```

**结论：** 作用域链由**词法作用域**决定，与调用栈位置无关。

**块级作用域：** `let`/`const` 在块内有效；`var` 函数级。  
profile 完整示例：`scope-chains-and-closures.js`。

---

## ⭐ 闭包

函数 + 能访问的外层词法环境 = 闭包。

**用途：** 私有状态、工厂、模块、防抖节流闭包持有 timer。

**注意：** 循环 + `var` + 异步 → 经典错题，用 `let` 或 IIFE。

---

## ⭐ 事件循环（与面试清单对照）

```text
渲染主线程
  ↓ 取队列任务执行
微队列（Promise、MutationObserver）— 优先级最高
交互队列（用户事件）
延时队列（setTimeout/setInterval）
```

- 任务**无**优先级，队列**有**优先级
- `setTimeout(0)` 仍受最小延迟与嵌套 4ms 限制
- **同步长任务**（while 循环）阻塞渲染 — profile 面试题 §「为何会阻碍渲染」

详见 [browser-runtime](./browser-runtime) 事件循环小节。

---

## ⭐ this 指向速记

| 调用方式 | this |
|----------|------|
| 独立函数 | 严格模式 undefined / 非严格 global |
| 对象方法 | 对象 |
| call/apply/bind | 指定 |
| new | 新对象 |
| 箭头函数 | 词法 this（定义处） |

---

## 📌 profile 源码

| 文件 | 内容 |
|------|------|
| `browser-work-principle/scope-chains-and-closures.js` | 作用域链 + 闭包 |
| `browser-work-principle/this.js` | this 练习 |
| [interview/browser](../interview/browser) | 浏览器面试题 |

---

## 下一步

- [JS 手写题速查](./js-handwritten-cookbook)
- [前端复习路线](./frontend-roadmap)

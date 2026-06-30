# JS 对象与继承

[← 返回索引](./index)

> 整理自 profile `essay.md`，配合《JavaScript 高级程序设计》复习。

---

## ⭐ 解构与 ToObject

解构在内部调用 `ToObject`，**null / undefined 不能解构**：

```javascript
let { length } = 'foobar'        // 6
let { constructor: c } = 4       // c === Number
let { _ } = null                 // TypeError
```

---

## ⭐ 创建对象的几种模式

### 工厂模式

解决「创建多个类似对象」，但**无法识别类型**（`instanceof` 无意义）。

### 构造函数模式

`new` 执行步骤：

1. 创建新对象
2. 新对象 `[[Prototype]]` 指向构造函数 `prototype`
3. `this` 绑定新对象
4. 执行构造函数体
5. 若构造函数返回对象则用之，否则返回新对象

**问题：** 方法在每个实例上重复创建；方法挂全局则污染作用域。

### 原型模式

- 每个函数有 `prototype`，默认带 `constructor` 指回构造函数
- 实例 `[[Prototype]]` 指向构造函数 `prototype`
- 查找：实例 → 原型链 → `null`
- `hasOwnProperty` vs `in` vs `for-in` vs `Object.keys()`

**枚举顺序：**

- 不确定：`for-in`、`Object.keys()`
- 确定（先数值键升序，再插入顺序的字符串/符号）：`getOwnPropertyNames`、`getOwnPropertySymbols`、`Object.assign`

**原型模式的问题：**

1. 弱化向构造函数传参 — 所有实例默认同属性值
2. **引用值在原型上共享** — 一改全改

---

## ⭐ 继承方式对比

| 方式 | 优点 | 缺点 |
|------|------|------|
| **原型链** | 简单 | 引用共享；子类不能给父类传参 |
| **盗用构造函数** | 可传参；实例属性独立 | 方法不能重用；不能访问父类原型方法 |
| **组合继承** | 属性用盗用构造，方法用原型链 | 父类构造函数调两次 |
| **原型式** | `Object.create(o)` 规范化了 | 类似原型问题 |
| **寄生式** | 在副本上增强 | 方法无法复用 |
| **寄生组合** | 只调一次父类构造 | 写法稍复杂 — **最优经典方案** |

### 组合继承（伪经典）

```javascript
function SuperType(name) {
  this.name = name
  this.colors = ['red', 'green']
}
SuperType.prototype.sayName = function () {
  console.log(this.name)
}

function SubType(name, age) {
  SuperType.call(this, name)  // 继承属性
  this.age = age
}
SubType.prototype = new SuperType()  // 继承方法
SubType.prototype.constructor = SubType
```

### 寄生组合继承

```javascript
function inheritPrototype(subType, superType) {
  const prototype = Object.create(superType.prototype)
  prototype.constructor = subType
  subType.prototype = prototype
}
```

---

## ⭐ ES6 类

- 类声明 / 类表达式 — **不会提升**（与函数声明不同）
- 类受**块级作用域**限制
- 可含：构造、实例方法、getter/setter、静态方法

---

## ⭐ Vue2 与响应式（profile 笔记）

| 问题 | 说明 |
|------|------|
| 大对象递归遍历 | 初始化性能差 |
| 新增/删除属性 | 无法响应 |
| 数组 | 需额外 API |
| 修改方式 | 语法有限制 |

→ Vue3 `Proxy` 部分解决。见 [Vue3 面试](../interview/vue/vue3)。

---

## 下一步

- [手写题速查](./js-handwritten-cookbook)
- [Proxy 与 Vue2 局限](./proxy-vue2-notes)

# Function 篇手写题

[← 返回索引](../index.md)

> call/apply/bind/柯里化/链式调用

---

## apply

> 来源：`profile/JavaScript/JavaScript手写题/Function篇/apply.js`

```javascript
Function.prototype._apply = function (thisArg, ...args) {
  thisArg = thisArg
  thisArg.fn = this

  let result
  if (!args) {
    result = thisArg.fn()
  } else {
    let argslist = []
    for (let i = 0, len = args.length; i < len; i++) {
      argslist.push('args[' + i + ']')
    }
    result = eval('thisArg.fn(' + argslist + ')')
  }
  delete thisArg.fn
  return result
}

let foo = function () {
  console.log(arguments)
}

foo._apply(null, 1, 2)
```

---

## bind

> 来源：`profile/JavaScript/JavaScript手写题/Function篇/bind.js`

```javascript
/**
 * @description 手写 bind 方法
 *
 * MDN Web Docs
 * bind() 方法创建一个新的函数，在 bind() 被调用时，这个新函数
 * 的 this 被指定为 bind() 的第一个参数，而其余参数将作为新函数
 * 的参数，供调用时使用。
 *
 * @param {Object} thisArg
 * @param {*} arg1
 * @param {*} arg2
 * @param {*} argn
 * @returns 返回一个原函数的拷贝，并拥有指定的 this 值和初始参数
 */
Function.prototype.myBind = function (context) {
  let self = this;
  let thisArg = arguments[0];
  // let args = [...arguments].slice(1)
  let args = Array.prototype.slice.call(arguments, 1);
  let fNOP = function () {};
  let fBound = function () {
    let bindArgs = Array.prototype.slice.call(arguments);
    return self.apply(
      this instanceof fNOP ? this : context,
      args.concat(bindArgs)
    );
  };
  fNOP.prototype = this.prototype;
  fBound.prototype = new fNOP();
  return fBound;
};

// 2023-07 OUTPUT
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== 'function') {
      // 与 ECMAScript 5 最接近的
      // 内部 IsCallable 函数
      throw new TypeError(
        'Function.prototype.bind - what is trying ' +
          'to be bound is not callable'
      );
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
      fToBind = this,
      fNOP = function () {},
      fBound = function () {
        return fToBind.apply(
          this instanceof fNOP && oThis ? this : oThis,
          aArgs.concat(Array.prototype.slice.call(arguments))
        );
      };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    return fBound;
  };
}
```

---

## call

> 来源：`profile/JavaScript/JavaScript手写题/Function篇/call.js`

```javascript
// 不考虑严格模式的简单写法
Function.prototype._not_strict_call = function (ctx, ...args) {
  if (ctx === null || ctx === undefined) {
    ctx = (function () {
      return this;
    })();
  }
  if (typeof ctx === 'string') {
    ctx = new String(ctx);
  } else if (typeof ctx === 'number') {
    ctx = new Number(ctx);
  } else if (typeof ctx === 'boolean') {
    ctx = new Boolean(ctx);
  }
  const uniqueKey = Symbol();
  // 此处 this 和 第 5 行返回的 this 并非同一个 this。此处是***方法***本身
  ctx[uniqueKey] = this;
  const result = ctx[uniqueKey](...args);
  delete ctx[uniqueKey];
  return result;
};

/**
 * @description 实现 call
 * @param {Object} thisArg
 *   可选的。在 function 函数运行时使用的 this 值。请注意，this可能不是该方法看到的实际值：
 *      - 非严格模式
 *        - 原始值会被包装
 *        - 指定为 null 或 undefined 时会自动替换为指向全局对象
 *      - 严格模式
 *        - 不指定第一个参数，this 的值将会是 undefined
 * @param {Any} arg1
 * @param {Any} arg2
 * @param {Any} arg...
 * @returns {Any} 使用调用者提供的 this 值和参数调用该函数的返回值。若该方法没有返回值，则返回 undefined。
 */
Function.prototype.myCall = function () {
  // 由于目标函数的实参数量是不定的，这里就不写形参了
  // 实际上通过 arugments 对象，我们能拿到所有实参
  // 第一个参数是绑定的this
  let thisArg = arguments[0];
  // 接着要判断是不是严格模式
  const isStrict = (function () {
    return this === undefined;
  })();
  if (!isStrict) {
    // 如果在非严格模式下，thisArg 的值是 null 或 undefined，需要将 thisArg 置为全局对象
    // 这块也可以不加，因为后面方法调用默认也是 全局对象
    // 但是可以参考获取全局对象的兼容性写法
    if (thisArg === null || thisArg === undefined) {
      // 获取全局对象时兼顾浏览器环境和Node环境
      thisArg = (function () {
        return this;
      })();
    }
    // 如果是其他原始值，需要通过构造函数包装成对象
    let thisArgType = typeof thisArg;
    if (thisArgType === 'number') {
      thisArg = new Number(thisArg);
    } else if (thisArgType === 'string') {
      thisArg = new String(thisArg);
    } else if (thisArgType === 'boolean') {
      thisArg = new Boolean(thisArg);
    }
  }

  // 截取从索引1开始的剩余参数
  let invokeParams = [...arguments].slice(1);
  // 接下来要调用目标函数，那么如何获取到目标函数呢？
  // 实际上this就是目标函数，因为 __call 是作为一个方法被调用的，this当然指向调用对象，而这个对象就是目标函数
  // 这里做这么一个赋值过程，是为了让语义更清晰一点
  const invokeFunc = this;
  // 此时如果 thisArg 对象仍然是 null 或 undefined，那么说明是在严格模式下，并且没有指定第一个参数或者第一个参数的
  // 值本身就是 null 或 undefined，此时将目标函数当成普通函数执行并返回其结果即可
  if (thisArg === null || thisArg === undefined) {
    // 严格模式调用
    return invokeFunc(...invokeParams);
  }
  // 否则，让目标函数成为thisArg对象的成员方法，然后调用它
  // 直观上来看，可以直接把目标函数赋值给对象属性，比如func属性，但是可能func属性本身就存在于thisArg对象上
  // 所以，为了防止覆盖掉thisArg对象的原有属性，必须创建一个唯一的属性名，可以用Symbol实现，如果环境不支持Symbol，
  // 可以通过uuid算法来构造一个唯一值。
  let uniquePropName = Symbol(thisArg);
  thisArg[uniquePropName] = invokeFunc;
  let result = thisArg[uniquePropName](...invokeParams);
  // 执行后删除新增属性
  delete thisArg[uniquePropName];
  // 返回目标函数执行的结果
  return result;
};

const global = (function () {
  return this;
})();

// node 环境
console.log(global === this); // false
console.log(this) // {}

// 浏览器环境
console.log(global === this) // true
console.log(this) // Window { ... }
```

---

## 偏函数

> 来源：`profile/JavaScript/JavaScript手写题/Function篇/偏函数.js`

```javascript
/**
 * @description 偏函数
 * 什么是偏函数？偏函数就是将一个 n 参的函数转换成固定 x 参的函数，
 * 剩余参数（n - x）将在下次调用全部传入。
 */
function partial(fn, ...args) {
  return (...innerArgs) => {
    return fn(...args, ...innerArgs)
  }
}

function add(a, b, c) {
  return a + b + c
}
let partialAdd = partial(add, 1)
console.log(partialAdd(2, 3))
```

---

## 实现柯里化

> 来源：`profile/JavaScript/JavaScript手写题/Function篇/实现柯里化.js`

```javascript
// 什么叫函数柯里化？
// 其实就是将使用多个参数的函数转换成一系列使用
// 一个参数的函数的技术。

// curry 的这种用途可以理解为：参数复用。
// 本质上是降低通用性，提高适用性。

// 第一版
{
  const curry = function (fn) {
    let args = Array.from(arguments).slice(1)
    return function () {
      let innerArgs = args.concat(Array.from(arguments))
      return fn.apply(this, innerArgs)
    }
  }

  function add(x, y) {
    return x + y
  }

  // TEST DEMO
  {
    // usage 1
    {
      let addCurry = curry(add, 1, 2)
      console.log(addCurry())
    }
    // usage 2
    {
      let addCurry = curry(add, 1)
      console.log(addCurry(2))
    }
    // usage 3
    {
      let addCurry = curry(add)
      console.log(addCurry(1, 2))
    }
  }
}

// 第二版
{
  // 第二版
  function sub_curry(fn) {
    let args = [].slice.call(arguments, 1)
    return function () {
      return fn.apply(this, args.concat([].slice.call(arguments)))
    }
  }

  function curry(fn, length) {
    length = length || fn.length

    let slice = Array.prototype.slice

    return function () {
      if (arguments.length < length) {
        let combined = [fn].concat(slice.call(arguments))
        console.log(combined)
        return curry(sub_curry.apply(this, combined), length - arguments.length)
      } else {
        return fn.apply(this, arguments)
      }
    }
  }

  // TEST DEMO
  {
    let fn = curry(function (a, b, c) {
      return [a, b, c]
    })

    console.log(fn('a', 'b', 'c')) // ["a", "b", "c"]
    console.log(fn('a', 'b')('c')) // ["a", "b", "c"]
    console.log(fn('a')('b')('c')) // ["a", "b", "c"]
    console.log(fn('a')('b', 'c')) // ["a", "b", "c"]
  }
  {
    const curry = function (fn) {
      let judge = (...args) => {
        if (args.length === fn.length) return fn(...args)
        return (...arg) => judge(...args, ...arg)
      }
      return judge
    }
    let fn = curry(function (a, b, c) {
      return [a, b, c]
    })

    console.log(fn('a', 'b', 'c')) // ["a", "b", "c"]
    console.log(fn('a', 'b')('c')) // ["a", "b", "c"]
    console.log(fn('a')('b')('c')) // ["a", "b", "c"]
    console.log(fn('a')('b', 'c')) // ["a", "b", "c"]
  }
}

// 第三版
{
  const curry = function (fn) {
    const judge = (...args) => {
      if (args.length === fn.length) return fn(...args)
      return (...arg) => judge(...args, ...arg)
    }
    return judge
  }
}

function curry(fn) {
  const judge = (...args) => {
    if (args.length === fn.length) return fn(...args)
    return (...arg) => judge(...args, ...arg)
  }
  return judge
}
```

---

## 实现链式调用

> 来源：`profile/JavaScript/JavaScript手写题/Function篇/实现链式调用.js`

```javascript
/**
 * @description 实现链式调用
 * 链式调用的核心就在于调用完的方法将自身实例返回
 */
// 示例 1
{
  function Class1() {
    console.log('初始化')
  }
  Class1.prototype.method = function (params) {
    console.log(params)
    return this
  }
  let c1 = new Class1()
  c1.method('第一次调用').method('第二次链式调用').method('第三次链式调用')
}
// 示例 2
{
  let obj = {
    a: function () {
      console.log('a')
      return this
    },
    b: function () {
      console.log('b')
      return this
    },
  }
  obj.a().b()
}
```

---


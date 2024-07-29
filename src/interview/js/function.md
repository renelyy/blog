# 函数原型方法

## call

```javascript
// 模拟 call
// 实现 call 之前，我们首先要知道它做了哪些事情
// 1. 改变了 this 的指向
// 2. 返回函数的执行结果
Function.prototype.call = function (context, ...args) {
  // 1. 如果 context 为 null 或 undefined，则将其设置为全局对象（浏览器中为 window）
  context = context || window;

  // 2. 将当前函数设置为 contex t的一个属性
  const fn = Symbol('fn');
  context[fn] = this;

  // 3. 执行函数拿到结果
  let result = context[fn](...args);

  // 4. 删除新增的属性
  delete context[fn];

  // 5. 返回结果
  return result;
};
```

## apply

```javascript
// 模拟 apply
Function.prototype.myApply = function (context, args) {
  context = context || window;

  const fnKey = Symbol();
  context[fnKey] = this;

  let ret = context[fnKey](...args);
  // 一般是直接执行，像下面的代码也是可以的，但是有安全性和效率等方面的问题，因此不推荐
  // let ret = eval('context[fnKey](...args)');
  // 或者更为古老的方式
  // let args = [];
  // for (let i = 1, len = arguments.length; i < len; i++) {
  //   args.push('arguments[' + i + ']');
  // }
  // let result = eval('context[fn](' + args + ')');

  delete context[fnKey];

  return ret;
};
```

## bind

```javascript
// Function 实例的 bind() 方法创建一个新函数，当调用该新函数时，它会调用原始函数并
// 将其 this 关键字设置为给定的值，同时，还可以传入一系列指定的参数，这些参数会插入
// 到调用新函数时传入的参数的前面。

// 语法：bind(thisArg, arg1, arg2, ..., argn)
// 参数：thisArg
// 1. 如果函数不在严格模式下，null 和 undefined 会被替换为全局对象，并且原始值会被转换
// 为对象。
// 2. 如果使用 new 运算符构造绑定函数，则忽略该值。
// 3. 对已经绑定的函数再次绑定，再次绑定的 thisArg 会被忽略

// 模拟 bind
// 实现 bind 之前，我们首先要知道它做了哪些事情
// 1. 返回一个函数
// 2. 对于普通函数，绑定 this 指向
// 3. 对于构造函数，要保证原函数的原型对象上的属性不能丢失
//    绑定函数还会继承目标函数的原型链。
Function.prototype.bind = function (context, ...args) {
  const self = this;

  const fBound = function () {
    const bindArgs = Array.prototype.slice.call(arguments);
    return self.apply(
      // this instanceof self 判断是否使用 new 来调用函数
      // 如果是 new 来调用，this 指向实例，否则指向传入的 context
      // 因为外部通过 new 调用时，构造函数会自动返回 this 实例
      // 因此内部不必特意 return new Ctor();
      this instanceof self ? this : context,
      args.concat(bindArgs)
    );
  };
  // 只要外部通过 new 调用 fBound，这一行奠定了 28 行 this instance self = true
  // fBound 的原型指向了 self 的原型
  fBound.prototype = Object.create(self.prototype);

  return fBound;
};

// 测试
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.sayName = function (otherName, message) {
  console.log(this.name);
  console.log('other name is ', otherName);
  console.log('message is ', message);
};

const person = new Person('张三', 18);
const boundSayName = person.sayName.bind({ name: '李四' }, 'yangtao');
boundSayName('renel');
// 输出
// 李四
// other name is yangtao
// message is renel

// 测试
let obj = {
  value: 1
};

function Foo(name, age) {
  this.name = name;
  this.age = age;
}

Foo.prototype.sayName = function () {
  console.log('this', this);
  console.log(this.name);
};

let foo = new Foo('John', 20);
let BindFoo = Foo.myBind(obj, 'Mike', 30);

let ret = new BindFoo();
console.log(ret); // fBound: { name: 'Mike', age: 30 }
console.log(ret instanceof BindFoo); // true
console.log(ret instanceof Foo); // true
```

# 防抖节流

## 函数防抖

### 探索和理解阶段

```javascript
/**
 * @description 防抖
 * 在一定时间间隔内，再次触发会清空定时器，并重新计时，结束后输出一次结果
 * 应用场景
 *  - 监听浏览器窗口 resize 操作 - 防抖（只需计算一次）
 *  - 键盘文本输入的验证 - 防抖（连续输入文字后发送请求进行验证，验证一次就好）
 *  - 提交表单 - 防抖（多次点击变为一次）
 */
export const debounce = (cb, delay) => {
  let timer = null;
  return function () {
    let args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => {
      cb.apply(this, args);
    }, delay);
  };
};
```

### 完整实现

```javascript
/**
 * @description 防抖
 * 原理：利用定时器，如果在规定时间内再次触发事件会将上次的定时器
 * 清除，即不会执行函数，并重新设置一个新的定时器，直到超过规定时间
 * 自动触发定时器中的函数
 * @param {Function} cb 回调
 * @param {Number} delay 延迟
 * @param {Object} options immediate 为是否在进入时立即执行一次
 * @returns {Function}
 */
const debounce = (
  cb,
  delay = 17,
  options = {
    immediate: true,
    ctx: null
  }
) => {
  let timer;
  const _debounce = function (...args) {
    if (timer) {
      clearTimeout(timer);
    }
    if (options.immediate && !timer) {
      // 这一行 只需第一次进入即可
      // 总不能设置用户传入的 immediate = false 吧
      // 所以只能委屈下咋们自己的 timer 了，随便设置一个定时器，让其后续进入 else
      timer = setTimeout(null, delay);
      cb.apply(options.ctx, args);
    } else {
      timer = setTimeout(() => {
        cb.apply(options.ctx, args);
        /**
         * 用户停止触发动作，间隔时间后，触发函数
         * 如果此处设置 timer = null 表明下次触发重新刷新了 immediate
         * 所以设置不设置看场景，看需要
         */
        timer = null;
      }, delay);
    }
  };

  _debounce.cancel = function () {
    clearTimeout(timer);
    timer = null;
  };

  return _debounce;
};
```

## 函数节流

### 探索和理解阶段

```javascript
/**
 * @description 手写一个节流函数 throttle
 *
 * debounce 与 throttle 是开发中常用的高阶函数，作用都是为了防止函数被高频调用，
 * 换句话说就是，用来控制某个函数在一定时间内执行多少次。
 *
 * 防抖 （debounce） ：多次触发，只在最后一次触发时，执行目标函数。
 * 节流（throttle）：限制目标函数调用的频率，比如：1s内不能调用2次。
 */

// 第一种是用时间戳来判断是否已到执行时间，记录上次执行的时间戳，
// 然后每次触发事件执行回调，回调中判断当前时间戳距离上次执行时间
// 戳的间隔是否已经达到时间差（Xms） ，如果是则执行，并更新上次执
// 行的时间戳，如此循环。

// 通过闭包保存一个 previous 变量，每次触发 throttle 函数时判
// 断当前时间和 previous 的时间差，如果这段时间差小于等待时间，
// 那就忽略本次事件触发。如果大于等待时间就把 previous 设置为当
// 前时间并执行函数 fn。
function thinking1_throttle(fn, await = 50) {
  // 上一次执行该函数的时间
  let previous = 0;
  return function (...args) {
    let now = +new Date();
    if (now - previous > await) {
      previous = now;
      // 执行 fn 函数
      fn.apply(this, args);
    }
  };
}

// 第二种方法是使用定时器，比如当 scroll 事件刚触发时，打印一个
// hello world，然后设置个 1000ms 的定时器，此后每次触发 scroll
// 事件触发回调，如果已经存在定时器，则回调不执行方法，直到定时器触发，
// handler 被清除，然后重新设置定时器。
function thinking2_throttle(fn, await = 50) {
  let timer;
  if (timer) return;
  return function (...args) {
    timer = setTimeout(() => {
      timer = null;
      fn.apply(this, args);
    }, await);
  };
}

/**
 * @description 节流
 * 每隔一段时间执行一次 即按照特定的频率执行
 * 应用场景
 *  - 监听 scroll、mousemove 等事件 - 节流（每隔一秒计算一次位置）
 */
export const throttle = (cb, delay) => {
  let timer = null;
  return function () {
    if (timer) return;
    let args = arguments;
    timer = setTimeout(() => {
      timer = null;
      cb.apply(this, args);
    }, delay);
  };
};
```

### 完整实现

```javascript
/**
 * @description 节流
 * @param {*} cb
 * @param {*} delay
 * @param {*} options
 *    leading 为是否在进入时立即执行一次
 *    trailing 是否在最后额外触发一次
 * @returns
 */
const throttle = (
  cb,
  delay = 17,
  options = {
    leading: true,
    trailing: false,
    ctx: null
  }
) => {
  let previous = 0;
  let timer;
  const _throttle = function (...args) {
    let now = new Date().getTime();
    if (!options.leading) {
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        cb.apply(options.ctx, args);
      }, delay);
    } else if (now - previous > delay) {
      cb.apply(options.ctx, args);
      previous = now;
    } else if (options.trailing) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        cb.apply(options.ctx, args);
      }, delay);
    }
  };
  _throttle.cancel = () => {
    previous = 0;
    clearTimeout(timer);
    timer = null;
  };
  return _throttle;
};
```

# 其他

## 函数柯里化

```javascript
// 柯里化是将接受多个参数的函数转换为一系列只接受单个参数的函数的过程。
// 这种转换过程通过闭包来实现，其目的是为了创建一个可以记住之前传入的参数的新
// 函数。这样做的结果是，原始函数的参数被分解为一系列更简单、更易于组合的函数
function curry(fn) {
  const curried = function (...args) {
    if (args.length >= fn.length) return fn(...args);
    return (...arg) => curried(...args, ...arg);
  };
  return curried;
}

function add(x, y, z) {
  return x + y + z;
}

const curriedAdd = curry(add);
let ret = curriedAdd(1)(2)(3);
console.log(ret); // 6
```

## 偏函数

```javascript
// 什么是偏函数？
// 偏函数（Partial Function）是指通过固定函数的部分参数，从而创建一个新的函数的过程。
// 这个新函数接受剩余的参数并在原始函数上调用它们。即将一个 n 个参的函数转换成固定 x
// 参的函数，剩余参数（n - x）将在下次调用全部传入。

// 偏函数的主要优点是可以减少重复的代码，提高代码的可重用性。它允许你在多次调用中共享
// 相同的参数，而不需要在每次调用时都重复提供它们。

// 示例 1
// 原始函数，接受三个参数
function multiply(x, y, z) {
  return x * y * z;
}

// 创建一个偏函数，固定第一个参数为 2
const partialMultiply = multiply.bind(null, 2);

// 调用偏函数
// 相当于调用 multiply(2, 3, 4)，结果为 2 * 3 * 4 = 24
const result1 = partialMultiply(3, 4);
// 相当于调用 multiply(2, 5, 6)，结果为 2 * 5 * 6 = 60
const result2 = partialMultiply(5, 6);

// 在这个例子中，通过使用 bind 方法，创建了一个新的函数 partialMultiply，它固定了
// 原始函数 multiply 的第一个参数为 2。然后，我们可以在后续的调用中，只传递剩余的参数，
// 而不必每次都提供 2。这样就实现了偏函数的效果。

// 手动实现偏函数
// 偏函数不仅可以使用 bind 方法来创建，还可以使用其他方法，比如手动封装一个新函数
function partial(fn, ...args) {
  return function (...restArgs) {
    return fn.apply(this, args.concat(restArgs));
  };
}

function add(x, y, z) {
  return x + y + z;
}

let addPartial = partial(add, 1, 2);
let ret = addPartial(3);
console.log(ret); // 6
```

## sleep 函数

```javascript
// 在 JavaScript 中，由于单线程的特性，没有内置的 sleep 函数可以直接暂停
// 程序的执行。然而，可以使用 setTimeout 函数来模拟实现一个 sleep 函数，
// 让程序在指定的时间后继续执行。
// 使用 setTimeout 实现 sleep 函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 使用示例
async function example() {
  console.log('开始');
  await sleep(2000); // 暂停 2 秒
  console.log('2 秒后');
}

example();
```

## 实现 instanceof

```javascript
// 实现 instanceof
function myInstanceof(obj, constructor) {
  if (constructor === null) {
    throw new TypeError('Right-hand side of ' instanceof ' is not an object');
  }
  // 基本数据类型直接返回 false
  if (typeof obj !== 'object' || obj === null) return false;

  // 获取对象的原型
  let proto = Object.getPrototypeOf(obj);
  // 循环遍历原型链
  while (proto !== null) {
    // 如果原型等于构造函数的原型，则返回 true
    if (proto === constructor.prototype) return true;
    // 否则继续向上查找原型链
    proto = Object.getPrototypeOf(proto);
  }
  // 如果没有找到匹配的原型，则返回 false
  return false;
}

// 测试
class Person {}
const person = new Person();
console.log(myInstanceof(person, Person)); // true
console.log(myInstanceof(person, Object)); // true（因为 Object 是所有对象的基类）
console.log(myInstanceof(person, Array)); // false

// 测试
console.log(myInstanceof([], Array)); // true
console.log(myInstanceof({}, Object)); // true
console.log(myInstanceof(null, Object)); // false
console.log(myInstanceof(123, Number)); // false
console.log(myInstanceof({}, null));
// TypeError: Right-hand side of 'instanceof' is not an object
```

# 链式调用

```javascript
// 提供了一个数组结构的 data，要求实现一个 query 方法，返回一个新的数组，
// query 方法内部有 过滤、排序、分组 等操作，并且支持链式调用，调用最终的
// execute 方法返回结果：

// const result = query(list)
//   .where(item => item.age > 18)
//   .sortBy('id')
//   .groupBy('name')
//   .execute();

// console.log(result);
function query(list) {
  // 复制一份数据，以免影响原始数据
  let ret = list.slice();

  return {
    where(fn) {
      ret = ret.filter(fn);

      return this;
    },
    sortBy(key) {
      ret = ret.sort((a, b) => a[key] - b[key]);

      return this;
    },
    groupBy(key) {
      ret = ret.reduce((p, c) => {
        // if (!p[c[key]]) p[c[key]] = [];
        // p[c[key]].push(c);
        (p[c[key]] || (p[c[key]] = [])).push(c);

        return p;
      }, {});
      ret = Object.values(ret);

      return this;
    },
    execute() {
      return ret;
    }
  };
}

const list = [
  { id: 1, name: '张三', age: 18 },
  { id: 8, name: '李四', age: 20 },
  { id: 3, name: '李四', age: 20 },
  { id: 5, name: '王五', age: 19 },
  { id: 4, name: '赵六', age: 21 },
  { id: 2, name: '钱七', age: 22 }
];

const result = query(list)
  .where(item => item.age > 18)
  .sortBy('id')
  .groupBy('name')
  .execute();

console.log(result);
```

## JSONP

> 面试题 1：请解释 JSONP 是什么，以及它是如何解决跨域问题的？

<!-- JSONP（JSON with Padding）是一种解决跨域数据访问问题的技术。由于浏览器的同源策略，AJAX 请求无法直接跨域访问数据。而 JSONP 通过动态插入<script>标签的方式，利用<script>标签不受同源策略限制的特性，从其他域的服务器加载并执行 JavaScript 代码，从而获取数据。具体来说，JSONP 会在客户端定义一个回调函数，并将该函数的名称作为参数传递给服务器。服务器在返回数据时，会将数据作为该回调函数的参数返回，从而实现了跨域数据访问。 -->

> 面试题 2：JSONP 有哪些优点和缺点？

1. JSONP 的优点包括：
   1. 可以绕过浏览器的同源策略，实现跨域数据访问
   2. 兼容性好，可以在老旧浏览器中使用
   3. 实现简单，易于理解和使用。
2. JSONP 也存在一些缺点：
   1. 仅支持 GET 请求，无法发送 POST 或其他类型的请求
   2. 存在安全风险，容易被恶意代码利用
   3. 依赖于回调函数，如果回调函数名称被恶意修改或覆盖，可能导致数据接收失败或数据被恶意利用。 > 面试题 3：在使用 JSONP 时，如何防止安全风险？
   <!--
   在使用 JSONP 时，需要注意以下几点来防止安全风险：<br />1）确保只从可信的服务器加载数据，避免从未知或不受信任的服务器加载数据；<br />2）在定义回调函数时，确保回调函数名称在全局作用域下是唯一的，避免与其他代码发生冲突；<br />3）在接收数据时，对数据进行验证和过滤，确保数据的完整性和安全性；<br />4）避免在回调函数中执行复杂的逻辑或敏感操作，以减少被恶意代码利用的风险。 -->

> 面试题 4：JSONP 和 CORS（跨来源资源共享）有什么区别？

<!-- JSONP 和 CORS 都是解决跨域问题的技术，但它们在实现方式和安全性方面有所不同。JSONP 通过动态插入<script>标签的方式绕过浏览器的同源策略，而 CORS 则是通过服务器设置响应头中的 Access-Control-Allow-Origin 字段来允许跨域请求。在安全性方面，CORS 提供了更强大的控制机制，允许服务器指定哪些域名可以访问其资源，从而减少了安全风险。而 JSONP 则相对较为简单，但也更容易受到恶意代码的攻击。 -->

> 面试题 5：请给出一个使用 JSONP 进行跨域数据访问的示例代码。

1. 简单的前端实现

```javascript
// 定义回调函数
function handleResponse(data) {
  console.log(data); // 处理返回的数据
}

// 创建script标签并设置src属性
var script = document.createElement('script');
script.src = 'https://example.com/api?callback=handleResponse'; // 假设这是跨域API的地址

// 将script标签添加到DOM中
document.body.appendChild(script);
```

<!-- 解释：<br>1. 首先定义了一个名为 handleResponse 的回调函数，用于处理服务器返回的数据。<br>2. 创建了一个<script>标签，并将其 src 属性设置为跨域 API 的地址，同时将回调函数的名称作为参数传递给服务器。<br>3. 将<script>标签添加到 DOM 中，浏览器会自动加载并执行该标签的 src 属性所指向的 JavaScript 代码。当服务器返回数据时，它会将数据作为 handleResponse 函数的参数返回给客户端，从而实现了跨域数据访问。 -->

2. 包含服务端的实现（JSONP 实现跨域数据访问需要服务端的支持）

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>封装 jsonp</title>
  </head>
  <body>
    <script>
      // JSONP 核心原理：script 标签不受同源策略约束，所以可以用来进行跨域请求，
      // 优点是兼容性好，但是只能用于 GET 请求；
      const jsonp = (url, params, callbackName) => {
        const generateUrl = () => {
          let dataUrl = `${url}?`;
          for (let key in params) {
            if (params.hasOwnProperty(key)) {
              dataUrl += `${encodeURIComponent(key)}=${encodeURIComponent(
                params[key]
              )}&`;
            }
          }
          dataUrl += `callback=${callbackName}`;

          return dataUrl;
        };

        return new Promise((resolve, reject) => {
          const scriptElement = document.createElement('script');
          scriptElement.src = generateUrl();
          document.body.appendChild(scriptElement);
          window[callbackName] = data => {
            resolve(data);
            document.body.removeChild(scriptElement);
          };
        });
      };

      jsonp('http://localhost:3000/api/aaa', { id: 2 }, 'getUserInfo').then(
        data => {
          console.log(data); // { name: 'renel', age: 18 }
        }
      );
    </script>
  </body>
</html>
```

```javascript
let http = require('http');
let url = require('url');

http
  .createServer((req, res) => {
    let urlobj = url.parse(req.url, true);
    console.log(urlobj);
    console.log(urlobj.query.callback);
    console.log(urlobj.pathname);
    switch (urlobj.pathname) {
      case '/api/aaa':
        res.end(
          `${urlobj.query.callback} (${JSON.stringify({
            name: 'renel',
            age: 18
          })})`
        );
        break;
      default:
        res.end('404');
    }
  })
  .listen(3000, () => {
    console.log('start');
  });
```

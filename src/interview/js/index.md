# JavaScript 常见面试题

## 1. ★★ JS 的数据类型？如何判断 JS 的数据类型?

在 JavaScript 中，数据类型包括原始类型和对象类型。

> 原始类型有以下 7 种：

1. 数字 (`number`)
2. 字符串 (`string`)
3. 布尔值 (`boolean`)
4. `null`
5. `undefined`
6. `Symbol` (ES6 新增)
7. `bigint` (ES2020 新增)

> 对象类型有以下几种：

1. 对象 (`Object`)
2. 数组 (`Array`)
3. 函数 (`Function`)
4. 日期 (`Date`)
5. 正则表达式 (`RegExp`)
6. 错误 (`Error`)
7. 集合 (`Set`, `WeakSet`)
8. 映射 (`Map`, `WeakMap`)
9. 布尔对象 (`Boolean`)
10. 数字对象 (`Number`)
11. 字符串对象 (`String`)

要判断一个值的数据类型，可以使用 typeof 运算符。例如：

```js
typeof 42; // "number"
typeof 'hello'; // "string"
typeof true; // "boolean"
typeof null; // "object" （注意这是一个历史遗留问题）
typeof undefined; // "undefined"
typeof Symbol(); // "symbol"
typeof {}; // "object"
typeof []; // "object"
typeof function () {}; // "function"
typeof new Date(); // "object"
typeof /regex/; // "object"
typeof new Error(); // "object"
```

::: tip
需要注意的是，`typeof null` 返回的是`object`，这是一个历史遗留问题。此外，`typeof` 对于函数返回的是`function`，而函数实际上也是对象类型的一种。
:::

::: warning 重复出现的相似问题：
1.js 中的基础类型和对象类型有什么不一样？
:::

## 2. 说一下 ES6 的新特性有哪些？

::: tip
ECMAScript 6（简称 ES6 或者 ES2015）是 JavaScript 的一次重大更新，引入了许多新特性。以下是 ES6 的一些新特性：
:::

1. `let` 和 `const` 关键字

   用于声明块级作用域的变量，替代了 `var` 关键字。

2. 箭头函数

   提供了一种更简洁的函数定义语法。

3. 类和继承

   引入了类的概念和 `extends` 关键字，提供了一种更面向对象的编程方式。

4. 模板字符串

   用反引号(``)包围的字符串，可以在其中嵌入表达式和变量，使得字符串拼接更加方便。

5. 解构赋值

   可以方便地从对象或数组中提取数据，并赋值给变量。

6. 展开运算符

   用于展开数组或对象，方便地进行合并或复制操作。

7. `Promise`

   提供了一种更优雅的异步编程方式，避免了回调地狱的问题。

8. `async/await`

   建立在 `Promise` 之上，提供了一种更易读、易写的异步编程方式。

9. 函数默认值和可变参数

   函数可以指定默认参数值，同时也支持可变参数。

10. 块级作用域

    ES6 引入了块级作用域的概念，可以通过 `let` 和 `const` 关键字声明块级作用域的变量。

> 总结：除此之外，ES6 还引入了很多其他新特性，例如 `Map` 和 `Set` 数据结构、`Symbol` 数据类型、`Generator` 函数、模块化等等。这些新特性大大提高了 JavaScript 的编程能力和开发效率，同时也使得 JavaScript 可以处理更加复杂的应用场景。

## 3. let、const、var 三者有什么区别？

::: tip
`let`、`const`、`var` 是 JavaScript 中用来声明变量的关键字，它们之间有以下几个区别：
:::

1. 变量作用域

   `var` 声明的变量是函数级作用域，`let` 和 `const` 声明的变量是块级作用域。块级作用域可以在包含块的范围内访问，而函数级作用域只能在函数内访问。

2. 变量提升

   `var` 声明的变量存在变量提升，即变量可以在声明之前使用，但是其值为 undefined。而 `let` 和 `const` 声明的变量不会存在变量提升，如果在声明之前使用会报错。

3. 重复声明

   var 可以被重复声明，而 `let` 和 `const` 不能重复声明。

4. 可变性

   `let` 声明的变量可以被重新赋值，`const` 声明的变量不能被重新赋值，但是它们所声明的对象或数组可以修改。

> 总结：综上所述，建议在声明变量时优先考虑使用 `let` 和 `const`，因为它们更符合现代 JavaScript 的开发标准。同时，也要注意在不同情况下使用不同的关键字来声明变量，以充分发挥它们的作用。

## 4. 数组去重有哪些办法？

在 JavaScript 中，有多种方法可以对数组进行去重操作。以下是其中一些常见的方法：

1. 使用 `Set` 数据结构

::: tip
Set 对象是 ES6 中引入的新的数据结构，它可以存储不重复的值。因此，可以利用 Set 对象来实现数组去重，然后将结果转换回数组。示例如下：
:::

```js
let arr = [1, 2, 2, 3, 3, 4, 5, 5];
let uniqueArr = [...new Set(arr)];
console.log(uniqueArr); // [1, 2, 3, 4, 5]
```

2. 使用 `Array.prototype.filter()`

::: tip
利用 filter() 方法可以返回一个新的数组，该数组包含原数组中满足条件的所有元素。通过判断当前元素在数组中第一次出现的位置是否等于当前的索引位置，来实现数组去重。示例如下：
:::

```js
const arr = [1, 2, 2, 3, 3, 4];
const uniqueArr = arr.filter((item, index, array) => {
  return array.indexOf(item) === index;
});
console.log(uniqueArr); // [1, 2, 3, 4]
```

3. 使用 `Array.prototype.reduce()`

::: tip
reduce() 方法可以将数组中的每个元素按照指定的函数进行累加计算，并返回一个最终结果。利用 reduce() 方法可以实现数组去重，通过判断当前元素在数组中是否已经存在，来决定是否将其加入结果数组中。示例如下：
:::

```js
const arr = [1, 2, 2, 3, 3, 4];
const uniqueArr = arr.reduce((acc, cur) => {
  if (!acc.includes(cur)) {
    acc.push(cur);
  }
  return acc;
}, []);
console.log(uniqueArr); // [1, 2, 3, 4]
```

4. 使用对象属性判重

::: tip
可以通过将数组中的每个元素作为对象的属性，并设置属性值为 true，来实现数组去重。如果对象中已经存在该属性，则说明该元素在数组中已经存在，可以直接跳过。示例如下：
:::

```js
const arr = [1, 2, 2, 3, 3, 4];
const obj = {};
const uniqueArr = [];
arr.forEach(item => {
  if (!obj[item]) {
    obj[item] = true;
    uniqueArr.push(item);
  }
});
console.log(uniqueArr); // [1, 2, 3, 4]
```

## 5. 说一下深拷贝和浅拷贝，如何自己实现一个深拷贝？

都是用于复制对象或数组的方法。它们的区别在于对于<b>引用类型的处理方式不同</b>。

1. 浅拷贝会复制对象或数组的引用，即新的对象或数组和原对象或数组会指向同一个内存地址。因此，如果修改新的对象或数组的某个属性，原对象或数组对应的属性也会发生变化。

2. 深拷贝会创建一个完全独立的新对象或数组，和原对象或数组不共享任何内存地址。因此，修改新的对象或数组的属性不会影响原对象或数组。

```js
function deepClone(val) {
  const hasOwn = (target, key) =>
    Object.prototype.hasOwnProperty.call(target, key);
  const getTypes = value =>
    Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
  const isArray = value =>
    Array.isArray ? Array.isArray(value) : getTypes(value) === 'array';
  const PRIMITIVE_TYPES = [
    'string',
    'number',
    'boolean',
    'symbol',
    'undefined'
  ]; // 基本数据类型 (undefined、boolean、number、string、symbol) & null 直接返回原值即可
  if (val === null || PRIMITIVE_TYPES.includes(getTypes(val))) return val; // 处理内置类型
  let constructor = val.constructor;
  if (/^(RegExp|Date|String|Number|Boolean)$/i.test(constructor.name)) {
    return new constructor(val);
  } // 处理函数 这里可能有问题，再研究 // if (typeof val === 'function')  return eval(`${val.toString()}`); // 处理特殊对象 比如 DOM 节点
  if (typeof val === 'object' && val.nodeType === 1) return val.cloneNode(true); // 处理数组和对象
  let res = isArray(val) ? [] : {};
  for (let key in val) {
    // 判断 key 是否是对象自身上的属性，以避免对象原型链上属性的拷贝
    if (hasOwn(val, key)) {
      // 属性值为原始类型包装对象的时候，（Number,String,Boolean）这里会抛错
      // 需要加一个错误处理，对运行结果没有影响。
      try {
        res[key] = deepClone(val[key]);
      } catch (error) {
        console.log(error);
      }
    }
  }
  return res;
}
```

## 6. ★★★ 说一下防抖和节流。怎么实现？

防抖（debounce）和节流（throttle）都是为了解决在高频率触发事件时造成的性能问题，但是它们的解决方案不同。

(1)防抖
在连续触发事件的情况下，只执行最后一次触发的事件。也就是说，在规定时间内，如果事件再次触发，就会取消前一次的操作并重新开始计时。

实现方式：通过设置一个定时器，在规定时间内如果再次触发事件，就清除之前的定时器并重新开始计时。
function debounce(fn, delay) {
let timer;
return function() {
let context = this;
let args = arguments;
clearTimeout(timer);
timer = setTimeout(function() {
fn.apply(context, args);
}, delay);
}
}

(2)节流
在连续触发事件的情况下，按照一定的时间间隔执行事件。也就是说，事件会在每隔一段时间后执行一次，而不是在每次触发事件时都执行。

实现方式：通过设置一个时间戳，记录上一次执行事件的时间，每次触发事件时先判断当前时间与上一次执行事件的时间差是否超过了指定的时间间隔，如果超过了就执行事件，并更新时间戳。
function throttle(fn, delay) {
let lastTime = 0;
return function() {
let context = this;
let args = arguments;
let nowTime = new Date().getTime();
if (nowTime - lastTime >= delay) {
fn.apply(context, args);
lastTime = nowTime;
}
}
}

重复出现的相似问题： 2.说说节流和防抖 3.节流防抖

## 7. ★★★★ 闭包是什么？如何实现？

重复出现的相似问题： 1.闭包是什么? 闭包的用途?
2.js 中的闭包 3.用闭包的原理做过哪些？
(1)实现私有变量和函数 / 保存私有状态和数据
在 JavaScript 中没有私有变量和函数的概念，但是使用闭包可以实现类似的效果。我们可以定义一个函数，在这个函数中定义一些局部变量和函数，然后返回一个对象，这个对象可以访问和操作这些局部变量和函数，但是外部代码无法直接访问它们。
function createCounter() {
let count = 0;
function increment() {
count++
}
function getCount() {
return count
}
return {
increment,
getCount
}
}
const counter = createCounter()
counter.increment()
console.log(counter.getCount)

(2)实现函数记忆 / 缓存计算结果
函数记忆是一种优化技术，用于缓存函数的计算结果，避免重复计算。通过使用闭包，我们可以在函数内部创建一个缓存对象，把函数的输入作为键，把计算结果作为值，然后在每次调用函数时先检查缓存对象中是否已经有这个输入的计算结果，如果有直接返回结果，如果没有再进行计算。
function memorize(fn) {
const cache = {};
return function() {
const args = JSON.stringify(arguments);
if (cache[args]) return cache[args];
const result = fn.apply(this, arguments);
cache[args] = result;
return result;
};
}
const fibonacci = memorize(function(n) {
if (n === 0 || n === 1) return n;
return fibonacci(n - 1) + fibonacci(n - 2);
});
console.log(fibonacci(20)); // 6765

(3)实现模块化
闭包可以用于实现模块化，将代码封装在一个闭包中，只暴露必要的接口给外部。
const myModule = (function() {
let privateVar = "I'm private!";

function privateFunc() {
console.log("I'm private too!");
}

return {
publicVar: "I'm public!",
publicFunc: function() {
console.log("I'm public too!");
privateFunc();
}
};
})();

console.log(myModule.publicVar); // 输出 "I'm public!"
myModule.publicFunc(); // 输出 "I'm public too!" 和 "I'm private too!"

(4)实现高阶函数
闭包可以用于创建高阶函数，即可以接受函数作为参数或者返回函数的函数。
function multiplyBy(factor) {
return function(number) {
return number \* factor;
};
}

const double = multiplyBy(2);
const triple = multiplyBy(3);

console.log(double(5)); // 输出 10
console.log(triple(5)); // 输出 15

(5)实现函数式编程
闭包是函数式编程中不可或缺的部分，可以实现柯里化、函数组合等功能。

## 8.★★★ 什么是 JS 原型？原型链是什么？

(1)JS 原型
在 JavaScript 中，每个对象都有一个属性 **proto**，表示（指向）该对象的原型。原型是一个对象，它包含该对象所继承的属性和方法。

(2)原型链
我们知道，原型是一个对象。由一个对象的原型指向另一个对象的原型，最终指向 Object.prototype，这个链条就是原型链。当我们访问一个对象的属性或方法时，如果该对象本身没有这个属性或方法，JavaScript 会沿着原型链往上查找，直到找到这个属性或方法为止。原型链就是由一个对象的原型指向另一个对象的原型，最终指向 Object.prototype 的链条。

重复出现的相似问题：
(1)在 js 中原型链是一个很重要的概念，你能介绍一下它吗？
(2)能说一下原型链的查找过程吗？

窗体底端

## 9.作用域是什么？

## 10.操作数组的方式有哪些？

## 11.0.1 + 0.2  等于  0.3 吗？为什么？如何解决？

## 12.判断一个变量是否是数组，有哪些办法？

## 13.判断一个变量是否是对象，有哪些办法？

## 14.对象/数组常用方法有哪些？

## 15.创建一个空数组/空对象有哪些方式？

## 16.哪些遍历方式会改变原数组？

## 17.Set 和 Map 各是什么？

重复出现的相似问题：
1.Set 和 Map

## 18.介绍一下 promise。

## 19.Promise 通常会解决三种问题

(1)链式回调
(2)同时发起几个异步请求，谁先有结果就拿谁的
(3)发起多个请求，等到所有请求后再做下一步处理
这三种方式 promise 是怎么处理的？

## 20.如何改变一个函数 a 的上下文？

## 21.Call 和 replay 有什么区别？

## 22.Evenbus 是什么东西？

## 23.什么是 RESTful API？如何在 JavaScript 中使用 RESTful API？

RESTful API 是一种基于 HTTP 协议设计的 Web 服务 API 架构风格，它主张资源的标准化定义和通过 HTTP 协议的 GET、POST、PUT、DELETE 等请求方法对资源进行操作。

在 JavaScript 中，可以使用 XMLHttpRequest 或 fetch API 来使用 RESTful API。

## 24.async await 的原理是什么?

## 25.async/await, generator, promise 这三者的关联和区别是什么?

## 26.你觉得 js 里 this 的设计怎么样? 有没有什么缺点啥的 27.了解过装饰器？

## 28.generator 是如何做到中断和恢复的

## 29.function 和 箭头函数的定义有什么区别? 导致了在 this 指向这块表现不同 30.导致 js 里 this 指向混乱的原因是什么?

## 31.Promise then 第二个参数和 catch 的区别是什么? 32.作用域链

## 33.Symbol

## 34.ES5 继承

## 35.ES6 继承, 静态方法/属性和实例方法/属性 是什么时候挂载的

## 36.Promise 各种 api

## 37.promise 相关的特性

## 38.js 超过 Number 最大值的数怎么处理?

## 39.for...in 和 for...of 有什么区别

## 40.如何理解 JS 的异步

JS 是一门单线程的语言，这是因为它运行在浏览器的渲染主线程中，而渲染主线程只有一个。

渲染主线程承担着诸多的工作：解析 HTML、解析 CSS、计算样式、布局、处理图层、渲染页面、执行 JS、执行事件处理函数、执行计时器回调函数等。

如果使用同步的方式，就极有可能导致主线程产生阻塞。这样一来，一方面会导致繁忙的主线程白白的消耗时间，另一方面导致页面无法及时更新，给用户造成卡死现象。

所以浏览器采用异步的方式来避免。具体做法是当某些任务发生时，比如计时器、网络、事件监听，主线程将任务交给其他线程去处理，自身立即结束任务的执行，转而执行后续代码。当其他线程完成时，将事先传递的回调函数包装成任务，加入到消息队列的未尾排队，等待主线程调度执行。在这种异步模式下，浏览器永不阻塞，从而最大限度的保证了单线程的流畅运行。

## 41.JS 任务有优先级吗？

任务没有优先级，在消息队列中先进先出。
但消息队列是有优先级的

根据 W3C 的最新解释：
(1)每个任务都有一个任务类型，同一个类型的任务必须在一个队列，不同类型的任务可以分属不同的队列。在一次事件循环中，浏览器可以根据实际情况从不同的队列中取出任务执行。
(2)浏览器必须准备好一个微队列，微队列中的任务优先所有其他任务执行。

随着浏览器的复杂度急剧提升，W3C 不再使用宏队列的说法。

目前 Chrome 的实现中，至少包含了下面的队列：
(1)延时队列：存放计时器到达后的回调任务，优先级【中】
(2)交互队列：存放用户操作后产生的事件处理任务，优先级【高】
(3)微队列：存放需要最快执行的任务，优先级【最高】

添加任务到微任务队列的主要方式是使用：Promise, MutationObserver
浏览器还有很多其他的队列，由于和我们开发关系不大，不作考虑。

## 42.★★ 阐述一下 JS 事件循环

事件循环（Event Loop，W3C）又叫做消息循环（Message Loop，浏览器实现），是浏览器渲染主线程的工作方式。

在 Chrome 的源码中，它开启一个不会结束的 for 循环，每次循环从消息队列中取出第一个任务执行，而其他线程只需要在合适的时候将任务加入到队列来尾即可。

过去把消息队列简单分为宏队列和微队列，这种说法目前已无法满足复杂的浏览器环境，取而代之的是一种更加灵活多变的处理方式。

根据 W3C 官方的解释，每个任务有不同的类型，同类型的任务必须在同一个队列，不同的任务可以属于不同的队列。不同任务队列有不同的优先级，在一次事件循环中，由浏览器自行决定取哪一个队列的任务。但浏览器必须有一个微队列，微队列的任务一定具有最高的优先级，必须优先调度执行。

## 43.JS 中的计时器能做到精确计时吗? 为什么?

不行。原因如下：

(1)计算机硬件没有原子钟，无法做到精确计时
(2)操作系统的计时函数本身就有少量偏差，由于 JS 的计时器最终调用的是操作系统的函数，也就携带了这些偏差
(3)按照 W3C 的标准，浏览器实现计时器时，如果嵌套层级超过 5 层，则会带有 4 毫秒的最少时间，这样在计时时间少于毫秒时又带来了偏差
(4)受事件循环的影响，计时器的回调函数只能在主线程空闲时运行，因此又带来了偏差

## 44.object 的原型指向谁？

# 代码阅读题

## 1.给出代码的输出顺序

```js
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}
async function async2() {
  console.log('async2');
}
console.log('script start');
setTimeout(function () {
  console.log('setTimeout');
}, 0);
async1();
new Promise(function (resolve) {
  console.log('promise1');
  resolve();
  console.log('promise2');
}).then(function () {
  console.log('promise3');
});
console.log('script end');
```

## 2.输出什么? 为什么?

```js
var b = 10;
(function b() {
  b = 20;
  console.log(b);
})();
```

## 3.代码输出顺序题

```js
async function async1() {
  console.log('1');
  await async2();
  console.log('2');
}

async function async2() {
  console.log('3');
}

console.log('4');

setTimeout(function () {
  console.log('5');
}, 0);

async1();

new Promise(function (resolve) {
  console.log('6');
  resolve();
}).then(function () {
  console.log('7');
});

console.log('8');
```

## 4.代码输出题

```js
console.log(typeof typeof typeof null);
console.log(typeof console.log(1));
```

## 5.this 指向题

```js
var name = '123';
var obj = {
  name: '456',
  print: function () {
    function a() {
      console.log(this.name);
    }
    a();
  }
};

obj.print();
```

## 6.输出顺序题

```js
setTimeout(function () {
  console.log(1);
}, 100);

new Promise(function (resolve) {
  console.log(2);
  resolve();
  console.log(3);
}).then(function () {
  console.log(4);
  new Promise((resolve, reject) => {
    console.log(5);
    setTimeout(() => {
      console.log(6);
    }, 10);
  });
});
console.log(7);
console.log(8);
```

## 7.作用域

```js
var a = 3;
function c() {
  alert(a);
}
(function () {
  var a = 4;
  c();
})();
```

## 8.输出题

```js
function Foo() {
  Foo.a = function () {
    console.log(1);
  };
  this.a = function () {
    console.log(2);
  };
}

Foo.prototype.a = function () {
  console.log(3);
};

Foo.a = function () {
  console.log(4);
};

Foo.a();
let obj = new Foo();
obj.a();
Foo.a();
```

## 9.普通函数和箭头函数的 this 指向问题

```js
const obj = {
  fn1: () => console.log(this),
  fn2: function () {
    console.log(this);
  }
};

obj.fn1();
obj.fn2();

const x = new obj.fn1();
const y = new obj.fn2();
```

## 10.下面的 JS 为何会阻碍渲染？

```html
<body>
   
  <h1>Mr.Yang is awesome!</h1>
    <button>change</button>

  <script>
    const btn = document.querySelector('button');
    const h1 = document.querySelector('h1'); // 死循环指定的时间

    function delay(duration) {
      const start = Date.now();
      while (Date.now() - start < duration) {}
    }

    btn.onclick = function () {
      h1.textContent = 'Mr.Yang is 很帅!'; // 这里会卡 3 秒再渲染结果，原因如下： // onclick 是用户点击事件，浏览器的渲染线程会交给交互线程（可以这么理解）处理 // 包装一个点击事件的任务 task 放入消息队列，等主线程空闲时会调度执行。 // 执行 task 过程中，h1 的内容改了，但是浏览器不会立马绘制， // 而这段 delay 函数的代码是同步的，所以会阻塞浏览器渲染
      // 而是生成一个绘制任务放入消息队列，等同步任务执行完毕，再从消息队列调度执行
      delay(3000);
    };
  </script>
</body>
```

11.

# 手写代码题

## 1.★★★ 节流防抖：实现一个节流函数? 如果想要最后一次必须执行的话怎么实现?

重复出现的相似问题： 3.节流防抖 4.手写防抖和节流

## 2.实现一个批量请求函数, 能够限制并发量?

## 3.数组转树结构 ★★

```js
const arr = [
  { id: 2, name: '部门 B', parentId: 0 },
  { id: 3, name: '部门 C', parentId: 1 },
  { id: 1, name: '部门 A', parentId: 2 },
  { id: 4, name: '部门 D', parentId: 1 },
  { id: 5, name: '部门 E', parentId: 2 },
  { id: 6, name: '部门 F', parentId: 3 },
  { id: 7, name: '部门 G', parentId: 2 },
  { id: 8, name: '部门 H', parentId: 4 }
];
```

::: warning 重复出现的相似问题
数组转树, 写完后问如果要在树中新增节点或者删除节点, 函数应该怎么扩展

```js
const arr = [
  { id: 2, name: '部门 B', parentId: 0 },
  { id: 3, name: '部门 C', parentId: 1 },
  { id: 1, name: '部门 A', parentId: 2 },
  { id: 4, name: '部门 D', parentId: 1 },
  { id: 5, name: '部门 E', parentId: 2 },
  { id: 6, name: '部门 F', parentId: 3 },
  { id: 7, name: '部门 G', parentId: 2 },
  { id: 8, name: '部门 H', parentId: 4 }
];
```

:::

## 4.去除字符串中出现次数最少的字符，不改变原字符串的顺序。

“ababac” —— “ababa”
“aaabbbcceeff” —— “aaabbb”

## 5.写出一个函数 trans，将数字转换成汉语的输出，输入为不超过 10000 亿的数字。

trans(123456) —— 十二万三千四百五十六
trans（100010001）—— 一亿零一万零一

## 6.给几个数组, 可以通过数值找到对应的数组名称

// 比如这个函数输入一个 1，那么要求函数返回 A
const A = [1,2,3];
const B = [4,5,6];
const C = [7,8,9];

function test(num) {

}

## 7.不定长二维数组的全排列

// 输入 [['A', 'B', ...], [1, 2], ['a', 'b'], ...]

// 输出 ['A1a', 'A1b', ....]

## 8.两个字符串对比, 得出结论都做了什么操作, 比如插入或者删除

pre = 'abcde123'
now = '1abc123'

a 前面插入了 1, c 后面删除了 de

## 9.★★sleep 函数

重复出现的相似问题：
1.sleep 函数

## 10.ES5 和 ES6 的继承? 这两种方式除了写法, 还有其他区别吗?

## 11.EventEmitter

## 12.使用 Promise 实现一个异步流量控制的函数, 比如一共 10 个请求, 每个请求的快慢不同, 最多同时 3 个请求发出, 快的一个请求返回后, 就从剩下的 7 个请求里再找一个放进请求池里, 如此循环。

## 13.给一个字符串, 找到第一个不重复的字符

ababcbdsa
abcdefg
时间复杂度是多少?
除了给的两个用例, 还能想到什么用例来测试一下?

## 14.实现 compose 函数, 类似于 koa 的中间件洋葱模型

```js
// 题目需求
let middleware = [];
middleware.push(next => {
  console.log(1);
  next();
  console.log(1.1);
});
middleware.push(next => {
  console.log(2);
  next();
  console.log(2.1);
});
middleware.push(next => {
  console.log(3);
  next();
  console.log(3.1);
});

let fn = compose(middleware);
fn();
```

//实现 compose 函数
function compose(middlewares) {

}

## 15.遇到退格字符就删除前面的字符, 遇到两个退格就删除两个字符

// 比较含有退格的字符串，"<-"代表退格键，"<"和"-"均为正常字符
// 输入："a<-b<-", "c<-d<-"，结果：true，解释：都为""
// 输入："<-<-ab<-", "<-<-<-<-a"，结果：true，解释：都为"a"
// 输入："<-<ab<-c", "<<-<a<-<-c"，结果：false，解释："<ac" !== "c"

function fn(str1, str2) {

}

## 16.实现一个函数, 可以间隔输出

```js
function createRepeat(fn, repeat, interval) {}

const fn = createRepeat(console.log, 3, 4);

fn('helloWorld'); // 每 4 秒输出一次 helloWorld, 输出 3 次
```

## 17.删除链表的一个节点

```js
function (head, node) {}
```

## 18.实现 LRU 算法

```js
class LRU {
  get(key) {}

  set(key, value) {}
}
```

## 19.Promise finally 怎么实现的

## 20.手写深拷贝

const deepClone = (obj, m) => {

};

需要手写一个深拷贝函数 deepClone，输入可以是任意 JS 数据类型

## 21. 二叉树光照，输出能被光照到的节点, dfs 能否解决?

输入: [1,2,3,null,5,null,4]
输出: [1,3,4]

输入: []
输出: []

/\*\*

- @param {TreeNode} root
- @return {number[]}
  \*/
  function exposedElement(root) {

};

## 22.好多请求, 耗时不同, 按照顺序输出, 尽可能保证快, 写一个函数。

```js
const promiseList = [
  new Promise(resolve => {
    setTimeout(resolve, 1000);
  }),
  new Promise(resolve => {
    setTimeout(resolve, 1000);
  }),
  new Promise(resolve => {
    setTimeout(resolve, 1000);
  })
];

fn(promiseList);
```

## 23.一个数组的全排列

输入一个数组 arr = [1,2,3]
输出全排列

[[1], [2], [3], [1, 2], [1, 3], ...., [1,2,3], [1,2,4] ....]

## 24.多叉树, 获取每一层的节点之和

```js
function layerSum(root) {}

const res = layerSum({
  value: 2,
  children: [
    { value: 6, children: [{ value: 1 }] },
    { value: 3, children: [{ value: 2 }, { value: 3 }, { value: 4 }] },
    { value: 5, children: [{ value: 7 }, { value: 8 }] }
  ]
});

console.log(res);
```

## 25.虚拟 dom 转真实 dom

```js
const vnode = {
  tag: 'DIV',
  attrs: {
    id: 'app'
  },
  children: [
    {
      tag: 'SPAN',
      children: [
        {
          tag: 'A',
          children: []
        }
      ]
    },
    {
      tag: 'SPAN',
      children: [
        {
          tag: 'A',
          children: []
        },
        {
          tag: 'A',
          children: []
        }
      ]
    }
  ]
};

function render(vnode) {}
```

## 26.数组去重：有序数组原地去重 27.二叉树的层序遍历：每层的节点放到一个数组里

给定一个二叉树，返回该二叉树层序遍历的结果，（从左到右，一层一层地遍历）
例如：
给定的二叉树是{3,9,20,#,#,15,7},
该二叉树层序遍历的结果是[[3],[9,20],[15,7] ]

## 28.实现一个函数, fetchWithRetry 会自动重试 3 次，任意一次成功直接返回 29.链表中环的入口节点

对于一个给定的链表，返回环的入口节点，如果没有环，返回 null 30.最小的 k 个数 31.多叉树指定层节点的个数 32.叠词的数量
Input: 'abcdaaabbccccdddefgaaa'
Output: 4

1. 输出叠词的数量
2. 输出去重叠词的数量
3. 用正则实现

   33.手写 Object.create
   // 思路：将传入的对象作为原型

// 实现如下

```js
function create(obj) {
  function F() {}
  F.prototype = obj;
  return new F();
}
```

## 34.手写 instanceof

instanceof 运算符用于判断构造函数的 prototype 属性是否出现在对象的原型链中的任何位置。

实现步骤：
(1)首先获取类型的原型
(2)然后获得对象的原型
(3)然后一直循环判断对象的原型是否等于类型的原型，直到对象原型为  null，因为原型链最终为  null
function myInstanceof(left, right) {
 let proto = Object.getPrototypeOf(left); // 获取对象的原型
 const prototype = right.prototype; // 获取构造函数的 prototype 对象
​
 // 判断构造函数的 prototype 对象是否在对象的原型链上
 while (true) {
   if (!proto) return false;
   if (proto === prototype) return true;
​
   proto = Object.getPrototypeOf(proto);
}
}

## 35.手写 new

## 36.手写 promise(简易版)

## 37.手写 call 函数

## 38.手写 apply 函数

## 39.手写 bind 函数

## 40.函数柯里化的实现

## 41.手写 AJAX 请求

## 42.使用 Promise 封装 AJAX 请求

## 43.  手写深拷贝

## 44.手写打乱数组顺序的方法

## 45.实现数组扁平化

## 46.实现数组的 flat 方法

## 47.实现数组的 push 方法

## 48.实现数组的 filter 方法

## 49.  实现数组的 map 方法

## 50.实现 add(1)(2)(3)(4)

## 51.用 Promise 实现图片的异步加载

## 52.手写发布-订阅模式

## 53.Object.defineProperty(简易版)

## 54.Proxy 数据劫持(简易版)

## 55.实现路由(简易版)

## 56.使用 setTimeout 实现 setInterval

## 57.使用 setInterval 实现 setTimeout

## 58.实现 jsonp

## 59.提取出 url 里的参数并转成对象

## 60.请写至少三种数组去重的方法？（原生 js）

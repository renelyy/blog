# 其他手写题与工具函数

[← 返回索引](../index.md)

> 发布订阅、数组转树、防抖节流等

---

## instanceof

> 来源：`profile/JavaScript/JavaScript手写题/其他/instanceof.js`

```javascript
const isObject = maybeObject =>
  (typeof maybeObject === 'object' || typeof maybeObject === 'function') &&
  maybeObject !== null

/**
 * @description 使用 getPrototypeOf 实现 instanceof
 * @param {*} instance
 * @param {*} Constructor
 * @returns
 */
function _instanceof(instance, Constructor) {
  if (!isObject(instance)) return false
  let proto = Object.getPrototypeOf(instance)
  while (true) {
    if (proto === null) return false
    if (proto === Constructor.prototype) return true
    proto = Object.getPrototypeOf(instance)
  }
}

console.log('start test -------------------------')
let str = new Object('2')
console.log(_instanceof(str, String)) // true

function SuperType() {}
let o = new SuperType()
console.log(_instanceof(o, SuperType)) // true

console.log(_instanceof('1', String)) // false
console.log('end test -------------------------')

/**
 * @description 使用 __proto__ 实现 instanceof
 * @param {*} target
 * @param {*} origin
 * @returns
 */
function myInstanceof(target, origin) {
  if (!isObject(target)) return false
  while (target) {
    if (target.__proto__ === origin.prototype) {
      return true
    }
    target = target.__proto__
  }
  return false
}

{
  console.log('start test -------------------------')
  let str = new Object('2')
  console.log(myInstanceof(str, String)) // true

  function SuperType() {}
  let o = new SuperType()
  console.log(myInstanceof(o, SuperType)) // true

  console.log(myInstanceof('1', String)) // false
  console.log('end test -------------------------')
  let s = '1'
}
```

---

## sleep函数

> 来源：`profile/JavaScript/JavaScript手写题/其他/sleep函数.js`

```javascript
// promise
const sleep = time => {
  return new Promise(resolve => setTimeout(resolve, time))
}

sleep(1000).then(res => {
  console.log(1)
})

// es5
function sleep_es5(callback, time) {
  if (typeof callback === 'function') {
    setTimeout(callback, time)
  }
}

function output () {
  console.log(2)
}

sleep_es5(output, 2000)
```

---

## 千分位分隔符

> 来源：`profile/JavaScript/JavaScript手写题/其他/千分位分隔符.js`

```javascript
/**
 * @description 千分位分隔符
 * @param {String | Number} str
 * @returns
 * 正则相关知识
 * \b 单词边界
 * \B 非单词边界
 * ?=p 匹配 p 前面的位置
 * ?!p 除了 p 前面的位置，这个位置不能是 p 前面的位置
 */
const formatThousandthSepparator = str => {
  str = typeof str !== 'string' ? str.toString() : str
  const reg = /(?=(\B\d{3})+\$)/g
  // const reg = /(?!^)(?=(\d{3})+$)/g // 也可

  // 支持 '1000 2000000' => '1,000 2,000,000'
  // const reg = /(?=(\B\d{3})+\b)/g
  // const reg = /(?!^)(?=(\d{3})+\b)/g 
  
  return str.replace(reg, ',')
}

// TEST DEMO
let str = '10000000000'
console.log(formatThousandthSepparator(str)) // 10,000,000,000
console.log(formatThousandthSepparator(1000)) // 1,000
console.log(formatThousandthSepparator('111111 1000000000 20202020')) // 1,000
console.log(formatThousandthSepparator('renel')) // renel
```

---

## 发布订阅模式

> 来源：`profile/JavaScript/JavaScript手写题/其他/发布订阅模式.js`

```javascript
/**
 * @description 事件总线（发布订阅模式）
 */
 class EventEmitter {
  constructor() {
    this.cache = {};
  }
  on(name, fn) {
    if (this.cache[name]) {
      this.cache[name].push(fn);
    } else {
      this.cache[name] = [fn];
    }
  }
  off(name, fn) {
    let tasks = this.cache[name];
    if (tasks) {
      const index = tasks.findIndex((f) => f === fn || f.callback === fn);
      if (index > 0) {
        tasks.splice(index, 1);
      }
    }
  }
  emit(name, once = false, ...args) {
    if (this.cache[name]) {
      // 创建副本，如果回调函数内继续注册相同事件，会造成死循环
      let tasks = this.cache[name].slice();
      for (let fn of tasks) {
        fn(...args);
      }
      if (once) {
        delete this.cache[name];
      }
    }
  }
}

// test
let eventBus = new EventEmitter();
let fn1 = (name, age) => console.log(`hello, ${name} ${age}`);
let fn2 = (name, age) => console.log(`${name} ${age}`);
eventBus.on("a", fn1);
eventBus.on("a", fn2);
eventBus.emit("a", false, "renel", 23);
```

---

## 数据类型判断

> 来源：`profile/JavaScript/JavaScript手写题/其他/数据类型判断.js`

```javascript
/**
 * @description 数据类型判断
 */
 function typeOf(obj) {
  // Object.prototype.toString.call(obj) =>
  // '[object Object]'
  // '[object Array]'
  // '[object Date]'
  // '[object Math]'
  // '[object RegExp]'
  // '[object String]'
  // '[object Number]'
  // '[object Boolean]'
  // '[object Null]'
  // '[object Undefined]'
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
}
```

---

## 数组转树

> 来源：`profile/JavaScript/JavaScript手写题/其他/数组转树.js`

```javascript
let input = [
  {
    id: 1,
    val: '学校',
    parentId: null,
  },
  {
    id: 2,
    val: '班级1',
    parentId: 1,
  },
  {
    id: 3,
    val: '班级2',
    parentId: 1,
  },
  {
    id: 4,
    val: '学生1',
    parentId: 2,
  },
  {
    id: 5,
    val: '学生2',
    parentId: 3,
  },
  {
    id: 6,
    val: '学生3',
    parentId: 3,
  },
]

const buildTree = (arr, parentId, childArray) => {
  arr.forEach(item => {
    if (item.parentId === parentId) {
      item.children = []
      buildTree(arr, item.id, item.children)
      childArray.push(item)
    }
  })
}
const arrayToTree = (input, parentId) => {
  const array = []
  buildTree(input, parentId, array)
  return array.length > 0 ? (array.length > 1 ? array : array[0]) : {}
}
const obj = arrayToTree(input, null)
console.log(JSON.stringify(obj))
```

---

## 驼峰化

> 来源：`profile/JavaScript/JavaScript手写题/其他/驼峰化.js`

```javascript
/**
 * @description 驼峰化
 * @param {*} str
 */
// 使用 正则 + replace
function camelize_reg_replace(str) {
  const reg = /[-_\s]+(.)/g
  // const reg = /[-_]([a-z])/g // 也可
  return str.replace(reg, (match, c) => {
    console.log(match) // -u
    console.log(c) // u
    return c ? c.toUpperCase() : ''
  })
}

// 使用 数组方法
function camelize_array(str, type = 'lower') {
  let arr = str.split('-')
  return arr
    .filter(item => item !== '')
    .map((item, index) => {
      if (type === 'lower' && index === 0) {
        // 小驼峰
        return item
      } else {
        return item.charAt(0).toUpperCase() + item.slice(1)
      }
    })
    .join('')
}

// TEST DEMO
console.log(camelize_reg_replace('-user-name'))
console.log(camelize_reg_replace('_user_name'))

console.log('camelize_array', camelize_array('-user-name', 'upper'))

// Camel To Pascal
// 正则
const getKebabCase = str => {
  // let temp = str.replace(/[A-Z]/g, match => {
  //   return `-${match.toLowerCase()}`
  // })

  // 一个更加精妙的写法
  let temp = str.replace(/([A-Z])/g, '-$1').toLowerCase()
  if (temp.slice(0, 1) === '-') {
    //如果首字母是大写，执行replace时会多一个_，需要去掉
    temp = temp.slice(1)
  }
  return temp
}

// 数组方法
const getKebabCaseArray = str => {
  let arr = str.split('')
  return arr
    .filter(item => item !== '')
    .map(item => {
      return item.toUpperCase() === item ? `-${item.toLowerCase()}` : item
    })
    .join('')
}

console.log(getKebabCase('UserNameIsYangTao'))
console.log(getKebabCaseArray('UserNameIsYangTao '))
```

---

## 防抖与节流

> 来源：`profile/JavaScript/JavaScript手写题/防抖节流/防抖与节流.js`

```javascript
/** --------------------------探索和理解阶段------------------------------ */
{
  /**
   * @description 防抖
   * 在一定时间间隔内，再次触发会清空定时器，并重新计时，结束后输出一次结果
   * 应用场景
   *  - 监听浏览器窗口 resize 操作 - 防抖（只需计算一次）
   *  - 键盘文本输入的验证 - 防抖（连续输入文字后发送请求进行验证，验证一次就好）
   *  - 提交表单 - 防抖（多次点击变为一次）
   */
  export const debounce = (cb, delay) => {
    let timer = null
    return function () {
      let args = arguments
      clearTimeout(timer)
      timer = setTimeout(() => {
        cb.apply(this, args)
      }, delay)
    }
  }

  /**
   * @description 节流
   * 每隔一段时间执行一次 即按照特定的频率执行
   * 应用场景
   *  - 监听 scroll、mousemove 等事件 - 节流（每隔一秒计算一次位置）
   */
  export const throttle = (cb, delay) => {
    let timer = null
    return function () {
      if (timer) return
      let args = arguments
      timer = setTimeout(() => {
        timer = null
        cb.apply(this, args)
      }, delay)
    }
  }

  /**
   * 相同点
   *    都是需要设置一个回调函数及周期时间
   *
   * 不同点
   *    防抖是在停止触发后的100ms，执行一次（在此时间段内，只要不停止触发，理论上就永远不会触发回调）
   *    节流是在不断的触发过程中，每隔100ms就执行一次
   */

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
    let previous = 0
    return function (...args) {
      let now = +new Date()
      if (now - previous > await) {
        previous = now
        // 执行 fn 函数
        fn.apply(this, args)
      }
    }
  }

  // 第二种方法是使用定时器，比如当 scroll 事件刚触发时，打印一个
  // hello world，然后设置个 1000ms 的定时器，此后每次触发 scroll
  // 事件触发回调，如果已经存在定时器，则回调不执行方法，直到定时器触发，
  // handler 被清除，然后重新设置定时器。
  function thinking2_throttle(fn, await = 50) {
    let timer
    if (timer) return
    return function (...args) {
      timer = setTimeout(() => {
        timer = null
        fn.apply(this, args)
      }, await)
    }
  }
}

/** --------------------------更加标准的写法------------------------------ */
{
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
      ctx: null,
    }
  ) => {
    let previous = 0
    let timer
    const _throttle = function (...args) {
      let now = new Date().getTime()
      if (!options.leading) {
        if (timer) return
        timer = setTimeout(() => {
          timer = null
          cb.apply(options.ctx, args)
        }, delay)
      } else if (now - previous > delay) {
        cb.apply(options.ctx, args)
        previous = now
      } else if (options.trailing) {
        clearTimeout(timer)
        timer = setTimeout(() => {
          cb.apply(options.ctx, args)
        }, delay)
      }
    }
    _throttle.cancel = () => {
      previous = 0
      clearTimeout(timer)
      timer = null
    }
    return _throttle
  }

  /**
   * @description 防抖函数
   * 创建一个 debounced（防抖动）函数，该函数会从上一次被调用后，延迟 wait 毫秒后调用 fn 方法。
   * 1. 提供一个 cancel 方法取消延迟的函数调用以及 flush 方法立即调用。
   * 2. immediate
   * @param {*} cb
   * @param {*} wait
   * @param {*} immediate
   */
  const debounce = (cb, wait = 17, immediate) => {
    let timer = null

    const _debounce = function (...args) {
      let ctx = this
      if (timer) clearTimeout(timer)

      if (immediate && !timer) {
        // 这一行 只需第一次进入即可
        // 总不能设置用户传入的 immediate = false 吧
        // 所以只能委屈下咋们自己的 timer 了，随便设置一个定时器，让其进入 else
        timer = setTimeout(null, wait)
        fn.apply(this, args)
      } else {
        timer = setTimeout(() => {
          fn.apply(ctx, args)
          /**
           * 用户停止触发动作，间隔时间后，触发函数
           * 如果此处设置 timer = null 表明下次触发重新刷新了 immediate
           * 所以设置不设置看场景，看需要
           */
          timer = null
        }, wait)
      }
    }

    _debounce.cancel = () => {
      clearTimeout(timer)
      timer = null
    }
  }
}
```

---

## 防抖函数debounce

> 来源：`profile/JavaScript/JavaScript手写题/防抖节流/防抖函数debounce.js`

```javascript
const debounce = (cb, wait, immediate) => {
  let timer, ret

  let _debounced = function () {
    let ctx = this
    let args = arguments

    if (timer) clearTimeout(timer)

    if (immediate && !timer) {
      timer = setTimeout(null, wait)
      ret = cb.apply(ctx, args)
    }

    timer = setTimeout(() => {
      ret = cb.apply(ctx, args)
      /**
       * 用户停止触发动作，间隔时间后，触发函数
       * 如果此处设置 timer = null 表明下次触发重新刷新了 immediate
       * 所以设置不设置看场景，看需要
       */
      timer = null
    }, wait)

    return ret
  }

  _debounced.cancel = function () {
    clearTimeout(timer)
    timer = null
  }
}
```

---

## debounce

> 来源：`profile/utils/debounce/debounce.js`

```javascript
// 当触发一个函数时，并不会立即执行这个函数，而是会延迟
// 如果在延迟时间内，有重新触发函数，那么取消上一次的函数执行（取消定时器）
// 如果在延迟时间内，没有重新触发函数，那么这个函数就正常执行（执行传入的函数）

function debounce (fn, delay) {
  let timer = null
  return function () {
    if (timer) clearTimeout(timer)
    timer = setTimeout(function () {
      fn()
    }, delay)
  }
}

// 优化 this 指向和传参
function optimizingDebounce (fn, delay) {
  let timer = null
  return function () {
    // 获取 this 和 argument
    const _this = this
    let _arguments = arguments
    if (timer) clearTimeout(timer)
    timer = setTimeout(function () {
      fn.apply(_this, _arguments)
    }, delay)
  }
}

// 优化立即执行 第一次立即执行 后面的等待 delay
function loadingDebounce(fn, delay, loading) {
  var timer = null;
  loading = loading || false;
  var handleFn = function() {
    if (timer) clearTimeout(timer);
    // 获取this和argument
    var _this = this;
    var _arguments = arguments;

    if (loading) {
      // 通过一个变量来记录是否立即执行
      var isInvoke = false;
      if (!timer) {
        fn.apply(_this, _arguments);
        isInvoke = true;
      }
      // 定时器通过修改timer来修改instant
      timer = setTimeout(function() {
        timer = null;
        if (!isInvoke) {
          fn.apply(_this, _arguments);
        }
      }, delay);
    } else {
      timer = setTimeout(function() {
        // 在执行时，通过apply来使用_this和_arguments
        fn.apply(_this, _arguments);
      }, delay);
    }
  }

  // 取消处理
  handleFn.cancel = function() {
    if (timer) clearTimeout(timer);
  }

  return handleFn;
}

//优化返回值
function backDebounce1(fn, delay, option) {
  var timer = null;
  if (!option) option = {};
  leading = option.leading || false;
  result = option.result || null;
  var handleFn = function () {
    if (timer) clearTimeout(timer);
    // 获取this和argument
    var _this = this;
    var _arguments = arguments;

    if (leading) {
      // 通过一个变量来记录是否立即执行
      var isInvoke = false;
      if (!timer) {
        callFn(_this, _arguments);
        isInvoke = true;
      }
      // 定时器通过修改timer来修改instant
      timer = setTimeout(function () {
        timer = null;
        if (!isInvoke) {
          callFn(_this, _arguments);
        }
      }, delay);
    } else {
      timer = setTimeout(function () {
        // 在执行时，通过apply来使用_this和_arguments
        callFn(_this, _arguments);
      }, delay);
    }
  }

  function callFn(context, argument) {
    var res = fn.apply(context, argument);
    if (result) {
      result(res);
    }
  }

  // 取消处理
  handleFn.cancel = function () {
    if (timer) clearTimeout(timer);
  }

  return handleFn;
}

function backDebounce2(fn, delay, leading) {
  var timer = null;
  leading = leading || false;
  var handleFn = function () {
    return new Promise((resovle, reject) => {
      if (timer) clearTimeout(timer);
      // 获取this和argument
      var _this = this;
      var _arguments = arguments;

      if (leading) {
        // 通过一个变量来记录是否立即执行
        var isInvoke = false;
        if (!timer) {
          resovle(fn.apply(_this, _arguments));
          isInvoke = true;
        }
        // 定时器通过修改timer来修改instant
        timer = setTimeout(function () {
          timer = null;
          if (!isInvoke) {
            resovle(fn.apply(_this, _arguments)); 
          }
        }, delay);
      } else {
        timer = setTimeout(function () {
          // 在执行时，通过apply来使用_this和_arguments
          resovle(fn.apply(_this, _arguments));
        }, delay);
      }
    })
  }

  // 取消处理
  handleFn.cancel = function () {
    if (timer) clearTimeout(timer);
  }

  return handleFn;
}
```

---

## throttle

> 来源：`profile/utils/throttle/throttle.js`

```javascript
// 节流
```

---

## hasOwn

> 来源：`profile/utils/hasOwn.js`

```javascript
export function hasOwn(obj, key) {
  if (obj === null || typeof obj !== 'object') {
    throw TypeError('类型错误...');
  }

  return Object.prototype.hasOwnProperty.call(obj, key);
}
```

---

## shuffle

> 来源：`profile/utils/shuffle.js`

```javascript
/**
 * @description 洗牌算法
 * @param {Array} arr 
 */
export function shuffle(arr) {
  for (let i = arr.length; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
}
```

---


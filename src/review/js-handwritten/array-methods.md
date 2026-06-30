# Array 篇手写题

[← 返回索引](../index.md)

> 迁移自 profile JavaScript手写题/Array篇

---

## every

> 来源：`profile/JavaScript/JavaScript手写题/Array篇/every.js`

```javascript
Array.prototype.myEvery = function (callback) {
  let _arr = this,
    thisArg = arguments[1],
    ret = true
  for (let i = 0; i < _arr.length; i++) {
    if (!callback.call(thisArg, _arr[i], i, _arr)) {
      ret = false
      break
    }
  }
  return ret
}

let list = [1, 2, 3, 4]
console.log(list.myEvery(item => item > 3))
```

---

## filter

> 来源：`profile/JavaScript/JavaScript手写题/Array篇/filter.js`

```javascript
Array.prototype.myFilter = function (callback) {
  let _arr = this,
    thisArg = arguments[1],
    ret = []
  for (let i = 0; i < _arr.length; i++) {
    if (callback.call(thisArg, _arr[i], i, _arr)) {
      ret.push(_arr[i])
    }
  }
  return ret
}

let list = [1, 2, 3, 4]
console.log(list.myFilter(item => item % 2 === 0))
```

---

## find

> 来源：`profile/JavaScript/JavaScript手写题/Array篇/find.js`

```javascript
Array.prototype.myFind = function (callback) {
  let _arr = this
  let thisArg = arguments[1]
  for (let i = 0; i < _arr.length; i++) {
    if (callback.call(thisArg, _arr[i], i, _arr)) {
      return _arr[i]
    }
  }
  return undefined
}

Array.prototype.myFindIndex = function (callback) {
  let _arr = this
  let thisArg = arguments[1]
  for (let i = 0; i < _arr.length; i++) {
    if (callback.call(thisArg, _arr[i], i, _arr)) {
      return i
    }
  }
  return -1
}

let list = [1, 2, 3]
console.log(list.myFindIndex(item => item === 3))
console.log(list.findIndex(item => item === 2))
```

---

## forEach

> 来源：`profile/JavaScript/JavaScript手写题/Array篇/forEach.js`

```javascript
Array.prototype.myForEach = function (callback) {
  // 判断 this 是否合法
  if (this === null || this === undefined) {
    throw new TypeError("Cannot read property 'myForEach' of null")
  }

  // 判断 callback 是否合法
  if (Object.prototype.toString.call(callback) !== '[object Function]') {
    throw new TypeError(callback + 'is not a function')
  }

  let _arr = this
  let thisArg = arguments[1]
  for (let i = 0; i < _arr.length; i++) {
    callback.call(thisArg, _arr[i], i, _arr)
  }
}

let list = [1, 2, 3, 5]
list.myForEach((item, index, arr) => {
  console.log(item, index, arr)
})
```

---

## indexOf

> 来源：`profile/JavaScript/JavaScript手写题/Array篇/indexOf.js`

```javascript
/**
 * @description Array.prototype.indexOf(searchElement, fromIndex)
 * fromIndex 开始查找的位置。可选
 * - 如果该索引值大于或等于数组长度，意味着不会在数组里查找，返回-1。
 * - 如果参数中提供的索引值是一个负值，则将其作为数组末尾的一个抵消，即-1表示从
 *   最后一个元素开始查找，-2表示从倒数第二个元素开始查找，以此类推。
 * 注意：如果参数中提供的索引值是一个负值，并不改变其查找顺序，查找顺序仍然是从前
 * 向后查询数组。如果抵消后的索引值仍小于0，则整个数组都将会被查询。其默认值为0。
 * @return 首个被找到的元素在数组中的索引位置; 若没有找到则返回 -1
 */
Array.prototype.myIndexOf = function (searchElement, fromIndex = 0) {
  let k
  if (this === null) {
    throw new TypeError("'this' is null or not defined")
  }

  let O = Object(this)
  let len = O.length >>> 0

  if (len === 0) {
    return -1
  }

  let n = +fromIndex || 0

  if (Math.abs(n) === Infinity) {
    n = 0
  }

  if (n >= len) {
    return -1
  }

  k = Math.max(n >= 0 ? n : len - Math.abs(n), 0)

  while (k < len) {
    if (k in O && O[k] === searchElement) {
      return k
    }
    k++
  }
  return -1
}

/**
 * @description 简版 IndexOf
 * @param {*} findVal
 * @param {*} beginIndex
 * @returns
 */
Array.prototype.index_of(findVal, beginIndex = 0) {
  if (this.length < 1 || beginIndex > findVal.length) {
    return -1
  }
  if (!findVal) {
    return 0
  }
  beginIndex = beginIndex <= 0 ? 0 : beginIndex
  for (let i = beginIndex; i < this.length; i++) {
    if (this[i] == findVal) return i
  }
  return -1
}
```

---

## map

> 来源：`profile/JavaScript/JavaScript手写题/Array篇/map.js`

```javascript
Array.prototype.myMap = function (callback) {
  let _arr = this,
    thisArg = arguments[1],
    ret = []
  for (let i = 0; i < _arr.length; i++) {
    ret.push(callback.call(thisArg, _arr[i], i, _arr))
  }
  return ret
}

let list = [1,2,3]
console.log(list.myMap(item => item * 2))
```

---

## reduce

> 来源：`profile/JavaScript/JavaScript手写题/Array篇/reduce.js`

```javascript
Array.prototype.myReduce = function (callback) {
  let _arr = this
  let accumulator = arguments[1]
  let i = 0
  // 判断是否传入初始值
  if (accumulator === undefined) {
    // 没有初始值的空数组调用 reduce 会报错
    if (_arr.length === 0) {
      throw new TypeError('Reduce of empty array with no initial value')
    }
    // 初始值赋值为数组第一个元素
    accumulator = _arr[0]
    i++
  }
  for (; i < _arr.length; i++) {
    // 计算结果赋值给初始值
    accumulator = callback(accumulator, _arr[i], i, _arr)
  }
  return accumulator
}

let list = [1, 2, 3]
const flat = (arr, depth = 1) => {
  return depth > 0
    ? arr.myReduce(
        (acc, cur) =>
          acc.concat(Array.isArray(cur) ? flat(cur, --depth) : cur),
        []
      )
    : arr.slice()
}

let test_flat_list = [1, 2, [3, 4, [5, [6, 7]]]]
console.log(flat(test_flat_list, Infinity))
console.log(test_flat_list)
```

---

## some

> 来源：`profile/JavaScript/JavaScript手写题/Array篇/some.js`

```javascript
Array.prototype.mySome = function (callback) {
  let _arr = this
  let thisArg = arguments[1]
  for (let i = 0; i < _arr.length; i++) {
    if (callback.call(thisArg, _arr[i], i, _arr)) {
      return true
    }
  }
  return false
}

// TEST DEMO
let list = [1, 2, 3]
console.log(list.mySome(item => item > 2))
```

---

## 数组去重

> 来源：`profile/JavaScript/JavaScript手写题/Array篇/数组去重.js`

```javascript
// 使用双重 for 和 splice
function unique_splice(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) {
        //第一个等同于第二个，splice 方法删除第二个
        arr.splice(j, 1)
        // 删除后注意回调 j
        j--
      }
    }
  }
  return arr
}

// 使用 indexOf 或 includes 加新数组
function unique_indexof(arr) {
  let uniqueArr = []
  for (let i = 0; i < arr.length; i++) {
    if (uniqueArr.indexOf(arr[i]) === -1) {
      uniqueArr.push(arr[i])
    }
  }
  return uniqueArr
}

// sort 排序后，使用快慢指针的思想
// 虽然繁琐，思想值得借鉴
// slow 指向第一个相同的索引，找到不相同后，覆盖 slow, slow++
// fast 一直往后移动，找不相同的位置
function unique_pointer(arr) {
  arr.sort((a, b) => a - b)
  let slow = fast = 1
  while (fast < arr.length) {
    if (arr[fast] !== arr[fast - 1]) {
      arr[slow++] = arr[fast]
    }
    fast++
  }
  arr.length = slow
  return arr
}

/**
 * @description 使用 ES6 提供的 Set
 */
const unique_set = arr => [...new Set(arr)]

/**
 * @description 使用哈希表存储元素是否出现(ES6 提供的 map)
 */
const unique_map = arr => {
  let map = new Map()
  let uniqueArr = []
  for (let i = 0; i < arr.length; i++) {
    if (!map.has(arr[i])) {
      uniqueArr.push(arr[i])
      map.set(arr[i], true)
    }
  }
  return uniqueArr
}

/**
 * @description filter 配合 indexOf
 * @param {*} arr 
 * @returns 
 */
const unique_filter_indexof = arr => {
  return arr.filter((item, index, arr) => arr.indexOf(item) === index)
}

/**
 * @description reduce 配合 includes
 * @param {*} arr 
 * @returns 
 */
const unique_reduce_includes = arr => {
  return arr.reduce((acc, cur) => {
    if (!acc.includes(cur)) {
      acc.push(cur)
    }
    return acc
  }, [])
}



// TEST DEMO
console.log(unique_splice([10, 1, 2, 3, 5, 5, 6]))
console.log(unique_indexof([10, 1, 2, 3, 5, 5, 6]))
console.log(unique_pointer([10, 1, 2, 3, 5, 5, 6]))
console.log(unique_pointer([1, 1, 1, 2, 3, 3, 3]))
console.log(unique_set([1, 1, 1, 2, 3, 3, 3]))
console.log(unique_map([1, 1, 1, 2, 3, 3, 3]))
console.log(unique_filter_indexof([1, 1, 1, 2, 3, 3, 3]))
console.log(unique_reduce_includes([1, 1, 1, 2, 3, 3, 3]))
```

---

## 数组扁平化

> 来源：`profile/JavaScript/JavaScript手写题/Array篇/数组扁平化.js`

```javascript
/**
 * @description 4. 数组扁平化
 */
// ES5 实现：递归
function es5_flatten(arr, depth = 1) {
  var result = []
  for (var i = 0, len = arr.length; i < len; i++) {
    if (Array.isArray(arr[i]) && depth > 0) {
      result = result.concat(es5_flatten(arr[i], depth - 1))
    } else {
      result.push(arr[i])
    }
  }
  return result
}

// ES6 实现
function es6_flatten(arr, depth = 1) {
  while (arr.some(item => Array.isArray(item)) && depth--) {
    // 只要还有元素是数组 则展开一次
    arr = [].concat(...arr)
  }
  return arr
}

// 使用 reduce 实现
function reduce_flatten(arr, depth = 1) {
  return depth > 0
    ? arr.reduce(
        (acc, cur) =>
          acc.concat(Array.isArray(cur) ? reduce_flatten(cur, depth - 1) : cur),
        []
      )
    : arr.slice()
}
const reduce_flatten_list = [1, 2, [3, [4, [5]]]]
console.log('reduce_flatten', reduce_flatten(reduce_flatten_list, 4))

// 使用栈思想实现
// 注意：深度的控制比较低效，因为需要检查每一个值的深度
function stack_flatten(arr) {
  const stack = [...arr]
  const ret = []
  while (stack.length) {
    const top = stack.pop()
    if (Array.isArray(top)) {
      stack.push(...top)
    } else {
      ret.push(top)
    }
  }
  return ret.reverse()
}
const stack_flatten_list = [1, 2, [3, [4, [5]]]]
console.log('stack_flatten', stack_flatten(reduce_flatten_list))

// 使用 Generator 实现
function* generator_flatten(arr, depth = 1) {
  for (const item of arr) {
    if (Array.isArray(item)) {
      yield* generator_flatten(item)
    } else {
      yield item
    }
  }
}
const generator_flatten_list = [1, 2, [3, [4, [5, [6]]]]]
const gen = generator_flatten(generator_flatten_list)
for (let i = 0; i < 10; i++) {
  console.log(gen.next())
}

// 在原型链上实现
Array.prototype.proto_flat = function (depth = 1) {
  if (!Number(depth) || Number(depth) < 0) return this
  let ret = this.concat()
  while (depth > 0) {
    if (ret.some(x => Array.isArray(x))) {
      // 数组中还有数组元素的话并且 depth > 0，继续展开一层数组
      ret = [].concat.apply([], ret)
    } else {
      // 数组中没有数组元素并且不管 depth 是否依旧大于 0，停止循环。
      break
    }
    depth--
  }
  return ret
}

/**
 *
 * @param {*} depth
 * - Array.prototype.flat() 用于将嵌套的数组“拉平”，变成一维的数组。
 *  该方法返回一个新数组，对原数据没有影响。
 * - 不传参数时，默认“拉平”一层，可以传入一个整数，表示想要“拉平”的层数。
 * - 传入 <=0 的整数将返回原数组，不“拉平”
 * - Infinity 关键字作为参数时，无论多少层嵌套，都会转为一维数组
 * - 如果原数组有空位，Array.prototype.flat() 会跳过空位
 */
Array.prototype.flat = function (depth = 1) {
  let ret = []
  if (depth <= 0) return this
  // forEach 会自动跳过空位
  this.forEach(item => {
    if (Array.isArray(item) && depth > 0) {
      ret = ret.concat(arguments.callee(depth - 1))
    } else {
      ret.push(item)
    }
  })
  return ret
}
```

---


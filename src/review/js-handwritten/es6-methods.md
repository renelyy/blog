# ES6 篇手写题

[← 返回索引](../index.md)

> class/map/set

---

## 实现map

> 来源：`profile/JavaScript/JavaScript手写题/ES6篇/实现map.js`

```javascript
/**
 * @description ES6 Map
 *
 */
class _Map {
  constructor() {
    this._items = {}
    this.size = 0
  }

  set(key, value) {
    if (!this.has(key)) {
      this._items[defaultToString(key)] = value
      this.size++
    }
    return this
  }

  get(key) {
    return this._items[defaultToString(key)]
  }

  has(key) {
    return this._items.hasOwnProperty(defaultToString(key))
  }

  delete(key) {
    if (this.has(key)) {
      delete this._items[defaultToString(key)]
      this.size--
    }
    return this
  }

  clear() {
    this._items = {}
    this.size = 0
  }

  keys() {
    let keys = []
    for (let key in this._items) {
      if (this.has(key)) {
        keys.push(key)
      }
    }
    return keys
  }

  values() {
    let values = []
    for (let key in this._items) {
      if (this.has(key)) {
        values.push(this._items[key])
      }
    }
    return values
  }

  entries() {
    let entries = []
    for (let key in this._items) {
      if (this.has(key)) {
        entries.push([key, this._items[key]])
      }
    }
    return entries
  }

  forEach(cb, thisArgs) {
    thisArgs = thisArgs || this
    for (let key in this._items) {
      if (this.has(key)) {
        cb.call(thisArgs, this._items[key], key, this._items)
      }
    }
  }
}

function defaultToString(key) {
  if (key === null) {
    return 'NULL'
  } else if (key === undefined) {
    return 'UNDEFINED'
  } else if (
    Object.prototype.toString.call(key) === '[object Object]' ||
    Object.prototype.toString.call(key) == '[object Array]'
  ) {
    return JSON.stringify(key)
  }
  return key.toString()
}

// TEST DEMO
let map = new _Map()
map.set('name', 'yy').set(1, 1).set('2', '2').set({ id: 1 }, 'yangtao')
console.log(map)
console.log(map.keys())
map.forEach((val, key) => {
  console.log(`${key}=${val}`)
})
```

---

## 实现set

> 来源：`profile/JavaScript/JavaScript手写题/ES6篇/实现set.js`

```javascript
/**
 * @description ES6 Set
 * Set 类似于数组，但是成员的值都是唯一的，没有重复的值
 */
class _Set {
  constructor() {
    // 用对象实现存储
    this._items = {}
    this.size = 0
  }

  has(element) {
    return element in this._items
  }

  add(element) {
    if (!this.has(element)) {
      this._items[element] = element
      this.size++
    }
    // 实现链式调用
    return this
  }

  delete(element) {
    if (this.has(element)) {
      delete this._items[element]
      this.size--
    }
    return this
  }

  clear() {
    this._items = {}
    this.size = 0
  }

  values() {
    let values = []
    for (let key in this._items) {
      if (this.hasOwnProperty(key)) {
        values.push(key)
      }
    }
    return values
  }
}

// TEST DEMO
let s = new _Set()
s.add(1).add(2).add(3).add({ id: 1 }).add('str')
console.log(s)
```

---


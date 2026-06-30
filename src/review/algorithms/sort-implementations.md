# 排序算法实现

[← 返回索引](../index.md)

> 《学习 JS 数据结构与算法》配套代码

---

## bubble-sort

> 来源：`profile/algorithm/learningJavaScriptDataStructsAndAlgorithms/sort/bubble-sort.js`

```javascript
// 冒泡排序
export function bubbleSort(arr) {
  const { length } = arr
  let compareTimes = length - 1
  for (let i = 0; i < length; i++) {
    let lastExchangeIndex = 1
    let exchange = false
    for (let j = 0; j < compareTimes; j++) {
      if (arr[j] > arr[j + 1]) {
        exchange = true
        let tmp = arr[j]
        arr[j] = arr[j + 1]
        arr[j + 1] = tmp
        lastExchangeIndex = j
      }
    }
    compareTimes = lastExchangeIndex
    if (!exchange) break
  }
}
```

---

## bucket-sort

> 来源：`profile/algorithm/learningJavaScriptDataStructsAndAlgorithms/sort/bucket-sort.js`

```javascript
// 桶排序
// 
import { insertSort } from "./insert-sort.js"

export function bucketSort (array, bucketSize = 5) {
  if (array.length < 2) {
    return array
  }
  const buckets = createBuckets(array, bucketSize)
  return sortBuckets(buckets)
}

function createBuckets (array, bucketSize) {
  let minValue = array[0]
  let maxValue = array[0]
  for (let i = 1; i < array.length; i++) {
    minValue = array[i] < minValue ? array[i] : minValue
    maxValue = array[i] > maxValue ? array[i] : maxValue
  }
  const bucketCount = Math.floor((maxValue - minValue) / bucketSize) + 1
  const buckets = []
  for (let j = 0; j < bucketCount; j++) {
    buckets[j] = []
  }
  for (let k = 0; k < array.length; k++) {
    const bucketIndex = Math.floor((array[k] - minValue) / bucketSize)
    buckets[bucketIndex].push(array[k])
  }
  return buckets
}

function sortBuckets (buckets) {
  const sortedArray = []
  for (let i = 0; i < buckets.length; i++) {
    if (buckets[i] !== null) {
      insertSort(buckets[i])
      sortedArray.push(...buckets[i])
    }
  }
  return sortedArray
}
```

---

## counting-sort

> 来源：`profile/algorithm/learningJavaScriptDataStructsAndAlgorithms/sort/counting-sort.js`

```javascript
/**
 * @description 计数排序
 * 找到待排序数组的最大值 k
 * 创建一个长度为 k 的新数组存储待排序数组中元素出现的次数
 * 时间复杂度：O(n + k)
 * 空间复杂度：O(k) 
 * @param {Array} array
 * @return {Array} sortedArray 
 */
export function countingSort (array) {
  if (array.length < 2) {
    return array
  }
  const maxValue = findMaxValue(array)
  const counts = new Array(maxValue + 1)
  array.forEach(element => {
    if (!counts[element]) {
      counts[element] = 0
    }
    counts[element]++
  })
  let sortedIndex = 0
  counts.forEach((count, i) => {
    while (count > 0) {
      array[sortedIndex++] = i
      count--
    }
  })
  return array
}

function findMaxValue (array) {
  let max = array[0]
  for (let i = 1; i < array.length; i++) {
    max = array[i] > max ? array[i] : max
  }
  return max
}
```

---

## insert-sort

> 来源：`profile/algorithm/learningJavaScriptDataStructsAndAlgorithms/sort/insert-sort.js`

```javascript
import { defaultCompare, Compare } from '../libs/utils.js'
export function insertSort (array, compareFn = defaultCompare) {
  let tmp
  for (let i = 1; i < array.length; i++) {
    let j = i
    tmp = array[i]
    // find position
    while (j > 0 && compareFn(array[j - 1], tmp) === Compare.BIGGER_THEN) {
      array[j] = array[j - 1]
      j--
    }
    // insert
    array[j] = tmp
  }
  return array
}
```

---

## merge-sort

> 来源：`profile/algorithm/learningJavaScriptDataStructsAndAlgorithms/sort/merge-sort.js`

```javascript
import { Compare, defaultCompare } from "../libs/utils.js";
export function mergeSort (array, compareFn = defaultCompare) {
  if (array.length > 1) {
    const { length } = array
    const middle = Math.floor(length >> 1)
    const left = mergeSort(array.slice(0, middle), compareFn)
    const right = mergeSort(array.slice(middle, length), compareFn)
    array = merge(left, right, compareFn)
  }
  return array
}

function merge (left, right, compareFn) {
  let i = 0, j = 0
  const ret = []
  while (i < left.length && j < right.length) {
    ret.push(
      compareFn(left[i], right[j]) === Compare.LESS_THEN ? left[i++] : right[j++]
    )
  }
  return ret.concat(i < left.length ? left.slice(i) : right.slice(j))
}
```

---

## quick-sort

> 来源：`profile/algorithm/learningJavaScriptDataStructsAndAlgorithms/sort/quick-sort.js`

```javascript
/**
 * 快速排序
 */
import { Compare, defaultCompare, swap } from '../libs/utils.js'
export function quickSort (array, compareFn = defaultCompare) {
  return quick(array, 0, array.length - 1, compareFn)
}

function quick (array, left, right, compareFn) {
  let index
  if (array.length > 1) {
    index = partition(array, left, right, compareFn)
    if (left < index - 1) {
      quick(array, left, index - 1, compareFn)
    }
    if (index < right) {
      quick(array, index, right, compareFn)
    }
  }
  return array
}

function partition (array, left, right, compareFn) {
  let i = left
  let j = right
  const pivot = array[Math.floor((left + right) / 2)]
  while (i <= j) {
    while (compareFn(array[i], pivot) === Compare.LESS_THEN) {
      i++
    }
    while (compareFn(array[j], pivot) === Compare.BIGGER_THEN) {
      j--
    }
    if (i <= j) {
      swap(array, i, j)
      i++
      j--
    }
  }
  return i
}
```

---


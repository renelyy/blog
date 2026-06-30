# 二分查找与二叉搜索树

[← 返回索引](../index.md)

> 《学习 JS 数据结构与算法》搜索与树章节

---

## binary-search

> 来源：`profile/algorithm/learningJavaScriptDataStructsAndAlgorithms/search/binary-search.js`

```javascript
import { Compare, defaultCompare } from '../libs/utils.js'
import { quickSort } from '../sort/quick-sort.js'

function binarySearch (array, value, compareFn = defaultCompare) {
  const sortedArray = quickSort(array)
  let low = 0
  let high = sortedArray.length - 1
  while (low < high) {
    let mid = (low + high) >> 1
    if (array[mid] === value) return mid
    else if (array[mid] < value) {
      low = mid + 1
    } else {
      high = mid - 1
    }
  }
  return -1
}

function lesserOrEquals (a, b, compareFn) {
  const comp = compareFn(a, b)
  return comp === Compare.LESS_THEN || comp === Compare.EQUALS
}

let list = [1, 3, 8, 19, 20]
console.log(binarySearch(list, 3))
```

---

## binary-search-tree

> 来源：`profile/algorithm/learningJavaScriptDataStructsAndAlgorithms/tree/binary-tree/binary-search-tree.js`

```javascript
// 二叉搜索树
import { Node } from './node.js'
import { Compare, defaultCompare } from '../../utils.js'

export default class BinarySearchTree {
  constructor(compareFn = defaultCompare) {
    this.compareFn = compareFn
    this.root = null
  }

  insert(key) {
    if (this.root === null) {
      this.root = new Node(key)
    } else {
      this.insertNode(this.root, key)
    }
  }

  insertNode(node, key) {
    if (this.compareFn(key, node.key) === Compare.LESS_THEN) {
      if (node.left === null) {
        node.left = new Node(key)
      } else {
        this.insertNode(node.left, key)
      }
    } else {
      if (node.right === null) {
        node.right = new Node(key)
      } else {
        this.insertNode(node.right, key)
      }
    }
  }
}

const tree = new BinarySearchTree()
tree.insert(11)
tree.insert(4)
tree.insert(6)
tree.insert(9)
tree.insert(3)
tree.insert(56)
console.log(tree)
```

---

## node

> 来源：`profile/algorithm/learningJavaScriptDataStructsAndAlgorithms/tree/binary-tree/node.js`

```javascript
export class Node {
  constructor(key) {
    this.key = key
    this.left = null
    this.right = null
  }
}
```

---


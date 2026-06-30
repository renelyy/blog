# 进阶算法与并发（2024–2025）

[← 返回索引](../index.md)

> 排序、堆、并查集、背包、并发请求控制

---

## quickSort

> 来源：`profile/2025/07-out/quickSort.js`

```javascript
const rl = require("readline").createInterface({ input: process.stdin });
const iter = rl[Symbol.asyncIterator]();
const readline = async () => (await iter.next()).value;

(async () => {
  while ((line = await readline())) {
    const arr = line.split(" ").map(Number);
    quickSort(arr);
    console.log(arr.join(" "));
  }
})();

// function quickSort(arr) {
//   __quickSort(arr, 0, arr.length - 1);
// }

// function __quickSort(arr, l, r) {
//   if (l >= r) return;
//   const poivtIndex = __partition(arr, l, r);
//   __quickSort(arr, l, poivtIndex - 1);
//   __quickSort(arr, poivtIndex + 1, r);
// }

// function __partition(arr, l, r) {
//   // 随机选择一个基准值
//   const poivtIndex =  (l + r) >> 1;
//   // 将基准值放到最右边
//   [arr[r], arr[poivtIndex]] = [arr[poivtIndex], arr[r]];
//   let p1 = l, p2 = r - 1;
//   while (p1 <= p2) {
//     while (p1 <= p2 && arr[p1] <= arr[r]) p1++;
//     while (p1 <= p2 && arr[p2] >= arr[r]) p2--;
//     if (p1 < p2) {
//       [arr[p1], arr[p2]] = [arr[p2], arr[p1]];
//       p1++;
//       p2--;
//     }
//   }
//   // 这里为什么是 p1 而不是 p2 呢？
//   // 因为 p2 是从右往左遍历的，所以 p2 最后指向的是小于基准值的元素
//   // 而 p1 是从左往右遍历的，所以 p1 最后指向的是第一个大于基准值的元素
//   // 因此交换 arr[p1] 和 arr[r] 就可以将基准值放到正确的位置
//   // 本质上是因为一开始将基准交换到了右边，而右边需要将大的交换过去
//   [arr[r], arr[p1]] = [arr[p1], arr[r]];
//   return p1;
// }

// function quickSort(arr) {
//   __quickSort(arr, 0, arr.length - 1);
// }

// function __quickSort(arr, l, r) {
//   if (l >= r) return;
//   const p = __partition(arr, l, r);
//   __quickSort(arr, l, p - 1);
//   __quickSort(arr, p + 1, r);
// }

// function __partition(arr, l, r) {
//   // 将 arr[l] 作为基准值
//   const p = arr[l];
//   let p1 = l + 1,
//     p2 = r;
//   while (p1 <= p2) {
//     // 从左向右找到第一个大于基准值的元素
//     while (p1 <= p2 && arr[p1] <= p) p1++;
//     // 从右向左找到第一个小于基准值的元素
//     while (p1 <= p2 && arr[p2] >= p) p2--;
//     if (p1 < p2) {
//       // 交换 arr[p1] 和 arr[p2]
//       [arr[p1], arr[p2]] = [arr[p2], arr[p1]];
//       p1++;
//       p2--;
//     }
//   }
//   // 将基准值放到正确的位置
//   // 这里为什么是 p2 而不是 p1 呢？
//   // 因为 p1 指向的是第一个大于基准值的元素，p2 指向的是第一个小于基准值的元素
//   // 而基准值在左边，需要将小的值放到左边，大的值放到右边
//   [arr[l], arr[p2]] = [arr[p2], arr[l]];
//   return p2;
// }

function quickSort(arr) {
  __quickSort(arr, 0, arr.length - 1);
}

function __quickSort(arr, l, r) {
  if (l >= r) return;
  const poivtIndex = __partition(arr, l, r);
  __quickSort(arr, l, poivtIndex - 1);
  __quickSort(arr, poivtIndex + 1, r);
}

function __partition(arr, l, r) {
  // 随机选择一个基准值
  const poivtIndex = l + Math.floor(Math.random() * (r - l + 1));
  // 将基准值放到最右边
  [arr[r], arr[poivtIndex]] = [arr[poivtIndex], arr[r]];
  let storeIndex = l;
  for (let i = l; i < r; i++) {
    if (arr[i] <= arr[r]) {
      [arr[i], arr[storeIndex]] = [arr[storeIndex], arr[i]];
      storeIndex++;
    }
  }
  // 将基准值放到正确的位置
  [arr[storeIndex], arr[r]] = [arr[r], arr[storeIndex]];
  return storeIndex;
}
```

---

## mergeSort

> 来源：`profile/2025/07-out/mergeSort.js`

```javascript
const rl = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

const iter = rl[Symbol.asyncIterator]();

const readline = async () => (await iter.next()).value;

(async () => {
  while (line = await readline()) {
    const arr = line.split(' ').map(Number);
    mergeSort(arr);
    console.log(arr);
  }
})()


function mergeSort(arr) {
  __mergeSort(arr, 0, arr.length - 1);
}

function __mergeSort(arr, l, r) {
  if (l >= r) return;
  const mid = l + ((r - l) >> 1);
  __mergeSort(arr, l, mid);
  __mergeSort(arr, mid + 1, r);
  const temp = [];
  let k = 0, p1 = l, p2 = mid + 1;
  while (p1 <= mid || p2 <= r) {
    if (p2 > r || (p1 <= mid && arr[p1] <= arr[p2])) {
      temp[k++] = arr[p1++];
    } else {
      temp[k++] = arr[p2++];
    }
  }
  for (let i = l; i <= r; i++) arr[i] = temp[i - l];
}
```

---

## heapSort

> 来源：`profile/2025/07-out/heapSort.js`

```javascript
const rl = require("readline").createInterface({ input: process.stdin });

const iter = rl[Symbol.asyncIterator]();

const readline = async () => (await iter.next()).value;

(async () => {
  while ((line = await readline())) {
    const arr = line.split(" ").map(Number);
    heapSort(arr);
    console.log(arr.join(" "));
  }
})();

// function heapSort(arr) {
//   const n = arr.length;
//   // 建立大顶堆
//   // 从最后一个非叶子节点开始，依次向上调整
//   for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
//     __heapify(arr, i, n);
//   }

//   // 依次将堆顶元素与最后一个元素交换，然后调整堆
//   // 直到堆中只剩下一个元素
//   // 这里是向下调整
//   for (let i = n - 1; i > 0; i--) {
//     [arr[0], arr[i]] = [arr[i], arr[0]];
//     __heapify(arr, 0, i);
//   }
// }

// function __heapify(arr, i, n) {
//   let leftIndex = 2 * i + 1;
//   let rightIndex = 2 * i + 2;
//   let maxIndex = i;
//   if (leftIndex < n && arr[leftIndex] > arr[maxIndex]) {
//     maxIndex = leftIndex;
//   }
//   if (rightIndex < n && arr[rightIndex] > arr[maxIndex]) {
//     maxIndex = rightIndex;
//   }
//   if (maxIndex !== i) {
//     [arr[i], arr[maxIndex]] = [arr[maxIndex], arr[i]];
//     __heapify(arr, maxIndex, n);
//   }
// }

function heapSort(arr) {
  // leftChildIndex = 2 * i + 1
  // rightChildIndex = 2 * i + 2
  // parentIndex = Math.floor((i - 1) / 2)
  const n = arr.length;
  // 构建大顶堆向上调整
  // 从最后一个非叶子节点开始调整
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    __heapify(arr, i, n);
  }
  // 交换堆顶和最后一个元素，然后重新调整堆
  // 最大的元素已经在 arr[0] 了，将其交换到最后一个位置
  // 排除已排序的最大值
  // 然后重新调整堆
  // 向下调整
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    __heapify(arr, 0, i);
  }
}

/**
 * 调整堆
 * @param {number[]} arr 数组
 * @param {number} i 当前节点索引
 * @param {number} heapSize 堆的大小
 */
function __heapify(arr, rootIndex, heapSize) {
  const left = 2 * rootIndex + 1;
  const right = 2 * rootIndex + 2;
  // 三者找最大
  let largest = rootIndex;
  if (left < heapSize && arr[left] > arr[largest]) {
    largest = left;
  }
  if (right < heapSize && arr[right] > arr[largest]) {
    largest = right;
  }
  // 如果最大值不是当前节点，则交换，并递归调整
  if (largest !== rootIndex) {
    [arr[rootIndex], arr[largest]] = [arr[largest], arr[rootIndex]];
    __heapify(arr, largest, heapSize);
  }
}
```

---

## binarySearch

> 来源：`profile/2025/07-out/binarySearch.js`

```javascript
const rl = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});
const iter = rl[Symbol.asyncIterator]();
const readline = async () => (await iter.next()).value;


function randomArr(n) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    arr.push(Math.floor(Math.random() * 100));
  }
  return arr.sort((a, b) => a - b);
}

(async () => {
  const arr = randomArr(10);
  console.log(arr.join(" "));
  while ((line = await readline())) {
    if (line === "q") break;
    // console.log(binarySearch(arr, Number(line)));
    console.log(binarySearch01(arr, Number(line)));
  }
})();

/**
 * 在有序数组中查找目标值
 * @param {Array} arr
 * @param {Number} target
 */
function binarySearch(arr, target) {
  let left = 0,
    right = arr.length - 1,
    mid;
  while (left <= right) {
    mid = (left + right) >> 1;
    if (target === arr[mid]) return mid;
    if (target > arr[mid]) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

/**
 * 2 4 5 7 9
 * 6
 * 0 0 0 1 1
 * 在有序数组中查找第一个大于等于目标值的下标
 * 即在 0 1 模型中查找第一个 1 的位置
 * @param {Array} arr 
 * @param {Number} target 
 */
/**
 * 在有序数组中查找第一个大于等于目标值的下标
 * 即在 0 1 模型中查找第一个 1 的位置
 * @param {Array} arr - 已排序数组
 * @param {Number} target - 目标值
 * @return {Number} 第一个大于等于目标值的索引，如果所有元素都小于目标值则返回arr.length
 */
function binarySearch01(arr, target) {
  let left = 0, right = arr.length;
  
  while (left < right) {
    // 防止整数溢出的写法
    const mid = left + Math.floor((right - left) / 2);
    
    if (arr[mid] >= target) {
      right = mid;  // 搜索左半部分
    } else {
      left = mid + 1;  // 搜索右半部分
    }
  }
  
  return left;
}
```

---

## UnionFind

> 来源：`profile/2025/07-out/UnionFind.js`

```javascript
const rl = require("readline").createInterface({ input: process.stdin });
const iter = rl[Symbol.asyncIteractor]();
const readline = async () => (await iter.next()).value;

class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    // 按秩优化
    this.rank = Array(n).fill(1);
  }

  find(x) {
    if (this.parent[x] === x) return x;
    // path compression 路径压缩
    return (this.parent[x] = this.find(this.parent[x]));
  }

  union(x, y) {
    const px = this.find(x);
    const py = this.find(y);
    if (px === py) return;
    if (this.rank[px] < this.rank[py]) {
      this.parent[px] = py;
      this.rank[py] += this.rank[px];
    } else {
      this.parent[py] = px;
      this.rank[px] += this.rank[py];
    }
  }

  connected(x, y) {
    return this.find(x) === this.find(y);
  }
}

class UnionSet {
  constructor(n) {
    this.parents = new Array(n).fill(0).map((_, i) => i);
  }
  find(x) {
    return this.parents[x] = (this.parents[x] === x ? x : this.find(this.parents[x]));
  }
  union(x, y) {
    this.parents[this.find(x)] = this.find(y);
  }
}
```

---

## 二叉搜索树

> 来源：`profile/2025/07-out/二叉搜索树.js`

```javascript
const rl = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});
const iter = rl[Symbol.asyncIterator]();
const readline = async () => (await iter.next()).value;

class BST {
  constructor() {
    this.root = null;
  }

  insert(val) {
    this.root = this._insert(this.root, val);
  }

  find(val) {
    return this._find(this.root, val);
  }

  remove(val) {
    this.root = this._remove(this.root, val);
  }

  _insert(root, val) {
    if (root === null) return new TreeNode(val);
    if (val === root.val) return root;
    if (val < root.val) root.left = this._insert(root.left, val);
    else if (val > root.val) root.right = this._insert(root.right, val);
    return root;
  }

  _find(root, val) {
    if (root === null) return null;
    if (val === root.val) return root;
    if (val < root.val) return this._find(root.left, val);
    return this._find(root.right, val);
  }

  _remove(root, val) {
    if (root === null) return null;
    if (val < root.val) root.left = this._remove(root.left, val);
    else if (val > root.val) root.right = this._remove(root.right, val);
    else {
      // 处理度为 0 或 1 的节点
      if (root.left === null || root.right === null) {
        return root.left || root.right;
      }

      // 处理度为 2 的节点
      // 找到前驱节点或后继节点
      // 这里选择前驱节点
      const preNode = __findPredecessor(root);
      root.val = preNode.val;
      // 删除前驱节点
      root.left = this._remove(root.left, preNode.val);
    }
    return root;
  }

  __findPredecessor(root) {
    let predecessor = root.left;
    while (predecessor.right !== null) {
      predecessor = predecessor.right;
    }
    return predecessor;
  }
}

(async () => {
  let root = null;
  const bst = new BST();
  while ((line = await readline())) {
    const [op, val] = line.trim().split(" ").map(Number);
    switch (op) {
      case 0:
        root = insert(root, val);
        bst.insert(val);
        break;
      case 1:
        root = remove(root, val);
        bst.remove(val);
        break;
      case 2:
        output(root);
        output(bst.root);
        break;
      case 3:
        const node = bst.find(val);
        if (node === null) console.log("not found");
        else console.log("found ", node.val);
        break;
      default:
        console.log("invalid operation");
        break;
    }
  }
})();

function output(root) {
  const out = [];
  const inOrderTraversal = root => {
    if (root === null) return;
    inOrderTraversal(root.left);
    out.push(root.val);
    inOrderTraversal(root.right);
  };
  inOrderTraversal(root);
  if (out.length === 0) console.log("tree is empty");
  else console.log(">>> ", out.join(" "));
}

class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

/**
 * 在二叉搜索树中插入一个节点
 *
 * @param {TreeNode} root
 * @param {number} val
 * @return {TreeNode}
 */
function insert(root, val) {
  if (root === null) return new TreeNode(val);
  if (val === root.val) return root;
  if (val < root.val) root.left = insert(root.left, val);
  else if (val > root.val) root.right = insert(root.right, val);
  return root;
}

/**
 * 在二叉搜索树中查找一个节点
 */
function find(root, val) {
  if (root === null) return null;
  if (val === root.val) return root;
  if (val < root.val) return find(root.left, val);
  return find(root.right, val);
}

/**
 * 查找前驱节点
 */
function __findPredecessor(root) {
  let predecessor = root.left;
  while (predecessor.right !== null) {
    predecessor = predecessor.right;
  }
  return predecessor;
}

/**
 * 在二叉搜索树中删除一个节点
 *
 * @param {TreeNode} root
 * @param {number} val
 * @return {TreeNode}
 */
function remove(root, val) {
  if (root === null) return null;
  if (val < root.val) root.left = remove(root.left, val);
  else if (val > root.val) root.right = remove(root.right, val);
  else {
    // 处理度为 0 或 1 的节点
    if (root.left === null || root.right === null) {
      return root.left || root.right;
    }

    // 处理度为 2 的节点
    // 找到前驱节点或后继节点
    // 这里选择前驱节点
    const preNode = __findPredecessor(root);
    root.val = preNode.val;
    // 删除前驱节点
    root.left = remove(root.left, preNode.val);
  }
  return root;
}
```

---

## concurrentRequest

> 来源：`profile/2024/08-out/concurrentRequest.js`

```javascript
/**
 * 并发请求
 *
 * @param {Array} urls
 * @param {Number} maxNum
 * @returns {Promise}
 */
function concurrentRequest(urls, maxNum) {
  if (urls.length === 0) return Promise.resolve([]);

  let result = [],
    nextIndex = 0,
    finishedCount = 0;

  return new Promise((resolve, reject) => {
    async function run(url) {
      let i = nextIndex;
      try {
        const res = await fetch(url);
        result[i++] = res;

        if (nextIndex < urls.length) {
          run(urls[++nextIndex]);
        }
        finishedCount++;

        if (finishedCount === urls.length) {
          resolve(result);
        }
      } catch (error) {
        result[i++] = error;
      }
    }

    for (let i = 0; i < Math.min(maxNum, urls.length); i++) {
      run(urls[i]);
    }
  });
}

// 测试
const urls = [
  'https://jsonplaceholder.typicode.com/posts/1',
  'https://jsonplaceholder.typicode.com/posts/2',
  'https://jsonplaceholder.typicode.com/posts/3',
  'https://jsonplaceholder.typicode.com/posts/4',
  'https://jsonplaceholder.typicode.com/posts/5',
  'https://jsonplaceholder.typicode.com/posts/6',
  'https://jsonplaceholder.typicode.com/posts/7',
  'https://jsonplaceholder.typicode.com/posts/8',
  'https://jsonplaceholder.typicode.com/posts/9',
  'https://jsonplaceholder.typicode.com/posts/10'
];

concurrentRequest(urls, 3).then(res => {
  console.log(res);
});
```

---


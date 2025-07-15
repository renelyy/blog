# 常用数据结构封装

## 堆

::: code-group

```js [小顶堆]
class MinHeap {
  constructor() {
    this.heap = [];
  }

  /**
   * 插入元素
   */
  insert(val) {
    this.heap.push(val);
    this.__heapifyUp(this.size() - 1);
  }

  /**
   * 删除堆顶元素
   */
  pop() {
    if (this.isEmpty()) return null;

    const top = this.heap[0];
    const last = this.heap.pop();

    if (this.size() > 0) {
      this.heap[0] = last;
      this.__heapifyDown(0);
    }

    return top;
  }

  /**
   * 获取堆顶元素
   */
  peek() {
    if (this.isEmpty()) return null;

    return this.heap[0];
  }

  /**
   * 返回堆的大小
   */
  size() {
    return this.heap.length;
  }

  /**
   * 判断堆是否为空
   */
  isEmpty() {
    return this.size() === 0;
  }

  /**
   * 获取父节点的索引
   */
  __getParentIndex(index) {
    return Math.floor((index - 1) / 2);
  }

  /**
   * 获取左子节点的索引
   */
  __getLeftChildIndex(index) {
    return 2 * index + 1;
  }

  /**
   * 获取右子节点的索引
   */
  __getRightChildIndex(index) {
    return 2 * index + 2;
  }

  /**
   * 交换两个节点的值
   */
  __swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  /**
   * 向上调整，插入元素时使用
   */
  __heapifyUp(index) {
    while (index > 0) {
      const parentIndex = this.__getParentIndex(index);
      if (this.heap[parentIndex] <= this.heap[index]) break;
      this.__swap(index, parentIndex);
      index = parentIndex;
    }
  }

  /**
   * 向下调整，删除堆顶元素时使用
   */
  __heapifyDown(index) {
    // 左子节点
    const leftIndex = this.__getLeftChildIndex(index);
    // 右子节点
    const rightIndex = this.__getRightChildIndex(index);
    // 三者找最小
    let minIndex = index;

    if (leftIndex < this.size() && this.heap[leftIndex] < this.heap[minIndex]) {
      minIndex = leftIndex;
    }

    if (
      rightIndex < this.size() &&
      this.heap[rightIndex] < this.heap[minIndex]
    ) {
      minIndex = rightIndex;
    }

    if (minIndex !== index) {
      this.__swap(index, minIndex);
      this.__heapifyDown(minIndex);
    }
  }
}
```

:::

## 并查集

::: code-group

```js [染色法 QuickFind]
class QuickFind {
  constructor(n) {
    this.colors = new Array(n).fill(0).map((_, i) => i);
  }

  find(x) {
    return this.colors[x];
  }

  union(x, y) {
    const xColor = this.find(x);
    const yColor = this.find(y);

    if (xColor === yColor) return;

    for (let i = 0; i < this.colors.length; i++) {
      if (this.colors[i] === xColor) {
        this.colors[i] = yColor;
      }
    }
  }

  connected(x, y) {
    return this.find(x) === this.find(y);
  }
}
```

```js [QuickUnion]
class QuickUnion {
  constructor(n) {
    this.parents = new Array(n).fill(0).map((_, i) => i);
  }

  find(x) {
    if (this.parents[x] !== x) {
      this.parents[x] = this.find(this.parents[x]);
    }
    return this.parents[x];
  }

  union(x, y) {
    const xRoot = this.find(x);
    const yRoot = this.find(y);

    if (xRoot === yRoot) return;

    this.parents[xRoot] = yRoot;
  }

  connected(x, y) {
    return this.find(x) === this.find(y);
  }
}
```

```js [路径压缩 QuickUnion]
class UnionFind {
  constructor(n) {
    this.parents = new Array(n).fill(0).map((_, i) => i);
  }

  find(x) {
    if (this.parents[x] !== x) {
      this.parents[x] = this.find(this.parents[x]);
    }
    return this.parents[x];
  }

  union(x, y) {
    const xRoot = this.find(x);
    const yRoot = this.find(y);

    if (xRoot === yRoot) return;

    this.parents[xRoot] = yRoot;
  }

  connected(x, y) {
    return this.find(x) === this.find(y);
  }
}
```

```js [带权(按秩优化) + 路径压缩 QuickUnion]
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
```

:::

## 二叉搜索树

::: code-group

```js [面向过程封装]
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

```js [面向对象封装]
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

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
```

:::

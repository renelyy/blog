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

## AVL 树(平衡二叉搜索树)

::: code-group

```js [面向过程封装]
/**
 * AVL 平衡二叉搜索树
 */

function Node(val, height = 0, left = null, right = null) {
  this.val = val;
  this.left = left;
  this.right = right;
  this.height = height;
}

function getNewNode(val) {
  return new Node(val, 1);
}

function clear(root) {
  if (root === null) return;
  clear(root.left);
  clear(root.right);
  root = null;
}

function getHeight(root) {
  if (root === null) return 0;
  return root.height;
}

function updateHeight(root) {
  root.height = 1 + Math.max(getHeight(root.left), getHeight(root.right));
}

/**
 * @description 插入元素
 * @param {Node} root
 * @param {Number} val
 * @returns
 */
function insert(root, val) {
  if (root === null) return getNewNode(val);
  if (root.val === val) return root;
  if (val < root.val) {
    root.left = insert(root.left, val);
  } else {
    root.right = insert(root.right, val);
  }

  // 插入元素以后更新树的高度
  updateHeight(root);

  // 返回调整（旋转）以后的根
  return maintain(root);
}

/**
 * @description 删除节点
 * @param {Node} root
 * @param {Number} val
 */
function remove(root, val) {
  if (root === null) return null;
  if (val < root.val) {
    root.left = remove(root.left, val);
  } else if (val > root.val) {
    root.right = remove(root.right, val);
  } else {
    // TODO: 删除节点
    if (root.left === null || root.right === null) {
      // 处理度为 0 和度为 1 的节点情况
      // 即要删除的节点没有子节点或者只有一个子节点
      let temp = root.left || root.right;
      return temp;
    } else {
      // 处理度为 2 的节点情况
      // 即要删除的节点有两个子节点
      // 可以选择前驱节点或者后继节点
      let pre = predeccessor(root); // 前驱节点
      root.val = pre.val;
      root.left = remove(root.left, pre.val);
    }
  }

  // 删除节点以后更新树的高度
  updateHeight(root);

  // 返回调整（旋转）以后的根
  return maintain(root);
}

/**
 * @description 获取前驱节点：左子树中最右边的节点
 * @param {Node} root
 */
function predeccessor(root) {
  let temp = root.left;
  while (temp.right !== null) temp = temp.right;
  return temp;
}

/**
 * @description 维护平衡
 * @param {Node} root
 */
function maintain(root) {
  // TODO: 维护平衡
  // 当前节点是否平衡的条件的是左右子树的高度差是否小于等于 1
  // 左右子树的高度差小于 2，说明是平衡的，不需要调整，直接返回即可
  if (Math.abs(getHeight(root.left) - getHeight(root.right)) < 2) return root;

  // 左子树的高度大于右子树的高度
  if (getHeight(root.left) > getHeight(root.right)) {
    // L
    if (getHeight(root.left.left) > getHeight(root.left.right)) {
      // LL
      return rightRotate(root);
    } else {
      // LR
      root.left = leftRotate(root.left);
      return rightRotate(root);
    }
  } else {
    // R
    if (getHeight(root.right.right) > getHeight(root.right.left)) {
      // RR
      return leftRotate(root);
    } else {
      // RL
      root.right = rightRotate(root.right);
      return leftRotate(root);
    }
  }
}

/**
 * @description 左旋
 * @param {Node} root
 */
function leftRotate(root) {
  // TODO: 左旋
  // newRoot 指向左旋以后新的根节点：应该是当前根节点的右子树
  let newRoot = root.right;
  root.right = newRoot.left;
  newRoot.left = root;
  updateHeight(root);
  updateHeight(newRoot);
  return newRoot;
}

/**
 * @description 右旋
 * @param {Node} root
 */
function rightRotate(root) {
  // TODO: 右旋
  let newRoot = root.left;
  root.left = newRoot.right;
  newRoot.right = root;
  updateHeight(root);
  updateHeight(newRoot);
  return newRoot;
}

function output(root) {
  if (root === null) return;
  output(root.left);
  console.log(root.val);
  output(root.right);
}
```

```js [面向对象封装]
class AVLTreeNode {
  constructor(val, height = 1, left = null, right = null) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.height = height;
  }
}

class AVLTree {
  static getNewNode(val) {
    return new AVLTreeNode(val);
  }

  constructor() {
    this.root = null;
  }

  add(val) {
    this.root = this._insert(this.root, val);
  }

  delete(val) {
    this.root = this._remove(this.root, val);
  }

  output() {
    this._output(this.root);
  }

  _insert(root, val) {
    if (root === null) return AVLTree.getNewNode(val);
    if (val === root.val) return root;
    if (val < root.val) {
      root.left = this._insert(root.left, val);
    } else {
      root.right = this._insert(root.right, val);
    }

    // 插入元素以后更新树的高度
    this._updateHeight(root);

    // 返回调整（旋转）以后的根
    return this._maintain(root);
  }

  _remove(root, val) {
    if (root === null) return null;
    if (val < root.val) {
      root.left = this._remove(root.left, val);
    } else if (val > root.val) {
      root.right = this._remove(root.right, val);
    } else {
      // TODO: 删除节点
      if (root.left === null || root.right === null) {
        // 处理度为 0 和度为 1 的节点情况
        // 即要删除的节点没有子节点或者只有一个子节点
        let temp = root.left || root.right;
        return temp;
      } else {
        // 处理度为 2 的节点情况
        // 即要删除的节点有两个子节点
        // 可以选择前驱节点或者后继节点
        let pre = this._predeccessor(root); // 前驱节点
        root.val = pre.val;
        root.left = this._remove(root.left, pre.val);
      }
    }

    // 插入元素以后更新树的高度
    this._updateHeight(root);

    // 返回调整（旋转）以后的根
    return this._maintain(root);
  }

  _predeccessor(root) {
    let temp = root.left;
    while (temp.right !== null) temp = temp.right;
    return temp;
  }

  _getHeight(root) {
    if (root === null) return 0;
    return root.height;
  }

  _deltaHeight(root) {
    return Math.abs(this._getHeight(root.left) - this._getHeight(root.right));
  }

  _maxHeight(root) {
    return Math.max(this._getHeight(root.left), this._getHeight(root.right));
  }

  _updateHeight(root) {
    root.height = this._maxHeight(root) + 1;
  }

  /**
   * @description 通过旋转保持平衡
   * @param {AVLTreeNode} root
   * @returns
   */
  _maintain(root) {
    // TODO: 维护平衡
    // 当前节点是否平衡的条件的是左右子树的高度差是否小于 2
    // 左右子树的高度差小于 2，说明是平衡的，不需要调整，直接返回即可
    if (this.__deltaHeight(root) < 2) return root;

    // 左子树的高度大于右子树的高度，说明是 L-型不平衡
    if (this._getHeight(root.left) > this._getHeight(root.right)) {
      if (this._getHeight(root.left.left) > this._getHeight(root.left.right)) {
        // LL 型
        return this._rightRotate(root);
      } else {
        // LR 型
        root.left = this._leftRotate(root.left);
        return this._rightRotate(root);
      }
    } else {
      if (
        this._getHeight(root.right.right) > this._getHeight(root.right.left)
      ) {
        // RR 型
        return this._leftRotate(root);
      } else {
        // RL 型
        root.right = this._rightRotate(root.right);
        return this._leftRotate(root);
      }
    }
  }

  _leftRotate(root) {
    // TODO: 左旋
    let newRoot = root.right;
    root.right = newRoot.left;
    newRoot.left = root;
    this._updateHeight(root);
    this._updateHeight(newRoot);
    return newRoot;
  }

  _rightRotate(root) {
    // TODO: 右旋
    let newRoot = root.left;
    root.left = newRoot.right;
    newRoot.right = root;
    this._updateHeight(root);
    this._updateHeight(newRoot);
    return newRoot;
  }

  _output(root) {
    if (root === null) return;
    this._output(root.left);
    console.log(root.val);
    this._output(root.right);
  }
}
```

```js [虚拟节点]
const nullptr = { val: null, left: null, right: null, height: 0 };

class AVLTreeNode {
  constructor(val, height = 0, left = nullptr, right = nullptr) {
    this.val = val;
    this.left = left;
    this.right = right;
    this.height = height;
  }

  static getNewNode(val) {
    return new AVLTreeNode(val, 1);
  }
}

class AVLTree {
  constructor() {
    this.root = nullptr;
  }

  insert(val) {
    this.root = this.__insert(this.root, val);
  }

  remove(val) {
    this.root = this.__remove(this.root, val);
  }

  output(root) {
    if (root === nullptr) return;
    this.output(root.left);
    console.log(root.val);
    this.output(root.right);
  }

  __insert(root, val) {
    if (root === nullptr) return AVLTreeNode.getNewNode(val);
    if (val === root.val) return root;
    if (val < root.val) root.left = this.__insert(root.left, val);
    else if (val > root.val) root.right = this.__insert(root.right, val);

    // 更新树高
    this.__updateHeight(root);

    // 返回调整（旋转）以后的根
    return this.__maintain(root);
  }

  __remove(root, val) {
    if (root === nullptr) return nullptr;
    if (val < root.val) root.left = this.__remove(root.left, val);
    else if (val > root.val) root.right = this.__remove(root.right, val);
    else {
      if (root.left === nullptr || root.right === nullptr) {
        // 处理度为 0 和 度为 1 的节点情况
        return root.left || root.right;
      } else {
        // 处理度为 2 的节点情况
        const pre = this.__predeccessor(root);
        root.val = pre.val;
        root.left = this.__remove(root.left, pre.val);
      }
    }

    // 更新树高
    this.__updateHeight(root);

    // 返回调整（旋转）以后的根
    return this.__maintain(root);
  }

  __predeccessor(root) {
    let temp = root.left;
    while (temp.right !== nullptr) temp = temp.right;
    return temp;
  }

  __updateHeight(root) {
    root.height = Math.max(root.left.height, root.right.height) + 1;
  }

  __maintain(root) {
    // TODO: 维护平衡
    // 当前节点是否平衡的条件的是左右子树的高度差是否小于 2
    // 左右子树的高度差小于 2，说明是平衡的，不需要调整，直接返回即可
    if (Math.abs(root.left.height - root.right.height) < 2) return root;

    // 左子树的高度大于右子树的高度，说明是 L-型不平衡
    if (root.left.height > root.right.height) {
      if (root.left.left.height > root.left.right.height) {
        // LL 型
        return this.__rightRotate(root);
      } else {
        // LR 型
        root.left = this.__leftRotate(root.left);
        return this.__rightRotate(root);
      }
    } else {
      if (root.right.right.height > root.right.left.height) {
        // RR 型
        return this.__leftRotate(root);
      } else {
        // RL 型
        root.right = this.__rightRotate(root.right);
        return this.__leftRotate(root);
      }
    }
  }

  __leftRotate(root) {
    // TODO: 左旋
    let newRoot = root.right;
    root.right = newRoot.left;
    newRoot.left = root;
    this.__updateHeight(root);
    this.__updateHeight(newRoot);
    return newRoot;
  }

  __rightRotate(root) {
    // TODO: 右旋
    let newRoot = root.left;
    root.left = newRoot.right;
    newRoot.right = root;
    this.__updateHeight(root);
    this.__updateHeight(newRoot);
    return newRoot;
  }
}
```

:::

## Trie 树（字典树）

::: code-group

```js
class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let p = this.root;
    for (let i = 0; i < word.length; i++) {
      let c = word[i];
      if (!p.children[c]) p.children[c] = new TrieNode();
      p = p.children[c];
    }
    p.isEnd = true; // 标记单词结束
  }

  search(word) {
    let p = this.root;
    for (let i = 0; i < word.length; i++) {
      let c = word[i];
      if (!p.children[c]) return false;
      p = p.children[c];
    }
    return p.isEnd; // 判断单词是否结束
  }
}
```

:::

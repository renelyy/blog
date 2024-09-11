---
outline: [1, 2] # 显示 # 和 ## 级别标题
---

::: tip

<b>二叉树总数：</b> `5`

:::

# 简单题

## 1. [144. 二叉树的前序遍历](https://leetcode.cn/problems/binary-tree-preorder-traversal/description/)

::: code-group

```js [递归]
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[]}
 */
var preorderTraversal = function (root) {
  // 定义返回结果数组
  const ret = [];
  // 边界特判
  if (root === null) return ret;
  const preOrderTraversalHelper_I = root => {
    if (root === null) return;
    ret.push(root.val);
    preOrderTraversalHelper_I(root.left);
    preOrderTraversalHelper_I(root.right);
  };
};
```

```js [非递归-借助栈1]
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[]}
 */
var preorderTraversal = function (root) {
  // 定义返回结果数组
  const ret = [];
  // 边界特判
  if (root === null) return ret;
  // 左右一起入栈
  const preOrderTraversalHelper_II = root => {
    const stack = [root];
    while (stack.length) {
      let top = stack.pop();
      ret.push(top.val);
      if (top.right) stack.push(top.right);
      if (top.left) stack.push(top.left);
    }
  };
};
```

```js [非递归-借助栈2]
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[]}
 */
var preorderTraversal = function (root) {
  // 定义返回结果数组
  const ret = [];
  // 边界特判
  if (root === null) return ret;
  const preOrderTraversalHelper_III = root => {
    let stack = [],
      cur = root;
    while (stack.length || cur) {
      if (cur) {
        // 可以深入左孩子时，先访问，再深入
        ret.push(cur.val);
        stack.push(cur);
        cur = cur.left;
      } else {
        // 否则，深入栈中的右孩子
        let top = stack.pop();
        cur = top.right;
      }
    }
  };

  preOrderTraversalHelper_III(root);
};
```

```js [Morris 遍历]
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[]}
 */
var preorderTraversal = function (root) {
  // 定义返回结果数组
  const ret = [];
  // 边界特判
  if (root === null) return ret;
  const morrisPreOrderTraversalHelper_IV = root => {
    let cur = root,
      prev = null;
    while (cur) {
      if (cur.left === null) {
        ret.push(cur.val);
        cur = cur.right;
      } else {
        prev = cur.left;
        while (prev.right !== null && prev.right !== cur) prev = prev.right;
        if (prev.right === null) {
          ret.push(cur.val);
          prev.right = cur;
          cur = cur.left;
        } else {
          prev.right = null;
          cur = cur.right;
        }
      }
    }
  };
};
morrisPreOrderTraversalHelper_IV(root);
```

:::

## 2. [94. 二叉树的中序遍历](https://leetcode.cn/problems/binary-tree-inorder-traversal/description/)

::: code-group

```js [迭代实现]
const inorderTraversalIteratively = root => {
  const ret = [];
  const stack = [];
  while (root || stack.length) {
    while (root) {
      stack.push(root);
      root = root.left;
    }
    root = stack.pop();
    ret.push(root.val);
    root = root.right;
  }
  return ret;
};
```

```js [递归实现]
const inorderTraversalRecursively = root => {
  const ret = [];
  const helper = root => {
    if (!root) return;
    helper(root.left);
    ret.push(root.val);
    helper(root.right);
  };
  helper(root);
  return ret;
};
```

```js [Mirrors 中序遍历]
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[]}
 */
var inorderTraversal = function (root) {
  // Mirrors 中序遍历
  if (root === null) return [];
  const ret = [];
  const mirrorsInorderTraversal = root => {
    let prev = null,
      cur = root;
    while (cur) {
      if (cur.left === null) {
        ret.push(cur.val);
        cur = cur.right;
      } else {
        prev = cur.left;
        while (prev.right !== null && prev.right !== cur) prev = prev.right;
        if (prev.right === null) {
          prev.right = cur;
          cur = cur.left;
        } else {
          ret.push(cur.val);
          prev.right = null;
          cur = cur.right;
        }
      }
    }
  };
  mirrorsInorderTraversal(root);
  return ret;
};
```

:::

## 3. [145. 二叉树的后序遍历](https://leetcode.cn/problems/binary-tree-postorder-traversal/description/)

::: code-group

```js [迭代实现1]
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[]}
 */
var postorderTraversal = function (root) {
  let ret = [];
  // 特判
  if (!root) return ret;

  // 方法二：迭代 通过栈
  // 后序 左右根 => 根右左
  let stack = [root];
  while (stack.length) {
    let top = stack.pop();
    ret.push(top.val);
    top.left && stack.push(top.left);
    top.right && stack.push(top.right);
  }
  return ret.reverse();
};
```

```js [迭代实现2]
const postorderTraversalIteratively = root => {
  const ret = [];
  const stack = [];
  while (root || stack.length) {
    while (root) {
      stack.push(root);
      ret.unshift(root.val);
      root = root.right;
    }
    root = stack.pop();
    root = root.left;
  }
  return ret;
};
```

```js [递归实现]
const postorderTraversalRecursively = root => {
  const ret = [];
  const helper = root => {
    if (!root) return;
    helper(root.left);
    helper(root.right);
    ret.push(root.val);
  };
  helper(root);
  return ret;
};
```

:::

## 4. [面试题 04.04. 检查二叉树的平衡性](https://leetcode.cn/problems/check-balance-lcci/description/)

::: code-group

```js [自顶向下]
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @return {boolean}
 */
var isBalanced = function (root) {
  if (!root) return true; // 空树是平衡的
  const left = height(root.left);
  const right = height(root.right);
  return (
    Math.abs(left - right) <= 1 &&
    isBalanced(root.left) &&
    isBalanced(root.right)
  );
};

const height = root => {
  if (!root) return 0;
  return Math.max(height(root.left), height(root.right)) + 1;
};
```

```js [自底向上]
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {TreeNode} root
 * @return {boolean}
 */
var isBalanced = function (root) {
  return height(root) >= 0;
};

/**
 * 返回树的高度，如果树不是平衡的，返回 -1
 */
const height = root => {
  if (!root) return 0;
  const left = height(root.left);
  const right = height(root.right);
  if (left === -1 || right === -1 || Math.abs(left - right) > 1) {
    return -1;
  }
  return Math.max(left, right) + 1;
};
```

:::

# 中等题

## 1. [116. 填充每个节点的下一个右侧节点指针](https://leetcode.cn/problems/populating-next-right-pointers-in-each-node/description/)

::: code-group

```js [层序遍历实现]
/**
 * // Definition for a _Node.
 * function _Node(val, left, right, next) {
 *    this.val = val === undefined ? null : val;
 *    this.left = left === undefined ? null : left;
 *    this.right = right === undefined ? null : right;
 *    this.next = next === undefined ? null : next;
 * };
 */

/**
 * @param {_Node} root
 * @return {_Node}
 */
var connect = function (root) {
  // 层序遍历，将该节点的 next 指针指向下一个孩子节点
  if (root === null) return null;
  const queue = [root];

  while (queue.length) {
    let i = 0,
      len = queue.length;
    while (i < len) {
      let top = queue.shift();
      i++;
      if (i < len) top.next = queue[0];
      if (top.left) queue.push(top.left);
      if (top.right) queue.push(top.right);
    }
  }

  return root;
};
```

```js [使用已建立的 next 指针1]
/**
 * // Definition for a _Node.
 * function _Node(val, left, right, next) {
 *    this.val = val === undefined ? null : val;
 *    this.left = left === undefined ? null : left;
 *    this.right = right === undefined ? null : right;
 *    this.next = next === undefined ? null : next;
 * };
 */

/**
 * @param {_Node} root
 * @return {_Node}
 */
var connect = function (root) {
  if (root === null) return null;
  let pLevel = root;
  while (pLevel.left) {
    let head = pLevel;
    while (head) {
      head.left.next = head.right;
      if (head.next) {
        head.right.next = head.next.left;
      }
      head = head.next;
    }
    // 因为是完美二叉树，所以直接可以通过 left 指向下一层继续遍历
    pLevel = pLevel.left;
  }

  return root;
};
```

```js [使用已建立的 next 指针2]
/**
 * // Definition for a _Node.
 * function _Node(val, left, right, next) {
 *    this.val = val === undefined ? null : val;
 *    this.left = left === undefined ? null : left;
 *    this.right = right === undefined ? null : right;
 *    this.next = next === undefined ? null : next;
 * };
 */

/**
 * @param {_Node} root
 * @return {_Node}
 */
var connect = function (root) {
  if (root === null) return null;

  let pLevel = root;

  while (pLevel) {
    let cur = pLevel;
    let tail = new _Node(0);

    while (cur) {
      if (cur.left) {
        tail.next = cur.left;
        tail = tail.next;
      }
      if (cur.right) {
        tail.next = cur.right;
        tail = tail.next;
      }

      cur = cur.next;
    }

    pLevel = pLevel.left;
  }

  return root;
};
```

:::

## 2. [117. 填充每个节点的下一个右侧节点指针 II](https://leetcode.cn/problems/populating-next-right-pointers-in-each-node-ii/description/)

::: code-group

```js [层序遍历实现]
/**
 * // Definition for a _Node.
 * function _Node(val, left, right, next) {
 *    this.val = val === undefined ? null : val;
 *    this.left = left === undefined ? null : left;
 *    this.right = right === undefined ? null : right;
 *    this.next = next === undefined ? null : next;
 * };
 */

/**
 * @param {_Node} root
 * @return {_Node}
 */
var connect = function (root) {
  if (!root) return root;
  const queue = [root];
  while (queue.length) {
    const len = queue.length;
    for (let i = 0; i < len; i++) {
      const front = queue.shift();
      if (i < len - 1) {
        front.next = queue[0];
      }
      front.left && queue.push(front.left);
      front.right && queue.push(front.right);
    }
  }
  return root;
};
```

```js [使用已建立的 next 指针]
/**
 * // Definition for a _Node.
 * function _Node(val, left, right, next) {
 *    this.val = val === undefined ? null : val;
 *    this.left = left === undefined ? null : left;
 *    this.right = right === undefined ? null : right;
 *    this.next = next === undefined ? null : next;
 * };
 */

/**
 * @param {_Node} root
 * @return {_Node}
 */
var connect = function (root) {
  // 边界特判
  if (root === null) return null;

  let pLevel = root;
  // 外层遍历每一层
  while (pLevel) {
    // cur 指向当前节点，当前节点用于遍历当前层的所有节点
    // （因为已经连成链表，所以可以通过 next 指针遍历当前层的所有节点）
    let cur = pLevel;

    // 因为上面的 cur 是为了处理下一层的指针连接，而 tail 就是指向下一层链表的尾节点
    // 使用虚拟节点好处理（思考下为什么？）
    let tail = new _Node(0);

    while (cur) {
      if (cur.left) {
        tail.next = cur.left;
        tail = tail.next;
      }

      if (cur.right) {
        tail.next = cur.right;
        tail = tail.next;
      }
      cur = cur.next;
    }

    // 指向下一层
    // pLevel = pLevel.left || pLevel.right;
    // 为什么要通过下面的方式指向下一层呢？
    //                 2
    //                / \
    //               3   4
    //                  / \
    //                 5   6
    // 可能有这种结构，明白了吧，😄😄
    // 当然，有些解法也是直接在遍历的过程中记录的 nextStart 即我们现在要找的 temp，都可以
    let q = pLevel,
      temp = null;
    while (q && temp === null) {
      if (q.left || q.right) {
        temp = q.left || q.right;
      }
      q = q.next;
    }
    pLevel = temp;
  }

  return root;
};
```

:::

## 3. [449. 序列化和反序列化二叉搜索树](https://leetcode.cn/problems/serialize-and-deserialize-bst/description/)

# 困难题

## 1. [297. 二叉树的序列化与反序列化](https://leetcode.cn/problems/serialize-and-deserialize-binary-tree/description/)

# 15 分钟没有思路的题目

## 1. [331. 验证二叉树的前序序列化](https://leetcode.cn/problems/verify-preorder-serialization-of-a-binary-tree/description/)

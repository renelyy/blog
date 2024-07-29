# 链表

> 简单题

## 1. [21. 合并两个有序链表](https://leetcode-cn.com/problems/merge-two-sorted-lists/)

```javascript
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
var mergeTwoLists = function (list1, list2) {
  /**
   * 采用递归
   */
  const mergeTwoListsI = (l1, l2) => {
    if (l1 === null) return l2;
    if (l2 === null) return l1;
    if (l1.val < l2.val) {
      l1.next = mergeTwoLists(l1.next, l2);
      return l1;
    } else {
      l2.next = mergeTwoLists(l2.next, l1);
      return l2;
    }
  };

  /**
   * 比较头节点，创建节点，没有破坏原链表
   */
  const mergeTwoListsII = (l1, l2) => {
    if (l1 === null) return l2;
    if (l2 === null) return l1;
    let vhead = new ListNode(),
      p = l1,
      q = l2,
      tail = vhead;
    while (p && q) {
      if (p.val < q.val) {
        tail.next = new ListNode(p.val);
        p = p.next;
      } else {
        tail.next = new ListNode(q.val);
        q = q.next;
      }
      tail = tail.next;
    }
    let remainder = p || q;
    while (remainder) {
      tail.next = new ListNode(remainder.val);
      tail = tail.next;
      remainder = remainder.next;
    }
    return vhead.next;
  };

  /**
   * 比较头节点，不创建节点，直接修改原始指针指向
   */
  const mergeTwoListsIII = (l1, l2) => {
    if (l1 === null) return l2;
    if (l2 === null) return l1;
    let vhead = new ListNode(),
      tail = vhead;
    while (l1 && l2) {
      if (l1.val < l2.val) {
        tail.next = l1;
        l1 = l1.next;
      } else {
        tail.next = l2;
        l2 = l2.next;
      }
      tail = tail.next;
    }
    tail.next = l1 || l2;
    return vhead.next;
  };

  const mergeTwoListsIV = (l1, l2) => {
    if (l1 === null) return l2;
    if (l2 === null) return l1;
    const vhead = new ListNode();
    let p = vhead;
    while (l1 || l2) {
      if (l2 === null || (l1 !== null && l1.val < l2.val)) {
        p.next = l1;
        l1 = l1.next;
      } else {
        p.next = l2;
        l2 = l2.next;
      }
      p = p.next;
    }

    return vhead.next;
  };

  // return mergeTwoListsI(list1, list2);
  // return mergeTwoListsII(list1, list2);
  // return mergeTwoListsIII(list1, list2);
  return mergeTwoListsIV(list1, list2);
};
```

## 2. [141. 环形链表](https://leetcode.cn/problems/linked-list-cycle/description/)

```js
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

/**
 * @param {ListNode} head
 * @return {boolean}
 */
var hasCycle = function (head) {
  // 使用 set 存储访问过的节点
  // 时间复杂度 O(N)
  // 空间复杂度 O(N)
  function _hasCycle_1() {
    if (head === null) return false;
    const set = new Set();
    let p = head;
    while (p) {
      if (set.has(p)) return true;
      set.add(p);
      p = p.next;
    }
    return false;
  }

  // 快慢指针
  // 时间复杂度 O(N)
  // 空间复杂度 O(1)
  function _hasCycle_2() {
    if (head === null || head.next === null) return false;
    let p = head,
      q = head.next;
    // 如果在没有环的情况下，快指针会率先等于 null，所以这里没必要 判断满指针
    // while (p && q && q.next && p !== q) {
    while (q && q.next && p !== q) {
      p = p.next;
      q = q.next.next;
    }

    return p === q;
  }

  // 换个写法也行
  function _hasCycle_3() {
    if (head === null || head.next === null) return false;
    let fast = (slow = head);
    do {
      fast = fast.next.next;
      slow = slow.next;
    } while (fast && fast.next && fast !== slow);
    return fast === slow;
  }

  return _hasCycle_3();
  // return _hasCycle_2()
  // return _hasCycle_1()
};
```

## 3. [206. 反转链表](https://leetcode.cn/problems/reverse-linked-list/description/)

::: code-group

```js [迭代]
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function (head) {
  if (head === null || head.next === null) return head;
  let p = null;
  let q = head;
  let r = head.next;
  do {
    q.next = p;
    p = q;
    q = r;
    r && (r = r.next);
  } while (q);
  return p;
};
```

```js [递归1]
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function (head) {
  if (head === null || head.next === null) return head;

  let tail = head.next;
  let p = reverseList(head.next);
  head.next = null;
  tail.next = head;
  return p;
};
```

```js [递归2]
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function (head) {
  // 此时不需要反转，直接返回节点即可
  if (head === null || head.next === null) return head;
  let tail = head.next,
    q = reverseList(head.next);
  // 其实 tail.next 一直为 null
  // 这里主要目的是想置 head.next = null，防止出现环，因为 tail.next 马上要指向 head 了
  // 原来本来 head.next 就指向 tail，tail.next 再指向 head就会出现环了，
  // 可以直接 head.next = null
  // 而正好 tail.next 一直为 null，所以也可以 head.next = tail.next
  // 所以为什么 tail.next 一直为 null 呢？
  // 答：我们可以模拟一下
  /**
    1 -> 2 -> 3 -> 4 -> 5 -> 6 -> null
    当 head = 5时，tail = head.next = 6
    所以再次递归进入后，直接会返回 6，回溯回来以后，而此时 tail.next 的的确确是指向 null 的
    后续的操作把 head.next 指向了 tail.next 即 null，
    所以回溯的时候，tail.next 一直为 null
   */
  // 回溯时，由于 tail.next = null，由于第一次的 head.next = tail.next = null
  // 所以在回溯时，tail.next 一直为 null，因为在回溯前，就将其设置为 null 了
  // 因为回溯前的 head.next 其实就是回溯后的tail
  /**
                          head  tail
                            |     |
    1 --> 2 --> 3 --> 4 --> 5 -\-> 6 --> null
                            |      |
                          null     p
        回溯下一轮的 tail 指向 5，其 tail.next 当然为 null
   */
  head.next = tail.next;
  tail.next = head;
  return q;
};
```

:::

> 中等题

> 困难题

# 二叉树

> 简单题

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

> 中等题

> 困难题

# 数组

# 栈

# 队列

# 哈希表

# 字符串

# 图

# 排序

# 搜索

# 动态规划

# 贪心算法

# 位运算

# 数学

```

```

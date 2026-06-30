# LeetCode 题解（2）

[← 返回索引](../index.md)

> 迁移自 profile algorithm/leetCode/code，第 2 批

---

## 142.环形链表-ii

> 来源：`profile/algorithm/leetCode/code/142.环形链表-ii.js`

```javascript
/*
 * @lc app=leetcode.cn id=142 lang=javascript
 *
 * [142] 环形链表 II
 */

// @lc code=start
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var detectCycle = function (head) {
  // 一个节点无环
  if (head === null || head.next === null) return null
  let p = head
  let q = head
  // 思考：如果用while循环怎么写？
  do {
    p = p.next
    q = q.next.next
  } while (p !== q && q && q.next)
  if (q === null || q.next === null) return null
  // 一定有环
  p = head
  while (p !== q) {
    p = p.next
    q = q.next
  }
  return q
};
// @lc code=end
```

---

## 144.二叉树的前序遍历

> 来源：`profile/algorithm/leetCode/code/144.二叉树的前序遍历.js`

```javascript
/*
 * @lc app=leetcode.cn id=144 lang=javascript
 *
 * [144] 二叉树的前序遍历
 */

// @lc code=start
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
  let ret = []
  function fn(root) {
    if (root === null) return // 递归的结束条件
    ret.push(root.val)
    fn(root.left)
    fn(root.right)
  }
  fn(root)
  return ret
};
// @lc code=end
```

---

## 145.二叉树的后序遍历

> 来源：`profile/algorithm/leetCode/code/145.二叉树的后序遍历.js`

```javascript
/*
 * @lc app=leetcode.cn id=145 lang=javascript
 *
 * [145] 二叉树的后序遍历
 */

// @lc code=start
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
 var postorderTraversal = function(root) {
  let ret = []
  // 特判
  if (!root) return ret
  
  // 方法二：迭代 通过栈
  // 后序 左右根 => 根右左
  let stack = [root]
  while (stack.length) {
    let top = stack.pop()
    ret.push(top.val)
    top.left && stack.push(top.left)
    top.right && stack.push(top.right)
  }
  return ret.reverse()

  // 方法一：递归
  function _postorderTraversal (root) {
    // 递归的结束条件
    if (!root) return
    root.left && _postorderTraversal(root.left)
    root.right && _postorderTraversal(root.right)
    ret.push(root.val)
  }
  _postorderTraversal(root)
  return ret
};
// @lc code=end
```

---

## 146.lru-缓存

> 来源：`profile/algorithm/leetCode/code/146.lru-缓存.js`

```javascript
/*
 * @lc app=leetcode.cn id=146 lang=javascript
 *
 * [146] LRU 缓存
 */

// @lc code=start

/**
 * @param {Number} capacity
 */
const LRUCache = function (capacity) {
  this.capacity = capacity;
  this._cache = new Map();
};

/**
 * @param {Number} key
 * @returns {Number}
 */
LRUCache.prototype.get = function (key) {
  const { _cache } = this;
  if (!_cache.has(key)) return -1;

  const val = _cache.get(key);
  // 这一步很关键，因为 Map 会保留插入顺序，所以删除后重新插入可以保证最活跃的是最后插入的
  _cache.delete(key);
  _cache.set(key, val);
  return val;
};

/**
 * @param {Number} key
 * @param {Number} value
 */
LRUCache.prototype.put = function (key, value) {
  const { _cache, capacity } = this;
  if (_cache.has(key)) {
    // 如果有值，删除以后重新插入，可以保证最活跃的值最后插入
    _cache.delete(key);
  }

  if (_cache.size === capacity) {
    const iterator = _cache.keys();
    // Map 的遍历顺序就是插入顺序，所以第一个迭代器访问的就是最先被插入的
    const firstInsertKey = iterator.next().value;
    _cache.delete(firstInsertKey);
  }

  _cache.set(key, value);
};

/**
 * Your LRUCache object will be instantiated and called as such:
 * var obj = new LRUCache(capacity)
 * var param_1 = obj.get(key)
 * obj.put(key,value)
 */
// @lc code=end
```

---

## 15.三数之和

> 来源：`profile/algorithm/leetCode/code/15.三数之和.js`

```javascript
/*
 * @lc app=leetcode.cn id=15 lang=javascript
 *
 * [15] 三数之和
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var threeSum = function (nums) {
  let ans = []
  if (!Array.isArray(nums) || nums.length < 3) return ans
  const len = nums.length
  nums.sort((a, b) => a - b)
  for (let i = 0; i < len; i++) {
    if (nums[i] > 0) break
    if (i > 0 && nums[i] == nums[i - 1]) continue
    let L = i + 1
    let R = len - 1
    while (L < R) {
      const sum = nums[i] + nums[L] + nums[R];
      if (sum == 0) {
        ans.push([nums[i], nums[L], nums[R]]);
        while (L < R && nums[L] == nums[L + 1]) L++
        while (L < R && nums[R] == nums[R - 1]) R--
        L++
        R--
      }
      else if (sum < 0) L++
      else if (sum > 0) R--
    }
  }
  return ans
}
console.log(threeSum([0,0,0,0]))
// console.log(threeSum([-2, -1, 0, 1, 2, 3]))
// @lc code=end
```

---

## 18.四数之和

> 来源：`profile/algorithm/leetCode/code/18.四数之和.js`

```javascript
/*
 * @lc app=leetcode.cn id=18 lang=javascript
 *
 * [18] 四数之和
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[][]}
 */
 var fourSum = function(nums, target) {
  nums.sort()
  let ret = []
  let l1 = 0, l4 = nums.length - 1
  while (l1 < l4) {
    let l2 = l1 + 1, l3 = l2 + 1
    while (l3 < l4) {
      let val = nums[l1] + nums[l2] + nums[l3] + nums[l4]
      if (val < target) {
        l3++
        l4 = l3 + 1
        
      else if (val === target) {
        ret.push([nums[l1], nums[l2], nums[l3], nums[l4]])
        l3++
        l4--
      } else if (val > target) l4--
    }
    l1++
    l2--
  }
  return ret
};

fourSum([1,0,-1,0,-2,2], 0)
// @lc code=end
```

---


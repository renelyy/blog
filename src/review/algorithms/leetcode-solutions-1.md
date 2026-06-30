# LeetCode 题解（1）

[← 返回索引](../index.md)

> 迁移自 profile algorithm/leetCode/code，第 1 批

---

## 1.两数之和

> 来源：`profile/algorithm/leetCode/code/1.两数之和.js`

```javascript
/*
 * @lc app=leetcode.cn id=1 lang=javascript
 *
 * [1] 两数之和
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
  // 暴力方法 时间复杂度 O(n^2)
  // for (let i = 0; i < nums.length; i++) {
  //   for (let j = i + 1; j < nums.length; j++) {
  //     if (nums[i] + nums[j] === target) {
  //       return [i, j]
  //     }
  //   }
  // }

  // 扩展数组 时间复杂度 O(n) 空间复杂度 O(n)
  let arr = []
  for (let i = 0; i < nums.length; i++) {
    let tmp = target - nums[i]
    if (arr[tmp] !== undefined) {
      return [i, arr[tmp]]
    }
    arr[nums[i]] = i
  }
};
// @lc code=end
```

---

## 102.二叉树的层序遍历

> 来源：`profile/algorithm/leetCode/code/102.二叉树的层序遍历.js`

```javascript
/*
 * @lc app=leetcode.cn id=102 lang=javascript
 *
 * [102] 二叉树的层序遍历
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
 * @return {number[][]}
 */
var levelOrder = function (root) {
  let queue = [], ret = []
  if (root !== null) queue.push(root)
  while (queue.length) {
    // 保存当前层级的数据
    let curLevel = []
    let curLength = queue.length
    // 取所有当前层的数据保存
    // 注意：这里不能用queue.length 因为 queue.length 是动态变化的
    for (let i = 0; i < curLength; i++) {
      let top = queue.shift()
      curLevel.push(top.val)
      if (top.left) queue.push(top.left)
      if (top.right) queue.push(top.right)
    }
    ret.push(curLevel)
  }
  return ret
};
// @lc code=end
```

---

## 1021.删除最外层的括号

> 来源：`profile/algorithm/leetCode/code/1021.删除最外层的括号.js`

```javascript
/*
 * @lc app=leetcode.cn id=1021 lang=javascript
 *
 * [1021] 删除最外层的括号
 */

// @lc code=start
/**
 * @param {string} S
 * @return {string}
 */
var removeOuterParentheses = function (S) {
  let ret = ''
  for (let i = 0, pre = 0, cnt = 0; i < S.length; i++) {
    S[i] === '('
      ? cnt += 1
      : cnt -= 1
    if (cnt !== 0) continue
    ret += S.slice(pre + 1, i)
    pre = i + 1
  }
  return ret
};
// @lc code=end
```

---

## 1209.删除字符串中的所有相邻重复项-ii

> 来源：`profile/algorithm/leetCode/code/1209.删除字符串中的所有相邻重复项-ii.js`

```javascript
/*
 * @lc app=leetcode.cn id=1209 lang=javascript
 *
 * [1209] 删除字符串中的所有相邻重复项 II
 */

// @lc code=start
/**
 * @param {string} s
 * @param {number} k
 * @return {string}
 */
 var removeDuplicates = function(s, k) {
  /**
  思路：把栈顶元素和当前元素合并作为一个整体
    1. 遍历s时取出栈顶元素，判断和当前元素相不相等。不相等，入栈当前元素。否则，进行第2步
    2. 说明当前元素和栈顶元素相等。判断栈顶元素长度是否小于k-1，如果是，则合并后入栈。否则，重复执行1、2步
     |  aa  |
     |  b   |
     |  c   |
     |  dd  |

     unshift/shift          push/pop
     --------------------------------
     1 2 4 6 3 8 9 20 38 30 29 59 80
     --------------------------------
   */
  const stack = []
  for (cur of s) {
    let top = stack.pop()
    // 栈为空时直接入栈
    if (top === undefined) {
      stack.push(cur)
    } else if (top[0] !== cur) {
      stack.push(top)
      stack.push(cur)
    } else if (top.length < k - 1) {
      stack.push(top + cur)
    }
  }
  return stack.join('')
};
// @lc code=end
```

---

## 1249.移除无效的括号

> 来源：`profile/algorithm/leetCode/code/1249.移除无效的括号.js`

```javascript
/*
 * @lc app=leetcode.cn id=1249 lang=javascript
 *
 * [1249] 移除无效的括号
 */

// @lc code=start
/**
 * @description 第一种解题思路：字符串向右扫描一遍，再向左扫描一遍，分别去掉多余的括号
 *  (1) 向右扫描，如果是左括号或者数字，则直接追加的字符串末尾；
 *  (2) 遇到左括号计数加一，遇到右括号计数减一，如果当前计数已经为0，
 *    则表示当前的右括号为无效括号；跳过不追加给字符串即可；
 *  (3) 向左扫描同理。
 * @param {string} s
 * @return {string}
 */
var minRemoveToMakeValid = function (s) {
  let ret = ''
  for (let i = 0, cnt = 0; i < s.length; i++) {
    if (s[i] === '(' || s[i] !== ')') {
      ret += s[i]
      cnt += (s[i] === '(')
    } else {
      if (cnt === 0) continue
      cnt -= 1
      ret += s[i]
    }
  }
  let ss = ''
  for (let i = ret.length - 1, cnt = 0; i >= 0; i--) {
    if (ret[i] === ')' || ret[i] !== '(') {
      ss = ret[i] + ss
      cnt += (ret[i] === ')')
    } else {
      if (cnt === 0) continue
      cnt -= 1
      ss = ret[i] + ss
    }
  }
  return ss
};

/**
 * @description 第二种解题思路：分别维护左括号待删除下标和右括号待删除下标
 * @param {string} s
 * @return {string}
 */
var minRemoveToMakeValidByArray = function (s) {
  let leftDel = [], rightDel = []
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') {
      leftDel.push(i)
    } else if (s[i] === ')') {
      if (leftDel.length) {
        leftDel.pop()
      } else {
        rightDel.push(i)
      }
    }
  }
  // 字符串转为数组
  let res = [...s]
  // 待删除下标的集合
  const del = [...leftDel, ...rightDel]
  for (v of del) {
    // 注意这里将该位置置为空串即可，最后连成字符串也没影响
    // 如果使用 splice 动态删除，会出现删除后数组长度变短，漏部分位置的情况
    res[v] = ''
  }
  return res.join('')
}
// @lc code=end
```

---

## 141.环形链表

> 来源：`profile/algorithm/leetCode/code/141.环形链表.js`

```javascript
/*
 * @lc app=leetcode.cn id=141 lang=javascript
 *
 * [141] 环形链表
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
 * @return {boolean}
 */
var hasCycle = function(head) {
  /**
   * M1: 快慢指针（初版）
   * 快指针往前走2步，慢指针走1步
   * 判断快指针：
   *  如果快指针为null，则没有环
   *  如果快慢指针相遇，则有环
   */
  /*
  if (head === null) return false
  let post = pre = head
  while(pre !== null) {
    if (pre.next === null) {
      return false
    }
    pre = pre.next.next
    post = post.next
    if (pre === post) {
      return true
    }
  }
  return false
  /*
  /**
   * M2: 快慢指针代码优化版
   */
  if (head === null) return false
  let p = head
  let q = head.next
  while(p !== q && q && q.next) {
    p = p.next
    q = q.next.next
  }
  // 注意要return布尔值
  return !!(q && q.next)
  // return p === q
  /**
   * M3: 哈希
   */
};
// @lc code=end
```

---


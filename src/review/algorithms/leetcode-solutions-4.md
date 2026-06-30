# LeetCode 题解（4）

[← 返回索引](../index.md)

> 迁移自 profile algorithm/leetCode/code，第 4 批

---

## 53.最大子序和

> 来源：`profile/algorithm/leetCode/code/53.最大子序和.js`

```javascript
/*
 * @lc app=leetcode.cn id=53 lang=javascript
 *
 * [53] 最大子序和
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {
  /**
   * 思路：无
   * 
   * 考点
   *  1. 贪心算法
   *  2. 动态规划
   * 
   * 方法一：贪心
   *  - 若当前指针所指元素之前的和小于 0，则丢弃当前元素之前的数列
   *  - 维护四个变量
   *    1. 当前值
   *    2. 之前和
   *    3. 当前和
   *    4. 最大和
   * 
   */
  // 特判
  if (nums.length === 1) return nums[0]
  let max_sum = cur_sum = nums[0]
  for (let i = 1; i < nums.length; i++) {
    cur_sum = Math.max(nums[i], cur_sum + nums[i])
    max_sum = Math.max(cur_sum, max_sum)
  }
  return max_sum
};
// @lc code=end
```

---

## 54.螺旋矩阵

> 来源：`profile/algorithm/leetCode/code/54.螺旋矩阵.js`

```javascript
/*
 * @lc app=leetcode.cn id=54 lang=javascript
 *
 * [54] 螺旋矩阵
 */

// @lc code=start
/**
 * @param {number[][]} matrix
 * @return {number[]}
 */
var spiralOrder = function (matrix) {
  let n = matrix.length
  let m = matrix[0].length
  let list = []
  /**
   * 按圈输出
   *  按四部分输出：
   *  --------->
   *  |        |
   *  |        |
   *  <---------
   * i,j: 下标
   * k: 已经遍历的个数
   * K: 总个数
   * l: 遍历圈数
   */
  for (let i = 0, j = -1, k = 0, K = n * m, l = 0; k < K; l++) {
    while (k < K && j + 1 <= m - 1 - l) {
      k += 1
      j += 1
      list.push(matrix[i][j])
    }
    while (k < K && i + 1 <= n - 1 - l) {
      k += 1
      i += 1
      list.push(matrix[i][j])
    }
    while (k < K && j - 1 >= l) {
      k += 1
      j -= 1
      list.push(matrix[i][j])
    }
    while (k < K && i - 1 > l) { // 注意：边界位置的处理
      k += 1
      i -= 1
      list.push(matrix[i][j])
    }
  }
  return list
};
// @lc code=end
```

---

## 641.设计循环双端队列

> 来源：`profile/algorithm/leetCode/code/641.设计循环双端队列.js`

```javascript
/*
 * @lc app=leetcode.cn id=641 lang=javascript
 *
 * [641] 设计循环双端队列
 */

// @lc code=start
/**
 * @param {number} k
 */
var MyCircularDeque = function(k) {

};

/** 
 * @param {number} value
 * @return {boolean}
 */
MyCircularDeque.prototype.insertFront = function(value) {

};

/** 
 * @param {number} value
 * @return {boolean}
 */
MyCircularDeque.prototype.insertLast = function(value) {

};

/**
 * @return {boolean}
 */
MyCircularDeque.prototype.deleteFront = function() {

};

/**
 * @return {boolean}
 */
MyCircularDeque.prototype.deleteLast = function() {

};

/**
 * @return {number}
 */
MyCircularDeque.prototype.getFront = function() {

};

/**
 * @return {number}
 */
MyCircularDeque.prototype.getRear = function() {

};

/**
 * @return {boolean}
 */
MyCircularDeque.prototype.isEmpty = function() {

};

/**
 * @return {boolean}
 */
MyCircularDeque.prototype.isFull = function() {

};

/**
 * Your MyCircularDeque object will be instantiated and called as such:
 * var obj = new MyCircularDeque(k)
 * var param_1 = obj.insertFront(value)
 * var param_2 = obj.insertLast(value)
 * var param_3 = obj.deleteFront()
 * var param_4 = obj.deleteLast()
 * var param_5 = obj.getFront()
 * var param_6 = obj.getRear()
 * var param_7 = obj.isEmpty()
 * var param_8 = obj.isFull()
 */
// @lc code=end
```

---

## 682.棒球比赛

> 来源：`profile/algorithm/leetCode/code/682.棒球比赛.js`

```javascript
/*
 * @lc app=leetcode.cn id=682 lang=javascript
 *
 * [682] 棒球比赛
 */

// @lc code=start
/**
 * @param {string[]} ops
 * @return {number}
 */
var calPoints = function (ops) {
  let arr = []
  for (let i = 0; i < ops.length; i++) {
    let item = ops[i]
    if (/\d/.test(item)) {
      console.log(item)
      arr.push(item)
    } else {
      switch (item) {
        case 'C': arr.pop(); break
        case 'D': arr.push(arr[arr.length - 1] * 2); break
        case '+': arr.push(arr[arr.length - 1] / 1 + arr[arr.length - 2] / 1); break
      }
    }
  }
  return arr.reduce((t, v) => t / 1 + v / 1, 0)
};
// @lc code=end
```

---

## 82.删除排序链表中的重复元素-ii

> 来源：`profile/algorithm/leetCode/code/82.删除排序链表中的重复元素-ii.js`

```javascript
/*
 * @lc app=leetcode.cn id=82 lang=javascript
 *
 * [82] 删除排序链表中的重复元素 II
 */

// @lc code=start
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
var deleteDuplicates = function (head) {
  /**
   * 解体思路：
   * 拓展：
   */
  let vHead = new ListNode(-1, head)
  let p = vHead
  let cur = head
  do {
    if (cur.next && cur.value === cur.next.val) {
      cur = cur.next
    } else {
      p.next = cur.next
      cur = p
    }
  } while (cur.next)
  return vHead.next
};
// @lc code=end
```

---

## 844.比较含退格的字符串

> 来源：`profile/algorithm/leetCode/code/844.比较含退格的字符串.js`

```javascript
/*
 * @lc app=leetcode.cn id=844 lang=javascript
 *
 * [844] 比较含退格的字符串
 */

// @lc code=start
/**
 * @param {string} S
 * @param {string} T
 * @return {boolean}
 */
var backspaceCompare = function (S, T) {
  let s = []
  let t = []
  transfer(S, s)
  transfer(T, t)
  if (s.length !== t.length) return false
  while (s.length) {
    if (s.pop() !== t.pop()) return false
  }
  return true
};

function transfer(A, a) {
  for (let i = 0; i < A.length; i++) {
    if (A[i] === '#' && a.length) a.pop()
    else if (A[i] !== '#') a.push(A[i])
  }
}
// @lc code=end
```

---


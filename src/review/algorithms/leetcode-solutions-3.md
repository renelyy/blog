# LeetCode 题解（3）

[← 返回索引](../index.md)

> 迁移自 profile algorithm/leetCode/code，第 3 批

---

## 19.删除链表的倒数第-n-个结点

> 来源：`profile/algorithm/leetCode/code/19.删除链表的倒数第-n-个结点.js`

```javascript
/*
 * @lc app=leetcode.cn id=19 lang=javascript
 *
 * [19] 删除链表的倒数第 N 个结点
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
 * @param {number} n
 * @return {ListNode}
 */
var removeNthFromEnd = function(head, n) {
  /**
   * 解题思路：找到待删除节点的前一个节点
   *  1. 设置虚头 vHead 指向 head，p 指向 vHead，q指向 head
   *  2. q 先往前走 n 步，然后 p 和 q 一起往前走
   *  3. 直到 q === null时，则 p 所指向的就是待删除节点的前一个节点
   *  vHead -> 1 -> 2 -> 3 -> 4 - 5 -> null
   *                     ^              ^
   *                     |              |
   *                     p              q
   * 拓展：1. 如果涉及到找倒数第 N 个节点的问题，可以设置前后指针，这样可以
   *        在遍历一遍的情况下找到目标位置
   *      2. 如果涉及到链表头节点也可能变的问题，可以设置虚拟头节点，这样可
   *        以简化问题
   */
  if (head === null) return null
  let vHead = new ListNode(-1, head)
  let p = vHead
  let q = head
  while (n--) q = q.next
  while (q) {
    p = p.next
    q = q.next
  }
  p.next = p.next.next
  return vHead.next
};
// @lc code=end
```

---

## 20.有效的括号

> 来源：`profile/algorithm/leetCode/code/20.有效的括号.js`

```javascript
/*
 * @lc app=leetcode.cn id=20 lang=javascript
 *
 */

// @lc code=start
/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function (s) {
  let stack = []
  let map = {
    ')': '(',
    ']': '[',
    '}': '{'
  }
  for (let i = 0; i < s.length; i++) {
    switch (s[i]) {
      case '(':
      case '[':
      case '{':
        stack.push(s[i])
        break
      case ')':
      case ']':
      case '}':
        if (stack.length === 0 || stack[stack.length - 1] !== map[s[i]]) return false
        else stack.pop()
        break
    }
  }
  return stack.length === 0
};
// @lc code=end
```

---

## 202.快乐数

> 来源：`profile/algorithm/leetCode/code/202.快乐数.js`

```javascript
/*
 * @lc app=leetcode.cn id=202 lang=javascript
 *
 * [202] 快乐数
 */

// @lc code=start
/**
 * @param {number} n
 * @return {boolean}
 */

function getNext(n) {
  let ret = 0
  while (n > 0) {
    ret += (n % 10) * (n % 10)
    n = Math.floor(n / 10)
  }
  return ret
}

var isHappy = function (n) {
  let p = n
  let q = n
  do {
    p = getNext(p)
    q = getNext(getNext(q))
  } while (p !== q && q !== 1)
  return q === 1
};
console.log(isHappy(100000))

let res = 0
for (let i = 0; i <= 100000; i++) {
  if (isHappy(i)) {
    res += i
  }
}
console.log(res)


// @lc code=end
```

---

## 206.反转链表

> 来源：`profile/algorithm/leetCode/code/206.反转链表.js`

```javascript
/*
 * @lc app=leetcode.cn id=206 lang=javascript
 *
 * [206] 反转链表
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
var reverseList = function(head) {
  if (head === null || head.next === null) return head
  let p = null
  let q = head
  let r = head.next
  do {
    q.next = p
    p = q
    q = r
    r && (r = r.next)
  } while (q)
  return p
};
// @lc code=end
```

---

## 3.无重复字符的最长子串

> 来源：`profile/algorithm/leetCode/code/3.无重复字符的最长子串.js`

```javascript
/*
 * @lc app=leetcode.cn id=3 lang=javascript
 *
 * [3] 无重复字符的最长子串
 */

// @lc code=start
/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function (s) {
  /**
    思路：
    来源于 53 题最大子序和 贪心的思路
    维护最大值，不符合条件，丢弃重置，最后取两者最大

    1. 维护一个当前的最长字符串 cur_str 和最长子串的长度 max_len
    2. 每次判断当前位置的元素在不在 cur_str 中
      - 如果不在，则把当前位置元素拼接到 cur_str 上
      - 否则，把当前位置元素更新为 cur_str
    3. 取 max_len 和 cur_str 的最大值

    上面的思路有个问题，比如 "dvdf"，这个字符串就不行了
    所以不能全部弃掉，
      得从 已经存在的 index 处截取



    思路二：滑动窗口（个人感觉其实就是思路一的官方说法）
    但是这个概念对一类问题进行了一个统一和归纳，值得深思
   */
  // 特判
  if (typeof s !== 'string' || s.length === 0) return '';
  let cur_str = s[0];
  let max_len = 1;
  for (let i = 1; i < s.length; i++) {
    const idx = cur_str.indexOf(s[i]);
    cur_str += s[i];
    if (idx !== -1) {
      cur_str = cur_str.slice(idx + 1);
    }
    max_len = Math.max(max_len, cur_str.length);
  }
  return max_len;
};

lengthOfLongestSubstring('abcabcbb');
lengthOfLongestSubstring('dvdf');

/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring_202307 = function (s) {
  /**
    思路：
    来源于 53 题最大子序和 贪心的思路
    维护最大值，不符合条件，丢弃重置，最后取两者最大

    1. 维护一个当前的最长字符串 cur_str 和最长子串的长度 max_len
    2. 每次判断当前位置的元素在不在 cur_str 中
      - 如果不在，则把当前位置元素拼接到 cur_str 上
      - 否则，把当前位置元素更新为 cur_str
    3. 取 max_len 和 cur_str 的最大值

    上面的思路有个问题，比如 "dvdf"，这个字符串就不行了
    所以不能全部弃掉，
      得从 已经存在的 index 处截取

    思路二：滑动窗口（个人感觉其实就是思路一的官方说法）
    但是这个概念对一类问题进行了一个统一和归纳，值得深思
   */
  // "dvdf"
  // 特判
  if (typeof s !== 'string' || s.length === 0) return '';

  let maxStrlen = (curLen = 1);
  let curStr = s[0];
  for (let i = 1; i < s.length; i++) {
    if (!curStr.includes(s[i])) {
      curStr += s[i];
      curLen++;
    } else {
      // "dvdf"
      // curStr = s[i]; 这里不能直接丢弃了
      let idx = curStr.indexOf(s[i]);
      curStr = curStr.slice(idx + 1) + s[i];
      curLen = curStr.length;
    }

    if (curLen > maxStrlen) maxStrlen = curLen;
  }

  return maxStrlen;
};

// @lc code=end
```

---

## 46.全排列

> 来源：`profile/algorithm/leetCode/code/46.全排列.js`

```javascript
/*
 * @lc app=leetcode.cn id=46 lang=javascript
 *
 * [46] 全排列
 */

// @lc code=start
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
 var permute = function(nums) {
  // 思路：
  /**
    n 个不重复的数字，其全排列的个数为 1 * 2 * 3 ... * n = !n

    1

    1 2
    2 1

    3 1 2
    1 3 2
    1 2 3
    3 2 1
    2 3 1
    2 1 3

    法一：递归
      要求 n 个数字的全排列，先得到 n - 1 个数字的全排列
      然后依次把第 n 个数字插入进去即可
      递归结束条件，当数字只有一个数字时，包装返回它即可
   */
  let ans = []
  if (!Array.isArray(nums) || !nums.length) return ans
  const len = nums.length
  ans = get_full_permutation(nums, len)
  return ans
};

/**
 * @description 递归函数的意义：求前 n 个数字的全排列
 */
function get_full_permutation (nums, n) {
  if (n === 1) {
    return[[nums[0]]]
  }
  let prevN_1 = get_full_permutation(nums, n - 1)
  let tmp = []
  for (let i = 0; i < prevN_1.length; i++) {
    let item = prevN_1[i]
    for (let j = 0; j <= item.length; j++) {
      let list = item.slice()
      list.splice(j, 0, nums[n - 1])
      tmp.push(list)
    }
  }
  return tmp
}

permute([1, 2, 3, 4, 5, 6])
// @lc code=end
```

---


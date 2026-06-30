# 算法模式笔记

[← 返回索引](./index)

> 整理自 profile `algorithm/leetCode/LeetCode算法总结/`，配合 [Leetcode 刷题](../data-structures-and-algorithms/leetcode/) 复习。

---

## ⭐ LRU 缓存

**题：** [剑指 Offer II 031 / LCR 146](https://leetcode.cn/problems/OrIXps/)

**思路：** 哈希表 O(1) 找节点 + 双向链表 O(1) 移动/删除。

```javascript
class LRUCache {
  constructor(capacity) {
    this.cap = capacity
    this.map = new Map()
  }

  get(key) {
    if (!this.map.has(key)) return -1
    const val = this.map.get(key)
    this.map.delete(key)
    this.map.set(key, val)  // 刚使用，放到 Map 末尾
    return val
  }

  put(key, value) {
    if (this.map.has(key)) this.map.delete(key)
    this.map.set(key, value)
    if (this.map.size > this.cap) {
      const oldest = this.map.keys().next().value
      this.map.delete(oldest)
    }
  }
}
```

**说明：** JS `Map` 按插入顺序迭代，可简化为「Map + 删再插」；面试可说双向链表 + HashMap 标准写法。

profile 实现：`2023/07-out/LRUCache/`、`algorithm/.../LRUCache/`。

---

## ⭐ 滑动窗口

**适用：** 子串/子数组最值、覆盖、排列、固定窗口。

| 题 | 链接 |
|----|------|
| 无重复最长子串 | [3](https://leetcode.cn/problems/longest-substring-without-repeating-characters/) |
| 最小覆盖子串 | [76](https://leetcode.cn/problems/minimum-window-substring/) |
| 字符串排列 | [567](https://leetcode.cn/problems/permutation-in-string/) |
| 长度最小的子数组 | [209](https://leetcode.cn/problems/minimum-size-subarray-sum/) |
| 滑动窗口最大值 | [剑指 Offer 59-II](https://leetcode.cn/problems/hua-dong-chuang-kou-de-zui-da-zhi-lcof/) |

**模板（可变窗口）：**

```javascript
function slidingWindow(s) {
  const win = new Map()
  let left = 0, ans = 0
  for (let right = 0; right < s.length; right++) {
    // 1. 扩大窗口：纳入 s[right]
    const c = s[right]
    win.set(c, (win.get(c) ?? 0) + 1)

    // 2. 收缩：while 窗口不满足条件
    while (/* 需要收缩 */) {
      const d = s[left++]
      win.set(d, win.get(d) - 1)
      if (win.get(d) === 0) win.delete(d)
    }

    // 3. 更新答案
    ans = Math.max(ans, right - left + 1)
  }
  return ans
}
```

题单：profile `滑动窗口/README.md`。

---

## ⭐ 动态规划

**题单（profile 收录）：**

| 题 | 链接 |
|----|------|
| 打家劫舍 | [198](https://leetcode.cn/problems/house-robber/) |
| （更多） | profile `动态规划/README.md` |

**打家劫舍模板：**

```javascript
function rob(nums) {
  let prev = 0, curr = 0
  for (const n of nums) {
    ;[prev, curr] = [curr, Math.max(curr, prev + n)]
  }
  return curr
}
```

profile：`2023/08-out/198.打家劫舍/`。

---

## ⭐ 二叉树

| 内容 | profile 路径 |
|------|----------------|
| 遍历/题型 | `2023/08-out/二叉树/` |
| 层序/光照 | 见 [LeetCode 题解](./algorithms/leetcode-solutions-1) |

---

## ⭐ 位运算小技巧（profile 根目录）

```javascript
// 字符集仅小写字母：用位图判重
function isUnique(str) {
  let checker = 0
  for (const c of str) {
    const bit = 1 << (c.charCodeAt(0) - 97)
    if (checker & bit) return false
    checker |= bit
  }
  return true
}
```

来源：profile `index.js`。

---

## 📌 更多资源

| 资源 | 位置 |
|------|------|
| 数据结构书笔记 | `algorithm/learningJavaScriptDataStructsAndAlgorithms/` |
| 每日算法 | `algorithm/每日算法/` |
| 博客刷题 | [data-structures-and-algorithms](../data-structures-and-algorithms/) |

---

## 下一步

- [Leetcode 链表](../data-structures-and-algorithms/leetcode/1.linked-list)

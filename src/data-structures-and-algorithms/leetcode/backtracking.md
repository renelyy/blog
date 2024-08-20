---
outline: [1, 2] # 显示 # 和 ## 级别标题
---

::: tip

<b>回溯算法总数：</b> `2`

:::

# 简单题

# 中等题

## 1. [46. 全排列](https://leetcode.cn/problems/permutations/description/)

::: code-group

```js [回溯(先得到 n - 1 个数字的全排列)] 45
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function (nums) {
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
  let ans = [];
  if (!Array.isArray(nums) || !nums.length) return ans;
  const len = nums.length;
  ans = get_full_permutation(nums, len);
  return ans;
};

/**
 * @description 递归函数的意义：求前 n 个数字的全排列
 */
function get_full_permutation(nums, n) {
  if (n === 1) return [[nums[0]]];

  let prevN_1 = get_full_permutation(nums, n - 1);
  let tmp = [];
  for (let i = 0; i < prevN_1.length; i++) {
    let item = prevN_1[i];
    // 注意这里是 <= 因为最后一位也要插入
    for (let j = 0; j <= item.length; j++) {
      let list = item.slice();
      list.splice(j, 0, nums[n - 1]);
      tmp.push(list);
    }
  }
  return tmp;
}
```

```js [回溯算法]
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function (nums) {
  const res = [];
  /**
   * 定义回溯函数
   * @param {number[]} path 表示当前的排列路径
   */
  const backtrack = path => {
    if (path.length === nums.length) {
      res.push(path);
      return;
    }
    nums.forEach(n => {
      if (path.includes(n)) return;
      backtrack(path.concat(n));
    });
  };
  backtrack([]);
  return res;
};
```

:::

## 2. [47. 全排列 II](https://leetcode.cn/problems/permutations-ii/description/)

::: code-group

```js [回溯算法]
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permuteUnique = function (nums) {
  const res = [];
  const used = new Array(nums.length).fill(false);
  nums.sort((a, b) => a - b);
  /**
   * @param {number[]} path 表示当前的排列路径
   */
  const backtrack = path => {
    if (path.length === nums.length) {
      res.push(path);
      return;
    }
    nums.forEach((n, i) => {
      if (used[i]) return;
      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) return;
      used[i] = true;
      backtrack(path.concat(n));
      used[i] = false;
    });
  };
  backtrack([]);
  return res;
};
```

:::

# 困难题

---
outline: [1, 2] # 显示 # 和 ## 级别标题
---

::: tip

<b>二分查找总数：</b> `9`

:::

# 二分查找

## 1. [69. x 的平方根](https://leetcode.cn/problems/sqrtx/description/?envType=study-plan-v2&envId=top-interview-150)

::: code-group

```js [题目描述]
给你一个非负整数 x ，计算并返回 x 的 算术平方根 。

由于返回类型是整数，结果只保留 整数部分 ，小数部分将被 舍去 。

注意：不允许使用任何内置指数函数和算符，例如 pow(x, 0.5) 或者 x ** 0.5 。

```

```js [循环]
/**
 * @param {number} x
 * @return {number}
 */
var mySqrt = function (x) {
  /**
   * 思路：循环求平方
   */
  if (x === 0 || x === 1) return x;
  for (let i = 0; i <= x / 2; i++) {
    if (i * i === x || (i + 1) * (i + 1) > x) return i;
  }
};
```

```js [二分查找]
/**
 * @param {number} x
 * @return {number}
 */
var mySqrt = function (x) {
  if (x === 0 || x === 1) return x;
  let left = 0,
    right = x / 2,
    ans = -1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (mid * mid === x) return mid;
    if (mid * mid < x) {
      ans = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return ans;
};
```

```js [骚操作]
/**
 * @param {number} x
 * @return {number}
 */
var mySqrt = function (x) {
  if (x === 1) return 1;
  let head = 0,
    tail = x,
    mid;
  for (let i = 0; i < 32; i++) {
    mid = head + ((tail - head) >> 1);
    if (mid * mid <= x) head = mid;
    else tail = mid;
  }
  return head;
};
```

```js [牛顿迭代法]
/**
 * @param {number} x
 * @return {number}
 */
var mySqrt = function (x) {
  if (x === 0 || x === 1) return x;
  let ans = x;
  while (ans * ans > x) {
    ans = Math.floor((ans + x / ans) / 2);
  }
  return ans;
};
```

:::

:::

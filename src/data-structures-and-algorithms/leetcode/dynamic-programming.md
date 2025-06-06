---
outline: [1, 2] # 显示 # 和 ## 级别标题
---

<b>动态规划总数：</b> `1`

# 简单题

# 中等题

## 1. [198. 打家劫舍](https://leetcode.cn/problems/house-robber/description/)

::: code-group

```js [递归实现]
/**
 * @param {number[]} nums
 * @return {number}
 * 时间复杂度 O(2^n)
 * 空间复杂度 O(n)
 */
var rob = function (nums) {
  /**
   * 思路：递归
   */
  if (nums.length === 1) return nums[0];

  // 总的最大金额为从第 0 个房间开始偷窃的最大金额和从第 1 个
  // 房间开始偷窃的最大金额中的较大值
  return Math.max(robHelper(nums, 0), robHelper(nums, 1));
};

/**
 * robHelper 表示从 start 房间开始偷窃的所得到的最大金额
 * @param {number[]} nums
 * @param {number} start
 * @return {number}
 */
 */
const robHelper = (nums, start) => {
// 递归的终止条件：start 超时数组下标，表示无房间可偷，返回 0 即可
if (start >= nums.length) return 0;

// 从 start 房间开始偷窃，有两种情况：
// 1. 偷窃第 start 个房间：偷窃该房间的金额 + 偷窃下下个房间
//    的最大金额（start 偷了，所以要跳过下个房间）
// 2. 不偷窃第 start 个房间：偷窃下个房间的最大金额
return Math.max(
    nums[start] + robHelper(nums, start + 2),
    robHelper(nums, start + 1)
  );
};


// 注：这种实现方式效率不高，因为存在大量的重复计算，比如 robHelper(nums, 4)
// 被计算了多次。此实现方式在 leetcode 中运行会超时
```

```js [动态规划实现]
/**
 * @param {number[]} nums
 * @return {number}
 * 时间复杂度 O(n)
 * 空间复杂度 O(n)
 */
var rob = function (nums) {
  /**
   * 思路：动态规划
   */
  if (nums.length === 1) return nums[0];

  // dp[i] 表示从前 i 间房屋中能偷窃到的最大金额
  // 有两种情况:
  // 1. 偷窃第 i 间房屋，那么就不能偷窃第 i - 1 间房屋，
  //    偷窃总金额为 nums[i] + dp[i - 2]
  // 2. 不偷窃第 i 间房屋，偷窃总金额为 dp[i - 1]
  // 状态转移方程: dp[i] = Math.max(dp[i - 2] + nums[i], dp[i - 1])
  const dp = new Array(nums.length).fill(0);
  dp[0] = nums[0];
  dp[1] = Math.max(nums[0], nums[1]);
  for (let i = 2; i < nums.length; i++) {
    dp[i] = Math.max(dp[i - 2] + nums[i], dp[i - 1]);
  }
  return dp[nums.length - 1];
};

// 注：此种实现方式空间复杂度为 O(n)，可以进一步优化，使用滚动数组
// 因为没必要保存所有房间的最大金额，只需要保存最近两个房间的最大金额即可
```

```js [动态规划+滚动数组实现]
/**
 * @param {number[]} nums
 * @return {number}
 * 时间复杂度 O(n)
 * 空间复杂度 O(1)
 */
var rob = function (nums) {
  /**
   * 思路：动态规划+滚动数组
   */
  if (nums.length === 1) return nums[0];
  let prev = nums[0],
    curr = Math.max(nums[0], nums[1]);
  for (let i = 2; i < nums.length; i++) {
    const temp = curr;
    curr = Math.max(prev + nums[i], curr);
    prev = temp;
  }
  return curr;
};
```

# 困难题

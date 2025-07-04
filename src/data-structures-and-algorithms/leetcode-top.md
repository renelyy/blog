# LeetCode 精选 TOP 面试题

## [268. 丢失的数字](https://leetcode-cn.com/problems/missing-number/) :white_check_mark:

1. **题目描述**
   给定一个包含 [0, n] 中 n 个数的数组 nums ，找出 [0, n] 这个范围内没有出现在数组中的那个数。

2. **示例**

```js
输入：nums = [3,0,1]
输出：2
解释：n = 3，因为有 3 个数字，所以所有的数字都在范围 [0,3] 内。2 是丢失的数字，因为它没有出现在 nums 中。
```

3. **解题思路**

- 方法一：排序
- 方法二：哈希表
- 方法三：求和
- 方法四：位运算

4. **代码实现**

:::code-group

```js [方法一：排序]
var missingNumber = function (nums) {
  nums.sort((a, b) => a - b);
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== i) {
      return i;
    }
  }
  return nums.length;
};
```

```js [方法二：哈希表]
var missingNumber = function (nums) {
  const set = new Set(nums);
  for (let i = 0; i <= nums.length; i++) {
    if (!set.has(i)) {
      return i;
    }
  }
};
```

```js [方法三：求和]
var missingNumber = function (nums) {
  const n = nums.length;
  const sum = (n * (n + 1)) / 2;
  return sum - nums.reduce((a, b) => a + b, 0);
};
```

```js [方法四：位运算]
var missingNumber = function (nums) {
  // 异或运算
  // a ^ a = 0
  // a ^ 0 = a
  // a ^ b ^ a = b // 交换律
  // [3, 0, 1] => 3 ^ 0 ^ 1 ^ 0 ^ 1 ^ 2 ^ 3 = 2
  let ans = 0,
    n = nums.length;
  for (let i = 0; i < n; i++) {
    ans ^= i ^ nums[i];
  }
  return ans ^ n;
};
```

:::

## [79. 单词搜索](https://leetcode-cn.com/problems/word-search/) :white_check_mark:

1. **题目描述**
   给定一个 m x n 二维字符网格 board 和一个字符串单词 word 。如果 word 存在于网格中，返回 true ；否则，返回 false 。

2. **示例**

```js
输入：board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"
输出：true
```

3. **解题思路**

遍历二维数组，找到与单词第一个字符相同的字符，然后进行回溯，判断是否能够找到单词。

4. **代码实现**

```js
var exist = function (board, word) {
  const m = board.length;
  const n = board[0].length;
  const directions = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0]
  ];
  const visited = new Array(m).fill(0).map(() => new Array(n).fill(0));

  /**
   * @description: 检查从 (i, j) 开始，能否找到单词 word[k..]
   */
  const check = (i, j, k) => {
    if (board[i][j] !== word[k]) return false;
    if (k === word.length - 1) return true;

    visited[i][j] = 1;
    let ans = false;
    for (const [dx, dy] of directions) {
      const newi = i + dx,
        newj = j + dy;
      if (
        newi >= 0 &&
        newi < m &&
        newj >= 0 &&
        newj < n &&
        !visited[newi][newj]
      ) {
        if (check(newi, newj, k + 1)) {
          ans = true;
          break;
        }
      }
    }
    visited[i][j] = 0;
    return ans;
  };

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (check(i, j, 0)) {
        return true;
      }
    }
  }
  return false;
};
```

## [91. 解码方法](https://leetcode-cn.com/problems/decode-ways/) :white_check_mark:

1. **题目描述**
   一条包含字母 A-Z 的消息通过以下映射进行了编码：

   'A' -> 1
   'B' -> 2
   ...
   'Z' -> 26

   给定一个只包含数字的非空字符串，请计算解码方法的总数。
   题目数据保证答案肯定是一个 32 位的整数。

2. **示例**

```js
输入：s = "226"
输出：3
解释：它可以解码为 "BZ" (2 26), "VF" (22 6), 或者 "BBF" (2 2 6) 。
```

3. **解题思路**

- 方法一：动态规划
- 方法二：动态规划优化

4. **代码实现**

:::code-group

```js [leetcode 官解]
var numDecodings = function (s) {
  const n = s.length;
  const f = new Array(n + 1).fill(0);
  f[0] = 1;
  for (let i = 1; i <= n; ++i) {
    if (s[i - 1] !== "0") {
      f[i] += f[i - 1];
    }
    if (i > 1 && s[i - 2] != "0" && (s[i - 2] - "0") * 10 + (s[i - 1] - "0") <= 26) {
      f[i] += f[i - 2];
    }
  }
  return f[n];
};
```

```js [方法一：动态规划]
var numDecodings = function (s) {
  const n = s.length;
  const dp = new Array(n + 1).fill(0);
  // 假设空串有一种解码方法
  dp[0] = 1;
  for (let i = 1; i <= n; i++) {
    // 可以独立编码
    if (s[i - 1] !== "0") dp[i] += dp[i - 1];

    // 可以和前一个字符组合编码
    const num = parseInt(s.slice(i - 2, i));
    if (num >= 10 && num <= 26) {
      dp[i] += dp[i - 2];
    }
  }
  return dp[n];
};
```

```js [方法二：动态规划优化]
var numDecodings = function (s) {
  const n = s.length;
  const dp = new Array(3).fill(0);
  dp[0] = 1;
  for (let i = 1; i <= n; i++) {
    dp[i % 3] = 0;
    if (s[i - 1] !== "0") {
      dp[i % 3] += dp[(i - 1) % 3];
    }
    const num = parseInt(s.slice(i - 2, i));
    if (num >= 10 && num <= 26) {
      dp[i % 3] += dp[(i - 2) % 3];
    }
  }
  return dp[n % 3];
};
```

```js [滚动数组的另一个写法]
/**
 * @param {string} s
 * @return {number}
 */
var numDecodings = function(s) {
  if (s.length === 0 || s[0] == '0') return 0;

  // 滚动数组优化
  const n = s.length;
  const dp = new Array(3).fill(0);
  dp[0] = 1;
  dp[1] = 1;
  for (let i = 2; i <= n; i++) {
    // 这里一定要重置状态
    // 思考：为什么一定要重置状态？
    // 其实很简单，因为每次都在 +=
    // dp[i] 的结果为可以独立编码的总数 + 可以和前一个字符组合编码的总数
    dp[i % 3] = 0; 
    if (s[i - 1] !== "0") dp[i % 3] += dp[(i - 1) % 3];

    if (s[i - 2] !== "0" && parseInt(s.slice(i - 2, i)) <= 26) {
      dp[i % 3] += dp[(i - 2) % 3];
    }
  }
  return dp[n % 3]
};
```

:::

::: tip
引入空串的解码方式（即 dp[0] = 1）是为了在动态规划的递推过程中能够正确处理前两个字符的解码情况。具体来说，当处理到字符串的前两个字符时，可能需要用到 dp[i-2]的值，此时 i-2 可能为 0，即空串的情况。如果没有初始化 dp[0]，递推时可能会出现错误。
:::

不使用空串的解码方式，处理方式会更麻烦，需要考虑更多的边界情况。

```js [不使用空串的解码方式]
/**
 * @param {string} s
 * @return {number}
 */
var numDecodings = function (s) {
  // dp[i] 表示前 i 字符的编码总数
  //      1) s[i] 可以独立编码 dp[i] = dp[i - 1]
  //      2) s[i] 不能独立编码 dp[i] = dp[i - 2]
  if (s.length === 1) {
    if (s[0] === "0") return 0;
    else return 1;
  }

  // 前导为 0，无法编码
  if (s[0] === "0") return 0;

  const n = s.length;
  const dp = new Array(n).fill(0);
  dp[0] = 1;
  for (let i = 1; i < n; i++) {
    // 可以独立编码
    if (s[i] !== "0") dp[i] += dp[i - 1];

    // 可以和前一个字符组合编码
    const num = parseInt(s.slice(i - 1, i + 1));
    if (num >= 10 && num <= 26) {
      // 这里为什么要判断 i - 2 >= 0 呢？
      // 因为 dp[i - 2] 表示前 i - 2 字符的编码总数
      // 如果 i - 2 < 0，则 dp[i - 2] 不存在
      // 而和前一个字符可以组合编码，本身就是一种编码方式，如 12
      // dp[0] = 1; dp[1] = 2(1 1)(11)
      // 但 dp[i - 2] = undefined 不存在，所以需要判断 i - 2 >= 0
      dp[i] += dp[i - 2] || 1;
    }

    // 优化：如果有无法编码的情况，直接返回 0
    if (dp[i] === 0) return 0;
  }
  return dp[n - 1];
};
```

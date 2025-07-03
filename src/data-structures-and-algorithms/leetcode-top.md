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

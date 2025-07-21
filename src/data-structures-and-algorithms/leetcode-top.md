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
    if (
      i > 1 &&
      s[i - 2] != "0" &&
      (s[i - 2] - "0") * 10 + (s[i - 1] - "0") <= 26
    ) {
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
var numDecodings = function (s) {
  if (s.length === 0 || s[0] == "0") return 0;

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
  return dp[n % 3];
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

## [75. 颜色分类](https://leetcode-cn.com/problems/sort-colors/) :white_check_mark:

::: code-group

```js [单指针]
// 思路：单指针，两次遍历数组
// 第一次将所有 0 放到数组前面
// 第二次将所有 1 放到 0 后面
/**
 * @param {number[]} nums
 * @return {void} Do not return anything, modify nums in-place instead.
 */
var sortColors = function (nums) {
  let index = 0;
  // 将所有 0 放到数组前面
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === 0) {
      [nums[i], nums[index]] = [nums[index], nums[i]];
      index++;
    }
  }
  // 将所有 2 放到数组后面
  for (let i = index; i < nums.length; i++) {
    if (nums[i] === 1) {
      [nums[i], nums[index]] = [nums[index], nums[i]];
      index++;
    }
  }
};
```

```js [双指针 处理 0 和 2]
// 思路：双指针，一次遍历数组
// 定义两个指针，一个指向 0 的位置，一个指向 2 的位置
// 遍历数组，如果遇到 0，则将其放到 0 指针的位置，0 指针后移
// 如果遇到 2，则将其放到 2 指针的位置，2 指针前移
/**
 * @param {number[]} nums
 * @return {void} Do not return anything, modify nums in-place instead.
 */
var sortColors = function (nums) {
  let p0 = 0;
  let p2 = nums.length - 1;
  for (let i = 0; i <= p2; i++) {
    if (nums[i] === 0) {
      [nums[i], nums[p0]] = [nums[p0], nums[i]];
      p0++;
    } else if (nums[i] === 2) {
      [nums[i], nums[p2]] = [nums[p2], nums[i]];
      p2--;
      i--;
    }
  }
};
```

```js [双指针 处理 0 和 1]
// 思路：双指针，一次遍历数组
// 定义两个指针，一个指向 0 的位置，一个指向 1 的位置
// 遍历数组，如果遇到 0，则将其放到 0 指针的位置，0 指针后移
// 如果遇到 1，则将其放到 1 指针的位置，1 指针后移
/**
 * @param {number[]} nums
 * @return {void} Do not return anything, modify nums in-place instead.
 */
var sortColors = function (nums) {
  let p0 = 0;
  let p1 = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === 0) {
      [nums[i], nums[p0]] = [nums[p0], nums[i]];
      // 这里为什么要这么处理？
      // p0 < p1 p0 和 p1 没有重合，所以此时交换时将 1 给交换了出去
      // 因此需要将交换出去的 1 在位置 i 要换到 p1 位置，然后 p1 后移
      // 举例：
      // 0   1   1   2   2   0
      //    p0      p1       i
      // 此时遍历到 i 的位置，将 0 和 p0 交换，把 1 给交换出去了
      // 所以需要将 i 的位置和 p1 交换，把 1 换回来，然后 p1 后移
      if (p0 < p1) {
        [nums[i], nums[p1]] = [nums[p1], nums[i]];
      }
      // 因为 1 在 0 的后面，所以 0 指针和 1 指针都要后移
      p0++;
      p1++;
    } else if (nums[i] === 1) {
      [nums[i], nums[p1]] = [nums[p1], nums[i]];
      p1++;
    }
  }
};
```

:::

## [128. 最长连续序列](https://leetcode-cn.com/problems/longest-consecutive-sequence/) :white_check_mark:

```js
/**
 * @param {number[]} nums
 * @return {number}
 */
var longestConsecutive = function (nums) {
  // 去重
  const set = new Set(nums);
  let max = 0;

  for (const num of set) {
    // 如果当前数字的前一个数字存在，则跳过，因为前一个数字已经计算过
    // 换句话说就是，当前数字不是连续序列的起点，则跳过
    if (set.has(num - 1)) continue;

    let currentNum = num;
    let currentLength = 1;

    // 向后遍历，计算当前数字的连续序列长度
    while (set.has(currentNum + 1)) {
      currentNum++;
      currentLength++;
    }

    // 更新最大长度
    max = Math.max(max, currentLength);
  }

  return max;
};
```

## [130. 被围绕的区域](https://leetcode-cn.com/problems/surrounded-regions/) :white_check_mark:

:::code-group

```js [深度优先搜索]
/**
 * @param {character[][]} board
 * @return {void} Do not return anything, modify board in-place instead.
 */
var solve = function (board) {
  // 被 X 包围的 O 要修改为 X
  // 位于边缘的 O 不会被修改为 X
  // 判断包围不好判断，但是判断哪些位于边缘好判断
  // 即位于边缘或者直接或间接的和边缘连接
  // 第一次遍历：对于每一个位于边缘的节点 O 开始遍历，将其连接的节点标记为 F
  // 第二次遍历：所有没被标记的 O 要变为 X，而所有标记为 F 的要还原回 O
  const m = board.length,
    n = board[0].length;
  output(board);
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      // 非边缘节点且不是 O 直接跳过
      if (i > 0 && i < m - 1 && j > 0 && j < n - 1) continue;
      if (board[i][j] === "X") continue;
      dfs(board, i, j);
    }
  }
  output(board);

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (board[i][j] === "X") continue;
      // 骚操作
      board[i][j] = String.fromCharCode(board[i][j].charCodeAt() + 9);
      // if (board[i][j] === 'O') board[i][j] = 'X';
      // if (board[i][j] === 'F') board[i][j] = 'O'
    }
  }
};

// 从 (i, j) 开始深度优先搜索，标记和边缘连通的节点为 F
function dfs(board, i, j) {
  const m = board.length,
    n = board[0].length;
  const directions = [
    [-1, 0],
    [1, 0],
    [0, 1],
    [0, -1]
  ];
  board[i][j] = "F";
  directions.forEach(([di, dj]) => {
    let ni = i + di,
      nj = j + dj;
    if (
      ni >= 0 &&
      ni < m &&
      nj >= 0 &&
      nj < n &&
      board[ni][nj] !== "F" &&
      board[ni][nj] === "O"
    ) {
      dfs(board, ni, nj);
    }
  });
}

function output(arr) {
  console.log("----------- start output arr --------------");
  arr.forEach(row => console.log(row.join("\t")));
}
```

```js [广度优先搜索]
/**
 * @param {character[][]} board
 * @return {void} Do not return anything, modify board in-place instead.
 */
var solve = function (board) {
  // 被 X 包围的 O 要修改为 X
  // 位于边缘的 O 不会被修改为 X
  // 判断包围不好判断，但是判断哪些位于边缘好判断
  // 即位于边缘或者直接或间接的和边缘连接
  // 第一次遍历：对于每一个位于边缘的节点 O 开始遍历，将其连接的节点标记为 F
  // 第二次遍历：所有没被标记的 O 要变为 X，而所有标记为 F 的要还原回 O
  const m = board.length,
    n = board[0].length;
  output(board);
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      // 非边缘节点且不是 O 直接跳过
      if (i > 0 && i < m - 1 && j > 0 && j < n - 1) continue;
      if (board[i][j] === "X") continue;
      bfs(board, i, j);
    }
  }
  output(board);

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (board[i][j] === "X") continue;
      // 骚操作
      board[i][j] = String.fromCharCode(board[i][j].charCodeAt() + 9);
      // if (board[i][j] === 'O') board[i][j] = 'X';
      // if (board[i][j] === 'F') board[i][j] = 'O'
    }
  }
};

// 从 (i, j) 开始广度优先所有，标记和边缘连通的节点为 F
function bfs(board, i, j) {
  const m = board.length,
    n = board[0].length;
  const directions = [
    [-1, 0],
    [1, 0],
    [0, 1],
    [0, -1]
  ];
  board[i][j] = "F";
  const queue = [[i, j]];
  while (queue.length) {
    // 取出队头
    const [i, j] = queue.shift();
    // 遍历四个方向
    directions.forEach(([di, dj]) => {
      let ni = i + di,
        nj = j + dj;
      if (ni >= 0 && ni < m && nj >= 0 && nj < n && board[ni][nj] === "O") {
        board[ni][nj] = "F";
        queue.push([ni, nj]);
      }
    });
  }
}

function output(arr) {
  console.log("----------- start output arr --------------");
  arr.forEach(row => console.log(row.join("\t")));
}
```

```js [并查集]
/**
 * @param {character[][]} board
 * @return {void} Do not return anything, modify board in-place instead.
 */
var solve = function (board) {
  // m × n
  // i * n + j
  const m = board.length,
    n = board[0].length;
  const dummy = m * n;

  const u = new UnionFind(m * n);

  // 连通边界点
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (board[i][j] === "X") continue;
      if (i === 0 || i === m - 1 || j === 0 || j === n - 1) {
        // 边界的 O 和虚拟节点连通
        u.union(dummy, i * n + j);
      } else {
        // 如果当前 O 周围有 O 将其连通
        const directions = [[0, -1], [0, 1], [-1, 0][(1, 0)]];
        directions.forEach(([di, dj]) => {
          let ni = di + i,
            nj = dj + j;
          if (ni >= 0 && ni < m && nj >= 0 && nj < n && board[ni][nj] === "O") {
            // 合法的索引
            u.union(i * n + j, ni * n + nj);
          }
        });
      }
    }
  }

  // 不和 dummy 连通的 O 置为 X
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (board[i][j] === "X") continue;
      if (!u.connected(dummy, i * n + j)) {
        board[i][j] = "X";
      }
    }
  }
};

class UnionFind {
  constructor(n) {
    this.parents = new Array(n).fill(0).map((_, i) => i);
    this.ranks = new Array(n).fill(1);
  }

  find(x) {
    if (this.parents[x] === x) return x;
    const parent = this.find(this.parents[x]);
    this.parents[x] = parent;
    return parent;
  }

  union(x, y) {
    const px = this.find(x),
      py = this.find(y);
    if (px === py) return;
    if (this.ranks[px] < this.ranks[py]) {
      this.parents[px] = py;
      this.ranks[py] += this.ranks[px];
    } else {
      this.parents[py] = px;
      this.ranks[px] += this.ranks[py];
    }
  }

  connected(x, y) {
    return this.find(x) === this.find(y);
  }
}
```

:::

## [131. 分割回文串](https://leetcode-cn.com/problems/palindrome-partitioning/) :star::star::star:

::: code-group

```js [回溯]
/**
 * @param {string} s
 * @return {string[][]}
 */
var partition = function (s) {
  const res = [];
  const path = [];
  dfs(s, 0, path, res);
  return res;
};

/**
 * @description 从 start 开始，将 s[start, i] 作为一个回文串，如果 [start, i] 是回文串，则将其加入 path，然后递归调用 dfs(s, i + 1, path, res)，如果 [start, i] 不是回文串，则直接跳过
 */
function dfs(s, start, path, res) {
  if (start === s.length) {
    res.push([...path]);
    return;
  }
  for (let i = start; i < s.length; i++) {
    if (isPalindrome(s, start, i)) {
      path.push(s.substring(start, i + 1));
      dfs(s, i + 1, path, res);
      path.pop();
    }
  }
}

function isPalindrome(s, start, end) {
  for (let i = start, j = end; i < j; i++, j--) {
    if (s[i] !== s[j]) return false;
  }
  return true;
}
```

```js [动态规划]
/**
 * @param {string} s
 * @return {string[][]}
 */
var partition = function (s) {
  // abacabb
  const n = s.length;
  const dp = new Array(n).fill(0).map(() => new Array(n).fill(false));
  const res = [];
  const path = [];
  for (let i = n - 1; i >= 0; i--) {
    for (let j = i; j < n; j++) {
      if (i === j) {
        dp[i][j] = true;
      } else if (s[i] === s[j]) {
        dp[i][j] = j === i + 1 ? true : dp[i + 1][j - 1];
      }
    }
  }
  dfs(s, 0, path, res, dp);
  return res;
};

function dfs(s, start, path, res, dp) {
  if (start === s.length) {
    res.push([...path]);
    return;
  }
  for (let i = start; i < s.length; i++) {
    if (dp[start][i]) {
      path.push(s.substring(start, i + 1));
      dfs(s, i + 1, path, res, dp);
      path.pop();
    }
  }
}
```

:::

## [139. 单词拆分](https://leetcode-cn.com/problems/word-break/) :white_check_mark:

::: code-group

```js [动态规划]
/**
 * @param {string} s
 * @param {string[]} wordDict
 * @return {boolean}
 */
var wordBreak = function (s, wordDict) {
  const n = s.length;
  const dp = new Array(n + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && wordDict.includes(s.substring(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[n];
};
```

```js [回溯]
// 回溯的思路：
// 1. 从字符串的开头开始，尝试将字符串分割成两个部分，如果第一个部分在字典中，则继续递归处理第二个部分
// 2. 如果第一个部分不在字典中，则继续尝试将字符串分割成两个部分，直到找到一个在字典中的部分或者字符串被分割完
// 3. 如果字符串被分割完，则说明字符串可以被拆分成字典中的单词，返回 true
// 4. 如果字符串没有被分割完，则说明字符串不能被拆分成字典中的单词，返回 false

/**
 * @param {string} s
 * @param {string[]} wordDict
 * @return {boolean}
 */
var wordBreak = function (s, wordDict) {
  const res = [];
  const path = [];
  dfs(s, 0, path, res, wordDict);
  return res.length > 0;
};

function dfs(s, start, path, res, wordDict) {
  if (start === s.length) {
    res.push([...path]);
    return;
  }
  for (let i = start; i < s.length; i++) {
    if (wordDict.includes(s.substring(start, i + 1))) {
      path.push(s.substring(start, i + 1));
      dfs(s, i + 1, path, res, wordDict);
      path.pop();
    }
  }
}
```

```js [回溯-记忆化搜素优化]
/**
 * @param {string} s
 * @param {string[]} wordDict
 * @return {boolean}
 */
var wordBreak = function (s, wordDict) {
  let canFound = false;
  const wordSet = new Set(wordDict);
  const wordMemo = new Map();
  // 回溯 => 超时
  // 优化 => 记忆化搜索
  const dfsHelper = (start, path) => {
    if (start === s.length) {
      canFound = true;
      return;
    }
    if (wordMemo.has(start)) return wordMemo.get(start);
    for (let i = start; i < s.length; i++) {
      if (wordSet.has(s.slice(start, i + 1))) {
        if (dfsHelper(i + 1, path)) {
          wordMemo.set(start, true);
          // 找到一种结果，提前结束递归
          return;
        }
      }
      wordMemo.set(start, false);
    }
  };
  dfsHelper(0, []);
  return canFound;
};
```

:::

## [150. 逆波兰表达式求值](https://leetcode-cn.com/problems/evaluate-reverse-polish-notation/) :white_check_mark:

::: code-group

```js [栈]
/**
 * @param {string[]} tokens
 * @return {number}
 */
var evalRPN = function (tokens) {
  const stack = [];
  for (const token of tokens) {
    if (isNumber(token)) {
      stack.push(Number(token));
    } else {
      const num2 = stack.pop();
      const num1 = stack.pop();
      switch (token) {
        case "+":
          stack.push(num1 + num2);
          break;
        case "-":
          stack.push(num1 - num2);
          break;
        case "*":
          stack.push(num1 * num2);
          break;
        case "/":
          stack.push(
            num1 / num2 > 0 ? Math.floor(num1 / num2) : Math.ceil(num1 / num2)
          );
          break;
      }
    }
  }
  return stack.pop();
};

function isNumber(token) {
  return !isNaN(token);
}
```

:::

## [227. 基本计算器 II](https://leetcode-cn.com/problems/basic-calculator-ii/) :white_check_mark:

::: code-group

```js [栈]
/**
 * 这种实现方式超时，shift unshift 操作耗时，时间复杂度是 O(n)，
 * 每次在头部插入元素时，后面的元素都要向后移动一位，
 * 删除元素时，后面的元素都要向前移动一位，所以时间复杂度是 O(n)
 *
 * @param {string} s
 * @return {number}
 */
var calculate = function (s) {
  const queue = [];
  const ops = [];
  const regex = /(\d+)|(\+)|(\-)|(\*)|(\/)/g;
  let match;
  while ((match = regex.exec(s))) {
    switch (match[0]) {
      case "+":
      case "-":
      case "*":
      case "/":
        ops.push(match[0]);
        break;
      default:
        const op = ops.at(-1);
        if (op === "*") {
          const num = queue.pop() * match[0];
          queue.push(num);
          ops.pop();
        } else if (op === "/") {
          const num = Math.floor(queue.pop() / match[0]);
          queue.push(num);
          ops.pop();
        } else {
          queue.push(match[0]);
        }
        break;
    }
  }

  while (ops.length) {
    const num1 = queue.shift();
    const num2 = queue.shift();
    const op = ops.shift();
    const num = op === "+" ? num1 / 1 + num2 / 1 : num1 / 1 - num2 / 1;
    queue.unshift(num);
  }

  return Number(queue[0]);
};
```

```js [栈-超时优化]
/**
 * 这种实现方式超时，shift unshift 操作耗时，时间复杂度是 O(n)，
 * 每次在头部插入元素时，后面的元素都要向后移动一位，
 * 删除元素时，后面的元素都要向前移动一位，所以时间复杂度是 O(n)
 *
 * 整体算法时间复杂度 O(N^2)
 *
 * 而 push pop 操作时间复杂度是 O(1)
 * 所以优化成 push pop 操作
 *
 * 整体算法时间复杂度 O(N)
 *
 * @param {string} s
 * @return {number}
 */
var calculate = function (s) {
  const queue = [];
  const ops = [];
  const regex = /(\d+)|(\+)|(\-)|(\*)|(\/)/g;
  let match;
  while ((match = regex.exec(s))) {
    switch (match[0]) {
      case "+":
      case "-":
      case "*":
      case "/":
        ops.push(match[0]);
        break;
      default:
        const op = ops.at(-1);
        if (op === "*") {
          const num = queue.pop() * match[0];
          queue.push(num);
          ops.pop();
        } else if (op === "/") {
          const num = Math.floor(queue.pop() / match[0]);
          queue.push(num);
          ops.pop();
        } else {
          queue.push(match[0]);
        }
        break;
    }
  }

  // 优化：shift unshift 操作耗时，时间复杂度是 O(n)，
  // 先反转，然后使用 push pop 操作
  ops.reverse();
  queue.reverse();
  while (ops.length) {
    const num1 = queue.pop();
    const num2 = queue.pop();
    const op = ops.pop();
    const num = op === "+" ? num1 / 1 + num2 / 1 : num1 / 1 - num2 / 1;
    queue.push(num);
  }

  return Number(queue[0]);
};
```

```js [一次遍历]
/**
 * @param {string} s
 * @return {number}
 */
var calculate = function (s) {
  const stack = [];
  let preNum = 0;
  let preOp = "+";
  for (let i = 0; i < s.length; i++) {
    let c = s[i];
    // 这里不能直接 continue，因为最后一次数字需要处理
    // if (c === ' ') continue;
    if (/\d/.test(c)) preNum = preNum * 10 + parseInt(c);
    if ((!/\d/.test(c) && c !== " ") || i === s.length - 1) {
      if (preOp === "+") stack.push(preNum);
      else if (preOp === "-") stack.push(-preNum);
      else if (preOp === "*") stack.push(stack.pop() * preNum);
      else if (preOp === "/") stack.push(Math.trunc(stack.pop() / preNum));
      preNum = 0;
      preOp = c;
    }
  }
  return stack.reduce((acc, cur) => acc + cur, 0);
};
```

:::

## [240. 搜索二维矩阵 II](https://leetcode.cn/problems/search-a-2d-matrix-ii/description/?envType=problem-list-v2&envId=2ckc81c) :white_check_mark:

```js
/**
 * 利用递增性质，从右上角开始查找
 * 如果 target 大于当前值，则说明 target 只可能在当前列的下方，所以排除当前行
 * 如果 target 小于当前值，则说明 target 只可能在当前列的左边，所以排除当前列
 *
 * @param {number[][]} matrix
 * @param {number} target
 * @return {boolean}
 */
var searchMatrix = function (matrix, target) {
  let row = 0;
  let col = matrix[0].length - 1;
  while (row < matrix.length && col >= 0) {
    if (matrix[row][col] === target) return true;
    if (matrix[row][col] > target) col--;
    else row++;
  }
  return false;
};
```

## [279. 完全平方数](https://leetcode.cn/problems/perfect-squares/description/?envType=problem-list-v2&envId=2ckc81c) :white_check_mark:

```js
/**
 * @param {number} n
 * @return {number}
 */
var numSquares = function (n) {
  const dp = new Array(n + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j * j <= i; j++) {
      dp[i] = Math.min(dp[i], dp[i - j * j] + 1);
    }
  }
  return dp[n];
};
```

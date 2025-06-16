# 高频算法题

<!-- ## [全排列](/src/data-structures-and-algorithms/leetcode/backtracking) -->
## [全排列]()

:::code-group

```js [简单版(不含重复数字)]
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function permute(nums) {
  const res = [];
  const backtrack = path => {
    if (path.length === nums.length) {
      res.push(path);
      return;
    }
    nums.forEach(item => {
      if (path.includes(item)) return;
      backtrack(path.concat(item));
    });
  };
  backtrack([]);
  return res;
}
```

```js [简单版(先求 n-1 的全排列，再插入第 n 个数字)]
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function (nums) {
  const len = nums.length;

  /**
   * 获取前 n 个数字的全排列
   */
  const getFullPermutation = (nums, n) => {
    if (n === 1) return [[nums[0]]];
    let temp = getFullPermutation(nums, n - 1);
    const ret = [];
    for (let i = 0; i < temp.length; i++) {
      // 这里要注意是 <= 因为最后一个位置也要插入
      for (let j = 0; j <= temp[i].length; j++) {
        let arr = temp[i].slice();
        arr.splice(j, 0, nums[n - 1]);
        ret.push(arr);
      }
    }
    return ret;
  };

  return getFullPermutation(nums, len);
};
```

```js [进阶版(含重复数字)]
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permuteUnique = function (nums) {
  nums.sort((a, b) => a - b); // 先排序，让相同数字相邻
  const len = nums.length;
  const used = new Array(len).fill(false); // 标记数字是否被使用过
  const result = [];

  /**
   * 递归生成全排列（带剪枝）
   * @param {number[]} current 当前排列
   */
  const backtrack = current => {
    if (current.length === len) {
      result.push([...current]);
      return;
    }

    for (let i = 0; i < len; i++) {
      // 如果当前数字已被使用，或者与前一个数字相同且前一个未被使用（剪枝）
      if (used[i] || (i > 0 && nums[i] === nums[i - 1] && !used[i - 1])) {
        continue;
      }
      used[i] = true;
      current.push(nums[i]);
      backtrack(current);
      current.pop();
      used[i] = false;
    }
  };

  backtrack([]);
  return result;
};
```

```js [含重复数字(不排序)]
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permuteUnique = function (nums) {
  const result = [];
  const backtrack = (path, used) => {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }

    const usedInCurrentLevel = new Set(); // 当前层级已使用的数字
    for (let i = 0; i < nums.length; i++) {
      if (used[i] || usedInCurrentLevel.has(nums[i])) {
        continue; // 如果数字已被全局或当前层级使用，跳过
      }
      usedInCurrentLevel.add(nums[i]); // 标记当前层级已使用
      used[i] = true; // 标记全局已使用
      path.push(nums[i]);
      backtrack(path, used);
      path.pop();
      used[i] = false;
    }
  };

  backtrack([], new Array(nums.length).fill(false));
  return result;
};
```

:::

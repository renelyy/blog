# 牛客刷题

## 华为

### [HJ61 放苹果](https://www.nowcoder.com/practice/bfd8234bb5e84be0b493656e390bdebf?tpId=37&rp=1&sourceUrl=%2Fexam%2Foj%2Fta%3Fpage%3D3%26tpId%3D37%26type%3D37&difficulty=&judgeStatus=&tags=&title=&gioEnter=menu)

#### 描述

把 m 个同样的苹果放在 n 个同样的盘子里，允许有的盘子空着不放，问共有多少种不同的分法？
注意：如果有 7 个苹果和 3 个盘子，（5，1，1）和（1，5，1）被视为是同一种分法。

#### 输入描述：

输入苹果的个数 m 和盘子的个数 n，其中 1 <= m,n <= 10。

#### 输出描述：

输出不同的分法数。

#### 示例 1

输入：

```
7 3
```

输出：

```
8
```

#### 代码

```js
const rl = require("readline").createInterface({ input: process.stdin });
var iter = rl[Symbol.asyncIterator]();
const readline = async () => (await iter.next()).value;

void (async function () {
  const [m, n] = (await readline()).trim().split(" ").map(Number);
  console.log(setApples(m, n));
})();

/**
 * 返回：将 m 个 苹果放入 n 个盘子中的分发数量
 */
function setApples(m, n) {
  if (m === 0 || n === 1) {
    // 没有苹果，只有一种分发，所有盘子为空
    // 只有一个盘子，只有一种分发，所有苹果放入该盘子
    return 1;
  }
  if (m < n) {
    // 苹果少，最多用 m 个盘子，每个盘子放一个，其余盘子为空
    return setApples(m, m);
  } else {
    // 1. 互斥性：两种子问题没有重叠情况
    //    1.1 “至少一个盘子为空”包含所有有空盘子的分法。
    //    1.2 “所有盘子不为空”包含没有空盘子的分法。
    // 2. 完备性：所有可能的分法都被覆盖
    //    2.1 任意分法要么有空盘子，要么所有盘子非空。
    // 苹果多的情况下，可以放满盘子
    // 分发分解为有空盘和无空盘两种情况
    // 至少一个盘子为空 + 所有盘子不为空

    // 这种分解确保了：
    // 不重复：两种子问题互斥。
    // 不遗漏：覆盖所有可能的分法。
    // 逐步简化：通过递归将问题规模缩小到基本情况。
    return setApples(m, n - 1) + setApples(m - n, n);
  }
}
```

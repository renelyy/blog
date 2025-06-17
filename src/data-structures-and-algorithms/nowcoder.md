# 牛客刷题

## 华为

### [HJ3 明明的随机数](https://www.nowcoder.com/practice/3245215fffb84b7b81285493eae92ff0?tpId=37&rp=1&sourceUrl=%2Fexam%2Foj%2Fta%3Fpage%3D3%26tpId%3D37%26type%3D37&difficulty=&judgeStatus=&tags=&title=&gioEnter=menu) :white_check_mark:

**描述**
对于明明生成的 n 个 1 到 500 之间的随机整数，你需要帮助他完成以下任务：

- 删去重复的数字，即相同的数字只保留一个，把其余相同的数去掉；
- 然后再把这些数从小到大排序，按照排好的顺序输出。
  你只需要输出最终的排序结果。

**输入描述**
第一行为一个正整数 n (1≤n≤100)。
第二行有 n 个用空格隔开的整数，每个整数的范围为 [1,500]。

**输出描述**
输出一行从小到大排序后的结果，每个整数后面有一个空格。

**示例 1**

输入

```
3
2
2
1
```

输出

```
1
2
```

**代码**

```js
const rl = require("readline").createInterface({ input: process.stdin });
var iter = rl[Symbol.asyncIterator]();
const readline = async () => (await iter.next()).value;

void (async function () {
  // Write your code here
  let inputs = [];
  while ((line = await readline())) {
    inputs.push(line);
  }
  inputs = inputs.slice(1);
  inputs = [...new Set(inputs)];
  inputs.sort((a, b) => a - b);
  inputs.forEach(item => {
    console.log(`${item}`);
  });
})();
```

### [HJ17 坐标移动](https://www.nowcoder.com/practice/119bcca3befb405fbe58abe9c532eb29?tpId=37&rp=1&sourceUrl=%2Fexam%2Foj%2Fta%3Fpage%3D3%26tpId%3D37%26type%3D37&difficulty=&judgeStatus=&tags=&title=&gioEnter=menu) :white_check_mark:

```js
const rl = require("readline").createInterface({ input: process.stdin });
var iter = rl[Symbol.asyncIterator]();
const readline = async () => (await iter.next()).value;

const validOrder = order => {
  if (!order) return false;
  const regex = /^[A|W|S|D][0-9]{1,2}$/;
  return regex.test(order);
};

void (async function () {
  const line = await readline();
  const validateOrders = line
    .split(";")
    .filter(item => {
      return validOrder(item);
    })
    .map(o => {
      let action = o.charAt(0);
      let step = Number(o.slice(1));
      return { action, step };
    });
  let x = 0,
    y = 0;
  validateOrders.forEach(({ action, step }) => {
    switch (action) {
      case "A":
        x -= step;
        break;
      case "W":
        y += step;
        break;
      case "S":
        y -= step;
        break;
      case "D":
        x += step;
        break;
    }
  });
  console.log(`${x},${y}`);
})();
```

### [HJ18 识别有效的 IP 地址和掩码并进行分类统计](https://www.nowcoder.com/practice/de538edd6f7e4bc3a5689723a7435682?tpId=37&rp=1&sourceUrl=%2Fexam%2Foj%2Fta%3Fpage%3D3%26tpId%3D37%26type%3D37&difficulty=&judgeStatus=&tags=&title=&gioEnter=menu) :x:

### [HJ24 合唱队](https://www.nowcoder.com/practice/6d9d69e3898f45169a441632b325c7b4?tpId=37&rp=1&sourceUrl=%2Fexam%2Foj%2Fta%3Fpage%3D3%26tpId%3D37%26type%3D37&difficulty=&judgeStatus=&tags=&title=&gioEnter=menu) :x:

### [HJ29 字符串加解密](https://www.nowcoder.com/practice/2aa32b378a024755a3f251e75cbf233a?tpId=37&rp=1&sourceUrl=%2Fexam%2Foj%2Fta%3Fpage%3D3%26tpId%3D37%26type%3D37&difficulty=&judgeStatus=&tags=&title=&gioEnter=menu) :white_check_mark:

```js
const rl = require("readline").createInterface({ input: process.stdin });
var iter = rl[Symbol.asyncIterator]();
const readline = async () => (await iter.next()).value;

void (async function () {
  const inputs = [];
  // Write your code here
  while ((line = await readline())) {
    inputs.push(line);
  }
  console.log(encrypt(inputs[0])); // 加密
  console.log(deencrypt(inputs[1])); // 解密
})();

/**
 * 加密字符串
 * @param {string} s
 * @returns {string}
 */
function encrypt(s) {
  let str = s;
  str = str.replace(/[a-zA-Z0-9]/g, match => {
    if (/[a-z]/.test(match)) {
      // 小写
      if (match === "z") return "A";
      return String.fromCharCode(
        match.toUpperCase().charCodeAt() + 1
      ).toUpperCase();
    } else if (/[A-Z]/.test(match)) {
      // 大写
      if (match === "Z") return "a";
      return String.fromCharCode(
        match.toLowerCase().charCodeAt() + 1
      ).toLowerCase();
    } else {
      return match === "9" ? 0 : Number(match) + 1;
    }
  });
  return str;
}

/**
 * 解密字符串
 * @param {string} s
 * @returns {string}
 */
function deencrypt(s) {
  let str = s;
  str = str.replace(/[a-zA-Z0-9]/g, match => {
    if (/[a-z]/.test(match)) {
      // 小写
      if (match === "a") return "Z";
      return String.fromCharCode(
        match.toUpperCase().charCodeAt() - 1
      ).toUpperCase();
    } else if (/[A-Z]/.test(match)) {
      // 大写
      if (match === "A") return "z";
      return String.fromCharCode(
        match.toLowerCase().charCodeAt() - 1
      ).toLowerCase();
    } else {
      return match === "0" ? 9 : Number(match) - 1;
    }
  });
  return str;
}
```

### [HJ30 字符串合并处理](https://www.nowcoder.com/practice/d3d8e23870584782b3dd48f26cb39c8f?tpId=37&rp=1&sourceUrl=%2Fexam%2Foj%2Fta%3Fpage%3D3%26tpId%3D37%26type%3D37&difficulty=&judgeStatus=&tags=&title=&gioEnter=menu) :white_check_mark:

```js
const rl = require("readline").createInterface({ input: process.stdin });
var iter = rl[Symbol.asyncIterator]();
const readline = async () => (await iter.next()).value;

void (async function () {
  // Write your code here
  while ((line = await readline())) {
    const [s, t] = line.trim().split(" ");
    console.log(formatStr(mergeStr(s, t)));
  }
})();

function mergeStr(s, t) {
  let u = s + t;
  const arr = u.split("");
  const even = arr.filter((_, ind) => ind % 2 !== 0);
  const odd = arr.filter((_, ind) => ind % 2 === 0);
  odd.sort();
  even.sort();
  arr.length = 0;
  while (odd.length || even.length) {
    const a = odd.shift();
    const b = even.shift();
    if (!b) {
      arr.push(a);
    } else {
      arr.push(a);
      arr.push(b);
    }
  }
  return arr.join("");
}

function formatStr(s) {
  let result = "";
  for (const c of s) {
    if (!/[a-fA-F0-9]/.test(c)) {
      result += c;
    } else {
      let decimal = parseInt(c, 16);
      let binary = decimal
        .toString(2)
        .padStart(4, "0")
        .split("")
        .reverse()
        .join("");
      result += parseInt(binary, 2).toString(16).toUpperCase();
    }
  }
  return result;
}
```

### [HJ52 计算字符串的编辑距离](https://www.nowcoder.com/practice/3959837097c7413a961a135d7104c314?tpId=37&rp=1&sourceUrl=%2Fexam%2Foj%2Fta%3Fpage%3D3%26tpId%3D37%26type%3D37&difficulty=&judgeStatus=&tags=&title=&gioEnter=menu) :x:

### [HJ61 放苹果](https://www.nowcoder.com/practice/bfd8234bb5e84be0b493656e390bdebf?tpId=37&rp=1&sourceUrl=%2Fexam%2Foj%2Fta%3Fpage%3D3%26tpId%3D37%26type%3D37&difficulty=&judgeStatus=&tags=&title=&gioEnter=menu) :white_check_mark:

1. **描述**

把 m 个同样的苹果放在 n 个同样的盘子里，允许有的盘子空着不放，问共有多少种不同的分法？
注意：如果有 7 个苹果和 3 个盘子，（5，1，1）和（1，5，1）被视为是同一种分法。

2. **输入描述：**

输入苹果的个数 m 和盘子的个数 n，其中 1 <= m,n <= 10。

3. **输出描述：**

输出不同的分法数。

4. **示例 1**

输入：

```
7 3
```

输出：

```
8
```

**代码**

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
    //    1.1 "至少一个盘子为空"包含所有有空盘子的分法。
    //    1.2 "所有盘子不为空"包含没有空盘子的分法。
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

### [HJ64 MP3 光标位置](https://www.nowcoder.com/practice/eaf5b886bd6645dd9cfb5406f3753e15?tpId=37&rp=1&sourceUrl=%2Fexam%2Foj%2Fta%3Fpage%3D3%26tpId%3D37%26type%3D37&difficulty=&judgeStatus=&tags=&title=&gioEnter=menu) :white_check_mark:

### [HJ67 24 点游戏算法](https://www.nowcoder.com/practice/fbc417f314f745b1978fc751a54ac8cb?tpId=37&rp=1&sourceUrl=%2Fexam%2Foj%2Fta%3Fpage%3D1%26tpId%3D37%26type%3D37&difficulty=&judgeStatus=&tags=&title=&gioEnter=menu) :x:

1. **描述**

给出 4 个 1~10 的数字，通过加减乘除运算，得到数字 24，算式中的数字可以重复使用，且每个数字只能使用一次，运算符包括加(+)、减(-)、乘(\*)、除(/)。

2. **输入描述：**

输入共一行，包含四个空格隔开的整数 A、B、C、D，分别代表给定的 4 个数字（1 <= A、B、C、D <= 10）。

3. **输出描述：**

输出一行，如果存在能得到 24 的算式，则输出 Yes，否则输出 No。

4. **示例 1**

输入：

```js
4 1 8 7
```

输出：

```
Yes
```

**代码**

```js

```

### [HJ68 成绩排序](https://www.nowcoder.com/practice/8e400fd9905747e4acc2aeed7240978b?tpId=37&rp=1&sourceUrl=%2Fexam%2Foj%2Fta%3Fpage%3D3%26tpId%3D37%26type%3D37&difficulty=&judgeStatus=&tags=&title=&gioEnter=menu) :white_check_mark:

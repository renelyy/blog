# 常用技巧

## 求二进制中 1 的个数

::: code-group

```js [转字符串遍历]
function countOnes(n) {
  const str = n.toString(2);
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "1") {
      count++;
    }
  }
  return count;
}
```

```js [位运算]
// 通过不断地将数字与 1 进行按位与操作，可以检查最低位是否为 1。
// 然后将数字右移一位，继续检查下一位，直到数字变为 0 为止。
function countOnes(n) {
  let count = 0;
  while (n) {
    if (n & 1) {
      count++;
    }
    n >>= 1;
  }
  return count;
}
```

```js [位运算优化]
function countOnes(n) {
  // 通过不断地将数字与 (n - 1) 进行按位与操作，可以消除数字中的最低位的 1。
  // 然后通过计数器记录消除的次数，直到数字变为 0 为止。
  let count = 0;
  while (n) {
    n = n & (n - 1);
    count++;
  }
  return count;
}
```

:::

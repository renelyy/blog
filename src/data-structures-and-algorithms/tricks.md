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

## 判断一个数是否是 2 的幂

```js [位运算]
function isPowerOfTwo(n) {
  // 一个数是 2 的幂，那么它的二进制表示中只有一个 1。
  // 可以通过将数字减去 1，然后与原数字进行按位与操作，
  // 如果结果为 0，则说明数字是 2 的幂。
  return (n & (n - 1)) === 0;
}
```

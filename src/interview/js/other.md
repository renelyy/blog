## 反转字符串
::: code-group
```js [split + reverse + join]
// 方法一
function reverseString(str) {
  return str.split('').reverse().join('')
}
```

```js [Array.from + reduce]
// 方法三
function reverseString(str) {
  return Array.from(str).reduce((res, cur) => cur + res, '')
}
```

```js [for 循环]
// 方法二
function reverseString(str) {
  let res = ''
  for (let i = str.length - 1; i >= 0; i--) {
    res += str[i]
  }
  return res
}
```

```js [双指针]
// 方法四
function reverseString(str) {
  let res = ''
  let left = 0
  let right = str.length - 1
  while (left <= right) {
    res += str[right]
    right--
    res = str[left] + res
    left++
  }
  return res
}
```
:::
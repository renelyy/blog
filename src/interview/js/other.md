## 反转字符串

::: code-group

```js [split + reverse + join]
// 方法一
function reverseString(str) {
  return str.split("").reverse().join("");
}
```

```js [Array.from + reduce]
// 方法三
function reverseString(str) {
  return Array.from(str).reduce((res, cur) => cur + res, "");
}
```

```js [for 循环]
// 方法二
function reverseString(str) {
  let res = "";
  for (let i = str.length - 1; i >= 0; i--) {
    res += str[i];
  }
  return res;
}
```

```js [双指针]
// 方法四
function reverseString(str) {
  let res = "";
  let left = 0;
  let right = str.length - 1;
  while (left <= right) {
    res += str[right];
    right--;
    res = str[left] + res;
    left++;
  }
  return res;
}
```

:::

## 格式化日期

::: code-group

```js [简单版]
function formatDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}
```

```js [padStart]
function formatDate(date) {
  const pad = num => String(num).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}
```

```js [格式化]
function formatDate(date, format = "YYYY-MM-DD HH:mm:ss") {
  const pad = num => String(num).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());
  return format
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hour)
    .replace("mm", minute)
    .replace("ss", second);
}
```

```js [格式化-优雅]
const formatDate = (date, format = "YYYY-MM-DD HH:mm:ss") => {
  const pad = num => String(num).padStart(2, "0");
  const replacements = {
    YYYY: date.getFullYear(),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds())
  };

  return Object.entries(replacements).reduce(
    (str, [key, value]) => str.replace(key, value),
    format
  );
};
```

:::

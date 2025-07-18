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

## 解析 Url 为参数对象

::: code-group

```js [正则-match]
function parseUrl(url) {
  const params = {};
  const reg = /([^?&=]+)=([^?&=]*)/g;
  const match = url.match(reg);
  if (match) {
    match.forEach(item => {
      const [key, value] = item.split("=");
      params[key] = decodeURIComponent(value);
    });
  }
  return params;
}
```

```js [正则-exec]
function parseUrl(url) {
  const params = {};
  const reg = /([^?&=]+)=([^?&=]*)/g;
  let match;
  while ((match = reg.exec(url))) {
    const [key, value] = match[0].split("=");
    params[key] = decodeURIComponent(value);
  }
  return params;
}
```

```js [URLSearchParams]
function parseUrl(url) {
  const params = new URLSearchParams(url.split("?")[1]);
  const res = {};
  for (const [key, value] of params.entries()) {
    res[key] = value;
  }
  return res;
}
```

```js [exec split]
function parseParam(url) {
  const paramsStr = /.+\?(.+)$/.exec(url)[1]; // 将 ? 后面的字符串取出来
  const paramsArr = paramsStr.split("&"); // 将字符串以 & 分割后存到数组中
  let paramsObj = {};
  // 将 params 存到对象中
  paramsArr.forEach(param => {
    if (/=/.test(param)) {
      // 处理有 value 的参数
      let [key, val] = param.split("="); // 分割 key 和 value
      val = decodeURIComponent(val); // 解码
      val = /^\d+$/.test(val) ? parseFloat(val) : val; // 判断是否转为数字

      if (paramsObj.hasOwnProperty(key)) {
        // 如果对象有 key，则添加一个值
        paramsObj[key] = [].concat(paramsObj[key], val);
      } else {
        // 如果对象没有这个 key，创建 key 并设置值
        paramsObj[key] = val;
      }
    } else {
      // 处理没有 value 的参数
      paramsObj[param] = true;
    }
  });

  return paramsObj;
}
```

:::

## 写一个 createCancelFn

:::code-group

```js [基础]
const NOOP = () => {};

/**
 * 创建一个取消函数
 *
 * @param {Function} fn 需要执行的函数
 * @returns {Object} 包含 cancel 和 run 方法的对象
 *
 * 核心功能：
 * 1. 可取消的异步操作：允许在执行过程中取消正在进行的异步操作
 * 2. 防止竞态条件：确保最新的调用会取消之前的未完成调用
 *
 * 注意事项：
 * 1. 取消操作不会实际中止网络请求，只是忽略它的结果
 * 2. 如果需要真正中止请求，应该使用 AbortController 配合此函数
 */
function createCancelFn(fn) {
  let cancel = NOOP; // 初始化为空操作

  return {
    // 取消方法
    cancel: () => cancel(),

    // 执行方法
    run: (...args) => {
      return new Promise((resolve, reject) => {
        cancel(); // 取消之前的调用

        // 设置新的取消函数
        cancel = () => (resolve = reject = NOOP);

        // 执行实际函数
        fn(...args).then(
          res => resolve(res),
          err => reject(err)
        );
      });
    }
  };
}
```

```js [改进版本（支持真正取消）]
function createCancelFn(fn) {
  let abortController = null;
  let cancel = () => {};

  return {
    cancel: () => cancel();,
    run(...args) {
      cancel(); // 取消之前的请求
      cancel = () => {
        if (abortController) {
          abortController.abort();
          abortController = null;
        }
      };
      abortController = new AbortController();
      const signal = abortController.signal;

      return new Promise((resolve, reject) => {
        // 监听中止事件
        signal.addEventListener("abort", () => {
          console.log("监听到了中止事件...");
          reject(new DOMException("Aborted", "AbortError"));
        });

        // 正确传递参数
        fn(...args, { signal })
          .then(resolve)
          .catch(err => {
            // 只有非中止错误才打印日志
            if (err.name !== "AbortError") {
              console.error("请求失败:", err);
            }
            reject(err);
          });
      });
    }
  };
}
```

:::

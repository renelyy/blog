# Web API

## AbortController

AbortController 接口表示一个控制器对象，允许你根据需要中止一个或多个 Web 请求。

```js
const controller = new AbortController();
const signal = controller.signal;
let url = "https://baidu.com";
fetch(url, { signal })
  .then(response => {
    // handle response
    return response;
  })
  .catch(err => {
    if (err.name === "AbortError") {
      console.log("Fetch aborted");
    } else {
      console.error("An error occurred:", err);
    }
  });

// 取消请求
controller.abort();
```

::: tip
当 abort() 被调用时，这个 fetch() promise 将 reject 一个名为 AbortError 的 DOMException。
:::

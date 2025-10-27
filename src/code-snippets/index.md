# 代码片段

## 解构后的 this 指向问题

```js [selfish]
class Logger {
  printName(name = "default name") {
    this.print(`Hello ${name}`);
  }

  print(text) {
    console.log(text);
  }
}

function selfish(target) {
  const cache = new WeakMap();

  const handler = {
    get(target, key) {
      const value = Reflect.get(target, key);
      if (typeof value !== "function") {
        return value;
      }
      if (!cache.has(value)) {
        cache.set(value, value.bind(target));
      }
      return cache.get(value);
    }
  };

  return new Proxy(target, handler);
}

const logger = selfish(new Logger());
// const { printName } = logger; // 直接解构会导致 this 指向 undefined，从而报错
const { printName } = logger;
printName("222");
```

## Mixin 模式的实现

```js
function mix(...mixins) {
  class Mix {
    constructor() {
      for (let mixin of mixins) {
        copyProperties(this, new mixin()); // 拷贝实例属性
      }
    }
  }

  for (let mixin of mixins) {
    copyProperties(Mix, mixin); // 拷贝静态属性
    copyProperties(Mix.prototype, mixin.prototype); // 拷贝原型属性
  }

  return Mix;
}

function copyProperties(target, source) {
  for (let key of Reflect.ownKeys(source)) {
    if (key !== "constructor" && key !== "prototype" && key !== "name") {
      let desc = Object.getOwnPropertyDescriptor(source, key);
      Object.defineProperty(target, key, desc);
    }
  }
}

class Loggable {
  //
}

class Serializable {
  //
}

// 上面代码的mix函数，可以将多个对象合成为一个类。使用的时候，只要继承这个类即可。
class DistributedEdit extends mix(Loggable, Serializable) {
  // ...
}
```

## 使用 Promise 加载图片

```js
function loadImageAsync(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      resolve(image);
    };

    image.onerror = () => {
      reject(new Error(`Could not load image at ${url}`));
    };

    image.src = url;
  });
}
```

## 使用 Promise 封装 AJAX 请求

```js
function ajax(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "json";
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.response);
      } else {
        reject(new Error(`Request failed with status ${xhr.status}`));
      }
    };
    xhr.onerror = () => {
      reject(new Error("Network Error"));
    };
    xhr.send();
  });
}
```

## 接口失败重试机制

::: code-group

```js [简单重试机制]
/**
 * 基础重试函数
 * @param {Function} apiCall - 接口调用函数
 * @param {number} maxRetries - 最大重试次数
 * @param {number} delay - 重试延迟(毫秒)
 * @returns {Promise}
 */
async function retry(apiCall, maxRetries = 3, delay = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await apiCall();
      console.log(`接口调用成功，第 ${attempt} 次尝试`);
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`第 ${attempt} 次调用失败:`, error.message);

      if (attempt === maxRetries) {
        break;
      }

      console.log(`等待 ${delay}ms 后重试...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error(
    `接口调用失败，已重试 ${maxRetries} 次: ${lastError.message}`
  );
}
```

```js [带指数退避的重试]
class RetryStrategy {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.backoffMultiplier = options.backoffMultiplier || 2;
    this.retryCondition = options.retryCondition || this.defaultRetryCondition;
  }

  defaultRetryCondition(error) {
    // 只在网络错误、超时、5xx 状态码时重试
    const retryableStatusCodes = [500, 502, 503, 504];
    const retryableErrorTypes = ["NetworkError", "TimeoutError", "ECONNRESET"];

    return (
      retryableStatusCodes.includes(error.status) ||
      retryableErrorTypes.some(type => error.name?.includes(type)) ||
      error.code === "ECONNREFUSED"
    );
  }

  calculateDelay(attempt) {
    const delay =
      this.baseDelay * Math.pow(this.backoffMultiplier, attempt - 1);
    return Math.min(delay, this.maxDelay);
  }

  async execute(apiCall) {
    let lastError;

    for (let attempt = 1; attempt <= this.maxRetries + 1; attempt++) {
      try {
        const result = await apiCall();
        console.log(`✅ 接口调用成功 (第 ${attempt} 次尝试)`);
        return result;
      } catch (error) {
        lastError = error;

        if (attempt > this.maxRetries || !this.retryCondition(error)) {
          console.error(`❌ 最终失败: ${error.message}`);
          throw this.enhanceError(error, attempt);
        }

        const delay = this.calculateDelay(attempt);
        console.warn(
          `⚠️ 第 ${attempt} 次失败，${delay}ms 后重试: ${error.message}`
        );

        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  enhanceError(error, attempt) {
    error.attempts = attempt;
    error.finalAttempt = true;
    return error;
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

```js [vue3 巧妙]
function fetch() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject("error");
    }, 1000);
  });
}

/**
 * load 函数接收一个 onError 回调函数作为参数，当加载失败时，会调用该回调函数
 */
function load(loadData, onError) {
  const p = loadData();

  // 捕获错误
  return p.catch(err => {
    return new Promise((resolve, reject) => {
      const retry = () => resolve(load(onError));
      const fail = () => reject(err);

      onError(retry, fail);
    });
  });
}

load(fetch, (retry, fail) => {
  // 失败后重试
  retry();
}).then(res => {
  // 成功
  console.log(res);
});
```

:::

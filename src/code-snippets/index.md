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

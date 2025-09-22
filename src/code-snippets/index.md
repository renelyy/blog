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

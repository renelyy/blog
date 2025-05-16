## 深浅拷贝

::: code-group

```js [浅拷贝]
/**
 * 简单版：浅拷贝
 * 只考虑普通对象属性，不考虑内置对象和函数
 */
function shallowCopy(obj) {
  if (typeof obj !== "object" || obj === null) return obj;
  const newObj = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}
```

```js [简单版-深拷贝]
/**
 * 简单版：深拷贝
 * 只考虑普通对象属性，不考虑内置对象和函数
 */
function deepCopy(obj) {
  if (typeof obj !== "object" || obj === null) return obj;
  const newObj = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = deepCopy(obj[key]);
    }
  }
  return newObj;
}
```

```js [复杂版-深拷贝]
/**
 * 复杂版：深拷贝
 * 考虑内置对象和函数
 */
// 辅助函数
const isObject = target =>
  target !== null &&
  (typeof target === "object" || typeof target === "function");
const hasOwn = (target, key) =>
  Object.prototype.hasOwnProperty.call(target, key);
// 判断基本类型
const isPrimitiveValue = target =>
  typeof target === "string" ||
  typeof target === "number" ||
  typeof target === "boolean" ||
  typeof target === "symbol" ||
  typeof target === "bigint" ||
  target === null ||
  target === undefined ||
  Number.isNaN(target);

/**
 * 复杂版：深拷贝
 * 考虑内置对象和函数
 */
function deepClone(target, map = new WeakMap()) {
  // 基本类型直接返回
  if (isPrimitiveValue(target)) return target;
  // 如果 target 是 null 或者不是对象，则直接返回 target
  if (!isObject(target)) return target;
  // 解决循环引用
  if (map.get(target)) return map.get(target);
  // 获取当前对象的构造函数
  const constructor = target.constructor;
  // 判断 target 是否是 Date 类型
  if (target instanceof Date) return new Date(target);
  // 判断 target 是否是 RegExp 类型
  if (target instanceof RegExp) return new RegExp(target);
  // 判断 target 是否是 Map 类型
  if (target instanceof Map) {
    const mapClone = new Map();
    map.set(target, mapClone);
    target.forEach((value, key) => {
      mapClone.set(deepClone(key, map), deepClone(value, map));
    });
    return mapClone;
  }
  // 判断 target 是否是 Set 类型
  if (target instanceof Set) {
    const setClone = new Set();
    map.set(target, setClone);
    target.forEach(value => {
      setClone.add(deepClone(value, map));
    });
    return setClone;
  }
  // 判断 target 是否是 Function
  if (typeof target === "function") {
    // 箭头函数直接返回自身
    // 箭头函数没有原型，使用这个判断
    if (!target.prototype) return target;

    return eval(`(${target.toString()})`);
  }
  // 处理 Object 和 Array 类型
  const clone = new constructor();
  map.set(target, clone);
  for (let key in target) {
    if (hasOwn(target, key)) {
      clone[key] = deepClone(target[key], map);
    }
  }
  return clone;
}
```

```js [复杂版-封装]
/**
 * 复杂版：深拷贝
 * 高度封装
 */
function deepClonePlus(target, cache = new WeakMap()) {
  const { isObject, isPrimitiveValue, getType } = deepClonePlus.utils;

  // 基本类型直接返回
  if (!isObject(target) || isPrimitiveValue(target)) return target;

  // 检查缓存，避免循环引用
  if (cache.has(target)) return cache.get(target);

  const type = getType(target);
  const handler = deepClonePlus.utils.cloneHandlers[type];

  if (!handler) return target; // 未知类型直接返回

  // 调用对应的克隆处理器，并传入 cache
  const cloned = handler(target, cache);
  cache.set(target, cloned);
  return cloned;
}

deepClonePlus.utils = {
  // 类型判断工具
  isObject: target =>
    target !== null &&
    (typeof target === "object" || typeof target === "function"),
  isPrimitiveValue: target => {
    const type = typeof target;
    return (
      type === "string" ||
      type === "number" ||
      type === "boolean" ||
      type === "symbol" ||
      type === "bigint" ||
      target === null ||
      target === undefined ||
      Number.isNaN(target)
    );
  },
  getType: target => {
    // 检测 DOM 结点（仅在浏览器环境）
    if (typeof window !== "undefined" && target instanceof window.Node) {
      return "Node";
    }

    // 检测 Date 类型
    return Object.prototype.toString.call(target).slice(8, -1);
  },

  // 克隆处理器
  cloneHandlers: {
    Date: (date, _cache) => new Date(date),
    RegExp: (reg, _cache) => new RegExp(reg.source, reg.flags),
    Function: (func, _cache) => func, // 函数直接返回
    Boolean: (bool, _cache) => Boolean(bool), // 返回原始值
    Number: (num, _cache) => Number(num), // 返回原始值
    String: (str, _cache) => String(str), // 返回原始值
    Error: (error, cache) => {
      const errorClone = new Error(error.message);
      // 仅拷贝自定义属性（跳过 stack 等）
      Object.getOwnPropertyNames(error).forEach(key => {
        console.log(key);
        if (key !== "stack") {
          errorClone[key] = deepClonePlus(error[key], cache);
        }
      });
      return errorClone;
    },
    Map: (map, cache) => {
      const mapClone = new Map();
      map.forEach((value, key) => {
        mapClone.set(deepClonePlus(key, cache), deepClonePlus(value, cache));
      });
      return mapClone;
    },
    Set: (set, cache) => {
      const setClone = new Set();
      set.forEach(value => {
        setClone.add(deepClonePlus(value, cache));
      });
      return setClone;
    },
    Object: (obj, cache) => {
      const newObj = Object.create(Object.getPrototypeOf(obj));
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          newObj[key] = deepClonePlus(obj[key], cache);
        }
      }
      return newObj;
    },
    Array: (arr, cache) => {
      const newArr = [];
      arr.forEach(item => {
        newArr.push(deepClonePlus(item, cache));
      });
      return newArr;
    },
    // 再极端点，可以加上 DOM 节点
    Node: (node, _cache) => node.cloneNode(true)
  }
};
```

:::

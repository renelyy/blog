# Vue3 常见面试题

## Vue3 源码

### 响应系统实现

::: code-group

```js [effect]
let activeEffect = null;
const effectStack = [];

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    deps.delete(effectFn);
  }
  effectFn.deps.length = 0;
}

function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(effectFn);
    let res = fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
    return res;
  };
  effectFn.options = options;

  // activeEffect.deps 用来存储所有与该副作用函数相关联的依赖集合
  effectFn.deps = [];
  if (!options.lazy) {
    effectFn();
  }

  return effectFn;
}
```

```js [track]
const bucket = new WeakMap();

function track(target, key) {
  if (!activeEffect || !shouldTrack) return;

  let depsMap = bucket.get(target);
  if (!depsMap) bucket.set(target, (depsMap = new Map()));

  let deps = depsMap.get(key);
  if (!deps) depsMap.set(key, (deps = new Set()));
  deps.add(activeEffect);

  // deps 就是一个与当前副作用函数存在联系的依赖集合
  // 将其添加到 activeEffect.deps 数组中，方便后续 clean
  activeEffect.deps.push(deps);
}
```

```js [trigger]
function trigger(target, key, type, newVal) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;

  const effects = depsMap.get(key);
  // effects && effects.forEach(effectFn => effectFn());
  const effectsToRun = new Set();

  if (effects) {
    effects.forEach(effectFn => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn);
      }
    });
  }

  // 当操作类型为 'ADD' 且目标对象是数组时，应该触发与 length 属性相关联的副作用函数重新执行
  if (type === "ADD" && Array.isArray(target)) {
    // 获取与 length 属性相关联的副作用函数
    const lengthEffects = depsMap.get("length");
    // 将这些副作用函数添加到 effectsToRun 中，待会统一执行
    lengthEffects &&
      lengthEffects.forEach(effectFn => {
        if (effectFn !== activeEffect) {
          effectsToRun.add(effectFn);
        }
      });
  }

  if (
    type === "ADD" ||
    type === "DELETE" ||
    (type === "SET" &&
      Object.prototype.toString.call(target) === "[object Map]")
  ) {
    // 当操作类型是 ADD 或 DELETE，意味着 Map 的键值对数量发生了变化
    // 当操作类型是 SET，且目标对象是 Map 时，意味着 Map 的键值对发生了变化
    // 这三种情况下，需要触发与 ITERATOR_KEY 相关联的副作用函数重新执行
    const iterateEffects = depsMap.get(ITERATOR_KEY);
    iterateEffects &&
      iterateEffects.forEach(effectFn => {
        if (effectFn !== activeEffect) {
          effectsToRun.add(effectFn);
        }
      });
  }

  if (
    (type === "ADD" || type === "DELETE") &&
    Object.prototype.toString.call(target) === "[object Map]"
  ) {
    // 当操作类型是 ADD 或 DELETE，意味着 Map 的键值对数量发生了变化
    // 这时需要触发与 MAP_KEY_ITERATE_KEY 相关联的副作用函数重新执行
    const iterateEffects = depsMap.get(MAP_KEY_ITERATE_KEY);
    iterateEffects &&
      iterateEffects.forEach(effectFn => {
        if (effectFn !== activeEffect) {
          effectsToRun.add(effectFn);
        }
      });
  }

  // 如果操作目标是数组，并且修改了数组的 length 属性
  if (Array.isArray(target) && key === "length") {
    // 对于索引大于或等于新的 length 值的元素
    // 需要把相关联的副作用函数取出并添加到 effectsToRun 中待会执行
    depsMap.forEach((effects, key) => {
      // 这里的操作是设置了 length 属性，且 length 属性变小了
      // 所以要把大于等于新 length 的索引对应的副作用函数取出添加到 effectsToRun 中
      // 原来的 length 是 10，新的 length 是 3，因此大于等于 3 的索引对应的副作用函数都要执行
      // 以前有值，现在没值了，这些值对应的副作用函数都要执行
      if (key >= newVal) {
        effects.forEach(effectFn => {
          if (effectFn !== activeEffect) {
            effectsToRun.add(effectFn);
          }
        });
      }
    });
  }

  effectsToRun.forEach(effectFn => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn());
    } else {
      effectFn();
    }
  });
}
```

```js [createReactive]
const ITERATOR_KEY = Symbol();
const MAP_KEY_ITERATE_KEY = Symbol();

// 重写数组的部分方法 includes、indexOf、lastIndexOf
// 目的：解决数组代理对象查找不到的问题
const arrayInstrumentations = {};
["includes", "indexOf", "lastIndexOf"].forEach(method => {
  const originMethod = Array.prototype[method];
  arrayInstrumentations[method] = function (...args) {
    // this 指向的是代理对象，先在代理对象中查找，将结果存储到 res 中
    let res = originMethod.apply(this, args);
    if (res === false || res === -1) {
      // 如果代理对象中没有查找到，则继续去原始对象中查找
      res = originMethod.apply(this.raw, args);
    }
    return res;
  };
});

// 重写数组的 push、pop、shift、unshift、splice 方法
["push", "pop", "shift", "unshift", "splice"].forEach(method => {
  const originMethod = Array.prototype[method];
  arrayInstrumentations[method] = function (...args) {
    // 在调用原始方法之前，先禁止追踪
    shouldTrack = false;
    // 调用原始方法，方法的默认行为
    const res = originMethod.apply(this, args);
    // 在调用原始方法之后，恢复原来的行为，允许追踪
    shouldTrack = true;
    return res;
  };
});

function iterationMethod() {
  const wrap = val =>
    typeof val === "object" && val !== null ? reactive(val) : val;
  const target = this.raw;
  const itr = target[Symbol.iterator]();

  // 调用 track 函数建立响应联系
  track(target, ITERATOR_KEY);

  // 返回自定义的迭代器
  return {
    next() {
      const { value, done } = itr.next();
      return {
        value: done ? undefined : [wrap(value[0]), wrap(value[1])],
        done
      };
    },
    // 实现可迭代协议
    [Symbol.iterator]() {
      return this;
    }
  };
}

function valueIterationMethod() {
  const wrap = val =>
    typeof val === "object" && val !== null ? reactive(val) : val;
  const target = this.raw;
  const itr = target.values();
  track(target, ITERATOR_KEY);
  return {
    next() {
      const { value, done } = itr.next();
      return {
        value: done ? undefined : wrap(value),
        done
      };
    },
    [Symbol.iterator]() {
      return this;
    }
  };
}

function keysIterationMethod() {
  const target = this.raw;
  const itr = target.keys();
  track(target, MAP_KEY_ITERATE_KEY);
  return {
    next() {
      const { value, done } = itr.next();
      return {
        value: done ? undefined : value,
        done
      };
    },
    [Symbol.iterator]() {
      return this;
    }
  };
}

// 重写 Set 的 add 和 delete 方法
const mutableInstrumentations = {
  add(key) {
    // this 指向的是代理对象，通过 this.raw 获取原始对象
    const target = this.raw;
    // 先判断值是否已经存在
    const hadKey = target.has(key);
    // 通过原始数据对象执行 add 方法添加具体的值
    // 注意：这里不再需要 .bind 了，因为我们直接通过原始对象调用方法
    const res = target.add(key);
    // 触发响应，并指定操作类型为 ADD
    if (!hadKey) {
      trigger(target, key, "ADD");
    }
    return res;
  },
  delete(key) {
    const target = this.raw;
    const hadKey = target.has(key);
    const res = target.delete(key);
    if (hadKey) {
      trigger(target, key, "DELETE");
    }
    return res;
  },
  get(key) {
    const target = this.raw;
    const hadKey = target.has(key);
    track(target, key);
    if (hadKey) {
      const res = target.get(key);
      return typeof res === "object" && res !== null ? reactive(res) : res;
    }
  },
  set(key, value) {
    const target = this.raw;
    const hadKey = target.has(key);
    const oldValue = target.get(key);
    // 获取原始数据，由于 value 本身可能已经是原始数据，所以此时 value.raw 不存在，则直接使用 value
    const rawValue = value.raw || value;
    target.set(key, rawValue);
    if (!hadKey) {
      trigger(target, key, "ADD");
    } else if (
      oldValue !== value &&
      (oldValue === oldValue || value === value)
    ) {
      trigger(target, key, "SET");
    }
  },
  forEach(callback, thisArg) {
    // wrap 函数用来把可代理的值转化为响应式数据
    const wrap = val =>
      typeof val === "object" && val !== null ? reactive(val) : val;
    const target = this.raw;
    track(target, ITERATOR_KEY);
    // 通过原始数据执行 forEach 方法
    target.forEach((v, k) => {
      callback.call(thisArg, wrap(v), wrap(k), this);
    });
  },
  [Symbol.iterator]: iterationMethod,
  entries: iterationMethod,
  values: valueIterationMethod
};

function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    // 拦截设置操作
    set(target, key, newVal, receiver) {
      if (isReadonly) {
        console.warn(`属性 ${key} 是只读的`);
        return;
      }

      const oldVal = target[key];
      // Array => 如果代理目标是数组，则检测被设置的索引值是否小于数组长度，
      //          如果是，则视作 SET 操作，否则是 ADD 操作
      // Object => 如果属性不存在，则说明是在添加新的属性，否则是设置已有属性
      const type = Array.isArray(target)
        ? Number(key) < target.length ? "SET" : "ADD"
        : Object.prototype.hasOwnProperty.call(target, key) ? "SET" : "ADD";

      const res = Reflect.set(target, key, newVal, receiver);

      if (target === receiver.raw) {
        if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
          // 增加第四个参数，即触发响应的新值
          trigger(target, key, type, newVal);
        }
      }

      if (isShallow) {
        return res;
      }

      return createReactive(res);
    },
    get(target, key, receiver) {
      // 如果访问的是 raw 属性，则返回原始对象
      if (key === "raw") {
        return target;
      }

      if (target instanceof Set) {
        if (key === "size") {
          // 调用 track 函数建立响应联系
          track(target, ITERATOR_KEY);
          return Reflect.get(target, key, receiver);
        } else {
          return mutableInstrumentations[key];
        }
      }

      // 如果操作的目标是数组，并且 key 存在于 arrayInstrumentations 中
      // 那么返回定义在 arrayInstrumentations 上的值
      if (
        Array.isArray(target) &&
        Object.prototype.hasOwnProperty.call(arrayInstrumentations, key)
      ) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }

      // 非只读情况下，进行依赖收集
      // 添加判断，如果 key 的类型是 symbol，则不进行依赖收集
      if (!isReadonly && typeof key !== "symbol") {
        track(target, key);
      }

      const res = Reflect.get(target, key, receiver);

      if (isShallow) {
        return res;
      }

      if (typeof res === "object" && res !== null) {
        // 如果数据为只读，则调用 readonly 方法进行包装，否则调用 reactive 方法进行包装
        return isReadonly ? readonly(res) : reactive(res);
      }

      return res;
    },
    deleteProperty(target, key) {
      // 如果是只读的，则打印警告信息并返回
      if (isReadonly) {
        console.warn(`属性 ${key} 是只读的`);
        return;
      }
      const hadKey = Object.prototype.hasOwnProperty.call(target, key);
      const res = Reflect.deleteProperty(target, key);
      if (res && hadKey) {
        trigger(target, key, "DELETE");
      }
      return res;
    },
    ownKeys(target) {
      // 如果操作目标 target 是数组，则使用 length 属性作为 key 并建立响应联系
      track(target, Array.isArray(target) ? "length" : ITERATOR_KEY);
      return Reflect.ownKeys(target);
    }
  });
}
```

```js [reactive]
function reactive(obj) {
  // 优先通过原始对象 obj 寻找之前创建的代理对象，如果找到了，直接返回该代理对象
  const existingProxy = reactiveMap.get(obj);
  if (existingProxy) {
    return existingProxy;
  }
  const proxy = createReactive(obj);
  // 将原始对象与代理对象的映射关系存储到 reactiveMap 中
  reactiveMap.set(obj, proxy);
  return proxy;
}

function shallowReactive(obj) {
  return createReactive(obj, true);
}

function readonly(obj) {
  return createReactive(obj, false, true);
}

function shallowReadonly(obj) {
  return createReactive(obj, true, true);
}
```

```js [全部]
// 存储副作用函数的桶
const bucket = new WeakMap();
let activeEffect = null;
const effectStack = [];
const ITERATOR_KEY = Symbol();
const MAP_KEY_ITERATE_KEY = Symbol();

// 用于存储原始对象到代理对象的映射
// 防止重复创建代理对象
const reactiveMap = new Map();
let shouldTrack = true;

function track(target, key) {
  if (!activeEffect || !shouldTrack) return;

  let depsMap = bucket.get(target);
  if (!depsMap) bucket.set(target, (depsMap = new Map()));

  let deps = depsMap.get(key);
  if (!deps) depsMap.set(key, (deps = new Set()));
  deps.add(activeEffect);

  // deps 就是一个与当前副作用函数存在联系的依赖集合
  // 将其添加到 activeEffect.deps 数组中，方便后续 clean
  activeEffect.deps.push(deps);
}

function trigger(target, key, type, newVal) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;

  const effects = depsMap.get(key);
  // effects && effects.forEach(effectFn => effectFn());
  const effectsToRun = new Set();

  if (effects) {
    effects.forEach(effectFn => {
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn);
      }
    });
  }

  // 当操作类型为 'ADD' 且目标对象是数组时，应该触发与 length 属性相关联的副作用函数重新执行
  if (type === "ADD" && Array.isArray(target)) {
    // 获取与 length 属性相关联的副作用函数
    const lengthEffects = depsMap.get("length");
    // 将这些副作用函数添加到 effectsToRun 中，待会统一执行
    lengthEffects &&
      lengthEffects.forEach(effectFn => {
        if (effectFn !== activeEffect) {
          effectsToRun.add(effectFn);
        }
      });
  }

  if (
    type === "ADD" ||
    type === "DELETE" ||
    (type === "SET" &&
      Object.prototype.toString.call(target) === "[object Map]")
  ) {
    // 当操作类型是 ADD 或 DELETE，意味着 Map 的键值对数量发生了变化
    // 当操作类型是 SET，且目标对象是 Map 时，意味着 Map 的键值对发生了变化
    // 这三种情况下，需要触发与 ITERATOR_KEY 相关联的副作用函数重新执行
    const iterateEffects = depsMap.get(ITERATOR_KEY);
    iterateEffects &&
      iterateEffects.forEach(effectFn => {
        if (effectFn !== activeEffect) {
          effectsToRun.add(effectFn);
        }
      });
  }

  if (
    (type === "ADD" || type === "DELETE") &&
    Object.prototype.toString.call(target) === "[object Map]"
  ) {
    // 当操作类型是 ADD 或 DELETE，意味着 Map 的键值对数量发生了变化
    // 这时需要触发与 MAP_KEY_ITERATE_KEY 相关联的副作用函数重新执行
    const iterateEffects = depsMap.get(MAP_KEY_ITERATE_KEY);
    iterateEffects &&
      iterateEffects.forEach(effectFn => {
        if (effectFn !== activeEffect) {
          effectsToRun.add(effectFn);
        }
      });
  }

  // 如果操作目标是数组，并且修改了数组的 length 属性
  if (Array.isArray(target) && key === "length") {
    // 对于索引大于或等于新的 length 值的元素
    // 需要把相关联的副作用函数取出并添加到 effectsToRun 中待会执行
    depsMap.forEach((effects, key) => {
      // 这里的操作是设置了 length 属性，且 length 属性变小了
      // 所以要把大于等于新 length 的索引对应的副作用函数取出添加到 effectsToRun 中
      // 原来的 length 是 10，新的 length 是 3，因此大于等于 3 的索引对应的副作用函数都要执行
      // 以前有值，现在没值了，这些值对应的副作用函数都要执行
      if (key >= newVal) {
        effects.forEach(effectFn => {
          if (effectFn !== activeEffect) {
            effectsToRun.add(effectFn);
          }
        });
      }
    });
  }

  effectsToRun.forEach(effectFn => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn());
    } else {
      effectFn();
    }
  });
}

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    deps.delete(effectFn);
  }
  effectFn.deps.length = 0;
}

/**
 * 调度执行
 */
const jobQueue = new Set();
const p = Promise.resolve();
let isFlushing = false;
function flushJob() {
  if (isFlushing) return;
  isFlushing = true;
  p.then(() => {
    jobQueue.forEach(job => job());
  }).finally(() => {
    isFlushing = false;
  });
}

function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(effectFn);
    let res = fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
    return res;
  };
  effectFn.options = options;

  // activeEffect.deps 用来存储所有与该副作用函数相关联的依赖集合
  effectFn.deps = [];
  if (!options.lazy) {
    effectFn();
  }

  return effectFn;
}

// 重写数组的部分方法 includes、indexOf、lastIndexOf
// 目的：解决数组代理对象查找不到的问题
const arrayInstrumentations = {};
["includes", "indexOf", "lastIndexOf"].forEach(method => {
  const originMethod = Array.prototype[method];
  arrayInstrumentations[method] = function (...args) {
    // this 指向的是代理对象，先在代理对象中查找，将结果存储到 res 中
    let res = originMethod.apply(this, args);
    if (res === false || res === -1) {
      // 如果代理对象中没有查找到，则继续去原始对象中查找
      res = originMethod.apply(this.raw, args);
    }
    return res;
  };
});

// 重写数组的 push、pop、shift、unshift、splice 方法
["push", "pop", "shift", "unshift", "splice"].forEach(method => {
  const originMethod = Array.prototype[method];
  arrayInstrumentations[method] = function (...args) {
    // 在调用原始方法之前，先禁止追踪
    shouldTrack = false;
    // 调用原始方法，方法的默认行为
    const res = originMethod.apply(this, args);
    // 在调用原始方法之后，恢复原来的行为，允许追踪
    shouldTrack = true;
    return res;
  };
});

function iterationMethod() {
  const wrap = val =>
    typeof val === "object" && val !== null ? reactive(val) : val;
  const target = this.raw;
  const itr = target[Symbol.iterator]();

  // 调用 track 函数建立响应联系
  track(target, ITERATOR_KEY);

  // 返回自定义的迭代器
  return {
    next() {
      const { value, done } = itr.next();
      return {
        value: done ? undefined : [wrap(value[0]), wrap(value[1])],
        done
      };
    },
    // 实现可迭代协议
    [Symbol.iterator]() {
      return this;
    }
  };
}

function valueIterationMethod() {
  const wrap = val =>
    typeof val === "object" && val !== null ? reactive(val) : val;
  const target = this.raw;
  const itr = target.values();
  track(target, ITERATOR_KEY);
  return {
    next() {
      const { value, done } = itr.next();
      return {
        value: done ? undefined : wrap(value),
        done
      };
    },
    [Symbol.iterator]() {
      return this;
    }
  };
}

function keysIterationMethod() {
  const target = this.raw;
  const itr = target.keys();
  track(target, MAP_KEY_ITERATE_KEY);
  return {
    next() {
      const { value, done } = itr.next();
      return {
        value: done ? undefined : value,
        done
      };
    },
    [Symbol.iterator]() {
      return this;
    }
  };
}

// 重写 Set 的 add 和 delete 方法
const mutableInstrumentations = {
  add(key) {
    // this 指向的是代理对象，通过 this.raw 获取原始对象
    const target = this.raw;
    // 先判断值是否已经存在
    const hadKey = target.has(key);
    // 通过原始数据对象执行 add 方法添加具体的值
    // 注意：这里不再需要 .bind 了，因为我们直接通过原始对象调用方法
    const res = target.add(key);
    // 触发响应，并指定操作类型为 ADD
    if (!hadKey) {
      trigger(target, key, "ADD");
    }
    return res;
  },
  delete(key) {
    const target = this.raw;
    const hadKey = target.has(key);
    const res = target.delete(key);
    if (hadKey) {
      trigger(target, key, "DELETE");
    }
    return res;
  },
  get(key) {
    const target = this.raw;
    const hadKey = target.has(key);
    track(target, key);
    if (hadKey) {
      const res = target.get(key);
      return typeof res === "object" && res !== null ? reactive(res) : res;
    }
  },
  set(key, value) {
    const target = this.raw;
    const hadKey = target.has(key);
    const oldValue = target.get(key);
    // 获取原始数据，由于 value 本身可能已经是原始数据，所以此时 value.raw 不存在，则直接使用 value
    const rawValue = value.raw || value;
    target.set(key, rawValue);
    if (!hadKey) {
      trigger(target, key, "ADD");
    } else if (
      oldValue !== value &&
      (oldValue === oldValue || value === value)
    ) {
      trigger(target, key, "SET");
    }
  },
  forEach(callback, thisArg) {
    // wrap 函数用来把可代理的值转化为响应式数据
    const wrap = val =>
      typeof val === "object" && val !== null ? reactive(val) : val;
    const target = this.raw;
    track(target, ITERATOR_KEY);
    // 通过原始数据执行 forEach 方法
    target.forEach((v, k) => {
      callback.call(thisArg, wrap(v), wrap(k), this);
    });
  },
  [Symbol.iterator]: iterationMethod,
  entries: iterationMethod,
  values: valueIterationMethod
};

function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    // 拦截设置操作
    set(target, key, newVal, receiver) {
      if (isReadonly) {
        console.warn(`属性 ${key} 是只读的`);
        return;
      }

      const oldVal = target[key];
      // Array => 如果代理目标是数组，则检测被设置的索引值是否小于数组长度，
      //          如果是，则视作 SET 操作，否则是 ADD 操作
      // Object => 如果属性不存在，则说明是在添加新的属性，否则是设置已有属性
      const type = Array.isArray(target)
        ? Number(key) < target.length ? "SET" : "ADD"
        : Object.prototype.hasOwnProperty.call(target, key) ? "SET" : "ADD";

      const res = Reflect.set(target, key, newVal, receiver);

      if (target === receiver.raw) {
        if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
          // 增加第四个参数，即触发响应的新值
          trigger(target, key, type, newVal);
        }
      }

      if (isShallow) {
        return res;
      }

      return createReactive(res);
    },
    get(target, key, receiver) {
      // 如果访问的是 raw 属性，则返回原始对象
      if (key === "raw") {
        return target;
      }

      if (target instanceof Set) {
        if (key === "size") {
          // 调用 track 函数建立响应联系
          track(target, ITERATOR_KEY);
          return Reflect.get(target, key, receiver);
        } else {
          return mutableInstrumentations[key];
        }
      }

      // 如果操作的目标是数组，并且 key 存在于 arrayInstrumentations 中
      // 那么返回定义在 arrayInstrumentations 上的值
      if (
        Array.isArray(target) &&
        Object.prototype.hasOwnProperty.call(arrayInstrumentations, key)
      ) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }

      // 非只读情况下，进行依赖收集
      // 添加判断，如果 key 的类型是 symbol，则不进行依赖收集
      if (!isReadonly && typeof key !== "symbol") {
        track(target, key);
      }

      const res = Reflect.get(target, key, receiver);

      if (isShallow) {
        return res;
      }

      if (typeof res === "object" && res !== null) {
        // 如果数据为只读，则调用 readonly 方法进行包装，否则调用 reactive 方法进行包装
        return isReadonly ? readonly(res) : reactive(res);
      }

      return res;
    },
    deleteProperty(target, key) {
      // 如果是只读的，则打印警告信息并返回
      if (isReadonly) {
        console.warn(`属性 ${key} 是只读的`);
        return;
      }
      const hadKey = Object.prototype.hasOwnProperty.call(target, key);
      const res = Reflect.deleteProperty(target, key);
      if (res && hadKey) {
        trigger(target, key, "DELETE");
      }
      return res;
    },
    ownKeys(target) {
      // 如果操作目标 target 是数组，则使用 length 属性作为 key 并建立响应联系
      track(target, Array.isArray(target) ? "length" : ITERATOR_KEY);
      return Reflect.ownKeys(target);
    }
  });
}

function ref(val) {
  const wrapper = {
    value: val
  };
  Object.defineProperty(wrapper, "__v_isRef", {
    value: true
  });
  return reactive(wrapper);
}

function toRef(obj, key) {
  const wrapper = {
    get value() {
      return obj[key];
    },
    set value(newVal) {
      obj[key] = newVal;
    }
  };
  Object.defineProperty(wrapper, "__v_isRef", {
    value: true
  });
  return wrapper;
}

function toRefs(obj) {
  const ret = {};
  for (const key in obj) {
    ret[key] = toRef(obj, key);
  }
  return ret;
}

function proxyRefs(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      return value.__v_isRef ? value.value : value;
    },
    set(target, key, newVal, receiver) {
      const value = target[key];
      if (value.__v_isRef) {
        value.value = newVal;
        return true;
      } else {
        return Reflect.set(target, key, newVal, receiver);
      }
    }
  });
}

function reactive(obj) {
  // 优先通过原始对象 obj 寻找之前创建的代理对象，如果找到了，直接返回该代理对象
  const existingProxy = reactiveMap.get(obj);
  if (existingProxy) {
    return existingProxy;
  }
  const proxy = createReactive(obj);
  // 将原始对象与代理对象的映射关系存储到 reactiveMap 中
  reactiveMap.set(obj, proxy);
  return proxy;
}

function shallowReactive(obj) {
  return createReactive(obj, true);
}

function readonly(obj) {
  return createReactive(obj, false, true);
}

function shallowReadonly(obj) {
  return createReactive(obj, true, true);
}

export {
  track,
  trigger,
  activeEffect,
  effect,
  reactive,
  shallowReactive,
  readonly,
  shallowReadonly,
  ref,
  toRef,
  toRefs
};
```

:::

### 渲染器

1. 渲染器的作用是把虚拟 DOM 渲染为特定平台上的真实元素
2. 替换使用。为了避免造成困惑，在本书中将统一使用 vnode
3. 自定义渲染器并不是“黑魔法”​，它只是通过抽象的手段，让核心代码不再依赖平台特有的 API，再通过支持个性化配置的能力来实现跨平台
4. 并不是所有 HTML Attributes 都有与之对应的 DOM Properties，例如：aria-* 类的 HTML Attributes 就没有与之对应的 DOM Properties
5. 类似地，也不是所有 DOM Properties 都有与之对应的 HTML Attributes，例如可以用 el.textContent 来设置元素的文本内容，但并没有与之对应的 HTML Attributes 来完成同样的工作
6. HTML Attributes 的作用是设置与之对应的 DOM Properties 的初始值。一旦值改变，那么 DOM Properties 始终存储着当前值，而通过 getAttribute 函数得到的仍然是初始值
7. `<input/>` 标签的 form 属性必须使用setAttribute 函数来设置，实际上，不仅仅是 `<input/>` 标签，所有表单元素都具有 form 属性，它们都应该作为 HTML Attributes 被设置
8. 在浏览器中为一个元素设置 class 有三种方式，即使用 `setAttribute`、`el.className` 或 `el.classList`
9. 使用 innerHTML 清空容器元素内容的另一个缺陷是，它不会移除绑定在 DOM 元素上的事件处理函数

```js
const Text = Symbol();
const Comment = Symbol();
const Fragment = Symbol();

const vnode = {
  type: "div",
  // 使用 props 描述一个元素的属性
  props: {
    id: "foo",
    // 使用 normalizeClass 函数对 class 进行归一化处理
    class: normalizeClass(["bar", { baz: true }])
  },
  children: [
    {
      type: "p",
      children: "hello"
    },
    {
      type: Text,
      children: "world"
    },
    {
      type: Comment,
      children: "我是注释内容"
    }
  ]
};

function normalizeClass(value) {
  //
}

const renderer = createRenderer({
  // 创建元素
  createElement(tag) {
    return document.createElement(tag);
  },
  createText(text) {
    return document.createTextNode(text);
  },
  setText(el, text) {
    el.nodeValue = text;
  },
  // 设置元素的文本内容
  setElementText(el, text) {
    el.textContent = text;
  },
  // 在给定的 parent 元素下添加一个子元素
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor);
  },
  patchProps(el, key, prevValue, nextValue) {
    // 匹配以 on 开头的属性，表示事件处理函数
    if (/^on/.test(key)) {
      // 使用伪造的 invoker 在更新事件时可以避免一次 removeEventListener 函数的调用，从而提升了性能。
      // 实际上，伪造的事件处理函数的作用不止于此，它还能解决事件冒泡与事件更新之间相互影响的问题
      // 获取为该元素伪造的事件处理函数 invoker
      const invokers = el._vei || (el._vei = {});
      let invoker = invokers[key];
      const name = key.slice(2).toLowerCase();
      if (nextValue) {
        if (!invoker) {
          // 如果 nextValue 存在，且 invoker 不存在，则表示这是第一次设置事件处理函数，则创建伪造的事件处理函数 invoker
          invoker = el._vei[key] = (e) => {
            // e.timeStamp 是事件发生时的时间戳
            // 如果事件发生的时间戳早于 invoker 被绑定的时间，则表示该事件与 invoker 无关，直接返回
            if (e.timeStamp < invoker.attached) return;
            // 如果 invoker.value 是数组，则遍历它并逐个调用事件处理函数  
           if (Array.isArray(invoker.value)) {
              invoker.value.forEach((fn) => fn(e));
            } else {
              invoker.value(e);
            }
          }
          // 将真正的事件处理函数赋值给 invoker.value
          invoker.value = nextValue;
          // 记录事件处理函数被绑定的时间
          invoker.attached = performance.now();
          // 绑定 invoker 作为事件处理函数
          el.addEventListener(name, invoker);
        } else {
          // 如果 invoker 存在，说明该元素的事件处理函数已经被设置过，只需要更新 invoker.value 的值即可
          invoker.value = nextValue;
        }
      } else if (invoker) {
        // 如果新绑定的事件处理函数不存在，且伪造的事件处理函数存在，则移除绑定的事件处理函数
        el.removeEventListener(name, invoker);
      }
    } if (key === "class") {
      el.className = nextValue;
    } else if (shouldSetAsProps(el, key, nextValue)) {
      // 获取该 DOM Properties 的类型
      const type = typeof el[key];

      // 如果 DOM Properties 是布尔类型，并且 nextValue 是空字符串，则将值矫正 为 true
      if (type === "boolean" && nextValue === "") {
        el[key] = true;
      } else {
        // 否则，直接设置 DOM Properties 的值为 nextValue
        el[key] = nextValue;
      }
    } else {
      // 如果不存在对应的 DOM Properties，则调用 el.setAttribute 函数设置属性
      el.setAttribute(key, nextValue);
    }
  }
});

function createRenderer(options) {
  const { createElement, setElementText, insert } = options;

  function render(vnode, container) {
    if (vnode) {
      // 新的 vnode 存在，将其与旧的 vnode 一起传递给 patch 函数，进行打补丁
      patch(container._vnode, vnode, container);
    } else {
      if (container._vnode) {
        // 旧的 vnode 存在，且新的 vnode 不存在，说明是卸载操作，调用 unmount 函数卸载旧的 vnode
        unmount(container._vnode);
      }
    }

    // 把 vnode 存储到 container._vnode 中，即后续渲染的旧的 vnode
    container._vnode = vnode;
  }

  /**
   * 打补丁
   * 
   * @param {Object} n1 旧的 vnode
   * @param {Object} n2 新的 vnode
   * @param {HTMLElement} container 容器
   */
  function patch(n1, n2, container, anchor) {
    // 如果 n1 存在，则对比新旧 vnode 类型是否相同，如果不同，则调用 unmount 函数卸载旧的 vnode
    if (n1 && n1.type !== n2.type) {
      unmount(n1);
      // 卸载完成后，我们应该将参数 n1 的值重置为 null，这样才能保证后续挂载操作正确执行
      n1 = null;
    }

    // 代码运行到这里，证明 n1 和 n2 所描述的内容是相同的，只是更新了内容
    const { type } = n2;
    if (typeof type === "string") {
      // 类型为字符串，代表描述的是普通元素
      if (!n1) {
        // 如果 n1 不存在，说明是挂载操作，则调用 mountElement 函数完成挂载
        mountElement(n2, container, anchor);
      } else {
        // 如果 n1 存在，说明是更新操作，则调用 patchElement 函数完成打补丁
        patchElement(n1, n2);
      }
    } else if (type === Text) {
      // 类型为 Text，代表描述的是文本节点
      if (!n1) {
        // 如果 n1 不存在，说明是挂载操作，则调用 mountText 函数完成挂载
        mountText(n2, container);
      } else {
        // 如果 n1 存在，说明是更新操作，则调用 patchText 函数完成打补丁
        patchText(n1, n2);
      }
    } else if (type === Fragment) {
      if (!n1) {
        // 如果旧节点不存在，则只需要将 Fragment 的子节点挂载到容器中即可
        n2.children.forEach(c => patch(null, c, container));
      } else {
        // 如果旧节点存在，则只需要更新 Fragment 的子节点即可
        patchChildren(n1, n2, container);
      }
    } else if (typeof type === "object") {
      // 类型为对象，代表描述的是组件
    } else if (typeof type === "otherType") {
      // 其他类型
    }
  }

  /**
   * 更新元素
   * 
   * @param {Object} n1 旧的 vnode
   * @param {Object} n2 新的 vnode
   */
  function patchElement(n1, n2) {
    // 获取真实 DOM 元素，因为 n2 还没有挂载，所以没有真实的 DOM，现将 n1 的真实 DOM 赋值给 n2.el
    // 这个赋值语句的真正含义其实就是 DOM 元素的复用（通过 diff 复用已经存在的节点）
    const el = (n2.el = n1.el);
    const oldProps = n1.props || {};
    const newProps = n2.props || {};

    // 第一步：更新 props
    for (const key in newProps) {
      if (newProps[key] !== oldProps[key]) {
        patchProps(el, key, oldProps[key], newProps[key]);
      }
    }
    for (const key in oldProps) {
      if (!(key in newProps)) {
        patchProps(el, key, oldProps[key], null);
      }
    }

    // 第二步：更新 children
    patchChildren(n1, n2, el);
  }

  function patchText(n1, n2) {
    const el = (n2.el = n1.el);
    if (n2.children !== n1.children) {
      setText(el, n2.children);
    }
  }

  /**
   * 更新子节点（对一个元素打补丁的最后一步操作）
   * 
   * @param {Object} n1 旧的 vnode
   * @param {Object} n2 新的 vnode
   * @param {HTMLElement} container 容器（真实 DOM）
   */
  function patchChildren(n1, n2, container) {
    // 新的子节点是文本节点
    if (typeof n2.children === "string") {
      // 旧子节点的类型有三种可能：没有子节点、文本子节点、数组子节点
      // 只有当旧子节点类型是数组时，才需要逐个卸载旧子节点，其他情况直接覆盖即可
      if (Array.isArray(n1.children)) {
        n1.children.forEach(c => unmount(c));
      }

      setElementText(container, n2.children);
    } else if (Array.isArray(n2.children)) {
      // 新子节点是一组子节点

      // 旧子节点的类型有三种可能：没有子节点、文本子节点、数组子节点
      // 判断旧子节点是否也是一组子节点
      if (Array.isArray(n1.children)) {
        // 旧子节点也是一组子节点，那么需要做“diff”操作，这里涉及到核心的 diff 算法

        const oldChildren = n1.children;
        const newChildren = n2.children;
        const oldLen = oldChildren.length;
        const newLen = newChildren.length;

        let lastIndex = 0; // 记录遍历到的最大索引
        for (let i = 0; i < newLen; i++) {
          const newVNode = newChildren[i];
          let j = 0;
          // 在第一层循环中定义变量 find，代表是否在旧的一组节点中找到可复用的节点
          let find = false; // 初始值为 false，表示没有找到
          for (; j < oldLen; j++) {
            const oldVNode = oldChildren[j];
            if (newVNode.key === oldVNode.key) {
              find = true;
              patch(oldVNode, newVNode, container);
              if (j < lastIndex) {
                // 说明 newVNode 在老的子节点中的位置比 lastIndex 小，则需要进行移动操作
                // 移动操作
                // 获取 newVNode 的前一个节点
                const prevVnode = newChildren[i - 1];
                // 如果 prevVnode 不存在，则说明 newVNode 是第一个节点，不需要移动
                if (prevVnode) {
                  // 由于我们要将 newVNode 对应的真实 DOM 移动到 prevVnode 对应的真实 DOM 后面，所以我们需要获取 prevVnode 对应的真实 DOM 的下一个兄弟节点，作为锚点
                  const anchor = prevVnode.el.nextSibling;
                  insert(newVNode.el, container, anchor);
                }
              } else {
                // 说明 newVNode 在老的子节点中的位置比 lastIndex 大，则不需要移动
                lastIndex = j;
              }
              break;
            }
          }
          // 如果代码运行到这里，find 仍然为 false，
          // 说明在旧的一组子节点中没有找到可复用的节点，那么就说明 newVNode 是全新的节点，需要挂载
          if (!find) {
            // 为了将节点挂载到正确位置，我们需要先获取锚点元素
            // 首先获取当前 newVNode 的前一个 vnode 节点
            const prevVnode = newChildren[i - 1];
            let anchor = null;
            if (prevVnode) {
              // 如果有前一个 vnode 节点，则使用它的下一个兄弟节点作为锚点元素
              anchor = prevVnode.el.nextSibling;
            } else {
              // 如果没有前一个 vnode 节点，则说明即将挂载的新节点是第一个子节点
              // 这时我们使用容器元素的 firstChild 作为锚点元素
              anchor = container.firstChild;
            }
            // 挂载新节点
            // 为什么要调用 patch 而不是 insert 函数呢？因为 newVNode 可能还是一个虚拟节点，需要递归地将其子节点也挂载
            // 而且要处理 props 等
            patch(null, newVNode, container, anchor);
          }
        }

        // 遍历旧的一组子节点，找出不在新的一组子节点中的节点，并执行卸载操作
        for (let i = 0; i < oldLen; i++) {
          const oldVNode = oldChildren[i];
          const has = newChildren.find(vnode => vnode.key === oldVNode.key);
          if (!has) {
            // 如果 oldVNode 不在新的一组子节点中，则执行卸载操作
            unmount(oldVNode);
          }
        }
      } else {
        // 旧子节点不是一组子节点，则说明旧子节点要么是文本子节点，要么不存在
        // 但无论哪种情况，我们都只需要将容器清空，然后将新的子节点逐个挂载即可
        setElementText(container, "");
        // 然后把新的子节点逐个挂载
        n2.children.forEach(c => patch(null, c, container));
      }
    } else {
      // 代码运行到这里，说明新的子节点不存在
      // 旧子节点的类型有三种可能：没有子节点、文本子节点、数组子节点
      // 旧子节点是一组子节点，那么需要逐个卸载旧子节点
      if (Array.isArray(n1.children)) {
        n1.children.forEach(c => unmount(c));
      } else if (typeof n1.children === "string") {
        // 旧子节点是文本子节点，则清空容器
        setElementText(container, "");
      }
      // 如果旧子节点不存在，则什么都不需要做
    }
  }

  function shouldSetAsProps(el, key, value) {
    // 特殊处理
    if (key === 'form' && el.tagName === 'INPUT') {
      // input 的 form 属性是只读的，不能通过 el.form = value 的方式来设置其值
      // 只能通过 el.setAttribute('form', value) 的方式来设置其值
      return false;
    }

    // 以及其他特殊的情况...

    return key in el;
  }

  /**
   * 挂载元素
   *
   * @param {Object} vnode 虚拟节点
   * @param {HTMLElement} container 容器
   */
  function mountElement(vnode, container, anchor) {
    // 创建 DOM 元素节点
    // 并且让 vnode.el 引用真实 DOM 元素，以便后续更新和卸载时能直接获取到对应的真实 DOM 元素
    const el = (vnode.el = createElement(vnode.type));
    // 处理子节点，如果 vnode 的子节点是字符串，代表元素具有文本节点
    if (typeof vnode.children === "string") {
      // 因此只需要设置元素的 textContent 属性即可
      setElementText(el, vnode.children);
    } else if (Array.isArray(vnode.children)) {
      // 如果 vnode 的子节点是数组，则遍历数组，调用 patch 函数挂载它们
      vnode.children.forEach(child => {
        // 因为是挂载阶段，没有旧 vnode，所以第一个参数传 null
        patch(null, child, el);
      });
    }

    // 处理属性
    if (vnode.props) {
      for (const key in vnode.props) {
        // 判断 key 是否存在对应的 DOM Properties
        patchProps(el, key, null, vnode.props[key]);
      }
    }

    // 将元素添加到容器中
    insert(el, container, anchor);
  }

  function mountText(vnode, container) {
    const el = (vnode.el = createText(vnode.children));
    insert(el, container);
  }

  /**
   * 卸载元素
   * 
   * @param {Object} vnode 虚拟节点
   */
  function unmount(vnode) {
    // 如果卸载的 vnode 类型为 Fragment，则需要卸载其 children
    if (vnode.type === Fragment) {
      vnode.children.forEach(c => unmount(c));
      return;
    }

    const parent = vnode.el.parentNode;
    if (parent) {
      parent.removeChild(vnode.el);
    }
  }

  function hydrate(vnode, container) {
    //
  }

  return {
    render,
    hydrate
  };
}
```

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

```js
const renderer = createRenderer({
  // 创建元素
  createElement(tag) {
    return document.createElement(tag);
  },
  // 设置元素的文本内容
  setElementText(el, text) {
    el.textContent = text;
  },
  // 在给定的 parent 元素下添加一个子元素
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor);
  },
})

function createRenderer(options) {
  const {
    createElement,
    setElementText,
    insert,
  } = options;

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

  function patch(n1, n2, container) {
    // 如果 n1 不存在，说明是挂载操作，则调用 mountElement 函数完成挂载
    if (!n1) {
      mountElement(n2, container);
    } else {
      // 
    }
  }

  /**
   * 挂载元素
   * 
   * @param {Object} vnode 虚拟节点
   * @param {HTMLElement} container 容器
   */
  function mountElement(vnode, container) {
    // 创建 DOM 元素节点
    const el = createElement(vnode.type);
    // 处理子节点，如果 vnode 的子节点是字符串，代表元素具有文本节点
    if (typeof vnode.children === "string") {
      // 因此只需要设置元素的 textContent 属性即可
      setElementText(el, vnode.children);
    }

    // 将元素添加到容器中
    insert(el, container);
  }

  function unmount(vnode) {
    
  }

  function hydrate(vnode, container) {
    //
  }

  return {
    render,
    hydrate
  }
}
```
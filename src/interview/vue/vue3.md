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
10. 我们把由父组件自更新所引起的子组件更新叫作子组件的被动更新
11. 组件模板中的插槽内容会被编译为插槽函数，而插槽函数的返回值就是具体的插槽内容
12. 通过 v-on 指令为组件绑定的事件在经过编译后，会以 onXxx 的形式存储到props 对象中

::: code-group

```js [简单 Diff 算法]

/**
 * Diff 发生在更新子节点时（对一个元素打补丁的最后一步操作）
 * 
 * 简单 Diff 算法的核心逻辑是，拿新的一组子节点中的节点去旧的一组子节点中寻找可复用的节点。
 * 如果找到了，则记录该节点的位置索引。我们把这个位置索引称为最大索引。在整个更新过程中，如
 * 果一个节点的索引值小于最大索引，则说明该节点对应的真实 DOM 元素需要移动
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
```

```js [双端 Diff 算法]
/**
 * 双端 Diff 算法
 */
function patchKeyedChildren(n1, n2, container) {
  const oldChildren = n1.children;
  const newChildren = n2.children;

  // oldChildren 和 newChildren 的头尾双指针
  let oldStartIdx = 0;
  let oldEndIdx = oldChildren.length - 1;
  let newStartIdx = 0;
  let newEndIdx = newChildren.length - 1;
  // 四个索引指向的 vnode 节点
  let oldStartVNode = oldChildren[oldStartIdx];
  let oldEndVNode = oldChildren[oldEndIdx];
  let newStartVNode = newChildren[newStartIdx];
  let newEndVNode = newChildren[newEndIdx];

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    // 增加两个判断分支，如果头尾部节点为 undefined，则说明该节点已经被处理过了，直接跳到下一个位置即可
    if (!oldStartVNode) {
      oldStartVNode = oldChildren[++oldStartIdx];
    } else if (!oldEndVNode) {
      oldEndVNode = oldChildren[--oldEndIdx];
    } else if (oldStartVNode.key === newStartVNode.key) {
      // 头头比较
      patch(oldStartVNode, newStartVNode, container);
      // 无需移动 DOM 操作，更新索引值，并指向下一个位置
      oldStartVNode = oldChildren[++oldStartIdx];
      newStartVNode = newChildren[++newStartIdx];
    } else if (oldEndVNode.key === newEndVNode.key) {
      // 尾尾比较
      patch(oldEndVNode, newEndVNode, container);
      // 无需移动 DOM 操作，更新索引值，并指向下一个位置
      oldEndVNode = oldChildren[--oldEndIdx];
      newEndVNode = newChildren[--newEndIdx];
    } else if (oldStartVNode.key === newEndVNode.key) {
      // 头尾比较
      patch(oldStartVNode, newEndVNode, container);
      // 移动 DOM 操作
      // oldStartVNode.el 移动到 oldEndVNode.el 后面
      insert(oldStartVNode.el, container, oldEndVNode.el.nextSibling);
      // 移动 DOM 完成后，更新索引值，并指向下一个位置
      oldStartVNode = oldChildren[++oldStartIdx];
      newEndVNode = newChildren[--newEndIdx];
    } else if (oldEndVNode.key === newStartVNode.key) {
      // 尾头比较
      // 仍然需要调用 patch 函数进行打补丁
      patch(oldStartVNode, newStartVNode, container);
      // 移动 DOM 操作
      // oldEndVNode.el 移动到 oldStartVNode.el 前面
      insert(oldEndVNode.el, container, oldStartVNode.el);
      // 移动 DOM 完成后，更新索引值，并指向下一个位置
      oldEndVNode = oldChildren[--oldEndIdx];
      newStartVNode = newChildren[++newStartIdx];
    } else {
      // 代码运行到这里，说明头头、尾尾、头尾、尾头比较都不通过，那么需要尝试看看非头部、非尾部的节点能否复用
      // 拿新的一组子节点中的头部节点，遍历旧子节点，试图找到与 newStartVNode 拥有相同 key 值的节点
      const idxInOld = oldChildren.findIndex(oldVNode => oldVNode.key === newStartVNode.key);
      // idxInOld > 0 说明找到了可复用的节点，并且需要将其对应的真实 DOM 移动到头部 oldStartVNode.el 前面
      if (idxInOld > 0) {
        // idxInOld 位置对应的 vnode 就是需要移动的节点
        const vnodeToMove = oldChildren[idxInOld];
        // 调用 patch 函数，让 vnodeToMove 和 newStartVNode 进行打补丁
        patch(vnodeToMove, newStartVNode, container);
        // 移动 DOM 操作
        // vnodeToMove.el 移动到 oldStartVNode.el 前面
        // 因此使用后者作为锚点
        insert(vnodeToMove.el, container, oldStartVNode.el);
        // 由于位置 idxInOld 处的节点已经移动到了其他位置，因此将其设置为 undefined，防止后续的循环中重复操作
        oldChildren[idxInOld] = undefined;
      } else {
        // 不可能存在 idxInOld === 0 的情况，因为 oldStartVNode 和 newStartVNode 已经处理过了
        // 如果 idxInOld < 0，说明新子节点中头部节点在旧子节点中找不到相同的 key 值，那么直接挂载新子节点到头部 oldStartVNode.el 前面
        patch(null, newStartVNode, container, oldStartVNode.el);
      }
      // 最后更新 newStartIdx 到下一个位置
      newStartVNode = newChildren[++newStartIdx];
    }
  }

  // 循环结束后检查索引的情况
  if (oldEndIdx < oldStartIdx && newStartIdx <= newEndIdx) {
    // 旧子节点已经遍历完了，新子节点还有剩余，说明这部分新子节点需要挂载
    // 拿剩余的新子节点，调用 patch 函数挂载到容器中
    // 注意，这里需要用到 oldStartVNode.el 作为锚点
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      patch(null, newChildren[i], container, oldStartVNode.el);
    }
  } else if (newEndIdx < newStartIdx && oldStartIdx <= oldEndIdx) {
    // 新子节点已经遍历完了，旧子节点还有剩余，说明这部分旧子节点需要卸载
    // 拿剩余的旧子节点，调用 unmount 函数卸载
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      // 可能存在旧子节点已经被移动的情况，因此需要跳过 undefined
      const oldVNode = oldChildren[i];
      if (oldVNode) {
        unmount(oldVNode);
      }
    }
  }
}
```

```js [快速 Diff 算法]
/**
 * 快速 Diff 算法
 */
function patchKeyedChildren(n1, n2, container) {
  const oldChildren = n1.children;
  const newChildren = n2.children;

  // 处理相同的前置节点
  // 索引 j 指向新旧两组子节点的开头
  let j = 0;
  let oldVNode = oldChildren[j];
  let newVNode = newChildren[j];
  // while 循环向后移动 j，直到遇到拥有不同 key 值的节点为止
  while (oldVNode.key === newVNode.key) {
    // 调用 patch 函数更新节点
    patch(oldVNode, newVNode, container);
    j++;
    oldVNode = oldChildren[j];
    newVNode = newChildren[j];
  }

  // 处理相同的后置节点
  // 索引 oldEnd 指向旧子节点的最后一个节点索引
  let oldEnd = oldChildren.length - 1;
  // 索引 newEnd 指向新子节点的最后一个节点索引
  let newEnd = newChildren.length - 1;
  oldVNode = oldChildren[oldEnd];
  newVNode = newChildren[newEnd];
  // while 循环向前移动 oldEnd 和 newEnd，直到遇到拥有不同 key 值的节点为止
  while (oldVNode.key === newVNode.key) {
    // 调用 patch 函数更新节点
    patch(oldVNode, newVNode, container);
    oldEnd--;
    newEnd--;
    oldVNode = oldChildren[oldEnd];
    newVNode = newChildren[newEnd];
  }

  // 预处理完毕后，如果满足如下条件，则说明从 j -> newEnd 之间的节点应作为新节点插入
  if (j > oldEnd && j <= newEnd) {
    // 锚点的索引
    const anchorIndex = newEnd + 1;
    const anchor = anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null;
    // 采用 while 循环，从 j -> newEnd 依次插入节点
    while (j <= newEnd) {
      patch(null, newChildren[j++], container, anchor);
    }
  } else if (j > newEnd && j <= oldEnd) {
    // j -> oldEnd 之间的节点应该被卸载
    while (j <= oldEnd) {
      unmount(oldChildren[j++]);
    }
  } else {
    // 构造 source 数组
    // source 数组将用来存储新的一组子节点中的节点在旧的一组子节点中的位置索引
    // 后面将使用它计算出一个最长递增子序列，并用于辅助完成 DOM 的移动操作
    // 新的一组子节点中剩余未处理节点的数量
    const count = newEnd - j + 1;
    const source = new Array(count).fill(-1);

    // 填充 source 数组
    // oldStart 和 newStart 分别为起始索引，即 j
    const oldStart = j;
    const newStart = j;
    // 新增两个变量，moved 和 pos
    let moved = false;
    let pos = 0;

    // 构建索引表
    const keyIndex = {};
    for (let i = newStart; i <= newEnd; i++) {
      keyIndex[newChildren[i].key] = i;
    }
    // 新增 patched 变量，代表更新过的节点数量
    let patched = 0;
    for (let i = oldStart; i <= oldEnd; i++) {
      oldVNode = oldChildren[i];
      // 如果更新过的节点数量小于新的一组子节点的节点数量，则执行更新
      if (patched <= count) {
        // 通过索引表快速找到新的一组子节点中具有相同 key 值的节点在新的一组子节点中的索引
        const k = keyIndex[oldVNode.key];
        if (typeof k !== "undefined") {
          newVNode = newChildren[k];
          // 调用 patch 函数更新节点
          patch(oldVNode, newVNode, container);
          // 将 source 数组中，新子节点的索引设置为旧子节点的索引
          source[k - newStart] = i;
          // 判断节点是否需要移动
          if (k < pos) {
            moved = true;
          } else {
            pos = k;
          }
        } else {
          // 如果没有找到相同的 key 值，则说明 oldVNode 需要被卸载
          unmount(oldVNode);
        }
      } else {
        // 如果更新过的节点数量大于需要更新的节点数量，则卸载多余的旧节点
        unmount(oldVNode);
      }
    }

    if (moved) {
      // 如果 moved 为 true，则需要进行 DOM 移动操作
      // 计算最长递增子序列
      // seq 是一个索引数组，存储的是新的一组子节点中不需要移动的节点的索引
      const seq = lis(source);

      // s 指向最长递增子序列的最后一个元素
      let s = seq.length - 1;
      // i 指向新的一组子节点的最后一个元素
      let i = count - 1;
      for (i; i >= 0; i--) {
        if (source[i] === -1) {
          // 如果 source[i] 为 -1，说明该位置的节点是新节点，应该将其挂载
          // 该节点在新 children 中的真实索引为 i + newStart
          const pos = i + newStart;
          const newVNode = newChildren[pos];
          // 该节点的下一个节点的位置索引
          const nextPos = pos + 1;
          // 锚点为新节点的下一个节点，如果新节点的下一个节点不存在，则锚点为 null
          const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null;
          // 挂载新节点
          patch(null, newVNode, container, anchor);
        } else if (i !== seq[s]) {
          // 如果索引 i 不等于 seq[s] 的值，则说明该节点需要移动
          // 该节点在新的一组子节点中的真实索引为 i + newStart
          const pos = i + newStart;
          const newVNode = newChildren[pos];
          // 该节点的下一个节点的位置索引
          const nextPos = pos + 1;
          // 锚点为新节点的下一个节点，如果新节点的下一个节点不存在，则锚点为 null
          const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null;
          // 移动新节点
          // 移动节点的实现思路类似于挂载全新的节点，不同点在于移动节点是通过 insert 函数来完成的
          insert(newVNode.el, container, anchor);
        } else {
          // 如果索引 i 等于 seq[s] 的值，则说明该节点不需要移动
          // 只需要让 s 指向下一个位置
          s--;
        }
      }
    }
  }
}

/**
 * 求最长递增子序列
 */
function lis(arr) {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      while (u < v) {
        c = ((u + v) / 2) | 0
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}
```

```js [渲染器]
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
      if (!n1) {
        // 如果 n1 不存在，说明是挂载操作，则调用 mountComponent 函数完成挂载
        mountComponent(n2, container, anchor);
      } else {
        // 如果 n1 存在，说明是更新操作，则调用 patchComponent 函数完成打补丁
        patchComponent(n1, n2, anchor);
      }
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
      // 封装 patchChildren 函数处理两组子节点
      patchKeyedChildren(n1, n2, container);
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

  /**
   * 快速 Diff 算法
   */
  function patchKeyedChildren(n1, n2, container) {
    const oldChildren = n1.children;
    const newChildren = n2.children;

    // 处理相同的前置节点
    // 索引 j 指向新旧两组子节点的开头
    let j = 0;
    let oldVNode = oldChildren[j];
    let newVNode = newChildren[j];
    // while 循环向后移动 j，直到遇到拥有不同 key 值的节点为止
    while (oldVNode.key === newVNode.key) {
      // 调用 patch 函数更新节点
      patch(oldVNode, newVNode, container);
      j++;
      oldVNode = oldChildren[j];
      newVNode = newChildren[j];
    }

    // 处理相同的后置节点
    // 索引 oldEnd 指向旧子节点的最后一个节点索引
    let oldEnd = oldChildren.length - 1;
    // 索引 newEnd 指向新子节点的最后一个节点索引
    let newEnd = newChildren.length - 1;
    oldVNode = oldChildren[oldEnd];
    newVNode = newChildren[newEnd];
    // while 循环向前移动 oldEnd 和 newEnd，直到遇到拥有不同 key 值的节点为止
    while (oldVNode.key === newVNode.key) {
      // 调用 patch 函数更新节点
      patch(oldVNode, newVNode, container);
      oldEnd--;
      newEnd--;
      oldVNode = oldChildren[oldEnd];
      newVNode = newChildren[newEnd];
    }

    // 预处理完毕后，如果满足如下条件，则说明从 j -> newEnd 之间的节点应作为新节点插入
    if (j > oldEnd && j <= newEnd) {
      // 锚点的索引
      const anchorIndex = newEnd + 1;
      const anchor = anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null;
      // 采用 while 循环，从 j -> newEnd 依次插入节点
      while (j <= newEnd) {
        patch(null, newChildren[j++], container, anchor);
      }
    } else if (j > newEnd && j <= oldEnd) {
      // j -> oldEnd 之间的节点应该被卸载
      while (j <= oldEnd) {
        unmount(oldChildren[j++]);
      }
    } else {
      // 构造 source 数组
      // source 数组将用来存储新的一组子节点中的节点在旧的一组子节点中的位置索引
      // 后面将使用它计算出一个最长递增子序列，并用于辅助完成 DOM 的移动操作
      // 新的一组子节点中剩余未处理节点的数量
      const count = newEnd - j + 1;
      const source = new Array(count).fill(-1);

      // 填充 source 数组
      // oldStart 和 newStart 分别为起始索引，即 j
      const oldStart = j;
      const newStart = j;
      // 新增两个变量，moved 和 pos
      let moved = false;
      let pos = 0;

      // 构建索引表
      const keyIndex = {};
      for (let i = newStart; i <= newEnd; i++) {
        keyIndex[newChildren[i].key] = i;
      }
      // 新增 patched 变量，代表更新过的节点数量
      let patched = 0;
      for (let i = oldStart; i <= oldEnd; i++) {
        oldVNode = oldChildren[i];
        // 如果更新过的节点数量小于新的一组子节点的节点数量，则执行更新
        if (patched <= count) {
          // 通过索引表快速找到新的一组子节点中具有相同 key 值的节点在新的一组子节点中的索引
          const k = keyIndex[oldVNode.key];
          if (typeof k !== "undefined") {
            newVNode = newChildren[k];
            // 调用 patch 函数更新节点
            patch(oldVNode, newVNode, container);
            // 将 source 数组中，新子节点的索引设置为旧子节点的索引
            source[k - newStart] = i;
            // 判断节点是否需要移动
            if (k < pos) {
              moved = true;
            } else {
              pos = k;
            }
          } else {
            // 如果没有找到相同的 key 值，则说明 oldVNode 需要被卸载
            unmount(oldVNode);
          }
        } else {
          // 如果更新过的节点数量大于需要更新的节点数量，则卸载多余的旧节点
          unmount(oldVNode);
        }
      }

      if (moved) {
        // 如果 moved 为 true，则需要进行 DOM 移动操作
        // 计算最长递增子序列
        // seq 是一个索引数组，存储的是新的一组子节点中不需要移动的节点的索引
        const seq = lis(source);

        // s 指向最长递增子序列的最后一个元素
        let s = seq.length - 1;
        // i 指向新的一组子节点的最后一个元素
        let i = count - 1;
        for (i; i >= 0; i--) {
          if (source[i] === -1) {
            // 如果 source[i] 为 -1，说明该位置的节点是新节点，应该将其挂载
            // 该节点在新 children 中的真实索引为 i + newStart
            const pos = i + newStart;
            const newVNode = newChildren[pos];
            // 该节点的下一个节点的位置索引
            const nextPos = pos + 1;
            // 锚点为新节点的下一个节点，如果新节点的下一个节点不存在，则锚点为 null
            const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null;
            // 挂载新节点
            patch(null, newVNode, container, anchor);
          } else if (i !== seq[s]) {
            // 如果索引 i 不等于 seq[s] 的值，则说明该节点需要移动
            // 该节点在新的一组子节点中的真实索引为 i + newStart
            const pos = i + newStart;
            const newVNode = newChildren[pos];
            // 该节点的下一个节点的位置索引
            const nextPos = pos + 1;
            // 锚点为新节点的下一个节点，如果新节点的下一个节点不存在，则锚点为 null
            const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null;
            // 移动新节点
            // 移动节点的实现思路类似于挂载全新的节点，不同点在于移动节点是通过 insert 函数来完成的
            insert(newVNode.el, container, anchor);
          } else {
            // 如果索引 i 等于 seq[s] 的值，则说明该节点不需要移动
            // 只需要让 s 指向下一个位置
            s--;
          }
        }
      }
    }
  }

  /**
   * 求最长递增子序列
   */
  function lis(arr) {
    const p = arr.slice()
    const result = [0]
    let i, j, u, v, c
    const len = arr.length
    for (i = 0; i < len; i++) {
      const arrI = arr[i]
      if (arrI !== 0) {
        j = result[result.length - 1]
        if (arr[j] < arrI) {
          p[i] = j
          result.push(i)
          continue
        }
        u = 0
        v = result.length - 1
        while (u < v) {
          c = ((u + v) / 2) | 0
          if (arr[result[c]] < arrI) {
            u = c + 1
          } else {
            v = c
          }
        }
        if (arrI < arr[result[u]]) {
          if (u > 0) {
            p[i] = result[u - 1]
          }
          result[u] = i
        }
      }
    }
    u = result.length
    v = result[u - 1]
    while (u-- > 0) {
      result[u] = v
      v = p[v]
    }
    return result
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
   * 挂载组件
   */
  function mountComponent(vnode, container, anchor) {
    // 通过 vnode.type 获取组件的配置对象
    const componentOptions = vnode.type;
    // 获取组件渲染函数
    const {
      render, data, props: propsOption, setup, beforeCreate, created, beforeMount, mounted, beforeUpdate, updated
    } = componentOptions;

    // 在这里调用 beforeCreate 钩子函数
    beforeCreate && beforeCreate();

    const state = data ? reactive(data()) : null;
    const [props, attrs] = resolveProps(propsOption, vnode.props);

    // 使用编译好的 vnode.children 作为 slots
    const slots = vnode.children;

    // 定义组件实例
    const instance = {
      state,
      props: shallowReactive(props),
      isMounted: false,
      subTree: null,
      // 在组件实例中添加 mounted 数组，用来存储通过 onMounted 注册的生命周期钩子函数
      mounted: [],
    }

    function emit(event, ...payload) {
      const eventName = `on${event[0].toUpperCase() + event.slice(1)}`;
      const handler = instance.props[eventName];
      if (handler) {
        handler(...payload);
      } else {
        console.warn(`event ${event} not found`);
      }
    }

    const setupContext = { attrs, emit, slots };

    // 在调用 setup 之前，设置当前组件实例
    setCurrentInstance(instance);

    const setupResult = setup && setup(shallowReactive(props), setupContext);

    // setup 执行完毕后，重置当前组件实例
    setCurrentInstance(null);

    let setupState = null;
    if (typeof setupResult === 'function') {
      if (render) {
        console.error('setup 函数返回渲染函数，render 选项将被忽略');
      }
      render = setupResult;
    } else {
      setupState = setupResult;
    }

    // 将组件实例存储到 vnode 的 component 属性上，方便后续更新组件时使用
    vnode.component = instance;

    const renderContext = new Proxy(instance, {
      get(target, key, receiver) {
        const { state, props } = target;
        
        if (key === '$slots') return slots;

        if (state && key in state) {
          return state[key];
        } else if (props && key in props) {
          return props[key];
        } else if (setupState && key in setupState) {
          return setupState[key];
        } else {
          console.warn(`property ${key} not found`);
        }
      },

      set(target, key, value, receiver) {
        const { state, props } = target;
        if (state && key in state) {
          state[key] = value;
        } else if (props && key in props) {
          console.warn(`attempting to set readonly property ${key}. Props are readonly.`);
        } else if (setupState && key in setupState) {
          setupState[key] = value;
        } else {
          console.warn(`property ${key} not found`);
        }
      }
    })

    // 在这里调用 created 钩子函数
    created && created.call(renderContext);

    // 将组件的渲染任务包装到 effect 函数中，这样当 state 变化时，
    // effect 函数会重新执行，实现组件的自更新
    effect(() => {
      // 执行渲染函数，获取组件要渲染的内容，即 render 函数返回虚拟 DOM
      const subTree = render.call(renderContext, renderContext);
      if (!instance.isMounted) {
        // 在这里调用 beforeMount 钩子函数
        beforeMount && beforeMount.call(renderContext);

        // 如果组件实例没有被挂载，则调用 patch 函数挂载组件要渲染的内容
        // 调用 patch 函数挂载组件要渲染的内容
        patch(null, subTree, container, anchor);
        instance.isMounted = true;

        // 在这里调用 mounted 钩子函数
        mounted && mounted.call(renderContext);

        // 在合适的时机，调用 onMounted 中注册的钩子函数
        // 其他生命周期钩子函数同理
        instance.mounted && instance.mounted.forEach(hook => hook.call(renderContext));
      } else {
        // 在这里调用 beforeUpdate 钩子函数
        beforeUpdate && beforeUpdate.call(renderContext);

        // 如果组件实例已经被挂载，则调用 patch 函数更新组件要渲染的内容
        patch(instance.subTree, subTree, container, anchor);

        // 在这里调用 updated 钩子函数
        updated && updated.call(renderContext);
      }
      // 将 subTree 存储到组件实例中，作为下一次更新的旧 subTree
      instance.subTree = subTree;
    }, {
      scheduler: queueJob
    })
  }

  /**
   * 一旦组件自身的响应式数据发生变化，组件就会自动重新执行渲染函数，从而完成更新。但是，
   * 由于 effect 的执行是同步的，因此当响应式数据发生变化时，与之关联的副作用函数会同步
   * 执行。换句话说，如果多次修改响应式数据的值，将会导致渲染函数执行多次，这实际上是没有
   * 必要的。因此，我们需要设计一个机制，以使得无论对响应式数据进行多少次修改，副作用函数
   * 都只会重新执行一次。为此，我们需要实现一个调度器，当副作用函数需要重新执行时，我们不
   * 会立即执行它，而是将它缓冲到一个微任务队列中，等到执行栈清空后，再将它从微任务队列中
   * 取出并执行。有了缓存机制，我们就有机会对任务进行去重，从而避免多次执行副作用函数带来的性能开销。
   */
  const queue = new Set(); // 任务缓存队列，可以对任务自动去重
  let isFlushing = false; // 是否正在执行任务
  const p = Promise.resolve(); // 创建一个立即 resolve 的 Promise 实例，用于将任务放到微任务队列中
  // 调度器的主要函数，用来将一个任务放到缓存队列中，并开始刷新队列
  function queueJob(job) {
    queue.add(job);
    if (!isFlushing) {
      isFlushing = true;
      p.then(() => {
        try {
          queue.forEach(job => job());
        } finally {
          isFlushing = false;
          queue.clear = 0;
        }
      })
    }
  }

  function resolveProps(options, propsData) {
    const props = {};
    const attrs = {};
    for (const key in propsData) {
      if (key in options || key.startsWith("on")) {
        props[key] = propsData[key];
      } else {
        attrs[key] = propsData[key];
      }
    }
    return [props, attrs];
  }

  /**
   * 更新组件
   */
  function patchComponent(n1, n2, container) {
    const instance = (n2.component = n1.component);
    const { props } = instance;
    // 如果 props 发生变化，则更新组件实例的 props
    if (hasPropsChanged(n1.props, n2.props)) {
      const [nextProps] = resolveProps(n2.type.props, n2.props);

      // 更新 props
      for (const key in nextProps) {
        props[key] = nextProps[key];
      }

      // 删除不存在的 props
      for (const key in props) {
        if (!(key in nextProps)) {
          delete props[key];
        }
      }
    }
  }

  function hasPropsChanged(prevProps, nextProps) {
    const nextKeys = Object.keys(nextProps);
    // 如果新旧 props 的数量不同，则说明发生了变化
    if (nextKeys.length !== Object.keys(prevProps).length) {
      return true;
    }

    for (let i = 0; i < nextKeys.length; i++) {
      const key = nextKeys[i];
      // 有不相等的 props，说明有变化
      if (nextProps[key] !== prevProps[key]) return true;
    }

    return false;
  }

  let currentInstance = null;
  function setCurrentInstance(instance) {
    currentInstance = instance;
  }

  /**
   * 应该是全局的，暂时先放在这里
   */
  function onMounted(fn) {
    if (currentInstance) {
      currentInstance.mounted.push(fn);
    } else {
      console.warn("onMounted must be called at the setup function");
    }
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

:::


### 组件化

1. 在异步组件中，​“异步”二字指的是，以异步的方式加载并渲染一个组件
2. 函数式组件允许使用一个普通函数定义组件，并使用该函数的返回值作为组件要渲染的内容。函数式组件的特点是：无状态、编写简单且直观。在 Vue.js 2 中，相比有状态组件来说，函数式组件具有明显的性能优势。但在 Vue.js 3 中，函数式组件与有状态组件的性能差距不大，都非常好。正如 Vue.js RFC 的原文所述：​“在 Vue.js 3 中使用函数式组件，主要是因为它的简单性，而不是因为它的性能好。​”
3. 为了替用户更好地解决上述问题，我们需要在框架层面为异步组件提供更好的封装支持，与之对应的能力如下。
  - 允许用户指定加载出错时要渲染的组件。
  - 允许用户指定 Loading 组件，以及展示该组件的延迟时间。
  - 允许用户设置加载组件的超时时长。
  - 组件加载失败时，为用户提供重试的能力。

  以上这些内容就是异步组件真正要解决的问题。

#### 封装 defineAsyncComponent 函数

```js
/**
 * 异步组件
 * @param {Function | Object} options 异步加载函数或配置对象
 */
function defineAsyncComponent(options) {
  // options 可以是加载器，也可以是配置对象
  // 参数归一化
  if (typeof options === 'function') {
    options = {
      loader: options
    }
  }

  const { loader } = options;

  // 一个变量，用来存储异步加载的组件
  let InnerComp = null;

  // 返回一个包装组件
  return {
    name: 'AsyncComponentWrapper',
    setup() {
      // 异步组件是否加载成功
      const loaded = ref(false);
      const error = shallowRef(null);

      // 执行加载器函数，返回一个 Promise 实例
      // 加载成功后，将加载成功的组件赋值给 InnerComp，并将 loaded 标记为 true，代表加载成功
      loader()
        .then(c => {
          InnerComp = c
          loaded.value = true
        }).catch(err => {
          error.value = err
        })

      let timer = null;
      if (options.timeout) {
        timer = setTimeout(() => {
          const err = new Error(`[defineAsyncComponent] timeout when loading component: ${options.loader}`);
          error.value = err;
        }, options.timeout);
      }

      onUnmounted(() => {
        clearTimeout(timer);
      })

      const placeholder = { type: Text, children: '' }

      return () => {
        // 如果异步组件加载成功，则渲染该组件，否则渲染一个占位内容
        if (loaded.value) {
          return { type: InnerComp }
        } else if (error.value && options.errorComponent) {
          return { type: options.errorComponent, props: { error: error.value } }
        } else {
          return placeholder;
        }
      }
    }
  }
}
```

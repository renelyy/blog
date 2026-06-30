# Vue 响应式 mini 实现

[← 返回索引](../index.md)

> vuecore / 手写 kvue / vue3 练习代码

---

## vuecore/reactivity.js

> 来源：`profile/vuecore/reactivity.js`

```javascript
/**
 * @description vue reactivity
 */

// 存储副作用函数的桶
const bucket = new WeakMap();

const data = { ok: false, text: 'hello vue3' };
let activeEffect;
const effectStack = [];

/**
 * @description 注册副作用函数
 */
function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    // 在调用副作用函数之前将当前副作用函数压入栈中
    effectStack.push(effectFn);
    // 执行副作用函数 -> 收集依赖
    const res = fn();
    // 当前副作用函数执行完毕后，将当前副作用函数弹出栈
    // 并把 activeEffect 还原为之前的值
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
    return res;
  };

  effectFn.options = options;
  effectFn.deps = [];

  if (!options.lazy) {
    effectFn();
  }

  return effectFn;
}

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    deps.delete(effectFn);
  }

  effectFn.deps.length = 0;
}

const obj = new Proxy(data, {
  get(target, key) {
    track(target, key);
    return target[key];
  },
  set(target, key, newVal) {
    if (target[key] === newVal) return;
    target[key] = newVal;
    trigger(target, key);
  }
});

function track(target, key) {
  if (!activeEffect) return target[key];
  let depsMap = bucket.get(target);

  if (!depsMap) bucket.set(target, (depsMap = new Map()));
  let deps = depsMap.get(key);

  if (!deps) depsMap.set(key, (deps = new Set()));
  deps.add(activeEffect);

  activeEffect.deps.push(deps);
}

function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;

  const effects = depsMap.get(key);
  // const effectsToRun = new Set(effects);
  const effectsToRun = new Set();
  effects &&
    effects.forEach(effectFn => {
      // 避免无限递归调用，从而避免栈溢出
      if (effectFn !== activeEffect) {
        effectsToRun.add(effectFn);
      }
    });

  effectsToRun.forEach(effectFn => {
    if (effectFn.options.scheduler) {
      // 如果一个副作用函数存在调度器，则调用该调度器，并将副作用函数作为参数传递
      effectFn.options.scheduler(effectFn);
    } else {
      // 否则直接执行副作用函数（之前的默认行为）
      effectFn();
    }
  });
}

// effect(() => {
//   console.log('effect run ...');
//   console.log(obj.ok ? obj.text : 'not');
// });

// setTimeout(() => {
//   obj.ok = true;
// }, 2000);

// setTimeout(() => {
//   obj.text = 'renel' + Math.floor(Math.random() * 10);
// }, 3000);

// 实现 computed
function computed(getter) {
  let value;
  let dirty = true;

  // 把 getter 作为副作用函数，创建一个 lazy 的 effect
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = true;
      // 当计算属性依赖的响应式数据变化时，手动调用 trigger 函数触发响应
      trigger(obj, 'value');
    }
  });

  const obj = {
    // 当读取 value 时才执行 effectFn
    get value() {
      console.log('get value ', dirty);
      if (dirty) {
        value = effectFn();
        dirty = false;
      }
      // 当读取 value 时，手动调用 track 函数进行追踪
      track(obj, 'value');
      return value;
    }
  };

  return obj;
}

const testComputedData = { foo: 1, bar: 2 };
const obj2 = new Proxy(testComputedData, {
  get(target, key) {
    track(target, key);
    return target[key];
  },
  set(target, key, newVal) {
    if (target[key] === newVal) return;
    target[key] = newVal;
    trigger(target, key);
  }
});

const sum = computed(() => obj2.foo + obj2.bar);
obj2.foo = 9;
// effect(() => {
//   console.log(sum.value);
// });
// console.log(sum.value)

function watch(source, cb) {
  let getter;
  if (typeof source === 'function') {
    getter = source;
  } else {
    getter = () => traverse(source);
  }

  let oldValue, newValue;
  const effectFn = effect(() => getter(), {
    lazy: true,
    scheduler() {
      newValue = effectFn();
      cb(newValue, oldValue);
      oldValue = newValue;
    }
  });
  oldValue = effectFn();
}

function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || value === null || seen.has(value)) return;

  seen.add(value);

  // 暂时不考虑数组等其他结构
  // 假设 value 就是一个对象，使用 for...in 读取对象的每个值，并递归地调用 traverse 进行处理
  for (const k in value) {
    traverse(value[k], seen);
  }

  return value;
}
```

---

## 2025/01-out/vue3/reactivity.js

> 来源：`profile/2025/01-out/vue3/reactivity.js`

```javascript
let activeEffect;
const effectStack = [];
const ITERATER_KEY = Symbol();
const MAP_KEY_ITERATER_KEY = Symbol('key');
const TriggerType = {
  SET: 'SET',
  ADD: 'ADD',
  DELETE: 'DELETE'
};
const reactiveMap = new Map();

const targetMap = new WeakMap();

function track(target, key) {
  // 当前禁止追踪，直接返回
  if (!activeEffect || !shouldTrack) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

function trigger(target, key, type, newValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  // 取得与 key 相关的副作用函数
  const effects = depsMap.get(key);

  const effectToRun = new Set();

  // 将与 key 相关联的副作用函数添加到 effectToRun 中
  effects && effects.forEach(effect => {
    if (effect !== activeEffect) {
      effectToRun.add(effect);
    }
  });

  // 如果是 ADD 或 DELETE 操作，还需要取得与 ITERATER_KEY 相关的副作用函数
  // 如果是 SET 操作，并且目标对象是 Map 类型，也需要取得与 ITERATER_KEY 相关的副作用函数
  if (
    type === TriggerType.ADD || 
    type === TriggerType.DELETE ||
    (type === TriggerType.SET && Object.prototype.toString.call(target) === '[object Map]')
  ) {
    // 取得与 ITERATER_KEY 相关的副作用函数
    const iterateEffects = depsMap.get(ITERATER_KEY);
    // 将与 ITERATER_KEY 相关联的副作用函数添加到 effectToRun 中
    iterateEffects && iterateEffects.forEach(effect => {
      if (effect !== activeEffect) {
        effectToRun.add(effect);
      }
    });
  }

  if (
    (type === TriggerType.ADD || type === TriggerType.DELETE) && 
    Object.prototype.toString.call(target) === '[object Map]'
  ) {
    // 取得与 MAP_KEY_ITERATER_KEY 相关的副作用函数
    const mapKeyIterateEffects = depsMap.get(MAP_KEY_ITERATER_KEY);
    // 将与 MAP_KEY_ITERATER_KEY 相关联的副作用函数添加到 effectToRun 中
    mapKeyIterateEffects && mapKeyIterateEffects.forEach(effect => {
      if (effect !== activeEffect) {
        effectToRun.add(effect);
      }
    });
  }

  // 当操作类型是 ADD 并且目标对象是数组时，还需要取得与 length 相关的副作用函数
  if (type === TriggerType.ADD && Array.isArray(target)) {
    // 取得与 length 相关的副作用函数
    const lengthEffects = depsMap.get('length');
    // 将与 length 相关联的副作用函数添加到 effectToRun 中
    lengthEffects && lengthEffects.forEach(effect => {
      if (effect !== activeEffect) {
        effectToRun.add(effect);
      }
    })
  }

  // 如果操作目标是数组，并且修改了数组的 length 属性
  if (Array.isArray(target) && key === 'length') {
    // 对于索引大于或等于新的 length 值的元素
    // 需要把所有相关联的副作用函数取出并添加到 effectsToRun 中
    // depsMap 的结构为 {0: Set, 1: Set, 2: Set, length: Set}
    // 表示谁依赖了 arr[i]
    depsMap.forEach((effects, key) => {
      // 这里的 newValue 是 length 属性的新值
      if (key >= newValue) {
        effects.forEach(effect => {
          if (effect !== activeEffect) {
            effectToRun.add(effect);
          }
        });
      }
    });
  }

  // 执行
  effectToRun.forEach(effect => {
    if (effect.options.scheduler) {
      effect.options.scheduler(effect);
    } else {
      effect();
    }
  });
}

export function effect(fn, options = {}) {
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
  effectFn.deps = [];
  if (!options.lazy) {
    effectFn();
  }
  return effectFn;
}

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    deps.delete(effectFn);
  }
  effectFn.deps.length = 0;
}

function computed(getter) {
  let value; // value 用来缓存上一次计算的值
  let dirty = true; // dirty 用来标识是否需要重新计算 true 表示 "脏"，需要重新计算

  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = false;
      trigger(obj, 'value');
    }
  });

  const obj = {
    get value() {
      if (dirty) {
        value = effectFn();
        dirty = false;
      }
      track(obj, 'value');
      return value;
    }
  };

  return obj;
}

function watch(source, cb) {
  let getter;
  if (typeof source === 'function') {
    getter = source;
  } else {
    getter = () => traverse(source);
  }
  let oldValue, newValue;

  let cleanup;
  const onInvalidate = fn => {
    cleanup = fn;
  };

  const job = () => {
    newValue = effectFn();
    if (cleanup) {
      cleanup();
    }
    cb(oldValue, newValue, onInvalidate);
    oldValue = newValue;
  };

  const effectFn = effect(
    // 触发读取操作，从而建立联系
    () => getter(),
    {
      lazy: true,
      scheduler: () => {
        if (options.flush === 'post') {
          // post
          const p = Promise.resolve();
          p.then(job);
        } else {
          // sync
          job();
        }
      }
    }
  );

  if (options.immediate) {
    job();
  } else {
    oldValue = effectFn();
  }
}

function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || value === null || seen.has(value)) return;
  seen.add(value);
  for (const key in value) {
    traverse(value[key], seen);
  }
  return value;
}

// 抽离为单独的函数，方便复用
function iterationMethod () {
  // 获取原始对象
  const target = this.raw;
  // 获取原始迭代方法
  const itr = target[Symbol.iterator]();
  const wrap = val => typeof val === 'object' ? reactive(val) : val;
  // 调用 track 建立响应联系
  track(target, ITERATER_KEY);
  // 返回自定义的迭代器
  return {
    // 迭代器协议
    next() {
      // 调用原始迭代器的 next 方法
      const { value, done } = itr.next();
      // 如果 value 不是 undefined，则对其进行包裹
      return { value: value ? [wrap(value[0]), wrap(value[1])] : value, done: done }
    },
    // 可迭代协议
    [Symbol.iterator]() {
      return this;
    }
  }
}

function valuesIterationMethod () {
  const target = this.raw;
  const itr = target.values();
  const wrap = val => typeof val === 'object' ? reactive(val) : val;
  track(target, ITERATER_KEY);
  return {
    next() {
      const { value, done } = itr.next();
      return { value: value ? wrap(value) : value, done: done }
    },
    [Symbol.iterator]() {
      return this;
    }
  }
}

function keysIterationMethod () {
  const target = this.raw;
  const itr = target.keys();
  const wrap = val => typeof val === 'object' ? reactive(val) : val;
  track(target, MAP_KEY_ITERATER_KEY);
  return {
    next() {
      const { value, done } = itr.next();
      return { value: value ? wrap(value) : value, done: done }
    },
    [Symbol.iterator]() {
      return this;
    }
  }
}

// Array 的自定义方法
const arrayInstrumentations = {};
// Object 的自定义方法 Set/Map 等
const mutableInstrumentations = {
  add(key) {
    // this 仍然指向代理对象
    const target = this.raw;
    // 通过原始对象执行 add 操作
    // 注意这里不再需要 .bind 了，因为是直接通过 target 调用并执行的
    const res = target.add(key);
    
    // 先判断值是否已经存在
    const hasKey = target.has(key);
    // 只有在值不存在的情况下，才需要触发响应
    if (!hasKey) {
      // 调用 trigger 函数触发响应，并指定操作类型为 ADD
      trigger(target, key, TriggerType.ADD);
    }
    return res;
  },
  delete(key) {
    const target = this.raw;
    const hasKey = target.has(key);
    const res = target.delete(key);
    // 只有在值存在的情况下，才需要触发响应，和 add 恰恰相反
    if (hasKey) {
      trigger(target, key, TriggerType.DELETE);
    }
    return res;
  },
  get(key) {
    // 获取原始对象
    const target = this.raw;
    // 判断读取的 key 是否存在
    const hasKey = target.has(key);
    // 追踪依赖，简历响应联系
    track(target, key);

    // 如果存在，则返回结果
    // 这里要注意，如果得到的结果 res 仍然是可代理的数据
    // 则要返回 reactive 包装后的响应式数据
    if (hasKey) {
      const res = target.get(key);
      return typeof res === 'object' ? reactive(res) : res;
    }
  },
  set(key, value) {
    const target = this.raw;
    const hadKey = target.has(key);
    // 获取旧值
    const oldValue = target.get(key);
    // 解决数据污染问题，将新值包装成响应式数据设置到了原始对象中
    // 所以这里判断如果要设置的值是响应式的，则要获取它的原始值
    const rawValue = value.raw || value;
    // 设置新值
    const res = target.set(key, rawValue);
    if (!hadKey) {
      // 如果不存在，则触发 ADD 操作
      trigger(target, key, TriggerType.ADD);
    } else if (oldValue !== value && (oldValue === oldValue || value === value)) {
      // 如果存在，并且值变了，则是 SET 操作，意味着修改
      trigger(target, key, TriggerType.SET);
    }
  },
  forEach(callback, thisArg) {
    // wrap 函数用来把可代理的值转换为响应式
    const wrap = val => typeof val === 'object' ? reactive(val) : val;

    const target = this.raw;
    track(target, ITERATER_KEY);
    // 通过原始对象执行 forEach 操作
    target.forEach((v, k) => {
      // 手动调用 callback，用 wrap 函数包裹 value 和 key 后再传给 callback
      // 这样就实现了深响应
      // 通过 .call 调用 callback，并指定 thisArg
      callback.call(thisArg, wrap(v), wrap(k), this);
    });
  },
  [Symbol.iterator]: iterationMethod,
  entries: iterationMethod,
  values: valuesIterationMethod,
  keys: keysIterationMethod,
};
;['includes', 'indexOf', 'lastIndexOf'].forEach(method => {
  const originMethod = Array.prototype[method];
  arrayInstrumentations[method] = function(...args) {
    // this 是代理对象，先在代理对象中查找，将结果存储到 res 中
    let res = originMethod.apply(this, args);
    // 如果找不到，再去原始数组中查找
    if (res === false) {
      res = originMethod.apply(this.raw, args);
    }
    // 返回最终结果
    return res;
  }
})
let shouldTrack = true;
;['push', 'pop', 'shift', 'unshift', 'splice'].forEach(method => {
  const originMethod = Array.prototype[method];
  arrayInstrumentations[method] = function(...args) {
    shouldTrack = false;
    let res = originMethod.apply(this, args);
    shouldTrack = true;
    return res;
  }
})

function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      // 处理 Set/Map size属性的问题
      if (key === 'size') {
        track(target, ITERATER_KEY)
        return Reflect.get(target, key, target);
      }

      // 代理对象可以通过 raw 属性访问原始数据
      if (key === 'raw') {
        return target;
      }
      
      // Set/Map 的 delete 方法
      if (target instanceof Set || target instanceof Map) {
        // 返回定义在 mutableInstrumentations 中的方法
        return mutableInstrumentations[key];
      }

      // 如果代理目标是数组，则对数组方法进行重写
      // 如果操作的目标对象是数组，并且 key 存在于 arrayInstrumentations 中，则返回重写的方法
      if (Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }

      // 非只读的情况下才需要建立响应式联系
      // 因为在 for ... of 是会访问到 Symbol.iterator 属性
      // 为了避免发生意外的错误，以及性能上的考虑，我们不应该在副作用函数
      // 与 Symbol.iterator 这类 symbol 值之间建立响应联系
      // 如果 key 的类型是 Symbol，则不进行追踪
      if (!isReadonly && typeof key !== 'symbol') {
        track(target, key);
      }

      const res = Reflect.get(target, key, receiver);

      // 如果是浅响应，直接返回
      if (isShallow) return res;

      if (typeof res === 'object' && res !== null) {
        // 将对象包装为响应式的结果返回
        // 如果数据是只读，则调用 readonly 对值进行包装（深层只读，不然就只是浅层只读）
        return isReadonly ? readonly(res) : reactive(res);
      }
      return res;
    },
    set(target, key, newValue, receiver) {
      // 如果属性是只读的，则打印警告信息并返回
      if (isReadonly) {
        console.warn(`属性 ${key} 是只读的`);
        return true;
      }

      // 旧值
      const oldValue = target[key];

      // 如果属性不存在，说明是在添加属性
      const type = Array.isArray(target)
        // 如果代理目标是数组，则检测设置的索引值是否小于数组的长度
        // 如果是，则说明是设置已有元素的值，否则是添加新元素
        ? Number(key) < target.length ? TriggerType.SET : TriggerType.ADD
        : Object.prototype.hasOwnProperty.call(target, key) ? TriggerType.SET : TriggerType.ADD;

      const res = Reflect.set(target, key, newValue, receiver);

      // target === receiver.raw 说明 receiver 就是 target 的代理对象
      if (target === receiver.raw) {
        // 只有当设置的新值和旧值不同时，才触发更新
        // 并且不都是 NaN
        if (newValue !== oldValue && (newValue === newValue || oldValue === oldValue)) {
          // 增加第四个参数，即触发响应的新值
          trigger(target, key, type, newValue);
        }
      }

      return res;
    },
    has(target, key) {
      track(target, key);
      return Reflect.has(target, key);
    },
    deleteProperty(target, key) {
      if (isReadonly) {
        console.warn(`属性 ${key} 是只读的`);
        return true;
      }

      // 检查被操作的属性是否是对象自己的属性
      const hasKey = Object.prototype.hasOwnProperty.call(target, key);

      // 使用 Reflect.deleteProperty 删除属性
      const res = Reflect.deleteProperty(target, key);

      // 只有当被删除的属性对象自己的属性且操作成功时，才触发依赖更新
      if (res && hasKey) {
        trigger(target, key, TriggerType.DELETE);
      }

      return res;
    },
    ownKeys(target) {
      // 如果操作目标 target 是数组，则使用 length 属性作为 key 并简历响应联系
      // 处理 for ... in 遍历数组和对象的情况
      track(target, Array.isArray(target) ? 'length' : ITERATER_KEY);
      return Reflect.ownKeys(target);
    }
  });
}

export function reactive(obj) {
  // 优先通过原始对象 obj 寻找之前创建的代理对象，如果找到了，则直接返回已有代理对象
  // 避免了为同一个原始对象多次创建代理对象的问题
  const existionProxy = reactiveMap.get(obj);
  if (existionProxy) return existionProxy;

  const proxy = createReactive(obj);
  reactiveMap.set(obj, proxy);

  return proxy;
}

export function shallowReactive(obj) {
  return createReactive(obj, true);
}

export function shallowRef(val) {
  return createRef(val, true);
}

functon isRef(val) {
  return val.__v_isRef === true;
}

function createRef(val, isShallow = false) {
  if (isRef(val)) return val;

  const wrapper = {
    value: val
  }
  Object.defineProperty(wrapper, '__v_isRef', {
    value: true
  })
  return isShallow ? shallowReactive(wrapper) : reactive(wrapper);
}
export function readonly(obj) {
  return createReactive(obj, false, true /** 只读 */);
}

export function shallowReadonly(obj) {
  return createReactive(obj, true, /** 浅层只读 */ true /** 只读 */);
}

export function ref(val) {
  const wrapper = {
    value: val
  }
  Object.defineProperty(wrapper, '__v_isRef', {
    value: true
  })
  return reactive(wrapper);
}

export function toRef(obj, key) {
  const wrapper = {
    get value() {
      return obj[key];
    },
    set value(newValue) {
      obj[key] = newValue;
    }
  }
  Object.defineProperty(wrapper, '__v_isRef', {
    value: true
  })
  return wrapper;
}

export function toRefs(obj) {
  const ret = {};
  for (const key in obj) {
    ret[key] = toRef(obj, key);
  }
  return ret;
}

export function proxyRefs (target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      return value.__v_isRef ? value.value : value;
    },
    set(target, key, newValue, receiver) {
      // 通过 target 读取真实值
      const value = target[key];
      if (value.__v_isRef) {
        value.value = newValue;
        return true;
      }
      return Reflect.set(target, key, newValue, receiver);
    }
  })
}
```

---

## 2024/12-out/vue3/reactivity.js

> 来源：`profile/2024/12-out/vue3/reactivity.js`

```javascript
let activeEffect;
const effectStack = [];
const ITERATER_KEY = Symbol();
const MAP_KEY_ITERATER_KEY = Symbol('key');
const TriggerType = {
  SET: 'SET',
  ADD: 'ADD',
  DELETE: 'DELETE'
};
const reactiveMap = new Map();

const targetMap = new WeakMap();

function track(target, key) {
  // 当前禁止追踪，直接返回
  if (!activeEffect || !shouldTrack) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

function trigger(target, key, type, newValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  // 取得与 key 相关的副作用函数
  const effects = depsMap.get(key);

  const effectToRun = new Set();

  // 将与 key 相关联的副作用函数添加到 effectToRun 中
  effects && effects.forEach(effect => {
    if (effect !== activeEffect) {
      effectToRun.add(effect);
    }
  });

  // 如果是 ADD 或 DELETE 操作，还需要取得与 ITERATER_KEY 相关的副作用函数
  // 如果是 SET 操作，并且目标对象是 Map 类型，也需要取得与 ITERATER_KEY 相关的副作用函数
  if (
    type === TriggerType.ADD || 
    type === TriggerType.DELETE ||
    (type === TriggerType.SET && Object.prototype.toString.call(target) === '[object Map]')
  ) {
    // 取得与 ITERATER_KEY 相关的副作用函数
    const iterateEffects = depsMap.get(ITERATER_KEY);
    // 将与 ITERATER_KEY 相关联的副作用函数添加到 effectToRun 中
    iterateEffects && iterateEffects.forEach(effect => {
      if (effect !== activeEffect) {
        effectToRun.add(effect);
      }
    });
  }

  if (
    (type === TriggerType.ADD || type === TriggerType.DELETE) && 
    Object.prototype.toString.call(target) === '[object Map]'
  ) {
    // 取得与 MAP_KEY_ITERATER_KEY 相关的副作用函数
    const mapKeyIterateEffects = depsMap.get(MAP_KEY_ITERATER_KEY);
    // 将与 MAP_KEY_ITERATER_KEY 相关联的副作用函数添加到 effectToRun 中
    mapKeyIterateEffects && mapKeyIterateEffects.forEach(effect => {
      if (effect !== activeEffect) {
        effectToRun.add(effect);
      }
    });
  }

  // 当操作类型是 ADD 并且目标对象是数组时，还需要取得与 length 相关的副作用函数
  if (type === TriggerType.ADD && Array.isArray(target)) {
    // 取得与 length 相关的副作用函数
    const lengthEffects = depsMap.get('length');
    // 将与 length 相关联的副作用函数添加到 effectToRun 中
    lengthEffects && lengthEffects.forEach(effect => {
      if (effect !== activeEffect) {
        effectToRun.add(effect);
      }
    })
  }

  // 如果操作目标是数组，并且修改了数组的 length 属性
  if (Array.isArray(target) && key === 'length') {
    // 对于索引大于或等于新的 length 值的元素
    // 需要把所有相关联的副作用函数取出并添加到 effectsToRun 中
    // depsMap 的结构为 {0: Set, 1: Set, 2: Set, length: Set}
    // 表示谁依赖了 arr[i]
    depsMap.forEach((effects, key) => {
      // 这里的 newValue 是 length 属性的新值
      if (key >= newValue) {
        effects.forEach(effect => {
          if (effect !== activeEffect) {
            effectToRun.add(effect);
          }
        });
      }
    });
  }

  // 执行
  effectToRun.forEach(effect => {
    if (effect.options.scheduler) {
      effect.options.scheduler(effect);
    } else {
      effect();
    }
  });
}

export function effect(fn, options = {}) {
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
  effectFn.deps = [];
  if (!options.lazy) {
    effectFn();
  }
  return effectFn;
}

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    deps.delete(effectFn);
  }
  effectFn.deps.length = 0;
}

function computed(getter) {
  let value; // value 用来缓存上一次计算的值
  let dirty = true; // dirty 用来标识是否需要重新计算 true 表示 "脏"，需要重新计算

  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = false;
      trigger(obj, 'value');
    }
  });

  const obj = {
    get value() {
      if (dirty) {
        value = effectFn();
        dirty = false;
      }
      track(obj, 'value');
      return value;
    }
  };

  return obj;
}

function watch(source, cb) {
  let getter;
  if (typeof source === 'function') {
    getter = source;
  } else {
    getter = () => traverse(source);
  }
  let oldValue, newValue;

  let cleanup;
  const onInvalidate = fn => {
    cleanup = fn;
  };

  const job = () => {
    newValue = effectFn();
    if (cleanup) {
      cleanup();
    }
    cb(oldValue, newValue, onInvalidate);
    oldValue = newValue;
  };

  const effectFn = effect(
    // 触发读取操作，从而建立联系
    () => getter(),
    {
      lazy: true,
      scheduler: () => {
        if (options.flush === 'post') {
          // post
          const p = Promise.resolve();
          p.then(job);
        } else {
          // sync
          job();
        }
      }
    }
  );

  if (options.immediate) {
    job();
  } else {
    oldValue = effectFn();
  }
}

function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || value === null || seen.has(value)) return;
  seen.add(value);
  for (const key in value) {
    traverse(value[key], seen);
  }
  return value;
}

// 抽离为单独的函数，方便复用
function iterationMethod () {
  // 获取原始对象
  const target = this.raw;
  // 获取原始迭代方法
  const itr = target[Symbol.iterator]();
  const wrap = val => typeof val === 'object' ? reactive(val) : val;
  // 调用 track 建立响应联系
  track(target, ITERATER_KEY);
  // 返回自定义的迭代器
  return {
    // 迭代器协议
    next() {
      // 调用原始迭代器的 next 方法
      const { value, done } = itr.next();
      // 如果 value 不是 undefined，则对其进行包裹
      return { value: value ? [wrap(value[0]), wrap(value[1])] : value, done: done }
    },
    // 可迭代协议
    [Symbol.iterator]() {
      return this;
    }
  }
}

function valuesIterationMethod () {
  const target = this.raw;
  const itr = target.values();
  const wrap = val => typeof val === 'object' ? reactive(val) : val;
  track(target, ITERATER_KEY);
  return {
    next() {
      const { value, done } = itr.next();
      return { value: value ? wrap(value) : value, done: done }
    },
    [Symbol.iterator]() {
      return this;
    }
  }
}

function keysIterationMethod () {
  const target = this.raw;
  const itr = target.keys();
  const wrap = val => typeof val === 'object' ? reactive(val) : val;
  track(target, MAP_KEY_ITERATER_KEY);
  return {
    next() {
      const { value, done } = itr.next();
      return { value: value ? wrap(value) : value, done: done }
    },
    [Symbol.iterator]() {
      return this;
    }
  }
}

// Array 的自定义方法
const arrayInstrumentations = {};
// Object 的自定义方法 Set/Map 等
const mutableInstrumentations = {
  add(key) {
    // this 仍然指向代理对象
    const target = this.raw;
    // 通过原始对象执行 add 操作
    // 注意这里不再需要 .bind 了，因为是直接通过 target 调用并执行的
    const res = target.add(key);
    
    // 先判断值是否已经存在
    const hasKey = target.has(key);
    // 只有在值不存在的情况下，才需要触发响应
    if (!hasKey) {
      // 调用 trigger 函数触发响应，并指定操作类型为 ADD
      trigger(target, key, TriggerType.ADD);
    }
    return res;
  },
  delete(key) {
    const target = this.raw;
    const hasKey = target.has(key);
    const res = target.delete(key);
    // 只有在值存在的情况下，才需要触发响应，和 add 恰恰相反
    if (hasKey) {
      trigger(target, key, TriggerType.DELETE);
    }
    return res;
  },
  get(key) {
    // 获取原始对象
    const target = this.raw;
    // 判断读取的 key 是否存在
    const hasKey = target.has(key);
    // 追踪依赖，简历响应联系
    track(target, key);

    // 如果存在，则返回结果
    // 这里要注意，如果得到的结果 res 仍然是可代理的数据
    // 则要返回 reactive 包装后的响应式数据
    if (hasKey) {
      const res = target.get(key);
      return typeof res === 'object' ? reactive(res) : res;
    }
  },
  set(key, value) {
    const target = this.raw;
    const hadKey = target.has(key);
    // 获取旧值
    const oldValue = target.get(key);
    // 解决数据污染问题，将新值包装成响应式数据设置到了原始对象中
    // 所以这里判断如果要设置的值是响应式的，则要获取它的原始值
    const rawValue = value.raw || value;
    // 设置新值
    const res = target.set(key, rawValue);
    if (!hadKey) {
      // 如果不存在，则触发 ADD 操作
      trigger(target, key, TriggerType.ADD);
    } else if (oldValue !== value && (oldValue === oldValue || value === value)) {
      // 如果存在，并且值变了，则是 SET 操作，意味着修改
      trigger(target, key, TriggerType.SET);
    }
  },
  forEach(callback, thisArg) {
    // wrap 函数用来把可代理的值转换为响应式
    const wrap = val => typeof val === 'object' ? reactive(val) : val;

    const target = this.raw;
    track(target, ITERATER_KEY);
    // 通过原始对象执行 forEach 操作
    target.forEach((v, k) => {
      // 手动调用 callback，用 wrap 函数包裹 value 和 key 后再传给 callback
      // 这样就实现了深响应
      // 通过 .call 调用 callback，并指定 thisArg
      callback.call(thisArg, wrap(v), wrap(k), this);
    });
  },
  [Symbol.iterator]: iterationMethod,
  entries: iterationMethod,
  values: valuesIterationMethod,
  keys: keysIterationMethod,
};
;['includes', 'indexOf', 'lastIndexOf'].forEach(method => {
  const originMethod = Array.prototype[method];
  arrayInstrumentations[method] = function(...args) {
    // this 是代理对象，先在代理对象中查找，将结果存储到 res 中
    let res = originMethod.apply(this, args);
    // 如果找不到，再去原始数组中查找
    if (res === false) {
      res = originMethod.apply(this.raw, args);
    }
    // 返回最终结果
    return res;
  }
})
let shouldTrack = true;
;['push', 'pop', 'shift', 'unshift', 'splice'].forEach(method => {
  const originMethod = Array.prototype[method];
  arrayInstrumentations[method] = function(...args) {
    shouldTrack = false;
    let res = originMethod.apply(this, args);
    shouldTrack = true;
    return res;
  }
})

function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      // 处理 Set/Map size属性的问题
      if (key === 'size') {
        track(target, ITERATER_KEY)
        return Reflect.get(target, key, target);
      }

      // 代理对象可以通过 raw 属性访问原始数据
      if (key === 'raw') {
        return target;
      }
      
      // Set/Map 的 delete 方法
      if (target instanceof Set || target instanceof Map) {
        // 返回定义在 mutableInstrumentations 中的方法
        return mutableInstrumentations[key];
      }

      // 如果代理目标是数组，则对数组方法进行重写
      // 如果操作的目标对象是数组，并且 key 存在于 arrayInstrumentations 中，则返回重写的方法
      if (Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }

      // 非只读的情况下才需要建立响应式联系
      // 因为在 for ... of 是会访问到 Symbol.iterator 属性
      // 为了避免发生意外的错误，以及性能上的考虑，我们不应该在副作用函数
      // 与 Symbol.iterator 这类 symbol 值之间建立响应联系
      // 如果 key 的类型是 Symbol，则不进行追踪
      if (!isReadonly && typeof key !== 'symbol') {
        track(target, key);
      }

      const res = Reflect.get(target, key, receiver);

      // 如果是浅响应，直接返回
      if (isShallow) return res;

      if (typeof res === 'object' && res !== null) {
        // 将对象包装为响应式的结果返回
        // 如果数据是只读，则调用 readonly 对值进行包装（深层只读，不然就只是浅层只读）
        return isReadonly ? readonly(res) : reactive(res);
      }
      return res;
    },
    set(target, key, newValue, receiver) {
      // 如果属性是只读的，则打印警告信息并返回
      if (isReadonly) {
        console.warn(`属性 ${key} 是只读的`);
        return true;
      }

      // 旧值
      const oldValue = target[key];

      // 如果属性不存在，说明是在添加属性
      const type = Array.isArray(target)
        // 如果代理目标是数组，则检测设置的索引值是否小于数组的长度
        // 如果是，则说明是设置已有元素的值，否则是添加新元素
        ? Number(key) < target.length ? TriggerType.SET : TriggerType.ADD
        : Object.prototype.hasOwnProperty.call(target, key) ? TriggerType.SET : TriggerType.ADD;

      const res = Reflect.set(target, key, newValue, receiver);

      // target === receiver.raw 说明 receiver 就是 target 的代理对象
      if (target === receiver.raw) {
        // 只有当设置的新值和旧值不同时，才触发更新
        // 并且不都是 NaN
        if (newValue !== oldValue && (newValue === newValue || oldValue === oldValue)) {
          // 增加第四个参数，即触发响应的新值
          trigger(target, key, type, newValue);
        }
      }

      return res;
    },
    has(target, key) {
      track(target, key);
      return Reflect.has(target, key);
    },
    deleteProperty(target, key) {
      if (isReadonly) {
        console.warn(`属性 ${key} 是只读的`);
        return true;
      }

      // 检查被操作的属性是否是对象自己的属性
      const hasKey = Object.prototype.hasOwnProperty.call(target, key);

      // 使用 Reflect.deleteProperty 删除属性
      const res = Reflect.deleteProperty(target, key);

      // 只有当被删除的属性对象自己的属性且操作成功时，才触发依赖更新
      if (res && hasKey) {
        trigger(target, key, TriggerType.DELETE);
      }

      return res;
    },
    ownKeys(target) {
      // 如果操作目标 target 是数组，则使用 length 属性作为 key 并简历响应联系
      // 处理 for ... in 遍历数组和对象的情况
      track(target, Array.isArray(target) ? 'length' : ITERATER_KEY);
      return Reflect.ownKeys(target);
    }
  });
}

function reactive(obj) {
  // 优先通过原始对象 obj 寻找之前创建的代理对象，如果找到了，则直接返回已有代理对象
  // 避免了为同一个原始对象多次创建代理对象的问题
  const existionProxy = reactiveMap.get(obj);
  if (existionProxy) return existionProxy;

  const proxy = createReactive(obj);
  reactiveMap.set(obj, proxy);

  return proxy;
}

function shallowReactive(obj) {
  return createReactive(obj, true);
}

function readonly(obj) {
  return createReactive(obj, false, true /** 只读 */);
}

function shallowReadonly(obj) {
  return createReactive(obj, true, /** 浅层只读 */ true /** 只读 */);
}

export function ref(val) {
  const wrapper = {
    value: val
  }
  Object.defineProperty(wrapper, '__v_isRef', {
    value: true
  })
  return reactive(wrapper);
}

function toRef(obj, key) {
  const wrapper = {
    get value() {
      return obj[key];
    },
    set value(newValue) {
      obj[key] = newValue;
    }
  }
  Object.defineProperty(wrapper, '__v_isRef', {
    value: true
  })
  return wrapper;
}

function toRefs(obj) {
  const ret = {};
  for (const key in obj) {
    ret[key] = toRef(obj, key);
  }
  return ret;
}

function proxyRefs (target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      return value.__v_isRef ? value.value : value;
    },
    set(target, key, newValue, receiver) {
      // 通过 target 读取真实值
      const value = target[key];
      if (value.__v_isRef) {
        value.value = newValue;
        return true;
      }
      return Reflect.set(target, key, newValue, receiver);
    }
  })
}
```

---

## front-end-frame/vuejs/vuejs/core/array.js

> 来源：`profile/front-end-frame/vuejs/vuejs/core/array.js`

```javascript
/**
 * Array 在 getter 中收集依赖，在拦截器中触发依赖
 * Vue.js 把 Array 的依赖存放在 Observer 中
 */
const arrayProto = Array.prototype
const arrayMethods = Object.create(arrayProto)
;[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
].forEach(method => {
  // 缓存原始方法
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break;
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // Array 将新增的元素也转化为响应式的
    if (inserted) {
      ob.observeArray(inserted)
    }
    // Array 触发依赖
    ob.dep.notify()
    return result
  })
})

class Dep {
  constructor () {
    this.subs = []
  }

  addSub (sub) {
    this.subs.push(sub)
  }

  removeSub () {
    remove(this.subs, sub)
  }

  depend () {
    if (window.target) {
      this.addSub(window.target)
    }
  }

  notify () {
    const subs = this.subs.slice()
    for (let i = 0; i < subs.length; i++) {
      subs[i].update()
    }
  }
}

function remove (arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      arr.splice(index, 1)
    }
  }
}

// __proto__ 是否可用
const hasProto = '__proto__' in {}
/**
 * Object.getOwnPropertyNames() 返回对象实例的常规属性数组
 * Object.getOwnPropertySymbols() 返回对象实例的符号属性数组
 * 二者返回值彼此互斥
 * Object.getOwnPropertyDescriptors() 返回同时包含常规和符号属性描述符对象
 */
const arrayKeys = Object.getOwnPropertyNames(arrayMethods)
class Observer {
  consturctor (value) {
    this.value = value
    // Vue.js 把 Array 的依赖存放在 Observer 的实例上
    this.dep = new Dep()
    def(value, '__ob__', this)

    if (Array.isArray(value)) {
      // value.__proto = arrayMethods
      // 处理 Array 自身
      const augment = hasProto
        ? protoAugment
        : copyAugment
      augment(value, arrayMethods, arrayKeys)
      // 处理 Array 中的每一项
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }

  // 侦测 Array 中的每一项
  observeArray (items) {
    for (let i = 0; i < items.length; i++) {
      observe(items[i])
    }
  }

  walk (obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const val = obj[key]
      defineReactive(obj, key, val)
    }
  }
}

function protoAugment (target, src, keys) {
  target.__proto__ = src
}

function copyAugment (target, src, keys) {
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    // array pushStr pushMethod
    def(target, key, src[key])
  }
}

// 工具函数
function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

function defineReactive (data, key, val) {
  if (typeof val === 'object') {
    new Observer(val)
  }
  let childOb = observe(val) // ***
  let dep = new Dep()
  Object.defineProperty(data, key, {
    configurable: true, 
    enumerable: true,
    get () {
      // Object 收集依赖
      dep.depend()
      // Array 收集依赖
      if (childOb) {
        childOb.dep.depend()
      }
      return val
    },
    set (newVal) {
      if (val === newVal) {
        return
      }
      val = newVal
      // Object 触发依赖
      dep.notify()
    }
  })
}

/**
 * 尝试为 value 创建一个 Observer 实例
 * 如果创建成功，直接返回新创建的 Observer 实例
 * 如果 value 已经存在一个 Observer 实例，则直接返回它
 */
function observe (value, asRootData) {
  if (!isObject(value)) {
    return
  }
  let ob
  // 如果 value 已经是响应式数据，则不需要再次创建 Observer 实例
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else {
    ob = new Observer(value)
  }
  return ob
}
```

---

## front-end-frame/vuejs/手写Vue/vue-study/kvue/01-reactive.js

> 来源：`profile/front-end-frame/vuejs/手写Vue/vue-study/kvue/01-reactive.js`

```javascript
// Object.defineProperty()
// 将传入的obj，动态设置一个key，它的值val
function defineReactive(obj, key, val) {
  // 递归
  observe(val)
  
  Object.defineProperty(obj, key, {
    get() {
      console.log('get', key);
      return val
    },
    set(v) {
      if (val !== v) {
        console.log('set', key);
        // 传入新值v可能还是对象
        observe(v)
        val = v
      }
    },
  })
}

// 递归遍历obj，动态拦截obj的所有key
function observe(obj) {
  if (typeof obj !== 'object' || obj == null) {
    return obj
  }
  Object.keys(obj).forEach(key => {
    defineReactive(obj, key, obj[key])
  })
}

// this.$set()
// Vue.set()
function set(obj, key, val) {
  defineReactive(obj, key, val)
}

const obj = {
  foo: 'foo',
  bar: 'bar',
  baz: {
    a: 1
  }
}
// defineReactive(obj, 'foo', 'foo')
observe(obj)

// obj.foo
// obj.foo = 'fooooooo'
// obj.baz.a
// obj.baz = { a: 10 }
// obj.baz.a
// obj.dong = 'dong'
// obj.dong
// set(obj, 'dong', 'dong')
// obj.dong
```

---


# Vue3 常见面试题

## Vue3 源码

### 响应系统实现

// 存储副作用函数的桶
const bucket = new WeakMap();
let activeEffect = null;
const effectStack = [];

function track(target, key) {
  if (!activeEffect) return;

  // ----------------------- 收集依赖 START -----------------------
  let depsMap = bucket.get(target);
  if (!depsMap) bucket.set(target, (depsMap = new Map()));

  let deps = depsMap.get(key);
  if (!deps) depsMap.set(key, (deps = new Set()));
  deps.add(activeEffect);
  // ----------------------- 收集依赖 end -----------------------

  // deps 就是一个与当前副作用函数存在联系的依赖集合
  // 将其添加到 activeEffect.deps 数组中，方便后续 clean
  activeEffect.deps.push(deps);
}

function trigger(target, key) {
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
        ? Number(key) < target.length
          ? 'SET'
          : 'ADD'
        : Object.prototype.hasOwnProperty.call(target, key)
        ? 'SET'
        : 'ADD';
      const res = Reflect.set(target, key, newVal, receiver);
      if (target === receiver.raw) {
        if (oldVal !== newVal && (oldVal === oldVal || newVal === newVal)) {
          trigger(target, key, type);
        }
      }

      if (isShallow) {
        return res;
      }

      return createReactive(res);
    },
    get(target, key, receiver) {
      // 如果访问的是 raw 属性，则返回原始对象
      if (key === 'raw') {
        return target;
      }
      // 非只读情况下，进行依赖收集
      if (!isReadonly) {
        track(target, key);
      }
      const res = Reflect.get(target, key, receiver);
      if (isShallow) {
        return res;
      }
      if (typeof res === 'object' && res !== null) {
        // 如果数据为只读，则调用 readonly 方法进行包装，否则调用 reactive 方法进行包装
        return isReadonly ? readonly(res) : reactive(res);
      }
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
        trigger(target, key, 'DELETE');
      }
      return res;
    }
  });
}

function reactive(obj) {
  return createReactive(obj);
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

export { track, trigger, activeEffect, effect, reactive, shallowReactive, readonly, shallowReadonly };
```
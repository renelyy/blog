# Vue2 常见面试题

## 响应式系统

1. 从 Vue.js 2.0 开始，它引入了虚拟 DOM，将粒度调整为中等粒度，即一个状态所绑定的依赖不再是具体的 DOM 节点，而是一个组件。这样状态变化后，会通知到组件，组件内部再使用虚拟 DOM 进行比对。这可以大大降低依赖数量，从而降低依赖追踪所消耗的内存。
2. getter 中收集依赖，在 setter 中触发依赖。
3. 依赖收集到哪儿？收集到 Dep 中。
4. 收集谁？Watcher！Watcher 是一个中介的角色，数据发生变化时通知它，然后它再通知其他地方。
5. 关于 Object 的问题：由于 JavaScript 的限制，Vue 不能检测到对象属性的**添加**和**删除**。由于 Vue 在初始化实例时对属性执行 getter/setter 转化，所以属性必须在 data 对象上才能让 Vue 转换它，这样它才能让它的响应系统知道需要观察属性。在 ES6 之前，JavaScript 没有提供元编程的能力，无法侦测到一个新属性被添加到了对象中，也无法侦测到一个属性从对象中删除了。为了解决这个问题，Vue.js 提供了两个 API——`vm.$set`与`vm.$delete`
6. `__proto__` 其实是`Object.getPrototypeOf`和`Object.setPrototypeOf`的早期实现，所以使用 ES6 的`Object.setPrototypeOf`来代替 `__proto__` 完全可以实现同样的效果。
7. Array 在 getter 中收集依赖，在拦截器中触发依赖。
8. Array 的问题：由于 JavaScript 的限制，Vue 不能检测以下变动的数组：
   - 当你利用索引直接设置一个项时，例如：`vm.items[indexOfItem] = newValue`
   - 当你修改数组的长度时，例如：`vm.items.length = newLength`
     为了解决这个问题，Vue 提供了以下操作方法：`vm.$set`和`vm.$delete`。

```js
let uid = 0;

class Dep {
  constructor() {
    this.id = uid++;
    this.subs = [];
  }

  addSub(sub) {
    this.subs.push(sub);
  }

  removeSub(sub) {
    remove(this.subs, sub);
  }

  depend() {
    if (window.target) {
      // this.addSub(window.target);
      window.target.addDep(this);
    }
  }

  notify() {
    const subs = this.subs.slice();
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  }
}

class Watcher {
  constructor(vm, expOrFn, cb) {
    this.vm = vm;
    this.deps = []; // 依赖集合
    this.depIds = new Set(); // 依赖 id 集合

    if (typeof expOrFn === "function") {
      this.getter = expOrFn;
    } else {
      // 执行 this.getter()，就可以读取 data.a.b.c 的值，并且触发 getter
      this.getter = parsePath(expOrFn);
    }

    if (options) {
      this.deep = !!options.deep;
    } else {
      this.deep = false;
    }

    this.cb = cb;
    this.value = this.get();
  }

  addDep(dep) {
    if (!this.depIds.has(dep.id)) {
      this.depIds.add(dep.id);
      this.deps.push(dep);
      dep.addSub(this);
    }
  }

  get() {
    window.target = this;
    let value = this.getter.call(this.vm, this.vm);
    if (this.deep) {
      traverse(value);
    }
    window.target = undefined;
    return value;
  }

  update() {
    const oldValue = this.value;
    this.value = this.get();
    this.cb.call(this.vm, this.value, oldValue);
  }

  /**
   * 从所有依赖项的 Dep 列表中将自己移除
   */
  teardown() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].removeSub(this);
    }
  }
}

const seenObjects = new Set();
function traverse(val) {
  _traverse(val, seenObjects);
  seenObjects.clear();
}

function _traverse(val, seen) {
  let i, keys;
  const isA = Array.isArray(val);
  if ((!isA && !isObject(val)) || Object.isFrozen(val)) {
    // 如果 val 不是对象或者数组，或者 val 是冻结对象，则直接返回
    return;
  }
  if (val.__ob__) {
    const depId = val.__ob__.dep.id;
    if (seen.has(depId)) {
      // 保证不会重复收集依赖
      return;
    }
    seen.add(depId);
  }
  if (isA) {
    i = val.length;
    while (i--) _traverse(val[i], seen);
  } else {
    keys = Object.keys(val);
    i = keys.length;
    while (i--) _traverse(val[keys[i]], seen);
  }
}

// 检测 __proto__ 是否可用
const hasProto = "__proto__" in {};
const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * 兼容 __proto__ 的处理方式
 */
function protoAugment(target, src, keys) {
  target.__proto__ = src;
}

/**
 * 不兼容 __proto__ 的处理方式，直接将拦截器挂载到数组实例上
 */
function copyAugment(target, src, keys) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i];
    def(target, key, src[key]);
  }
}

function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

/**
 * Observer 类会附加到每一个被侦测到 object 上
 * 一旦被附加上，Observer 会将 object 的所有属性转换为 getter/setter 的形式来收集属性的依赖
 * 并且当属性发生变化时会通知这些依赖
 */
class Observer {
  constructor(value) {
    this.value = value;
    // Array 的依赖收集比较特殊，需要单独处理，存放在 Observer 的 dep 上
    // 数组在 getter 中收集依赖，在拦截器中触发依赖，依赖的保存位置很重要
    // 必须在 getter 和 拦截器中都可以访问到
    this.dep = new Dep();
    def(value, "__ob__", this);

    if (Array.isArray(value)) {
      // 只覆盖即将被转化为响应式的数组的原型，防止污染全局的 Array 原型
      const augment = hasProto ? protoAugment : copyAugment;
      augment(value, arrayMethods, arrayKeys);

      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }

  /**
   * 侦测 Array 中的每一项
   */
  observeArray(items) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i]);
    }
  }

  /**
   * walk 方法会遍历对象的每一个属性，并使用 Object.defineProperty 把这些属性全部转为 getter/setter
   * 这个方法只有在数据类型为 object 的时候才会被调用
   */
  walk(obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]]);
    }
  }
}

function remove(arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1);
    }
  }
}

/**
 * 解析简单路径
 */
const bailRE = /[^\w.$]/;
function parsePath(path) {
  if (bailRE.test(path)) return; // 如果路径不合法，直接返回
  const segments = path.split(".");
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return;
      obj = obj[segments[i]];
    }
    return obj;
  };
}

function isObject(value) {
  return value !== null && typeof value === "object";
}

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * 尝试为 value 创建一个 observer 实例
 * 如果创建成功，直接返回新创建的 observer 实例
 * 如果 value 已经存在一个 observer 实例，直接返回该实例
 */
function observe(value, asRootData) {
  if (!isObject(value)) return;
  let ob;
  if (hasOwn(value, "__ob__") && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else {
    ob = new Observer(value);
  }
  return ob;
}

function defineReactive(obj, key, val) {
  // 递归子属性
  if (typeof val === "object" && val !== null) {
    new Observer(val);
  }

  let childOb = observe(val);
  let dep = new Dep();

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      // 收集依赖
      dep.depend();

      // 数组收集依赖
      if (childOb) {
        childOb.dep.depend();
      }

      return val;
    },
    set: function (newVal) {
      if (newVal === val) return;

      // 通知
      dep.notify();

      val = newVal;
    }
  });
}

const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);
["push", "pop", "shift", "unshift", "splice", "sort", "reverse"].forEach(
  function (method) {
    // 缓存原始方法
    const original = arrayProto[method];
    def(arrayMethods, method, function mutator(...args) {
      const result = original.apply(this, args);
      const ob = this.__ob__;

      let inserted;
      switch (method) {
        case "push":
        case "unshift":
          inserted = args;
          break;
        case "splice":
          inserted = args.slice(2);
          break;
      }

      // 把新添加的属性也转为响应式
      if (inserted) ob.observeArray(inserted);

      // 通知依赖更新
      ob.dep.notify(); // 通知依赖更新
      return result;
    });
  }
);

/**
 * $watch 内部实现原理
 */
Vue.prototype.$watch = function (expOrFn, cb, options) {
  const vm = this;
  options = options || {};
  const watcher = new Watcher(vm, expOrFn, cb, options);
  if (options.immediate) {
    cb.call(vm, watcher.value);
  }
  return function unwatchFn() {
    watcher.teardown();
  };
};

/**
 * $set 内部实现原理
 */
Vue.prototype.$set = function (target, key, val) {
  // 处理 target 为数组的情况
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);
    return val;
  }

  // 处理 target 为对象的情况
  if (key in target && !(key in Object.prototype)) {
    // 由于key已经存在于 target 中，所以其实这个 key 已经被侦测了变化。
    // 也就是说，这种情况属于修改数据，直接用 key 和 val 改数据就好了。
    target[key] = val;
    return val;
  }

  // 处理新增的属性
  const ob = target.__ob__;
  if (target.__isVue || (ob && ob.vmCount)) {
    // 如果 target 是一个 Vue 实例或者 $data，则不允许新增属性
    process.env.NODE_ENV !== "production" &&
      warn(
        "Avoid adding reactive properties to a Vue instance or its root $data " +
          "at runtime - declare it upfront in the data option."
      );
    return;
  }

  if (!ob) {
    // 如果 target 不是一个响应式对象，则直接赋值
    target[key] = val;
    return val;
  }

  // 如果 target 是一个响应式对象，则通过 defineReactive 方法给 target 添加一个新的属性
  defineReactive(ob.value, key, val);
  ob.dep.notify(); // 通知依赖更新
  return val;
};

/**
 * $delete 内部实现原理
 */
Vue.prototype.$delete = function (target, key) {
  // 处理 target 为数组的情况
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1);
    return;
  }

  // 处理 target 为对象的情况
  const ob = target.__ob__;
  if (target.__isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== "production" &&
      warn(
        "Avoid deleting properties on a Vue instance or its root $data " +
          "- just set it to null."
      );
    return;
  }

  // 如果 key 不是 target 的属性，直接返回
  if (!hasOwn(target, key)) return;

  delete target[key];

  // 不是响应式对象，直接返回
  if (!ob) return;

  // 通知依赖更新
  ob.dep.notify(); // 通知依赖更新
};

function isValidArrayIndex(val) {
  return typeof val === "number" && val > -1;
}
```

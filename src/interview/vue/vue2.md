# Vue2 常见面试题

## 响应式系统

1. 从 Vue.js 2.0 开始，它引入了虚拟 DOM，将粒度调整为中等粒度，即一个状态所绑定的依赖不再是具体的 DOM 节点，而是一个组件。这样状态变化后，会通知到组件，组件内部再使用虚拟 DOM 进行比对。这可以大大降低依赖数量，从而降低依赖追踪所消耗的内存。
2. getter 中收集依赖，在 setter 中触发依赖。
3. 依赖收集到哪儿？收集到 Dep 中。
4. 收集谁？Watcher！Watcher 是一个中介的角色，数据发生变化时通知它，然后它再通知其他地方。
5. 关于 Object 的问题：由于 JavaScript 的限制，Vue 不能检测到对象属性的**添加**和**删除**。由于 Vue 在初始化实例时对属性执行 getter/setter 转化，所以属性必须在 data 对象上才能让 Vue 转换它，这样它才能让它的响应系统知道需要观察属性。在 ES6 之前，JavaScript 没有提供元编程的能力，无法侦测到一个新属性被添加到了对象中，也无法侦测到一个属性从对象中删除了。为了解决这个问题，Vue.js 提供了两个 API——`vm.$set`与`vm.$delete`

```js
class Dep {
  constructor() {
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
      this.addSub(window.target);
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
    // 执行 this.getter()，就可以读取 data.a.b.c 的值，并且触发 getter
    this.getter = parsePath(expOrFn);
    this.cb = cb;
    this.value = this.get();
  }

  get() {
    window.target = this;
    let value = this.getter.call(this.vm, this.vm);
    window.target = undefined;
    return value;
  }

  update() {
    const oldValue = this.value;
    this.value = this.get();
    this.cb.call(this.vm, this.value, oldValue);
  }
}

/**
 * Observer 类会附加到每一个被侦测到 object 上
 * 一旦被附加上，Observer 会将 object 的所有属性转换为 getter/setter 的形式来收集属性的依赖
 * 并且当属性发生变化时会通知这些依赖
 */
class Observer {
  constructor(value) {
    this.value = value;
    if (!Array.isArray(value)) {
      this.walk(value);
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

function defineReactive(obj, key, val) {
  // 递归子属性
  if (typeof val === "object" && val !== null) {
    new Observer(val);
  }

  let dep = new Dep();

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      // 收集依赖
      dep.depend();

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
```

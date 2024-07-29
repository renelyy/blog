## 一、实现构造函数

```javascript
/**
 * 实现 Promise
 *
 * Promise 的三大法宝
 * 1. 回调函数延迟绑定
 * 2. 回调返回值穿透
 * 3. 错误冒泡
 */
function MyPromise(executor) {
  // 初始化状态
  this.status = 'pending';
  // 记录成功的值
  this.value = undefined;
  // 记录失败的原因
  this.reason = undefined;
  // 成功的回调
  this.onFulfilledCallbacks = [];
  // 失败的回调
  this.onRejectedCallbacks = [];

  const resolve = value => {
    if (this.status === 'pending') {
      this.status = 'fulfilled';
      this.value = value;
      // callback 是一个 fulfilledMicrotask 内部会解决传参问题，因此这里不会传参
      this.onFulfilledCallbacks.forEach(callback => callback());
    }
  };

  const reject = reason => {
    if (this.status === 'pending') {
      this.status = 'rejected';
      this.reason = reason;
      // 同理
      this.onRejectedCallbacks.forEach(callback => callback());
    }
  };

  try {
    // 回调函数立即执行
    executor(resolve, reject);
  } catch (error) {
    reject(error);
  }
}
```

## 二、实现 Promise.prototype.then()

```javascript
MyPromise.prototype.then = function (onFulfilled, onRejected) {
  // 成功回调不传给它一个默认函数
  onFulfilled =
    typeof onFulfilled === 'function' ? onFulfilled : value => value;
  // 失败回调直接抛错
  onRejected =
    typeof onRejected === 'function'
      ? onRejected
      : reason => {
          throw reason;
        };

  let promise1 = new MyPromise((resolve, reject) => {
    const fulfilledMicrotask = () => {
      // 创建一个微任务等待 promise1 完成初始化
      queueMicrotask(() => {
        try {
          // 获取成功回调函数的执行结果
          let x = onFulfilled(this.value);
          // 传入 resolvePromise 集中处理
          resolvePromise(promise1, x, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
    };

    const rejectedMicrotask = () => {
      queueMicrotask(() => {
        try {
          let x = onRejected(this.reason);
          resolvePromise(promise1, x, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
    };

    if (this.status === 'pending') {
      this.onFulfilledCallbacks.push(fulfilledMicrotask);
      this.onRejectedCallbacks.push(rejectedMicrotask);
    } else if (this.status === 'fulfilled') {
      // Promise A+ 中规定成功和失败的回调都是微任务，由于浏览器中 JS 触碰不到
      // 底层微任务的分配可以直接拿 setTimeout (属于宏任务的范畴) 来模拟
      // 目前可以拿 queueMicrotask 模拟添加微任务
      fulfilledMicrotask();
    } else if (this.status === 'rejected') {
      rejectedMicrotask();
    }
  });

  return promise1;
};

// 解决链式调用的值穿透问题
// ① 当 then 中返回的是普通值的时候，要调用一次 promise2 的 resolve 方法，从而将
// promise2 的 value 设置为 then 中返回的普通值。

// ② 当 then 中返回的是一个新的 promise 时，就调用它本身的 then 方法，根据返回的
// 新的 promise 的状态来设置 promise2 的 value 或者 reason 的值，如果返回的新的
// promise 状态为 fulfilled，也就是说在返回的新的 promise 中已经调用了 resolve
// 方法，那么此时调用 promise2 中的 resolve 方法，将返回的新的 promise 中的
// value 赋值给 promise2 的 value。从而实现值穿透
function resolvePromise(promise, x, resolve, reject) {
  // 如果相等了，说明 return 的是自己，抛出类型错误并返回
  if (promise === x) {
    return reject(
      new TypeError('The promise and the return value are the same')
    );
  }

  if (isObject(x)) {
    let then;
    try {
      // 把 x.then 赋值给 then
      then = x.then;
    } catch (error) {
      // 如果取 x.then 的值时抛出错误 error ，则以 error 为据因拒绝 promise
      return reject(error);
    }

    // 如果 then 函数
    if (typeof then === 'function') {
      let called = false;
      try {
        // x.then(resolve, reject)
        then.call(
          x, // this 指向 x
          // 如果 resolvePromise 以值 y 为参数被调用
          // 则运行 [[Resolve]](promise, y)
          y => {
            // 成功和失败只能调用一个
            if (called) return;
            called = true;
            // resolve 的参数为 y，则递归解析 y
            resolvePromise(promise, y, resolve, reject);
          },
          // 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
          r => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } catch (error) {
        // 如果调用 then 方法抛出了异常 error
        // 且 resolvePromise 或 rejectPromise 已经被调用，直接返回
        if (called) return;

        // 否则以 error 为据因拒绝 promise
        reject(error);
      }
    } else {
      // 如果 then 不是函数，以 x 为参数执行 promise2
      resolve(x);
    }

    // if (x instanceof MyPromise) {
    //   // 如果 x 是一个 Promise
    //   // 拆解这个 Promise，直到返回值不为 Promise 为止
    //   if (x.status === 'pending') {
    //     x.then(
    //       y => {
    //         resolvePromise(promise, y, resolve, reject);
    //       },
    //       error => {
    //         reject(error);
    //       }
    //     );
    //   } else {
    //     x.then(resolve, reject);
    //   }
    // } else {
    //   // 非 Promise 直接 resolve 即可
    //   resolve(x);
    // }
  } else {
    // 如果 x 是一个普通值，直接调用 resolve 方法
    resolve(x);
  }
}

function isObject(obj) {
  return (
    typeof obj !== null &&
    (typeof obj === 'object' || typeof obj === 'function')
  );
}
```

## 三、实现 Promise.prototype.catch()

```javascript
MyPromise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected);
};
```

## 四、实现 Promise.prototype.finally()

```javascript
MyPromise.prototype.finally = function (callback) {
  // 无论当前 Promise 是成功还是失败，调用 finally 之后都会执行 finally 中传入
  // 的函数，并且将值原封不动的往下传
  return this.then(
    value =>
      // 这里调用 .then 的目的是为了 finally 的 callback 回调执行完成之后，可以
      // 将之前成功值传递给后续的 then 方法
      MyPromise.resolve(callback()).then(() => {
        return value;
      }),
    reason =>
      // reason 也是同理，抛出错误，不然此后调用的方法将 resolved
      // 因为 MyPromise.resolve() 包装的结果是 resolved 的
      MyPromise.resolve(callback()).then(() => {
        throw reason;
      })
  );
};
```

## 五、实现 Promise.resolve()

```javascript
MyPromise.resolve = function (params) {
  // 1. 如果是一个 Promise 对象，直接返回这个 Promise 对象
  if (params instanceof MyPromise) return params;

  // 2. 如果是一个 thenable 对象，返回一个新的 Promise 对象，采用它的最终状态作为
  //    自己的状态
  // 3. 其他情况，返回一个新的 Promise 对象，状态为 resolved
  // return new MyPromise((resolve, reject) => {
  //   if (params && params.then && typeof params.then === 'function') {
  //     // params 状态变为成功会调用 resolve，将新 Promise 的状态变为成功
  //     // params 状态变为失败会调用 reject，将新 Promise 的状态变为失败
  //     params.then(resolve, reject);
  //   } else {
  //     resolve(params);
  //   }
  // });

  return new MyPromise(resolve => resolve(params));
};
```

## 六、实现 Promise.reject()

```javascript
MyPromise.reject = function (reason) {
  // Promise.reject 中传入的参数会作为一个 reason 原封不动地往下传，实现如下
  return new MyPromise((resolve, reject) => reject(reason));
};
```

## 七、实现 Promise.all()

```javascript
// 所有的都 resolved 才 resolve，有一个 rejected 则 reject
MyPromise.all = function (promises) {
  // all 方法，需要完成下面的核心功能
  // 1. 传入参数为一个空的可迭代对象，则直接返回一个 resolved 的 Promise 对象
  // 2. 否则，如果参数中有一个 Promise 失败，则返回一个失败的 Promise 对象
  // 3. 只有参数中的所有 Promise 都成功，才会返回一个成功的 Promise 对象
  return new MyPromise((resolve, reject) => {
    let results = [];
    let len = promises.length;
    // 标志位判断是否已经有 Promise 失败，如果失败了则直接 reject
    // 防止再执行其他 Promise
    let hasRejected = false;

    if (len === 0) {
      resolve(results);
      return;
    }

    for (let i = 0; i < len; i++) {
      if (hasRejected) break;

      // 为什么不直接 promise[i].then, 因为 promise[i] 可能不是一个 promise
      MyPromise.resolve(promises[i])
        .then(data => {
          results[i] = data;
          if (i === len - 1) {
            resolve(results);
          }
        })
        .catch(err => {
          hasRejected = true;
          reject(err);
          // 或者直接 return 中止其他 Promise 的执行
          // return;
        });
    }
  });
};
```

## 八、实现 Promise.race()

```javascript
// 竞赛：只要有一个 resolved 则直接 resolve，有一个 rejected 则 reject
MyPromise.race = function (promises) {
  return new MyPromise((resolve, reject) => {
    let len = promises.length;

    if (len === 0) return;

    for (let i = 0; i < len; i++) {
      MyPromise.resolve(promises[i])
        .then(data => {
          resolve(data);
          return;
        })
        .catch(err => {
          reject(err);
          return;
        });
    }
  });
};
```

## 九、实现 Promise.allSettled()

```javascript
// 所有异步操作都结束再进行下一步操作，无论每个操作是成功还是失败
MyPromise.allSettled = function (promises) {
  return new MyPromise((resolve, reject) => {
    let results = [];
    let len = promises.length;
    if (len === 0) {
      resolve(results);
      return;
    }
    for (let i = 0; i < len; i++) {
      MyPromise.resolve(promises[i])
        .then(data => {
          results[i] = { status: 'fulfilled', value: data };
        })
        .catch(error => {
          results[i] = { status: 'rejected', reason: error };
        })
        .finally(() => {
          if (i === len - 1) {
            resolve(results);
          }
        });
    }
  });
};
```

## 十、实现 Promise.any()

```javascript
// 只要有一个 resolved 则直接 resolve
// 所有的都 rejected 才会 rejecte
// 和 race 很像，不同的点在于：race 只要有一个 rejected，则直接 rejected。
// 而 any 则会尝试下一个，直到所有的都 rejected
MyPromise.any = function (promises) {
  return new MyPromise((resolve, reject) => {
    let len = promises.length;
    const errors = [];

    if (len === 0) {
      reject(new AggregateError('All promises were rejected'));
      return;
    }

    for (let i = 0; i < len; i++) {
      MyPromise.resolve(promises[i])
        .then(data => {
          resolve(data);
          return;
        })
        .catch(err => {
          errors.push(err);
          if (errors.length === len) {
            reject(new AggregateError('All promises were rejected', errors));
          }
        });
    }
  });
};
```

# 手写 MyPromise

[← 返回索引](../index.md)

> 完整 Promise 实现（profile 原版）

---

## MyPromise

> 来源：`profile/JavaScript/JavaScript手写题/Promise篇/MyPromise.js`

```javascript
/**
 * @description 手写 Promise
 *
 * 2个特点
 *  - 状态不受外界影响
 *  - 一旦状态改变，就不会再变
 *
 * 3个缺点
 *  - 无法取消
 *  - 不设置回调函数，Promise内部抛出的错误，不会反应到外部
 *  - pending状态是无法得知当前处于哪一状态
 */
class MyPromise {
  constructor(executor) {
    this.state = 'pending'
    this.value = undefined
    this.reason = undefined
    this.onResolvedCallbacks = []
    this.onRejectedCallbacks = []

    const resolve = value => {
      if (this.state === 'pending') {
        this.state = 'fulfilled'
        this.value = value
        this.onResolvedCallbacks.forEach(fn => fn())
      }
    }

    const reject = reason => {
      if (this.state === 'pending') {
        this.state = 'rejected'
        this.reason = reason
        this.onRejectedCallbacks.forEach(fn => fn())
      }
    }

    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === 'function' ? onFulfilled : value => value
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : err => {
            throw err
          }
    let promise2 = new MyPromise((resolve, reject) => {
      if (this.state === 'fulfilled') {
        // 这里为什么使用 setTimeout？
        // 主要是创建一个微任务等待 promise2 完成初始化
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      }
      if (this.state === 'rejected') {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      }
      if (this.state === 'pending') {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0)
        })
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason)
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0)
        })
      }
    })
    return promise2
  }

  catch() {}

  // ES2018 add
  // 不管 Promise 对象最后的状态如何，都会执行
  // finally 方法的回调函数不接受任何参数，这意味着没有办法知道，前面的 Promise 状态
  // 到底是 fulfilled 还是 rejected。这表明，finally方法里面的操作，应该是与状态无
  // 关的，不依赖于 Promise 的执行结果
  // finall 本质上是 then 方法的特例
  finally(cb) {
    let P = this.constructor
    return this.then(
      value => P.resolve(cb()).then(() => value),
      reason =>
        P.resolve(cb()).then(() => {
          throw reason
        })
    )
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  if (x === promise2) {
    return reject(new TypeError('Chaining cycle detected for promise'))
  }
  let called
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      let then = x.then
      if (typeof then === 'function') {
        then.call(
          x,
          y => {
            if (called) return
            called = true
            resolvePromise(promise2, y, resolve, reject)
          },
          err => {
            if (called) return
            called = true
            reject(err)
          }
        )
      } else {
        resolve(x)
      }
    } catch (error) {
      if (called) return
      called = true
      reject(error)
    }
  } else {
    resolve(x)
  }
}

/**
 * @description Promise.all() 方法用于将多个 Promise 实例包装成一个新的 Promise 实例
 * p 的状态由 p1, p2, p3 决定
 * 1. p1, p2, p3 都变成 fulfilled, p 才变成 fulfilled, p1, p2, p3 的返回值组成一个数组
 *    传递给 p 的回调函数
 * 2. 有一个被 reject, p 的状态就变成 rejected, 第一个被 reject 的实例的返回值传递给p的回调
 * @param {Array} promises
 * @returns Promise
 */
MyPromise.all = function (promises) {
  return new MyPromise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      throw new TypeError('promises must be an array')
    }
    let result = []
    let count = 0
    promises.forEach((promise, index) => {
      promise.then(
        res => {
          result[index] = res
          count++
          count === promises.length && resolve(result)
        },
        err => {
          reject(err)
        }
      )
    })
  })
}

// 只要p1、p2、p3之中有一个实例率先改变状态，p的状态就跟着改变
MyPromise.race = function (promises) {
  if (!Array.isArray(promises)) {
    throw new TypeError(
      `${promises} is not iterable (cannot read property Symbol(Symbol.iterator))`
    )
  }

  return new MyPromise((resolve, reject) => {
    promises.forEach(promise => {
      Promise.resolve(promise).then(
        value => {
          resolve(value)
        },
        reason => {
          reject(reason)
        }
      )
    })
  })
}

// ES2020 add
// 只有等到参数数组的所有 Promise 对象都发生状态变更（不管是fulfilled还是rejected），
// 返回的 Promise 对象才会发生状态变更
MyPromise.allSettled = function (promises) {
  const P = this.constructor
  if (promises.length === 0) return P.resolve([])

  const _promises = promises.map(item =>
    item instanceof P ? item : P.resolve(item)
  )

  return new MyPromise((resolve, reject) => {
    const result = []
    let unSettledPromiseCount = _promises.length

    _promises.forEach((promise, index) => {
      promise.then(
        value => {
          result[index] = {
            status: 'fulfilled',
            value,
          }

          unSettledPromiseCount -= 1

          // resolve after all are settled
          if (unSettledPromiseCount === 0) {
            resolve(result)
          }
        },
        reason => {
          result[index] = {
            status: 'rejected',
            reason,
          }

          unSettledPromiseCount -= 1

          // resolve after all are settled
          if (unSettledPromiseCount === 0) {
            resolve(result)
          }
        }
      )
    })
  })
}

// ES2021 add
// 只要有一个变 fulfilled,就会变 fulfilled
// 所有的都 rejected, 才会 rejected
MyPromise.any = function (promises) {
  let index = 0
  if (promises.length === 0) return
  return new MyPromise((resolve, reject) => {
    promises.forEach((promise, i) => {
      Promise.resolve(promise).then(
        value => {
          resolve(value)
        },
        reason => {
          index++
          if (index === promises.length) {
            reject(new AggregateError('all promises were rejected'))
          }
        }
      )
    })
  })
}

MyPromise.resolve = function (value) {
  if (value instanceof MyPromise) {
    return value
  }
  return new MyPromise(resolve => resolve(value))
}

MyPromise.reject = function (reason) {
  return new MyPromise((resolve, reject) => reject(reason))
}

MyPromise.try = function () {}

// test
MyPromise.resolve()
  .then(() => {
    console.log(0)
    return MyPromise.resolve(4)
  })
  .then(res => {
    console.log(res)
  })

MyPromise.resolve()
  .then(() => {
    console.log(1)
  })
  .then(() => {
    console.log(2)
  })
  .then(() => {
    console.log(3)
  })
  .then(() => {
    console.log(5)
  })
  .then(() => {
    console.log(6)
  })
```

---


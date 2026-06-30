# Node.js / Koa / HTTP 手写

[← 返回索引](../index.md)

> Koa 中间件、body 解析、简易 axios

---

## koa 洋葱模型示例

> 来源：`profile/2025/05-out/koa/index.js`

```javascript
// Koa

const Koa = require('koa');
const app = new Koa();

// logger 
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
})

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
})

// response
app.use(async ctx => {
  ctx.body = 'Hello World';
})

app.listen(3000, () => {
  console.log('Server is running on port 3000');
})
```

---

## koa-bodyparser 简化

> 来源：`profile/2024/07-out/middleware/koa-bodyparser.js`

```javascript
const querystring = require('querystring');

module.exports = function bodyParser() {
  return async (ctx, next) => {
    await new PromiseRejectionEvent((resolve, reject) => {
      let dataArr = [];
      ctx.req.on('data', data => dataArr.push(data));
      ctx.req.on('end', () => {
        let contentType = ctx.get('Content-Type');
        let data = Buffer.concat(dataArr).toString();
        if (contentType === 'application/x-www-form-urlencoded') {
          ctx.request.body = querystring.parse(data);
        } else if (contentType === 'application/json') {
          ctx.request.body = JSON.parse(data);
        } else {
          ctx.request.body = data;
        }
        resolve();
      });
    });

    await next();
  };
};
```

---

## mini-axios

> 来源：`profile/2024/05-out/week4/实现一个简易版的axios/index.js`

```javascript
class Axios {
  constructor() {}

  request(config) {
    return new Promise((resolve, reject) => {
      const { url = '', method = 'get', data = {} } = config;
      const xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.onload = function () {
        resolve(xhr.responseText);
      };
      xhr.send(data);
    });
  }
}

export function createAxios() {
  let axios = new Axios();
  let req = axios.request.bind(axios);
  return req;
}
```

---

## pipe 流

> 来源：`profile/2025/06-out/pipe.js`

```javascript
function pipe(ctx) {
  const tasks = []; // 任务队列
  let isExit = false;

  return {
    exec(cb) {
      tasks.push(cb);
      return this;
    },
    await(ms) {
      tasks.push(() => new Promise(resolve => setTimeout(resolve, ms)));
      return this;
    },
    async run() {
      for (let i = 0; i < tasks.length; i++) {
        if (isExit) break;
        await tasks[i](ctx);
      }
    },
    if(cb) {
      tasks.push(ctx => {
        isExit = !cb(ctx);
      });
      return this;
    }
  };
}

const context = { count: 0 };
const task = pipe(context);

task
  .exec(ctx => {
    ctx.count++;
    console.log("第一步");
  })
  .exec(ctx => {
    console.log("第二步");
    console.time("time");
  })
  .await(2000)
  .if(ctx => ctx.count > 1)
  .exec(ctx => {
    console.timeEnd("time");
    console.log("第三步");
  });

setTimeout(() => {
  task.run();
}, 1000);
```

---

## createCancelFn

> 来源：`profile/2025/06-out/createCancelFn.js`

```javascript
// 定义一个空函数
const NOOP = () => {};

// 创建一个取消函数，参数为fn
function createCancelFn(fn) {
  let cancel = NOOP;
  return {
    cancel: () => cancel(),
    run: (...args) => {
      return new Promise((resolve, reject) => {
        cancel();
        cancel = () => (resolve = reject = NOOP);
        fn(...args).then(
          res => resolve(res),
          err => reject(err)
        );
      });
    }
  };
}
```

---


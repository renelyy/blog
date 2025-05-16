# 场景题目实现

## 并发图片上传

::: code-group

```js [并发图片上传]
// 并发图片上传
// 限制最大并发数
// 如果有一个上传成功，则补位上传
const list = [
  "https://1.png",
  "https://2.png",
  "https://3.png",
  "https://4.png",
  "https://5.png",
  "https://6.png",
  "https://7.png",
  "https://8.png",
  "https://9.png",
  "https://10.png"
];

// 模拟上传
function upload(url) {
  console.log(`开始上传 ${url}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`上传 ${url} 成功`);
      resolve(url);
    }, Math.random() * 1000);
  });
}

// 补充间隔，100ms 上传下一张
function uploadAll(urls, limit = 3, interval = 100) {
  const len = urls.length;
  let index = 0;
  const result = new Map();

  return new Promise((resolve, reject) => {
    function __startUpload() {
      if (index === len) {
        resolve(result);
        return;
      }
      const url = urls[index];
      index++;
      upload(url)
        .then(res => {
          result.set(url, res);
          // 成功后 间隔 interval 毫秒上传下一张
          setTimeout(__startUpload, interval);
        })
        .catch(err => {
          reject(err);
        });
    }

    // 初次并发上传 limit 张
    while (index < limit && index < len) {
      __startUpload();
    }
  });
}

uploadAll(list, 3).then(res => {
  console.log(res);
});
```

```js [并发图片上传-优化和重试机制]
const list = [
  "https://1.png",
  "https://2.png",
  "https://3.png",
  "https://4.png",
  "https://5.png",
  "https://6.png",
  "https://7.png",
  "https://8.png",
  "https://9.png",
  "https://10.png"
];

// 模拟上传（随机失败）
function upload(url) {
  console.log(`开始上传 ${url}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const isSuccess = Math.random() > 0.8; // 80% 概率失败
      if (isSuccess) {
        console.log(`上传成功 ${url}`);
        resolve(url);
      } else {
        console.log(`上传失败 ${url}`);
        reject(new Error(`上传失败 ${url}`));
      }
    }, Math.random() * 1000);
  });
}

/**
 * 并发上传控制器
 * @param {string[]} urls 要上传的URL列表
 * @param {number} limit 最大并发数
 * @param {number} maxRetries 单个任务最大重试次数
 * @param {number} retryDelay 重试延迟（毫秒）
 * @param {function} onProgress 进度回调（可选）
 */
async function uploadAll({
  urls,
  limit = 3,
  maxRetries = 2,
  retryDelay = 500,
  onProgress
}) {
  console.log("开始上传任务");
  const result = new Array(urls.length); // 预分配空间
  let completed = 0;
  let currentIndex = 0;
  const activeTasks = new Set();

  // 执行单个任务（含重试）
  async function runTask(url, index) {
    let retries = 0;

    while (retries <= maxRetries) {
      try {
        const res = await upload(url);
        result[index] = res;
        return res;
      } catch (err) {
        retries++;
        if (retries <= maxRetries) {
          console.warn(`第 ${retries} 次重试 ${url}`);
          await new Promise(r => setTimeout(r, retryDelay));
        } else {
          result[index] = { error: err.message };
          throw err;
        }
      }
    }
  }

  // 添加新任务
  function addTask() {
    if (currentIndex >= urls.length) return null;

    const url = urls[currentIndex];
    const index = currentIndex;
    currentIndex++;

    const task = runTask(url, index).finally(() => {
      activeTasks.delete(task);
      completed++;
      onProgress?.({ completed, total: urls.length });
    });

    activeTasks.add(task);
    return task;
  }

  // 初始填充任务
  while (activeTasks.size < limit && currentIndex < urls.length) {
    addTask();
  }

  // 主调度循环
  while (activeTasks.size > 0) {
    try {
      await Promise.race(activeTasks);
    } catch (e) {
      // 忽略单个任务的错误（已在runTask中处理）
    }

    // 补充新任务
    while (activeTasks.size < limit && currentIndex < urls.length) {
      addTask();
    }
  }

  return result;
}

// 使用示例
uploadAll({
  urls: list,
  limit: 3,
  maxRetries: 2,
  onProgress: ({ completed, total }) => {
    console.log(`进度: ${completed}/${total}`);
  }
})
  .then(res => {
    console.log("最终结果:", res);
  })
  .catch(err => {
    console.error("全局错误:", err);
  });
```

```js [并发图片上传-优化和重试机制-指数退避]
const list = [
  "https://1.png",
  "https://2.png",
  "https://3.png",
  "https://4.png",
  "https://5.png",
  "https://6.png",
  "https://7.png",
  "https://8.png",
  "https://9.png",
  "https://10.png"
];

// 模拟上传（设置高失败率便于测试）
function upload(url) {
  console.log(`开始上传 ${url}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const isSuccess = Math.random() > 0.8; // 80% 概率失败
      if (isSuccess) {
        console.log(`✅ 上传成功 ${url}`);
        resolve(url);
      } else {
        console.log(`❌ 上传失败 ${url}`);
        reject(new Error(`上传失败 ${url}`));
      }
    }, Math.random() * 1000);
  });
}

/**
 * 并发上传控制器（完整版）
 * @param {string[]} urls 要上传的URL列表
 * @param {number} limit 最大并发数
 * @param {number} maxRetries 单个任务最大重试次数
 * @param {number} retryDelay 重试延迟（毫秒）
 * @param {function} onProgress 进度回调（可选）
 */
async function uploadAll({
  urls,
  limit = 3,
  maxRetries = 2,
  retryDelay = 500,
  onProgress
}) {
  console.log("🚀 开始上传任务，总数:", urls.length);
  const result = new Array(urls.length); // 预分配结果数组
  const taskQueue = []; // 待处理任务队列
  const activeTasks = new Set(); // 活动任务集合
  let completedCount = 0; // 已完成计数
  let retryMap = new Map(); // 记录每个URL的重试次数

  // 初始化任务队列
  urls.forEach((url, index) => {
    taskQueue.push({ url, index, retryCount: 0 });
  });

  // 工作线程函数
  async function worker() {
    while (taskQueue.length > 0 || activeTasks.size > 0) {
      // 获取新任务（考虑重试）
      const task = getNextTask();
      if (!task) {
        await new Promise(r => setTimeout(r, 100));
        continue;
      }

      const { url, index } = task;
      activeTasks.add(task);

      try {
        console.log(`▶️ 开始处理 ${url}`);
        const res = await upload(url);
        result[index] = res;
        completedCount++;
        onProgress?.({ completed: completedCount, total: urls.length });
      } catch (error) {
        const currentRetry = retryMap.get(url) || 0;
        if (currentRetry < maxRetries) {
          const newRetryCount = currentRetry + 1;
          retryMap.set(url, newRetryCount);
          console.log(`🔄 排队重试 ${url} (${newRetryCount}/${maxRetries})`);
          taskQueue.push({
            url,
            index,
            retryCount: newRetryCount,
            delay: retryDelay * newRetryCount // 指数退避
          });
        } else {
          result[index] = { error: error.message };
          completedCount++;
          onProgress?.({ completed: completedCount, total: urls.length });
          console.log(`⛔ 放弃 ${url} (超过最大重试次数)`);
        }
      } finally {
        activeTasks.delete(task);
      }
    }
  }

  // 获取下一个任务（考虑延迟）
  function getNextTask() {
    const now = Date.now();
    for (let i = 0; i < taskQueue.length; i++) {
      const task = taskQueue[i];
      if (!task.delay || task.delay <= now) {
        return taskQueue.splice(i, 1)[0];
      }
    }
    return null;
  }

  // 启动工作线程
  const workers = Array(Math.min(limit, urls.length)).fill(null).map(worker);
  await Promise.all(workers);

  return result;
}

// 使用示例
uploadAll({
  urls: list,
  limit: 3,
  maxRetries: 2,
  retryDelay: 500,
  onProgress: ({ completed, total }) => {
    console.log(
      `📊 进度: ${completed}/${total} (${((completed / total) * 100).toFixed(
        1
      )}%)`
    );
  }
})
  .then(res => {
    console.log("🎉 最终结果:", res);
    console.log("成功:", res.filter(r => typeof r === "string").length);
    console.log("失败:", res.filter(r => r && r.error).length);
  })
  .catch(err => {
    console.error("💥 全局错误:", err);
  });
```

:::

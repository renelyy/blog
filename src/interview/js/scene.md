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

## 将原生 ajax 封装为 Promise

```js
/**
 * 将原生AJAX封装为Promise
 * @param {string} method - HTTP方法 (GET, POST, PUT, DELETE等)
 * @param {string} url - 请求URL
 * @param {*} [data=null] - 请求数据
 * @param {Object} [headers={}] - 请求头
 * @param {string} [responseType=''] - 响应类型 (如 'json', 'text', 'blob'等)
 * @returns {Promise} 返回Promise对象
 */
function ajax({
  method = "GET",
  url,
  data = null,
  headers = {},
  responseType = ""
}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open(method, url);

    // 设置响应类型
    if (responseType) {
      xhr.responseType = responseType;
    }

    // 设置请求头
    Object.keys(headers).forEach(key => {
      xhr.setRequestHeader(key, headers[key]);
    });

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // 根据响应类型返回相应数据
        let responseData;
        try {
          responseData =
            responseType === "json" ? xhr.response : xhr.responseText;

          // 如果是JSON字符串但未设置responseType，尝试解析
          if (
            !responseType &&
            xhr.getResponseHeader("Content-Type")?.includes("application/json")
          ) {
            responseData = JSON.parse(responseData);
          }
        } catch (e) {
          reject(new Error("Failed to parse response data"));
          return;
        }

        resolve({
          data: responseData,
          status: xhr.status,
          statusText: xhr.statusText,
          headers: xhr.getAllResponseHeaders(),
          xhr: xhr
        });
      } else {
        reject(
          new Error(
            `Request failed with status ${xhr.status}: ${xhr.statusText}`
          )
        );
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error occurred"));
    };

    xhr.ontimeout = () => {
      reject(new Error("Request timeout"));
    };

    // 处理请求数据
    let requestData = data;
    if (data && typeof data === "object" && !(data instanceof FormData)) {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
      if (headers["Content-Type"].includes("application/json")) {
        requestData = JSON.stringify(data);
      } else if (
        headers["Content-Type"].includes("application/x-www-form-urlencoded")
      ) {
        requestData = new URLSearchParams(data).toString();
      }
    }

    xhr.send(requestData);
  });
}
```

## 实现图片下载功能

::: code-group

```js [纯前端实现]
/**
 * 实现图片下载
 * 方案一：纯前端实现（适用于同源图片或已有跨域权限的图片）
 * @param {string} url 图片地址
 * @param {string} filename 下载的文件名
 */
function downloadImage(url, filename) {
  fetch(url, {
    mode: "cors" // 如果图片在不同源，需要设置cors
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.blob();
    })
    .then(blob => {
      // 创建 blob URL
      const blobUrl = window.URL.createObjectURL(blob);

      // 创建下载链接
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download =
        filename.endsWith(".jpg") || filename.endsWith(".png")
          ? filename
          : `${filename}.jpg`;

      // 触发下载
      document.body.appendChild(a);
      a.click();

      // 清理
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    })
    .catch(error => {
      console.log("下载失败:", error);
      // 备用方案：直接打开图片在新窗口
      window.open(url, "_blank");
    });
}
```

```js [Canvas 方案]
/**
 * 方案二：Canvas 方案（适用于要处理图片的情况）
 */
function downloadImageWithCanvas(url, filename) {
  const img = new Image();
  img.crossOrigin = "Anonymous"; // 跨域图片需要设置
  img.src = url;
  img.onload = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      // 转化为 blob
      canvas.toBlob(blob => {
        // 创建 blob URL
        const blobUrl = window.URL.createObjectURL(blob);

        // 创建下载链接
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download =
          filename.endsWith(".jpg") || filename.endsWith(".png")
            ? filename
            : `${filename}.jpg`;

        // 触发下载
        document.body.appendChild(a);
        a.click();

        // 清理
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      });
    } catch (error) {
      console.error("Canvas 处理失败:", error);
      window.open(url, "_blank");
    }
  };

  img.onerror = () => {
    console.error("图片加载失败");
    window.open(url, "_blank");
  };
}
```

```js [后端配合方案]
/**
 * 方案三：后端配合实现（适用于需要跨域权限等复杂场景）
 */
function downloadImageWithServer(url, filename) {
  // 先获取有权限的下载 URL
  fetch("/api/get-download-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer your-token"
    },
    body: JSON.stringify({
      url
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(data => {
      // 后端返回的临时下载地址
      const downloadUrl = data.downloadUrl;
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    })
    .catch(error => {
      console.log("下载失败:", error);
    });
}
```

```js [base64 下载]
function downloadBase64Image(base64, filename = "download") {
  const extension = base64.match(/^data:image\/(\w+);base64,/);
  const ext = extension ? extension[1] : "png";

  const a = document.createElement("a");
  a.href = base64;
  a.download = filename.endsWith(`.${ext}`) ? filename : `${filename}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
```

:::

## 实现前端添加水印

::: code-group

```js [CSS 背景水印]
/**
 * 方案一：CSS 背景水印（简单实现）
 * 添加 CSS 水印
 * @param {string} text 水印内容
 * @param {object} options 配置项
 */
function addWatermark(text, options = {}) {
  const {
    container = document.body,
    width = "200px",
    height = "150px",
    fontSize = "16px",
    color = "rgba(180, 180, 180, 0.3)",
    rotate = "-30",
    zIndex = "1000",
    watermarkId
  } = options;

  const watermark = document.createElement("div");
  watermark.className = "watermark";
  if (watermarkId) {
    watermark.id = watermarkId;
  }

  const svgText = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>
                          <text x='50%' y='50%' font-size='${fontSize}' fill='${color}' 
                                transform='rotate(${rotate}, 50, 50)' 
                                text-anchor='middle' dominant-baseline='middle'>
                            ${text}
                          </text>
                        </svg>`;

  watermark.style.position = "fixed";
  watermark.style.top = "0";
  watermark.style.left = "0";
  watermark.style.right = "0";
  watermark.style.bottom = "0";
  watermark.style.pointerEvents = "none";
  watermark.style.backgroundImage = `url("data:image/svg+xml;utf8,${encodeURIComponent(
    svgText
  )}")`;
  watermark.style.zIndex = zIndex;

  container.style.position = "relative";

  // 防止控制台修改
  Object.defineProperty(watermark.style, "display", {
    set: function (value) {
      if (value === "none") {
        console.warn("水印元素受到保护，无法隐藏");
        return;
      }
      this._display = value;
    },
    get: function () {
      return this._display || "block";
    }
  });

  container.appendChild(watermark);
}
```

```js [Canvas 生成水印]
/**
 * 方案二：使用 Canvas 生成水印
 * @param {string|Array} text 水印文字(可以是多行)
 * @param {object} options 配置选项
 */
function addCanvasWatermark(text, options = {}) {
  const {
    container = document.body,
    width = 300,
    height = 200,
    fontSize = 16,
    color = "rgba(180, 180, 180, 0.3)",
    rotate = -30,
    zIndex = 1000,
    textAlign = "center",
    fontFamily = "sans-serif",
    backgroundRepeat = "repeat",
    watermarkId
  } = options;

  // 创建画布
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // 清除画布
  ctx.clearRect(0, 0, width, height);

  // 设置绘制样式
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = textAlign;
  ctx.textBaseline = "middle";

  // 计算旋转中心点
  const centerX = width / 2;
  const centerY = height / 2;

  // 保存当前画布状态
  ctx.save();

  // 移动到中心点并旋转
  ctx.translate(centerX, centerY);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.translate(-centerX, -centerY);

  // 绘制文本(支持多行)
  const texts = Array.isArray(text) ? text : [text];
  const lineHeight = fontSize * 1.5;

  texts.forEach((t, i) => {
    ctx.fillText(
      t,
      centerX,
      centerY + i * lineHeight - ((texts.length - 1) * lineHeight) / 2
    );
  });

  // 恢复画布状态
  ctx.restore();

  // 创建水印元素
  const watermark = document.createElement("div");
  watermark.className = "watermark";
  Object.assign(watermark.style, {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    pointerEvents: "none",
    backgroundImage: `url(${canvas.toDataURL()})`,
    backgroundRepeat: backgroundRepeat,
    zIndex: zIndex,
    watermarkId
  });

  container.style.position = "relative";

  // 防止控制台修改
  Object.defineProperty(watermark.style, "display", {
    set: function (value) {
      if (value === "none") {
        console.warn("水印元素受到保护，无法隐藏");
        return;
      }
      this._display = value;
    },
    get: function () {
      return this._display || "block";
    }
  });

  container.appendChild(watermark);

  return canvas.toDataURL(); // 返回水印数据URL
}
```

```js [防篡改水印（MutationObserver）]
/**
 * 方案三：防篡改水印（使用 MutationObserver 监听 DOM 变化）
 */
function addSecureWatermark(text, options = {}) {
  const { container = document.body, ...restOptions } = options;

  // 创建唯一水印ID
  const watermarkId =
    "secure-watermark-" + Math.random().toString(36).substr(2, 9);

  // 添加初始水印
  const __addWatermark = () => {
    // 检查是否已存在水印
    if (!document.getElementById(watermarkId)) {
      const watermark = addCanvasWatermark(text, {
        ...restOptions,
        watermarkId // 传递水印ID
      });

      // 设置水印元素的ID
      const watermarkElements = container.querySelectorAll(".watermark");
      const latestWatermark = watermarkElements[watermarkElements.length - 1];
      if (latestWatermark) {
        latestWatermark.id = watermarkId;
      }
    }
  };

  __addWatermark();

  // 监听 DOM 变化
  const observer = new MutationObserver(mutations => {
    let watermarkRemoved = false;

    // 检查是否有水印被移除
    mutations.forEach(mutation => {
      mutation.removedNodes.forEach(node => {
        if (
          node.id === watermarkId ||
          (node.classList && node.classList.contains("watermark"))
        ) {
          watermarkRemoved = true;
        }
      });
    });

    // 只有当水印确实被移除时才重新添加
    if (watermarkRemoved && !document.getElementById(watermarkId)) {
      // 使用 requestAnimationFrame 避免频繁操作
      requestAnimationFrame(() => {
        __addWatermark();
      });
    }
  });

  // 配置观察选项（更精确的观察）
  const config = {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  };

  // 开始观察
  observer.observe(container, config);

  // 返回取消观察的函数
  return () => {
    observer.disconnect();
    const watermark = document.getElementById(watermarkId);
    if (watermark) {
      watermark.remove();
    }
  };
}
```

:::

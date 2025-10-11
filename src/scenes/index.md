# 场景题

## HTML & CSS

### 实现前端添加水印

```js
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

    console.log(mutations);

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

// 使用示例
const res = addSecureWatermark("机密文档 禁止外传", {
  rotate: -30, // 使用数值而不是字符串
  color: "rgba(255, 0, 0, 0.2)",
  fontSize: 20, // 使用数值而不是字符串
  width: 200, // 调整水印单元大小
  height: 150,
  backgroundRepeat: "repeat" // 确保平铺
});
```

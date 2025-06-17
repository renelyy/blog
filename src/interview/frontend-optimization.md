# 前端性能优化

## 计算白屏时间

[掘金链接](https://juejin.cn/post/7475652009103032358)

::: code-group

```html [基于时间戳]
<!-- 在HTML文档的<head>标签中插入JavaScript代码，记录页面开始加载的时间戳。然后在
  <head>标签解析完成后，记录另一个时间戳。两者的差值即为白屏时间。 -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>白屏时间计算</title>
    <script>
      // 记录页面开始加载的时间
      window.pageStartTime = Date.now();
    </script>
    <link
      rel="stylesheet"
      href="https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-assets/ionicons/2.0.1/css/ionicons.min.css~tplv-t2oaga2asx-image.image"
    />
    <link
      rel="stylesheet"
      href="https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-assets/asset/fw-icon/1.0.9/iconfont.css~tplv-t2oaga2asx-image.image"
    />

    <script>
      // head 解析完成后，记录时间
      window.firstPaint = Date.now();
      console.log(`白屏时间：${firstPaint - pageStartTime}ms`);
    </script>
  </head>
  <body>
    <div class="container"></div>
  </body>
</html>
```

```js [基于 DOMContentLoaded 事件]
// 白屏时间
// 1. 获取页面加载开始时间
const performance = window.performance;
const timing = performance.timing;
const startTime = timing.navigationStart;
// 2. 获取页面加载结束时间
const endTime = timing.domContentLoadedEventEnd;
// 3. 计算白屏时间
const whiteScreenTime = endTime - startTime;
console.log(`白屏时间：${whiteScreenTime}ms`);
```

```js [基于Performance API]
// 性能 观察器   观察者模式
const observer = new PerformanceObserver(list => {
  // 获取所有的 性能 指标
  const entries = list.getEntries();
  for (const entry of entries) {
    // body 里的第一个 标签的渲染
    // 'first-paint' 表示页面首次开始绘制的时间点，也就是白屏结束的时间点
    if (entry.name === "first-paint") {
      const whiteScreenTime = entry.startTime;
      console.log(`白屏时间：${whiteScreenTime}ms`);
    }
  }
});
// 首次绘制  first-paint
// 首次内容绘制  first-contentful-paint 事件
// observe 监听性能指标
// buffered 属性设置为 true，表示包含性能时间线缓冲区中已经记录的相关事件
// 这样即使在创建 PerformanceObserver 之前事件已经发生，也能被捕获到
observer.observe({ type: "paint", buffered: true });
```

:::

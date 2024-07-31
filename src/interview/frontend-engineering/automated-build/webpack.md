# Webpack 常见的面试题

## 1. 说说你对 webpack 的理解？解决了什么问题？

## 1. Webpack 如何将一些通用的依赖打包成一个独立的 bundle

## 2. 说说 webpack 的热更新是如何做到的？原理是什么？

## 3. 说说 webpack 的构建流程？

## 4. 说说 webpack proxy 工作原理？为什么能解决跨域？

## 5. 说说 webpack 中常见的 loader？解决了什么问题？

## 6. 说说 webpack 中常见的 plugin？解决了什么问题？

## 7. 说说 loader 和 plugin 的区别？编写 loader，plugin 的思路？

## 8. 如何提高 webpack 的构建速度？

## 9. 说说如何借助 webpack 来优化前端性能？

## 10. 与 webpack 类似的工具还有哪些？区别？

## 11. 要将通用的依赖打包成一个独立的 bundle，可以在 `webpack.config.js` 中配置 `splitChunks` 插件。具体配置如下：

```js
module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};
```

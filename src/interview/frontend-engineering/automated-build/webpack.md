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

## 12. 配置代码太多，达到数千⾏，这个时候该如何优化配置代码【热度: 186】

## 13. 你⽤过哪些可以提⾼效率的插件？【热度:179】

## 14. ts 编写的库 ， 在使⽤ webpack 构建的时候，如何对外提供 d.ts【热度: 224】

## 15. 如何提取复⽤代码给多个 entry 使⽤？ 【热度:292】

## 16. 如何将⼀些通⽤的依赖打包成⼀个独⽴的 bundle【热度: 643】

## 17. output 配置⾥⾯ ， chunkFilename 和 filename 区别是什么？【热度: 210】

## 18. 多⼊⼝打包共享模块【热度: 337】

## 19. 如何使⽤ ts 来编写配置⽂件？【热度: 251】

## 20. 内部执⾏原理【热度: 668】

## 21. 为何不⽀持 CMD 模块化【热度: 255】

## 22. ⽀持哪些模块化加载？【热度: 154】

## 23. 的主要配置项有哪些【热度: 766】

## 24. optimize 配置中 ， 分割代码配置 splitChunks 怎么使⽤ 【热度: 546】

## 25. optimize 配置有哪些作⽤ 【热度: 280】

## 26. mode 是做什么⽤？ 【热度: 475】

## 27. 打包时 hash 码是如何⽣成的【热度: 167】

## 28. Webpack 项⽬中通过 script 标签引⼊资源 ，在项⽬中如何处理?【热度: 100】

## 30. web 系统⾥⾯ ， 如何对图⽚进⾏优化？【热度: 789】

## 31. webpack-dev-server 为何不适⽤于线上环境？【热度: 88】

## 32. webpack-dev-server 作⽤是啥？【热度:387】

## 35. 有哪些优化项⽬的⼿段？【热度: 1,163】

## 36. 全⾯了解 tree shaking

## 37. 在你的项⽬中 ， 使⽤过哪些 webpack loader, 说⼀下他们的作⽤

## 38. 在 webpack 中 ，通常⽤于 css 提取的⼯具是什么？【热度: 69】

## 39. webpack tree-shaking 在什么情况下会失效？【热度:71】

1. 使用了动态引入（Dynamic Imports）语法

```js
import('./moduleA').then(module => {
  // 使用 module
});
```

2. 使用了函数式编程的方式，⽐如使⽤了 map、filter、reduce 等⾼阶函数，⽽这些函数很难通
   过静态分析确定代码的执⾏路径，所以可能会导致 tree shaking 失效

```js 8
import { sum } from './sum.js';
import { filter } from 'lodash';

const arr = [1, 2, 3, 4, 5];
const result = filter(arr, item => {
  if (item > 10) {
    // 这块可能永远执行不到，但是无法 tree-shaking
    return sum(item, 1);
  } else {
    return item;
  }
});
```

3. 使用了 webpack 无法识别的模块系统，比如：AMD, CommonJS

   `Tree-Shaking 主要是针对 ES6 模块（ESM）设计的，因为 ESM 支持静态分析，能够在编译时确定哪些代码可以被移除。而 CommonJS 模块（require 和 module.exports）是动态的，Webpack 无法在编译时安全地确定哪些导入是未使用的。因此，如果你的项目中有使用 CommonJS 模块，则 Tree-Shaking 可能无法生效。`

4. 使用了 side effect，模块中含有副作用代码，比如改变全局变量或者改变函数的参数
5. 死代码（Dead Code）和条件代码

```js 4
if (false) {
  // 理论上来说代码块永远不会执行，但是 Webpack 在处理复杂条件时
  // 不一定能够安全地移除这些代码
  doSomething();
}
```

## 40. 浏览器本⾝是不⽀持模块化的, webpack 是如何通过⽂件打包，让浏览器可以读取到前端各个模块的代码的？【热度: 1,153】

## 41. webpack5 Module Federation 了解多少

## 42. source map 了解多少【热度: 396】

## 43. module、chunk 、bundle 的区别 【热度:136】

## 44. 分包的⽅式有哪些？

## 45. externals 作⽤是啥？

## 46. 异步加载原理是啥

## 47. 核⼼库 - tapable 的设计思路与实现原理是什么？

## 48. 构建流程是怎么样的？

## 49. webpack 热更新原理是什么？

## 50. 如果解决重复引⽤ node_modules ⾥⾯的不同版本的包

## 51. 是如何实现 treeShaking 的

## 52. loader 和 plugin 有啥区别

## 53. webpack 是如何给 web 应⽤注⼊环境变量的，原理是啥

## 和 Vite 的对比

### 1. 为什么 Vite 速度⽐ Webpack 快？【热度: 382】

1. 开发模式的差异
2. Vite 对 ES Modules 的支持
3. 底层语言的差异
4. 热更新的处理

### 2. Vite 和 Webpack 在热更新上有啥区别？【热度: 530】

### 3. Webpack vs Vite 的核⼼差异【热度: 620】

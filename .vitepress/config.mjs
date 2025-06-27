import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: '技术文档汇总',
  description: '技术文档',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '前端技术', link: '/html' },
      { text: '后端技术', link: '/bkts' }
    ],
    outline: 'deep',
    sidebar: [
      {
        text: '前端技术',
        collapsed: true,
        items: [
          { text: 'HTML', link: 'https://developer.mozilla.org/zh-CN/docs/Web/HTML' },
          { text: 'CSS', link: 'https://developer.mozilla.org/zh-CN/docs/Web/CSS' },
          { text: 'JS', link: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript' }
        ]
      },
      {
        text: '后端技术',
        link: '/bkts'
      },
      {
        text: '数据结构与算法',
        items: [
          {
            text: 'Leetcode 刷题',
            link: '/data-structures-and-algorithms/leetcode',
            collapsed: true,
            items: [
              {
                text: '链表',
                link: '/data-structures-and-algorithms/leetcode/linked-list'
              },
              {
                text: '二叉树',
                link: '/data-structures-and-algorithms/leetcode/binary-tree'
              },
              {
                text: '二分查找',
                link: '/data-structures-and-algorithms/leetcode/binary-search'
              },
              {
                text: '动态规划',
                link: '/data-structures-and-algorithms/leetcode/dynamic-programming'
              },
              {
                text: '贪心算法',
                link: '/data-structures-and-algorithms/leetcode/greedy'
              },
              {
                text: '回溯算法',
                link: '/data-structures-and-algorithms/leetcode/backtracking'
              },
              {
                text: '双指针',
                link: '/data-structures-and-algorithms/leetcode/two-pointers'
              },
              {
                text: '滑动窗口',
                link: '/data-structures-and-algorithms/leetcode/sliding-window'
              },
              {
                text: '栈',
                link: '/data-structures-and-algorithms/leetcode/stack'
              },
              {
                text: '队列',
                link: '/data-structures-and-algorithms/leetcode/queue'
              },
              {
                text: '哈希表',
                link: '/data-structures-and-algorithms/leetcode/hash-table'
              },
              {
                text: '字符串',
                link: '/data-structures-and-algorithms/leetcode/string'
              },
              {
                text: '数组',
                link: '/data-structures-and-algorithms/leetcode/array'
              },
              {
                text: '数学',
                link: '/data-structures-and-algorithms/leetcode/math'
              }
            ]
          },
          {
            text: '剑指 Offer 刷题',
            link: '/data-structures-and-algorithms/offer',
          },
          {
            text: '腾讯精选练习 50 题',
            link: '/data-structures-and-algorithms/tencent50'
          },
          {
            text: '牛客刷题',
            link: '/data-structures-and-algorithms/nowcoder'
          },
          {
            text: '常用技巧',
            link: '/data-structures-and-algorithms/tricks',
          },
          {
            text: '常用数据结构封装',
            link: '/data-structures-and-algorithms/data-structures',
          }
        ]
      },
      {
        text: '设计模式',
        link: '/design-patterns',
        collapsed: true,
        items: [
          { text: '单例模式', link: '/design-patterns/singleton' },
          { text: '工厂模式', link: '/design-patterns/factory' },
          { text: '观察者模式', link: '/design-patterns/observer' },
          { text: '发布订阅模式', link: '/design-patterns/publish-subscribe' },
          { text: '策略模式', link: '/design-patterns/strategy' },
          { text: '装饰器模式', link: '/design-patterns/decorator' },
          { text: '代理模式', link: '/design-patterns/proxy' },
          { text: '适配器模式', link: '/design-patterns/adapter' },
          { text: '外观模式', link: '/design-patterns/facade' },
          { text: '组合模式', link: '/design-patterns/composite' },
          { text: '享元模式', link: '/design-patterns/flyweight' },
          { text: '命令模式', link: '/design-patterns/command' },
          { text: '模版方法模式', link: '/design-patterns/template-method' },
          { text: '迭代器模式', link: '/design-patterns/iterator' },
          { text: '状态模式', link: '/design-patterns/state' },
          { text: '中介者模式', link: '/design-patterns/mediator' },
          { text: '职责链模式', link: '/design-patterns/chain-of-responsibility' }
        ]
      },
      {
        text: 'Git',
        link: '/git'
      },
      {
        text: '正则',
        link: '/regex'
      },
      // {
      //   text: '读书笔记',
      //   items: [
      //     {
      //       text: '技术类',
      //       link: '/reading-notes/technology',
      //       collapsed: true,
      //       items: [
      //         {
      //           text: '《JavaScript 高级程序设计（第4版本）》',
      //           link: '/reading-notes/technology/javascript'
      //         }
      //       ]
      //     },
      //     {
      //       text: '文学类',
      //       link: '/reading-notes/literature',
      //       collapsed: true,
      //       items: [
      //         {
      //           text: '《活着》',
      //           link: '/reading-notes/literature/living'
      //         }
      //       ]
      //     }
      //   ]
      // },
      {
        text: '面试',
        items: [
          {
            text: '面试题目汇总',
            collapsed: true,
            items: [
              { text: 'HTML', link: '/interview/html' },
              {
                text: 'CSS',
                collapsed: true,
                items: [
                  { text: '常见面试题', link: '/interview/css' },
                  {
                    text: 'Flex 布局',
                    link: 'https://www.ruanyifeng.com/blog/2015/07/flex-grammar.html'
                  },
                  {
                    text: 'Grid 布局',
                    link: 'https://www.ruanyifeng.com/blog/2019/03/grid-layout-tutorial.html'
                  }
                ]
              },
              {
                text: 'JavaScript',
                collapsed: true,
                items: [
                  { text: '常见面试题', link: '/interview/js/index' },
                  {
                    text: 'JavaScript 手写题',
                    collapsed: true,
                    items: [
                      { text: 'Array 篇', link: '/interview/js/array' },
                      { text: 'Object 篇', link: '/interview/js/object' },
                      { text: 'Promise 篇', link: '/interview/js/promise' },
                      { text: 'Fucntion 篇', link: '/interview/js/function' },
                      { text: '场景题', link: '/interview/js/scene' },
                      { text: '其他', link: '/interview/js/other' },
                      { text: '高频算法', link: '/interview/js/algorithm' },
                    ]
                  }
                ]
              },
              {
                text: 'Vue',
                collapsed: true,
                items: [
                  { text: 'Vue2', link: '/interview/vue/2' },
                  { text: 'Vue3', link: '/interview/vue/3' }
                ]
              },
              {
                text: '前端工程化',
                link: '/interview/frontend-engineering',
                collapsed: true,
                items: [
                  {
                    text: '自动化构建',
                    collapsed: true,
                    items: [
                      {
                        text: 'Webpack',
                        link: '/interview/frontend-engineering/automated-build/webpack'
                      },
                      {
                        text: 'Vite',
                        link: '/interview/frontend-engineering/automated-build/vite'
                      }
                    ]
                  },
                  {
                    text: '包管理',
                    link: '/interview/frontend-engineering/package-management'
                  },
                  {
                    text: '自动化测试',
                    link: '/interview/frontend-engineering/automated-testing'
                  },
                  {
                    text: '持续集成/持续部署（CI/CD）',
                    link: '/interview/frontend-engineering/CI-CD'
                  },
                  {
                    text: '代码质量',
                    link: '/interview/frontend-engineering/code-quality'
                  },
                  {
                    text: '版本控制',
                    link: '/interview/frontend-engineering/version-control'
                  },
                  {
                    text: '文档和规范',
                    link: '/interview/frontend-engineering/documentation-and-specification'
                  },
                  {
                    text: '性能优化',
                    link: '/interview/frontend-engineering/performance-optimization'
                  },
                  {
                    text: '模块化开发和组件化开发',
                    link: '/interview/frontend-engineering/modularization-and-componentization'
                  },
                  {
                    text: '前端安全',
                    link: '/interview/frontend-engineering/security'
                  },
                  {
                    text: '监控和日志',
                    link: '/interview/frontend-engineering/monitoring-and-logging'
                  },
                  {
                    text: '部署和发布',
                    link: '/interview/frontend-engineering/deployment-and-release'
                  }
                ]
              },
              {
                text: '前端基建',
                link: '/interview/frontend-infrastructure'
              },
              { text: '浏览器', link: '/interview/browser' },
              { text: 'HTTP', link: '/interview/http' },
              { text: 'Node.js', link: '/interview/node' },
              { text: 'React', link: '/interview/react' },
              { text: 'Typescript', link: '/interview/typescript' },
              { text: '微信小程序', link: '/interview/wechat' },
              {
                text: '前端性能优化',
                link: '/interview/frontend-optimization'
              },
              { text: '微前端', link: '/interview/micro-frontend' },
              { text: '设计模式', link: '/interview/design-pattern' },
              { text: '职业发展', link: '/interview/career' }
            ]
          },
          {
            text: '大厂',
            collapsed: true,
            items: [
              { text: '百度', link: '/interview/company/baidu' },
              { text: '腾讯', link: '/interview/company/tencent' },
              { text: '阿里', link: '/interview/company/alibaba' },
              { text: '字节', link: '/interview/company/bytedance' },
              { text: '京东', link: '/interview/company/jd' },
              { text: '美团', link: '/interview/company/meituan' },
              { text: '滴滴', link: '/interview/company/didichuxing' },
              { text: '华为', link: '/interview/company/huawei' }
            ]
          },
          {
            text: '札记',
            link: '/notes'
          },
          {
            text: 'VIP',
            collapsed: true,
            items: [
              { text: '哲玄面试题', link: 'https://eizwbs2n02l.feishu.cn/docx/FQC8da15PodxC0xxNAsc7OuhnYe' },
            ]
          },
        ]
      }
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/renelyy/blog' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present YY'
    }
  },

  base: '/blog/',
  srcDir: './src',

  markdown: {
    lineNumbers: true,
    // 启用数学方程 需要给项目安装依赖：npm add -D markdown-it-mathjax3
    math: true,
    image: {
      // 默认禁用图片懒加载
      lazyLoading: true
    },
    container: {
      tipLabel: '提示',
      warningLabel: '警告',
      dangerLabel: '危险',
      infoLabel: '信息',
      detailsLabel: '详细信息'
    },
    toc: {
      level: [1, 2, 3],
    }
  },

  // 最近一条内容的更新时间会显示在页面右下角。要启用它，将 lastUpdated 选项添加到配置中。
  lastUpdated: true
});

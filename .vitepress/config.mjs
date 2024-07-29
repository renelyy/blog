import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: '技术文档汇总',
  description: '技术文档',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '前端技术', link: '/fets' },
      { text: '后端技术', link: '/bkts' }
    ],

    sidebar: [
      {
        text: '前端技术',
        items: [
          { text: 'HTML', link: '/fets' },
          { text: 'CSS', link: '/api-examples' }
        ]
      },
      {
        text: '后端技术',
        link: '/bkts'
      },
      {
        text: '数据结构与算法',
        items: [{ text: 'Leetcode 刷题', link: '/leetcode' }]
      },
      {
        text: 'Git',
        link: '/git'
      },
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
                      { text: 'Promise 篇', link: '/interview/js/promise' },
                      { text: 'Fucntion 篇', link: '/interview/js/function' }
                    ]
                  }
                ]
              },
              { text: 'Vue2', link: '/vue2' },
              { text: 'Vue3', link: '/vue3' },
              { text: 'Webpack', link: '/webpack' },
              { text: 'Vite', link: '/vite' },
              { text: '浏览器', link: '/browser' },
              { text: 'HTTP', link: '/http' },
              { text: 'Node.js', link: '/node' },
              { text: 'React', link: '/react' },
              { text: 'Typescript', link: '/typescript' }
            ]
          },
          { text: '百度', link: '/baidu' },
          { text: '腾讯', link: '/tencent' },
          { text: '阿里', link: '/alibaba' },
          { text: '字节', link: '/bytedance' },
          { text: '京东', link: '/jd' },
          { text: '美团', link: '/meituan' },
          { text: '滴滴', link: '/didichuxing' },
          { text: '华为', link: '/huawei' }
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
    }
  },

  // 最近一条内容的更新时间会显示在页面右下角。要启用它，将 lastUpdated 选项添加到配置中。
  lastUpdated: true
});

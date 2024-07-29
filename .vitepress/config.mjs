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
            items: [
              {
                text: 'JS 手写题',
                items: [
                  { text: 'Array 篇', link: '/interview/js/array' },
                  { text: 'Promise 篇', link: '/interview/js/promise' },
                  { text: 'Fucntion 篇', link: '/interview/js/function' }
                ]
              }
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

    socialLinks: [{ icon: 'github', link: 'https://github.com/renelyy/blog' }]
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
    }
  }
});

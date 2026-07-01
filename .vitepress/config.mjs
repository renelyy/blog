import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "技术文档汇总",
  description: "技术文档",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/logo.png",
    nav: [
      { text: "首页", link: "/" },
      { text: "前端技术", link: "/html" },
      { text: "后端技术", link: "/bkts" }
    ],
    outline: "deep",
    sidebar: [
      {
        text: "前端技术",
        collapsed: true,
        items: [
          {
            text: "HTML",
            link: "https://developer.mozilla.org/zh-CN/docs/Web/HTML"
          },
          {
            text: "CSS",
            link: "https://developer.mozilla.org/zh-CN/docs/Web/CSS"
          },
          {
            text: "JS",
            link: "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript"
          },
          { text: "React", link: "/react" },
          { text: "ES6", link: "/es6" }
        ]
      },
      {
        text: "后端技术",
        link: "/backend",
        collapsed: true,
        items: [
          { text: "后端首页", link: "/backend" },
          { text: "学习路线图", link: "/backend/roadmap" },
          {
            text: "Core Java",
            link: "/backend/java/core-java",
            collapsed: true,
            items: [
              { text: "Java 入口", link: "/backend/java" },
              { text: "零基础学习路线", link: "/backend/java/learning-roadmap" },
              { text: "指南首页", link: "/backend/java/core-java" },
              { text: "章节覆盖说明", link: "/backend/java/core-java/coverage-map" },
              {
                text: "卷 I 基础",
                collapsed: true,
                items: [
                  { text: "1 Java 概述", link: "/backend/java/core-java/vol1/01-introduction" },
                  { text: "2 编程环境", link: "/backend/java/core-java/vol1/02-environment" },
                  { text: "3 基本程序结构", link: "/backend/java/core-java/vol1/03-fundamentals" },
                  { text: "4 对象与类", link: "/backend/java/core-java/vol1/04-objects-classes" },
                  { text: "5 继承", link: "/backend/java/core-java/vol1/05-inheritance" },
                  { text: "6 接口与 Lambda", link: "/backend/java/core-java/vol1/06-interfaces-lambda" },
                  { text: "7 异常与日志", link: "/backend/java/core-java/vol1/07-exceptions-logging" },
                  { text: "8 泛型", link: "/backend/java/core-java/vol1/08-generics" },
                  { text: "9 集合", link: "/backend/java/core-java/vol1/09-collections" },
                  { text: "12 并发", link: "/backend/java/core-java/vol1/12-concurrency" }
                ]
              },
              {
                text: "卷 II 高级",
                collapsed: true,
                items: [
                  { text: "1 Stream API", link: "/backend/java/core-java/vol2/01-streams" },
                  { text: "2 输入输出", link: "/backend/java/core-java/vol2/02-input-output" },
                  { text: "3 XML", link: "/backend/java/core-java/vol2/03-xml" },
                  { text: "4 网络编程", link: "/backend/java/core-java/vol2/04-networking" },
                  { text: "5 JDBC", link: "/backend/java/core-java/vol2/05-jdbc" },
                  { text: "6 日期与时间", link: "/backend/java/core-java/vol2/06-date-time" },
                  { text: "7 国际化", link: "/backend/java/core-java/vol2/07-i18n" },
                  { text: "8 注解", link: "/backend/java/core-java/vol2/08-annotations" },
                  { text: "9 模块系统", link: "/backend/java/core-java/vol2/09-modules" },
                  { text: "10 安全", link: "/backend/java/core-java/vol2/10-security" }
                ]
              },
              { text: "补充笔记（历史）", link: "/backend/java/index-legacy" }
            ]
          },
          {
            text: "数据库与 SQL",
            link: "/backend/database",
            collapsed: true,
            items: [
              { text: "指南首页", link: "/backend/database" },
              { text: "章节覆盖说明", link: "/backend/database/coverage-map" },
              { text: "1 SQL 基础", link: "/backend/database/01-sql-basics" },
              { text: "2 索引与 EXPLAIN", link: "/backend/database/02-index-and-explain" },
              { text: "3 事务与隔离", link: "/backend/database/03-transaction-isolation" },
              { text: "4 InnoDB 与 MVCC", link: "/backend/database/04-innodb-and-mvcc" },
              { text: "5 慢 SQL 优化", link: "/backend/database/05-slow-query-tuning" },
              { text: "6 读写分离与分库", link: "/backend/database/06-sharding-readwrite" }
            ]
          },
          {
            text: "MyBatis",
            link: "/backend/mybatis",
            collapsed: true,
            items: [
              { text: "指南首页", link: "/backend/mybatis" },
              { text: "官方覆盖说明", link: "/backend/mybatis/coverage-map" },
              { text: "快速上手", link: "/backend/mybatis/01-quick-start" },
              { text: "核心概念", link: "/backend/mybatis/02-core-concepts" },
              { text: "配置详解", link: "/backend/mybatis/03-configuration" },
              { text: "XML 映射基础", link: "/backend/mybatis/04-xml-mapper" },
              { text: "结果映射", link: "/backend/mybatis/05-result-mapping" },
              { text: "动态 SQL", link: "/backend/mybatis/06-dynamic-sql" },
              { text: "Java API", link: "/backend/mybatis/07-java-api" },
              { text: "注解映射", link: "/backend/mybatis/08-annotations" },
              { text: "缓存与日志", link: "/backend/mybatis/09-cache-and-logging" },
              { text: "SQL 构建器", link: "/backend/mybatis/10-sql-builder" },
              { text: "Spring Boot 集成", link: "/backend/mybatis/11-spring-boot" },
              { text: "附录：速查表", link: "/backend/mybatis/appendix-reference" }
            ]
          },
          {
            text: "JPA / Spring Data",
            link: "/backend/jpa",
            collapsed: true,
            items: [
              { text: "指南首页", link: "/backend/jpa" },
              { text: "章节覆盖说明", link: "/backend/jpa/coverage-map" },
              { text: "1 JPA 概览", link: "/backend/jpa/01-jpa-overview" },
              { text: "2 实体映射", link: "/backend/jpa/02-entity-mapping" },
              { text: "3 关联关系", link: "/backend/jpa/03-relationships" },
              { text: "4 JPQL 与查询", link: "/backend/jpa/04-jpql-and-query" },
              { text: "5 Spring Data JPA", link: "/backend/jpa/05-spring-data-jpa" },
              { text: "6 MyBatis vs JPA", link: "/backend/jpa/06-mybatis-vs-jpa" }
            ]
          },
          {
            text: "Spring 生态",
            link: "/backend/spring",
            collapsed: true,
            items: [
              { text: "指南首页", link: "/backend/spring" },
              { text: "官方覆盖说明", link: "/backend/spring/coverage-map" },
              { text: "附录：官方索引", link: "/backend/spring/appendix-spring-reference" },
              {
                text: "Spring Framework",
                collapsed: true,
                items: [
                  { text: "Framework 首页", link: "/backend/spring/framework" },
                  { text: "IoC 与依赖注入", link: "/backend/spring/framework/01-ioc-di" },
                  { text: "AOP", link: "/backend/spring/framework/02-aop" },
                  { text: "Spring MVC / Web", link: "/backend/spring/framework/03-mvc-web" },
                  { text: "数据访问与事务", link: "/backend/spring/framework/04-data-transaction" },
                  { text: "Bean 进阶", link: "/backend/spring/framework/05-bean-advanced" },
                  { text: "校验与数据绑定", link: "/backend/spring/framework/06-validation" },
                  { text: "Spring 测试", link: "/backend/spring/framework/07-testing" },
                  { text: "WebSocket", link: "/backend/spring/framework/08-websocket" },
                  { text: "WebFlux 入门", link: "/backend/spring/framework/09-webflux" },
                  { text: "事件/调度/缓存", link: "/backend/spring/framework/10-integration" }
                ]
              },
              {
                text: "Spring Boot",
                collapsed: true,
                items: [
                  { text: "Boot 首页", link: "/backend/spring/boot" },
                  { text: "快速上手", link: "/backend/spring/boot/01-quick-start" },
                  { text: "自动配置原理", link: "/backend/spring/boot/02-auto-configuration" },
                  { text: "配置与 Profile", link: "/backend/spring/boot/03-configuration" },
                  { text: "Web 与 REST", link: "/backend/spring/boot/04-web-rest" },
                  { text: "数据访问", link: "/backend/spring/boot/05-data-access" },
                  { text: "Actuator 与测试", link: "/backend/spring/boot/06-actuator-test" },
                  { text: "日志与 DevTools", link: "/backend/spring/boot/07-logging-devtools" },
                  { text: "Security 入门", link: "/backend/spring/boot/08-security" },
                  { text: "Redis / NoSQL", link: "/backend/spring/boot/08-nosql-redis" },
                  { text: "Kafka / RabbitMQ", link: "/backend/spring/boot/09-messaging" },
                  { text: "响应式 Web", link: "/backend/spring/boot/09-reactive" },
                  { text: "调度与异步", link: "/backend/spring/boot/10-scheduling-async" },
                  { text: "生产运维", link: "/backend/spring/boot/11-production" },
                  { text: "打包与部署", link: "/backend/spring/boot/12-packaging-deploy" }
                ]
              }
            ]
          },
          {
            text: "API 设计",
            link: "/backend/api-design",
            collapsed: true,
            items: [
              { text: "指南首页", link: "/backend/api-design" },
              { text: "章节覆盖说明", link: "/backend/api-design/coverage-map" },
              { text: "1 REST 原则", link: "/backend/api-design/01-rest-principles" },
              { text: "2 分页与错误码", link: "/backend/api-design/02-pagination-error-codes" },
              { text: "3 OpenAPI", link: "/backend/api-design/03-openapi-versioning" }
            ]
          },
          {
            text: "测试",
            link: "/backend/testing",
            collapsed: true,
            items: [
              { text: "指南首页", link: "/backend/testing" },
              { text: "章节覆盖说明", link: "/backend/testing/coverage-map" },
              { text: "1 JUnit 5", link: "/backend/testing/01-junit5" },
              { text: "2 Mockito", link: "/backend/testing/02-mockito" },
              { text: "3 Spring Test", link: "/backend/testing/03-spring-test" },
              { text: "4 Testcontainers", link: "/backend/testing/04-testcontainers" }
            ]
          },
          {
            text: "Redis",
            link: "/backend/redis",
            collapsed: true,
            items: [
              { text: "指南首页", link: "/backend/redis" },
              { text: "章节覆盖说明", link: "/backend/redis/coverage-map" },
              { text: "1 概览", link: "/backend/redis/01-overview" },
              { text: "2 数据结构", link: "/backend/redis/02-data-structures" },
              { text: "3 缓存模式", link: "/backend/redis/03-cache-patterns" },
              { text: "4 分布式锁", link: "/backend/redis/04-distributed-lock" },
              { text: "5 Spring 集成", link: "/backend/redis/05-spring-redis" }
            ]
          },
          {
            text: "消息队列",
            link: "/backend/messaging",
            collapsed: true,
            items: [
              { text: "指南首页", link: "/backend/messaging" },
              { text: "章节覆盖说明", link: "/backend/messaging/coverage-map" },
              { text: "1 MQ 模型与选型", link: "/backend/messaging/01-mq-overview" },
              { text: "2 Kafka 基础", link: "/backend/messaging/02-kafka-basics" },
              { text: "3 RabbitMQ 基础", link: "/backend/messaging/03-rabbitmq-basics" },
              { text: "4 可靠性设计", link: "/backend/messaging/04-reliability-patterns" },
              { text: "5 Spring 集成", link: "/backend/messaging/05-spring-integration" }
            ]
          },
          {
            text: "安全与鉴权",
            link: "/backend/security",
            collapsed: true,
            items: [
              { text: "指南首页", link: "/backend/security" },
              { text: "章节覆盖说明", link: "/backend/security/coverage-map" },
              { text: "1 Spring Security", link: "/backend/security/01-spring-security-deep" },
              { text: "2 JWT / OAuth2", link: "/backend/security/02-jwt-oauth2" },
              { text: "3 Web 攻击防护", link: "/backend/security/03-web-attacks" },
              { text: "4 数据安全", link: "/backend/security/04-data-security" }
            ]
          },
          {
            text: "分布式系统",
            link: "/backend/distributed",
            collapsed: true,
            items: [
              { text: "指南首页", link: "/backend/distributed" },
              { text: "章节覆盖说明", link: "/backend/distributed/coverage-map" },
              { text: "1 CAP 与一致性", link: "/backend/distributed/01-theory-cap-base" },
              { text: "2 幂等与重试", link: "/backend/distributed/02-idempotency-retry" },
              { text: "3 分布式锁", link: "/backend/distributed/03-distributed-lock" },
              { text: "4 分布式事务", link: "/backend/distributed/04-distributed-transaction" },
              { text: "5 微服务模式", link: "/backend/distributed/05-microservice-patterns" }
            ]
          },
          {
            text: "Spring Cloud（微服务）",
            link: "/backend/spring/cloud",
            collapsed: true,
            items: [
              { text: "Cloud 首页", link: "/backend/spring/cloud" },
              { text: "架构与概念", link: "/backend/spring/cloud/01-overview" },
              { text: "服务注册与发现", link: "/backend/spring/cloud/02-discovery" },
              { text: "配置中心", link: "/backend/spring/cloud/03-config" },
              { text: "API 网关", link: "/backend/spring/cloud/04-gateway" },
              { text: "OpenFeign 与负载均衡", link: "/backend/spring/cloud/05-feign-loadbalancer" },
              { text: "熔断与容错", link: "/backend/spring/cloud/06-circuitbreaker" },
              { text: "Stream 与 Bus", link: "/backend/spring/cloud/07-stream-bus" },
              { text: "Contract 与其它", link: "/backend/spring/cloud/08-contract-function" }
            ]
          },
          {
            text: "JVM 与性能",
            link: "/backend/jvm",
            collapsed: true,
            items: [
              { text: "指南首页", link: "/backend/jvm" },
              { text: "章节覆盖说明", link: "/backend/jvm/coverage-map" },
              { text: "1 内存结构", link: "/backend/jvm/01-memory-model" },
              { text: "2 垃圾回收", link: "/backend/jvm/02-gc-algorithms" },
              { text: "3 调优与 OOM", link: "/backend/jvm/03-tuning-and-oom" },
              { text: "4 Arthas", link: "/backend/jvm/04-arthas-profiler" }
            ]
          },
          {
            text: "可观测性与部署",
            link: "/backend/observability",
            collapsed: true,
            items: [
              { text: "指南首页", link: "/backend/observability" },
              { text: "章节覆盖说明", link: "/backend/observability/coverage-map" },
              { text: "1 日志与 MDC", link: "/backend/observability/01-logging-mdc" },
              { text: "2 链路追踪", link: "/backend/observability/02-tracing" },
              { text: "3 指标监控", link: "/backend/observability/03-metrics-actuator" },
              { text: "4 Docker / K8s", link: "/backend/observability/04-docker-k8s-basics" }
            ]
          },
          {
            text: "设计模式",
            link: "/backend/design-patterns",
            collapsed: true,
            items: [
              { text: "指南首页", link: "/backend/design-patterns" },
              { text: "章节覆盖说明", link: "/backend/design-patterns/coverage-map" },
              { text: "1 创建型", link: "/backend/design-patterns/01-creational" },
              { text: "2 结构型", link: "/backend/design-patterns/02-structural" },
              { text: "3 行为型", link: "/backend/design-patterns/03-behavioral" },
              { text: "4 Spring 中的模式", link: "/backend/design-patterns/04-spring-patterns" }
            ]
          }
        ]
      },
      {
        text: "个人复习库",
        link: "/review",
        collapsed: true,
        items: [
          { text: "复习首页", link: "/review" },
          { text: "Profile 来源索引", link: "/review/profile-source-map" },
          {
            text: "JS 基础",
            collapsed: true,
            items: [
              { text: "对象与继承", link: "/review/js-oop-prototype" },
              { text: "Proxy 与 Vue2", link: "/review/proxy-vue2-notes" },
              { text: "手写题速查", link: "/review/js-handwritten-cookbook" },
              { text: "浏览器与运行时", link: "/review/browser-runtime" }
            ]
          },
          {
            text: "JS 手写题（完整代码）",
            collapsed: true,
            items: [
              { text: "Array 篇", link: "/review/js-handwritten/array-methods" },
              { text: "Function 篇", link: "/review/js-handwritten/function-methods" },
              { text: "Object 篇", link: "/review/js-handwritten/object-methods" },
              { text: "ES6 篇", link: "/review/js-handwritten/es6-methods" },
              { text: "Ajax / JSONP", link: "/review/js-handwritten/ajax-jsonp" },
              { text: "MyPromise", link: "/review/js-handwritten/promise-mypromise" },
              { text: "其他与工具", link: "/review/js-handwritten/misc-utils" }
            ]
          },
          {
            text: "算法",
            collapsed: true,
            items: [
              { text: "算法模式笔记", link: "/review/algorithm-patterns" },
              { text: "排序实现", link: "/review/algorithms/sort-implementations" },
              { text: "二分与 BST", link: "/review/algorithms/search-and-tree" },
              { text: "LeetCode 题解 1", link: "/review/algorithms/leetcode-solutions-1" },
              { text: "LeetCode 题解 2", link: "/review/algorithms/leetcode-solutions-2" },
              { text: "LeetCode 题解 3", link: "/review/algorithms/leetcode-solutions-3" },
              { text: "LeetCode 题解 4", link: "/review/algorithms/leetcode-solutions-4" },
              { text: "LeetCode 题解 5", link: "/review/algorithms/leetcode-solutions-5" },
              { text: "LeetCode 题解 6", link: "/review/algorithms/leetcode-solutions-6" },
              { text: "进阶算法 2024–2025", link: "/review/algorithms/advanced-algorithms-2024-2025" }
            ]
          },
          {
            text: "Vue / TS / Node",
            collapsed: true,
            items: [
              { text: "Vue 响应式 mini", link: "/review/vue/reactivity-implementations" },
              { text: "Vue2 数组劫持", link: "/review/vue/vue2-array-method" },
              { text: "TypeScript 笔记", link: "/review/typescript/notes" },
              { text: "Koa 与 HTTP", link: "/review/node/koa-and-http" }
            ]
          },
          { text: "前端复习路线", link: "/review/frontend-roadmap" }
        ]
      },
      {
        text: "学习随笔记录",
        link: "/learn-notes"
      },
      {
        text: "数据结构与算法",
        items: [
          {
            text: "Leetcode 刷题",
            link: "/data-structures-and-algorithms/leetcode",
            collapsed: true,
            items: [
              {
                text: "链表",
                link: "/data-structures-and-algorithms/leetcode/1.linked-list"
              },
              {
                text: "二叉树",
                link: "/data-structures-and-algorithms/leetcode/2.binary-tree"
              },
              {
                text: "二分查找",
                link: "/data-structures-and-algorithms/leetcode/3.binary-search"
              },
              {
                text: "动态规划",
                link: "/data-structures-and-algorithms/leetcode/4.dynamic-programming"
              },
              {
                text: "贪心算法",
                link: "/data-structures-and-algorithms/leetcode/greedy"
              },
              {
                text: "回溯算法",
                link: "/data-structures-and-algorithms/leetcode/backtracking"
              },
              {
                text: "双指针",
                link: "/data-structures-and-algorithms/leetcode/two-pointers"
              },
              {
                text: "滑动窗口",
                link: "/data-structures-and-algorithms/leetcode/sliding-window"
              },
              {
                text: "栈",
                link: "/data-structures-and-algorithms/leetcode/stack"
              },
              {
                text: "队列",
                link: "/data-structures-and-algorithms/leetcode/queue"
              },
              {
                text: "哈希表",
                link: "/data-structures-and-algorithms/leetcode/hash-table"
              },
              {
                text: "字符串",
                link: "/data-structures-and-algorithms/leetcode/string"
              },
              {
                text: "数组",
                link: "/data-structures-and-algorithms/leetcode/array"
              },
              {
                text: "数学",
                link: "/data-structures-and-algorithms/leetcode/math"
              }
            ]
          },
          {
            text: "船长算法刷题",
            link: "/data-structures-and-algorithms/captain"
          },
          {
            text: "剑指 Offer 刷题",
            link: "/data-structures-and-algorithms/offer"
          },
          {
            text: "腾讯精选练习 50 题",
            link: "/data-structures-and-algorithms/tencent50"
          },
          {
            text: "LeetCode 精选 TOP 面试题",
            link: "/data-structures-and-algorithms/leetcode-top"
          },
          {
            text: "牛客刷题",
            link: "/data-structures-and-algorithms/nowcoder"
          },
          {
            text: "常用技巧",
            link: "/data-structures-and-algorithms/tricks"
          },
          {
            text: "常用数据结构封装",
            link: "/data-structures-and-algorithms/data-structures"
          },
          {
            text: "查找算法",
            link: "/data-structures-and-algorithms/search"
          },
          {
            text: "排序算法",
            link: "/data-structures-and-algorithms/sort"
          }
        ]
      },
      {
        text: "代码片段",
        link: "/code-snippets"
      },
      {
        text: "编程风格",
        link: "/coding-style"
      },
      {
        text: "浏览器",
        link: "/browser"
      },
      {
        text: "场景题",
        link: "/scenes"
      },
      {
        text: "前端工程化",
        link: "/frontend-engineering"
      },
      {
        text: "vim",
        link: "/vim"
      },
      {
        text: "设计模式",
        link: "/design-patterns",
        collapsed: true,
        items: [
          { text: "单例模式", link: "/design-patterns/singleton" },
          { text: "工厂模式", link: "/design-patterns/factory" },
          { text: "观察者模式", link: "/design-patterns/observer" },
          { text: "发布订阅模式", link: "/design-patterns/publish-subscribe" },
          { text: "策略模式", link: "/design-patterns/strategy" },
          { text: "装饰器模式", link: "/design-patterns/decorator" },
          { text: "代理模式", link: "/design-patterns/proxy" },
          { text: "适配器模式", link: "/design-patterns/adapter" },
          { text: "外观模式", link: "/design-patterns/facade" },
          { text: "组合模式", link: "/design-patterns/composite" },
          { text: "享元模式", link: "/design-patterns/flyweight" },
          { text: "命令模式", link: "/design-patterns/command" },
          { text: "模版方法模式", link: "/design-patterns/template-method" },
          { text: "迭代器模式", link: "/design-patterns/iterator" },
          { text: "状态模式", link: "/design-patterns/state" },
          { text: "中介者模式", link: "/design-patterns/mediator" },
          {
            text: "职责链模式",
            link: "/design-patterns/chain-of-responsibility"
          }
        ]
      },
      {
        text: "Git",
        link: "/git"
      },
      {
        text: "正则",
        link: "/regex"
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
        text: "面试",
        items: [
          {
            text: "面试题目汇总",
            collapsed: true,
            items: [
              { text: "HTML", link: "/interview/html" },
              {
                text: "CSS",
                collapsed: true,
                items: [
                  { text: "常见面试题", link: "/interview/css" },
                  {
                    text: "Flex 布局",
                    link: "https://www.ruanyifeng.com/blog/2015/07/flex-grammar.html"
                  },
                  {
                    text: "Grid 布局",
                    link: "https://www.ruanyifeng.com/blog/2019/03/grid-layout-tutorial.html"
                  }
                ]
              },
              {
                text: "JavaScript",
                collapsed: true,
                items: [
                  { text: "常见面试题", link: "/interview/js/index" },
                  {
                    text: "JavaScript 手写题",
                    collapsed: true,
                    items: [
                      { text: "Array 篇", link: "/interview/js/array" },
                      { text: "Object 篇", link: "/interview/js/object" },
                      { text: "Promise 篇", link: "/interview/js/promise" },
                      { text: "Fucntion 篇", link: "/interview/js/function" },
                      { text: "场景题", link: "/interview/js/scene" },
                      { text: "其他", link: "/interview/js/other" },
                      { text: "高频算法", link: "/interview/js/algorithm" }
                    ]
                  }
                ]
              },
              {
                text: "Vue",
                collapsed: true,
                items: [
                  { text: "Vue2", link: "/interview/vue/vue2" },
                  { text: "Vue3", link: "/interview/vue/vue3" }
                ]
              },
              {
                text: "前端工程化",
                link: "/interview/frontend-engineering",
                collapsed: true,
                items: [
                  {
                    text: "自动化构建",
                    collapsed: true,
                    items: [
                      {
                        text: "Webpack",
                        link: "/interview/frontend-engineering/automated-build/webpack"
                      },
                      {
                        text: "Vite",
                        link: "/interview/frontend-engineering/automated-build/vite"
                      }
                    ]
                  },
                  {
                    text: "包管理",
                    link: "/interview/frontend-engineering/package-management"
                  },
                  {
                    text: "自动化测试",
                    link: "/interview/frontend-engineering/automated-testing"
                  },
                  {
                    text: "持续集成/持续部署（CI/CD）",
                    link: "/interview/frontend-engineering/CI-CD"
                  },
                  {
                    text: "代码质量",
                    link: "/interview/frontend-engineering/code-quality"
                  },
                  {
                    text: "版本控制",
                    link: "/interview/frontend-engineering/version-control"
                  },
                  {
                    text: "文档和规范",
                    link: "/interview/frontend-engineering/documentation-and-specification"
                  },
                  {
                    text: "性能优化",
                    link: "/interview/frontend-engineering/performance-optimization"
                  },
                  {
                    text: "模块化开发和组件化开发",
                    link: "/interview/frontend-engineering/modularization-and-componentization"
                  },
                  {
                    text: "前端安全",
                    link: "/interview/frontend-engineering/security"
                  },
                  {
                    text: "监控和日志",
                    link: "/interview/frontend-engineering/monitoring-and-logging"
                  },
                  {
                    text: "部署和发布",
                    link: "/interview/frontend-engineering/deployment-and-release"
                  }
                ]
              },
              {
                text: "前端基建",
                link: "/interview/frontend-infrastructure"
              },
              { text: "浏览器", link: "/interview/browser" },
              { text: "HTTP", link: "/interview/http" },
              { text: "Node.js", link: "/interview/node" },
              {
                text: "Java",
                collapsed: true,
                items: [
                  { text: "常见面试题", link: "/interview/java" }
                ]
              },
              { text: "React", link: "/interview/react" },
              { text: "Typescript", link: "/interview/typescript" },
              { text: "微信小程序", link: "/interview/wechat" },
              {
                text: "前端性能优化",
                link: "/interview/frontend-optimization"
              },
              { text: "微前端", link: "/interview/micro-frontend" },
              { text: "设计模式", link: "/interview/design-pattern" },
              { text: "职业发展", link: "/interview/career" }
            ]
          },
          {
            text: "大厂",
            collapsed: true,
            items: [
              { text: "百度", link: "/interview/company/baidu" },
              { text: "腾讯", link: "/interview/company/tencent" },
              { text: "阿里", link: "/interview/company/alibaba" },
              { text: "字节", link: "/interview/company/bytedance" },
              { text: "京东", link: "/interview/company/jd" },
              { text: "美团", link: "/interview/company/meituan" },
              { text: "滴滴", link: "/interview/company/didichuxing" },
              { text: "华为", link: "/interview/company/huawei" }
            ]
          },
          {
            text: "札记",
            link: "/notes"
          },
          {
            text: "VIP",
            collapsed: true,
            items: [
              {
                text: "哲玄面试题",
                link: "https://eizwbs2n02l.feishu.cn/docx/FQC8da15PodxC0xxNAsc7OuhnYe"
              }
            ]
          }
        ]
      },
      {
        text: "面向开发者的 Web 技术",
        items: [
          {
            text: "Web API",
            link: "/web/web-api"
          }
        ]
      }
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/renelyy/blog" }],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2024-present YY"
    }
  },

  base: "/blog/",
  srcDir: "./src",

  markdown: {
    lineNumbers: true,
    // 启用数学方程 需要给项目安装依赖：npm add -D markdown-it-mathjax3
    math: true,
    image: {
      // 默认禁用图片懒加载
      lazyLoading: true
    },
    container: {
      tipLabel: "提示",
      warningLabel: "警告",
      dangerLabel: "危险",
      infoLabel: "信息",
      detailsLabel: "详细信息"
    },
    toc: {
      level: [1, 2, 3]
    },
    code: {
      FontFace: {
        fontFamily: "'Menlo', 'Courier New', Courier, monospace"
      }
    }
  },

  // 最近一条内容的更新时间会显示在页面右下角。要启用它，将 lastUpdated 选项添加到配置中。
  lastUpdated: true
});

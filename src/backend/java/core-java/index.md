# Core Java 核心技术（第 12 版）

> 基于 Cay S. Horstmann《Core Java, Volume I & II, 12th Edition》（Java 17）**按章节整理**的中文学习笔记，面向**企业级后端开发**。
>
> **已跳过：** 卷 I 第 10–11 章（GUI / Swing 组件）、卷 II 第 11 章（高级 Swing 与图形）、第 12 章（Native 方法，仅概要）。

::: info 学习顺序
零基础可按 [Java 学习路线（零基础 → 求职）](../learning-roadmap) 阶段 1–2 选读本指南卷 I；求职向框架与项目见该路线阶段 3 起。
:::

---

## 卷 I：Fundamentals 基础

| 章 | 标题 | 企业优先级 |
|----|------|------------|
| [1](./vol1/01-introduction) | Java 语言概述 | ⭐ |
| [2](./vol1/02-environment) | 编程环境（JDK、Maven、IDE） | ⭐ |
| [3](./vol1/03-fundamentals) | 基本程序结构 | ⭐ |
| [4](./vol1/04-objects-classes) | 对象与类、Record、包 | ⭐ |
| [5](./vol1/05-inheritance) | 继承、反射、Sealed | ⭐ |
| [6](./vol1/06-interfaces-lambda) | 接口、Lambda、代理 | ⭐ |
| [7](./vol1/07-exceptions-logging) | 异常、断言、日志 | ⭐ |
| [8](./vol1/08-generics) | 泛型 | ⭐ |
| [9](./vol1/09-collections) | 集合框架 | ⭐ |
| ~~10–11~~ | ~~GUI / Swing~~ | **跳过** |
| [12](./vol1/12-concurrency) | 并发编程 | ⭐ |

---

## 卷 II：Advanced Features 高级特性

| 章 | 标题 | 企业优先级 |
|----|------|------------|
| [1](./vol2/01-streams) | Stream API | ⭐ |
| [2](./vol2/02-input-output) | 输入输出、NIO、序列化 | 📌 |
| [3](./vol2/03-xml) | XML 解析与生成 | 📎 |
| [4](./vol2/04-networking) | 网络编程、HTTP Client | 📌 |
| [5](./vol2/05-jdbc) | JDBC 与数据库 | 📌 |
| [6](./vol2/06-date-time) | 日期与时间 API | ⭐ |
| [7](./vol2/07-i18n) | 国际化 | 📎 |
| [8](./vol2/08-annotations) | 注解与编译期处理 | ⭐ |
| [9](./vol2/09-modules) | Java 平台模块系统 | 📎 |
| [10](./vol2/10-security) | 安全 | 📌 |
| ~~11~~ | ~~高级 Swing~~ | **跳过** |
| ~~12~~ | ~~Native 方法~~ | **跳过** |

---

## 学习路线（后端）

```text
卷 I：语言基础 → OOP → 泛型/集合 → 并发
卷 II：Stream → IO → 网络/HTTP → JDBC → 日期时间 → 注解 → 安全
然后：Spring 生态 → MyBatis
```

---

## 与 Spring / MyBatis 的衔接

| Core Java 章节 | 后续 |
|----------------|------|
| 集合、泛型、Lambda | Spring 业务代码 |
| 并发 | `@Async`、线程池、并发容器 |
| Stream | 集合处理、响应式前置 |
| JDBC | [MyBatis](../../mybatis/)、[Spring Data](../../spring/boot/05-data-access) |
| 注解 | Spring `@Component`、`@Transactional` 原理 |
| 日志 | SLF4J / Logback（Spring Boot 默认） |

---

## 说明

- 本书内容受版权保护，本站为**学习笔记式提炼与扩展**，非全书翻译；每章含原书要点、代码示例、企业实践与常见坑
- 章节覆盖说明见 [coverage-map](./coverage-map)
- 原 [Java 杂项笔记](../index-legacy) 保留作补充

---

## 参考书

- *Core Java, Volume I: Fundamentals, 12th Edition* — Cay S. Horstmann
- *Core Java, Volume II: Advanced Features, 12th Edition* — Cay S. Horstmann

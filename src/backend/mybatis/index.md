# MyBatis 3 友好指南

> 基于 [MyBatis 3 官方中文文档](https://mybatis.org/mybatis-3/zh_CN/index.html) **整理翻译**（非逐句全量）。官方核心 **9 大篇**均有对应章节；XML 映射器中的超长 Blog 示例、全部 XML 属性表等已**压缩提炼**。
>
> 适用版本：**MyBatis 3.5.x** · 实际项目请配合 [Spring Boot 集成](./11-spring-boot)

---

## ⚠️ 是否「翻译全了」？

| 问题 | 回答 |
|------|------|
| 官方 9 大篇是否都有？ | **是**（章节级覆盖） |
| 是否逐段全译？ | **否** — 与 [Spring 指南](../spring/coverage-map) 相同定位 |
| 缺什么最吃亏？ | **Spring Boot 集成** → 已补 [专章](./11-spring-boot) |
| 对照表在哪？ | [官方覆盖说明](./coverage-map) |

---

## 这份文档和官方文档有什么不同？

| 对比项 | 官方文档 | 本指南 |
|--------|----------|--------|
| 阅读顺序 | 按技术模块平铺 | 按「先会用 → 再配好 → 再深入」排列 |
| 优先级 | 全部同等篇幅 | 用标签区分必学 / 常用 / 进阶 |
| 示例 | 偏 Blog 领域、极长 | 保留原理 + 简化示例 |
| settings 大表 | 正文难扫 | 必学项正文 + [附录全表](./appendix-reference) |

---

## 优先级图例

| 标签 | 含义 | 建议 |
|------|------|------|
| ⭐ **必学** | 日常开发离不开 | 第一遍通读必看 |
| 📌 **常用** | 高频场景会用到 | 第二遍重点看 |
| 📎 **进阶** | 复杂映射、扩展点 | 遇到问题时查阅 |
| 🔧 **可选** | 特殊场景 / 已废弃 | 知道存在即可 |
| ⚠️ **注意** | 容易踩坑 | 动手前先看 |

---

## 学习路线（推荐）

```text
第 1 天：能跑起来
  指南首页 → 快速上手 → 核心概念

第 2 天：能写 CRUD（Boot 项目）
  Spring Boot 集成 → XML 映射 → 动态 SQL

第 3 天：能配好项目
  配置详解 → Java API → 注解映射

第 4 天及以后：按需深入
  结果映射 → 缓存与日志 → SQL 构建器 → 附录
```

---

## 文档索引

| 章节 | 说明 | 优先级 |
|------|------|--------|
| [官方覆盖说明](./coverage-map) | **哪些译了、哪些压缩** | 必读 |
| [快速上手](./01-quick-start) | 安装、第一个查询、Mapper 接口 | ⭐ |
| [核心概念](./02-core-concepts) | SqlSessionFactory / SqlSession / 生命周期 | ⭐ |
| [配置详解](./03-configuration) | properties、settings、数据源、插件 | ⭐📌 |
| [XML 映射基础](./04-xml-mapper) | CRUD、参数 `#{}` vs `${}` | ⭐ |
| [结果映射](./05-result-mapping) | resultMap、关联、集合 | 📌📎 |
| [动态 SQL](./06-dynamic-sql) | if、where、foreach | ⭐📌 |
| [Java API](./07-java-api) | SqlSession、事务、分页 | 📌 |
| [注解映射](./08-annotations) | @Select、@Results、Provider | 📌 |
| [缓存与日志](./09-cache-and-logging) | 一/二级缓存、SQL 日志 | 📌📎 |
| [SQL 构建器](./10-sql-builder) | Java 中拼 SQL | 📎 |
| [Spring Boot 集成](./11-spring-boot) | starter、事务、PageHelper | ⭐ |
| [附录：速查表](./appendix-reference) | settings 全表、类型别名 | 🔧 |

---

## 30 秒理解 MyBatis

**MyBatis 是什么？** 持久层框架：你写 SQL，它做 JDBC 连接、参数绑定、结果映射。

**和 JDBC 比：** 省掉约 95% 样板代码。

**和 Hibernate/JPA 比：** SQL 由你掌控，适合复杂查询与存量库表。

**Spring Boot 项目：** 用 `mybatis-spring-boot-starter`，见 [Spring Boot 集成](./11-spring-boot)。

---

## 官方章节对照（章节级）

| 官方页面 | 本指南位置 |
|----------|------------|
| 简介 | [index](./index)、[02-core-concepts](./02-core-concepts) |
| 入门 | [01-quick-start](./01-quick-start) |
| 配置 | [03-configuration](./03-configuration)、[appendix](./appendix-reference) |
| XML 映射器 | [04-xml-mapper](./04-xml-mapper)、[05-result-mapping](./05-result-mapping) |
| 动态 SQL | [06-dynamic-sql](./06-dynamic-sql) |
| Java API | [07-java-api](./07-java-api) |
| 注解 | [08-annotations](./08-annotations) |
| 日志 | [09-cache-and-logging](./09-cache-and-logging) |
| SQL 构建器 | [10-sql-builder](./10-sql-builder) |
| *(官方无)* Spring Boot | [11-spring-boot](./11-spring-boot) |

详细覆盖度见 [coverage-map](./coverage-map)。

---

## 相关链接

- [MyBatis 官方中文文档](https://mybatis.org/mybatis-3/zh_CN/index.html)
- [mybatis-spring-boot-starter](https://github.com/mybatis/spring-boot-starter)
- [MyBatis-Spring](https://mybatis.org/spring/zh_CN/index.html)
- [Spring Boot 数据访问](../spring/boot/05-data-access)

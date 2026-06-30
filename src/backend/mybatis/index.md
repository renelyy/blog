# MyBatis 3 友好指南

> 基于 [MyBatis 3 官方中文文档](https://mybatis.org/mybatis-3/zh_CN/index.html) 重新编排，**内容覆盖官方全部章节**，用更易读的方式组织，并标注学习优先级。
>
> 适用版本：**MyBatis 3.5.x**（与官方文档同步）

---

## 这份文档和官方文档有什么不同？

| 对比项 | 官方文档 | 本指南 |
|--------|----------|--------|
| 阅读顺序 | 按技术模块平铺 | 按「先会用 → 再配好 → 再深入」排列 |
| 优先级 | 全部同等篇幅 | 用标签区分必学 / 常用 / 进阶 |
| 示例 | 偏 Blog 领域 | 保留官方示例 + 补充「一眼看懂」说明 |
| 表格 | settings 等大表难扫 | 必学项单独提炼，完整表放附录 |

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
  README → 快速上手 → 核心概念

第 2 天：能写 CRUD
  XML 映射基础 → 动态 SQL

第 3 天：能配好项目
  配置详解 → Java API → 注解映射

第 4 天及以后：按需深入
  结果映射 → 缓存与日志 → SQL 构建器 → 附录
```

---

## 文档索引

| 章节 | 说明 | 优先级 |
|------|------|--------|
| [快速上手](./01-quick-start.md) | 安装、第一个查询、Mapper 接口 | ⭐ |
| [核心概念](./02-core-concepts.md) | SqlSessionFactory / SqlSession / 生命周期 | ⭐ |
| [配置详解](./03-configuration.md) | properties、settings、数据源、插件等 | ⭐📌 |
| [XML 映射基础](./04-xml-mapper.md) | select/insert/update/delete、参数 `#{}` vs `${}` | ⭐ |
| [结果映射](./05-result-mapping.md) | resultMap、关联、集合、自动映射 | 📌📎 |
| [动态 SQL](./06-dynamic-sql.md) | if、where、foreach、bind | ⭐📌 |
| [Java API](./07-java-api.md) | SqlSession 方法、事务、分页 | 📌 |
| [注解映射](./08-annotations.md) | @Select、@Results、Provider | 📌 |
| [缓存与日志](./09-cache-and-logging.md) | 一级/二级缓存、SQL 日志调试 | 📌📎 |
| [SQL 构建器](./10-sql-builder.md) | Java 中拼 SQL 的 SQL 类 | 📎 |
| [附录：速查表](./appendix-reference.md) | settings 全表、类型别名、JDBC 类型 | 🔧 |

---

## 30 秒理解 MyBatis

**MyBatis 是什么？** 持久层框架：你写 SQL，它帮你做 JDBC 连接、参数绑定、结果映射。

**和 JDBC 比：** 省掉大量样板代码（约 95% 的重复劳动）。

**和 Hibernate/JPA 比：** 不自动生成 SQL，**SQL 由你掌控**，适合复杂查询、存量项目、DBA 审查 SQL 的场景。

**两种配置方式：**

- **XML 映射** — 复杂 SQL、复杂 resultMap 的首选
- **注解** — 简单 CRUD 够用；复杂关联仍建议 XML

**Spring Boot 项目：** 通常用 `mybatis-spring-boot-starter`，不用手写 `SqlSessionFactoryBuilder`，但底层概念完全一致。见 [核心概念](./02-core-concepts.md#与-spring--mybatis-spring-集成)。

---

## 官方章节对照

本指南完整覆盖官方以下页面，无遗漏：

| 官方页面 | 本指南位置 |
|----------|------------|
| 简介 | [README](./index)、[核心概念](./02-core-concepts.md) |
| 入门 | [快速上手](./01-quick-start.md)、[核心概念](./02-core-concepts.md) |
| 配置 | [配置详解](./03-configuration.md)、[附录](./appendix-reference.md) |
| XML 映射器 | [XML 映射基础](./04-xml-mapper.md)、[结果映射](./05-result-mapping.md) |
| 动态 SQL | [动态 SQL](./06-dynamic-sql.md) |
| Java API | [Java API](./07-java-api.md) |
| 注解（含在 Java API 章） | [注解映射](./08-annotations.md) |
| 日志 | [缓存与日志](./09-cache-and-logging.md) |
| SQL 语句构建器 | [SQL 构建器](./10-sql-builder.md) |

---

## 相关链接

- [MyBatis 官方中文文档](https://mybatis.org/mybatis-3/zh_CN/index.html)
- [MyBatis GitHub](https://github.com/mybatis/mybatis-3)
- [MyBatis-Spring](https://mybatis.org/spring/zh_CN/index.html)（Spring 集成）
- [mybatis-spring-boot-starter](https://github.com/mybatis/spring-boot-starter)

# MyBatis 官方文档覆盖说明

[← 返回索引](./index)

> **先说清楚：** [MyBatis 3 官方中文文档](https://mybatis.org/mybatis-3/zh_CN/index.html) 单套 Reference 篇幅远小于 Spring，但 XML 映射器一章极其冗长（Blog 嵌套示例占大量篇幅）。本指南是 **中文重编排 + 常用内容提炼**，**不是**逐段全量翻译。

---

## 本指南 vs 官方文档

| 维度 | 官方文档 | 本指南 |
|------|----------|--------|
| 官方核心 9 大篇 | 简介、入门、配置、XML、动态SQL、Java API、注解、日志、SQL构建器 | **均有对应章节** |
| 逐句翻译 | 100% | **否** — 压缩示例、合并重复说明 |
| settings 全表 | 正文表格 | [附录](./appendix-reference) 完整收录 |
| 注解对照表 | Java API 章超长表格 | [08-annotations](./08-annotations) 精简表 |
| 实际开发（Boot） | 不在 mybatis-3 核心里 | [11-Spring Boot 集成](./11-spring-boot) **补充** |

---

## 官方章节对照

| 官方页面 | 本指南 | 覆盖度 |
|----------|--------|--------|
| 简介 | [index](./index)、[02-core-concepts](./02-core-concepts) | ⭐⭐⭐ |
| 入门 | [01-quick-start](./01-quick-start) | ⭐⭐⭐ |
| 配置 | [03-configuration](./03-configuration)、[appendix](./appendix-reference) | ⭐⭐⭐ 高 |
| XML 映射器 | [04-xml-mapper](./04-xml-mapper)、[05-result-mapping](./05-result-mapping) | ⭐⭐ 中 — 官方 Blog 超复杂示例已压缩 |
| 动态 SQL | [06-dynamic-sql](./06-dynamic-sql) | ⭐⭐⭐ |
| Java API | [07-java-api](./07-java-api) | ⭐⭐⭐ |
| 注解 | [08-annotations](./08-annotations) | ⭐⭐ 中 — 全注解属性见官方 |
| 日志 | [09-cache-and-logging](./09-cache-and-logging) | ⭐⭐⭐ |
| SQL 构建器 | [10-sql-builder](./10-sql-builder) | ⭐⭐⭐ |

---

## 官方有、本指南**压缩或未单独成篇**的内容

| 内容 | 说明 |
|------|------|
| Blog 五表 JOIN 完整 resultMap | 官方 longest example；本指南用简化版，原理见 [05-result-mapping](./05-result-mapping) |
| select/insert 等**全部** XML 属性 | 常用在正文，其余见官方 |
| association/collection **全部** 属性 | `fetchType`、`notNullColumn`、`columnPrefix` 等见 [05](./05-result-mapping) 增补段 |
| parameterMap | 已废弃，本指南明确不写 |
| 存储过程 / REFCURSOR | [04-xml-mapper](./04-xml-mapper) 仅概要 |
| 自定义 LanguageDriver | [06-dynamic-sql](./06-dynamic-sql) 仅概要 |

---

## 官方**没有**、但开发**必须有**的内容（本指南补充）

| 内容 | 本指南 |
|------|--------|
| **mybatis-spring-boot-starter** | [11-spring-boot](./11-spring-boot) ⭐ |
| PageHelper 分页 | [11-spring-boot](./11-spring-boot)、[07-java-api](./07-java-api) |
| MyBatis Generator | 链 [官方 Generator](https://mybatis.org/generator/) — 独立项目 |
| MyBatis-Plus | 第三方，不在本指南 |

---

## 与 Spring 指南的衔接

- [Spring Boot 数据访问](../spring/boot/05-data-access)
- [Spring 生态首页](../spring/)

---

## 若还要加深

可优先扩写：**Spring Boot 集成**（已有专章）、**复杂 resultMap 完整 Blog 示例**、**插件开发（分页/审计）**。

[← 返回索引](./index)

# 后端学习路线图

> 在 [Core Java](./java/core-java/)、[MyBatis](./mybatis/)、[Spring 生态](./spring/) 之外，按**企业实战优先级**排列的扩展模块。**11 个模块正文均已写完** ✅。

::: tip 零基础同学
若还在学语言、框架、做第一个项目，请先看 [Java 零基础学习路线](./java/learning-roadmap)（阶段 1–8）；本文档适合**已掌握 Java + Spring Boot 基础**后的模块深化。
:::

---

## 推荐补充顺序

```text
1. database/      SQL + MySQL 原理（与 JDBC/MyBatis 衔接）
2. redis/         缓存与高并发
3. security/      鉴权深化（JWT/OAuth2）
4. messaging/     Kafka / RabbitMQ
5. jpa/           JPA / Spring Data（ORM 另一条线）
6. distributed/   幂等、分布式锁、一致性
7. jvm/           GC、OOM、Arthas
8. observability/ 日志、链路、监控、容器
9. testing/       JUnit5、Mockito、Testcontainers
10. api-design/   REST 规范
11. design-patterns/ 设计模式 + Spring 中的应用
```

---

## 模块索引

| 模块 | 说明 | 状态 |
|------|------|------|
| [database](./database/) | SQL、索引、事务、InnoDB、慢 SQL | ✅ 已写 |
| [redis](./redis/) | 数据结构、缓存模式、分布式锁 | ✅ 已写 |
| [security](./security/) | Spring Security、JWT、Web 安全 | ✅ 已写 |
| [messaging](./messaging/) | 消息模型、Kafka、RabbitMQ | ✅ 已写 |
| [jpa](./jpa/) | JPA/Hibernate、Spring Data JPA | ✅ 已写 |
| [distributed](./distributed/) | CAP、幂等、分布式事务 | ✅ 已写 |
| [jvm](./jvm/) | 内存、GC、调优、排查 | ✅ 已写 |
| [observability](./observability/) | 日志、链路追踪、指标、Docker | ✅ 已写 |
| [testing](./testing/) | 单元测试、集成测试 | ✅ 已写 |
| [api-design](./api-design/) | REST、分页、错误码、OpenAPI | ✅ 已写 |
| [design-patterns](./design-patterns/) | GoF 模式、Spring 中的模式 | ✅ 已写 |

---

## 优先级图例

| 标签 | 含义 |
|------|------|
| ⭐ **必学** | 日常开发离不开 |
| 📌 **常用** | 高频场景 |
| 📎 **进阶** | 深入或扩展 |
| 🚧 **骨架** | 目录已建，正文待写 |

---

## 与已有文档的关系

```text
Core Java（语言/JDK/并发/IO/JDBC）
        ↓
database + mybatis/jpa（数据层）
        ↓
Spring Boot（Web/事务/集成）
        ↓
redis + messaging + security（中间件与安全）
        ↓
Spring Cloud + distributed（微服务与分布式）
        ↓
jvm + observability（生产运维）
```

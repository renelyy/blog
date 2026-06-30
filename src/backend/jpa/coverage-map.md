# JPA 章节覆盖说明

> 与 [JPA 索引](./index) 对照；标记各章写作状态。

---

## 章节状态

| 章 | 文件 | 状态 | 覆盖要点 |
|----|------|------|----------|
| 1 | [01-jpa-overview](./01-jpa-overview) | ✅ | JPA/Hibernate、EntityManager、生命周期、Boot 配置 |
| 2 | [02-entity-mapping](./02-entity-mapping) | ✅ | @Entity、主键、枚举、审计、Embeddable、逻辑删除 |
| 3 | [03-relationships](./03-relationships) | ✅ | 一对多/多对一、Fetch、N+1、EntityGraph |
| 4 | [04-jpql-and-query](./04-jpql-and-query) | ✅ | JPQL、@Query、Specification、分页、Native SQL |
| 5 | [05-spring-data-jpa](./05-spring-data-jpa) | ✅ | 分层、事务、乐观锁、批量、测试 |
| 6 | [06-mybatis-vs-jpa](./06-mybatis-vs-jpa) | ✅ | 选型、混用、决策流程 |

---

## 与路线图对应

- [后端路线图](../roadmap) — JPA 模块 ✅ 已写

---

## 交叉引用

| 外部模块 | 关联 |
|----------|------|
| database | DDL、索引、事务 |
| mybatis | 选型与混用 |
| spring/framework | @Transactional |
| spring/boot | DataSource、JPA 自动配置 |

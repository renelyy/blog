# 数据库与 SQL（MySQL）

> **MySQL 8.x** + 标准 SQL 的企业向学习笔记。与 [Core Java JDBC](../java/core-java/vol2/05-jdbc)、[MyBatis](../mybatis/)、[Spring 数据访问](../spring/boot/05-data-access) 衔接。

---

## 优先级图例

| 标签 | 含义 |
|------|------|
| ⭐ 必学 | 日常开发必备 |
| 📌 常用 | 高频场景 |
| 📎 进阶 | 深入调优 |

---

## 学习路线

```text
SQL 基础 → 索引与 EXPLAIN → 事务与隔离 → InnoDB/MVCC → 慢 SQL → 读写分离/分库分表入门
```

---

## 章节索引

| 章 | 标题 | 优先级 | 链接 |
|----|------|--------|------|
| 1 | SQL 基础与范式 | ⭐ | [01-sql-basics](./01-sql-basics) |
| 2 | 索引原理与 EXPLAIN | ⭐ | [02-index-and-explain](./02-index-and-explain) |
| 3 | 事务与隔离级别 | ⭐ | [03-transaction-isolation](./03-transaction-isolation) |
| 4 | InnoDB 与 MVCC | ⭐ | [04-innodb-and-mvcc](./04-innodb-and-mvcc) |
| 5 | 慢 SQL 排查与优化 | 📌 | [05-slow-query-tuning](./05-slow-query-tuning) |
| 6 | 主从、读写分离与分库分表 | 📎 | [06-sharding-readwrite](./06-sharding-readwrite) |

---

## 相关文档

- [MyBatis 指南](../mybatis/)
- [Spring 事务](../spring/framework/04-data-transaction)
- [JDBC 章节](../java/core-java/vol2/05-jdbc)

- [章节覆盖说明](./coverage-map)

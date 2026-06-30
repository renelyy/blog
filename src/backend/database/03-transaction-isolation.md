# 事务与隔离级别

[← 返回索引](./index)

> **本节目标：** 理解 ACID、四种隔离级别、脏读/不可重复读/幻读，与 Spring `@Transactional` 对齐。

---

## ⭐ 什么是事务

**事务** = 一组 SQL 的原子单元：要么全部成功，要么全部撤销。

```sql
START TRANSACTION;   -- 或 BEGIN
UPDATE account SET balance = balance - 100 WHERE id = 1;
UPDATE account SET balance = balance + 100 WHERE id = 2;
COMMIT;              -- 提交；或 ROLLBACK 回滚
```

Java / Spring 中由 `Connection` 或 `@Transactional` 管理，见 [Spring 事务](../spring/framework/04-data-transaction)。

---

## ⭐ ACID

| 特性 | 含义 | 实现要点 |
|------|------|----------|
| **A**tomicity 原子性 | 全做或全不做 | undo log 回滚 |
| **C**onsistency 一致性 | 数据满足业务约束 | 应用 + DB 约束 |
| **I**solation 隔离性 | 并发事务互不干扰 | 锁 + MVCC |
| **D**urability 持久性 | 提交后不丢 | redo log 刷盘 |

---

## ⭐ 并发异常

| 现象 | 说明 | 举例 |
|------|------|------|
| **脏读** | 读到别的事务**未提交**的数据 | A 改余额未提交，B 读到新值，A 回滚 |
| **不可重复读** | 同一事务内两次读**同一行**结果不同 | B 两次读账户，中间 A 提交修改 |
| **幻读** | 同一事务内两次**范围查询**行数不同 | B 两次 `SELECT ... WHERE status=1`，中间 A 插入新行 |

---

## ⭐ SQL 标准四种隔离级别

| 隔离级别 | 脏读 | 不可重复读 | 幻读 | MySQL InnoDB 默认 |
|----------|------|------------|------|-------------------|
| READ UNCOMMITTED | 可能 | 可能 | 可能 | 几乎不用 |
| **READ COMMITTED** | 否 | 可能 | 可能 | Oracle/SQL Server 默认 |
| **REPEATABLE READ** | 否 | 否 | 可能* | **InnoDB 默认** |
| SERIALIZABLE | 否 | 否 | 否 | 性能差，少用 |

\* InnoDB 在 RR 下通过 **Next-Key Lock** 在很大程度上避免幻读（见下章）。

```sql
-- 查看
SELECT @@transaction_isolation;
-- 设置（会话级）
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

---

## ⭐ 隔离级别与锁

- **RC**：每次 SELECT 读最新已提交版本；语句级一致性
- **RR**：事务第一次读建立 **Read View**，整个事务内 repeatable；InnoDB 默认
- **Serializable**：读加锁，读写互斥

**Spring 默认：** 跟底层 DataSource 一致，通常 RR（MySQL）或 RC（部分 PG 配置）。

```java
@Transactional(isolation = Isolation.READ_COMMITTED)
public void transfer(...) { }
```

---

## ⭐ 传播行为（Spring 补充）

与隔离级别正交，定义**事务边界**：

| 传播 | 含义 |
|------|------|
| `REQUIRED`（默认） | 有则加入，无则新建 |
| `REQUIRES_NEW` | 总是新建，挂起外层 |
| `NESTED` | 嵌套 savepoint |
| `NOT_SUPPORTED` | 挂起事务，非事务执行 |
| `MANDATORY` | 必须在事务内，否则异常 |
| `NEVER` | 禁止在事务内 |
| `SUPPORTS` | 有则用，无则非事务 |

```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void writeAuditLog() { }  // 独立提交，不受外层回滚影响
```

---

## 📌 企业选型建议

| 场景 | 建议 |
|------|------|
| MySQL 默认业务 | RR + InnoDB |
| 减少间隙锁冲突 | 考虑 RC（部分互联网大厂） |
| 报表只读 | 只读从库 + RC 或快照读 |
| 强一致计数 | SERIALIZABLE 或应用层锁 |

**RC vs RR 权衡：** RC 锁更少、死锁略少；RR 一致性更强但 Next-Key Lock 可能阻塞插入。

---

## 📌 长事务危害

```text
长事务 → undo log 膨胀 → 锁持有久 → 阻塞其他会话 → 主从延迟
```

**规范：**

- 事务内不做 RPC、不发 MQ、不调慢 HTTP
- 大 batch 拆小事务
- 监控 `information_schema.innodb_trx` 长事务

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| `@Transactional` 自调用失效 | 同类内部调用不走代理 |
| 只读事务写操作 | `readOnly=true` 仍可能 flush |
| 异常不回滚 | 默认只回滚 RuntimeException；受检异常需 `rollbackFor` |
| 隔离级别误设 | 与 DB 默认不一致导致行为与预期不符 |
| 在事务里查从库 | 主从延迟读到旧数据 |

---

## 本章小结

- ACID 是事务理论基石；隔离级别权衡一致性与并发
- MySQL InnoDB 默认 RR；理解脏读/不可重复读/幻读
- Spring 传播 + 隔离 + 异常回滚规则需一起掌握

---

## 下一步

- [InnoDB 与 MVCC](./04-innodb-and-mvcc)

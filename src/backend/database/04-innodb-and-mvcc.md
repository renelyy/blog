# InnoDB 与 MVCC

[← 返回索引](./index)

> **本节目标：** 理解 InnoDB 存储结构、redo/undo、MVCC 多版本并发控制，以及行锁/间隙锁。

---

## ⭐ InnoDB 架构概览

```text
SQL 层
  ↓
InnoDB 引擎
  ├── Buffer Pool（内存页缓存）
  ├── redo log（重做，崩溃恢复）
  ├── undo log（回滚 + MVCC 旧版本）
  └── 锁系统（行锁、间隙锁、意向锁）
  ↓
磁盘：.ibd 表空间文件
```

**与 MyISAM 对比：** InnoDB 支持**事务**、**行级锁**、**外键**（少用）、**崩溃恢复** — 企业默认 InnoDB。

---

## ⭐ 聚簇索引与页

- 数据按 **B+Tree 聚簇索引** 组织（主键顺序）
- 最小 IO 单位 **页（Page，通常 16KB）**
- **Buffer Pool** 缓存热页，减少磁盘读

```sql
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';
-- 生产常设为物理内存 50%～70%（专用 DB 机）
```

---

## ⭐ redo log 与 undo log

| 日志 | 作用 | 比喻 |
|------|------|------|
| **redo log** | 记录**物理页修改**；崩溃后重做已提交事务 | 施工日记，断电后续写 |
| **undo log** | 记录**逻辑反操作**；回滚 + MVCC 读旧版本 | 撤销凭证 |

**WAL（Write-Ahead Logging）：** 先写 log，再刷脏页 — 保证持久性且顺序写性能好。

```text
UPDATE users SET balance = 100 WHERE id = 1;
  → 写 undo（旧值）
  → 改 Buffer Pool 页
  → 写 redo log
  → COMMIT 时 redo 刷盘（策略由 innodb_flush_log_at_trx_commit 控制）
```

---

## ⭐ MVCC 多版本并发控制

**目标：** 读不阻塞写、写不阻塞读（快照读）。

**核心：**

- 每行有隐藏列：`DB_TRX_ID`（最后修改事务 ID）、`DB_ROLL_PTR`（undo 链）
- **Read View**（读视图）：决定当前事务能看到哪个版本
- **快照读** `SELECT ...`（普通 SELECT）走 MVCC，不加锁
- **当前读** `SELECT ... FOR UPDATE` / `LOCK IN SHARE MODE` / DML 读最新并加锁

```text
事务 A (RR)                    事务 B
SELECT balance → 1000
                               UPDATE balance=900 COMMIT
SELECT balance → 1000 (RR 仍看快照)
COMMIT
SELECT balance → 900 (新事务)
```

---

## ⭐ 锁：行锁、间隙锁、Next-Key Lock

InnoDB 在 **索引记录** 上施加锁：

| 锁类型 | 说明 |
|--------|------|
| **Record Lock** | 锁定索引记录 |
| **Gap Lock** | 锁定索引记录之间的间隙，防止插入 |
| **Next-Key Lock** | Record + Gap，RR 下默认，防幻读 |

```sql
-- 当前读加排他锁
SELECT * FROM orders WHERE id = 100 FOR UPDATE;

-- 共享锁
SELECT * FROM orders WHERE id = 100 LOCK IN SHARE MODE;
```

**意向锁（IX/IS）：** 表级，表示事务即将加行锁，提高冲突检测效率。

---

## ⭐ 死锁

```text
事务 A：锁 row 1 → 等待 row 2
事务 B：锁 row 2 → 等待 row 1
→ InnoDB 检测死锁，回滚代价较小的一方
```

```sql
SHOW ENGINE INNODB STATUS;  -- 最近死锁信息
```

**避免：**

- 固定访问顺序（按 id 排序更新）
- 缩短事务
- 降低隔离级别（RC 间隙锁更少）
- 合理索引减少锁范围

---

## 📌 乐观锁 vs 悲观锁

### 悲观锁（数据库锁）

```sql
SELECT stock FROM product WHERE id = 1 FOR UPDATE;
-- 应用计算后 UPDATE
```

### 乐观锁（版本号）

```sql
UPDATE product
SET stock = stock - 1, version = version + 1
WHERE id = 1 AND version = #{oldVersion};
-- affected rows = 0 → 并发冲突，重试
```

MyBatis / JPA 常用 `version` 字段 + `@Version`。

---

## 📌 企业监控

```sql
-- 当前 InnoDB 事务
SELECT * FROM information_schema.innodb_trx;

-- 锁等待
SELECT * FROM performance_schema.data_locks;
SELECT * FROM sys.innodb_lock_waits;
```

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 无索引 UPDATE | 锁全表/全索引范围 |
| RR + 范围 FOR UPDATE | 间隙锁阻塞插入 |
| 大事务 | undo 堆积、回滚慢 |
| 把 MVCC 当「无锁」 | 当前读、DDL 仍会阻塞 |
| `innodb_flush_log_at_trx_commit=0` | 性能换丢失最近 1s 事务 |

---

## 本章小结

- InnoDB = Buffer Pool + redo/undo + MVCC + 行锁
- 普通 SELECT 快照读；FOR UPDATE 当前读加锁
- RR 下 Next-Key Lock 防幻读；注意死锁与长事务

---

## 下一步

- [慢 SQL 排查与优化](./05-slow-query-tuning)

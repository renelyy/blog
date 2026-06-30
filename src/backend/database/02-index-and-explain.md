# 索引原理与 EXPLAIN

[← 返回索引](./index)

> **本节目标：** 理解 B+Tree 索引、最左前缀原则，会用 EXPLAIN 分析 SQL 是否走索引。

---

## ⭐ 为什么需要索引

全表扫描（Full Table Scan）：逐行判断 WHERE — 数据量大时 O(n)，磁盘 IO 爆炸。

**索引** = 排好序的数据结构 + 指向行的指针，把查找变成 O(log n) 或更优。

| 无索引 | 有索引 |
|--------|--------|
| 扫描 100 万行 | 可能只需几次 B+Tree 查找 |
| CPU/IO 高 | 适合高 QPS 点查、范围查 |

**代价：** 占空间、写操作要维护索引（INSERT/UPDATE/DELETE 变慢）。**不是越多越好**。

---

## ⭐ MySQL InnoDB 索引结构：B+Tree

```text
                    [根节点]
                   /    |    \
            [分支]      [分支]     [分支]
           /  |  \      ...
      [叶子]─[叶子]─[叶子]─ ... （叶子节点双向链表）
        ↓      ↓      ↓
      数据页  数据页  数据页（聚簇索引叶子存整行）
```

| 概念 | 说明 |
|------|------|
| **聚簇索引** | 主键索引；叶子节点存**完整行数据** |
| **二级索引** | 非主键索引；叶子存**主键值**，需回表 |
| **回表** | 二级索引查到主键 → 再查聚簇索引拿整行 |

**建议：** 主键短且递增（BIGINT AUTO_INCREMENT 或有序雪花 ID），减少页分裂。

---

## ⭐ 索引类型

```sql
-- 主键
PRIMARY KEY (id)

-- 唯一索引
UNIQUE KEY uk_email (email)

-- 普通索引
KEY idx_dept_status (dept_id, status)

-- 前缀索引（长字符串）
KEY idx_url (url(64))

-- 覆盖索引：查询列全在索引中，无需回表
KEY idx_cover (dept_id, status, username)
-- SELECT username FROM users WHERE dept_id=10 AND status=1; 仅扫二级索引
```

| 类型 | 适用 |
|------|------|
| 单列索引 | 单条件高频 |
| **联合索引** | 多条件组合查询 |
| 唯一索引 | 业务唯一约束 |
| 全文索引 | 搜索引擎场景（生产多用 ES） |

---

## ⭐ 最左前缀原则

联合索引 `(dept_id, status, created_at)` 相当于排序：

```text
(dept_id, status, created_at) 有序
```

**能用到索引：**

```sql
WHERE dept_id = 10
WHERE dept_id = 10 AND status = 1
WHERE dept_id = 10 AND status = 1 AND created_at > '2024-01-01'
```

**不能完全利用（或不能用）：**

```sql
WHERE status = 1                    -- 跳过最左 dept_id
WHERE dept_id = 10 AND created_at > '...'  -- status 被跳过，created_at 可能用不上范围后的列
```

**范围查询**（`>`、`<`、`BETWEEN`）后的列通常无法继续走索引。

---

## ⭐ EXPLAIN 执行计划

```sql
EXPLAIN SELECT id, username FROM users
WHERE dept_id = 10 AND status = 1
ORDER BY id DESC
LIMIT 20;
```

### 核心列（MySQL 8）

| 列 | 含义 | 关注值 |
|----|------|--------|
| **type** | 访问类型 | `ALL` 最差全表；`index` 全索引扫描；`range` 范围；`ref` 等值；`const` 最优 |
| **possible_keys** | 可能用到的索引 | |
| **key** | 实际使用的索引 | NULL = 未用索引 |
| **rows** | 预估扫描行数 | 越小越好 |
| **Extra** | 附加信息 | 见下表 |

**Extra 常见：**

| Extra | 含义 |
|-------|------|
| `Using index` | 覆盖索引，好 |
| `Using where` | 存储引擎层过滤 |
| `Using filesort` | 额外排序，考虑索引支持 ORDER BY |
| `Using temporary` | 临时表，GROUP BY/ DISTINCT 需优化 |
| `Using index condition` | ICP 索引下推 |

```sql
-- MySQL 8 更详细
EXPLAIN ANALYZE SELECT ...;
```

---

## ⭐ 索引设计实战

### 示例 1：列表查询

```sql
-- 查询：某部门启用用户，按创建时间倒序分页
KEY idx_dept_status_created (dept_id, status, created_at DESC)

SELECT id, username FROM users
WHERE dept_id = ? AND status = 1
ORDER BY created_at DESC
LIMIT 20;
```

### 示例 2：避免回表

```sql
-- 只需 username，建覆盖索引
KEY idx_cover (dept_id, status, username)
```

### 示例 3：ORDER BY 与索引

```sql
-- 索引 (dept_id, id) 可同时满足 WHERE dept_id=? ORDER BY id
```

---

## 📌 索引失效场景

| 场景 | 示例 |
|------|------|
| 对列做函数/运算 | `WHERE YEAR(created_at)=2024` |
| 隐式类型转换 | `WHERE varchar_col = 123` |
| 前导模糊 | `WHERE name LIKE '%张%'`（`张%` 可能走索引） |
| OR 跨列 | `WHERE a=1 OR b=2` 常全表（可 UNION 改写） |
| 不等于 | `!=`、`<>` 常不走索引 |
| 优化器判断 | 表太小，全表更快 |

**改写示例：**

```sql
-- 坏
WHERE DATE(created_at) = '2024-06-30'
-- 好
WHERE created_at >= '2024-06-30 00:00:00'
  AND created_at <  '2024-07-01 00:00:00'
```

---

## 📌 企业规范

- 单表索引一般不超过 **5～6 个**（视写频率）
- 上线前核心 SQL 必须 **EXPLAIN** + 慢查询评审
- 禁止在生产 **`CREATE INDEX` 不经评估**（大表锁表，用 `ALGORITHM=INPLACE, LOCK=NONE` 在线 DDL）
- 用 **pt-online-schema-change** 或 MySQL 8 在线 DDL 改大表

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 每个列单独建索引 | 联合查询用不上；应建联合索引 |
| 联合索引顺序错 | 高选择性、等值列放左 |
| 以为 EXPLAIN rows 精确 | 估计值，以 ANALYZE 为准 |
| 覆盖索引列过多 | 索引体积大，写放大 |

---

## 本章小结

- InnoDB 主键聚簇 + 二级索引 B+Tree；理解回表与覆盖索引
- 最左前缀决定联合索引能否命中
- EXPLAIN 看 type、key、rows、Extra；上线前必查

---

## 下一步

- [事务与隔离级别](./03-transaction-isolation)

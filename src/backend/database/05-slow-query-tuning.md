# 慢 SQL 排查与优化

[← 返回索引](./index)

> **本节目标：** 会开启慢查询日志、定位慢 SQL、用 EXPLAIN 与索引优化，掌握分页与 COUNT 优化。

---

## ⭐ 慢 SQL 从哪来

| 原因 | 典型表现 |
|------|----------|
| 无索引 / 索引失效 | type=ALL，rows 巨大 |
| 回表过多 | Extra 无 Using index |
| 大结果集 | 一次拉百万行 |
| 深分页 | OFFSET 百万 |
| 锁等待 | 状态 `Waiting for lock` |
| 统计信息过期 | 优化器选错索引 |
| 硬件/参数 | IO 瓶颈、buffer pool 小 |

---

## ⭐ 开启慢查询日志

```sql
-- 查看
SHOW VARIABLES LIKE 'slow_query%';
SHOW VARIABLES LIKE 'long_query_time';

-- 动态开启（重启会丢，写 my.cnf 持久化）
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1;        -- 超过 1 秒记录
SET GLOBAL log_queries_not_using_indexes = ON;  -- 未用索引（慎用，日志量大）
```

**my.cnf 示例：**

```ini
[mysqld]
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 1
```

---

## ⭐ 分析工具

| 工具 | 用途 |
|------|------|
| **mysqldumpslow** | 汇总慢 log |
| **pt-query-digest** | Percona 深度分析 |
| **EXPLAIN / EXPLAIN ANALYZE** | 执行计划 |
| **Performance Schema** | 运行时 SQL 统计 |

```bash
mysqldumpslow -s t -t 10 /var/log/mysql/slow.log
pt-query-digest slow.log > report.txt
```

```sql
-- 查看正在执行的 SQL
SHOW FULL PROCESSLIST;
SELECT * FROM sys.session WHERE command != 'Sleep';
```

---

## ⭐ 优化流程（固定套路）

```text
1. 从慢 log / APM 拿到 SQL + 耗时
2. EXPLAIN（或 ANALYZE）看 type、key、rows、Extra
3. 检查索引、改写 SQL、减少返回列
4. 验证：rows 降、type 改善、耗时降
5. 灰度上线，继续监控
```

---

## ⭐ 典型优化案例

### 案例 1：深分页

```sql
-- 慢：扫描 offset 前所有行
SELECT * FROM orders ORDER BY id LIMIT 1000000, 20;

-- 优：延迟关联 / Seek 分页
SELECT o.* FROM orders o
INNER JOIN (
  SELECT id FROM orders ORDER BY id LIMIT 1000000, 20
) t ON o.id = t.id;

-- 更好：记录上次最大 id
SELECT * FROM orders WHERE id > #{lastId} ORDER BY id LIMIT 20;
```

MyBatis 分页插件（PageHelper）深页需业务限制 maxPage 或改 Seek。

### 案例 2：COUNT 大表

```sql
-- 慢
SELECT COUNT(*) FROM orders WHERE status = 1;

-- 优：缓存计数、冗余 counter 表、ES 统计、近似值
-- 或覆盖索引减少回表
SELECT COUNT(*) FROM orders FORCE INDEX (idx_status) WHERE status = 1;
```

### 案例 3：JOIN 过大

- 小表驱动大表（优化器通常处理）
- 确保 JOIN 列**类型一致且有索引**
- 拆成两次查询 + 应用层组装（N+1 需权衡）

### 案例 4：SELECT 列过多

```sql
-- 坏：宽行回表
SELECT * FROM huge_table WHERE ...

-- 好：覆盖索引
SELECT id, status FROM huge_table WHERE dept_id = 10 AND status = 1;
```

---

## ⭐ 更新统计信息

```sql
ANALYZE TABLE users;
OPTIMIZE TABLE users;  -- 整理碎片，大表谨慎（锁表风险）
```

表数据量剧变后优化器可能选错计划，需 ANALYZE。

---

## 📌 连接池与应用层

慢 SQL 有时是 **连接池耗尽** 表现为慢：

- HikariCP `maximumPoolSize`、连接泄漏检测
- 见 [Spring Boot 数据访问](../spring/boot/05-data-access)

**N+1 问题：** ORM 循环查库 → 改 JOIN 或 `@EntityGraph` / MyBatis 批量 IN。

---

## 📌 规范与门禁

| 规范 | 说明 |
|------|------|
| 核心 SQL Code Review | 必带 EXPLAIN |
| 禁止生产 `SELECT *` 大表 | |
| 分页上限 | 如 max offset 10000 |
| SQL 审计 | Yearning、Archery 等平台 |
| 压测 | 上线前 JMeter + 生产量级数据 |

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 盲目加索引 | 写变慢、占空间 |
| 只看平均耗时 | 关注 P99 |
| 在从库调优未验主库 | 负载不同 |
| `SQL_NO_CACHE` 测完就信 | 要多次、带数据量 |
| 优化器 hint 滥用 | `FORCE INDEX` 最后手段 |

---

## 本章小结

- 慢 log + EXPLAIN + 索引/改写 三板斧
- 深分页、大 COUNT、大 JOIN 是高频痛点
- 应用层连接池、N+1 与 DB 层一起查

---

## 下一步

- [读写分离与分库分表](./06-sharding-readwrite)

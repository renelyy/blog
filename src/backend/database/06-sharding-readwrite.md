# 主从、读写分离与分库分表

[← 返回索引](./index)

> **本节目标：** 了解 MySQL 主从复制原理、读写分离架构与分库分表入门，知道何时上 ShardingSphere。

---

## ⭐ 为什么需要扩展

| 瓶颈 | 方向 |
|------|------|
| 读 QPS 高 | 读写分离、读从库、缓存 |
| 写 QPS 高、单表过大 | 分库分表 |
| 磁盘/内存单机上限 | 垂直拆库、水平分片 |
| 高可用 | 主从 + 自动 failover（MGR/Orchestrator） |

**顺序：** 先优化 SQL/索引 → 缓存 Redis → 读写分离 → 再分库分表（成本最高）。

---

## ⭐ 主从复制原理

```text
主库 (Master)
  → binlog（二进制日志，记录变更）
  → 从库 IO 线程拉取 binlog → relay log
  → 从库 SQL 线程重放 relay log
从库 (Slave) 可读不可写（只读实例）
```

```sql
-- 主库查看 binlog
SHOW MASTER STATUS;
SHOW BINARY LOGS;

-- 从库状态
SHOW SLAVE STATUS\G
-- Seconds_Behind_Master：主从延迟秒数
```

| 模式 | 说明 |
|------|------|
| 异步复制 | 默认；主库不等从库 |
| 半同步 | 至少一个从库 ack 才返回 |
| GTID | 全局事务 ID，故障切换友好 |

**主从延迟：** 大事务、从库硬件差、单线程回放（MySQL 5.7+ 并行回放改善）→ 读从库可能**脏读旧数据**。

---

## ⭐ 读写分离

```text
                    ┌→ 主库（写）
应用 → 数据源路由 ──┤
                    └→ 从库1、从库2（读）
```

### Spring 实现方式

| 方式 | 说明 |
|------|------|
| **动态数据源** | `@DS("master")` / `@DS("slave")` |
| **ShardingSphere** | 内置读写分离规则 |
| **MyBatis 拦截器** | 根据 SQL 类型路由 |

```java
@Transactional  // 默认走主库
public void createOrder(Order o) { mapper.insert(o); }

@DS("slave")
public List<Order> listOrders() { return mapper.selectList(); }
```

**规范：**

- 写后立刻读要**走主库**（避免延迟读到旧值）
- 强一致读用主库或等同步（ rare）

---

## ⭐ 分库分表入门

### 垂直拆分

- **垂直分库：** 按业务拆（用户库、订单库、商品库）
- **垂直分表：** 大字段拆扩展表（`user` + `user_profile`）

### 水平拆分

- **分库：** 多个库相同 schema
- **分表：** 单库内 `orders_0` … `orders_15`

**路由键（Sharding Key）：** 常用 `user_id`、`order_id` — 保证同一用户订单在同一分片，避免跨库 JOIN。

```text
shard = hash(user_id) % 16  →  orders_3
```

---

## ⭐ ShardingSphere 概念

```yaml
# 逻辑表 orders → 物理 orders_0..15
rules:
  - !SHARDING
    tables:
      orders:
        actualDataNodes: ds$->{0..1}.orders_$->{0..15}
        tableStrategy:
          standard:
            shardingColumn: user_id
            shardingAlgorithmName: mod16
```

| 问题 | 方案 |
|------|------|
| 跨分片查询 | 绑定表、广播表、ES 宽表 |
| 分布式主键 | 雪花 ID |
| 跨分片事务 | 尽量规避；Seata/最终一致 |
| 扩容 | 成倍扩容 + 数据迁移（双倍写入） |

---

## 📌 与现有栈衔接

- [MyBatis](../mybatis/) + ShardingSphere-JDBC 透明分片
- [Spring Boot 多数据源](../spring/boot/05-data-access)
- 分布式 ID 见 [分布式章节](../distributed/02-idempotency-retry)

---

## 📌 何时不要分库分表

- 单表少于 500 万～千万行且索引合理，往往不必
- 团队无 DBA/运维支撑
- 可先 **归档历史表** + 分区表（MySQL PARTITION）

```sql
-- 按时间分区（RANGE）
CREATE TABLE logs (
  id BIGINT, log_time DATETIME, ...
) PARTITION BY RANGE (YEAR(log_time)) (
  PARTITION p2023 VALUES LESS THAN (2024),
  PARTITION p2024 VALUES LESS THAN (2025)
);
```

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 写后读从库 | 业务逻辑错误 |
| 分片键选错 | 跨库 JOIN、热点分片 |
| 全局 ID 自增 | 分库后冲突 → 雪花 |
| 分布式事务滥用 | 性能差；能业务补偿则补偿 |
| 分完无法 JOIN | 设计阶段就要考虑查询路径 |

---

## 本章小结

- 主从 = binlog 复制；注意主从延迟对读的影响
- 读写分离用动态数据源；写后读走主库
- 分库分表是最后手段；ShardingSphere 是 Java 生态常用方案

---

## 相关模块

- [Redis 缓存](../redis/) — 在读扩展之前 often 先上缓存
- [分布式系统](../distributed/)

---

## 下一步

- [返回 database 索引](./index)
- 或继续 [Redis 指南](../redis/)

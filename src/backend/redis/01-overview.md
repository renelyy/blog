# Redis 概览与安装

[← 返回索引](./index)

> **本节目标：** 理解 Redis 是什么、适用场景、部署方式与基本配置。

---

## ⭐ Redis 是什么

**Redis**（Remote Dictionary Server）= 基于内存的 **Key-Value 数据库**，支持多种数据结构，读写极快（微秒级）。

| 特点 | 说明 |
|------|------|
| 内存存储 | 热数据放内存；可 RDB/AOF 持久化 |
| 单线程执行命令 | 命令原子、无锁竞争；6.0+ 多线程 IO |
| 丰富数据结构 | String、Hash、List、Set、ZSet 等 |
| 高可用 | 主从、Sentinel、Cluster |

**不是：** 关系型数据库替代品 — **缓存、会话、计数、锁、队列** 才是主战场。

---

## ⭐ 适用场景

| 场景 | 示例 |
|------|------|
| **缓存** | 用户信息、字典、热点商品 |
| **Session** | 分布式登录态、Token 黑名单 |
| **计数器** | 点赞数、库存预扣、限流 |
| **分布式锁** | 订单防重、库存扣减 |
| **排行榜** | ZSet 按分数排序 |
| **消息队列** | List / Stream（轻量队列） |
| **Geo** | 附近的人、设备位置 |

**不适合：** 海量冷数据归档、复杂关联查询、强一致金融账本（需配合 DB）。

---

## ⭐ 架构选型

```text
开发/单机
  └── 单实例 Redis

生产（中小）
  └── 主从 + Sentinel（自动 failover）

生产（大流量、大数据量）
  └── Redis Cluster（16384 slot 分片）
```

| 模式 | 说明 |
|------|------|
| 单机 | 开发测试 |
| 主从复制 | 读扩展、备份 |
| Sentinel | 监控 + 自动切换主节点 |
| Cluster | 水平分片，无中心节点 |

---

## ⭐ 安装与启动

### Docker（推荐开发）

```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
docker exec -it redis redis-cli
```

### 配置文件要点 `redis.conf`

```conf
bind 0.0.0.0
port 6379
requirepass your_strong_password
maxmemory 2gb
maxmemory-policy allkeys-lru

# 持久化
save 900 1
save 300 10
appendonly yes
appendfsync everysec
```

---

## ⭐ redis-cli 基础

```bash
redis-cli -h 127.0.0.1 -p 6379 -a password

127.0.0.1:6379> PING
PONG
127.0.0.1:6379> SET name Tom
OK
127.0.0.1:6379> GET name
"Tom"
127.0.0.1:6379> KEYS *        # 生产禁用 KEYS，用 SCAN
127.0.0.1:6379> INFO memory
127.0.0.1:6379> DBSIZE
```

---

## ⭐ 持久化：RDB vs AOF

| | RDB | AOF |
|---|-----|-----|
| 方式 | 快照（某时刻全量） | 记录每条写命令 |
| 恢复 | 快 | 慢（可重写压缩） |
| 丢失 | 两次快照间可能丢 | everysec 最多丢 1 秒 |
| 文件 | dump.rdb | appendonly.aof |

**企业常见：** 两者都开（RDB 备份 + AOF 少丢数据），或仅 AOF + `appendfsync everysec`。

---

## ⭐ 内存淘汰策略

`maxmemory` 满时：

| 策略 | 说明 |
|------|------|
| `noeviction` | 写报错（默认） |
| `allkeys-lru` | 所有 key LRU 淘汰 — **缓存常用** |
| `volatile-lru` | 仅带 TTL 的 key LRU |
| `allkeys-lfu` | Redis 4+ 频率淘汰 |

**规范：** 缓存 key **必须设 TTL**，避免内存打满。

---

## 📌 与 MySQL 分工

```text
MySQL：权威数据源、事务、复杂查询
Redis：热数据副本、加速读、短期状态
         ↓  miss
      回源 DB 并回填缓存
```

见 [数据库指南](../database/)、[缓存模式](./03-cache-patterns)。

---

## 📌 企业部署注意

| 项 | 建议 |
|----|------|
| 密码 | 必须 `requirepass`；生产 ACL |
| 网络 | 不暴露公网；内网/VPC |
| 监控 | 内存、连接数、命中率、慢 log |
| 版本 | Redis 6/7 LTS；Spring Boot 3 默认 Lettuce |
| 大 key | 禁止单 key 几十 MB（阻塞、迁移难） |

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 把 Redis 当唯一存储 | 必须能回源 DB |
| 无 TTL | 内存泄漏式增长 |
| `KEYS *` 生产使用 | 阻塞单线程 → 用 SCAN |
| 无 maxmemory | OOM 被系统 kill |
| 弱密码/无密码 | 公网扫端口勒索 |

---

## 本章小结

- Redis = 内存 KV + 多结构 + 高并发辅助存储
- 场景：缓存、Session、锁、计数、排行榜
- 生产：主从/Sentinel/Cluster + 持久化 + maxmemory + 密码

---

## 下一步

- [数据结构与命令](./02-data-structures)

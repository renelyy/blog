# 数据结构与命令

[← 返回索引](./index)

> **本节目标：** 掌握 Redis 五大数据结构及企业常用命令。

---

## ⭐ 通用 key 命令

```bash
SET user:1001 "{\"name\":\"Tom\"}" EX 3600    # 3600 秒过期
GET user:1001
TTL user:1001          # 剩余秒数；-1 永不过期；-2 不存在
EXPIRE user:1001 7200
DEL user:1001
EXISTS user:1001
SCAN 0 MATCH user:* COUNT 100   # 迭代，替代 KEYS
RENAME old new
TYPE user:1001
```

**Key 命名规范：** `业务:模块:标识`，如 `order:detail:10001`、`cache:user:1001`。

---

## ⭐ String

最常用；二进制安全（可存 JSON、数字、图片小对象）。

```bash
SET counter 0
INCR counter              # 原子 +1
INCRBY counter 10
DECR counter
MSET k1 v1 k2 v2
MGET k1 k2

SETNX lock:order:1001 1   # 不存在才 SET — 简单锁基础
SET lock:order:1001 1 NX EX 30   # 推荐：NX + 过期
```

| 场景 | 用法 |
|------|------|
| 缓存 | `SET key json EX ttl` |
| 计数 | `INCR` |
| 分布式锁 | `SET key uuid NX EX 30` |
| 限流 | `INCR` + EXPIRE |

---

## ⭐ Hash

字段 map，适合对象属性（比整 JSON String 省改单个字段）。

```bash
HSET user:1001 name Tom email tom@x.com
HGET user:1001 name
HMGET user:1001 name email
HGETALL user:1001
HDEL user:1001 email
HINCRBY user:1001 loginCount 1
```

**注意：** `HGETALL` 大 hash 慎用；字段多时用独立 key 或 String JSON。

---

## ⭐ List

双向链表，队列/栈。

```bash
LPUSH queue:task task1 task2
RPOP queue:task
BRPOP queue:task 10        # 阻塞 pop，超时 10 秒 — 简单消费者
LLEN queue:task
LRANGE queue:task 0 -1
```

| 模式 | 命令 |
|------|------|
| 栈 | LPUSH + LPOP |
| 队列 | LPUSH + RPOP |
| 阻塞队列 | BRPOP |

**企业：** 轻量队列可用 List；**可靠消息**仍推荐 Kafka/RabbitMQ，见 [消息队列](../messaging/)。

---

## ⭐ Set

无序、不重复。

```bash
SADD tags:article:1 java redis spring
SMEMBERS tags:article:1
SISMEMBER tags:article:1 java
SINTER tags:1 tags:2       # 交集
SUNION tags:1 tags:2       # 并集
SCARD tags:article:1
```

场景：标签、共同好友、去重集合、**抽奖去重**。

---

## ⭐ Sorted Set（ZSet）

带分数有序集合 — **排行榜**核心。

```bash
ZADD rank:score 95.5 user:1001 88.0 user:1002
ZREVRANGE rank:score 0 9 WITHSCORES   # Top 10
ZRANK rank:score user:1001
ZINCRBY rank:score 1 user:1001
ZCOUNT rank:score 80 100
ZREM rank:score user:1002
```

场景：排行榜、延迟队列（score = 执行时间戳）、范围查询。

---

## 📌 其他常用结构

| 类型 | 说明 |
|------|------|
| **Bitmap** | 位图；签到、在线状态 |
| **HyperLogLog** | 基数估算；UV 统计 |
| **Geo** | 经纬度；`GEOADD`、`GEORADIUS` |
| **Stream** | 5.0+ 消息流；消费组 |

```bash
SETBIT sign:202406:1001 29 1
GETBIT sign:202406:1001 29
BITCOUNT sign:202406:1001

PFADD uv:20240630 user1 user2 user1
PFCOUNT uv:20240630
```

---

## 📌 管道 Pipeline 与事务

```java
// Lettuce 管道 — 减少 RTT
redisTemplate.executePipelined((RedisCallback<Object>) connection -> {
  for (String k : keys) {
    connection.stringCommands().get(k.getBytes());
  }
  return null;
});
```

```bash
MULTI
INCR account:1
DECR account:2
EXEC          # 原子批量；非 rollback 型事务
```

**Lua 脚本：** 复杂原子逻辑（扣库存）在 Redis 端一次执行。

---

## 📌 序列化与 Java 类型

Spring `RedisTemplate` 默认 JDK 序列化可读性差；生产用 **JSON**（Jackson）或 **String**：

```java
@Bean
public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
  RedisTemplate<String, Object> template = new RedisTemplate<>();
  template.setConnectionFactory(factory);
  template.setKeySerializer(RedisSerializer.string());
  template.setValueSerializer(RedisSerializer.json());
  return template;
}
```

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 大 key / 大 value | 阻塞、慢；拆 key 或压缩 |
| `HGETALL` / `SMEMBERS` 大集合 | 一次拉全量 O(n) |
| 无过期 | 内存涨 |
| 热 key 单分片 | Cluster 下某 slot 过热 |
| 用 List 当可靠 MQ | 无 ACK、易丢 — 用专业 MQ |

---

## 本章小结

- String/Hash/List/Set/ZSet 覆盖 90% 业务
- 原子 INCR、SET NX EX、ZSet 排行是高频模式
- 命名规范 + TTL + 避免大 key

---

## 下一步

- [缓存模式与三大问题](./03-cache-patterns)

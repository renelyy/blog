# 分布式锁与限流

[← 返回索引](./index)

> **本节目标：** 跨 JVM 互斥、Redisson 实践，以及限流算法与 Sentinel 入门。

---

## ⭐ 为什么需要分布式锁

多实例部署时，JVM 内 `synchronized` / `ReentrantLock` **无法跨进程**：

```text
实例 A ──┐
实例 B ──┼── 同时扣库存 → 超卖
实例 C ──┘
```

需要 **所有 JVM 共享** 的锁 → Redis / ZooKeeper / etcd。

见 [并发编程](../java/core-java/vol1/12-concurrency)、[Redis 分布式锁](../redis/04-distributed-lock)。

---

## ⭐ Redis 锁四要素

```bash
SET lock:order:1001 <唯一token> NX EX 30
```

| 要素 | 说明 |
|------|------|
| **互斥** | SET NX |
| **防死锁** | EX 过期 |
| **谁加谁释** | value 存 UUID |
| **原子删** | Lua 比对后 DEL |

```java
String token = UUID.randomUUID().toString();
Boolean ok = redisTemplate.opsForValue()
    .setIfAbsent("lock:stock:" + skuId, token, Duration.ofSeconds(30));
if (Boolean.TRUE.equals(ok)) {
  try {
    deductStock(skuId, qty);
  } finally {
    unlock("lock:stock:" + skuId, token);  // Lua 脚本
  }
} else {
  throw new BusinessException("请稍后重试");
}
```

---

## ⭐ Redisson（企业推荐）

```xml
<dependency>
  <groupId>org.redisson</groupId>
  <artifactId>redisson-spring-boot-starter</artifactId>
</dependency>
```

```java
RLock lock = redisson.getLock("lock:order:" + orderId);
try {
  // waitTime: 等待获锁；leaseTime: -1 启用看门狗自动续期
  if (lock.tryLock(3, 30, TimeUnit.SECONDS)) {
    processOrder(orderId);
  }
} finally {
  if (lock.isHeldByCurrentThread()) {
    lock.unlock();
  }
}
```

| 特性 | 说明 |
|------|------|
| **看门狗** | 业务未完成时自动续期 |
| **可重入** | 同线程多次 lock |
| **公平锁 / 读写锁** | `getFairLock`、`getReadWriteLock` |

**主从切换丢锁：** 极端场景 RedLock 有争议；金融级可用 **ZK 临时顺序节点** 或 **DB 悲观锁**。

---

## ⭐ ZooKeeper 锁（CP）

```text
/locks/order_1001/
  ├── seq_0000000001  ← 最小序号持锁
  └── seq_0000000002  ← 监听前一个节点
```

**优点：** 强一致、会话断开自动释放  
**缺点：** 性能、运维成本 — 适合 **低频、强一致**（选主、调度）

---

## ⭐ 数据库悲观锁

```sql
SELECT stock FROM product WHERE id = ? FOR UPDATE;
-- 同一行串行 — 简单可靠，高并发成为瓶颈
```

**适用：** 单库、并发不高、强一致扣减；与 [事务隔离](../database/03-transaction-isolation) 配合。

---

## ⭐ 锁粒度与时长

| 原则 | 说明 |
|------|------|
| **锁粒度要小** | `lock:sku:123` 而非 `lock:global` |
| **锁内不做 RPC** | 防锁持有过久 |
| **能不用锁就不用** | 乐观锁、DB 唯一约束、MQ 串行消费 |
| **TTL 大于 P99 业务时间** | 或用看门狗 |

```java
// 反例：锁内调支付
lock.lock();
try {
  paymentClient.charge(...);  // 可能 5s+
  updateOrder();
} finally {
  lock.unlock();
}
// 正例：先 RPC，短事务写库 + 乐观锁
```

---

## ⭐ 限流

保护系统 **不被流量打垮**。

| 算法 | 说明 |
|------|------|
| **固定窗口** | 每分钟 N 次 — 边界突刺 |
| **滑动窗口** | 平滑 |
| **令牌桶** | 匀速 + 突发 |
| **漏桶** | 恒定流出 |

### Redis 滑动窗口（示意）

```java
long now = System.currentTimeMillis();
String key = "rate:user:" + userId;
redis.zRemRangeByScore(key, 0, now - 60000);
Long count = redis.zCard(key);
if (count >= 100) {
  throw new RateLimitException();
}
redis.zAdd(key, now, UUID.randomUUID().toString());
redis.expire(key, 60, TimeUnit.SECONDS);
```

### Sentinel

```java
@SentinelResource(value = "createOrder", blockHandler = "createOrderBlock")
public Order createOrder(CreateOrderCmd cmd) { ... }

public Order createOrderBlock(CreateOrderCmd cmd, BlockException ex) {
  throw new BusinessException("系统繁忙，请稍后");
}
```

Gateway 层限流 + 服务层 `@SentinelResource` 双层防护。

---

## 📌 锁 vs 限流 vs 熔断

| 手段 | 目的 |
|------|------|
| **锁** | 互斥，防并发写冲突 |
| **限流** | 控入口 QPS |
| **熔断** | 下游故障时快速失败 |

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| SET NX 无 EX | 死锁 |
| DEL 不校验 token | 删别人锁 |
| 锁过期业务仍跑 | 双写 — 看门狗或续期 |
| 全局大锁 | 性能差 |
| 限流阈值从不调 | 误杀或仍被打挂 |

---

## 本章小结

- Redis + Redisson 是企业 **分布式锁** 主流；ZK/DB 用于特殊场景
- 锁粒度小、锁内短、优先乐观锁/幂等
- 限流：令牌桶 + Sentinel；与熔断配合

---

## 下一步

- [分布式事务](./04-distributed-transaction)

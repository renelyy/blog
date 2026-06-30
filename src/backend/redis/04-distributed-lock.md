# 分布式锁

[← 返回索引](./index)

> **本节目标：** 理解 Redis 分布式锁原理、正确实现方式，以及 Redisson 看门狗。

---

## ⭐ 为什么需要分布式锁

多实例部署时，JVM 内 `synchronized` / `ReentrantLock` **无法跨进程**：

```text
实例 A ──┐
实例 B ──┼── 同时扣库存 → 超卖
实例 C ──┘
```

需要 **所有 JVM 共享** 的锁 → Redis / ZooKeeper / etcd。

见 [并发编程](../java/core-java/vol1/12-concurrency)、[分布式章节](../distributed/03-distributed-lock)。

---

## ⭐ 基础实现：SET NX EX

```bash
SET lock:order:1001 <唯一token> NX EX 30
# NX — 不存在才设置
# EX 30 — 30 秒自动过期，防死锁
```

```java
String token = UUID.randomUUID().toString();
Boolean ok = redisTemplate.opsForValue()
    .setIfAbsent("lock:order:" + orderId, token, Duration.ofSeconds(30));
if (Boolean.TRUE.equals(ok)) {
  try {
    processOrder(orderId);
  } finally {
    // 必须校验 token 再删 — 防误删别人锁
    String script = """
        if redis.call('get', KEYS[1]) == ARGV[1] then
          return redis.call('del', KEYS[1])
        else
          return 0
        end
        """;
    redisTemplate.execute(new DefaultRedisScript<>(script, Long.class),
        List.of("lock:order:" + orderId), token);
  }
}
```

**四要素：**

1. **互斥** — SET NX
2. **防死锁** — 过期时间 EX
3. **谁加谁释** — value 存 UUID，删前比对
4. **原子删** — Lua 脚本

---

## ⭐ 仍存在的问题

| 问题 | 说明 |
|------|------|
| **业务未完成锁过期** | 线程 A 锁 30s，业务跑 40s → B 拿到锁 → 双写 |
| **主从切换丢锁** | 写 master 未同步到 slave，master 宕 → slave 无锁 |
| **可重入** | 简单 SET 不支持同线程重入 |

**解决业务超时：** Redisson **看门狗** 自动续期；或合理评估 TTL + 业务超时中断。

**解决主从：** RedLock（争议多）；生产常用 **Redisson + 官方 Cluster** 或 **ZooKeeper 强一致锁**。

---

## ⭐ Redisson（企业推荐）

```xml
<dependency>
  <groupId>org.redisson</groupId>
  <artifactId>redisson-spring-boot-starter</artifactId>
  <version>3.27.0</version>
</dependency>
```

```java
@Service
@RequiredArgsConstructor
public class OrderService {
  private final RedissonClient redisson;

  public void handle(Long orderId) {
    RLock lock = redisson.getLock("lock:order:" + orderId);
    try {
      if (lock.tryLock(5, 30, TimeUnit.SECONDS)) {
        // wait 5s，lease 30s，看门狗自动续期
        doBusiness(orderId);
      } else {
        throw new BusinessException("系统繁忙，请重试");
      }
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new RuntimeException(e);
    } finally {
      if (lock.isHeldByCurrentThread()) {
        lock.unlock();
      }
    }
  }
}
```

| 特性 | 说明 |
|------|------|
| 看门狗 | 默认 30s 续期，业务没完不会丢锁 |
| 可重入 | 同线程多次 lock |
| 公平锁 / 读写锁 | `getFairLock`、`getReadWriteLock` |
| 联锁 MultiLock | 多资源同时锁 |

---

## 📌 与 @Transactional 配合

```java
@Transactional
public void transfer() {
  RLock lock = redisson.getLock("lock:account:" + id);
  lock.lock();
  try {
    // DB 事务在锁内 — 锁粒度要小，避免长事务
  } finally {
    lock.unlock();
  }
}
```

**顺序建议：** 先拿锁再开事务（或锁内短事务）；**避免** 事务未提交就释放锁。

---

## 📌 锁粒度与命名

```text
lock:{业务}:{资源id}
lock:order:create:{userId}     # 防重复下单
lock:stock:deduct:{skuId}      # 库存
lock:job:sync:DailyReport      # 定时任务单跑
```

- 粒度太粗 → 并发差
- 粒度太细 → 锁数量多、管理难

---

## 📌 替代方案

| 方案 | 适用 |
|------|------|
| Redis + Redisson | 一般业务、高性能 |
| ZooKeeper / etcd | 强一致、协调 |
| DB 悲观锁 `FOR UPDATE` | 低并发、简单 |
| DB 乐观锁 version | 冲突少 |
| 消息队列串行 | 天然顺序消费 |

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| `DEL lock` 不校验 token | 删掉其他线程的锁 |
| 无过期时间 | 死锁 |
| 过期时间过短 | 业务未完成锁丢失 |
| RedLock 过度迷信 | 多数场景 Redisson 单实例/Cluster 够用 |
| 锁内调外部 HTTP | 持锁时间过长 |

---

## 本章小结

- 正确锁 = SET NX EX + UUID + Lua 删
- 生产优先 **Redisson** 看门狗 + tryLock
- 锁粒度、与事务顺序、避免长临界区

---

## 下一步

- [Spring Boot 集成](./05-spring-redis)

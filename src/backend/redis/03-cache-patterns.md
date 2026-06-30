# 缓存模式与三大问题

[← 返回索引](./index)

> **本节目标：** 掌握 Cache-Aside 等模式，以及穿透、击穿、雪崩的成因与解决方案。

---

## ⭐ 为什么用缓存

```text
请求 → 查 Redis → 命中则返回（快）
              ↓ miss
            查 DB → 写回 Redis → 返回
```

| 指标 | 无缓存 | 有缓存 |
|------|--------|--------|
| 读延迟 | ms～几十 ms（DB） | 亚 ms（内存） |
| DB QPS | 高 | 大幅降低 |

**原则：** Redis 是 **DB 的加速层**，DB 仍是权威数据源。

---

## ⭐ Cache-Aside（旁路缓存）— 最常用

**读：**

```java
public User getUser(Long id) {
  String key = "cache:user:" + id;
  String json = redis.get(key);
  if (json != null) {
    return parse(json);  // 注意 null 缓存见下
  }
  User user = userMapper.selectById(id);
  if (user != null) {
    redis.set(key, toJson(user), Duration.ofMinutes(30));
  } else {
    redis.set(key, "", Duration.ofMinutes(5));  // 空值缓存防穿透
  }
  return user;
}
```

**写：**

```java
public void updateUser(User user) {
  userMapper.update(user);
  redis.del("cache:user:" + user.getId());  // 先更 DB 再删缓存
}
```

| 策略 | 说明 |
|------|------|
| 先删缓存再写 DB | 可能短暂不一致 |
| **先写 DB 再删缓存** | 企业更常见 |
| 延迟双删 | 删 → 写 DB → sleep → 再删（极端一致） |

---

## ⭐ 其他缓存模式

| 模式 | 说明 |
|------|------|
| **Read-Through** | 缓存层封装读，应用只调缓存 API |
| **Write-Through** | 写同时更新缓存与 DB |
| **Write-Behind** | 先写缓存，异步刷 DB（有丢数据风险） |

Spring `@Cacheable` 本质是 Cache-Aside 封装，见 [05-spring-redis](./05-spring-redis)。

---

## ⭐ 缓存穿透

**现象：** 查询**不存在**的数据，缓存没有，每次打穿到 DB（恶意 id 轰炸）。

**解决：**

```java
// 1. 空值缓存（短 TTL）
if (user == null) {
  redis.set(key, "NULL", Duration.ofMinutes(5));
  return null;
}

// 2. 布隆过滤器 — 不存在则直接拒绝
if (!bloomFilter.mightContain(id)) {
  return null;
}
```

---

## ⭐ 缓存击穿

**现象：** **热点 key** 过期瞬间，大量请求同时打到 DB。

**解决：**

```java
// 1. 互斥锁（只有一个线程回源）
String lockKey = "lock:cache:user:" + id;
if (redis.set(lockKey, "1", "NX", "EX", 10)) {
  try {
    user = loadFromDb(id);
    redis.set(cacheKey, toJson(user), ttl);
  } finally {
    redis.del(lockKey);
  }
} else {
  Thread.sleep(50);
  return getUser(id);  // 重试或等待
}

// 2. 逻辑过期 — key 不设 TTL，value 里带 expireTime，异步刷新
// 3. 热点 key 永不过期 + 后台定时刷新
```

---

## ⭐ 缓存雪崩

**现象：** **大量 key 同时过期** 或 **Redis 宕机**，DB 被压垮。

**解决：**

| 手段 | 说明 |
|------|------|
| TTL 加随机 jitter | `baseTtl + random(0, 300)` 秒 |
| 多级缓存 | 本地 Caffeine + Redis |
| 高可用 | Sentinel / Cluster |
| 限流降级 | Sentinel、Hystrix；返回默认值 |
| 预热 | 启动/大促前加载热点 |

```java
Duration ttl = Duration.ofMinutes(30).plusSeconds(ThreadLocalRandom.current().nextInt(300));
```

---

## 📌 本地缓存 Caffeine

```java
LoadingCache<Long, User> local = Caffeine.newBuilder()
    .maximumSize(10_000)
    .expireAfterWrite(5, TimeUnit.MINUTES)
    .build(id -> loadFromRedisOrDb(id));
```

**L1 本地 + L2 Redis + L3 DB** — 注意本地缓存**多实例不一致**，TTL 要短。

---

## 📌 监控指标

| 指标 | 说明 |
|------|------|
| 命中率 | `hits / (hits + misses)` |
| 内存使用率 | 接近 maxmemory 告警 |
| 慢查询 | `SLOWLOG GET` |
| 连接数 | 连接池泄漏 |
| 热 key | Redis 4+ `MEMORY USAGE key` |

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 缓存与 DB 双写不一致 | 明确删缓存时机；接受短暂最终一致 |
| 缓存对象含 LocalDateTime | JSON 序列化时区问题 |
| `@Cacheable` 同类自调用失效 | AOP 代理问题 |
| 把整个列表塞一个 key | 大 value；分页或 Hash |
| 无降级 | Redis 挂全站挂 — 限流 + 直连 DB 兜底 |

---

## 本章小结

- Cache-Aside：读 miss 回源写缓存；写 DB 后删缓存
- 穿透 → 空值/布隆；击穿 → 锁/逻辑过期；雪崩 → TTL 随机 + 高可用
- 本地 + Redis 多级按场景使用

---

## 下一步

- [分布式锁](./04-distributed-lock)

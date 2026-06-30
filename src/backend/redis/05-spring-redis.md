# Spring Boot 集成

[← 返回索引](./index)

> **本节目标：** 掌握 Spring Data Redis、RedisTemplate、@Cacheable 与 Redisson 在 Boot 项目中的配置与用法。

---

## ⭐ 依赖与配置

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

Boot 3 默认客户端 **Lettuce**（异步、连接池）。

```yaml
spring:
  data:
    redis:
      host: ${REDIS_HOST:127.0.0.1}
      port: 6379
      password: ${REDIS_PASSWORD:}
      database: 0
      timeout: 3s
      lettuce:
        pool:
          max-active: 16
          max-idle: 8
          min-idle: 2
          max-wait: 3s
```

**Cluster：**

```yaml
spring:
  data:
    redis:
      cluster:
        nodes:
          - 10.0.0.1:6379
          - 10.0.0.2:6379
          - 10.0.0.3:6379
```

更多见 [Boot Redis 章节](../spring/boot/08-nosql-redis)。

---

## ⭐ RedisTemplate

```java
@Configuration
public class RedisConfig {

  @Bean
  public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
    RedisTemplate<String, Object> template = new RedisTemplate<>();
    template.setConnectionFactory(factory);
    template.setKeySerializer(RedisSerializer.string());
    template.setHashKeySerializer(RedisSerializer.string());
    template.setValueSerializer(RedisSerializer.json());
    template.setHashValueSerializer(RedisSerializer.json());
    template.afterPropertiesSet();
    return template;
  }

  @Bean
  public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory factory) {
    return new StringRedisTemplate(factory);
  }
}
```

```java
@Service
@RequiredArgsConstructor
public class TokenStore {
  private final StringRedisTemplate redis;

  public void save(String userId, String token, Duration ttl) {
    redis.opsForValue().set("token:" + userId, token, ttl);
  }

  public Optional<String> get(String userId) {
    return Optional.ofNullable(redis.opsForValue().get("token:" + userId));
  }

  public void delete(String userId) {
    redis.delete("token:" + userId);
  }
}
```

### 常用 Ops

| API | 结构 |
|-----|------|
| `opsForValue()` | String |
| `opsForHash()` | Hash |
| `opsForList()` | List |
| `opsForSet()` | Set |
| `opsForZSet()` | ZSet |

---

## ⭐ @Cacheable 声明式缓存

```yaml
spring:
  cache:
    type: redis
    redis:
      time-to-live: 30m
      cache-null-values: false
      key-prefix: "app:"
```

```java
@Configuration
@EnableCaching
public class CacheConfig { }

@Service
public class UserService {

  @Cacheable(cacheNames = "user", key = "#id")
  public User findById(Long id) {
    return userMapper.selectById(id);
  }

  @CachePut(cacheNames = "user", key = "#user.id")
  public User update(User user) {
    userMapper.update(user);
    return user;
  }

  @CacheEvict(cacheNames = "user", key = "#id")
  public void delete(Long id) {
    userMapper.deleteById(id);
  }
}
```

| 注解 | 作用 |
|------|------|
| `@Cacheable` | 有缓存则直接返回 |
| `@CachePut` | 总是执行并更新缓存 |
| `@CacheEvict` | 删除缓存 |
| `@Caching` | 组合多个 |

**注意：** 同类内部调用不走 AOP — 需注入自身或拆 Service。

见 [Framework 缓存集成](../spring/framework/10-integration)。

---

## ⭐ Redisson 集成

```yaml
spring:
  data:
    redis:
      host: 127.0.0.1
```

Redisson Starter 自动 `RedissonClient`：

```java
@Autowired RedissonClient redisson;

RLock lock = redisson.getLock("myLock");
RMapCache<String, User> map = redisson.getMapCache("users");
RAtomicLong counter = redisson.getAtomicLong("counter");
```

分布式锁详见 [04-distributed-lock](./04-distributed-lock)。

---

## 📌 序列化与 DTO

- 缓存 **DTO** 而非 JPA Entity（懒加载、代理问题）
- `LocalDateTime` 配置 Jackson 模块
- 升级类结构注意缓存兼容 — 改 key 版本 `user:v2:`

---

## 📌 连接与健康检查

```yaml
management:
  health:
    redis:
      enabled: true
```

```java
@Component
@RequiredArgsConstructor
public class RedisHealthIndicator implements HealthIndicator {
  private final StringRedisTemplate redis;

  @Override
  public Health health() {
    try {
      redis.opsForValue().get("ping");
      return Health.up().build();
    } catch (Exception ex) {
      return Health.down(ex).build();
    }
  }
}
```

---

## 📌 与 MyBatis 配合

```java
@Cacheable("product")
public Product getProduct(Long id) {
  return productMapper.selectById(id);  // miss 时查 DB
}
```

热点 SQL 结果缓存 + [数据库索引](../database/02-index-and-explain) 双层优化。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| JDK 序列化 | 改用 JSON |
| 连接池未配置 | 高并发下连接耗尽 |
| `@Cacheable` key 拼错 | 缓存污染 |
| Redis 超时未设 | 阻塞拖垮线程池 |
| 事务内缓存 | 事务回滚缓存已写 — 先提交再缓存或 evict |

---

## 本章小结

- Boot + Lettuce + RedisTemplate / StringRedisTemplate 是标准栈
- `@Cacheable` 快速加缓存；复杂逻辑手写 Cache-Aside
- Redisson 补分布式锁与高级结构

---

## 相关模块

- [消息队列](../messaging/) — List/Stream 不能替代可靠 MQ
- [分布式系统](../distributed/)

---

## 下一步

- [返回 Redis 索引](./index)
- 或继续 [安全与鉴权](../security/)

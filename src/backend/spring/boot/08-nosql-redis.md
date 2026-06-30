# Redis 与 NoSQL

[← Boot 首页](./index)

> 对应官方 [Data → NoSQL](https://docs.spring.io/spring-boot/reference/data/nosql.html)。

---

## ⭐ Spring Data Redis

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
      password: 
      database: 0
      timeout: 3s
      lettuce:
        pool:
          max-active: 8
```

---

## RedisTemplate

```java
@Service
@RequiredArgsConstructor
public class TokenStore {
  private final StringRedisTemplate redis;

  public void saveToken(String userId, String token, Duration ttl) {
    redis.opsForValue().set("token:" + userId, token, ttl);
  }

  public Optional<String> getToken(String userId) {
    return Optional.ofNullable(redis.opsForValue().get("token:" + userId));
  }
}
```

---

## 📌 @Cacheable + Redis

```yaml
spring:
  cache:
    type: redis
  data:
    redis:
      host: localhost
```

见 [Framework 缓存](../framework/10-integration)。

---

## 📌 Redisson / 分布式锁

```xml
<dependency>
  <groupId>org.redisson</groupId>
  <artifactId>redisson-spring-boot-starter</artifactId>
  <version>3.27.0</version>
</dependency>
```

```java
RLock lock = redisson.getLock("order:" + orderId);
try {
  if (lock.tryLock(10, 30, TimeUnit.SECONDS)) {
    // 业务
  }
} finally {
  if (lock.isHeldByCurrentThread()) lock.unlock();
}
```

---

## 📌 MongoDB（了解）

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>
```

```java
public interface ArticleRepository extends MongoRepository<Article, String> {
  List<Article> findByAuthor(String author);
}
```

---

## 下一步

- [消息队列 Kafka/RabbitMQ](./09-messaging)

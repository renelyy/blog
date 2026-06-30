# 熔断与容错

[← Cloud 首页](./index)

> 防止下游故障扩散：Circuit Breaker、超时、舱壁。

---

## ⭐ 为什么需要熔断？

微服务链式调用：`A → B → C`，C 慢或挂 → B 线程阻塞 → A 雪崩。

**熔断器**：失败达阈值 → **打开** → 快速失败 / 降级 → 半开探测恢复。

---

## Spring Cloud Circuit Breaker

抽象层，可换 Resilience4j、Sentinel 等实现。

### Resilience4j（推荐）

```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-circuitbreaker-resilience4j</artifactId>
</dependency>
```

```java
@Service
public class OrderService {
  private final CircuitBreakerFactory cbFactory;
  private final UserClient userClient;

  public UserDto getUser(Long id) {
    CircuitBreaker cb = cbFactory.create("user-service");
    return cb.run(() -> userClient.getById(id),
        throwable -> UserDto.fallback());
  }
}
```

### 配置

```yaml
resilience4j:
  circuitbreaker:
    instances:
      user-service:
        slidingWindowSize: 10
        failureRateThreshold: 50
        waitDurationInOpenState: 10s
        permittedNumberOfCallsInHalfOpenState: 3
  timelimiter:
    instances:
      user-service:
        timeoutDuration: 3s
```

---

## 📌 @CircuitBreaker 注解（Resilience4j 集成）

```java
@CircuitBreaker(name = "user-service", fallbackMethod = "getUserFallback")
public UserDto getUser(Long id) {
  return userClient.getById(id);
}

public UserDto getUserFallback(Long id, Throwable t) {
  return UserDto.anonymous();
}
```

---

## 📌 Sentinel（Alibaba）

```xml
<dependency>
  <groupId>com.alibaba.cloud</groupId>
  <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>
```

```yaml
spring:
  cloud:
    sentinel:
      transport:
        dashboard: localhost:8080
```

支持 QPS 限流、热点参数、系统保护；控制台可视化规则。

---

## 📌 最佳实践

| 实践 | 说明 |
|------|------|
| 超时必设 | Feign readTimeout、WebClient、DB |
| 隔离 | 线程池 / 信号量隔离（Sentinel、Bulkhead） |
| 幂等 | 重试仅对幂等操作 |
| 降级 | 返回缓存/默认值，非直接 500 |
| 监控 | Actuator + Prometheus 看熔断状态 |

---

## 📌 与 Gateway 限流

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: order-route
          uri: lb://order-service
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20
```

需 `spring-boot-starter-data-redis-reactive`。

---

## 学习回顾

```text
Spring Framework  → IoC、AOP、MVC、事务
Spring Boot       → 自动配置、快速交付
Spring Cloud      → 注册发现、配置、网关、Feign、熔断
```

---

[← Cloud 首页](./index) · [Spring 生态首页](../index)

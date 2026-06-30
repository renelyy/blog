# OpenFeign 与负载均衡

[← Cloud 首页](./index)

> 声明式服务调用，替代手写 RestTemplate。

---

## ⭐ OpenFeign

```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

```java
@SpringBootApplication
@EnableFeignClients
public class OrderApplication { }
```

### 定义 Client

```java
@FeignClient(name = "user-service", path = "/api/users")
public interface UserClient {

  @GetMapping("/{id}")
  UserDto getById(@PathVariable("id") Long id);

  @PostMapping
  UserDto create(@RequestBody CreateUserRequest req);
}
```

```java
@Service
@RequiredArgsConstructor
public class OrderService {
  private final UserClient userClient;

  public void createOrder(CreateOrderRequest req) {
    UserDto user = userClient.getById(req.userId());
    // ...
  }
}
```

`name` 对应 `spring.application.name`，Feign + LoadBalancer 解析实例。

---

## 📌 配置

```yaml
spring:
  cloud:
    openfeign:
      client:
        config:
          default:
            connectTimeout: 5000
            readTimeout: 10000
            loggerLevel: basic
          user-service:
            readTimeout: 3000
```

---

## 📌 请求拦截器（传递 Token）

```java
@Configuration
public class FeignConfig {
  @Bean
  public RequestInterceptor authInterceptor() {
    return template -> {
      String token = RequestContextHolder.getToken(); // 从上下文取
      if (token != null) {
        template.header("Authorization", token);
      }
    };
  }
}
```

```java
@FeignClient(name = "user-service", configuration = FeignConfig.class)
public interface UserClient { }
```

---

## ⭐ Spring Cloud LoadBalancer

Ribbon 已进入维护；**LoadBalancer** 为官方替代：

```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-loadbalancer</artifactId>
</dependency>
```

默认轮询策略；可自定义 `ReactorLoadBalancer` / `ServiceInstanceListSupplier`。

---

## 📌 Feign + 熔断

```java
@FeignClient(name = "user-service", fallbackFactory = UserClientFallbackFactory.class)
public interface UserClient { }

@Component
public class UserClientFallbackFactory implements FallbackFactory<UserClient> {
  @Override
  public UserClient create(Throwable cause) {
    return id -> UserDto.anonymous(); // 降级逻辑
  }
}
```

需配合 `spring-cloud-starter-circuitbreaker-resilience4j`。

---

## 📌 vs RestTemplate

| | RestTemplate | OpenFeign |
|---|--------------|-----------|
| 风格 | 命令式 | 声明式接口 |
| 可读性 | 一般 | 高 |
| 与 MVC 注解 | 不同 | 复用 GetMapping 等 |

---

## 下一步

- [熔断与容错](./06-circuitbreaker)

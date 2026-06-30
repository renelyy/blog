# WebFlux 响应式入门

[← Framework 首页](./index)

> 对应官方 [Web → WebFlux](https://docs.spring.io/spring-framework/reference/web/webflux.html)。Servlet MVC 仍是主流；WebFlux 适合高并发 IO 密集。

---

## ⭐ Servlet vs Reactive

| | Spring MVC | WebFlux |
|---|------------|---------|
| 模型 | 阻塞 Servlet | 非阻塞 Reactive Streams |
| 容器 | Tomcat | Netty（默认） |
| 类型 | 普通对象 | `Mono<T>` / `Flux<T>` |
| 适用 | 业务 CRUD | 网关、聚合、流式 |

---

## 依赖

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

⚠️ **不要** 与 `spring-boot-starter-web` 同项目默认共存（除非明确分区）。

---

## ⭐ 函数式路由

```java
@Configuration
public class RouterConfig {
  @Bean
  public RouterFunction<ServerResponse> routes(UserHandler handler) {
    return route(GET("/api/users/{id}"), handler::getUser)
        .andRoute(POST("/api/users"), handler::create);
  }
}

@Component
public class UserHandler {
  private final UserRepository repo;

  public Mono<ServerResponse> getUser(ServerRequest req) {
    Long id = Long.parseLong(req.pathVariable("id"));
    return repo.findById(id)
        .flatMap(u -> ServerResponse.ok().bodyValue(u))
        .switchIfEmpty(ServerResponse.notFound().build());
  }
}
```

---

## 📌 注解式 @RestController

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
  @GetMapping("/{id}")
  public Mono<User> get(@PathVariable Long id) {
    return userService.findById(id);
  }

  @GetMapping
  public Flux<User> list() {
    return userService.findAll();
  }
}
```

---

## 📌 WebClient（响应式 HTTP 客户端）

```java
@Bean
public WebClient webClient(WebClient.Builder builder) {
  return builder.baseUrl("http://user-service").build();
}

public Mono<UserDto> fetchUser(Long id) {
  return webClient.get()
      .uri("/api/users/{id}", id)
      .retrieve()
      .bodyToMono(UserDto.class);
}
```

Boot 也提供 `RestClient`（同步，Boot 3.2+）和 `RestTemplate`。

---

## Mono / Flux 速记

| 类型 | 含义 |
|------|------|
| `Mono<T>` | 0~1 个元素 |
| `Flux<T>` | 0~N 个元素 |

```java
Mono.just(1);
Flux.range(1, 5);
Mono.error(new RuntimeException());
```

---

## 下一步

- [Boot 响应式 Web](../boot/09-reactive)
- [Cloud Gateway](../cloud/04-gateway)（基于 WebFlux）

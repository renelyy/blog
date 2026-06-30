# 响应式 Web（Boot）

[← Boot 首页](./index)

> 对应官方 [Web → Reactive](https://docs.spring.io/spring-boot/reference/web/reactive.html)。详见 [Framework WebFlux](../framework/09-webflux)。

---

## 何时选用

- 高并发长连接、流式 API
- Spring Cloud Gateway 同一技术栈
- 团队熟悉 Reactor

传统 CRUD 业务 **Servlet MVC 足够**，不必强行 WebFlux。

---

## 依赖与启动

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

默认 **Netty** 端口 8080。

---

## WebClient 配置

```java
@Configuration
public class WebClientConfig {
  @Bean
  public WebClient webClient(WebClient.Builder builder) {
    return builder
        .baseUrl("https://api.example.com")
        .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
        .codecs(c -> c.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
        .build();
  }
}
```

Boot 自动配置 `WebClient.Builder`。

---

## 📌 阻塞操作勿进事件循环

```java
// ❌ 在 WebFlux 线程里阻塞 JDBC
// ✅ 包装到 boundedElastic
Mono.fromCallable(() -> jdbcTemplate.query(...))
    .subscribeOn(Schedulers.boundedElastic());
```

更好的做法：数据层也用 R2DBC 全链路响应式。

---

## 下一步

- [调度与异步](./10-scheduling-async)

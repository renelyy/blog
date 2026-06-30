# Spring Cloud Gateway

[← Cloud 首页](./index)

> 基于 **WebFlux** 的 API 网关：路由、过滤、限流、鉴权。

官方：[Gateway Reference](https://docs.spring.io/spring-cloud-gateway/reference/)

---

## ⭐ 为什么用 Gateway？

| 能力 | 说明 |
|------|------|
| 统一入口 | 对外一个域名/端口 |
| 路由转发 | `/api/orders/**` → order-service |
| 横切能力 | 认证、限流、日志、跨域 |
| 与注册中心集成 | `lb://service-name` 负载均衡 |

Zuul 1.x 已维护模式；**Gateway 是首选**。

---

## ⭐ 快速开始

```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
<!-- 若用 Nacos/Eureka 发现下游 -->
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-loadbalancer</artifactId>
</dependency>
```

```yaml
server:
  port: 8080

spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      routes:
        - id: order-route
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
          filters:
            - StripPrefix=1   # 去掉第一段路径（按需）
        - id: user-route
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
```

`lb://` 表示通过 LoadBalancer 从注册中心选实例。

---

## ⭐ 核心概念

| 概念 | 说明 |
|------|------|
| **Route** | 路由 ID + 目标 URI + 断言 + 过滤器 |
| **Predicate** | 匹配条件（Path、Method、Header、Cookie…） |
| **Filter** | 匹配后修改请求/响应（AddRequestHeader、Retry、RequestRateLimiter） |

---

## 📌 常用 Predicate

```yaml
predicates:
  - Path=/api/**
  - Method=GET,POST
  - Header=X-Request-Id, \d+
  - Query=version, v1
  - After=2024-01-01T00:00:00+08:00[Asia/Shanghai]
```

---

## 📌 全局过滤器（鉴权示例）

```java
@Component
public class AuthGlobalFilter implements GlobalFilter, Ordered {
  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    String token = exchange.getRequest().getHeaders().getFirst("Authorization");
    if (token == null || token.isBlank()) {
      exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
      return exchange.getResponse().setComplete();
    }
    return chain.filter(exchange);
  }

  @Override
  public int getOrder() {
    return -100;
  }
}
```

---

## 📌 跨域

```yaml
spring:
  cloud:
    gateway:
      globalcors:
        cors-configurations:
          '[/**]':
            allowedOrigins: "*"
            allowedMethods: "*"
```

---

## ⚠️ 注意

- Gateway 基于 **WebFlux**，不要与 `spring-boot-starter-web`（Servlet）混在同一应用
- 网关层做好超时、重试、熔断，避免级联故障

---

## 下一步

- [OpenFeign 与负载均衡](./05-feign-loadbalancer)

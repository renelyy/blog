# 生产运维：Actuator、指标与追踪

[← Boot 首页](./index)

> 对应官方 [Production-ready](https://docs.spring.io/spring-boot/reference/actuator/index.html)、Observability。

---

## ⭐ Actuator 端点（扩展）

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus,env,loggers,threaddump,heapdump
  endpoint:
    health:
      show-details: when_authorized
      probes:
        enabled: true   # K8s liveness/readiness
  metrics:
    tags:
      application: ${spring.application.name}
```

| 端点 | 用途 |
|------|------|
| `/actuator/prometheus` | Prometheus 拉取 |
| `/actuator/metrics/{name}` | 单指标 |
| `/actuator/loggers/{name}` | 动态改日志级别 |

---

## ⭐ Micrometer + Prometheus

```xml
<dependency>
  <groupId>io.micrometer</groupId>
  <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

Grafana 配 Prometheus 数据源 + JVM/Microservice 仪表盘。

---

## 📌 自定义指标

```java
@Service
public class OrderMetrics {
  private final Counter orderCreated;

  public OrderMetrics(MeterRegistry registry) {
    this.orderCreated = Counter.builder("orders.created")
        .description("创建订单数")
        .register(registry);
  }

  public void onCreated() { orderCreated.increment(); }
}
```

---

## 📌 分布式追踪

```xml
<dependency>
  <groupId>io.micrometer</groupId>
  <artifactId>micrometer-tracing-bridge-brave</artifactId>
</dependency>
<dependency>
  <groupId>io.zipkin.reporter2</groupId>
  <artifactId>zipkin-reporter-brave</artifactId>
</dependency>
```

```yaml
management:
  tracing:
    sampling:
      probability: 0.1
  zipkin:
    tracing:
      endpoint: http://zipkin:9411/api/v2/spans
```

日志中输出 `traceId` 便于链路排查。

---

## 📌 优雅停机

```yaml
server:
  shutdown: graceful
spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s
```

K8s `preStop` + 摘流量配合使用。

---

## 下一步

- [打包与部署](./12-packaging-deploy)

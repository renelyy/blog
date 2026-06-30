# 指标与 Actuator

[← 返回索引](./index)

> **本节目标：** 掌握 Micrometer、Prometheus、Grafana 与 Spring Boot Actuator 健康检查。

---

## ⭐ Metrics 是什么

**时序数据：** 某时刻某指标的数值。

| 类型 | 说明 | 例子 |
|------|------|------|
| **Counter** | 只增 | 请求总数、错误数 |
| **Gauge** | 可增可减 | 队列长度、当前连接数 |
| **Timer** | 耗时分布 | HTTP 延迟 P99 |
| **Summary/Histogram** | 分位数 | 自定义延迟桶 |

```text
http_server_requests_seconds_count{uri="/api/orders",status="200"} 1523
jvm_memory_used_bytes{area="heap"} 512000000
```

---

## ⭐ Spring Boot Actuator

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
  <groupId>io.micrometer</groupId>
  <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus,metrics,loggers
      base-path: /actuator
  endpoint:
    health:
      show-details: when_authorized
      probes:
        enabled: true
  metrics:
    tags:
      application: ${spring.application.name}
      env: ${spring.profiles.active}
    distribution:
      percentiles-histogram:
        http.server.requests: true
```

| 端点 | 用途 |
|------|------|
| `/actuator/health` | 存活/就绪 |
| `/actuator/prometheus` | Prometheus 拉取 |
| `/actuator/metrics` | 指标列表与单指标查询 |

见 [Boot Actuator](../spring/boot/06-actuator-test)、[Boot 生产](../spring/boot/11-production)。

---

## ⭐ Prometheus + Grafana

```text
应用 /actuator/prometheus
        ↓ scrape（拉模式，通常 15s）
Prometheus Server
        ↓
Grafana Dashboard + Alertmanager
```

**prometheus.yml 片段：**

```yaml
scrape_configs:
  - job_name: 'order-service'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['order-service:8080']
```

**常用 PromQL：**

```promql
# QPS
rate(http_server_requests_seconds_count{application="order-service"}[1m])

# P99 延迟
histogram_quantile(0.99,
  rate(http_server_requests_seconds_bucket[5m]))

# JVM 堆使用
jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}
```

---

## ⭐ 自定义业务指标

```java
@Service
@RequiredArgsConstructor
public class OrderService {
  private final Counter orderCreatedCounter;
  private final Timer orderCreateTimer;

  public OrderService(MeterRegistry registry) {
    this.orderCreatedCounter = registry.counter("order.created", "type", "normal");
    this.orderCreateTimer = registry.timer("order.create.duration");
  }

  public Order create(CreateOrderCmd cmd) {
    return orderCreateTimer.record(() -> {
      Order order = doCreate(cmd);
      orderCreatedCounter.increment();
      return order;
    });
  }
}
```

**命名：** `业务.动作.单位` — 小写点分，标签 cardinality **可控**（禁止 userId 当 label）。

---

## ⭐ 健康检查

```java
@Component
public class RedisHealthIndicator implements HealthIndicator {
  private final RedisTemplate<String, String> redis;

  @Override
  public Health health() {
    try {
      redis.opsForValue().get("health:ping");
      return Health.up().build();
    } catch (Exception e) {
      return Health.down(e).withDetail("redis", "unreachable").build();
    }
  }
}
```

**K8s 探针：**

```yaml
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
```

**readiness** 失败 → 不接流量；**liveness** 失败 → 重启 Pod。

---

## ⭐ 告警思路

| 告警 | 条件示例 |
|------|----------|
| 错误率 | 5xx rate > 1% 持续 5min |
| 延迟 | P99 > 2s |
| JVM | 堆使用 > 85% |
| GC | Full GC 频率异常 |
| 下游 | Feign 超时率 |

Alertmanager → 钉钉/飞书/邮件/PagerDuty。

---

## 📌 RED 与 USE 方法

| 方法 | 适用 | 指标 |
|------|------|------|
| **RED** | 微服务 | Rate、Errors、Duration |
| **USE** | 资源 | Utilization、Saturation、Errors |

**四个黄金信号（Google SRE）：** 延迟、流量、错误、饱和度。

---

## 📌 与日志、链路联动

```text
Grafana 告警：错误率升高
    → 同一时段 Loki 查 ERROR + traceId
    → SkyWalking 看慢 Trace
    → Arthas 临时诊断
```

见 [日志](./01-logging-mdc)、[链路](./02-tracing)、[JVM](../jvm/03-tuning-and-oom)。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| `/actuator` 对外暴露 | 信息泄露 — 内网或鉴权 |
| 高基数 label | 如 `uri` 带 ID → Prometheus 爆炸 |
| 无告警只看图 | 故障后才发现 |
| health 检查太重 | readiness 连慢 DB 全挂 |
| 指标名混乱 | 团队统一规范 |

---

## 本章小结

- **Micrometer** 抽象；**Prometheus** 存储；**Grafana** 展示
- Actuator：**health / prometheus / metrics**
- 自定义 Counter/Timer；K8s 探针；RED 方法

---

## 下一步

- [Docker 与 K8s 入门](./04-docker-k8s-basics)

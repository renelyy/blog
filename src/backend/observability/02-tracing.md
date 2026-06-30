# 分布式链路追踪

[← 返回索引](./index)

> **本节目标：** 理解 Trace/Span、OpenTelemetry 生态，以及 SkyWalking / Micrometer Tracing 实践。

---

## ⭐ 为什么需要链路追踪

```text
用户请求 → Gateway → 订单 → 库存 → 支付 → DB
                              ↘ MQ → 积分
```

**问题：** 接口 P99 慢 — 哪一跳？哪个 SQL？

**链路追踪：** 为请求分配 **TraceId**，每段调用一个 **Span**，还原调用树与耗时。

---

## ⭐ 核心概念

| 概念 | 说明 |
|------|------|
| **Trace** | 一次完整请求链路 |
| **Span** | 链路中的一段（HTTP、RPC、SQL） |
| **SpanId / ParentSpanId** | 父子关系 |
| **TraceId** | 全局唯一，贯穿所有服务 |

```text
Trace abc123
  Span [Gateway]     120ms
    Span [Order]     100ms
      Span [SQL insert]  15ms
      Span [Feign inventory] 60ms
        Span [Inventory SQL] 40ms
```

---

## ⭐ OpenTelemetry 与规范

**OpenTelemetry（OTel）** = 厂商中立的标准（合并 OpenTracing + OpenCensus）。

```text
应用 SDK / Agent
    ↓
Exporter（OTLP / Zipkin / Jaeger）
    ↓
Collector（可选聚合）
    ↓
SkyWalking / Jaeger / Tempo / Zipkin UI
```

**Spring Boot 3：** `spring-boot-starter-actuator` + Micrometer Tracing + `micrometer-tracing-bridge-otel`。

---

## ⭐ Spring Boot 3 集成（Micrometer Tracing）

```xml
<dependency>
  <groupId>io.micrometer</groupId>
  <artifactId>micrometer-tracing-bridge-otel</artifactId>
</dependency>
<dependency>
  <groupId>io.opentelemetry</groupId>
  <artifactId>opentelemetry-exporter-zipkin</artifactId>
</dependency>
```

```yaml
management:
  tracing:
    sampling:
      probability: 1.0   # 生产可 0.1～0.3
  zipkin:
    tracing:
      endpoint: http://zipkin:9411/api/v2/spans

spring:
  application:
    name: order-service
```

**自动埋点：** Spring MVC、RestTemplate、WebClient、Feign（需依赖）、Jdbc（部分）。

---

## ⭐ SkyWalking（国内常用）

**Java Agent 无侵入：**

```bash
-javaagent:/opt/skywalking/agent/skywalking-agent.jar
-Dskywalking.agent.service_name=order-service
-Dskywalking.collector.backend_service=skywalking-oap:11800
```

| 优点 | 说明 |
|------|------|
| 无代码改动 | Agent 字节码增强 |
| 拓扑图 | 服务依赖自动发现 |
| 与日志关联 | traceId 注入 Logback |

**SW8 头：** 跨服务自动传播（HTTP、gRPC、MQ 插件）。

---

## ⭐ 与日志关联

```xml
<!-- logback-spring.xml — SkyWalking 或 OTel 提供的 MDC 键 -->
<pattern>%d [%X{traceId}] [%X{sw8}] %msg%n</pattern>
```

SkyWalking UI 点 Trace → 跳转关联日志（需 Log 后端支持 traceId 索引）。

见 [MDC 日志](./01-logging-mdc)。

---

## ⭐ 采样策略

| 策略 | 说明 |
|------|------|
| **100% 采样** | 测试环境 |
| **概率采样** | `probability: 0.1` — 降存储 |
| **尾部采样** | 只保留慢请求/错误（Collector 侧） |
| **动态采样** | 高峰降级 |

**原则：** 错误链路尽量全采；正常流量可抽样。

---

## ⭐ 自定义 Span

```java
@Service
@RequiredArgsConstructor
public class OrderService {
  private final Tracer tracer;

  public Order create(CreateOrderCmd cmd) {
    Span span = tracer.nextSpan().name("order.create").start();
    try (Tracer.SpanInScope ws = tracer.withSpan(span)) {
      span.tag("order.type", cmd.type());
      return doCreate(cmd);
    } catch (Exception e) {
      span.error(e);
      throw e;
    } finally {
      span.end();
    }
  }
}
```

Micrometer：`io.micrometer.tracing.Tracer`。

---

## 📌 常见组件传播

| 组件 | 说明 |
|------|------|
| **Gateway** | 生成或透传 traceId |
| **Feign** | `micrometer-tracing` 自动加头 |
| **Kafka** | 消息头携带 trace context |
| **线程池** | 手动 propagate 或使用框架包装 |

**断链原因：** 自建 HttpClient 未加头、MQ 未传、异步丢 context。

---

## 📌 排查慢请求

```text
1. Grafana/SkyWalking — P99 高的接口
2. 找 Trace — 看最长 Span
3. 若是 SQL — 慢查询日志 / EXPLAIN
4. 若是 Feign — 下游服务 Trace
5. 结合 Arthas trace — 见 JVM 章
```

见 [慢 SQL](../database/05-slow-query-tuning)、[Arthas](../jvm/04-arthas-profiler)。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 采样太低查不到 | 错误全采 + 按 userId 定向采 |
| Agent 版本与 OAP 不匹配 | 对齐版本矩阵 |
| 时钟漂移 | 多机 NTP；Span 时间异常 |
| traceId 与 MDC 不一致 | 统一由 Tracing 框架写 MDC |
| 100% 采样打满存储 | 生产必须抽样 |

---

## 本章小结

- **Trace / Span** 描述调用树；**OpenTelemetry** 是标准方向
- Boot 3：**Micrometer Tracing**；国内 **SkyWalking Agent** 成熟
- 与日志 **traceId 关联**；合理 **采样**

---

## 下一步

- [指标与 Actuator](./03-metrics-actuator)

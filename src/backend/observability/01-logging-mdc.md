# 日志规范与 MDC

[← 返回索引](./index)

> **本节目标：** 掌握 Logback 配置、MDC traceId、结构化日志与日志级别规范。

---

## ⭐ 可观测性三支柱

```text
Logs（日志）     — 发生了什么？细节、错误栈
Metrics（指标）  — 多少？趋势、告警
Traces（链路）   — 请求经过了谁？耗时分布
```

三者 **互补**：指标发现异常 → 链路定位慢点 → 日志看上下文。

见 [指标与 Actuator](./03-metrics-actuator)、[链路追踪](./02-tracing)。

---

## ⭐ Spring Boot 默认 Logback

```xml
<!-- src/main/resources/logback-spring.xml -->
<configuration>
  <springProperty scope="context" name="APP_NAME" source="spring.application.name"/>

  <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
  </appender>

  <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>logs/${APP_NAME}.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
      <fileNamePattern>logs/${APP_NAME}.%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
      <maxFileSize>100MB</maxFileSize>
      <maxHistory>30</maxHistory>
    </rollingPolicy>
    <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
  </appender>

  <root level="INFO">
    <appender-ref ref="CONSOLE"/>
    <appender-ref ref="FILE"/>
  </root>
</configuration>
```

**JSON 日志（Logstash Encoder）** — ELK/Loki 解析友好。

---

## ⭐ MDC（Mapped Diagnostic Context）

**MDC** = 线程本地 Map，日志 pattern 可引用：

```java
MDC.put("traceId", traceId);
MDC.put("userId", String.valueOf(userId));
try {
  log.info("create order orderId={}", orderId);
} finally {
  MDC.clear();  // 线程池必须清理
}
```

```xml
<!-- 非 JSON 时的 pattern -->
<pattern>%d{ISO8601} [%thread] [%X{traceId}] %-5level %logger{36} - %msg%n</pattern>
```

| 字段 | 说明 |
|------|------|
| `traceId` | 全链路唯一 ID |
| `spanId` | 当前跨度 |
| `userId` / `tenantId` | 业务上下文 |

---

## ⭐ traceId 传递

### HTTP 入口 Filter

```java
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TraceIdFilter extends OncePerRequestFilter {
  public static final String TRACE_HEADER = "X-Trace-Id";

  @Override
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
      FilterChain chain) throws ServletException, IOException {
    String traceId = Optional.ofNullable(req.getHeader(TRACE_HEADER))
        .filter(s -> !s.isBlank())
        .orElse(UUID.randomUUID().toString().replace("-", ""));
    MDC.put("traceId", traceId);
    res.setHeader(TRACE_HEADER, traceId);
    try {
      chain.doFilter(req, res);
    } finally {
      MDC.clear();
    }
  }
}
```

### 异步 / 线程池

```java
Runnable wrapped = RunnableWrapper.of(() -> {
  MDC.put("traceId", traceId);
  try { task.run(); } finally { MDC.clear(); }
});
executor.execute(wrapped);
```

**Spring `@Async`：** 使用 `TaskDecorator` 复制 MDC 到子线程。

**MQ 消费：** 从消息头取 traceId 写入 MDC — 见 [消息模块](../messaging/04-reliability-patterns)。

---

## ⭐ 日志级别规范

| 级别 | 用途 |
|------|------|
| **ERROR** | 需告警、影响业务 — 带完整上下文 |
| **WARN** | 可恢复异常、降级、重试 |
| **INFO** | 关键业务节点（下单成功、支付回调） |
| **DEBUG** | 开发调试 — 生产默认关 |
| **TRACE** | 极细 — 几乎不用 |

```java
// 推荐：参数化，避免字符串拼接
log.info("order paid orderId={} amount={}", orderId, amount);

// 禁止：循环里 INFO
for (Order o : orders) {
  log.info("processing {}", o.getId());  // 打爆磁盘
}
```

---

## ⭐ 结构化字段约定

```json
{
  "@timestamp": "2024-01-15T10:00:00.123+08:00",
  "level": "INFO",
  "logger": "c.e.OrderService",
  "message": "order created",
  "traceId": "abc123",
  "orderId": "O1001",
  "userId": "U42",
  "durationMs": 35
}
```

| 原则 | 说明 |
|------|------|
| **关键 ID 放字段** | orderId、userId — 便于 Kibana/Loki 过滤 |
| **敏感信息脱敏** | 手机、身份证、token 不打明文 |
| **异常带栈** | `log.error("msg", e)` |
| **中英统一** | 团队选一种 message 语言 |

---

## 📌 ELK / Loki 简要

```text
应用 JSON 日志 → Filebeat / Promtail → Elasticsearch / Loki → Kibana / Grafana
```

**查询示例（Kibana KQL）：**

```text
traceId: "abc123" and level: ERROR
orderId: "O1001"
```

---

## 📌 动态日志级别

```bash
# Actuator — 生产临时开 DEBUG
curl -X POST 'http://localhost:8080/actuator/loggers/com.example.order' \
  -H 'Content-Type: application/json' \
  -d '{"configuredLevel":"DEBUG"}'
```

见 [Boot Actuator](../spring/boot/06-actuator-test)、[Boot 生产](../spring/boot/11-production)。

---

## 📌 与 Feign / RestTemplate

出站请求携带 traceId：

```java
@Bean
public RequestInterceptor traceInterceptor() {
  return template -> {
    String traceId = MDC.get("traceId");
    if (traceId != null) {
      template.header("X-Trace-Id", traceId);
    }
  };
}
```

完整链路见 [02-tracing](./02-tracing)。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 线程池不 `MDC.clear()` | traceId 串请求 |
| `@Async` 丢 MDC | 需 TaskDecorator |
| 日志当数据库 | 海量 INFO 拖慢 IO、占存储 |
| 密码进日志 | 合规事故 |
| 多服务 traceId 格式不一 | 统一 header 名与生成规则 |

---

## 本章小结

- **MDC** 承载 traceId、userId；入口 Filter + 线程池传递
- **JSON 结构化** + 级别规范 + 脱敏
- 与 Metrics、Tracing 组成可观测性基础

---

## 下一步

- [分布式链路追踪](./02-tracing)

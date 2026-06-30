# 日志与 DevTools

[← Boot 首页](./index)

> 对应官方 [Core → Logging](https://docs.spring.io/spring-boot/reference/features/logging.html)、[DevTools](https://docs.spring.io/spring-boot/reference/using/devtools.html)。

---

## ⭐ 默认日志

Boot 默认 **Logback**（通过 `spring-boot-starter-logging`）。

```yaml
logging:
  level:
    root: info
    com.example: debug
    org.springframework.web: debug
    org.hibernate.SQL: debug
  file:
    name: logs/app.log
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
```

---

## 切换 Log4j2

排除 Logback，引入 Log4j2：

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
  <exclusions>
    <exclusion>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-logging</artifactId>
    </exclusion>
  </exclusions>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-log4j2</artifactId>
</dependency>
```

---

## 📌 结构化日志（JSON）

生产环境便于 ELK/Loki 采集：

```xml
<dependency>
  <groupId>net.logstash.logback</groupId>
  <artifactId>logstash-logback-encoder</artifactId>
  <version>7.4</version>
</dependency>
```

---

## ⭐ DevTools 热重启

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-devtools</artifactId>
  <optional>true</optional>
</dependency>
```

- classpath 变更 → 自动重启（比热 swap 更稳）
- 默认禁用生产：`spring.devtools.restart.enabled=false`
- LiveReload 浏览器插件可选

---

## 📌 日志关联 ID（链路追踪）

Micrometer Tracing + Brave/OpenTelemetry 可在日志中注入 `traceId`：

```yaml
management:
  tracing:
    sampling:
      probability: 1.0
```

见 [生产运维](./11-production)。

---

## 下一步

- [Security 入门](./08-security)

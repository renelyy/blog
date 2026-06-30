# Spring Cloud Stream 与 Bus

[← Cloud 首页](./index)

> 对应官方 [spring-cloud-stream](https://docs.spring.io/spring-cloud-stream/reference/)、[spring-cloud-bus](https://docs.spring.io/spring-cloud-bus/reference/)。

---

## ⭐ Spring Cloud Stream

消息中间件的**统一编程模型**，屏蔽 Kafka / RabbitMQ 差异。

```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-stream-kafka</artifactId>
</dependency>
```

### 函数式风格（当前推荐）

```java
@Configuration
public class StreamConfig {
  @Bean
  public Consumer<OrderCreatedEvent> orderCreated() {
    return event -> log.info("消费: {}", event);
  }

  @Bean
  public Supplier<String> heartbeat() {
    return () -> "ping";
  }
}
```

```yaml
spring:
  cloud:
    stream:
      bindings:
        orderCreated-in-0:
          destination: order-created
          group: notification
        heartbeat-out-0:
          destination: heartbeat
```

---

## 📌 Binder

| Binder | 依赖 |
|--------|------|
| Kafka | `spring-cloud-starter-stream-kafka` |
| Rabbit | `spring-cloud-starter-stream-rabbit` |

---

## ⭐ Spring Cloud Bus

**广播配置刷新** / 事件到所有实例：

```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-bus-amqp</artifactId>
</dependency>
```

```yaml
spring:
  cloud:
    bus:
      enabled: true
```

刷新：

```bash
curl -X POST http://host:port/actuator/busrefresh
```

配合 Config Server：改 Git 配置 → `/actuator/busrefresh` → 全集群 `@RefreshScope` 生效。

---

## 下一步

- [Contract 与 Function](./08-contract-function)

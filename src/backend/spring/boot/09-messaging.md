# 消息：Kafka 与 RabbitMQ

[← Boot 首页](./index)

> 对应官方 [Messaging](https://docs.spring.io/spring-boot/reference/messaging/index.html)。

---

## ⭐ Kafka

### 依赖

```xml
<dependency>
  <groupId>org.springframework.kafka</groupId>
  <artifactId>spring-kafka</artifactId>
</dependency>
```

### 配置

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      group-id: order-service
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.trusted.packages: com.example.*
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
```

### 发送

```java
@Service
@RequiredArgsConstructor
public class OrderEventPublisher {
  private final KafkaTemplate<String, OrderCreatedEvent> kafka;

  public void publish(OrderCreatedEvent event) {
    kafka.send("order-created", event.orderId().toString(), event);
  }
}
```

### 消费

```java
@Component
public class OrderEventConsumer {
  @KafkaListener(topics = "order-created", groupId = "notification-service")
  public void onOrderCreated(OrderCreatedEvent event) {
    log.info("收到订单事件: {}", event.orderId());
  }
}
```

---

## ⭐ RabbitMQ

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

```yaml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
```

```java
@RabbitListener(queues = "order.queue")
public void handle(OrderCreatedEvent event) { }

public void send(OrderCreatedEvent event) {
  rabbitTemplate.convertAndSend("order.exchange", "order.created", event);
}
```

---

## 📌 Kafka vs RabbitMQ

| | Kafka | RabbitMQ |
|---|-------|----------|
| 模型 | 日志流 / 高吞吐 | 传统 MQ / 路由灵活 |
| 场景 | 大数据、事件溯源 | 任务队列、RPC |

---

## 📌 与 Spring Cloud Stream

更高层抽象见 [Cloud Stream](../cloud/07-stream-bus)。

---

## 下一步

- [响应式 Web](./09-reactive)

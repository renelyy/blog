# Spring 集成实战

[← 返回索引](./index)

> **本节目标：** 掌握 Spring Kafka、Spring AMQP 配置，以及 Cloud Stream 函数式编程入门。

---

## ⭐ Spring Kafka 完整示例

### 依赖与配置

```xml
<dependency>
  <groupId>org.springframework.kafka</groupId>
  <artifactId>spring-kafka</artifactId>
</dependency>
```

```yaml
spring:
  kafka:
    bootstrap-servers: ${KAFKA_BOOTSTRAP:localhost:9092}
    producer:
      acks: all
      retries: 3
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
    consumer:
      group-id: order-service
      auto-offset-reset: earliest
      enable-auto-commit: false
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.trusted.packages: com.example.*
    listener:
      ack-mode: manual
```

更多见 [Boot 消息章节](../spring/boot/09-messaging)。

---

## ⭐ 发送

```java
@Service
@RequiredArgsConstructor
public class OrderEventPublisher {
  private final KafkaTemplate<String, OrderCreatedEvent> kafka;

  public void publish(OrderCreatedEvent event) {
    kafka.send("order-created", event.orderId().toString(), event)
        .whenComplete((result, ex) -> {
          if (ex != null) log.error("发送失败 orderId={}", event.orderId(), ex);
        });
  }
}
```

### KafkaTemplate 事务

```java
kafkaTemplate.executeInTransaction(operations -> {
  operations.send("topic-a", event1);
  operations.send("topic-b", event2);
  return null;
});
```

---

## ⭐ 消费

```java
@Component
@Slf4j
@RequiredArgsConstructor
public class OrderCreatedConsumer {
  private final OrderNotifyService notifyService;
  private final ConsumedEventRepository consumedRepo;

  @KafkaListener(topics = "order-created", groupId = "notification-service")
  public void onCreated(OrderCreatedEvent event, Acknowledgment ack) {
    if (consumedRepo.existsById(event.eventId())) {
      ack.acknowledge();
      return;
    }
    try {
      notifyService.send(event);
      consumedRepo.save(new ConsumedEvent(event.eventId()));
      ack.acknowledge();
    } catch (Exception ex) {
      log.error("消费失败 eventId={}", event.eventId(), ex);
      throw ex;  // 配合 RetryableTopic 或容器重试
    }
  }
}
```

---

## ⭐ Spring AMQP（RabbitMQ）

```xml
<dependency>
  <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

```java
@Configuration
public class RabbitConfig {
  @Bean
  TopicExchange orderExchange() {
    return new TopicExchange("order.exchange", true, false);
  }

  @Bean
  Queue orderQueue() {
    return QueueBuilder.durable("order.notification").build();
  }

  @Bean
  Binding binding() {
    return BindingBuilder.bind(orderQueue()).to(orderExchange()).with("order.created");
  }

  @Bean
  RabbitTemplate rabbitTemplate(ConnectionFactory factory) {
    RabbitTemplate template = new RabbitTemplate(factory);
    template.setMessageConverter(new Jackson2JsonMessageConverter());
    return template;
  }
}
```

```java
@RabbitListener(queues = "order.notification")
public void handle(OrderCreatedEvent event) {
  process(event);
}
```

---

## ⭐ Spring Cloud Stream（函数式）

屏蔽底层 Binder，统一 `Consumer` / `Supplier` / `Function`：

```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-stream-kafka</artifactId>
</dependency>
```

```java
@Configuration
public class StreamConfig {

  @Bean
  public Consumer<OrderCreatedEvent> orderCreated() {
    return event -> log.info("Stream 消费: {}", event.orderId());
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
      kafka:
        binder:
          brokers: localhost:9092
```

见 [Cloud Stream 章节](../spring/cloud/07-stream-bus)。

---

## 📌 消息转换与 CloudEvents

```java
@Bean
RecordMessageConverter messageConverter() {
  return new JsonSchemaMessageConverter();
}
```

统一事件 envelope：

```java
public record CloudEventWrapper<T>(
    String id, String type, Instant time, T data) {}
```

---

## 📌 测试

```java
@SpringBootTest
@EmbeddedKafka(partitions = 1, topics = "order-created")
class OrderKafkaTest {

  @Autowired KafkaTemplate<String, OrderCreatedEvent> kafka;

  @Test
  void publishAndConsume() {
    kafka.send("order-created", "1", new OrderCreatedEvent("e1", 1L));
    // await latch or use @KafkaListener in test
  }
}
```

Testcontainers 启动真实 Kafka/Rabbit — 见 [测试章节](../testing/04-testcontainers)。

---

## 📌 监控

| 指标 | Kafka | Rabbit |
|------|-------|--------|
| 堆积 | consumer lag | queue depth |
| 吞吐 | messages in/out | publish/deliver rate |
| 失败 | DLT 数量 | dead letter count |

Spring Actuator + Micrometer；Kafka JMX；Rabbit Management UI `:15672`。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| `trusted.packages: "*"` 生产 | 反序列化 RCE 风险 |
| 消费者组 id 乱改 | 重复消费或丢 offset |
| 与 @Transactional 同方法 | 事务未提交消息已消费 |
| JSON 无 type 信息 | 多态反序列化失败 |
| 本地无 Kafka 硬编码 | 用 Testcontainers / EmbeddedKafka |

---

## 本章小结

- Spring Kafka：KafkaTemplate + @KafkaListener + manual ack
- Spring AMQP：RabbitTemplate + @RabbitListener + confirm
- Cloud Stream 适合多 Binder 统一；复杂业务仍可直接用 Kafka/AMQP API

---

## 相关模块

- [可靠性设计](./04-reliability-patterns)
- [分布式系统](../distributed/)

---

## 下一步

- [返回 messaging 索引](./index)
- 或继续 [JPA 指南](../jpa/)

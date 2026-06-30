# RabbitMQ 基础

[← 返回索引](./index)

> **本节目标：** 理解 AMQP 模型：Exchange、Queue、Binding、路由模式及 Spring AMQP 用法。

---

## ⭐ AMQP 模型

```text
Producer → Exchange → (Binding + routing key) → Queue → Consumer
```

| 组件 | 说明 |
|------|------|
| **Exchange** | 路由入口，不存消息 |
| **Queue** | 存消息，消费者绑定 |
| **Binding** | Exchange 与 Queue 规则 |
| **Routing Key** | 路由键 |
| **Virtual Host** | 逻辑隔离（/dev、/prod） |

**Broker 负责：** 持久化、ACK、死信、TTL。

---

## ⭐ Exchange 类型

| 类型 | 路由规则 | 场景 |
|------|----------|------|
| **direct** | routing key **完全匹配** | 点对点、按类型分发 |
| **fanout** | 忽略 key，**广播**到所有绑定 Queue | 通知多系统 |
| **topic** | `*` 一词、`#` 多词匹配 | `order.created`、`order.*` |
| **headers** | 头属性匹配 | 少用 |

```text
order.exchange (topic)
  order.created  → queue.notification
  order.created  → queue.search-index
  order.cancelled → queue.refund
```

---

## ⭐ 基本声明（Java Config）

```java
@Configuration
public class RabbitConfig {

  public static final String ORDER_EXCHANGE = "order.exchange";
  public static final String ORDER_QUEUE = "order.notification.queue";
  public static final String ORDER_ROUTING_KEY = "order.created";

  @Bean
  TopicExchange orderExchange() {
    return new TopicExchange(ORDER_EXCHANGE, true, false);
  }

  @Bean
  Queue orderQueue() {
    return QueueBuilder.durable(ORDER_QUEUE)
        .deadLetterExchange("order.dlx")
        .deadLetterRoutingKey("order.dead")
        .ttl(600_000)  // 可选：消息 TTL
        .build();
  }

  @Bean
  Binding orderBinding() {
    return BindingBuilder.bind(orderQueue())
        .to(orderExchange())
        .with(ORDER_ROUTING_KEY);
  }
}
```

---

## ⭐ 发送与消费

```java
@Service
@RequiredArgsConstructor
public class OrderPublisher {
  private final RabbitTemplate rabbitTemplate;

  public void publishOrderCreated(OrderCreatedEvent event) {
    rabbitTemplate.convertAndSend(
        RabbitConfig.ORDER_EXCHANGE,
        RabbitConfig.ORDER_ROUTING_KEY,
        event);
  }
}

@Component
@Slf4j
public class OrderConsumer {

  @RabbitListener(queues = RabbitConfig.ORDER_QUEUE)
  public void onMessage(OrderCreatedEvent event, Channel channel,
      @Header(AmqpHeaders.DELIVERY_TAG) long tag) throws IOException {
    try {
      process(event);
      channel.basicAck(tag, false);   // 手动 ACK
    } catch (Exception ex) {
      channel.basicNack(tag, false, false);  // 进死信，不 requeue
    }
  }
}
```

```yaml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
    listener:
      simple:
        acknowledge-mode: manual
        prefetch: 10
```

---

## ⭐ 死信队列（DLX）

```text
主 Queue（TTL 到期 / reject / queue 满）
  → Dead Letter Exchange
    → Dead Letter Queue
      → 人工排查 / 补偿消费
```

```java
QueueBuilder.durable("order.main")
    .deadLetterExchange("order.dlx")
    .deadLetterRoutingKey("order.dead")
    .build();
```

---

## ⭐ 延迟消息

| 方式 | 说明 |
|------|------|
| TTL + DLX | 消息过期后进死信 Queue 被消费 |
| **延迟插件** | `rabbitmq_delayed_message_exchange` |
| 定时扫描 DB | 简单但不准 |

---

## 📌 RabbitMQ vs Kafka 在本栈

| 需求 | 更倾向 |
|------|--------|
| 延迟队列 | RabbitMQ |
| 复杂路由 topic | RabbitMQ |
| 日志回放 | Kafka |
| 超高吞吐 | Kafka |

---

## 📌 镜像队列与高可用

- **Classic 镜像队列**（Quorum Queue 3.8+ 推荐）
- 多节点集群；**镜像**防单点
- 生产：`publisher-confirm` + `mandatory` 保证可达

```yaml
spring:
  rabbitmq:
    publisher-confirm-type: correlated
    publisher-returns: true
```

```java
rabbitTemplate.setConfirmCallback((correlation, ack, cause) -> {
  if (!ack) log.error("消息未到达 Broker: {}", cause);
});
```

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 自动 ACK | 处理失败消息已丢 |
| 无持久化 | Exchange/Queue/Message 都要 durable |
| prefetch 过大 | 一条慢消息阻塞一批 |
| 死信循环 | DLX 路由配置错误 |
| vhost 混用 | 环境隔离 |

---

## 本章小结

- RabbitMQ = Exchange 路由 + Queue 存储
- direct/topic/fanout 覆盖大部分业务
- 手动 ACK + DLX + publisher confirm 是可靠基础

---

## 下一步

- [可靠性与幂等消费](./04-reliability-patterns)

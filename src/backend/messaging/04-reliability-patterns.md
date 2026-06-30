# 可靠性与幂等消费

[← 返回索引](./index)

> **本节目标：** 掌握消息不丢、不重、有序性的设计，以及 Outbox、幂等表、重试与死信。

---

## ⭐ 三个维度

| 维度 | 问题 | 手段 |
|------|------|------|
| **不丢** | Producer/Broker/Consumer 任环节失败 | ack、持久化、手动 commit |
| **不重** | 网络重试、rebalance 重复消费 | 幂等消费 |
| **有序** | 并发消费乱序 | 单分区 / 单 Queue / key 路由 |

**现实：** 至少一次（At-least-once）最常见 — **允许重复，消费必须幂等**。

---

## ⭐ Producer 不丢（Kafka）

```yaml
spring:
  kafka:
    producer:
      acks: all
      retries: 3
      properties:
        enable.idempotence: true
```

| 配置 | 作用 |
|------|------|
| `acks=all` | ISR 落盘确认 |
| `retries` | 发送失败重试 |
| `enable.idempotence` | 幂等 Producer |

---

## ⭐ Producer 不丢（RabbitMQ）

```yaml
spring:
  rabbitmq:
    publisher-confirm-type: correlated
    publisher-returns: true
```

- Queue、Exchange、Message **persistent**
- Confirm 回调确认 Broker 收到

---

## ⭐ Consumer 不丢

### Kafka — 手动提交 offset

```java
@KafkaListener(topics = "order-created", groupId = "svc")
public void listen(OrderCreatedEvent event, Acknowledgment ack) {
  try {
    processIdempotent(event);
    ack.acknowledge();  // 成功后再 commit
  } catch (Exception ex) {
    // 不 ack → 重新消费；或进 DLQ 策略
    throw ex;
  }
}
```

```yaml
spring:
  kafka:
    listener:
      ack-mode: manual
```

### RabbitMQ — 手动 ACK

见 [03-rabbitmq-basics](./03-rabbitmq-basics) `basicAck` / `basicNack`。

---

## ⭐ 消费幂等

**同一 messageId / eventId 多次处理，结果与一次相同。**

### 1. 数据库唯一约束

```sql
CREATE TABLE consumed_event (
  event_id   VARCHAR(64) PRIMARY KEY,
  consumed_at DATETIME(3) NOT NULL
);
```

```java
@Transactional
public void handle(OrderCreatedEvent event) {
  if (consumedRepo.existsById(event.eventId())) {
    return;  // 已处理
  }
  doBusiness(event);
  consumedRepo.save(new ConsumedEvent(event.eventId()));
}
```

### 2. Redis SETNX

```java
Boolean first = redis.opsForValue()
    .setIfAbsent("consume:" + eventId, "1", Duration.ofDays(7));
if (!Boolean.TRUE.equals(first)) return;
process(event);
```

见 [Redis 分布式锁](../redis/04-distributed-lock)。

### 3. 业务天然幂等

```java
// 设置状态为 PAID — WHERE status=PENDING，重复更新 0 行
UPDATE orders SET status='PAID' WHERE id=? AND status='PENDING';
```

见 [分布式幂等](../distributed/02-idempotency-retry)。

---

## ⭐ 本地消息表 / Outbox 模式

**问题：** DB 提交成功，发 MQ 失败 → 不一致。

```text
1. 同一本地事务：
     INSERT orders ...
     INSERT outbox (event_type, payload, status=PENDING)
2. 定时任务 / CDC 扫描 outbox → 发 MQ → 标记 SENT
3. 消费者处理
```

```java
@Transactional
public void createOrder(Order order) {
  orderRepo.save(order);
  outboxRepo.save(OutboxEvent.of("OrderCreated", order));
}

@Scheduled(fixedDelay = 1000)
public void dispatchOutbox() {
  outboxRepo.findPending(100).forEach(e -> {
    kafka.send(e.getTopic(), e.getPayload());
    e.markSent();
  });
}
```

**进阶：** Debezium CDC 监听 binlog 发 Kafka，与应用代码解耦。

---

## ⭐ 重试与死信

```java
@RetryableTopic(
    attempts = "4",
    backoff = @Backoff(delay = 1000, multiplier = 2),
    dltStrategy = DltStrategy.FAIL_ON_ERROR)
@KafkaListener(topics = "order-created")
public void consume(OrderCreatedEvent event) {
  process(event);
}
// 失败 → retry-0..n → DLT topic
```

RabbitMQ：重试 N 次后 `basicNack(requeue=false)` → DLQ。

| 策略 | 说明 |
|------|------|
| 有限重试 + 退避 | 防打爆下游 |
| 死信 / DLT | 人工介入、补偿 |
| 告警 | 死信堆积监控 |

---

## ⭐ 顺序消息

| 方案 | 说明 |
|------|------|
| Kafka 同 key 同分区 | `send(topic, orderId, msg)` |
| Rabbit 单 Queue 单 Consumer | 无并行 |
| 业务层排序 | 带 sequence，乱序丢弃或缓冲 |

**不要** 全局顺序除非单线程 — 性能极差。

---

## 📌 事务消息（RocketMQ / Kafka 事务）

- RocketMQ **半消息** + 本地事务回调 — 原生支持
- Kafka **事务 Producer** + Outbox — Java 生态常见组合

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 先发 MQ 后提交 DB | 消费者查不到数据 |
| 无幂等靠「应该不会重复」 | rebalance 必重复 |
| 无限重试 |  poison message 阻塞 |
| 大事务含 outbox 批量 | 长事务锁表 |
| 忽略消费 lag | 堆积到爆 |

---

## 本章小结

- At-least-once + **幂等消费** 是默认组合
- Outbox 解决 DB 与 MQ 一致；手动 ACK/commit 防丢
- 重试 + 死信 + 监控是运维三板斧

---

## 下一步

- [Spring 集成实战](./05-spring-integration)

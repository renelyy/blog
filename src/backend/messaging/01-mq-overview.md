# 消息队列模型与选型

[← 返回索引](./index)

> **本节目标：** 理解 MQ 解决的问题、核心模型，以及 Kafka vs RabbitMQ 选型。

---

## ⭐ 为什么需要消息队列

| 问题 | MQ 作用 |
|------|---------|
| **耦合** | 下单后直接调 10 个服务 → 改一处牵全身 |
| **峰值** | 秒杀瞬间流量打垮 DB |
| **慢操作** | 发邮件、生成 PDF 不应阻塞 HTTP 响应 |
| **最终一致** | 跨服务数据同步 |

```text
同步（紧耦合）
  OrderService → 库存 / 支付 / 通知 / 积分 … 串行或并行 RPC

异步（解耦）
  OrderService → MQ → 各消费者独立订阅、重试、扩缩容
```

---

## ⭐ 核心概念

| 概念 | 说明 |
|------|------|
| **Producer** | 发消息 |
| **Broker** | 中间件（Kafka、RabbitMQ） |
| **Consumer** | 收消息 |
| **Topic / Queue** | 消息分类容器 |
| **Consumer Group** | 一组消费者竞争消费（Kafka） |
| **ACK** | 消费确认 |

### 两种模型

```text
点对点（Queue）
  一条消息 → 一个消费者（竞争消费）

发布/订阅（Pub/Sub）
  一条消息 → 多个订阅者各收一份
```

---

## ⭐ 使用场景

| 场景 | 说明 |
|------|------|
| **异步解耦** | 订单创建 → 发事件，库存/通知各消费 |
| **削峰填谷** | 请求先入队，消费者按能力处理 |
| **最终一致** | 本地事务 + 发消息（事务消息） |
| **日志采集** | Kafka 高吞吐流 |
| **延迟任务** | TTL + DLX（Rabbit）/ 定时 Topic |
| **事件溯源** | Kafka 持久 log 可回放 |

**不适合：** 强同步、毫秒级双向 RPC（用 HTTP/gRPC）；需要即时返回结果的操作。

---

## ⭐ Kafka vs RabbitMQ

| 维度 | **Kafka** | **RabbitMQ** |
|------|-----------|--------------|
| 设计 | 分布式**日志流** | 传统 **AMQP** 消息代理 |
| 吞吐量 | 极高（百万级/s） | 万～十万级/s |
| 消息保留 | 可长期保留、可回放 | 消费后通常删除 |
| 路由 | Topic + Partition | Exchange 灵活路由 |
| 顺序 | **分区内**有序 | 单 Queue 有序 |
| 延迟消息 | 需额外组件 | 插件 / TTL+DLX 成熟 |
| 运维 | 较重（ZK/KRaft） | 相对轻 |
| 协议 | 自有 | AMQP、MQTT 等 |

### 选型建议

| 选 Kafka | 选 RabbitMQ |
|----------|---------------|
| 大数据、日志、埋点 | 业务 MQ、任务队列 |
| 事件溯源、流处理 | 复杂路由、延迟队列 |
| 高吞吐、可回放 | 团队熟悉 AMQP、中小规模 |
| Spring Cloud Stream 大数据 | 传统企业集成 |

**国内微服务：** 两者都常见；**日志/行为流**偏 Kafka；**业务异步**两者皆可。

---

## ⭐ RocketMQ（了解）

阿里开源，国内政企常见：

- 事务消息原生支持
- 定时/延迟消息
- 顺序消息

与 Kafka 场景重叠；若公司标准已定为 RocketMQ，Spring 同样有 `rocketmq-spring-boot-starter`。

---

## ⭐ 消息格式

**推荐 JSON**（Jackson）+ Schema 版本：

```json
{
  "eventId": "uuid",
  "eventType": "OrderCreated",
  "occurredAt": "2024-06-30T10:00:00Z",
  "payload": { "orderId": 1001, "userId": 200 }
}
```

| 格式 | 说明 |
|------|------|
| JSON | 可读、调试方便 |
| Avro / Protobuf | Schema Registry、体积小 |
| CloudEvents | 云原生事件标准 |

**规范：** 消息带 **唯一 eventId**、**业务 key**、**时间戳**，便于幂等与追踪。

---

## 📌 与 Redis List 对比

Redis List/Stream 可做**轻量队列**，但：

- 无成熟消费组 ACK（Stream 有部分能力）
- 持久化、堆积能力弱于专业 MQ
- 见 [Redis 指南](../redis/02-data-structures)

**原则：** 业务可靠异步用 Kafka/Rabbit；简单延迟任务 Redis 够用。

---

## 📌 架构位置

```text
Controller → Service → DB（本地事务）
                  ↓ 发消息
              Kafka / RabbitMQ
                  ↓
    库存服务 / 通知服务 / 搜索索引 / 数据仓库
```

见 [分布式幂等](../distributed/02-idempotency-retry)、[Spring Boot 消息](../spring/boot/09-messaging)。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 把 MQ 当 DB | 消息可能丢（需配置 + 设计） |
| 消息体过大 | 传 ID，详情查 DB |
| 无幂等 | 重复消费导致重复扣款 |
| 顺序迷信全局 | Kafka 仅分区内有序 |
| 先 MQ 后 DB | 可能消息到了 DB 未提交 |

---

## 本章小结

- MQ = 异步、解耦、削峰、最终一致
- Kafka 擅日志流与高吞吐；RabbitMQ 擅灵活路由与传统 MQ
- 消息要有 eventId、版本、合理体积

---

## 下一步

- [Kafka 基础](./02-kafka-basics)

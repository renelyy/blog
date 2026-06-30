# Kafka 基础

[← 返回索引](./index)

> **本节目标：** 掌握 Kafka Topic、Partition、Consumer Group、Offset 及基本运维概念。

---

## ⭐ Kafka 架构

```text
Producer → Kafka Cluster (Broker 1..N)
              Topic: order-created
                ├── Partition 0  [0][1][2][3]...  (有序 log)
                ├── Partition 1
                └── Partition 2
Consumer Group A → 每 Partition 最多一个 Consumer 实例消费
Consumer Group B → 独立消费全量（广播效果）
```

| 组件 | 说明 |
|------|------|
| **Broker** | 服务器节点 |
| **Topic** | 逻辑分类 |
| **Partition** | 物理分片；**并行度**单位 |
| **Replica** | 副本；Leader + Follower |
| **ISR** | 同步副本集 |
| **Controller** | 集群协调（KRaft 模式无 ZooKeeper） |

---

## ⭐ 为什么快

- **顺序写磁盘** + OS Page Cache
- **零拷贝** sendfile
- **批量** 压缩发送
- **分区并行** 消费

---

## ⭐ Producer

```java
kafkaTemplate.send("order-created", orderId.toString(), event);
// key = orderId → 同订单进同一 Partition → 分区内有序
```

| 参数 | 说明 |
|------|------|
| `acks=0` | 不等待确认，可能丢 |
| `acks=1` | Leader 确认 |
| `acks=all` | ISR 全部确认 — **生产推荐** |
| `retries` | 发送失败重试 |
| `enable.idempotence=true` | 幂等 Producer（防重复） |

---

## ⭐ Consumer Group

```text
Topic order-created (3 partitions)
Consumer Group "notification-service":
  Instance 1 → P0
  Instance 2 → P1
  Instance 3 → P2
  Instance 4 → 空闲（≤ partition 数）

再开 Group "audit-service" → 同样消息再消费一遍
```

- **同 Group 内**：一条消息只被一个实例消费（负载均衡）
- **不同 Group**：各自独立 offset（发布订阅）

### Offset

```text
__consumer_offsets 主题存消费进度
auto-offset-reset: earliest | latest
enable.auto.commit: true/false
```

**手动提交：** 业务处理成功再 commit — 防丢消息。

---

## ⭐ 命令行速查

```bash
# 创建 Topic
kafka-topics.sh --create --topic order-created \
  --partitions 6 --replication-factor 3 \
  --bootstrap-server localhost:9092

# 发送
kafka-console-producer.sh --topic order-created \
  --bootstrap-server localhost:9092

# 消费
kafka-console-consumer.sh --topic order-created \
  --from-beginning --bootstrap-server localhost:9092 \
  --group test-group
```

---

## ⭐ 分区与 Key 设计

```java
// 同 userId 进同一分区 — 用户维度顺序
kafkaTemplate.send("user-events", userId.toString(), event);

// 无 key — 轮询分区
kafkaTemplate.send("logs", event);
```

| 分区数 | 建议 |
|--------|------|
| 过少 | 消费并行度不够 |
| 过多 | 文件句柄、选举开销 |
| 调整 | 只能增不能减（重建 Topic） |

---

## 📌 保留与压缩

```properties
retention.ms=604800000   # 7 天
cleanup.policy=delete    # 或 compact（key  compaction，changelog）
```

**日志型：** 可回溯重放 — 新消费者从 earliest 读历史（在 retention 内）。

---

## 📌 事务消息（概要）

```java
kafkaTemplate.executeInTransaction ops -> {
  ops.send("topic-a", event);
  ops.send("topic-b", event2);
  return null;
});
```

跨分区原子写；与 DB 的 **Outbox 模式** 配合实现分布式一致，见 [04-reliability-patterns](./04-reliability-patterns)。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 消费者数 > 分区数 | 部分实例闲置 |
| auto-commit 先 commit 后处理 | 宕机丢消息 |
| 无 key 却要顺序 | 做不到跨分区顺序 |
| replication-factor=1 生产 | 无高可用 |
| 大消息默认 1MB 限制 | 传 ID 不传大对象 |

---

## 本章小结

- Kafka = Topic + Partition + 顺序 log
- Consumer Group 实现竞争消费；多 Group 实现广播
- 生产 acks=all + 幂等 Producer；消费手动 commit + 业务幂等

---

## 下一步

- [RabbitMQ 基础](./03-rabbitmq-basics)

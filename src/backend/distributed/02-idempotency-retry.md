# 幂等、重试与超时

[← 返回索引](./index)

> **本节目标：** 掌握接口幂等设计、重试策略、超时与熔断，避免重复扣款与重试风暴。

---

## ⭐ 为什么需要幂等

分布式环境下 **同一请求可能到达多次**：

| 原因 | 说明 |
|------|------|
| 用户重复点击 | 双提交 |
| 网关超时重试 | 客户端自动重试 |
| MQ 至少一次投递 | 消费者重复消费 |
| 负载均衡重试 | 上游 502 重发 |

**幂等：** 同一 **业务键** 的多次执行，结果与执行 **一次** 相同。

---

## ⭐ 幂等实现方式

### 1. 数据库唯一约束

```sql
CREATE TABLE payment (
  id BIGINT PRIMARY KEY,
  idempotency_key VARCHAR(64) NOT NULL,
  amount DECIMAL(19,4),
  status VARCHAR(32),
  UNIQUE KEY uk_idempotency (idempotency_key)
);
```

```java
@Transactional
public PaymentResult pay(PayCommand cmd) {
  try {
    paymentRepo.insert(cmd.toPayment());
    return PaymentResult.success();
  } catch (DuplicateKeyException e) {
    // 重复请求 — 返回已有结果
    return paymentRepo.findByIdempotencyKey(cmd.idempotencyKey())
        .map(Payment::toResult)
        .orElseThrow();
  }
}
```

### 2. Redis SET NX + Idempotency-Key 请求头

```java
public <T> T executeOnce(String idempotencyKey, Duration ttl, Supplier<T> action) {
  String key = "idem:" + idempotencyKey;
  Boolean first = redis.setIfAbsent(key, "1", ttl);
  if (!Boolean.TRUE.equals(first)) {
    throw new DuplicateRequestException(idempotencyKey);
  }
  try {
    return action.get();
  } catch (Exception e) {
    redis.delete(key);  // 失败允许重试 — 视业务而定
    throw e;
  }
}
```

**注意：** 成功后再 **缓存结果**（JSON），重复请求直接返回缓存响应。

### 3. 状态机 + 乐观锁

```java
// UPDATE order SET status='PAID', version=version+1
// WHERE id=? AND status='PENDING' AND version=?
// affected_rows=0 → 已处理或并发冲突
```

### 4. Token 预占（表单）

提交前先 `GET /form-token` → 提交带 token → 服务端消费 token 一次。

---

## ⭐ 幂等键设计

| 规则 | 说明 |
|------|------|
| 客户端生成 UUID | `Idempotency-Key` 请求头 |
| 业务自然键 | 订单号 + 操作类型 |
| TTL | Redis 键 24h～7d，与对账周期对齐 |
| 范围 | **写操作** 必须；读一般不需要 |

```http
POST /api/payments
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{ "orderId": "O123", "amount": 99.00 }
```

---

## ⭐ 重试策略

| 策略 | 说明 |
|------|------|
| **固定间隔** | 每 3s 重试 |
| **指数退避** | 1s、2s、4s、8s + **随机抖动** |
| **最大次数** | 3～5 次后失败告警 |
| **仅幂等操作重试** | 非幂等 POST 禁止盲目重试 |

```java
@Retryable(
    retryFor = {TransientException.class},
    maxAttempts = 3,
    backoff = @Backoff(delay = 1000, multiplier = 2, random = true))
public void notifyThirdParty(NotifyRequest req) {
  thirdPartyClient.send(req);
}
```

**Spring Retry / Resilience4j** — 见 [熔断器](../spring/cloud/06-circuitbreaker)。

---

## ⭐ 超时设置

```text
客户端超时 < 网关超时 < 上游服务超时链
```

| 层级 | 建议 |
|------|------|
| HTTP 客户端 | connect 1～3s，read 按 P99 |
| DB | socketTimeout、连接池等待 |
| RPC/Feign | 显式配置，禁止默认无限 |

```yaml
feign:
  client:
    config:
      inventory-service:
        connectTimeout: 2000
        readTimeout: 5000
```

**过短：** 误杀慢请求；**过长：** 线程堆积、雪崩。

---

## ⭐ 熔断与舱壁

**熔断（Circuit Breaker）：** 下游失败率超阈值 → **快速失败**，避免拖垮调用方。

```text
Closed → 失败增多 → Open（直接拒绝）
              ↓ 冷却后
         Half-Open → 试探成功 → Closed
```

**舱壁（Bulkhead）：** 线程池隔离，库存调用与支付调用 **分开池**，互不影响。

Sentinel /api：`@SentinelResource` — [Spring Cloud 06](../spring/cloud/06-circuitbreaker)。

---

## 📌 MQ 消费幂等

```java
@RabbitListener(queues = "order.created")
@Transactional
public void onOrderCreated(OrderCreatedEvent event) {
  if (consumeLogRepo.existsByMessageId(event.messageId())) {
    return;  // 已消费
  }
  inventoryService.deduct(event.orderId(), event.items());
  consumeLogRepo.save(new ConsumeLog(event.messageId()));
}
```

Kafka：**消费者组 + 业务幂等**；可配合 **幂等 Producer**（`enable.idempotence=true`）。

见 [消息可靠性](../messaging/04-reliability-patterns)。

---

## 📌 与本地消息表配合

```text
1. 本地事务：更新业务 + 插入 outbox 表
2. 定时任务扫 outbox 发 MQ
3. 消费方幂等处理
```

**Outbox 模式** — 保证 **至少发一次** 且不丢消息。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 非幂等 POST 自动重试 | 重复下单 |
| 幂等键只用时间戳 | 并发冲突 |
| 重试无退避 | 下游雪崩 |
| 超时层层叠加过长 | 用户等 30s |
| 熔断无 Half-Open | 恢复慢或永远不开 |

---

## 本章小结

- 写操作 **必须幂等**：唯一键 / Redis / 状态机
- 重试：**指数退避 + 抖动 + 上限**；仅幂等可重试
- 超时、熔断、舱壁 — 防雪崩三件套

---

## 下一步

- [分布式锁与限流](./03-distributed-lock)

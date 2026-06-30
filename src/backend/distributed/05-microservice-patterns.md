# 微服务设计模式

[← 返回索引](./index)

> **本节目标：** 掌握服务拆分、防腐层、BFF、CQRS 与事件驱动等常见模式。

---

## ⭐ 何时微服务

| 适合 | 不适合 |
|------|--------|
| 团队规模大、领域清晰 | 小团队、MVP |
| 独立伸缩（读多写少模块） | 强事务贯穿、无边界 |
| 技术栈异构需求 | 运维能力不足 |

**先模块化单体，后拆服务** — 避免「分布式单体」。

见 [Spring Cloud 概览](../spring/cloud/01-overview)。

---

## ⭐ 服务拆分原则

| 原则 | 说明 |
|------|------|
| **DDD 限界上下文** | 订单、库存、用户各成边界 |
| **高内聚低耦合** | 上下文内频繁变更一起发版 |
| **数据主权** | 每服务 **独占** 其数据库，禁止跨库 JOIN |
| **2 Pizza 团队** | 一个服务可由小团队负责 |

```text
❌  order_db.orders JOIN inventory_db.stock
✅  订单服务调库存 API / 听库存事件
```

---

## ⭐ 防腐层 ACL（Anti-Corruption Layer）

外部系统 / 遗留模块模型与内部领域不一致 — 加 **翻译层**：

```java
// 内部领域
public record InternalProduct(Long id, Money price, StockStatus status) {}

// 防腐层 — 隔离第三方 API 的 JSON 结构
@Component
public class LegacyErpAdapter {
  public InternalProduct toInternal(LegacyErpSku erp) {
    return new InternalProduct(
        erp.getSkuCode(),
        Money.of(erp.getPriceCent()),
        mapStatus(erp.getStateCode()));
  }
}
```

**收益：** 外部变更不污染核心领域模型。

---

## ⭐ BFF（Backend for Frontend）

```text
Web App ──→ Web BFF ──┐
Mobile  ──→ App BFF ──┼──→ 订单 / 用户 / 商品 微服务
Admin   ──→ Admin BFF ┘
```

| 作用 | 说明 |
|------|------|
| 聚合接口 | 一次请求多服务数据 |
| 裁剪字段 | 移动端少字段 |
| 鉴权差异 | Admin 与 C 端分离 |

可用 **Spring Cloud Gateway + 聚合** 或独立 BFF 服务。

见 [Gateway](../spring/cloud/04-gateway)。

---

## ⭐ API 组合 vs 数据组合

| 方式 | 说明 |
|------|------|
| **API 组合** | BFF 串行/并行调多个 REST |
| **CQRS 读模型** | 写库 + 异步构建 **读库/ES**，查询不再 JOIN 多服务 |

**高读场景：** 事件同步到 **查询专用表**（宽表），避免 BFF N 次 RPC。

---

## ⭐ CQRS（命令查询职责分离）

```text
Command → 写模型（订单聚合）→ 领域事件
                                    ↓
                              投影 / 消费者
                                    ↓
Query   ← 读模型（订单列表宽表 / ES）
```

| 优点 | 缺点 |
|------|------|
| 读写独立扩展 | 最终一致、复杂度高 |
| 查询优化灵活 | 需事件管道 |

**不必全项目 CQRS** — 报表、大屏、搜索等读多写少模块适用。

---

## ⭐ 事件驱动

```java
// 订单创建后发布领域事件
@Transactional
public Order createOrder(CreateOrderCmd cmd) {
  Order order = Order.create(cmd);
  orderRepo.save(order);
  domainEventPublisher.publish(new OrderCreatedEvent(order.getId(), ...));
  return order;
}

// 库存服务订阅
@EventListener
public void onOrderCreated(OrderCreatedEvent e) {
  inventoryService.tryReserve(e.orderId(), e.items());
}
```

跨服务用 **MQ** 解耦 — [Kafka](../messaging/02-kafka-basics)、[可靠性](../messaging/04-reliability-patterns)。

**Saga：** 多步流程靠事件 + 补偿 — [分布式事务](./04-distributed-transaction)。

---

## ⭐ 其他常用模式

| 模式 | 说明 |
|------|------|
| **Strangler Fig** | 绞杀者 — 逐步替换遗留单体 |
| **Sidecar** | 日志、网格代理与业务容器并存 |
| **Database per Service** | 每服务独立库 |
| **Shared Database** | 反模式 — 紧耦合 |
| **Saga Orchestrator** | 中心编排长事务 |

---

## 📌 可观测与契约

| 主题 | 文档 |
|------|------|
| 服务发现 | [cloud/02](../spring/cloud/02-discovery) |
| Feign 调用 | [cloud/05](../spring/cloud/05-feign-loadbalancer) |
| 熔断限流 | [cloud/06](../spring/cloud/06-circuitbreaker) |
| 契约测试 | [cloud/08](../spring/cloud/08-contract-function) |

**微服务必须配套：** 链路追踪、统一日志、指标 — 见 [observability](../observability/)（待写）。

---

## 📌 与分布式能力栈

```text
理论 CAP/BASE
    ↓
幂等 + 重试 + 熔断
    ↓
分布式锁 + 限流
    ↓
Saga / Outbox（跨服务一致）
    ↓
微服务边界 + 事件驱动
```

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 按表拆服务 | 应限界上下文 |
| 共享数据库 | 无法独立演进 |
| BFF 写业务逻辑 | BFF 应薄，逻辑在领域服务 |
| 同步链路过长 | 延迟叠加、故障面大 |
| 无 idempotency | 事件重复消费 |

---

## 本章小结

- 拆分按 **DDD + 数据主权**；避免 distributed monolith
- **ACL** 隔离外部；**BFF** 适配前端；**CQRS/事件** 优化读与解耦
- 跨服务一致用 **Saga/Outbox**，配套幂等与可观测

---

## 分布式模块回顾

| 章 | 要点 |
|----|------|
| 01 理论 | CAP、BASE、一致性级别 |
| 02 幂等 | 幂等键、重试、熔断 |
| 03 锁 | Redis/Redisson、限流 |
| 04 事务 | TCC、Saga、Seata、Outbox |
| 05 模式 | DDD、ACL、BFF、CQRS、事件 |

---

## 下一步

- 继续 [后端路线图](../roadmap) — `jvm/`、`observability/` 等
- [Spring Cloud](../spring/cloud/) 实战对照

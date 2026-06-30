# 分布式事务

[← 返回索引](./index)

> **本节目标：** 理解 2PC、TCC、Saga、本地消息表与 Seata AT 模式，知道何时避免分布式事务。

---

## ⭐ 分布式事务问题

```text
订单服务（库 A）          库存服务（库 B）
     │ create order            │ deduct stock
     └──────── 需要一起成功或一起失败 ────────┘
```

单库 `@Transactional` 无法跨库 — 需要 **协调** 或 **最终一致**。

**企业首选：** 能 **拆库内完成** 或 **最终一致** 就不上 2PC。

---

## ⭐ 两阶段提交 2PC

```text
协调者                    参与者 A / B
   │── prepare ──────────→  写 undo/redo，锁资源
   │←── vote commit ───────
   │── commit ───────────→  真正提交
```

| 优点 | 缺点 |
|------|------|
| 强一致 | 同步阻塞、协调者单点 |
| 理论清晰 | prepare 后宕机难恢复 |

**XA：** JDBC XA 数据源 — 性能差，互联网少用；银行核心等场景可见。

---

## ⭐ TCC（Try-Confirm-Cancel）

业务层实现三阶段：

| 阶段 | 说明 |
|------|------|
| **Try** | 预留资源（冻结库存） |
| **Confirm** | 确认扣减 |
| **Cancel** | 释放预留 |

```java
// 库存服务
void tryDeduct(Long skuId, int qty);   // UPDATE stock SET frozen = frozen + qty WHERE available >= qty
void confirmDeduct(Long skuId, int qty);
void cancelDeduct(Long skuId, int qty);
```

**优点：** 无长锁表、性能较好  
**缺点：** **侵入业务**、幂等与空回滚、悬挂需处理

---

## ⭐ Saga（长事务）

```text
T1 创建订单 → T2 扣库存 → T3 扣款 → T4 发券
                ↓ 失败
            C2 恢复库存 ← C1 取消订单
```

| 类型 | 说明 |
|------|------|
| **编排 Orchestration** | 中心协调器发命令 |
| **编舞 Choreography** | 各服务听 MQ 事件 |

**补偿：** 每个正向操作定义 **逆向补偿**（非回滚，是业务语义取消）。

与 [微服务模式](./05-microservice-patterns) 事件驱动衔接。

---

## ⭐ 本地消息表 / Outbox

```text
┌─────────────────────────────────┐
│ 同一本地事务                      │
│  1. UPDATE business              │
│  2. INSERT outbox(message)       │
└─────────────────────────────────┘
         ↓ 异步
    投递 MQ → 消费者幂等
```

**优点：** 无分布式事务中间件、可靠  
**缺点：** 最终一致、需对账

见 [幂等](./02-idempotency-retry)、[消息可靠性](../messaging/04-reliability-patterns)。

---

## ⭐ Seata AT 模式（了解）

```text
TM 开启全局事务 @GlobalTransactional
  → RM 分支注册
  → 一阶段：执行业务 SQL + 记录 undo_log
  → 二阶段：提交删 undo / 回滚用 undo 镜像
```

```java
@GlobalTransactional(rollbackFor = Exception.class)
public void placeOrder(OrderCmd cmd) {
  orderService.create(cmd);
  inventoryClient.deduct(cmd.getItems());  // Feign 另一库
  accountClient.debit(cmd.getUserId(), cmd.getAmount());
}
```

| 优点 | 缺点 |
|------|------|
| 对业务侵入小 | 依赖 Seata Server |
| 类似 XA 体验 | 全局锁、性能、跨库 SQL 限制 |

**适用：** 多库强一致、团队可运维 Seata；**高并发核心链路** 仍倾向 Saga + 消息。

---

## ⭐ 方案选型

| 场景 | 推荐 |
|------|------|
| 单服务单库 | 本地 `@Transactional` |
| 跨服务、可延迟 | **Outbox + MQ + 幂等** |
| 跨库、强一致、量不大 | Seata AT / TCC |
| 长流程（旅游订票） | **Saga** |
| 只读聚合 | 不要求事务，缓存即可 |

---

## 📌 与数据库事务的关系

- 单库：**ACID** — [事务隔离](../database/03-transaction-isolation)
- 跨库：降级为 **BASE** — [CAP 理论](./01-theory-cap-base)
- **最大努力通知** + **对账** 兜底

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 滥用 @GlobalTransactional | 性能、死锁 |
| TCC 无幂等 | Confirm/Cancel 重复执行出错 |
| Saga 无补偿 | 数据永久不一致 |
| 忽略对账 | 最终一致必须可观测 |
| 分布式事务 + 长 RPC | 锁持有跨网络 |

---

## 本章小结

- **2PC/XA** 强一致但重；互联网多用 **Saga / 本地消息表**
- **TCC** 性能好但开发成本高；**Seata AT** 平衡侵入与体验
- 默认路径：**单库事务 → 消息最终一致 → 必要时 Seata/Saga**

---

## 下一步

- [微服务设计模式](./05-microservice-patterns)

# 分布式系统

> CAP、幂等、分布式锁、分布式事务、微服务模式。与 [Spring Cloud](../spring/cloud/)、[并发编程](../java/core-java/vol1/12-concurrency) 衔接。

---

## 学习路线

```text
理论 CAP/BASE → 幂等与重试 → 分布式锁 → 分布式事务 → 微服务设计模式
```

---

## 章节索引

| 章 | 标题 | 优先级 | 链接 |
|----|------|--------|------|
| 1 | CAP、BASE 与一致性 | ⭐ | [01-theory-cap-base](./01-theory-cap-base) |
| 2 | 幂等、重试与超时 | ⭐ | [02-idempotency-retry](./02-idempotency-retry) |
| 3 | 分布式锁与限流 | ⭐ | [03-distributed-lock](./03-distributed-lock) |
| 4 | 分布式事务 | 📌 | [04-distributed-transaction](./04-distributed-transaction) |
| 5 | 微服务设计模式 | 📌 | [05-microservice-patterns](./05-microservice-patterns) |

- [章节覆盖说明](./coverage-map)

---

## 相关模块

| 模块 | 说明 |
|------|------|
| [redis](../redis/) | 分布式锁实现 |
| [messaging](../messaging/) | Outbox、可靠消费 |
| [database](../database/) | 事务、主从一致 |
| [Spring Cloud](../spring/cloud/) | 微服务基础设施 |

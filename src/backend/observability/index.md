# 可观测性与部署

> 日志、链路追踪、指标、Docker/K8s 基础。与 [Boot Actuator](../spring/boot/06-actuator-test)、[Boot 生产运维](../spring/boot/11-production) 衔接。

---

## 学习路线

```text
日志与 MDC → 链路追踪 → 指标监控 → Docker/K8s 入门
```

---

## 章节索引

| 章 | 标题 | 优先级 | 链接 |
|----|------|--------|------|
| 1 | 日志规范与 MDC | ⭐ | [01-logging-mdc](./01-logging-mdc) |
| 2 | 分布式链路追踪 | ⭐ | [02-tracing](./02-tracing) |
| 3 | 指标与 Actuator | 📌 | [03-metrics-actuator](./03-metrics-actuator) |
| 4 | Docker 与 K8s 入门 | 📌 | [04-docker-k8s-basics](./04-docker-k8s-basics) |

- [章节覆盖说明](./coverage-map)

---

## 相关模块

| 模块 | 说明 |
|------|------|
| [jvm](../jvm/) | Arthas、GC 与容器内存 |
| [Spring Boot 生产](../spring/boot/11-production) | Actuator 扩展 |
| [distributed](../distributed/) | 微服务排查 |
| [database](../database/05-slow-query-tuning) | 慢 SQL 与链路 |

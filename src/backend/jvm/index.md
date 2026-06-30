# JVM 与性能

> 内存模型、GC、调优、OOM 排查。与 [Core Java 并发](../java/core-java/vol1/12-concurrency)、[Boot 生产运维](../spring/boot/11-production) 衔接。

---

## 学习路线

```text
JVM 内存结构 → GC 算法 → 调参与 OOM → Arthas/Profiler
```

---

## 章节索引

| 章 | 标题 | 优先级 | 链接 |
|----|------|--------|------|
| 1 | JVM 内存结构 | ⭐ | [01-memory-model](./01-memory-model) |
| 2 | 垃圾回收算法 | ⭐ | [02-gc-algorithms](./02-gc-algorithms) |
| 3 | 调优与 OOM 排查 | ⭐ | [03-tuning-and-oom](./03-tuning-and-oom) |
| 4 | Arthas 与性能分析 | 📌 | [04-arthas-profiler](./04-arthas-profiler) |

- [章节覆盖说明](./coverage-map)

---

## 相关模块

| 模块 | 说明 |
|------|------|
| [Core Java 并发](../java/core-java/vol1/12-concurrency) | JMM、线程 |
| [Boot 生产](../spring/boot/11-production) | 部署与运维 |
| [observability](../observability/) | 监控与链路（待写） |
| [database](../database/05-slow-query-tuning) | 慢 SQL 与线程阻塞 |

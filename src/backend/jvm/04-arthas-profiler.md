# Arthas 与性能分析

[← 返回索引](./index)

> **本节目标：** 掌握 Arthas、jstack/jmap 等线上诊断命令与 CPU/慢接口排查套路。

---

## ⭐ 诊断工具矩阵

| 工具 | 场景 | 侵入性 |
|------|------|--------|
| **jps** | 列 Java 进程 | 低 |
| **jstat** | GC 统计 | 低 |
| **jstack** | 线程栈、死锁 | 中（STW 短） |
| **jmap** | 堆概要、dump | dump 时 STW |
| **jcmd** | 综合诊断 | 低～中 |
| **Arthas** | 在线命令、trace、watch | 低，**生产首选** |
| **JFR / async-profiler** | CPU 火焰图 | 低（JFR） |
| **VisualVM / MAT** | 离线分析 dump | — |

---

## ⭐ 快速上手 Arthas

```bash
# 下载
curl -O https://arthas.aliyun.com/arthas-boot.jar

#  attach 到进程
java -jar arthas-boot.jar
# 选择 PID
```

**Docker / K8s：**

```bash
kubectl exec -it <pod> -- java -jar /opt/arthas/arthas-boot.jar
```

Spring Boot 可集成 actuator + arthas tunnel（内网）。

---

## ⭐ 常用 Arthas 命令

### dashboard — 总览

```bash
dashboard
```

CPU、GC、堆、线程 TOP — **第一眼**。

### thread — 线程

```bash
thread                    # 所有线程 CPU 时间
thread -n 3               # CPU 最高的 3 个
thread -b                 # 查找死锁
thread <id>               # 指定线程栈
```

**CPU 100%：** `thread -n 5` → 看栈顶业务方法。

### jvm — JVM 信息

```bash
jvm
```

堆、GC 收集器、类加载数。

### heapdump — 堆转储

```bash
heapdump /tmp/dump.hprof
```

等价 jmap，Arthas 更方便。

---

## ⭐ trace — 方法调用链耗时

```bash
trace com.example.OrderService createOrder
trace com.example.OrderService createOrder '#cost > 100'
```

```text
`---[12.5ms] com.example.OrderService:createOrder()
    `---[0.1ms] OrderRepository:save()
    `---[10.2ms] InventoryClient:deduct()  ← 瓶颈
    `---[1.8ms] PaymentClient:charge()
```

**定位慢接口** 无需改代码加日志。

---

## ⭐ watch — 观察入参/返回值

```bash
watch com.example.UserService getUser '{params,returnObj,throwExp}' -x 2
watch com.example.UserService getUser 'returnObj' 'params[0]==12345' -x 3
```

**条件过滤** — 只盯特定用户/订单。

---

## ⭐ stack — 谁调用了某方法

```bash
stack com.example.Cache get
```

排查 **不该被调用的热点** 或缓存穿透。

---

## ⭐ monitor — 方法 QPS/成功率

```bash
monitor -c 5 com.example.api.OrderController create
```

每 5 秒统计调用次数、平均耗时、失败率。

---

## ⭐ jad / mc / redefine（慎用）

```bash
jad com.example.Foo    # 反编译线上 class
```

**热更新** 适合紧急改常量/小逻辑；**生产需变更流程**，重启更稳妥。

---

## ⭐ 经典 jstack 排查

```bash
jstack <pid> > thread.txt
```

| 栈特征 | 含义 |
|--------|------|
| `BLOCKED` + 等同一锁 | 锁竞争 |
| `WAITING` on pool | 线程池任务堆积 |
| 大量 `RUNNABLE` 同一业务行 | 可能忙等或 CPU 热点 |
| `Deadlock` 段 | 死锁 |

**Tomcat / Spring：** `http-nio-*` 线程全 BLOCKED 在 DB 连接池 → 连接池过小或慢 SQL。

见 [数据库慢查询](../database/05-slow-query-tuning)。

---

## ⭐ CPU 火焰图（async-profiler）

```bash
# 附加到进程，采样 60s
profiler start
profiler stop --format html --file /tmp/cpu.html
```

**横条越宽** = CPU 时间越多 — 直观找热点。

JDK 内置 **JFR**：

```bash
jcmd <pid> JFR.start duration=60s filename=recording.jfr
jfr print --events CPU,ExecutionSample recording.jfr
```

---

## 📌 线上排查剧本

### 接口突然变慢

```text
1. dashboard / 监控 — GC 是否频繁
2. trace 慢接口 — 哪一层 RPC/ SQL
3. 若 DB — 慢查询日志
4. 若 CPU 高 — thread -n / 火焰图
5. 若堆高 — heapdump + MAT
```

### 内存泄漏

```text
1. 堆曲线持续上升
2. jstat 或 GC 日志 Full GC 不回落
3. 低峰 heapdump
4. MAT Leak Suspects
5. 修复 + 压测 24h
```

### 死锁

```text
thread -b  或  jstack | grep -A 20 Deadlock
```

---

## 📌 与可观测性配合

| 层次 | 手段 |
|------|------|
| 指标 | Prometheus + Grafana（堆、GC、QPS） |
| 日志 | 结构化 + traceId |
| 链路 | SkyWalking / Zipkin |
| 诊断 | Arthas 临时 attach |

见 [observability](../observability/)（待写）。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 生产随意 trace 全类 | 开销大 — 限条件、限时长 |
| dump 高峰 | STW 影响用户 |
| 无权限 attach | 容器需同 user / CAP_SYS_PTRACE |
| 只看 CPU 不看 GC | STW 表现为延迟尖刺 |
| 排查完 Arthas 常驻 | 用完 detach，减攻击面 |

---

## 本章小结

- **Arthas：** dashboard、thread、trace、watch、heapdump — 线上必备
- **jstack：** 死锁、线程池阻塞
- **火焰图/JFR：** CPU 热点
- 与监控、GC 日志、MAT 组合 — 完整排查闭环

---

## JVM 模块回顾

| 章 | 要点 |
|----|------|
| 01 内存 | 堆栈元空间、对象布局、JMM |
| 02 GC | G1/ZGC、GC 日志 |
| 03 调优 | 参数、OOM、MAT |
| 04 诊断 | Arthas、jstack、profiler |

---

## 下一步

- 继续 [后端路线图](../roadmap) — `observability/` 等
- [Boot 生产运维](../spring/boot/11-production)
- [并发编程](../java/core-java/vol1/12-concurrency)

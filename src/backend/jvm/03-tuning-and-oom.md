# 调优与 OOM 排查

[← 返回索引](./index)

> **本节目标：** 掌握常用 JVM 参数、OOM 类型定位、Heap Dump 分析与调优思路。

---

## ⭐ 调优原则

```text
1. 有指标、有日志 — 勿盲目调参
2. 先定位瓶颈 — CPU / 内存 / GC / IO
3. 一次改少量参数 — 对比前后
4. 吞吐 vs 延迟 — 按 SLA 取舍
```

**多数 Spring Boot 服务：** 合理堆大小 + G1 + GC 日志 + OOM 自动 dump 即可。

---

## ⭐ 常用 JVM 参数

### 堆

```bash
-Xms512m          # 初始堆
-Xmx512m          # 最大堆 — 与 Xms 相同避免扩容
-Xss512k          # 每线程栈（默认平台相关）
-XX:MaxMetaspaceSize=256m
```

### G1

```bash
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-XX:InitiatingHeapOccupancyPercent=45   # 老年代占比触发并发标记
```

### 诊断

```bash
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/var/log/app/heapdump.hprof
-XX:+ExitOnOutOfMemoryError              # K8s 重启 Pod
-Xlog:gc*:file=/var/log/app/gc.log:time,level,tags
-XX:+UseStringDeduplication              # G1 字符串去重（可选）
```

### Spring Boot

```yaml
# application.yml 或 JAVA_TOOL_OPTIONS
JAVA_OPTS: "-Xms512m -Xmx512m -XX:+UseG1GC ..."
```

或 `spring-boot-maven-plugin` / Dockerfile `ENTRYPOINT`。

---

## ⭐ OOM 类型速查

| 错误信息 | 原因 | 排查 |
|----------|------|------|
| `Java heap space` | 堆满 — 泄漏或大对象 | heap dump、MAT |
| `GC overhead limit exceeded` | GC 回收极少仍满 | 同 heap，堆太小或泄漏 |
| `Metaspace` | 类元数据过多 | 类加载器泄漏、代理类爆炸 |
| `Unable to create new native thread` | 线程过多 | 线程池、`-Xss` |
| `Direct buffer memory` | 堆外 NIO | Netty、DirectBuffer 未释放 |
| `Requested array size exceeds VM limit` | 单次分配超大数组 | 代码 bug |

---

## ⭐ 排查流程

```text
1. 现象：Full GC 频繁 / 接口超时 / Pod Restart
2. 看监控：堆曲线、GC 停顿、线程数
3. 看 GC 日志：Full GC 前后老年代
4. jmap / Arthas heapdump
5. MAT 或 VisualVM 分析 dominator tree
6. 定位泄漏引用链 → 改代码
7. 压测验证
```

---

## ⭐ Heap Dump 分析（MAT）

```bash
# 在线 dump
jmap -dump:live,format=b,file=heap.hprof <pid>

# 或 OOM 时自动生成
```

**MAT 关键视图：**

| 视图 | 用途 |
|------|------|
| **Leak Suspects** | 自动嫌疑报告 |
| **Dominator Tree** | 谁占用最多 |
| **Histogram** | 按类实例数/大小 |
| **Path to GC Roots** | 谁持有了不该持有的引用 |

**典型泄漏：**

```java
// 静态 Map 无限 put
private static final Map<String, Object> CACHE = new HashMap<>();

// ThreadLocal 未 remove（线程池）
threadLocal.set(largeObject);
// finally { threadLocal.remove(); }

// 未关闭连接 / 流
// try-with-resources 解决
```

见 [Core Java IO](../java/core-java/vol2/02-input-output)。

---

## ⭐ 案例：老年代缓慢上涨

```text
现象：运行 24h 后 Full GC 每 10 分钟一次
堆：-Xmx2g，回收后 old 从 200M 涨到 1.8G 不回落
```

**步骤：**

1. dump 对比启动 1h 与 24h
2. MAT 发现 `byte[]` 或 `char[]` 与某 Cache 类 dominator 最大
3. 代码：Guava Cache 无 `maximumSize` / 无过期
4. 修复：`Caffeine.maximumSize(10000).expireAfterWrite(10, MINUTES)`

---

## ⭐ CPU 高 vs 内存

| CPU 高 | 内存/GC |
|--------|---------|
| 死循环、正则回溯 | 泄漏、堆小 |
| 频繁 GC 也会 CPU 高 | Full GC STW 像卡顿 |
| `top -H` / Arthas thread | GC 日志、heap |

**不要只调堆** — CPU 100% 可能是代码热点。

---

## 📌 容器与 K8s

```yaml
resources:
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

| 实践 | 说明 |
|------|------|
| `-Xmx` ≈ limit 的 50%～70% | 留给 metaspace、栈、native |
| `ExitOnOutOfMemoryError` | 让 K8s 重启干净实例 |
| liveness 考虑 GC 停顿 | 过长 STW 可能探活失败 |

JDK 10+ **容器感知**：默认读取 cgroup memory limit（仍建议显式 `-Xmx`）。

---

## 📌 压测验证

调优后 **JMeter / Gatling** 压测：

- 吞吐（QPS）
- P99 延迟
- GC 停顿 P99
- 堆使用稳定否

见 [Boot 生产](../spring/boot/11-production)、[可观测性](../observability/)（待写）。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 拷贝他人 -Xmx4g | 服务体量不同 |
| dump 文件过大 | 压缩、离线分析；`-dump:live` 只 dump 存活 |
| 生产频繁 dump | STW 影响 — 低峰操作 |
| 只扩容不查泄漏 | 内存仍涨直到下次 OOM |
| 忽略 off-heap | Netty 堆外独立限制 |

---

## 本章小结

- **参数：** Xms=Xmx、G1、GC 日志、OOM dump
- **OOM：** 按类型定位；MAT 看 dominator 与 GC Roots
- **容器：** 堆 + 非堆 < limit；OOM 退出重启

---

## 下一步

- [Arthas 与性能分析](./04-arthas-profiler)

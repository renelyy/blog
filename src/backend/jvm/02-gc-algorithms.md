# 垃圾回收算法

[← 返回索引](./index)

> **本节目标：** 理解可达性分析、分代 GC、G1/ZGC 及 GC 日志阅读。

---

## ⭐ 如何判断垃圾

**可达性分析（根集合 GC Roots）：**

```text
GC Roots
  ├── 虚拟机栈中引用的局部变量
  ├── 静态变量引用的对象
  ├── JNI 引用
  └── 活跃线程、类加载器等
         │
         └── 不可达 → 可回收
```

**不是** 引用计数（无法处理循环引用）。

---

## ⭐ 基础算法

| 算法 | 说明 | 缺点 |
|------|------|------|
| **标记-清除** | 标记存活 → 清除垃圾 | 内存碎片 |
| **标记-复制** | 存活对象复制到另一块 | 浪费一半空间（Survivor 用） |
| **标记-整理** | 标记 → 存活对象向一端移动 | 移动成本高（老年代用） |

**分代假设：** 大部分对象朝生夕死；老对象长期存活。

---

## ⭐ Minor GC 与 Full GC

| 类型 | 范围 | 触发 |
|------|------|------|
| **Minor GC / Young GC** | 年轻代 | Eden 满 |
| **Major GC** | 老年代 | 老年代空间不足 |
| **Full GC** | 整堆 + 元空间等 | System.gc、老年代满、Metaspace OOM 前等 |

```text
new 对象 → Eden
    ↓ Eden 满，Minor GC
存活 → Survivor（年龄 +1）
    ↓ 年龄达阈值（默认 15）或 Survivor 放不下
晋升 → Old
    ↓ Old 满
Full GC（STW 停顿长）
```

---

## ⭐ 收集器概览（JDK 17+ 企业常用）

| 收集器 | 范围 | 特点 | 场景 |
|--------|------|------|------|
| **Serial** | 单线程 | STW | 客户端、小堆 |
| **Parallel** | 吞吐优先 | 多线程 STW | 批处理、离线 |
| **CMS** | 并发标记 | **已废弃** JDK 14+ | 勿新项目用 |
| **G1** | 分区 Region | 可预测停顿、JDK 9+ 默认 | **通用首选** |
| **ZGC** | 低延迟 | 亚毫秒级停顿目标 | 大堆、低延迟 |
| **Shenandoah** | 低延迟 | 类似 ZGC | OpenJDK |

---

## ⭐ G1 深入

```text
堆划分为多个 Region（1～32MB）
  ├── Eden Region
  ├── Survivor Region
  └── Old Region
```

| 概念 | 说明 |
|------|------|
| **Young GC** | 回收所有 Eden + Survivor |
| **Mixed GC** | 回收部分 Old Region（垃圾最多优先） |
| **IHOP** | Initiating Heap Occupancy — 老年代占比触发并发标记 |
| **停顿目标** | `-XX:MaxGCPauseMillis=200`（启发式，非硬保证） |

**推荐参数（起点，非银弹）：**

```bash
-XX:+UseG1GC
-Xms2g -Xmx2g
-XX:MaxGCPauseMillis=200
-XX:+HeapDumpOnOutOfMemoryError
-Xlog:gc*:file=gc.log:time,uptime,level,tags
```

JDK 9+ 统一日志：`-Xlog:gc*` 替代 `-XX:+PrintGCDetails`。

---

## ⭐ ZGC 简述

- **并发** 标记、转移、重定位
- 支持 **TB 级堆**，停顿与堆大小弱相关
- JDK 15+ 生产可用；JDK 21 **分代 ZGC** 进一步改善吞吐

```bash
-XX:+UseZGC
-Xms4g -Xmx4g
```

**选型：** 延迟 SLA 严格（P99 < 10ms）+ 大堆 → ZGC；一般微服务 **G1** 足够。

---

## ⭐ GC 日志阅读

```
[2024-01-15T10:00:00.123+0800][info][gc] GC(42) Pause Young (Normal) 512M->128M(2048M) 25.123ms
```

| 字段 | 含义 |
|------|------|
| GC(42) | 第 42 次 GC |
| Pause Young | 年轻代回收 |
| 512M->128M | 回收前后堆占用 |
| (2048M) | 堆容量 |
| 25.123ms | **STW 停顿时间** |

**关注点：**

- Full GC **频率** 与 **单次停顿**
- 回收后老年代 **持续上升** → 泄漏或堆过小
- Mixed GC 跟不上分配速度 → 调堆或 IHOP

工具：**GCViewer**、**GCEasy**、**JDK Mission Control (JFR)**。

---

## ⭐ SafePoint 与 STW

GC 需要 **Stop-The-World** 做根扫描时，线程须停在 **安全点**（方法调用、循环回边等）。

**长计数循环无安全点** 可能导致 GC 等待过久 — 少见但面试会问。

---

## 📌 与业务的关系

| 现象 | 可能 GC 原因 |
|------|-------------|
| 接口周期性卡顿 | Young GC 频繁或 Full GC |
| 发布后变慢 | 元空间/类加载、堆配置变化 |
| 大促 OOM | 堆不足或泄漏 |

配合 [调优与 OOM](./03-tuning-and-oom)、[Arthas](./04-arthas-profiler)。

---

## 📌 System.gc()

```java
System.gc();  // 建议 GC，不保证
```

**生产：** `-XX:+DisableExplicitGC` 常开；但 **NIO DirectBuffer** 清理有时依赖 Full GC — 需评估。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 堆越大越好 | 单次 Full GC 更长 |
| 忽略 GC 日志 | 出问题无历史 |
| CMS 新项目 | 已移除 |
| MaxGCPauseMillis 过小 | 吞吐暴跌 |
| 只调 -Xmx 不换收集器 | G1/ZGC 行为差异大 |

---

## 本章小结

- **可达性分析** + **分代** — 理论基础
- 企业默认 **G1**；极低延迟大堆考虑 **ZGC**
- 会读 GC 日志：停顿时间、老年代趋势、Full GC 频率

---

## 下一步

- [调优与 OOM 排查](./03-tuning-and-oom)

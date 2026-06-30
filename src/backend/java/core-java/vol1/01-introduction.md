# 第 1 章：Java 语言概述

[← 卷 I 目录](../index) · [Core Java 首页](../index)

> 原书 *Core Java Vol.I* Chapter 1 — An Introduction to Java

---

## ⭐ Java 是什么

Java 是 Sun（现 Oracle）推出的**面向对象**通用编程语言，设计目标可以概括为：

| 设计目标 | 含义 | 企业价值 |
|----------|------|----------|
| 简单 | 语法接近 C++ 但去掉指针、多重继承 | 降低团队上手成本 |
| 面向对象 | 一切皆对象（基本类型有包装类） | 大型系统模块化 |
| 分布式 | 内置网络库 | 微服务、RPC 基础 |
| 健壮 | 强类型 + 异常 + GC | 减少内存泄漏类事故 |
| 安全 | 字节码校验、沙箱（早期 Applet） | 配合 Security 框架 |
| 体系结构中立 | 编译为字节码，JVM 执行 | 同一 jar 跑 Linux/Windows |
| 可移植 | 「Write Once, Run Anywhere」 | 容器化部署一致 |
| 高性能 | JIT 热点编译 | 接近 C++ 的 CPU 密集场景 |
| 多线程 | 语言级线程支持 | 高并发后端 |
| 动态 | 反射、类加载、字节码增强 | Spring、MyBatis 基石 |

**企业后端选型 Java 的核心原因：** 生态成熟（Spring 全家桶）、人才储备、长期 LTS 支持、类型安全适合复杂业务。

---

## ⭐ JDK / JRE / JVM

```text
┌─────────────────────────────────────┐
│              JDK                     │
│  ┌───────────────────────────────┐  │
│  │  开发工具：javac, jar, javadoc │  │
│  │  诊断：jcmd, jstack, jmap      │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  JRE = JVM + 核心类库          │  │
│  │  java.base, java.sql, ...      │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
         ↓ 加载并执行
    .class 字节码文件
```

| 组件 | 说明 |
|------|------|
| **JVM** | 执行字节码；负责内存管理、JIT、GC |
| **JRE** | Java 11 起不再单独发布，合入 JDK |
| **JDK** | 开发必备：编译器 + 运行时 + 工具 |

**版本选择（2024+ 企业）：**

- **Java 17 LTS** — 当前主流，Spring Boot 3 最低要求
- **Java 21 LTS** — 虚拟线程、Pattern Matching 增强，新项目可优先
- 避免非 LTS（18–20、22–23）上生产

---

## ⭐ Java 程序执行流程

```text
Hello.java  ──javac──►  Hello.class（字节码）
                              │
                              ▼
                         ClassLoader 加载
                              │
                              ▼
                    解释执行 ──► 热点代码 JIT 编译为本地码
                              │
                              ▼
                         GC 回收无用对象
```

最小程序：

```java
public class Hello {
  public static void main(String[] args) {
    System.out.println("Hello, Java!");
  }
}
```

**要点：**

- 公共类名必须与文件名 `Hello.java` 一致
- `main` 必须是 `public static void main(String[] args)`
- 入口参数 `args` 来自命令行：`java Hello arg1 arg2`

---

## ⭐ 字节码与跨平台

`javac` 生成的是 **平台无关** 的字节码，不是机器码。不同操作系统安装对应 JVM 即可运行同一套 jar。

```bash
javac Hello.java          # 编译
java Hello                # 运行（启动 JVM）
java -jar app.jar         # 运行可执行 jar（需 Manifest Main-Class）
```

反汇编查看字节码：

```bash
javap -c -v Hello.class
```

企业排查「本地能跑、线上不行」时，常查 **JVM 版本、字节码版本、依赖冲突**，而非重新编译 C 代码那种平台差异。

---

## ⭐ Java 与 C++ 的关键差异（原书 1.3 节）

| 特性 | C++ | Java |
|------|-----|------|
| 指针算术 | 有 | 无 |
| 多重继承（类） | 有 | 单继承，多接口 |
| 内存管理 | 手动 new/delete | GC 自动回收 |
| 编译产物 | 机器码 | 字节码 + JVM |
| 预处理器 | `#include` | `import` 包机制 |
| 结构体 | struct | class / record |

---

## 📌 Java 8 → 21 企业相关新特性

| 版本 | 特性 | 企业价值 |
|------|------|----------|
| 8 | Lambda、Stream、Optional、`java.time` | 集合处理、函数式风格；仍有不少老项目 |
| 9 | 模块 JPMS、`List.of` | 模块化；集合工厂方法 |
| 10 | 局部变量 `var` | 减少样板类型声明 |
| 11 LTS | `HttpClient`、String 新方法 | 标准 HTTP 客户端 |
| 14 | `switch` 表达式、Records 预览 | 更简洁分支 |
| 15 | **文本块** `"""` | SQL、JSON 模板 |
| 16 | **Record** 正式 | 不可变 DTO |
| 17 LTS | **Sealed 类**、Pattern Matching for `instanceof` | 领域建模 |
| 21 LTS | **虚拟线程**、Sequenced Collections | 高并发 IO、有序集合 |

**迁移建议：** 8 → 17 先解决 `javax` → `jakarta`（Spring Boot 3）、废弃 API 清理；17 → 21 可逐步启用虚拟线程。

---

## 📌 常见误解

| 误解 | 事实 |
|------|------|
| Java 很慢 | JIT 后 CPU 密集场景性能很好；瓶颈多在 IO、数据库 |
| GC 等于不用管内存 | 泄漏（静态集合、未关闭连接）仍会发生 |
| `final` 对象不可变 | `final` 是引用不变，对象内部状态仍可变 |
| 反射不影响设计 | 框架依赖反射，但手写反射有性能与安全成本 |

---

## 📌 Java vs 其他语言（后端视角）

| | Java | Go | Python |
|---|------|-----|--------|
| 类型 | 静态强类型 | 静态 | 动态 |
| 性能 | JIT 优化好 | 编译快、goroutine 轻量 | 较慢 |
| 生态 | Spring/MyBatis 最成熟 | K8s、云原生中间件 | 数据/AI 脚本 |
| 并发模型 | 线程 + 虚拟线程 | goroutine | GIL 限制多线程 CPU |
| 适用 | 大型业务、金融、政企 | 网关、Sidecar、CLI | 数据处理、胶水 |

---

## 📌 标准库与生态分层

```text
业务代码（Controller / Service / Domain）
        ↓
Spring Boot / Cloud / MyBatis
        ↓
JDK（java.util / java.time / java.util.concurrent / java.net）
        ↓
JVM（GC、JIT、线程）
```

学习路径：**语言 + JDK**（本书）→ **框架**（Spring/MyBatis）→ **中间件**（Redis/Kafka）。

---

## 本章小结

- Java = 面向对象 + JVM + 丰富类库
- 企业开发安装 **JDK 17/21 LTS**，用 Maven/Gradle 构建
- 理解字节码与 JVM 有助于排查生产环境问题
- 新特性（Record、Sealed、虚拟线程）逐步融入日常代码

---

## 下一步

- [第 2 章：编程环境](./02-environment)

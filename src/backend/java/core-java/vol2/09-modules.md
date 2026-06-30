# 第 9 章：Java 平台模块系统（JPMS）

[← 卷 II 目录](../index)

> 原书 Chapter 9 — The Java Platform Module System（Java 9+）

---

## ⭐ 为什么有模块

Java 8 及以前：**classpath 地狱** — 所有 jar 在同一 classpath，包可见性仅靠 `public`，冲突与封装弱。

JPMS 目标：

- **强封装** — 未 export 的包对外不可见
- **显式依赖** — `requires` 声明
- **可裁剪运行时** — `jlink` 定制 JRE

JDK 9 自身已模块化（`java.base`、`java.sql`…）。

---

## ⭐ module-info.java

```java
module com.example.order.app {
  requires java.sql;
  requires java.net.http;
  requires spring.boot;
  requires spring.boot.autoconfigure;

  exports com.example.order.api;
  exports com.example.order.dto to com.fasterxml.jackson.databind;

  opens com.example.order.domain to org.hibernate.orm.core, spring.core;
  opens com.example.order.config to spring.beans;

  provides com.example.spi.PaymentGateway with com.example.payment.AlipayGateway;
  uses com.example.spi.PaymentGateway;
}
```

| 指令 | 含义 |
|------|------|
| `requires` | 依赖模块（编译+运行） |
| `requires transitive` | 传递依赖给下游 |
| `requires static` | 可选依赖 |
| `exports pkg` | 对外暴露包 |
| `exports pkg to mod` | 限定模块 |
| `opens pkg` | 允许**反射**（Spring/Hibernate 需要） |
| `provides / uses` | **ServiceLoader** SPI |

---

## ⭐ 模块 vs classpath

```text
classpath 模式（Spring Boot fat jar 常见）
  └── 所有 jar 扁平加载，JPMS 封装弱

module-path 模式
  └── 每个模块独立，强封装
```

```bash
java --module-path libs --module com.example.app/com.example.Main
```

---

## ⭐ ServiceLoader

```java
// module-info: provides ... with ...
// module-info: uses ...
ServiceLoader<PaymentGateway> loader = ServiceLoader.load(PaymentGateway.class);
for (PaymentGateway gw : loader) {
  gw.pay(order);
}
```

JDBC 驱动加载、SLF4J 绑定、插件架构常用 SPI。

---

## 📌 自动模块与无名模块

| 概念 | 说明 |
|------|------|
| **自动模块** | 无 `module-info` 的 jar 上 module-path → 名通常由 jar 名推导 |
| **无名模块** | classpath 上代码；可读 module-path 导出包 |
| **根模块** | 应用入口模块 |

迁移老库：先 classpath 跑，逐步加 `module-info` 或 stay automatic module。

---

## 📌 企业现实（Spring Boot）

- 绝大多数 Boot 应用 **classpath / fat jar**，不强制 JPMS
- Spring 对未 opens 的包需要 `--add-opens`（反射）
- 库作者提供 `module-info` 改善 IDE 与封装

```bash
# 常见启动参数（调试用）
java --add-opens java.base/java.lang=ALL-UNNAMED \
     -jar app.jar
```

Boot 3 native / GraalVM 是另一条瘦身路径，不只 jlink。

---

## 📌 jlink 定制运行时

```bash
jlink --add-modules java.base,java.sql,java.net.http,jdk.unsupported \
      --strip-debug --no-man-pages --compress=2 \
      --output custom-jre
```

嵌入式、IoT、极小容器镜像可能用；常规微服务仍用完整 JRE 镜像。

---

## ⚠️ 迁移难点

| 难点 | 说明 |
|------|------|
| 反射 break | 需 `opens` 或 add-opens |
| split package | 同包跨 jar 非法 |
| 依赖未模块化 | automatic module 名冲突 |
| 构建插件 | Maven compiler module-path 配置 |

---

## 本章小结

- JPMS = 强封装 + 显式依赖 + jlink
- Spring 项目**理解概念**即可；库开发才深入 module-info
- ServiceLoader 与 SPI 模式值得掌握

---

## 下一步

- [第 10 章：安全](./10-security)

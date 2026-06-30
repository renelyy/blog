# Core Java 章节覆盖说明

[← 返回索引](./index)

## 采用的版本

**Core Java 第 12 版**（Java 17 LTS）。第 11 版章节结构基本一致，差异主要在 Records、Sealed Classes、Pattern Matching、Text Blocks 等 — 本笔记按第 12 版编写。

---

## 卷 I 对照

| 原书章 | 本指南 | 说明 |
|--------|--------|------|
| Ch 1 Introduction | [01-introduction](./vol1/01-introduction) | ✅ |
| Ch 2 Environment | [02-environment](./vol1/02-environment) | ✅ |
| Ch 3 Fundamentals | [03-fundamentals](./vol1/03-fundamentals) | ✅ |
| Ch 4 Objects and Classes | [04-objects-classes](./vol1/04-objects-classes) | ✅ 含 Record |
| Ch 5 Inheritance | [05-inheritance](./vol1/05-inheritance) | ✅ 含 Sealed、Reflection |
| Ch 6 Interfaces & Lambda | [06-interfaces-lambda](./vol1/06-interfaces-lambda) | ✅ |
| Ch 7 Exceptions & Logging | [07-exceptions-logging](./vol1/07-exceptions-logging) | ✅ |
| Ch 8 Generics | [08-generics](./vol1/08-generics) | ✅ |
| Ch 9 Collections | [09-collections](./vol1/09-collections) | ✅ |
| Ch 10 GUI Programming | **跳过** | 桌面 UI，企业后端不需要 |
| Ch 11 UI Components | **跳过** | Swing 组件 |
| Ch 12 Concurrency | [12-concurrency](./vol1/12-concurrency) | ✅ 企业必学 |

---

## 卷 II 对照

| 原书章 | 本指南 | 说明 |
|--------|--------|------|
| Ch 1 Streams | [01-streams](./vol2/01-streams) | ✅ |
| Ch 2 Input/Output | [02-input-output](./vol2/02-input-output) | ✅ NIO、序列化 |
| Ch 3 XML | [03-xml](./vol2/03-xml) | 📎 概要（MyBatis/Spring 仍见 XML） |
| Ch 4 Networking | [04-networking](./vol2/04-networking) | ✅ HTTP Client 重点 |
| Ch 5 Database/JDBC | [05-jdbc](./vol2/05-jdbc) | ✅ 原理层；ORM 见 MyBatis |
| Ch 6 Date and Time | [06-date-time](./vol2/06-date-time) | ✅ java.time |
| Ch 7 Internationalization | [07-i18n](./vol2/07-i18n) | 📎 出海业务才深入 |
| Ch 8 Annotations | [08-annotations](./vol2/08-annotations) | ✅ Spring 基础 |
| Ch 9 Module System | [09-modules](./vol2/09-modules) | 📎 JPMS 概要 |
| Ch 10 Security | [10-security](./vol2/10-security) | ✅ 概要 |
| Ch 11 Advanced Swing | **跳过** | 图形/UI |
| Ch 12 Native Methods | **跳过** | JNI 极少用 |

---

## 未纳入原书但企业常补的内容

- **Maven/Gradle 构建** → 见 [02-environment](./vol1/02-environment)、[Spring Boot](../../spring/boot/)
- **JUnit 5 测试** → 见 [Spring Boot 测试](../../spring/boot/06-actuator-test)
- **虚拟线程（Java 21+）** → 第 12 章末尾补充说明

[← 返回索引](./index)

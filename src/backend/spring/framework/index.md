# Spring Framework

[← Spring 生态首页](../index)

> Spring Framework 是整个 Spring 生态的**基石**，提供 IoC 容器、AOP、Web、数据访问、消息等能力。Spring Boot 是在其之上的「约定优于配置」封装。

---

## 核心模块

| 模块 | 包/关键词 | 作用 |
|------|-----------|------|
| **Core Container** | `beans`, `context` | IoC、DI、事件、资源 |
| **AOP** | `aop`, `aspectj` | 切面、事务、安全横切 |
| **Web** | `spring-web`, `spring-webmvc` | Servlet MVC、REST |
| **WebFlux** | `spring-webflux` | 响应式 Web（可选） |
| **Data Access** | `jdbc`, `orm`, `tx` | JDBC、ORM 集成、事务 |
| **Test** | `spring-test` | Mock、TestContext |

---

## 章节导航

| 章节 | 优先级 |
|------|--------|
| [IoC 与依赖注入](./01-ioc-di) | ⭐ |
| [AOP](./02-aop) | 📌 |
| [Spring MVC / Web](./03-mvc-web) | ⭐ |
| [数据访问与事务](./04-data-transaction) | ⭐ |
| [Bean 进阶](./05-bean-advanced) | 📌 |
| [校验与数据绑定](./06-validation) | 📌 |
| [Spring 测试](./07-testing) | ⭐ |
| [WebSocket](./08-websocket) | 📎 |
| [WebFlux 入门](./09-webflux) | 📎 |
| [事件 / 调度 / 缓存](./10-integration) | 📌 |

---

## 与 Spring Boot 的关系

- **Framework**：提供 API 与容器实现
- **Boot**：自动装配 Framework 模块，提供 Starter、默认配置、内嵌 Tomcat

纯 Framework 项目需自己写 XML/Java 配置 + 部署 WAR；Boot 项目通常只有 `@SpringBootApplication` 和 `application.yml`。

---

## 官方文档

- [Spring Framework Reference](https://docs.spring.io/spring-framework/reference/)
- [What's New in Spring Framework 6.x](https://github.com/spring-projects/spring-framework/wiki/Spring-Framework-6.0-Release-Notes)

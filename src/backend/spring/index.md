# Spring 生态友好指南

> 基于 [Spring 官网](https://spring.io/) 及官方 Reference **整理翻译**（非逐句全量）。**Framework + Boot + Cloud 官方文档合计数千页**，本指南约 **40 篇**，覆盖日常开发 **80% 场景**；冷门 API 与全量配置项见 [官方覆盖说明](./coverage-map) 与 [附录索引](./appendix-spring-reference)。
>
> 推荐版本：**Spring Boot 3.x** + **Spring Framework 6.x** + **Spring Cloud 2023.0.x / 2024.0.x**（**Java 17+**）

---

## ⚠️ 是否「翻译全了」？

| 问题 | 回答 |
|------|------|
| 是否官方每一节都有？ | **否**。例如 WebFlux 全卷、Spring Data 全系列、Security OAuth2 专册等仅入门或链官方 |
| 是否比第一版更全？ | **是**。已从 20 篇扩到 **40+ 篇**（Framework 10 + Boot 12 + Cloud 8 + 说明/附录） |
| 查某个 `spring.*` 配置默认值？ | 用 [Boot 配置属性官方索引](https://docs.spring.io/spring-boot/appendix/application-properties/index.html) |
| 想指定模块「深度翻译」？ | 在 coverage-map 末尾列出可扩写方向 |

---

## 三者的关系

```text
Spring Framework     ← IoC、AOP、MVC、事务、数据访问
       ↓
Spring Boot          ← 自动配置、Starter、Actuator
       ↓
Spring Cloud         ← 微服务：发现、配置、网关、Feign、熔断
```

| 技术 | 官方文档 |
|------|----------|
| Spring Framework | [Reference](https://docs.spring.io/spring-framework/reference/) |
| Spring Boot | [Reference](https://docs.spring.io/spring-boot/reference/) |
| Spring Cloud | [Reference](https://docs.spring.io/spring-cloud/docs/current/reference/html/) |

---

## 优先级图例

| 标签 | 含义 |
|------|------|
| ⭐ **必学** | 日常开发离不开 |
| 📌 **常用** | 高频场景 |
| 📎 **进阶** | 深入或扩展 |
| ⚠️ **注意** | 易踩坑 |

---

## 文档索引

### 说明与附录

| 章节 | 说明 |
|------|------|
| [官方覆盖说明](./coverage-map) | **必读**：哪些译了、哪些只链官方 |
| [附录：官方章节索引](./appendix-spring-reference) | 官方 URL 速查 |

### Spring Framework（10 篇）

| 章节 | 说明 |
|------|------|
| [Framework 首页](./framework/) | 模块概览 |
| [IoC 与依赖注入](./framework/01-ioc-di) | ⭐ |
| [AOP](./framework/02-aop) | 📌 |
| [Spring MVC / Web](./framework/03-mvc-web) | ⭐ |
| [数据访问与事务](./framework/04-data-transaction) | ⭐ |
| [Bean 进阶](./framework/05-bean-advanced) | 生命周期、循环依赖、SpEL 📌 |
| [校验与数据绑定](./framework/06-validation) | 📌 |
| [Spring 测试](./framework/07-testing) | ⭐ |
| [WebSocket / STOMP](./framework/08-websocket) | 📎 |
| [WebFlux 入门](./framework/09-webflux) | 📎 |
| [事件 / 调度 / 缓存 / 邮件](./framework/10-integration) | 📌 |

### Spring Boot（12 篇）

| 章节 | 说明 |
|------|------|
| [Boot 首页](./boot/) | Starter、结构 |
| [快速上手](./boot/01-quick-start) | ⭐ |
| [自动配置原理](./boot/02-auto-configuration) | 📌 |
| [配置与 Profile](./boot/03-configuration) | ⭐ |
| [Web 与 REST](./boot/04-web-rest) | 📌 |
| [数据访问](./boot/05-data-access) | 📌 |
| [Actuator 与测试](./boot/06-actuator-test) | 📌 |
| [日志与 DevTools](./boot/07-logging-devtools) | 📌 |
| [Security 入门](./boot/08-security) | 📌 |
| [Redis / NoSQL](./boot/08-nosql-redis) | 📌 |
| [Kafka / RabbitMQ](./boot/09-messaging) | 📎 |
| [响应式 Web](./boot/09-reactive) | 📎 |
| [调度与异步](./boot/10-scheduling-async) | 📌 |
| [生产运维](./boot/11-production) | 指标、追踪 ⭐ |
| [打包与部署](./boot/12-packaging-deploy) | Docker、K8s 📌 |

### Spring Cloud（8 篇）

| 章节 | 说明 |
|------|------|
| [Cloud 首页](./cloud/) | 组件地图 |
| [架构与概念](./cloud/01-overview) | ⭐ |
| [服务注册与发现](./cloud/02-discovery) | 📌 |
| [配置中心](./cloud/03-config) | 📌 |
| [API 网关](./cloud/04-gateway) | ⭐ |
| [OpenFeign / LoadBalancer](./cloud/05-feign-loadbalancer) | 📌 |
| [熔断与容错](./cloud/06-circuitbreaker) | 📌 |
| [Stream 与 Bus](./cloud/07-stream-bus) | 📎 |
| [Contract 与其它组件](./cloud/08-contract-function) | 概要 |

---

## 与 MyBatis 指南

[Boot 数据访问](./boot/05-data-access) · [MyBatis 指南](../mybatis/)

---

## 官方资源

- [Spring 官网](https://spring.io/)
- [Spring Guides](https://spring.io/guides)
- [Boot 配置属性大全](https://docs.spring.io/spring-boot/appendix/application-properties/index.html)

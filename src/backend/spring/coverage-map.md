# 官方文档覆盖说明

[← Spring 生态首页](./index)

> **先说清楚：** [Spring Framework Reference](https://docs.spring.io/spring-framework/reference/)、[Spring Boot Reference](https://docs.spring.io/spring-boot/reference/)、[Spring Cloud Reference](https://docs.spring.io/spring-cloud/docs/current/reference/html/) 三套官方文档合计 **数千页**。本仓库做的是：**中文重编排 + 常用章节翻译提炼 + 附录速查**，**不是**逐段逐句全量翻译。

---

## 本指南 vs 官方文档

| 维度 | 官方 Reference | 本指南 |
|------|----------------|--------|
| 篇幅 | Framework ~30 章、Boot ~15 大篇、Cloud 10+ 子项目 | 按学习路线压缩，**约 35+ 篇** |
| 目标 | API 完整、边界条件齐全 | **能上手、能排查、知道去哪查** |
| 深度 | 每个属性都有说明 | 必学项写透，冷门项链到官方 |
| 更新 | 随版本发布 | 需人工跟进 Release Notes |

**若你需要查某个配置项的全部合法值** → 直接看 [Boot 配置属性附录](https://docs.spring.io/spring-boot/appendix/application-properties/index.html)。

---

## Spring Framework 覆盖对照

| 官方章节 | 本指南位置 | 覆盖度 |
|----------|------------|--------|
| Core → IoC Container | [01-ioc-di](./framework/01-ioc-di)、[05-bean-advanced](./framework/05-bean-advanced) | ⭐⭐⭐ 高 |
| Core → Resources / Environment | [05-bean-advanced](./framework/05-bean-advanced) | ⭐⭐ 中 |
| Core → Validation / Data Binding | [06-validation](./framework/06-validation) | ⭐⭐⭐ 高 |
| Core → Type Conversion / SpEL | [05-bean-advanced](./framework/05-bean-advanced) | ⭐ 概要 |
| Core → AOP | [02-aop](./framework/02-aop) | ⭐⭐⭐ 高 |
| Core → AOT | [appendix](./appendix-spring-reference) | ⭐ 链接 |
| Testing | [07-testing](./framework/07-testing) | ⭐⭐⭐ 高 |
| Data Access → JDBC / TX | [04-data-transaction](./framework/04-data-transaction) | ⭐⭐⭐ 高 |
| Data Access → ORM / R2DBC | [04-data-transaction](./framework/04-data-transaction) | ⭐⭐ 中 |
| Web → Servlet / MVC | [03-mvc-web](./framework/03-mvc-web) | ⭐⭐⭐ 高 |
| Web → WebSocket / STOMP | [08-websocket](./framework/08-websocket) | ⭐⭐ 中 |
| Web → WebFlux | [09-webflux](./framework/09-webflux) | ⭐⭐ 入门 |
| Integration → Scheduling / Cache / Email | [10-integration](./framework/10-integration) | ⭐⭐ 中 |

---

## Spring Boot 覆盖对照

| 官方大篇 | 本指南位置 | 覆盖度 |
|----------|------------|--------|
| Getting Started / System Requirements | [01-quick-start](./boot/01-quick-start) | ⭐⭐⭐ |
| Developing → Build / Structuring | [boot/index](./boot/)、[01-quick-start](./boot/01-quick-start) | ⭐⭐ |
| Core → Externalized Config / Profiles | [03-configuration](./boot/03-configuration) | ⭐⭐⭐ |
| Core → Logging / JSON / DevTools | [07-logging-devtools](./boot/07-logging-devtools) | ⭐⭐⭐ |
| Core → Auto-configuration | [02-auto-configuration](./boot/02-auto-configuration) | ⭐⭐⭐ |
| Core → Task / Scheduling | [10-scheduling-async](./boot/10-scheduling-async) | ⭐⭐ |
| Web → Servlet / REST / Error handling | [04-web-rest](./boot/04-web-rest) | ⭐⭐⭐ |
| Web → Reactive | [09-reactive](./boot/09-reactive) | ⭐⭐ |
| Data → SQL / JPA / NoSQL | [05-data-access](./boot/05-data-access)、[08-nosql-redis](./boot/08-nosql-redis) | ⭐⭐⭐ |
| Messaging → Kafka / RabbitMQ | [09-messaging](./boot/09-messaging) | ⭐⭐ |
| Security | [08-security](./boot/08-security) | ⭐⭐ 入门 |
| Testing | [06-actuator-test](./boot/06-actuator-test) | ⭐⭐⭐ |
| Production → Actuator / Metrics / Tracing | [06-actuator-test](./boot/06-actuator-test)、[11-production](./boot/11-production) | ⭐⭐⭐ |
| Packaging / Deploy / Docker / Native | [12-packaging-deploy](./boot/12-packaging-deploy) | ⭐⭐ |

---

## Spring Cloud 覆盖对照

| 官方子项目 / 能力 | 本指南位置 | 覆盖度 |
|-------------------|------------|--------|
| 总览 / Release Train | [cloud/index](./cloud/)、[01-overview](./cloud/01-overview) | ⭐⭐⭐ |
| Discovery (Eureka / Nacos) | [02-discovery](./cloud/02-discovery) | ⭐⭐⭐ |
| Config / Nacos Config | [03-config](./cloud/03-config) | ⭐⭐⭐ |
| Gateway | [04-gateway](./cloud/04-gateway) | ⭐⭐⭐ |
| OpenFeign / LoadBalancer | [05-feign-loadbalancer](./cloud/05-feign-loadbalancer) | ⭐⭐⭐ |
| Circuit Breaker | [06-circuitbreaker](./cloud/06-circuitbreaker) | ⭐⭐⭐ |
| Stream / Bus | [07-stream-bus](./cloud/07-stream-bus) | ⭐⭐ |
| Contract / Function | [08-contract-function](./cloud/08-contract-function) | ⭐ 概要 |
| Consul / Vault / Zookeeper / K8s | [appendix](./appendix-spring-reference) | ⭐ 链接 |

---

## 建议怎么用

1. **系统学习**：按 [index 学习路线](./index) 顺序读本指南  
2. **查配置项**：本指南附录 + [官方属性索引](https://docs.spring.io/spring-boot/appendix/application-properties/index.html)  
3. **查冷门 API**：直接打开官方 Reference 对应章节（英文）  
4. **动手**：配合 [Spring Guides](https://spring.io/guides)

---

## 后续可继续扩充的方向

- Spring Security 专册（OAuth2 / JWT / 方法级权限）
- Spring Data JPA 专册（关联、N+1、审计）
- Spring Cloud Alibaba 专册（Nacos + Sentinel + Seata 实战）
- GraalVM Native Image 专册

如需某一块「接近官方全量」的深度翻译，可以指定模块优先扩写。

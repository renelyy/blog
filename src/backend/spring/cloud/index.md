# Spring Cloud

[← Spring 生态首页](../index)

> Spring Cloud 为分布式系统提供**开箱即用**的实现：配置管理、服务发现、网关、负载均衡、熔断等。

官方：[Spring Cloud Reference](https://docs.spring.io/spring-cloud/docs/current/reference/html/)

---

## ⭐ 解决什么问题？

微服务架构中的**样板问题**：

| 问题 | Spring Cloud 组件 |
|------|-------------------|
| 服务在哪？ | Nacos / Eureka **Discovery** |
| 配置怎么统一管理？ | **Config** / Nacos Config |
| 外部怎么访问？ | **Gateway** |
| 服务间怎么调用？ | **OpenFeign** + **LoadBalancer** |
| 下游挂了怎么办？ | **Circuit Breaker**（Resilience4j） |
| 链路追踪？ | Micrometer Tracing / Sleuth  successor |

---

## ⭐ 版本对应（Release Train）

Spring Cloud 采用**发布列车**命名，须与 Spring Boot 版本匹配：

| Spring Cloud 列车 | Spring Boot |
|-------------------|-------------|
| 2024.0.x (Moorgate) | 3.4.x |
| 2023.0.x (Leyton) | 3.2.x ~ 3.3.x |
| 2022.0.x (Kilburn) | 3.0.x ~ 3.1.x |

查最新：[Spring Cloud 官网](https://spring.io/projects/spring-cloud)

```xml
<!-- Maven BOM 管理版本 -->
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-dependencies</artifactId>
      <version>2023.0.3</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
```

---

## 章节导航

| 章节 | 优先级 |
|------|--------|
| [架构与概念](./01-overview) | ⭐ |
| [服务注册与发现](./02-discovery) | 📌 |
| [配置中心](./03-config) | 📌 |
| [API 网关](./04-gateway) | ⭐ |
| [OpenFeign 与负载均衡](./05-feign-loadbalancer) | 📌 |
| [熔断与容错](./06-circuitbreaker) | 📎 |

---

## 子项目一览

| 项目 | 说明 |
|------|------|
| spring-cloud-gateway | 响应式 API 网关 |
| spring-cloud-openfeign | 声明式 HTTP 客户端 |
| spring-cloud-loadbalancer | 客户端负载均衡（替代 Ribbon） |
| spring-cloud-config | Git/本地配置中心 |
| spring-cloud-netflix | Eureka 等 Netflix 集成 |
| spring-cloud-circuitbreaker | 熔断抽象 |
| spring-cloud-stream | 消息流 |
| spring-cloud-bus | 配置刷新广播 |

国内常用 **Nacos** 同时替代 Eureka + Config，与 Spring Cloud Alibaba 集成。

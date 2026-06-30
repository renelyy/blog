# Spring Boot

[← Spring 生态首页](../index)

> Spring Boot 帮你**快速创建独立、生产级** Spring 应用：内嵌服务器、自动配置、Starter 依赖、Actuator 监控。

官方：[Spring Boot Reference](https://docs.spring.io/spring-boot/reference/)

---

## ⭐ 核心特性

| 特性 | 说明 |
|------|------|
| **自动配置** | 根据 classpath 自动装配 Bean |
| **Starter** | 一组 curated 依赖，一键引入能力 |
| **内嵌容器** | Tomcat / Jetty / Undertow，jar 直接运行 |
| **外部化配置** | application.yml、环境变量、命令行 |
| **Actuator** | 健康检查、指标、运维端点 |
| **无代码生成** | 无 XML 要求 |

---

## 章节导航

| 章节 | 优先级 |
|------|--------|
| [快速上手](./01-quick-start) | ⭐ |
| [自动配置原理](./02-auto-configuration) | 📌 |
| [配置与 Profile](./03-configuration) | ⭐ |
| [Web 与 REST](./04-web-rest) | 📌 |
| [数据访问](./05-data-access) | 📌 |
| [Actuator 与测试](./06-actuator-test) | 📌 |
| [日志与 DevTools](./07-logging-devtools) | 📌 |
| [Security 入门](./08-security) | 📌 |
| [Redis / NoSQL](./08-nosql-redis) | 📌 |
| [Kafka / RabbitMQ](./09-messaging) | 📎 |
| [响应式 Web](./09-reactive) | 📎 |
| [调度与异步](./10-scheduling-async) | 📌 |
| [生产运维](./11-production) | ⭐ |
| [打包与部署](./12-packaging-deploy) | 📌 |

---

## ⭐ 典型项目结构

```text
src/main/java/com/example/demo/
  DemoApplication.java          # @SpringBootApplication
  controller/
  service/
  repository/ / mapper/
  config/
src/main/resources/
  application.yml
  static/                       # 静态资源
  templates/                    # 模板（Thymeleaf 等）
src/test/java/
  DemoApplicationTests.java
```

---

## 系统要求（3.x）

- Java **17+**
- Spring Framework **6.x**
- Maven 3.6.3+ / Gradle 7.6.4+

---

## 常用 Starter

| Starter | 能力 |
|---------|------|
| `spring-boot-starter-web` | MVC + Tomcat + Jackson |
| `spring-boot-starter-data-jpa` | JPA + Hibernate |
| `spring-boot-starter-jdbc` | JDBC + HikariCP |
| `spring-boot-starter-validation` | Hibernate Validator |
| `spring-boot-starter-actuator` | 监控端点 |
| `spring-boot-starter-test` | JUnit 5 + MockMvc |
| `mybatis-spring-boot-starter` | MyBatis 集成 |

完整列表：[Spring Boot Starters](https://docs.spring.io/spring-boot/reference/using/build-systems.html#using.build-systems.starters)

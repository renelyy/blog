# Spring Boot 快速上手

[← Boot 首页](./index)

> **本节你将学到：** 创建项目、启动应用、第一个 REST 接口。

---

## ⭐ 创建项目

### 方式 1：Spring Initializr（推荐）

访问 [start.spring.io](https://start.spring.io/)：

- Project: Maven
- Language: Java
- Spring Boot: 3.4.x
- Java: 17
- Dependencies: **Spring Web**

### 方式 2：IDEA

File → New → Project → Spring Initializr

---

## ⭐ 入口类

```java
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {
  public static void main(String[] args) {
    SpringApplication.run(DemoApplication.class, args);
  }
}
```

`@SpringBootApplication` = `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan`

---

## ⭐ Hello World（官方 Quickstart 风格）

```java
@RestController
public class HelloController {

  @GetMapping("/hello")
  public String hello() {
    return "Hello, Spring Boot!";
  }
}
```

运行 `main` 或：

```bash
./mvnw spring-boot:run
# Windows
mvnw.cmd spring-boot:run
```

访问 `http://localhost:8080/hello`

---

## ⭐ 打包与运行

```bash
./mvnw package
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

可执行 jar 内嵌 Tomcat，无需外部容器。

---

## 📌 常用 application.yml

```yaml
server:
  port: 8080
  servlet:
    context-path: /

spring:
  application:
    name: demo-service

logging:
  level:
    com.example: debug
```

---

## 📌 DevTools 热重启

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-devtools</artifactId>
  <optional>true</optional>
</dependency>
```

classpath 变更时自动重启（比热部署 class 更稳）。

---

## 下一步

- [自动配置原理](./02-auto-configuration)
- [配置与 Profile](./03-configuration)

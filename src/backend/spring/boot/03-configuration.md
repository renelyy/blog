# 配置与 Profile

[← Boot 首页](./index)

> **本节你将学到：** 配置优先级、YAML、Profile 多环境、类型安全配置绑定。

---

## ⭐ 配置来源（优先级高 → 低）

1. 命令行参数 `--server.port=9090`
2. `SPRING_APPLICATION_JSON` 环境变量
3. Java 系统属性 `System.getProperties()`
4. 操作系统环境变量 `SERVER_PORT`
5. `application-{profile}.yml`（profile 特定）
6. `application.yml`
7. `@PropertySource`
8. 默认属性

**后加载的不一定覆盖先加载的**——Spring Boot 2.4+ 使用**统一有序规则**，同 key 时**后序源覆盖前序**（详见官方 [Externalized Configuration](https://docs.spring.io/spring-boot/reference/features/external-config.html)）。

---

## ⭐ application.yml

```yaml
server:
  port: 8080

spring:
  application:
    name: order-service
  datasource:
    url: jdbc:mysql://localhost:3306/demo
    username: root
    password: secret
    driver-class-name: com.mysql.cj.jdbc.Driver

myapp:
  feature:
    enabled: true
  timeout: 30s
```

---

## ⭐ Profile 多环境

```yaml
# application.yml
spring:
  profiles:
    active: dev
```

```yaml
# application-dev.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/demo_dev

# application-prod.yml
spring:
  datasource:
    url: jdbc:mysql://prod-host:3306/demo
```

激活方式：

```bash
java -jar app.jar --spring.profiles.active=prod
# 或环境变量 SPRING_PROFILES_ACTIVE=prod
```

---

## 📌 @ConfigurationProperties

```java
@ConfigurationProperties(prefix = "myapp")
public record MyAppProperties(
    boolean featureEnabled,
    Duration timeout
) { }
```

```java
@SpringBootApplication
@EnableConfigurationProperties(MyAppProperties.class)
public class Application { }
```

YAML 绑定：

```yaml
myapp:
  feature-enabled: true
  timeout: 30s
```

支持 JSR-303 校验 `@Validated` + `@NotNull`。

---

## 📌 @Value

```java
@Value("${myapp.timeout:60}")
private int timeoutSeconds;
```

简单场景可用；复杂结构推荐 `@ConfigurationProperties`。

---

## 📌 配置加密 / 敏感信息

- 生产环境用环境变量、K8s Secret、Vault
- 勿把密码提交 Git
- Spring Cloud Config / Nacos 集中管理

---

## 下一步

- [Web 与 REST](./04-web-rest)
- [Boot 配置属性大全（官方）](https://docs.spring.io/spring-boot/appendix/application-properties/index.html)

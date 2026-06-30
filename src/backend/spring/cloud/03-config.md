# 配置中心

[← Cloud 首页](./index)

> 集中管理多环境配置、动态刷新。

---

## ⭐ 为什么需要配置中心？

- 多服务、多环境配置统一维护
- 改配置**不重新打包**
- 敏感信息权限控制
- 配置变更审计

---

## Spring Cloud Config

### Config Server

```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-config-server</artifactId>
</dependency>
```

```java
@SpringBootApplication
@EnableConfigServer
public class ConfigServerApplication { }
```

```yaml
server:
  port: 8888
spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/your-org/config-repo
          search-paths: '{application}'
```

仓库文件命名：`{application}-{profile}.yml`，如 `order-service-dev.yml`

### Config Client

```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-config</artifactId>
</dependency>
```

```yaml
spring:
  application:
    name: order-service
  config:
    import: optional:configserver:http://localhost:8888
  profiles:
    active: dev
```

Boot 2.4+ 推荐 `spring.config.import` 替代 bootstrap.yml。

---

## 📌 动态刷新 @RefreshScope

```java
@RestController
@RefreshScope
public class ConfigController {
  @Value("${feature.message}")
  private String message;
}
```

配合 Actuator `/actuator/refresh` 或 **Spring Cloud Bus** 广播刷新。

---

## ⭐ Nacos Config（Alibaba）

```xml
<dependency>
  <groupId>com.alibaba.cloud</groupId>
  <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>
```

```yaml
spring:
  application:
    name: order-service
  cloud:
    nacos:
      config:
        server-addr: 127.0.0.1:8848
        file-extension: yaml
        namespace: dev
        group: DEFAULT_GROUP
  config:
    import: optional:nacos:order-service.yaml
```

Nacos 控制台创建 Data ID = `{spring.application.name}.{file-extension}`

支持监听配置变更，自动刷新 `@RefreshScope` Bean。

---

## 📌 配置优先级

Client 本地 `application.yml` < Config Server / Nacos 远程配置（具体以 import 顺序为准）。

---

## 下一步

- [API 网关](./04-gateway)

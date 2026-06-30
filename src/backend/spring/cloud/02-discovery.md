# 服务注册与发现

[← Cloud 首页](./index)

> Eureka 与 Nacos 两种主流方案的配置与使用。

---

## ⭐ Eureka（Spring Cloud Netflix）

### 服务端

```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>
```

```java
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {
  public static void main(String[] args) {
    SpringApplication.run(EurekaServerApplication.class, args);
  }
}
```

```yaml
server:
  port: 8761
eureka:
  client:
    register-with-eureka: false
    fetch-registry: false
```

### 客户端

```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

```yaml
spring:
  application:
    name: order-service   # 服务 ID

eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8761/eureka/
```

⚠️ `defaultZone` 是 camelCase，**不是** `default-zone`（`serviceUrl` 是 Map）。

引入 Client 后应用自动**注册**并**发现**其他服务。

### 禁用发现

```yaml
eureka:
  client:
    enabled: false
# 或
spring:
  cloud:
    discovery:
      enabled: false
```

---

## ⭐ Nacos Discovery（Spring Cloud Alibaba）

```xml
<dependency>
  <groupId>com.alibaba.cloud</groupId>
  <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
```

```yaml
spring:
  application:
    name: order-service
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848
        namespace: dev
        group: DEFAULT_GROUP
```

```java
@SpringBootApplication
@EnableDiscoveryClient   // 多数 starter 可省略
public class OrderApplication { }
```

---

## 📌 消费端：RestTemplate + @LoadBalanced

```java
@Configuration
public class RestConfig {
  @Bean
  @LoadBalanced
  public RestTemplate restTemplate() {
    return new RestTemplate();
  }
}

@Service
public class OrderClient {
  private final RestTemplate rest;

  public String getUser(Long id) {
    // user-service 为注册名，LoadBalancer 解析实例
    return rest.getForObject("http://user-service/api/users/{id}", String.class, id);
  }
}
```

推荐改用 **OpenFeign**（见下一章）。

---

## 📌 健康检查与元数据

Eureka 默认 health：`/actuator/health`，status：`/actuator/info`

```yaml
eureka:
  instance:
    prefer-ip-address: true
    health-check-url-path: /actuator/health
```

---

## 下一步

- [配置中心](./03-config)
- [OpenFeign](./05-feign-loadbalancer)

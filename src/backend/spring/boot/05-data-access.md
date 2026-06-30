# 数据访问

[← Boot 首页](./index)

> JDBC、MyBatis、JPA 在 Boot 中的集成方式。

---

## ⭐ JDBC + HikariCP（默认连接池）

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>
<dependency>
  <groupId>com.mysql</groupId>
  <artifactId>mysql-connector-j</artifactId>
  <scope>runtime</scope>
</dependency>
```

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/demo?useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: secret
  # Hikari 可选调优
  hikari:
    maximum-pool-size: 20
    minimum-idle: 5
```

---

## ⭐ MyBatis 集成

```xml
<dependency>
  <groupId>org.mybatis.spring.boot</groupId>
  <artifactId>mybatis-spring-boot-starter</artifactId>
  <version>3.0.4</version>
</dependency>
```

```yaml
mybatis:
  mapper-locations: classpath:mapper/**/*.xml
  type-aliases-package: com.example.domain
  configuration:
    map-underscore-to-camel-case: true
```

```java
@SpringBootApplication
@MapperScan("com.example.mapper")
public class Application { }
```

持久层细节 → [MyBatis 友好指南](../../mybatis/)

---

## 📌 Spring Data JPA

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

```java
public interface UserRepository extends JpaRepository<User, Long> {
  List<User> findByUsernameContaining(String keyword);
}
```

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate   # 生产用 validate/none，开发可用 update
    show-sql: true
    properties:
      hibernate:
        format_sql: true
```

| ddl-auto | 行为 |
|----------|------|
| `none` | 不改 schema |
| `validate` | 校验 schema |
| `update` | 更新 schema（开发） |
| `create-drop` | 启动创建、关闭删除（测试） |

---

## 📌 多数据源（进阶）

```java
@Configuration
public class DataSourceConfig {
  @Bean
  @Primary
  @ConfigurationProperties("spring.datasource.primary")
  public DataSource primaryDataSource() { return DataSourceBuilder.create().build(); }

  @Bean
  @ConfigurationProperties("spring.datasource.secondary")
  public DataSource secondaryDataSource() { return DataSourceBuilder.create().build(); }
}
```

配合 `@Qualifier`、独立 `SqlSessionFactory` / `EntityManagerFactory`。

---

## 📌 事务

Boot 自动配置 `PlatformTransactionManager`；Service 层 `@Transactional` 即可（见 [Framework 事务](../framework/04-data-transaction)）。

---

## 下一步

- [Actuator 与测试](./06-actuator-test)

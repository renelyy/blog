# Testcontainers

[← 返回索引](./index)

> **本节目标：** 用真实 MySQL、Redis 等容器做集成测试，替代 H2 与 mock 基础设施。

---

## ⭐ 为什么 Testcontainers

| H2 内存库 | Testcontainers |
|-----------|----------------|
| 快 | 较慢（启动容器） |
| 语法/行为与 MySQL 有差异 | **与生产一致** |
| 测不了 Redis、Kafka 特有行为 | 可起 MySQL/Redis/Kafka |

**企业推荐：** Repository / 复杂 SQL / Redis 缓存逻辑 → **Testcontainers**。

---

## ⭐ 依赖

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-testcontainers</artifactId>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>org.testcontainers</groupId>
  <artifactId>mysql</artifactId>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>org.testcontainers</groupId>
  <artifactId>junit-jupiter</artifactId>
  <scope>test</scope>
</dependency>
```

**环境：** 本机需 **Docker**；CI 用 docker-in-docker 或 Kaniko 旁路。

---

## ⭐ 基础用法（JUnit 5）

```java
@Testcontainers
class OrderRepositoryIT {

  @Container
  static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
      .withDatabaseName("test")
      .withUsername("test")
      .withPassword("test");

  @DynamicPropertySource
  static void registerProps(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", mysql::getJdbcUrl);
    registry.add("spring.datasource.username", mysql::getUsername);
    registry.add("spring.datasource.password", mysql::getPassword);
  }

  @Autowired
  private OrderRepository orderRepo;

  @Test
  void saveAndFind() {
    Order order = new Order();
    order.setStatus(OrderStatus.PENDING);
    orderRepo.save(order);
    assertThat(orderRepo.findAll()).hasSize(1);
  }
}
```

| 要点 | 说明 |
|------|------|
| `@Container static` | 类级单例，所有测试共享 — 快 |
| `@DynamicPropertySource` | 把容器端口注入 Spring 配置 |
| `@Testcontainers` | 管理容器生命周期 |

---

## ⭐ Spring Boot 3.1+ @ServiceConnection

```java
@SpringBootTest
@Testcontainers
class OrderServiceIT {

  @Container
  @ServiceConnection
  static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0");

  @Autowired
  private OrderService orderService;

  @Test
  void createOrder() {
    Order order = orderService.create(validCmd());
    assertThat(order.getId()).isNotNull();
  }
}
```

`@ServiceConnection` **自动绑定** DataSource — 少写 `@DynamicPropertySource`。

---

## ⭐ 多容器组合

```java
@SpringBootTest
@Testcontainers
class CacheIntegrationIT {

  @Container
  @ServiceConnection
  static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0");

  @Container
  static GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine")
      .withExposedPorts(6379);

  @DynamicPropertySource
  static void redisProps(DynamicPropertyRegistry registry) {
    registry.add("spring.data.redis.host", redis::getHost);
    registry.add("spring.data.redis.port", () -> redis.getMappedPort(6379));
  }

  @Test
  void cacheAside_shouldWork() { }
}
```

**Compose：** `testcontainers` 支持 `DockerComposeContainer` 一键起整套依赖。

---

## ⭐ 与 @DataJpaTest 结合

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class UserRepositoryTest {

  @Container
  @ServiceConnection
  static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0");

  @Test
  void findByEmail() { }
}
```

`Replace.NONE` — **禁止** H2 替换，强制用容器 URL。

---

## ⭐ Flyway / 初始化脚本

```java
static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
    .withInitScript("db/init.sql");
```

或 Spring Boot：

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
```

测试 profile 跑 **相同 migration** — 与生产 schema 一致。见 [database](../database/01-sql-basics)。

---

## ⭐ 性能优化

| 技巧 | 说明 |
|------|------|
| **static @Container** | 一类一容器，非一测一容器 |
| **Ryuk 复用** | Testcontainers 默认清理；CI 缓存镜像 |
| **固定镜像 tag** | `mysql:8.0.36` 非 `latest` |
| **@Tag("integration")** | CI 分 job：unit 快路径 / integration 并行 |
| **Testcontainers Cloud** | 远程 Docker（可选） |

```java
// 仅 CI 跑 integration
@Tag("integration")
@SpringBootTest
class HeavyIT { }
```

---

## 📌 Kafka 示例（了解）

```java
@Container
static KafkaContainer kafka = new KafkaContainer(
    DockerImageName.parse("confluentinc/cp-kafka:7.5.0"));

@DynamicPropertySource
static void kafkaProps(DynamicPropertyRegistry registry) {
  registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
}
```

见 [messaging](../messaging/02-kafka-basics)。

---

## 📌 与 CI 集成

```yaml
# GitHub Actions 片段
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      docker:
        image: docker:dind
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '17'
      - run: mvn test -Dgroups=unit
      - run: mvn verify -Dgroups=integration
```

**GitLab CI：** `docker` executor + `services: docker:dind`。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 无 Docker | 本地/CI 测试 skip 或 fail fast |
| 非 static Container | 每测启停 — 极慢 |
| 端口写死 | 用 `getMappedPort` 动态端口 |
| 容器未 ready 就连 | Testcontainers 自带 wait 策略 |
| 数据污染 | @Transactional 或 @Sql cleanup |

---

## 本章小结

- **Testcontainers** = 真实中间件 + JUnit 5 + Spring 动态配置
- `@ServiceConnection` 简化 DataSource；static 容器提速
- 与 Flyway、@DataJpaTest、@SpringBootTest 组合 — **集成测试生产级**

---

## 测试模块回顾

| 章 | 要点 |
|----|------|
| 01 JUnit 5 | 断言、参数化、金字塔 |
| 02 Mockito | mock/verify、@MockBean |
| 03 Spring Test | 切片、MockMvc |
| 04 Testcontainers | MySQL/Redis、CI |

---

## 下一步

- 继续 [后端路线图](../roadmap) — `api-design/`、`design-patterns/`
- [Spring Framework 测试](../spring/framework/07-testing)
- [Boot Actuator 与测试](../spring/boot/06-actuator-test)

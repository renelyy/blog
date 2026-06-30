# Spring Boot 测试

[← 返回索引](./index)

> **本节目标：** 掌握 `@WebMvcTest`、`@DataJpaTest`、`@SpringBootTest` 切片与 MockMvc 测试。

---

## ⭐ 测试切片概览

| 注解 | 加载范围 | 用途 |
|------|----------|------|
| `@WebMvcTest` | Controller + MVC | API 层 |
| `@JsonTest` | Jackson | JSON 序列化 |
| `@DataJpaTest` | JPA + 内存/容器 DB | Repository |
| `@JdbcTest` | JdbcTemplate | JDBC |
| `@RestClientTest` | RestTemplate/WebClient | HTTP 客户端 |
| `@SpringBootTest` | **完整上下文** | 集成/E2E |

**原则：** 用 **最小切片** — 更快、更聚焦。

见 [Spring Framework 测试](../spring/framework/07-testing)。

---

## ⭐ @WebMvcTest — Controller

```java
@WebMvcTest(OrderController.class)
class OrderControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private OrderService orderService;

  @Test
  void createOrder_shouldReturn201() throws Exception {
    OrderDto dto = new OrderDto(1L, "PAID");
    when(orderService.create(any())).thenReturn(dto);

    mockMvc.perform(post("/api/orders")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"userId":1,"items":[{"skuId":100,"qty":2}]}
                """))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(1))
        .andExpect(jsonPath("$.status").value("PAID"));

    verify(orderService).create(any(CreateOrderCmd.class));
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  void deleteOrder_shouldRequireAdmin() throws Exception {
    mockMvc.perform(delete("/api/orders/1"))
        .andExpect(status().isNoContent());
  }
}
```

| 工具 | 说明 |
|------|------|
| **MockMvc** | 模拟 HTTP，不启真实端口 |
| `@MockBean` | Mock Service 层 |
| `@WithMockUser` | 安全测试 — 见 [security](../security/) |

---

## ⭐ @DataJpaTest — Repository

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class OrderRepositoryTest {

  @Autowired
  private OrderRepository orderRepo;

  @Autowired
  private TestEntityManager em;

  @Test
  void findByStatus_shouldReturnMatching() {
    Order order = new Order();
    order.setStatus(OrderStatus.PAID);
    em.persist(order);
    em.flush();

    List<Order> list = orderRepo.findByStatus(OrderStatus.PAID);
    assertThat(list).hasSize(1);
  }
}
```

| 配置 | 说明 |
|------|------|
| 默认 H2 | 快速但不等于 MySQL |
| `Replace.NONE` + Testcontainers | **生产级** — 见 [04 章](./04-testcontainers) |
| `@Transactional` | 测试后自动回滚（默认） |

---

## ⭐ @SpringBootTest — 集成测试

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class OrderApiIntegrationTest {

  @Autowired
  private TestRestTemplate restTemplate;

  @Test
  void health_shouldBeUp() {
    ResponseEntity<String> res = restTemplate.getForEntity("/actuator/health", String.class);
    assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
  }
}
```

| webEnvironment | 说明 |
|----------------|------|
| `MOCK` | MockMvc（默认） |
| `RANDOM_PORT` | 真实端口 + TestRestTemplate |
| `DEFINED_PORT` | 固定端口 |

**慢** — 少量关键路径；其余用切片。

---

## ⭐ MockMvc 进阶

```java
mockMvc.perform(get("/api/orders")
        .param("page", "0")
        .param("size", "20")
        .header("Authorization", "Bearer token"))
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.content", hasSize(lessThanOrEqualTo(20))))
    .andDo(print());  // 调试输出
```

**文件上传：**

```java
mockMvc.perform(multipart("/api/upload").file("file", content.getBytes()))
    .andExpect(status().isOk());
```

---

## ⭐ 测试配置

```java
@TestConfiguration
static class TestConfig {
  @Bean
  @Primary
  Clock fixedClock() {
    return Clock.fixed(Instant.parse("2024-01-01T00:00:00Z"), ZoneOffset.UTC);
  }
}
```

```yaml
# src/test/resources/application-test.yml
spring:
  datasource:
    url: jdbc:tc:mysql:8.0:///test
  jpa:
    hibernate:
      ddl-auto: create-drop
```

```java
@SpringBootTest
@ActiveProfiles("test")
class AppTest { }
```

---

## 📌 @Sql 与数据准备

```java
@Test
@Sql(scripts = "/sql/orders_seed.sql")
@Sql(scripts = "/sql/cleanup.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
void listOrders_shouldReturnSeeded() {
  // ...
}
```

或用 **TestEntityManager** / **Repository save** 编程式准备。

---

## 📌 事务回滚

```java
@SpringBootTest
@Transactional  // 每个测试结束 rollback
class OrderServiceIntegrationTest {
  // 数据库不被污染
}
```

**注意：** `@Transactional` 在测试里 **默认 rollback**；测事务传播行为时需 `@Commit` 或不用类级事务。

---

## 📌 测试目录结构

```text
src/test/java/
  com/example/
    unit/           OrderServiceTest（@Mock）
    web/            OrderControllerTest（@WebMvcTest）
    repo/           OrderRepositoryTest（@DataJpaTest）
    integration/    OrderFlowIT（@SpringBootTest + Testcontainers）
```

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 全用 @SpringBootTest | CI 慢到无法接受 |
| @WebMvcTest 漏 @MockBean | 上下文启动失败 |
| H2 当 MySQL 测 | 方言/语法差异 — Testcontainers |
| 不测异常响应 | 只测 200 |
| 集成测试互相污染 | @Transactional 或独立数据 |

---

## 本章小结

- **切片测试** 优先：WebMvc / DataJpa / Json
- MockMvc 测 API；@MockBean 隔离下层
- 完整集成 sparingly；profile + test 配置

---

## 下一步

- [Testcontainers](./04-testcontainers)

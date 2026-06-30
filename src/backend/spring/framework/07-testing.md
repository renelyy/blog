# Spring 测试

[← Framework 首页](./index)

> 对应官方 [Testing](https://docs.spring.io/spring-framework/reference/testing.html)。

---

## ⭐ 测试金字塔

```text
        / E2E \          少量
       / 集成  \
      / 单元测试 \        大量
```

Spring 强项在**集成测试**：启动容器、注入真实 Bean、MockMvc 测 Web。

---

## ⭐ @SpringBootTest

```java
@SpringBootTest
class OrderServiceIntegrationTest {
  @Autowired OrderService orderService;
  @Autowired OrderRepository orderRepository;

  @Test
  void createOrder() {
    var order = orderService.create(...);
    assertThat(orderRepository.findById(order.getId())).isPresent();
  }
}
```

| 属性 | 说明 |
|------|------|
| `webEnvironment` | MOCK（默认）/ RANDOM_PORT / DEFINED_PORT / NONE |
| `@ActiveProfiles("test")` | 激活 test 配置 |

---

## 📌 切片测试

| 注解 | 加载范围 |
|------|----------|
| `@WebMvcTest(Controller.class)` | MVC + Mock Bean |
| `@DataJpaTest` | JPA + 内存库 |
| `@JdbcTest` | JDBC + H2 |
| `@JsonTest` | Jackson |
| `@RestClientTest` | RestTemplate/WebClient 客户端 |
| `@MybatisTest` | MyBatis（需额外依赖） |

```java
@WebMvcTest(UserController.class)
class UserControllerTest {
  @Autowired MockMvc mvc;
  @MockBean UserService userService;
}
```

---

## ⭐ MockMvc

```java
mvc.perform(get("/api/users/1")
        .header("Authorization", "Bearer token")
        .accept(MediaType.APPLICATION_JSON))
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.username").value("tom"))
    .andDo(print());
```

---

## 📌 @MockBean vs @Mock

| | @MockBean | @Mock (Mockito) |
|---|-----------|-----------------|
| 作用 | 替换 Spring 容器中的 Bean | 纯单元测试，无容器 |
| 场景 | `@WebMvcTest`、部分集成 | Service 纯逻辑 |

---

## 📌 Testcontainers

```java
@SpringBootTest
@Testcontainers
class DbIntegrationTest {
  @Container
  static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0");

  @DynamicPropertySource
  static void props(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", mysql::getJdbcUrl);
  }
}
```

真实 MySQL 容器，适合 CI。

---

## 📌 @Sql 初始化/清理

```java
@Test
@Sql("/testdata/users.sql")
@Sql(scripts = "/cleanup.sql", executionPhase = AFTER_TEST_METHOD)
void testWithData() { }
```

---

## 下一步

- [Boot Actuator 与测试](../boot/06-actuator-test)

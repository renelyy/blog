# Actuator 与测试

[← Boot 首页](./index)

> 生产监控端点、健康检查、Spring Boot 测试实践。

---

## ⭐ Actuator

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,env,loggers
  endpoint:
    health:
      show-details: when_authorized
```

| 端点 | 说明 |
|------|------|
| `/actuator/health` | 健康状态 |
| `/actuator/info` | 应用信息 |
| `/actuator/metrics` | 指标 |
| `/actuator/env` | 环境属性 |
| `/actuator/loggers` | 动态日志级别 |

生产环境务必限制暴露、加认证（Spring Security）。

---

## 📌 自定义 HealthIndicator

```java
@Component
public class RedisHealthIndicator implements HealthIndicator {
  @Override
  public Health health() {
    // 检测 Redis
    return Health.up().withDetail("redis", "ok").build();
  }
}
```

---

## ⭐ 单元测试

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-test</artifactId>
  <scope>test</scope>
</dependency>
```

```java
@SpringBootTest
class UserServiceTest {
  @Autowired
  UserService userService;

  @Test
  void shouldFindUser() {
    assertNotNull(userService.findById(1L));
  }
}
```

---

## 📌 MockMvc 测试 Controller

```java
@WebMvcTest(UserController.class)
class UserControllerTest {
  @Autowired MockMvc mockMvc;
  @MockBean UserService userService;

  @Test
  void getUser() throws Exception {
    when(userService.findById(1L)).thenReturn(new UserDto(1L, "tom"));
    mockMvc.perform(get("/api/users/1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.username").value("tom"));
  }
}
```

---

## 📌 @DataJpaTest / @MybatisTest

切片测试，只加载数据层相关 Bean，速度快。

---

## 📌 Testcontainers（集成测试）

Docker 启动真实 MySQL/Redis，适合 CI 集成测试。

---

## 下一步

- [Spring Cloud 架构总览](../cloud/01-overview)

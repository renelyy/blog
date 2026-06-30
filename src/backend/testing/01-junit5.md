# JUnit 5 基础

[← 返回索引](./index)

> **本节目标：** 掌握 JUnit 5 注解、断言、生命周期、参数化测试与测试组织规范。

---

## ⭐ JUnit 5 架构

```text
JUnit Platform（运行引擎）
    ├── JUnit Jupiter（JUnit 5 编程模型）
    └── JUnit Vintage（兼容 JUnit 4）
```

Spring Boot `spring-boot-starter-test` 默认带 **JUnit Jupiter** + AssertJ + Mockito。

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-test</artifactId>
  <scope>test</scope>
</dependency>
```

---

## ⭐ 基本测试结构

```java
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.assertj.core.api.Assertions.*;

class CalculatorTest {

  private Calculator calculator;

  @BeforeEach
  void setUp() {
    calculator = new Calculator();
  }

  @Test
  @DisplayName("两数相加应返回正确和")
  void add_shouldReturnSum() {
    assertEquals(5, calculator.add(2, 3));
    // 推荐 AssertJ — 可读性更好
    assertThat(calculator.add(2, 3)).isEqualTo(5);
  }

  @Test
  void divide_byZero_shouldThrow() {
    assertThrows(ArithmeticException.class, () -> calculator.divide(1, 0));
    assertThatThrownBy(() -> calculator.divide(1, 0))
        .isInstanceOf(ArithmeticException.class)
        .hasMessageContaining("zero");
  }
}
```

---

## ⭐ 常用注解

| 注解 | 说明 |
|------|------|
| `@Test` | 测试方法 |
| `@DisplayName` | 可读描述 |
| `@BeforeEach` / `@AfterEach` | 每个测试前后 |
| `@BeforeAll` / `@AfterAll` | 类级，需 `static` |
| `@Disabled` | 跳过 |
| `@Tag` | 分组（`unit`、`integration`） |
| `@Nested` | 嵌套测试类 |
| `@Timeout` | 超时失败 |

---

## ⭐ 生命周期

```text
@BeforeAll（一次）
    ↓
@BeforeEach → @Test → @AfterEach  （每个测试重复）
    ↓
@AfterAll（一次）
```

**原则：** 测试 **相互独立** — 不依赖执行顺序；`@BeforeEach` 准备干净状态。

---

## ⭐ 断言：JUnit vs AssertJ

```java
// JUnit 5
assertAll(
    () -> assertEquals("Tom", user.getName()),
    () -> assertTrue(user.isActive())
);

// AssertJ（推荐）
assertThat(user)
    .extracting(User::getName, User::isActive)
    .containsExactly("Tom", true);

assertThat(list)
    .hasSize(3)
    .extracting(Order::getStatus)
    .containsOnly(OrderStatus.PAID);
```

**异常断言：**

```java
assertThatExceptionOfType(BusinessException.class)
    .isThrownBy(() -> service.pay(invalidCmd))
    .withMessageContaining("余额不足");
```

---

## ⭐ 参数化测试

```java
@ParameterizedTest
@CsvSource({
    "1, 1, 2",
    "2, 3, 5",
    "0, 0, 0"
})
void add(int a, int b, int expected) {
  assertThat(calculator.add(a, b)).isEqualTo(expected);
}

@ParameterizedTest
@MethodSource("invalidEmails")
void validateEmail_shouldFail(String email) {
  assertThat(validator.isValid(email)).isFalse();
}

static Stream<String> invalidEmails() {
  return Stream.of("", "not-email", "@missing.com");
}

@ParameterizedTest
@EnumSource(value = OrderStatus.class, names = {"PAID", "SHIPPED"})
void canCancel_onlyBeforePaid(OrderStatus status) {
  assertThat(order.canCancel(status)).isFalse();
}
```

**价值：** 一组边界用例一张表，减少重复代码。

---

## ⭐ 嵌套与组织

```java
@DisplayName("OrderService")
class OrderServiceTest {

  @Nested
  @DisplayName("创建订单")
  class CreateOrder {
    @Test
    void whenStockEnough_shouldSuccess() { }

    @Test
    void whenStockInsufficient_shouldFail() { }
  }

  @Nested
  @DisplayName("取消订单")
  class CancelOrder {
    @Test
    void whenPaid_shouldReject() { }
  }
}
```

**命名约定：** `methodName_condition_expected` 或 `@DisplayName` 中文描述。

---

## 📌 测试金字塔

```text
        /\
       /E2E\        少量 — 全链路
      /------\
     /集成测试\      中等 — DB/MQ/容器
    /----------\
   /  单元测试   \    大量 — 纯逻辑、Mock
  /--------------\
```

| 层级 | 速度 | 覆盖 |
|------|------|------|
| 单元 | 毫秒 | 业务逻辑 |
| 集成 | 秒 | Spring、DB |
| E2E | 分钟 | 用户场景 |

**CI：** 单元测试每次提交跑；集成测试可 nightly 或 MR 门禁。

---

## 📌 Maven / Gradle 运行

```bash
# Maven
mvn test
mvn test -Dtest=OrderServiceTest
mvn test -Dgroups=unit

# Gradle
./gradlew test
./gradlew test --tests "com.example.OrderServiceTest"
```

```xml
<!-- surefire 按 Tag -->
<groups>unit</groups>
<excludedGroups>integration</excludedGroups>
```

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 测试依赖顺序 | 禁止 `@Order` 除非文档化集成场景 |
| `@BeforeAll` 非 static | Jupiter 报错 |
| 只 assert 不 arrange | Given-When-Then 结构 |
| 测试里 Thread.sleep | 用 Awaitility 或 mock 时间 |
| 断言过多无 focus | 一测一行为 |

---

## 本章小结

- JUnit 5 = Jupiter；**AssertJ** 提升可读性
- 生命周期保证隔离；**参数化** 覆盖边界
- **测试金字塔** — 单元为主

---

## 下一步

- [Mockito 与 Mock](./02-mockito)

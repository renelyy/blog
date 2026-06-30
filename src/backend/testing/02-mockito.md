# Mockito 与 Mock

[← 返回索引](./index)

> **本节目标：** 掌握 mock、stub、verify、spy 与 Spring Boot 中的 `@MockBean`。

---

## ⭐ 为什么 Mock

单元测试要 **隔离被测单元**：

```text
OrderService
  ├── OrderRepository  → Mock（不测 DB）
  ├── InventoryClient  → Mock（不测远程）
  └── PaymentClient    → Mock
```

**只验证 OrderService 编排逻辑** — 快、稳定、可重复。

---

## ⭐ 基本用法

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

  @Mock
  private OrderRepository orderRepo;

  @Mock
  private InventoryClient inventoryClient;

  @InjectMocks
  private OrderService orderService;

  @Test
  void createOrder_shouldDeductInventory() {
    // Given
    CreateOrderCmd cmd = new CreateOrderCmd(1L, List.of(new Item(100L, 2)));
    when(inventoryClient.checkStock(100L, 2)).thenReturn(true);
    when(orderRepo.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

    // When
    Order order = orderService.create(cmd);

    // Then
    assertThat(order.getStatus()).isEqualTo(OrderStatus.CREATED);
    verify(inventoryClient).deduct(100L, 2);
    verify(orderRepo, times(1)).save(any(Order.class));
  }
}
```

| 注解 | 说明 |
|------|------|
| `@Mock` | 创建 mock 对象 |
| `@InjectMocks` | 注入 mock 到被测类 |
| `@ExtendWith(MockitoExtension.class)` | 启用 Mockito（不用 Spring 时） |

---

## ⭐ when / thenReturn

```java
when(userRepo.findById(1L)).thenReturn(Optional.of(user));
when(userRepo.findById(99L)).thenReturn(Optional.empty());

// 抛异常
when(paymentClient.charge(any())).thenThrow(new RemoteException("timeout"));

// 连续调用不同结果
when(cache.get("k"))
    .thenReturn("v1")
    .thenReturn("v2");

// 参数匹配
when(orderRepo.findByStatus(eq(OrderStatus.PAID)))
    .thenReturn(List.of(order));
when(orderRepo.save(argThat(o -> o.getAmount().compareTo(BigDecimal.ZERO) > 0)))
    .thenAnswer(inv -> inv.getArgument(0));
```

| 匹配器 | 说明 |
|--------|------|
| `any()` / `anyString()` | 任意 |
| `eq(x)` | 等于 |
| `argThat(predicate)` | 自定义 |
| `isNull()` / `notNull()` | 空/非空 |

**规则：** 混用 raw 值与 matcher 时 **全部用 matcher**。

---

## ⭐ verify 验证交互

```java
verify(inventoryClient).deduct(100L, 2);
verify(inventoryClient, never()).release(anyLong(), anyInt());
verify(orderRepo, times(1)).save(any());
verifyNoInteractions(emailService);  // 不应被调用
verifyNoMoreInteractions(orderRepo);

// 顺序
InOrder inOrder = inOrder(inventoryClient, orderRepo);
inOrder.verify(inventoryClient).deduct(100L, 2);
inOrder.verify(orderRepo).save(any());
```

**注意：** verify **行为**；assert **状态/返回值** — 两者结合。

---

## ⭐ Spy（部分 mock）

```java
List<String> list = new ArrayList<>();
List<String> spyList = spy(list);

spyList.add("one");           // 真实方法
doReturn(100).when(spyList).size();  // stub 个别方法

verify(spyList).add("one");
```

**慎用 `@Spy` + `@InjectMocks`** — 容易 NPE；优先纯 `@Mock`。

---

## ⭐ void 方法

```java
doNothing().when(auditLog).record(any());
doThrow(new RuntimeException()).when(gateway).notify(any());

verify(auditLog).record(any());
```

---

## ⭐ ArgumentCaptor

```java
@Captor
ArgumentCaptor<Order> orderCaptor;

@Test
void save_shouldSetPendingStatus() {
  orderService.create(cmd);

  verify(orderRepo).save(orderCaptor.capture());
  Order saved = orderCaptor.getValue();
  assertThat(saved.getStatus()).isEqualTo(OrderStatus.PENDING);
}
```

捕获 mock 方法的 **实际入参** 做细粒度断言。

---

## 📌 Spring Boot 中的 @MockBean

```java
@SpringBootTest
class OrderIntegrationLightTest {

  @Autowired
  private OrderService orderService;

  @MockBean
  private PaymentClient paymentClient;

  @Test
  void whenPaymentFails_shouldRollback() {
    when(paymentClient.charge(any())).thenThrow(new PaymentException());
    assertThatThrownBy(() -> orderService.create(validCmd))
        .isInstanceOf(BusinessException.class);
  }
}
```

| 对比 | 说明 |
|------|------|
| `@Mock` + `@InjectMocks` | 纯单元，不启 Spring — **更快** |
| `@MockBean` | 替换 Spring 容器中的 Bean — 集成切片测试 |

---

## 📌 不要过度 Mock

| Mock | 不 Mock |
|------|---------|
| 外部 HTTP、MQ、邮件 | 纯函数、值对象 |
| Repository（单元测 Service 时） | 简单 DTO 转换 |
| 时钟 | — |

**过 mock：** 测试与实现耦合，重构全碎 — 只 mock **边界**。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| mock 具体类未 stub 非 void | 返回 default null |
| verify 过多 | 测实现非行为 |
| `any()` 与 null | `any()` 不匹配 null — 用 `nullable()` |
| 静态/final 方法 | 需 mockito-inline 或改设计 |
| @MockBean 滥用 | 启动慢 — 单元测用 @Mock |

---

## 本章小结

- **Given-When-Then** + when/verify
- 单元测：**@Mock + @InjectMocks**；Spring 切片：**@MockBean**
- ArgumentCaptor 验参；避免 over-mock

---

## 下一步

- [Spring Boot 测试](./03-spring-test)

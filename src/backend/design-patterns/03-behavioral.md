# 行为型模式

[← 返回索引](./index)

> **本节目标：** 掌握策略、模板方法、观察者、责任链、命令等常用行为型模式。

---

## ⭐ 行为型模式概述

**对象之间如何协作、分配职责与算法。**

企业后端 **最高频：** 策略、模板方法、观察者、责任链。

---

## ⭐ 策略 Strategy

**封装算法族，使它们可互换。**

```java
public interface DiscountStrategy {
  BigDecimal apply(BigDecimal original);
}

@Component("vipDiscount")
public class VipDiscountStrategy implements DiscountStrategy {
  public BigDecimal apply(BigDecimal original) {
    return original.multiply(new BigDecimal("0.9"));
  }
}

@Service
@RequiredArgsConstructor
public class PriceService {
  private final Map<String, DiscountStrategy> strategies;

  public BigDecimal calculate(String strategyKey, BigDecimal price) {
    DiscountStrategy strategy = strategies.get(strategyKey);
    if (strategy == null) throw new BusinessException("unknown strategy");
    return strategy.apply(price);
  }
}
```

**Spring：** 注入 `List<DiscountStrategy>` 或 `Map<String, DiscountStrategy>` — **自动注册**。

**替代 giant switch：** 新策略 = 新类 + `@Component`，开闭原则。

---

## ⭐ 模板方法 Template Method

**父类定义骨架，子类实现步骤。**

```java
public abstract class AbstractExportJob {
  public final void execute(ExportContext ctx) {
    validate(ctx);
    List<?> data = fetchData(ctx);
    byte[] file = render(data);
    upload(file, ctx);
    notify(ctx);
  }

  protected abstract List<?> fetchData(ExportContext ctx);
  protected abstract byte[] render(List<?> data);

  protected void validate(ExportContext ctx) { }
  protected void notify(ExportContext ctx) { }
}
```

**Spring：** `JdbcTemplate` 回调 — 你写 SQL 逻辑，模板管连接/异常；`RestTemplate` 类似。

```java
jdbcTemplate.query("SELECT ...", rs -> { /* row mapper */ });
```

---

## ⭐ 观察者 Observer

**一对多依赖，状态变更通知订阅者。**

```java
// Spring 事件 — 推荐
public record OrderCreatedEvent(Long orderId, Long userId) {}

@Component
public class OrderEventPublisher {
  private final ApplicationEventPublisher publisher;

  public void created(Order order) {
    publisher.publishEvent(new OrderCreatedEvent(order.getId(), order.getUserId()));
  }
}

@Component
public class InventoryListener {
  @EventListener
  @Async
  public void onOrderCreated(OrderCreatedEvent event) {
    inventoryService.reserve(event.orderId());
  }
}
```

**MQ：** 跨服务观察者 — [messaging](../messaging/01-mq-overview)。

**JDK `Observable`：** 已废弃 — 用 Spring Event 或 Reactive Streams。

---

## ⭐ 责任链 Chain of Responsibility

**请求沿链传递，直到有处理器处理。**

```java
public interface OrderValidator {
  void validate(CreateOrderCmd cmd);
  void setNext(OrderValidator next);
}

public abstract class AbstractOrderValidator implements OrderValidator {
  private OrderValidator next;

  public void setNext(OrderValidator next) { this.next = next; }

  public void validate(CreateOrderCmd cmd) {
    doValidate(cmd);
    if (next != null) next.validate(cmd);
  }

  protected abstract void doValidate(CreateOrderCmd cmd);
}
```

**Servlet Filter 链、Spring Security FilterChain** — 经典责任链。

```text
Request → Filter1 → Filter2 → ... → Controller
```

---

## ⭐ 命令 Command

**将请求封装为对象，支持排队、撤销、日志。**

```java
public interface Command {
  void execute();
}

public record CreateOrderCommand(CreateOrderCmd cmd, OrderService service) implements Command {
  public void execute() { service.create(cmd); }
}
```

**应用：** 任务队列、操作审计、CQRS 写模型。

---

## ⭐ 状态 State / 迭代器 Iterator（了解）

| 模式 | 说明 |
|------|------|
| **State** | 对象行为随内部状态变 — 订单状态机可用 enum + 策略代替 |
| **Iterator** | `java.util.Iterator`、`Stream` |
| **Mediator** | 中介者 — MQ、事件总线 |
| **Memento** | 快照 — 撤销（编辑器）；业务少见 |

**状态机示例：**

```java
public enum OrderStatus {
  PENDING {
    public OrderStatus pay() { return PAID; }
  },
  PAID {
    public OrderStatus ship() { return SHIPPED; }
  };
  public abstract OrderStatus pay();
}
```

或用 **Spring Statemachine**（复杂流程）。

---

## 📌 与分布式模式对照

| 行为型 | 分布式对应 |
|--------|------------|
| 观察者 | MQ 发布订阅 |
| 责任链 | Gateway Filter、Sentinel 链 |
| 策略 | 多租户路由、支付方式 |
| 命令 | 异步任务、Outbox |

见 [distributed](../distributed/05-microservice-patterns)。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 策略 Map key 冲突 | 命名规范 `@Component("type")` |
| @EventListener 同步阻塞 | 慢逻辑用 @Async |
| 责任链过长难调试 | 日志每环 |
| 模板方法滥用继承 | 组合优于继承 — 优先回调 |

---

## 本章小结

- **策略** 替 switch；**模板方法** 固定流程
- **观察者** — Spring Event / MQ
- **责任链** — Filter、Security

---

## 下一步

- [Spring 中的设计模式](./04-spring-patterns)

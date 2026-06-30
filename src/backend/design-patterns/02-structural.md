# 结构型模式

[← 返回索引](./index)

> **本节目标：** 掌握适配器、装饰、代理、外观、组合等结构型模式及 JDK/Spring 中的体现。

---

## ⭐ 结构型模式概述

**如何组合类与对象** 形成更大结构，同时保持灵活与高效。

```text
创建型 → 怎么 new
结构型 → 怎么拼
行为型 → 怎么协作
```

---

## ⭐ 适配器 Adapter

**将一个接口转换成客户端期望的另一接口。**

```java
// 遗留系统
public class LegacyUserService {
  public Map<String, Object> getUserRaw(Long id) { }
}

// 适配为新接口
public class UserServiceAdapter implements UserService {
  private final LegacyUserService legacy;

  @Override
  public UserDto getUser(Long id) {
    Map<String, Object> raw = legacy.getUserRaw(id);
    return mapToDto(raw);
  }
}
```

**Spring：** `HandlerAdapter` 适配不同 Controller 类型；`Spring MVC` 适配 Servlet API。

**与 Facade 区别：** 适配器 **接口转换**；外观 **简化子系统**。

---

## ⭐ 装饰 Decorator

**动态给对象添加职责**，比继承灵活。

```java
public interface DataSource extends javax.sql.DataSource {
  // ...
}

public class MetricsDataSource implements DataSource {
  private final DataSource delegate;

  @Override
  public Connection getConnection() throws SQLException {
    long start = System.nanoTime();
    try {
      return delegate.getConnection();
    } finally {
      metrics.record("db.connect", System.nanoTime() - start);
    }
  }
}
```

**Java IO：** `new BufferedInputStream(new FileInputStream(file))` — 经典装饰链。

**Spring：** `BeanPostProcessor` 可在 Bean 外包一层增强（类似装饰）。

---

## ⭐ 代理 Proxy

**为对象提供替身，控制访问。**

| 类型 | 说明 |
|------|------|
| **静态代理** | 手写代理类 |
| **JDK 动态代理** | 接口代理 — `Proxy.newProxyInstance` |
| **CGLIB** | 子类代理 — 无接口类 |

```java
// JDK 动态代理示意
UserService proxy = (UserService) Proxy.newProxyInstance(
    loader, new Class[]{UserService.class},
    (obj, method, args) -> {
      log.info("before {}", method.getName());
      return method.invoke(target, args);
    });
```

**Spring AOP** = 代理模式 — 见 [04 章](./04-spring-patterns)、[Framework AOP](../spring/framework/02-aop).

---

## ⭐ 外观 Facade

**为子系统提供统一简化入口。**

```java
@Service
@RequiredArgsConstructor
public class OrderFacade {
  private final OrderService orderService;
  private final InventoryService inventoryService;
  private final PaymentService paymentService;

  @Transactional
  public OrderDto placeOrder(PlaceOrderCmd cmd) {
    inventoryService.reserve(cmd.items());
    Order order = orderService.create(cmd);
    paymentService.charge(order);
    return OrderDto.from(order);
  }
}
```

**Controller 调 Facade** — 避免 Controller 编排多个 Service（也可接受，视团队分层）。

---

## ⭐ 组合 Composite

**树形结构，统一对待单个对象与组合。**

```java
public interface MenuComponent {
  void render(StringBuilder sb);
}

public class MenuItem implements MenuComponent {
  public void render(StringBuilder sb) { sb.append(name); }
}

public class MenuFolder implements MenuComponent {
  private List<MenuComponent> children;
  public void render(StringBuilder sb) {
    children.forEach(c -> c.render(sb));
  }
}
```

**应用：** 组织架构、权限树、UI 组件树。

---

## ⭐ 桥接 Bridge / 享元 Flyweight（了解）

| 模式 | 说明 |
|------|------|
| **Bridge** | 抽象与实现分离 — JDBC Driver 与 Connection |
| **Flyweight** | 共享细粒度对象 — `Integer.valueOf` 缓存 -128~127、`String` 常量池 |

---

## 📌 与 Spring 对照

| 模式 | Spring |
|------|--------|
| Adapter | `HandlerAdapter`、`Resource` 适配 |
| Decorator | `BeanWrapper`、IO 包装 |
| Proxy | AOP、`@Transactional` |
| Facade | `@Service` 编排、`JdbcTemplate` 简化 JDBC |

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 适配器与 Facade 混用 | 职责不清 |
| 装饰层过深 | 调试困难 |
| CGLIB 代理 final 方法 | 无法增强 |
| Facade 成上帝类 | 应拆用例服务 |

---

## 本章小结

- **适配器** 换接口；**装饰** 加能力；**代理** 控访问
- **外观** 简化入口；**组合** 树形统一
- Spring AOP、IO 流是结构型模式教科书

---

## 下一步

- [行为型模式](./03-behavioral)

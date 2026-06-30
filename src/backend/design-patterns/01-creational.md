# 创建型模式

[← 返回索引](./index)

> **本节目标：** 掌握单例、工厂、建造者等创建型模式及在 Java/Spring 中的合理用法。

---

## ⭐ 为什么创建型模式

**问题：** 对象如何创建、谁负责创建、如何隐藏具体类型？

**创建型模式** 解耦 **使用** 与 **构造**，使系统不依赖 `new` 具体类。

见 [Core Java OOP](../java/core-java/vol1/04-objects-classes)。

---

## ⭐ 单例 Singleton

**保证** 一个类只有一个实例。

```java
public enum AppConfigHolder {
  INSTANCE;
  private Properties props = load();

  public String get(String key) { return props.getProperty(key); }
}
```

| 实现 | 说明 |
|------|------|
| **枚举** | Effective Java 推荐 — 防反射/序列化破坏 |
| **静态内部类** | 懒加载、线程安全 |
| **双重检查锁** | 需 `volatile` |

**Spring Bean 默认单例** — 容器管理，**不要** 自己写单例除非无 Spring 环境。

```java
@Component  // 容器内单例
public class CacheManager { }
```

---

## ⭐ 工厂方法 Factory Method

**定义创建接口，子类决定实例化哪个类。**

```java
public interface PaymentProcessor {
  void pay(BigDecimal amount);

  static PaymentProcessor create(PaymentType type) {
    return switch (type) {
      case ALIPAY -> new AlipayProcessor();
      case WECHAT -> new WechatProcessor();
    };
  }
}
```

**Spring：** `@Bean` 方法就是工厂 — 配置类决定返回哪种实现。

```java
@Configuration
public class PaymentConfig {
  @Bean
  @ConditionalOnProperty(name = "payment.provider", havingValue = "alipay")
  PaymentProcessor alipayProcessor() {
    return new AlipayProcessor();
  }
}
```

---

## ⭐ 抽象工厂 Abstract Factory

**创建一族相关对象**（UI 主题、不同数据库方言组件）。

```java
public interface DataAccessFactory {
  UserRepository userRepository();
  OrderRepository orderRepository();
}

public class JpaDataAccessFactory implements DataAccessFactory { }
public class MyBatisDataAccessFactory implements DataAccessFactory { }
```

**Spring：** 不同 `@Configuration` + `@Profile("jpa")` / `@Profile("mybatis")` 切换整族 Bean。

---

## ⭐ 建造者 Builder

**分步构建复杂对象，链式调用。**

```java
Order order = Order.builder()
    .userId(1L)
    .items(items)
    .couponCode("SAVE10")
    .build();
```

| 场景 | 工具 |
|------|------|
| Java Bean | **Lombok `@Builder`** |
| 不可变对象 | **Record** +  compact constructor；或手写 Builder |
| 多 optional 参数 | Builder 优于 telescoping constructor |

```java
@Builder
public class EmailMessage {
  private final String to;
  private final String subject;
  private final String body;
  private final List<Attachment> attachments;
}
```

**JDK：** `HttpRequest.newBuilder()`、`Stream.builder()`。

---

## ⭐ 原型 Prototype

**通过克隆复制对象**，而非 new。

```java
public class DocumentTemplate implements Cloneable {
  @Override
  public DocumentTemplate clone() {
    try {
      return (DocumentTemplate) super.clone();
    } catch (CloneNotSupportedException e) {
      throw new IllegalStateException(e);
    }
  }
}
```

**Java：** `Cloneable` 浅拷贝 — 深拷贝需手动或序列化。  
**实际：** 拷贝构造、JSON 序列化反序列化、MapStruct 更常见。

---

## 📌 企业选型建议

| 需求 | 推荐 |
|------|------|
| 全局唯一服务 | Spring `@Component` 单例 |
| 多实现切换 | `@ConditionalOnProperty` / 策略+工厂 |
| 复杂 DTO/命令 | Builder / Record |
| 避免 `new` 散落 | 构造注入 + 工厂 Bean |

**反模式：** 滥用单例全局状态；工厂层级过深。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 手写单例 + Spring Bean 重复 | 统一交给容器 |
| Builder 未校验 | `build()` 内 validate |
| 工厂 switch 无限膨胀 | 注册表 Map + SPI |
| Cloneable 浅拷贝 | 集合字段共享引用 |

---

## 本章小结

- **单例** — Spring Bean；枚举实现无 Spring 场景
- **工厂** — `@Bean`、策略创建
- **建造者** — 多 optional 字段、Lombok

---

## 下一步

- [结构型模式](./02-structural)

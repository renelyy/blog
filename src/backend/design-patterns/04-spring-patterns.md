# Spring 中的设计模式

[← 返回索引](./index)

> **本节目标：** 对照 GoF 模式理解 Spring IoC、AOP、MVC、事务等核心机制。

---

## ⭐ Spring 与模式总览

```text
Spring Framework
  ├── IoC/DI     → 工厂、单例
  ├── AOP        → 代理
  ├── MVC        → 前端控制器、适配器、策略
  ├── Transaction→ 模板方法 + 代理
  └── Event      → 观察者
```

读源码或设计模块时 **识别模式** 更快理解扩展点。

见 [Spring Framework](../spring/framework/)、[IoC/DI](../spring/framework/01-ioc-di).

---

## ⭐ 工厂 + 单例：BeanFactory

```java
// 注册与获取 — 工厂
ApplicationContext ctx = SpringApplication.run(App.class, args);
OrderService service = ctx.getBean(OrderService.class);
```

| 机制 | 模式 |
|------|------|
| `@Configuration` + `@Bean` | 工厂方法 |
| `@ComponentScan` | 自动工厂 |
| Bean 默认 scope singleton | 单例 |
| `@Scope("prototype")` | 原型 |

**BeanFactory vs ApplicationContext：** 后者是前者的 **Facade** + 事件、国际化等。

---

## ⭐ 依赖注入：策略 + 组合

```java
@Service
@RequiredArgsConstructor  // 构造器注入 — 推荐
public class OrderService {
  private final OrderRepository orderRepository;
  private final PaymentProcessor paymentProcessor;  // 接口 — 运行时策略
}
```

**@Autowired 字段注入** 可用但不推荐 — 难测试、隐藏依赖。

**`ObjectProvider<T>` / `@Qualifier`** — 延迟或按名选择 Bean。

---

## ⭐ AOP：代理模式

```java
@Transactional
public void placeOrder(OrderCmd cmd) {
  orderRepository.save(...);
}
```

```text
Client → OrderServiceProxy → @Transactional 拦截 → 真实 OrderService
                              开启事务 / commit / rollback
```

| 实现 | 条件 |
|------|------|
| **JDK 动态代理** | 有接口 |
| **CGLIB** | 无接口、类代理 |

**同类自调用** `@Transactional` 失效 — 代理未经过；拆类或注入 self。

见 [AOP](../spring/framework/02-aop)、[事务](../spring/framework/04-data-transaction).

---

## ⭐ MVC：前端控制器 + 适配器 + 策略

```text
DispatcherServlet  ← 前端控制器 Front Controller
    ↓
HandlerMapping     ← 找哪个 Controller
HandlerAdapter     ← 适配调用方式 — 适配器
ViewResolver       ← 视图策略
```

```java
@RestController  // @Controller + @ResponseBody
public class OrderController {
  @GetMapping("/api/orders/{id}")
  public OrderDto get(@PathVariable Long id) { }
}
```

**`HandlerInterceptor`** — 责任链在 Controller 前后。

见 [Boot Web](../spring/boot/04-web-rest).

---

## ⭐ JdbcTemplate：模板方法 + 回调

```java
jdbcTemplate.query(
    "SELECT id, name FROM users WHERE status = ?",
    (rs, rowNum) -> new User(rs.getLong("id"), rs.getString("name")),
    "ACTIVE");
```

**模板：** 获取连接、创建 Statement、处理异常、关闭资源。  
**回调：** RowMapper 实现行映射 — **行为型策略**。

---

## ⭐ 事件：观察者

```java
applicationEventPublisher.publishEvent(new OrderCreatedEvent(...));

@EventListener
public void handle(OrderCreatedEvent event) { }

@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
public void afterCommit(OrderCreatedEvent event) { }
```

**AFTER_COMMIT** — 事务提交后再通知，防脏读下游。

---

## ⭐ Resource / Environment：外观 + 策略

```java
@Value("${app.feature.enabled:false}")
private boolean featureEnabled;

@ConfigurationProperties(prefix = "app.order")
public record OrderProperties(int maxItems, Duration timeout) {}
```

**PropertySource 链** — 多来源配置合并（文件、环境变量、Nacos）。

见 [Boot 配置](../spring/boot/03-configuration).

---

## ⭐ 设计模式在 Spring Boot 自动配置

```java
@Configuration
@ConditionalOnClass(DataSource.class)
@EnableConfigurationProperties(DataSourceProperties.class)
public class DataSourceAutoConfiguration {

  @Bean
  @ConditionalOnMissingBean
  DataSource dataSource(DataSourceProperties props) {
    return DataSourceBuilder.create().build();
  }
}
```

| 注解 | 模式思想 |
|------|----------|
| `@ConditionalOn*` | 策略选择 |
| `@EnableAutoConfiguration` | 工厂批量注册 |
| `spring.factories` / `AutoConfiguration.imports` | SPI |

**扩展：** 自定义 Starter = 工厂 + 条件装配。

---

## 📌 读源码时的模式地图

| 类/包 | 模式 |
|-------|------|
| `BeanFactory` | 抽象工厂、工厂方法 |
| `ApplicationContext` | Facade |
| `BeanPostProcessor` | 装饰 |
| `Advisor` / `Pointcut` | 策略 |
| `FilterChain` | 责任链 |
| `RestTemplate` | 模板方法 |
| `@Scheduled` / `@Async` | 代理 + 策略 |

---

## 📌 何时不必强行套模式

| 场景 | 建议 |
|------|------|
| 简单 CRUD | Service + Repository 足够 |
| 过度策略类 | 2 种实现以下用 if/switch 可接受 |
| 模式为模式而模式 | **可读性 > 模式名** |

**Spring 本身已是模式集合** — 业务层 **适度** 使用策略、模板、事件即可。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 不理解代理 | AOP、事务、@Async 失效排查困难 |
| 循环依赖 | 构造器注入可早期暴露 |
| Event 默认同步 | 阻塞主流程 |
| 滥用继承实现模板 | 回调/组合更灵活 |

---

## 本章小结

- Spring 核心 = **IoC 工厂 + 单例 + DI + AOP 代理**
- MVC = **Front Controller + Adapter**；JdbcTemplate = **Template + Callback**
- 自动配置 = **条件工厂**；事件 = **Observer**
- 结合 [创建型](./01-creational)、[结构型](./02-structural)、[行为型](./03-behavioral) 对照源码

---

## 设计模式模块回顾

| 章 | 要点 |
|----|------|
| 01 创建型 | 单例、工厂、建造者 |
| 02 结构型 | 适配、装饰、代理、外观 |
| 03 行为型 | 策略、模板、观察者、责任链 |
| 04 Spring | IoC、AOP、MVC、Event、AutoConfig |

---

## 下一步

- [后端路线图](../roadmap) — 扩展模块正文已全部完成 ✅
- [Core Java OOP](../java/core-java/vol1/04-objects-classes)
- [Spring Framework 首页](../spring/framework/)

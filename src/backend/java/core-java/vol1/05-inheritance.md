# 第 5 章：继承

[← 卷 I 目录](../index)

> 原书 Chapter 5 — Inheritance

---

## ⭐ 类、超类与子类

```java
public class Employee {
  private final String name;
  private double salary;

  public Employee(String name, double salary) {
    this.name = name;
    this.salary = salary;
  }

  public String getName() { return name; }
  public double getSalary() { return salary; }
}

public class Manager extends Employee {
  private double bonus;

  public Manager(String name, double salary, double bonus) {
    super(name, salary);   // 必须是构造器第一行
    this.bonus = bonus;
  }

  @Override
  public double getSalary() {
    return super.getSalary() + bonus;
  }
}
```

**规则：**

- Java **单继承**（类）；多能力用 **接口** 实现
- 子类构造器**必须**调用超类构造器（显式 `super(...)` 或隐式无参 `super()`）
- 超类没有无参构造器时，子类**必须**显式调用有参 `super`
- `@Override` 让编译器校验签名，防拼写错误变成「新方法」

### 构造器调用链

```text
new Manager(...) → Manager 构造器 → super(...) → Employee 构造器 → Object 构造器
```

**企业注意：** 框架（JPA/Hibernate）常要求实体有无参构造器；`final` 字段 + 全参构造器与 Lombok `@RequiredArgsConstructor` 组合时要一致。

---

## ⭐ 访问控制与 `protected`

| 修饰符 | 子类（不同包） | 典型用途 |
|--------|----------------|----------|
| `private` | ❌ | 字段隐藏 |
| 包访问 | ❌（不同包） | 模块内部 |
| `protected` | ✅ | 模板方法钩子供子类重写 |
| `public` | ✅ | 对外 API |

```java
public abstract class AbstractOrderService {
  public final Order create(CreateOrderRequest req) {
    validate(req);
    Order order = doCreate(req);   // 子类实现
    afterCreate(order);
    return order;
  }

  protected abstract Order doCreate(CreateOrderRequest req);

  protected void afterCreate(Order order) { }  // 可选钩子
}
```

`protected` 表达「子类可见，外部不可见」— 模板方法模式核心。

---

## ⭐ 多态与动态绑定

```java
Employee e = new Manager("Alice", 8000, 2000);
double pay = e.getSalary();  // 运行时调用 Manager 的重写方法 — 动态绑定
```

```java
Employee[] staff = {
    new Employee("Bob", 5000),
    new Manager("Alice", 8000, 2000)
};
double total = 0;
for (Employee emp : staff) {
  total += emp.getSalary();
}
```

**编译看引用类型，运行看对象实际类型** — 虚方法表（vtable）实现。

### 重写 vs 隐藏

| | 重写 `@Override` | 隐藏（不推荐） |
|---|------------------|----------------|
| 实例方法 | 多态生效 | 子类 `static` 同名方法「隐藏」超类 static |
| 字段 | 不「重写」，**隐藏** | 访问看引用类型 |

```java
Employee e = new Manager(...);
e.getSalary();     // 多态：Manager 的实现
// 字段访问无多态：
e.name;            // 若 name 在 Employee 且非 private，看引用类型 Employee
```

**规范：** 字段 private；不要依赖字段「重写」。

### 协变返回类型

```java
class Employee {
  Employee copy() { return new Employee(...); }
}
class Manager extends Employee {
  @Override
  Manager copy() { return new Manager(...); }  // 返回类型可收窄
}
```

---

## ⭐ 类型转换与 `instanceof`

```java
// Java 16+ 模式匹配
if (staff[i] instanceof Manager mgr) {
  System.out.println(mgr.getBonus());
}

// switch 模式（Java 17+）
String desc = switch (staff[i]) {
  case Manager m -> "经理: " + m.getName();
  case Employee e -> "员工: " + e.getName();
  default -> "未知";
};
```

- **向上转型**（子→父）自动、安全
- **向下转型**需 `instanceof`，否则 `ClassCastException`
- **设计目标：** 用多态 + Sealed/接口消除大量 `instanceof`

---

## ⭐ 组合优于继承

```java
// 反例：仅为复用代码而继承
class OrderService extends BaseService { }  // BaseService 与 Order 无 is-a

// 正例：组合
class OrderService {
  private final AuditLogger audit;
  private final IdGenerator idGen;

  OrderService(AuditLogger audit, IdGenerator idGen) {
    this.audit = audit;
    this.idGen = idGen;
  }
}
```

| 用继承 | 用组合 |
|--------|--------|
| 明确的 is-a（Manager is Employee） | has-a（Service has Repository） |
| 框架模板方法（Servlet、JUnit） | 业务逻辑复用 |
| Sealed 封闭领域类型 | 策略、装饰器 |

---

## ⭐ `Object` 类 — 所有类的根

| 方法 | 契约 | 企业要点 |
|------|------|----------|
| `equals(Object)` | 逻辑相等 | 重写时必须配合 `hashCode` |
| `hashCode()` | 与 equals 一致 | `HashMap`/`HashSet` key |
| `toString()` | 调试字符串 | 日志；JSON 序列化不依赖它 |
| `getClass()` | 运行时 Class | 反射入口 |
| `clone()` | 浅拷贝 | 少用；用拷贝构造器 |
| `finalize()` | **已废弃** | 勿用 |

### equals 契约（必须满足）

1. **自反性** — `x.equals(x)`
2. **对称性** — `x.equals(y) ⇔ y.equals(x)`
3. **传递性** — `x.equals(y) && y.equals(z) ⇒ x.equals(z)`
4. **一致性** — 多次调用结果相同（除非对象被修改）
5. **非空** — `x.equals(null)` 为 false

```java
@Override
public boolean equals(Object obj) {
  if (this == obj) return true;
  if (!(obj instanceof Employee other)) return false;
  return Objects.equals(name, other.name)
      && Objects.equals(hireDate, other.hireDate);
}

@Override
public int hashCode() {
  return Objects.hash(name, hireDate);
}
```

### 实体类与 ORM

- JPA 实体：**业务主键** 或 **数据库 id** 参与 equals 要一致；懒加载代理可能导致 equals 问题
- **不要用集合字段或可变字段**做 equals（放入 HashMap 后修改字段会「丢失」）
- Lombok `@EqualsAndHashCode(onlyExplicitlyIncluded = true)` + `@EqualsAndHashCode.Include` 精确控制

---

## ⭐ 抽象类与模板方法

```java
public abstract class PaymentProcessor {
  public final void process(Payment payment) {
    validate(payment);
    doProcess(payment);
    audit(payment);
  }

  protected abstract void doProcess(Payment payment);

  protected void validate(Payment payment) {
    Objects.requireNonNull(payment.getAmount());
  }

  private void audit(Payment payment) {
    log.info("payment processed id={}", payment.getId());
  }
}
```

Spring 中大量抽象类：`OncePerRequestFilter`、`AbstractRoutingDataSource`、各种 `*Template` 都是模板方法思想。

---

## ⭐ 枚举 `enum`

```java
public enum OrderStatus {
  PENDING("待支付"),
  PAID("已支付"),
  SHIPPED("已发货"),
  CANCELLED("已取消");

  private final String label;

  OrderStatus(String label) { this.label = label; }

  public String getLabel() { return label; }

  public boolean canTransitionTo(OrderStatus next) {
    return switch (this) {
      case PENDING -> next == PAID || next == CANCELLED;
      case PAID -> next == SHIPPED || next == CANCELLED;
      case SHIPPED, CANCELLED -> false;
    };
  }

  public static OrderStatus fromCode(String code) {
    return Enum.valueOf(OrderStatus.class, code);
  }
}
```

- 枚举是**单例**、**线程安全**、可带行为的状态机
- 持久化：`@Enumerated(STRING)` 优于 ORDINAL（中间插入枚举值会破坏序号）

### `EnumSet` / `EnumMap`

```java
EnumSet<OrderStatus> cancellable = EnumSet.of(PENDING, PAID);
EnumMap<OrderStatus, Handler> handlers = new EnumMap<>(OrderStatus.class);
```

内部用位向量，比 `HashSet<Enum>` 快几个数量级。

---

## ⭐ Sealed 类（Java 17）

```java
public sealed interface Payment permits CreditCardPayment, WireTransfer, Refund {
  BigDecimal amount();
}

public final class CreditCardPayment implements Payment { /* ... */ }
public final class WireTransfer implements Payment { /* ... */ }
public non-sealed class Refund implements Payment { /* 允许第三方扩展 */ }
```

配合 **Record** 表达 ADT：

```java
public record CreditCardPayment(String lastFour, BigDecimal amount) implements Payment {}
```

编译器检查 `switch` 穷举 — 比 `if-else instanceof` 更安全。

---

## ⭐ 反射（Reflection）— 深入

反射在**运行时**检查类型、创建对象、调用方法、读注解 — Spring/MyBatis/Jackson 的基石。

### 获取 `Class` 对象

```java
Class<?> c1 = Class.forName("com.example.User");  // 全限定名
Class<?> c2 = User.class;                          // 编译期
Class<?> c3 = user.getClass();                     // 实例
Class<?> c4 = ClassLoader.getSystemClassLoader()
    .loadClass("com.example.User");
```

### 构造器、方法、字段

```java
Constructor<User> ctor = User.class.getDeclaredConstructor(String.class, Long.class);
ctor.setAccessible(true);  // 突破 private（JDK 9+ 模块可能还需 opens）
User user = ctor.newInstance("Tom", 1L);

Method setName = User.class.getDeclaredMethod("setName", String.class);
setName.invoke(user, "Jerry");

Field idField = User.class.getDeclaredField("id");
idField.setAccessible(true);
idField.setLong(user, 2L);
```

| API | 说明 |
|-----|------|
| `getMethod` | public，含继承 |
| `getDeclaredMethod` | 本类声明，含 private |
| `getFields` / `getDeclaredFields` | 字段同理 |

### 读取注解

```java
for (Method m : clazz.getDeclaredMethods()) {
  GetMapping mapping = m.getAnnotation(GetMapping.class);
  if (mapping != null) {
    log.info("HTTP GET {}", Arrays.toString(mapping.value()));
  }
}
```

Spring MVC 启动时扫描 `@Controller` 类，解析 `@GetMapping` 注册路由 — 全是反射。

### 泛型类型信息

```java
Type genericSuper = clazz.getGenericSuperclass();
if (genericSuper instanceof ParameterizedType pt) {
  Type[] args = pt.getActualTypeArguments();
  // MyBatis 解析 BaseMapper<User> 中的 User
}
```

### 性能与安全

| 点 | 说明 |
|----|------|
| 性能 | `invoke` 比直接调用慢；框架启动时反射、运行时缓存 `Method` |
| 封装 | `setAccessible(true)` 破坏 private；Java 17+ 强封装需 `--add-opens` |
| 重构 | 改方法名编译期不报错，运行时才失败 |
| 替代 | 编译期代码生成：MapStruct、Lombok、Annotation Processor |

### Spring 中的反射链路（概要）

```text
@ComponentScan 扫描包
  → ClassPathBeanDefinitionScanner 读 @Component
  → AutowiredAnnotationBeanPostProcessor 找 @Autowired 字段/构造器
  → ReflectionUtils.makeAccessible 注入依赖
  → AOP 代理（JDK Proxy 或 CGLIB）包装 Bean
```

### MyBatis Mapper 代理

```java
// 接口无实现类
UserMapper mapper = sqlSession.getMapper(UserMapper.class);
// 底层：MapperProxy + Method.invoke → 执行 XML/SQL
```

---

## 📌 JDK 动态代理 vs CGLIB

| | JDK Proxy | CGLIB |
|---|-----------|-------|
| 要求 | **接口** | 具体类（子类化） |
| 实现 | `Proxy.newProxyInstance` | 字节码生成子类 |
| Spring AOP | 有接口时默认 | 无接口时 |

```java
InvocationHandler handler = (proxy, method, args) -> {
  log.info("before {}", method.getName());
  Object result = method.invoke(target, args);
  log.info("after {}", method.getName());
  return result;
};
UserService proxy = (UserService) Proxy.newProxyInstance(
    loader, new Class[]{ UserService.class }, handler);
```

---

## 📌 克隆与拷贝

```java
// 浅拷贝：引用字段共享
public class Team implements Cloneable {
  private List<Member> members;

  @Override
  public Team clone() throws CloneNotSupportedException {
    Team copy = (Team) super.clone();
    copy.members = new ArrayList<>(members);  // 深拷贝集合
    return copy;
  }
}

// 更推荐：拷贝构造器 / 工厂 / 序列化(JSON)
public Team(Team other) {
  this.members = other.members.stream().map(Member::copy).toList();
}
```

---

## 📌 自动装箱与缓存

```java
Integer a = 100, b = 100;
a == b;  // true — 缓存 -128 ~ 127

Integer x = 200, y = 200;
x == y;  // false

Integer m = null;
int k = m;  // NPE 于拆箱
```

Stream、`List<Integer>` 大量装箱；热点路径考虑 `IntStream`。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 构造器调可重写方法 | 子类未初始化完，子类重写方法访问 null 字段 |
| 深层继承 | 改超类影响所有子类 |
| equals/hashCode 不一致 | HashMap 行为诡异 |
| 反射滥用 | 难测试、难重构 |
| 枚举 ordinal 存库 | 插入新枚举值破坏历史数据 |

---

## 本章小结

- 继承表达 is-a；**组合**表达 has-a — 业务优先组合
- 多态 + 模板方法 + Sealed 是扩展点设计三件套
- 反射是框架「魔法」的实现机制；业务层保持类型安全调用

---

## 下一步

- [第 6 章：接口与 Lambda](./06-interfaces-lambda)

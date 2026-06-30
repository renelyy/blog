# 第 4 章：对象与类

[← 卷 I 目录](../index)

> 原书 Chapter 4 — Objects and Classes

---

## ⭐ 面向对象三要素

| 要素 | 含义 | 企业示例 |
|------|------|----------|
| **封装** | 隐藏内部状态，通过方法访问 | Entity 字段 private + getter |
| **继承** | 复用与扩展超类 | `Manager extends Employee` |
| **多态** | 父类引用指向子类对象 | `List list = new ArrayList<>()` |

**优先组合而非继承：** Service 注入 Repository，而不是 `OrderService extends BaseService` 乱继承。

---

## ⭐ 定义类

```java
public class Employee {
  private final String name;      // final：构造后不可变
  private double salary;
  private static int idCounter;   // 类级别

  public Employee(String name, double salary) {
    this.name = Objects.requireNonNull(name, "name");
    this.salary = salary;
  }

  public String getName() { return name; }
  public double getSalary() { return salary; }

  public void raiseSalary(double percent) {
    if (percent < 0) throw new IllegalArgumentException("percent < 0");
    salary *= (1 + percent / 100);
  }

  @Override
  public String toString() {
    return "Employee[name=%s, salary=%.2f]".formatted(name, salary);
  }
}
```

**规范：**

- 字段默认 **private**；通过构造器或工厂方法保证有效状态
- 可变对象修改前校验参数
- 重写 `toString` 便于日志与调试

---

## ⭐ 构造器与 `this`

```java
public class User {
  private final Long id;
  private final String name;

  public User(Long id, String name) {
    this.id = id;
    this.name = name;
  }

  // 构造器重载，委托主构造器
  public User(String name) {
    this(null, name);
  }
}
```

- 构造器第一行可以是 `this(...)` 调用同类其他构造器
- 子类构造器第一行必须是 `super(...)`（见第 5 章）

---

## ⭐ 静态成员与静态工厂

```java
public class OrderNumberGenerator {
  private static final AtomicLong SEQ = new AtomicLong(0);

  private OrderNumberGenerator() { }  // 禁止实例化

  public static String next() {
    return "ORD-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)
        + "-" + SEQ.incrementAndGet();
  }
}
```

| | 实例成员 | 静态成员 |
|---|----------|----------|
| 归属 | 每个对象一份 | 全 JVM 一份（类加载器范围） |
| 访问 | 需对象引用 | `ClassName.method()` |
| 典型用途 | 业务状态 | 工具方法、常量、计数器 |

**注意：** 静态方法不能访问实例字段；静态字段过多常意味着设计问题。

---

## ⭐ `final` 修饰符

```java
public final class ImmutablePoint {   // 类不可被继承
  private final int x;
  private final int y;
  // 无 setter，全部字段 final → 不可变对象
}
```

- `final` 变量：赋值一次
- `final` 方法：子类不能重写（性能/安全考虑，少用）
- `final` 类：`String`、`Integer` 等

---

## ⭐ Record（Java 16+）

不可变**数据载体**，编译器生成 accessor、`equals`、`hashCode`、`toString`：

```java
public record UserDto(Long id, String name, String email) {
  public UserDto {
    Objects.requireNonNull(name);
    if (id != null && id <= 0) throw new IllegalArgumentException("id");
  }

  public String displayName() {
    return name + " <" + email + ">";
  }
}
```

| 场景 | 用 Record | 用 Class |
|------|-----------|----------|
| API 请求/响应 DTO | ✅ | |
| 领域实体（有行为、可变状态） | | ✅ JPA Entity |
| 多表关联复杂对象 | | ✅ |

Spring MVC / WebFlux 可直接绑定 Record；JPA Entity 仍多用 class + Lombok。

---

## 📌 包与导入

```java
package com.example.order.service;

import java.util.List;
import java.util.Objects;

import com.example.order.domain.Order;
import com.example.order.repository.OrderRepository;
```

**规则：**

- 目录 `com/example/order/service/` 必须与 `package` 一致
- **禁止** `import java.util.*` 入公司规范（冲突难查）
- 同包类无需 import

---

## 📌 访问控制

| 修饰符 | 同类 | 同包 | 子类 | 世界 |
|--------|------|------|------|------|
| `private` | ✅ | | | |
| 默认（包访问） | ✅ | ✅ | | |
| `protected` | ✅ | ✅ | ✅ | |
| `public` | ✅ | ✅ | ✅ | ✅ |

**企业惯例：** 字段 private；对外 API public；模块内部 package-private。

---

## 📌 方法参数与可变参数

```java
public double sum(double... values) {
  double total = 0;
  for (double v : values) total += v;
  return total;
}
sum(1, 2, 3);
```

可变参数必须是最后一个参数；内部当作数组。重载与 `sum(double[])` 可能冲突，慎用在公共 API。

---

## 📌 JAR 与模块路径

```bash
jar cvf mylib.jar com/example/*.class
java -cp myapp.jar:mylib.jar com.example.Main
```

Java 9+ 还可用 **module-path**（见卷 II 第 9 章）；Spring Boot 仍以 classpath / fat jar 为主。

---

## 📌 Javadoc

```java
/**
 * 根据 ID 查询用户。
 *
 * @param id 用户主键，必须 &gt; 0
 * @return 用户实体；不存在时 {@link Optional#empty()}
 * @throws IllegalArgumentException id 非法
 */
public Optional<User> findById(long id) { }
```

公共 SDK、二方库接口应写 Javadoc；内部 CRUD 可依赖 OpenAPI。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 贫血模型 | 只有 getter/setter 无行为；DDD 中实体应含业务方法 |
| 可变 Date 字段 | 改用 `Instant` / `LocalDateTime` |
| 构造器里调用可重写方法 | 子类未初始化完，可能 NPE |
| Record 当 JPA Entity | 不支持懒加载、代理，勿混用 |

---

## 本章小结

- 类 = 状态（字段）+ 行为（方法）；封装是默认准则
- `static` / `final` / Record 减少样板、表达意图
- 包结构与访问控制支撑大型项目边界

---

## 下一步

- [第 5 章：继承](./05-inheritance)

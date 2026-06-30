# 第 6 章：接口、Lambda 与内部类

[← 卷 I 目录](../index)

> 原书 Chapter 6 — Interfaces, Lambda Expressions, and Inner Classes

---

## ⭐ 接口

```java
public interface UserRepository {
  Optional<User> findById(Long id);
  List<User> findByDeptId(Long deptId);
  void save(User user);

  default void saveAll(List<User> users) {
    users.forEach(this::save);
  }

  private void logSave(User user) {  // Java 9+
    System.out.println("save " + user.getId());
  }

  static UserRepository inMemory() {
    return new InMemoryUserRepository();
  }
}
```

| 特性 | 说明 |
|------|------|
| `default` | 接口演进，老实现类无需改代码 |
| `static` | 工厂方法、工具 |
| `private` | default 间共享逻辑 |
| 多实现 | `class X implements A, B, C` |
| 常量 | `public static final`，现代代码少用 |

**接口 vs 抽象类：** 无状态契约 → 接口；共享状态 + 模板流程 → 抽象类。

---

## ⭐ Lambda 表达式语法

Lambda 是**函数式接口实例**的简写（非独立类型）：

```java
// 完整形式：(参数) -> { 语句; return 值; }
Comparator<String> c1 = (a, b) -> {
  int r = a.compareToIgnoreCase(b);
  return r;
};

// 单表达式可省略 return 和 {}
Comparator<String> c2 = (a, b) -> a.compareToIgnoreCase(b);

// 单参数可省略括号
Predicate<String> nonBlank = s -> !s.isBlank();

// 无参
Supplier<Instant> now = () -> Instant.now();
```

### 类型推断

```java
List<String> names = List.of("a", "b");
names.removeIf(s -> s.length() > 1);  // s 推断为 String

// 显式类型（歧义时）
names.sort((String a, String b) -> a.compareTo(b));
```

---

## ⭐ 函数式接口（SAM）

**仅一个抽象方法**；可有多个 default/static：

```java
@FunctionalInterface
public interface Validator<T> {
  boolean validate(T value);

  default Validator<T> and(Validator<T> other) {
    return v -> this.validate(v) && other.validate(v);
  }
}
```

### `java.util.function` 全家桶

| 接口 | 抽象方法 | 典型场景 |
|------|----------|----------|
| `Predicate<T>` | `test(T)` | `filter`、`removeIf` |
| `Function<T,R>` | `apply(T)` | `map`、转换 |
| `Consumer<T>` | `accept(T)` | `forEach`、副作用 |
| `Supplier<T>` | `get()` | 延迟创建、工厂 |
| `BiFunction<T,U,R>` | `apply(T,U)` | 合并两个输入 |
| `BiConsumer<T,U>` | `accept(T,U)` | `Map.forEach` |
| `UnaryOperator<T>` | `apply(T)` | `Function` 同类型 |
| `BinaryOperator<T>` | `apply(T,T)` | `reduce`、合并 |
| `IntPredicate` 等 | 基本类型 | 避免装箱 |

```java
Function<String, User> loader = id -> userRepo.findById(Long.parseLong(id));
Predicate<User> adult = u -> u.getAge() >= 18;
Consumer<Order> logger = o -> log.info("order {}", o.getId());
Supplier<OrderId> idGen = () -> OrderId.next();
```

### 基本类型特化

```java
IntStream.range(0, 100).filter(i -> i % 2 == 0).sum();
// 优于 Stream<Integer> 减少 Integer 对象
```

---

## ⭐ Lambda 捕获与作用域

```java
int threshold = 10;  // effectively final
list.removeIf(n -> n > threshold);

// threshold = 20;  // 编译错误：Lambda 捕获的局部变量必须 effectively final
```

| 可访问 | 不可 |
|--------|------|
| effectively final 局部变量 | 修改局部变量 |
| 实例字段（可读写） | |
| 静态字段（可读写） | |
| `this`（实例方法内） | |

**与匿名内部类相同规则** — Lambda 不引入新作用域，`this` 仍指外部类：

```java
public class Processor {
  void run() {
    Runnable r = () -> System.out.println(this);  // Processor 实例
  }
}
```

---

## ⭐ 方法引用

| 类别 | 语法 | 等价 Lambda |
|------|------|-------------|
| 静态 | `Integer::parseInt` | `s -> Integer.parseInt(s)` |
| 实例（特定对象） | `System.out::println` | `x -> System.out.println(x)` |
| 实例（任意对象） | `String::length` | `s -> s.length()` |
| 构造器 | `ArrayList::new` | `() -> new ArrayList<>()` |
| 数组构造 | `int[]::new` | `len -> new int[len]` |

### 重载解析

```java
// 歧义示例 — 需强类型上下文
// list.sort(String::compareTo);  // 可能 compareTo(String) 或 compareTo(Object)
list.sort(String::compareToIgnoreCase);
list.sort(Comparator.comparing(String::toString));
```

### 与 Stream 组合

```java
users.stream()
    .filter(User::isActive)
    .map(User::getDept)
    .map(Dept::getName)
    .distinct()
    .sorted(String.CASE_INSENSITIVE_ORDER)
    .forEach(System.out::println);
```

---

## ⭐ `Comparator` 进阶

```java
// 单字段
users.sort(Comparator.comparing(User::getName));

// 多字段
users.sort(Comparator
    .comparing(User::getLevel).reversed()
    .thenComparing(User::getName)
    .thenComparing(User::getId));

// null 安全
users.sort(Comparator.comparing(
    User::getNickname,
    Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)));

// 键提取 + 映射
users.sort(Comparator.comparing(
    u -> u.getDept().getCode(),
    Comparator.naturalOrder()));
```

`TreeSet`、`PriorityQueue`、`Stream.sorted` 都依赖 `Comparator`。

---

## ⭐ Lambda vs 匿名内部类

| | Lambda | 匿名类 |
|---|--------|--------|
| 语法 | 简洁 | 冗长 |
| `this` | 外部类 | 匿名类自身 |
| 适用 | SAM 接口 | 多方法接口、抽象类 |
| 字节码 | `invokedynamic` | 单独 .class |

```java
// 匿名类 — 仅当需要多个方法或抽象类时
button.setOnAction(new EventHandler<ActionEvent>() {
  @Override
  public void handle(ActionEvent e) { /* ... */ }
});

// Lambda 等价
button.setOnAction(e -> { /* ... */ });
```

---

## ⭐ 企业中的 Lambda 场景

### 集合与 Stream

```java
orders.removeIf(o -> o.getStatus() == CANCELLED);
Map<Long, List<Order>> byUser = orders.stream()
    .collect(Collectors.groupingBy(Order::getUserId));
```

### 回调与异步

```java
CompletableFuture.supplyAsync(() -> fetch(id))
    .thenApply(this::transform)
    .whenComplete((r, ex) -> { if (ex != null) log.error("fail", ex); });
```

### Spring 函数式 Bean

```java
@Bean
public CommandLineRunner runner(UserRepository repo) {
  return args -> log.info("users count={}", repo.count());
}
```

### Optional 链

```java
return Optional.ofNullable(userId)
    .map(repo::findById)
    .flatMap(u -> u.getEmail())
    .orElse("unknown@example.com");
```

---

## 📌 内部类

| 类型 | 持有外部引用 | 用途 |
|------|--------------|------|
| 静态内部类 | 否 | `Map.Entry` 式节点 |
| 成员内部类 | 是 | 迭代器、Builder |
| 局部类 | 是（effectively final 局部变量） | 少见 |
| 匿名类 | 是 | 被 Lambda 替代 |

**内存泄漏：** 内部类隐式持有外部类 `this`；若内部类被静态集合长期引用，外部类无法 GC。

---

## 📌 代理（Proxy）

见 [第 5 章反射与代理](./05-inheritance#jdk-动态代理-vs-cglib) — Lambda 本身也是 `invokedynamic` 生成，与代理互补。

---

## ⚠️ Lambda 常见坑

| 坑 | 说明 |
|----|------|
| 循环变量捕获 | `for (int i=0;i<n;i++) list.add(() -> i)` 全变成 n；用 `int j=i` |
| 异常 | Lambda 不能抛受检异常除非接口声明；包装为 RuntimeException |
| 调试 | 栈帧名为 `lambda$main$0`，可读性差 |
| 过度一行流 | 复杂逻辑拆方法引用或 private 方法 |
| NPE | `map` 链中 null 用 `filter(Objects::nonNull)` |

```java
// 循环陷阱
List<Supplier<Integer>> bad = new ArrayList<>();
for (int i = 0; i < 3; i++) {
  bad.add(() -> i);  // 全是 3
}
// 修正
for (int i = 0; i < 3; i++) {
  int captured = i;
  bad.add(() -> captured);
}
```

---

## 本章小结

- Lambda = SAM 的语法糖；方法引用进一步简化
- `Comparator.comparing` + Stream 是日常最高频组合
- 理解捕获规则与循环陷阱；框架回调本质是函数式接口

---

## 下一步

- [第 7 章：异常与日志](./07-exceptions-logging)

# Java 8 常见面试题

> Lambda、Stream、Optional、HashMap 改造等高频考点。与 [接口与 Lambda](../../backend/java/core-java/vol1/06-interfaces-lambda)、[Stream API](../../backend/java/core-java/vol2/01-streams)、[集合框架](../../backend/java/core-java/vol1/09-collections) 互补。

[← Java 基础面试题](./index)

---

## 1. Java 8 有哪些新特性？

Java 8（2014）是长期支持版，企业项目至今大量使用。面试常答**语言 + API + 并发**三类。

### 语言与语法

| 特性 | 说明 |
|------|------|
| **Lambda 表达式** | 函数式接口的简写，如 `(a, b) -> a + b` |
| **方法引用** | `String::length`、`System.out::println` |
| **默认方法** | 接口 `default` 方法，接口可演进而不破坏实现类 |
| **静态接口方法** | 接口 `static` 工厂/工具方法 |
| **重复注解** | 同一注解可多次使用（需 `@Repeatable`） |
| **类型注解** | 注解可用于更多位置（如泛型参数） |

### 核心 API

| 特性 | 包 / 类 | 用途 |
|------|---------|------|
| **Stream API** | `java.util.stream` | 声明式集合处理、filter/map/reduce |
| **Optional** | `java.util.Optional` | 显式表达「可能无值」，减少 NPE |
| **新日期时间** | `java.time` | `LocalDate`、`ZonedDateTime` 等，替代 `Date`/`Calendar` |
| **函数式接口** | `java.util.function` | `Predicate`、`Function`、`Consumer`、`Supplier` 等 |
| **Map 增强** | `Map` 默认方法 | `getOrDefault`、`putIfAbsent`、`computeIfAbsent`、`merge` |

### 并发与其他

| 特性 | 说明 |
|------|------|
| **CompletableFuture** | 异步编排、链式回调 |
| **StampedLock** | 乐观读锁 |
| **Base64** | `java.util.Base64` |
| **Nashorn** | JS 引擎（JDK 11 起移除） |
| **PermGen 移除** | 元空间 Metaspace 取代永久代 |

### 一句话速记（面试开场）

> Java 8 最重要的是 **Lambda + Stream + 新日期 API + 接口 default 方法**；工程里还会用到 Optional、CompletableFuture 和 Map 的 `compute/merge` 系列。

```java
// 典型 Java 8 风格
List<String> names = users.stream()
    .filter(User::isActive)
    .map(User::getName)
    .sorted()
    .toList();

LocalDate today = LocalDate.now();
map.computeIfAbsent(key, k -> loadValue(k));
```

---

## 2. Lambda 表达式的原理是什么？

### 本质：函数式接口的实例

Lambda **不是新类型**，而是**只有一个抽象方法（SAM）的接口**的简写实现。

```java
// 这两种写法等价
Comparator<String> c1 = (a, b) -> a.compareToIgnoreCase(b);
Comparator<String> c2 = new Comparator<String>() {
    @Override
    public int compare(String a, String b) {
        return a.compareToIgnoreCase(b);
    }
};
```

编译器要求：目标类型必须是 `@FunctionalInterface`（或仅一个抽象方法的接口）。

### 字节码：`invokedynamic`（与匿名类的关键区别）

| | Lambda | 匿名内部类 |
|---|--------|------------|
| 生成类 | 运行时动态生成，**不一定**每次 new 一个 `.class` | 编译期生成 `Outer$1.class` |
| 字节码指令 | **`invokedynamic`** + `LambdaMetafactory` | `new` + `invokespecial` |
| `this` | 指向**外部类** | 指向匿名类自身 |
| 适用 | SAM 接口 | 多方法接口、抽象类 |

**流程简述：**

1. 编译器把 Lambda 编译为 `invokedynamic` 调用
2. 首次执行时，JVM 通过 `LambdaMetafactory.metafactory` 生成实现类
3. 后续可**复用**已生成的实现（利于性能）

### 变量捕获

Lambda 可访问：

- **effectively final** 的局部变量（赋值后不再修改）
- 实例字段、静态字段（可读写）
- 外部类的 `this`

```java
int threshold = 10;
list.removeIf(n -> n > threshold);
// threshold = 20;  // ❌ 编译错误
```

原理：局部变量会被**复制**到生成的实现对象中（与匿名内部类相同），所以必须是 effectively final。

### 方法引用

方法引用是 Lambda 的语法糖：

| 形式 | 等价 Lambda |
|------|-------------|
| `Integer::parseInt` | `s -> Integer.parseInt(s)` |
| `System.out::println` | `x -> System.out.println(x)` |
| `String::length` | `s -> s.length()` |
| `ArrayList::new` | `() -> new ArrayList<>()` |

---

## 3. Stream API 和传统的循环有什么区别？

### 核心对比

| 维度 | 传统 for / foreach | Stream |
|------|-------------------|--------|
| 编程风格 | **命令式**（怎么做） | **声明式**（要什么） |
| 是否修改源 | 常直接改集合 | 默认**不修改**源（中间操作产生新流） |
| 执行时机 | 立即执行 | **惰性求值**，终结操作才触发 |
| 并行 | 需手写多线程 | `parallelStream()`（需谨慎） |
| 可读性 | 简单逻辑直观 | 链式 filter/map 更清晰 |
| 调试 | 易打断点逐步看 | 链长时调试稍难 |
| 性能 | 简单遍历往往更快 | 小数据有装箱/流水线开销 |

### 代码对比

```java
// 传统循环：找活跃用户的名字并去重排序
List<String> result = new ArrayList<>();
Set<Long> seen = new HashSet<>();
for (User u : users) {
    if (u.isActive()) {
        if (seen.add(u.getId())) {
            result.add(u.getName());
        }
    }
}
Collections.sort(result, String.CASE_INSENSITIVE_ORDER);

// Stream
List<String> result2 = users.stream()
    .filter(User::isActive)
    .map(User::getName)
    .distinct()
    .sorted(String.CASE_INSENSITIVE_ORDER)
    .toList();
```

### Stream 三要素

```text
数据源 → 中间操作（lazy）→ 终结操作（触发计算）

例：users.stream()     .filter(...)  .map(...)     .collect(...)
     └─ 数据源          └─ 中间        └─ 中间       └─ 终结
```

常见中间操作：`filter`、`map`、`flatMap`、`sorted`、`distinct`、`limit`、`skip`  
常见终结操作：`collect`、`forEach`、`reduce`、`count`、`findFirst`、`anyMatch`

### 何时用循环、何时用 Stream？

| 用循环 | 用 Stream |
|--------|-----------|
| 需要 `break`/`continue`、复杂分支 | filter + map 流水线 |
| 边遍历边修改原集合结构 | 聚合、转换、分组 |
| 性能敏感的小集合热路径 | 声明式业务处理、配合 Collectors |
| 需要多个可变临时变量 | `groupingBy`、`partitioningBy` |

::: warning 注意
- Stream **只能消费一次**，不能重复使用同一 Stream 实例。
- `parallelStream()` 仅在数据量大、CPU 密集、无共享可变状态时考虑；小集合反而更慢。
- 基本类型用 `IntStream`/`LongStream`，避免 `Stream<Integer>` 装箱开销。
:::

---

## 4. HashMap 在 JDK 1.7 和 1.8 的区别？

### 结构对比

| 项目 | JDK 1.7 | JDK 1.8 |
|------|---------|---------|
| 底层结构 | 数组 + **单向链表** | 数组 + 链表 + **红黑树** |
| 冲突处理 | 头插法链表 | **尾插法**链表 |
| 树化条件 | 无 | 链表长度 ≥ **8** 且数组长度 ≥ **64** 时转红黑树 |
| 退化 | 无 | 树节点 ≤ **6** 时退化为链表 |
| 扩容 | 头插可能导致**环形链表**（多线程死循环，1.7 著名 bug） | 尾插 + 节点位置重算，修复该问题 |
| hash 算法 | 4 次扰动 + 索引计算 | **高 16 位 XOR 低 16 位**，分布更均匀 |

### JDK 1.7 要点

```text
数组 table[]
  └─ Entry 单向链表（头插）
       key → hash → 桶下标
       冲突：新节点插到链表头部
```

- 多线程扩容时头插重排可能形成环，导致 `get` 死循环（**HashMap 非线程安全**）。
- 面试常提：1.7 在**多线程环境**下 resize 有风险。

### JDK 1.8 要点

```text
数组 Node<K,V>[]
  └─ 链表（尾插）或 TreeNode（红黑树）
       hash: (h = key.hashCode()) ^ (h >>> 16)
       桶下标: (n - 1) & hash
```

**树化目的：** 链表过长时 `get` 从 O(n) 降为 O(log n)。

**扩容：** 容量仍为 2 的幂；`loadFactor` 默认 0.75；扩容时元素位置要么在原索引，要么在「原索引 + 旧容量」。

### 相同点（常被追问）

- 都允许 **null key**（桶 0）和 **null value**
- 初始容量默认 16，容量始终为 2 的幂
- 线程不安全；并发用 `ConcurrentHashMap`
- 先比 `hash` 定位桶，再用 `equals` 判 key

### 代码层面的 1.8 增强（顺带可答）

```java
map.putIfAbsent(k, v);
map.computeIfAbsent(k, key -> load(key));
map.merge(k, 1, Integer::sum);
```

---

## 5. Optional 类有什么作用，如何使用？

### 作用

`Optional<T>` 是**可能包含也可能不包含**非 null 值的容器，用来：

1. **显式表达**「返回值可能为空」，替代直接返回 `null`
2. **强制调用方**考虑空值分支，减少 `NullPointerException`
3. 与 Stream 配合：`findFirst()`、`max()` 等返回 `Optional`

::: warning 使用规范
- **不要**把 Optional 作为**实体字段**类型（JPA、序列化不友好）
- **不要**不经判断直接 `get()`（无值时抛 `NoSuchElementException`）
- 集合元素、Map 的 value 也**不宜**用 `Optional` 包装
:::

### 创建

```java
Optional<String> empty = Optional.empty();
Optional<String> opt = Optional.of("hello");       // 参数不能为 null
Optional<String> nullable = Optional.ofNullable(maybeNull);  // 可为 null → empty
```

### 判空与取值

```java
if (opt.isPresent()) {
    System.out.println(opt.get());
}

// ✅ 推荐
opt.ifPresent(System.out::println);

String name = opt.orElse("guest");
String name2 = opt.orElseGet(() -> loadDefault());  // 延迟计算
String name3 = opt.orElseThrow(() -> new NotFoundException("user"));
```

### 转换与链式（核心价值）

```java
Optional<User> userOpt = findUserById(id);

Optional<String> email = userOpt
    .map(User::getEmail)
    .filter(e -> !e.isBlank());

String display = userOpt
    .map(User::getName)
    .orElse("匿名");

// flatMap：避免 Optional<Optional<T>>
Optional<String> city = userOpt
    .flatMap(u -> u.getAddress())   // Address 本身也是 Optional
    .map(Address::getCity);
```

### 与 Stream 结合

```java
Optional<User> first = users.stream()
    .filter(User::isActive)
    .findFirst();

first.ifPresent(u -> log.info("found {}", u.getName()));
```

### 对比 null 的写法

```java
// ❌ 层层 null 判断
User user = findUser(id);
if (user != null) {
    Address addr = user.getAddress();
    if (addr != null) {
        return addr.getCity();
    }
}
return "未知";

// ✅ Optional 链
return findUser(id)
    .flatMap(User::getAddress)
    .map(Address::getCity)
    .orElse("未知");
```

---

## 速查表

| 面试题 | 一句话 |
|--------|--------|
| Java 8 新特性 | Lambda、Stream、Optional、`java.time`、接口 default、CompletableFuture |
| Lambda 原理 | SAM 接口实例；`invokedynamic` + `LambdaMetafactory`；捕获 effectively final 变量 |
| Stream vs 循环 | 声明式 vs 命令式；惰性求值；不修改源；适合聚合转换 |
| HashMap 1.7 vs 1.8 | 1.8 尾插 + 红黑树树化；hash 扰动简化；修复 1.7 扩容死循环 |
| Optional | 显式可空容器；`ofNullable`/`map`/`orElse`；不当字段、不滥用 `get()` |

---

## 延伸阅读

- [Core Java — 接口与 Lambda](../../backend/java/core-java/vol1/06-interfaces-lambda)
- [Core Java — Stream API](../../backend/java/core-java/vol2/01-streams)
- [Core Java — 集合与 HashMap](../../backend/java/core-java/vol1/09-collections)
- [Core Java — 日期时间 API](../../backend/java/core-java/vol2/06-date-time)
- [Java 基础面试题](./index)

# 第 1 章：Stream API

[← 卷 II 目录](../index)

> 原书 Vol.II Chapter 1 — Streams

---

## ⭐ 什么是 Stream

Stream 是对数据源（集合、数组、IO 行、随机数）的**流水线式**计算视图：

- **不存储**元素（除非 collect 到集合）
- **不修改**源（除非源本身可变且中间操作修改，如 `List.sort` 不是 Stream）
- **惰性求值**：中间操作延迟到终结操作
- **可并行**：`parallelStream()`（需谨慎）

```java
List<String> result = users.stream()
    .filter(u -> u.getAge() >= 18)
    .map(User::getName)
    .sorted(String.CASE_INSENSITIVE_ORDER)
    .distinct()
    .toList();  // Java 16+ 不可变 List
```

---

## ⭐ 创建 Stream

```java
Stream.of("a", "b", "c");
Stream.empty();
Stream.generate(() -> Math.random()).limit(10);
Stream.iterate(0, n -> n + 2).limit(5);  // 0,2,4,6,8
Stream.iterate(0, n -> n < 100, n -> n + 2);  // Java 9+ 带谓词

list.stream();
list.parallelStream();
Arrays.stream(array);
IntStream.range(0, 100);
IntStream.rangeClosed(1, 100);
Files.lines(path, StandardCharsets.UTF_8);
Pattern.compile("\\s+").splitAsStream(text);
```

---

## ⭐ 中间操作 vs 终结操作

| 中间（返回 Stream，lazy） | 终结（触发计算） |
|---------------------------|------------------|
| `filter(Predicate)` | `forEach(Consumer)` |
| `map` / `mapToInt` / `flatMap` | `collect(Collector)` |
| `sorted` / `distinct` | `reduce` |
| `peek`（调试） | `count` / `min` / `max` |
| `limit` / `skip` | `findFirst` / `findAny` |
| `takeWhile` / `dropWhile` (Java 9+) | `anyMatch` / `allMatch` / `noneMatch` |
| | `toList` / `toArray` |

```java
long n = users.stream()
    .filter(User::isActive)
    .count();  // 此处才真正遍历
```

---

## ⭐ `flatMap`

```java
List<String> words = lines.stream()
    .flatMap(line -> Arrays.stream(line.split("\\s+")))
    .toList();

List<OrderItem> allItems = orders.stream()
    .flatMap(o -> o.getItems().stream())
    .toList();
```

一对多展开：嵌套集合、Optional 链。

---

## ⭐ `collect` 与 `Collectors`

```java
// 转集合
List<String> names = users.stream().map(User::getName).toList();
Set<String> set = users.stream().map(User::getName).collect(Collectors.toSet());

// 分组
Map<String, List<User>> byCity = users.stream()
    .collect(Collectors.groupingBy(User::getCity));

Map<String, Long> countByCity = users.stream()
    .collect(Collectors.groupingBy(User::getCity, Collectors.counting()));

// 分区（Predicate）
Map<Boolean, List<User>> adult = users.stream()
    .collect(Collectors.partitioningBy(u -> u.getAge() >= 18));

// 字符串
String joined = users.stream()
    .map(User::getName)
    .collect(Collectors.joining(", ", "[", "]"));

// 统计
DoubleSummaryStatistics stats = users.stream()
    .collect(Collectors.summarizingDouble(User::getScore));

// 不可变 Map
Map<Long, User> map = users.stream()
    .collect(Collectors.toUnmodifiableMap(User::getId, u -> u));
```

### 下游收集器

```java
Map<String, Set<String>> cityToNames = users.stream()
    .collect(Collectors.groupingBy(
        User::getCity,
        Collectors.mapping(User::getName, Collectors.toSet())));
```

---

## ⭐ `reduce`

```java
Optional<Integer> sum = numbers.stream().reduce(Integer::sum);
int sumOrZero = numbers.stream().reduce(0, Integer::sum);

Optional<User> max = users.stream()
    .reduce((u1, u2) -> u1.getScore() > u2.getScore() ? u1 : u2);
```

---

## ⭐ `Optional` 与 Stream

```java
Optional<User> opt = users.stream()
    .filter(u -> u.getId().equals(id))
    .findFirst();

opt.ifPresent(u -> log.info("found {}", u.getName()));
User user = opt.orElse(User.GUEST);
User user2 = opt.orElseGet(() -> loadDefault());

Optional<String> name = opt.map(User::getName);
Optional<String> upper = name.filter(s -> !s.isBlank()).map(String::toUpperCase);
```

**不要** `Optional.get()` 不判空；**不要** 字段类型用 Optional。

---

## 📌 基本类型 Stream

避免装箱：

```java
IntStream.range(1, 101).sum();
OptionalDouble avg = users.stream().mapToInt(User::getAge).average();
long count = users.stream().mapToLong(User::getId).count();

IntStream ints = IntStream.of(1, 2, 3);
Stream<Integer> boxed = ints.boxed();
```

---

## 📌 并行 Stream

```java
long count = hugeList.parallelStream()
    .filter(this::expensiveCpuCheck)
    .count();
```

**适用：** 数据量大、CPU 密集、无共享可变状态、拆分均匀。

**不适用：** IO 密集（用虚拟线程）、小集合、需严格顺序、`synchronized` 块内。

并行使用 **ForkJoinPool.commonPool()**，与其他并行任务共享。

---

## 📌 有序与 `sorted`

```java
users.stream()
    .sorted(Comparator.comparing(User::getScore).reversed()
        .thenComparing(User::getName))
    .toList();
```

`distinct()` 依赖 `equals`/`hashCode`；有序流上 `distinct` 保留遇到顺序。

---

## 📌 无限流与短路

```java
Stream.iterate(1, n -> n * 2)
    .filter(n -> n < 1_000_000)
    .findFirst();

files.lines()
    .filter(line -> line.contains("ERROR"))
    .limit(100)
    .forEach(System.out::println);
```

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 重复终结操作 | Stream 只能消费一次 |
| `peek` 改对象状态 | 副作用难维护 |
| parallel + 非0 | 数据竞争 |
| `Collectors.toMap` 重复 key | 抛异常；用 `(a,b)->a` 合并 |
| 过度 Stream | 简单循环更清晰时别强行流式 |

---

## 本章小结

- Stream = 声明式集合处理 + Optional + Collectors
- 企业代码中 filter/map/groupingBy/joining 天天用
- 并行与无限流理解边界即可

---

## 下一步

- [第 2 章：输入输出](./02-input-output)

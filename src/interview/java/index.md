# Java 常见面试题

> 基础语法、对象语义、集合选型等高频考点。与 [Core Java 集合章](../../backend/java/core-java/vol1/09-collections)、[对象与类](../../backend/java/core-java/vol1/04-objects-classes) 互补。

---

## 1. `==` 和 `equals` 有什么区别？

### 核心区别

| 比较方式 | 比较对象 | 适用类型 | 语义 |
|----------|----------|----------|------|
| `==` | **引用地址**（基本类型比较**值**） | 所有类型 | 两个变量是否指向同一对象 / 基本类型值是否相等 |
| `equals` | **内容是否相等**（由类实现决定） | 引用类型 | 逻辑上的「相等」，默认等同 `==` |

```java
String a = new String("hello");
String b = new String("hello");
String c = a;

System.out.println(a == b);       // false — 不同对象
System.out.println(a.equals(b)); // true  — 内容相同
System.out.println(a == c);       // true  — 同一引用
```

### 基本类型 vs 包装类型

```java
int x = 128, y = 128;
System.out.println(x == y);           // true — 比较值

Integer i1 = 127, i2 = 127;
System.out.println(i1 == i2);         // true — 缓存池 -128~127

Integer i3 = 128, i4 = 128;
System.out.println(i3 == i4);         // false — 超出缓存，不同对象
System.out.println(i3.equals(i4));   // true  — 比较 int 值
```

::: warning 面试陷阱
- 比较 `String`、自定义对象内容：**永远用 `equals`**，不要用 `==`。
- 比较 `Integer` 等包装类：用 `equals` 或拆箱后 `==`；大整数用 `==` 可能踩缓存池边界。
:::

### `equals` 的约定（`Object` 规范）

重写 `equals` 时应满足：

1. **自反性**：`x.equals(x)` 为 true
2. **对称性**：`x.equals(y)` ⇔ `y.equals(x)`
3. **传递性**：`x.equals(y)` 且 `y.equals(z)` → `x.equals(z)`
4. **一致性**：多次调用结果不变（对象未变前提下）
5. **非空性**：`x.equals(null)` 为 false

---

## 2. 为什么重写 `equals` 还要重写 `hashCode`？

### 契约（Java 规范）

> 若两个对象 `equals` 为 true，则它们的 `hashCode` **必须相同**。  
> 反之不成立：hashCode 相同不代表 equals 为 true（哈希冲突）。

### 不重写 `hashCode` 的后果

`HashMap`、`HashSet` 等依赖哈希的集合，先用 `hashCode` 定位桶，再用 `equals` 比较：

```java
class User {
    private Long id;
    private String name;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User other)) return false;
        return Objects.equals(id, other.id);
    }
    // 未重写 hashCode
}

User u1 = new User(1L, "Alice");
User u2 = new User(1L, "Alice");

System.out.println(u1.equals(u2));           // true
System.out.println(u1.hashCode() == u2.hashCode()); // false — 默认用地址算 hash

Set<User> set = new HashSet<>();
set.add(u1);
System.out.println(set.contains(u2));        // false — 查错桶，逻辑错误！
```

### 正确写法

```java
@Override
public int hashCode() {
    return Objects.hash(id);  // 参与 equals 的字段都要参与 hashCode
}

@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof User other)) return false;
    return Objects.equals(id, other.id);
}
```

Java 16+ 可用 **Record**，编译器自动生成 `equals` / `hashCode`：

```java
public record User(Long id, String name) {}
```

::: tip 记忆口诀
**equals 相等 → hashCode 必相等**；用作 `HashMap` key 的类，两者必须成对重写。  
`Objects.equals` + `Objects.hash` 或 IDE / Lombok `@EqualsAndHashCode` 生成即可。
:::

---

## 3. 为什么 `4.0 - 3.6 = 0.40000001`？

### 根本原因：IEEE 754 二进制浮点无法精确表示部分十进制小数

`float` / `double` 用**二进制**存储。像 `0.1`、`0.2`、`3.6` 这类十进制小数，在二进制中是**无限循环小数**，只能截断近似存储。

```java
System.out.println(4.0 - 3.6);              // 0.4000000059604645
System.out.println(0.1 + 0.2);              // 0.30000000000000004
System.out.println(0.1 + 0.2 == 0.3);     // false
```

### 本质

- 不是 Java 的 bug，而是**所有**采用 IEEE 754 的语言（C、Python、JS）共有现象。
- `float` 32 位、`double` 64 位，精度有限。

### 正确做法

| 场景 | 推荐 |
|------|------|
| 金额、汇率、财务 | `BigDecimal` |
| 科学计算 | `double` + 容差比较，或 `BigDecimal` |
| 仅展示 | `String.format` / `DecimalFormat` 控制小数位 |

```java
// ❌ 不要用 double 构造 BigDecimal
BigDecimal bad = new BigDecimal(0.1);

// ✅ 用字符串
BigDecimal a = new BigDecimal("4.0");
BigDecimal b = new BigDecimal("3.6");
System.out.println(a.subtract(b));  // 0.4

// 浮点比较：设 epsilon 容差
double epsilon = 1e-9;
boolean equal = Math.abs((4.0 - 3.6) - 0.4) < epsilon;
```

::: warning 面试加分
能说清「二进制浮点近似」+「金额用 BigDecimal」+「比较用 epsilon 或 compareTo」即可。
:::

---

## 4. `final` 关键字有什么作用？

`final` 可修饰**类、方法、变量（含参数）**，表达「不可变 / 不可扩展」。

### 修饰变量

```java
final int MAX = 100;           // 常量，赋值一次后不可改
final List<String> list = new ArrayList<>();
list.add("a");                 // ✅ 引用不可变，对象内容可以变
// list = new ArrayList<>();   // ❌ 不能重新赋值
```

- 成员 `final` 字段必须在**构造器结束**前赋值。
- 局部 `final` 变量赋值后不可再改。

### 修饰类

```java
public final class String { }  // 不能被继承
```

典型：`String`、`Integer`、`LocalDate` 等不可变或安全类。

### 修饰方法

```java
public final void doSomething() { }  // 子类不能重写
```

现代代码中较少用 `final` 方法；`private` 方法隐式不可重写。

### 修饰方法参数

```java
void process(final String input) {
    // input = "x";  // ❌ 编译错误，防止方法内误改参数
}
```

### `effectively final`（Lambda 相关）

未声明 `final` 但赋值后不再修改的局部变量，Lambda 可以捕获：

```java
int threshold = 10;
list.removeIf(x -> x > threshold);  // threshold 必须 effectively final
```

### 常见用途小结

| 场景 | 用法 |
|------|------|
| 常量 | `public static final` |
| 不可变对象 | 类 + 全部字段 `final` |
| 安全子类化 | `final` 类 |
| 构造后 ID 不变 | `private final Long id` |
| 线程安全发布 | `final` 引用在构造器中初始化 |

---

## 5. 介绍 Java 的集合类

### 体系结构

```text
Iterable
├── Collection
│   ├── List      有序、可重复、有索引
│   ├── Set       不重复
│   └── Queue     FIFO / 优先级 / 阻塞
└── Map           键值对，key 不重复（独立接口，不继承 Collection）
```

**面向接口编程**：声明 `List`、`Set`、`Map`，实现用 `ArrayList`、`HashSet`、`HashMap`。

### List（列表）

| 实现类 | 底层 | 特点 |
|--------|------|------|
| `ArrayList` | 动态数组 | 随机访问快，默认首选 |
| `LinkedList` | 双向链表 | 头尾插入删除快，随机访问慢 |
| `Vector` | 数组 + 同步 | 遗留类，不推荐 |
| `CopyOnWriteArrayList` | 写时复制 | 读多写少、线程安全 |

### Set（集合）

| 实现类 | 特点 |
|--------|------|
| `HashSet` | 无序，O(1) 均摊，基于 `HashMap` |
| `LinkedHashSet` | 保持插入顺序 |
| `TreeSet` | 红黑树，有序 O(log n) |
| `EnumSet` | 枚举专用，位向量，极快 |

### Queue / Deque

| 实现类 | 特点 |
|--------|------|
| `ArrayDeque` | 数组环形队列，**栈/队列首选** |
| `PriorityQueue` | 堆，TopK、调度 |
| `ArrayBlockingQueue` | 有界阻塞队列 |
| `LinkedBlockingQueue` | 可选有界阻塞 |

### Map（映射）

| 实现类 | 特点 |
|--------|------|
| `HashMap` | 无序，O(1) 均摊，最常用 |
| `LinkedHashMap` | 插入顺序 / LRU（`accessOrder`） |
| `TreeMap` | 按 key 排序 |
| `ConcurrentHashMap` | 线程安全，高并发 |
| `Hashtable` | 遗留同步类，不推荐 |

### 工具类

- `Collections`：排序、不可变包装、`synchronizedList` 等
- `Arrays`：数组转 List、`sort`、`binarySearch`

```java
List<String> list = new ArrayList<>();
Set<Integer> set = new HashSet<>();
Map<String, User> map = new HashMap<>();
Queue<Task> queue = new ArrayDeque<>();
```

::: tip
遍历删除用 `Iterator.remove()` 或 `removeIf`，不要在增强 for 里直接 `list.remove()`，会 `ConcurrentModificationException`。
:::

---

## 6. `ArrayList` 和 `LinkedList` 的区别

### 底层结构

| | `ArrayList` | `LinkedList` |
|---|-------------|--------------|
| 底层 | **动态数组** `Object[]` | **双向链表** |
| 内存 | 连续，缓存友好 | 节点分散，额外 prev/next 指针 |
| 默认容量 | 10（首次 add 时分配） | 无容量概念 |

### 时间复杂度对比

| 操作 | `ArrayList` | `LinkedList` |
|------|-------------|--------------|
| `get(i)` / `set(i)` | **O(1)** | O(n) |
| 尾部 `add` | O(1) 均摊 | O(1) |
| 头部 `add` | O(n) 需搬移 | **O(1)** |
| 中间 `add(i)` | O(n) | O(n) 需先遍历定位 |
| `remove(i)` | O(n) | O(n) |
| 按值 `contains` | O(n) | O(n) |

### `ArrayList` 扩容

```java
// 扩容约 1.5 倍：newCapacity = oldCapacity + (oldCapacity >> 1)
List<String> list = new ArrayList<>(256);  // 预估容量，减少扩容拷贝
```

### 选型建议

| 场景 | 选择 |
|------|------|
| **默认、绝大多数情况** | `ArrayList` |
| 栈 / 普通队列 | `ArrayDeque`（不是 `LinkedList`） |
| 头尾频繁插入删除 | `ArrayDeque` 或 `LinkedList` |
| 需要 `List` + `Deque` 双接口 | `LinkedList` |
| 随机访问为主 | `ArrayList` |

::: warning 常见误区
- 「插入删除多就用 `LinkedList`」—— 中间插入两者都是 O(n)；只有**头尾**频繁操作时链表才有优势，且 `ArrayDeque` 往往更好。
- `LinkedList` 的 `get(0)` 是 O(1)，但 `get(n/2)` 要从头或尾遍历，仍是 O(n)。
:::

### 代码对比

```java
// ArrayList：随机访问
List<String> array = new ArrayList<>();
array.add("a");
array.get(0);        // O(1)

// LinkedList：作双端队列
Deque<String> deque = new LinkedList<>();
deque.addFirst("head");
deque.addLast("tail");
deque.removeFirst(); // O(1)
```

---

## 速查表

| 面试题 | 一句话 |
|--------|--------|
| `==` vs `equals` | `==` 比引用（基本类型比值）；`equals` 比内容 |
| equals + hashCode | equals 相等则 hashCode 必相等；HashMap/HashSet 依赖此契约 |
| 浮点精度 | IEEE 754 二进制近似；金额用 `BigDecimal` |
| `final` | 类不可继承、方法不可重写、变量赋值一次 |
| 集合体系 | Collection（List/Set/Queue）+ Map；面向接口 |
| ArrayList vs LinkedList | 数组 O(1) 随机访问 vs 链表 O(1) 头尾操作；默认 ArrayList |

---

## 延伸阅读

- [Core Java — 对象与类](../../backend/java/core-java/vol1/04-objects-classes)（`final`、Record）
- [Core Java — 基本程序结构](../../backend/java/core-java/vol1/03-fundamentals)（`BigDecimal`、基本类型）
- [Core Java — 集合框架](../../backend/java/core-java/vol1/09-collections)（HashMap 原理、并发集合）

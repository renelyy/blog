# 第 8 章：泛型

[← 卷 I 目录](../index)

> 原书 Chapter 8 — Generic Programming

---

## ⭐ 为什么需要泛型

```java
// 原始类型 — 禁止在新代码使用
List list = new ArrayList();
list.add(1);
String s = (String) list.get(0);  // ClassCastException

List<String> names = new ArrayList<>();
names.add("Tom");
// names.add(1);     // 编译错误
String s = names.get(0);
```

**收益：** 编译期类型检查、消除强转、API 自文档化。

---

## ⭐ 泛型类

```java
public class Pair<T> {
  private T first;
  private T second;

  public Pair(T first, T second) {
    this.first = first;
    this.second = second;
  }

  public T getFirst() { return first; }
  public T getSecond() { return second; }

  public void swap() {
    T temp = first;
    first = second;
    second = temp;
  }

  public static <T> Pair<T> of(T a, T b) {
    return new Pair<>(a, b);
  }
}
```

```java
Pair<String> ps = Pair.of("a", "b");
Pair<Integer> pi = Pair.of(1, 2);
// Pair 不是协变的：Pair<String> 不是 Pair<Object> 的子类型
```

---

## ⭐ 泛型方法

类型参数 `<T>` 在返回类型**之前**，可独立于类的类型参数：

```java
public static <T> T getMiddle(T... a) {
  return a[a.length / 2];
}

public static <T> void swap(List<T> list, int i, int j) {
  T temp = list.get(i);
  list.set(i, list.get(j));
  list.set(j, temp);
}

// 类型推断
String mid = getMiddle("a", "b", "c");
Collections.swap(list, 0, 1);
```

### 泛型方法与泛型类组合

```java
public class Utils {
  public static <T extends Comparable<T>> T max(Collection<T> coll) {
    T result = null;
    for (T e : coll) {
      if (result == null || e.compareTo(result) > 0) result = e;
    }
    return result;
  }
}
```

---

## ⭐ 类型边界

```java
// 上界 extends — T 至少是 Number
public static double sum(List<? extends Number> list) { /* ... */ }

// 多边界 — T 同时是 Number 且 Comparable
public class Interval<T extends Number & Comparable<T>> { }

// 下界 super — 写入 T 及其子类
public static void addNumbers(List<? super Integer> list) {
  list.add(42);
}
```

**`<T extends Bound>`** 让编译器知道 T 上有哪些方法可用。

---

## ⭐ 通配符与 PECS — 深入

**PECS：Producer Extends, Consumer Super**

```java
// 从 src **读**（Producer）→ extends
public static void copy(List<? extends Number> src, List<? super Integer> dest) {
  for (Number n : src) {
    dest.add(n.intValue());  // 若 dest 是 List<Number>，可 add Integer
  }
}

void process(List<? extends User> users) {
  for (User u : users) { /* 只读语义 */ }
  // users.add(new Admin());  // 编译错误
}

void fill(List<? super User> sink) {
  sink.add(new User());      // 可写 User 及子类
  Object o = sink.get(0);    // 读只能当 Object
}
```

### 无界通配符 `?`

```java
public static void printSize(List<?> list) {
  System.out.println(list.size());
}
```

`List<?>` 与 `List<Object>` 不同：后者可 add Object，前者 almost 不能 add。

### 通配符捕获（框架内部）

编译器无法将 `? extends T` 写入时，用「捕获辅助类」：

```java
public static void swap(List<?> list, int i, int j) {
  swapHelper(list, i, j);  // 内部 <T> void swapHelper(List<T> list, ...)
}
```

`Collections.swap` 即此模式 — 业务代码少见，懂即可。

---

## ⭐ 泛型与继承规则

```java
// ❌ 不合法 — 逆变/协变在 Java 泛型中受限
// ArrayList<Number> nums = new ArrayList<Integer>();

// ✅ 合法
List<? extends Number> nums = new ArrayList<Integer>();
Number n = nums.get(0);

// ❌ nums.add(1);  // 不能 add Integer，编译器不知实际 List 元素类型
```

| 关系 | 是否成立 |
|------|----------|
| `ArrayList<Integer>` is-a `List<Integer>` | ✅ |
| `List<Integer>` is-a `List<Number>` | ❌ |
| `List<Integer>` is-a `List<? extends Number>` | ✅ |

**数组是协变的（危险）：**

```java
Number[] nums = new Integer[10];  // 合法
nums[0] = 1.5;  // 运行时 ArrayStoreException
```

所以 **不能** `new List<String>[10]`，用 `List<List<String>>`。

---

## ⭐ 类型擦除

编译后泛型信息被擦除（保留 Signature 属性供反射）：

```java
// 源码
class Box<T> { T value; }
// 擦除后近似
class Box { Object value; }  // <T extends Number> → Number
```

### 擦除带来的限制

```java
// T[] arr = new T[10];           // ❌
// if (obj instanceof T)          // ❌
// new T()                         // ❌ 除非 Supplier<T> 工厂

// 不能 catch T
// try { } catch (T ex) { }       // ❌

// 静态字段不能是类类型参数 T
// static T defaultValue;         // ❌
```

### 桥接方法（Bridge Methods）

```java
class Node<T> {
  public T getData() { return data; }
}
class StringNode extends Node<String> {
  public String getData() { return data; }
  // 编译器生成 synthetic: public Object getData() { return getData(); }
}
```

保证多态在擦除后仍正确。

---

## ⭐ 反射读取泛型

```java
public class UserService extends BaseService<User> { }

Type superClass = UserService.class.getGenericSuperclass();
if (superClass instanceof ParameterizedType pt) {
  Type arg = pt.getActualTypeArguments()[0];  // User.class
}
```

| 框架 | 用途 |
|------|------|
| Jackson | `TypeReference<List<User>>` |
| MyBatis | 解析 `Mapper<T>` 实体类型 |
| Spring | `ResolvableType` 解析泛型 Bean |

```java
// Jackson
List<User> users = mapper.readValue(json, new TypeReference<List<User>>() {});

// Spring
ResolvableType type = ResolvableType.forClass(UserService.class);
Class<?> entityClass = type.getSuperType().getGeneric(0).resolve();
```

---

## ⭐ Type Token 模式

擦除后运行时要知道 `T` 的具体 Class，常见模式：

```java
public abstract class TypeReference<T> {
  private final Type type;

  protected TypeReference() {
    Type superClass = getClass().getGenericSuperclass();
    type = ((ParameterizedType) superClass).getActualTypeArguments()[0];
  }

  public Type getType() { return type; }
}
```

匿名子类 `new TypeReference<List<User>>() {}` 保留泛型参数。

---

## 📌 企业泛型模式

### 统一 API 响应

```java
public record ApiResponse<T>(int code, String message, T data) {
  public static <T> ApiResponse<T> ok(T data) {
    return new ApiResponse<>(0, "success", data);
  }
}
```

### 分页

```java
public record PageResult<T>(List<T> records, long total, int page, int size) {}
```

### Repository

```java
public interface JpaRepository<T, ID extends Serializable> {
  Optional<T> findById(ID id);
  List<T> findAll();
}
```

### 事件

```java
public abstract class DomainEvent<T> {
  private final T payload;
}
```

---

## 📌 原始类型与迁移

```java
@SuppressWarnings("unchecked")
List<String> list = (List<String>) legacyRawList();
```

**策略：** 在边界层一次转换，内部全用泛型；逐步替换老 API。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| raw type | 编译警告 → 运行时 CCE |
| `? extends` 里 add | 编译器禁止 |
| 泛型数组 | `List<String>[]` 非法 |
| instanceof 泛型 | `list instanceof List<String>` 非法 |
| 过度通配符 | 签名难读；能具体就具体 |
| 双重泛型推断失败 | 显式类型参数 `Collections.<String>emptyList()` |

---

## 本章小结

- 泛型 = 编译期类型安全；擦除理解 API 限制
- **PECS** 是读写的口诀；继承规则记住「不变性」
- 反射 + TypeReference 补运行时类型信息 — 框架必备

---

## 下一步

- [第 9 章：集合](./09-collections)

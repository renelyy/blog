# 第 3 章：基本程序结构

[← 卷 I 目录](../index)

> 原书 Chapter 3 — Fundamental Programming Structures in Java

---

## ⭐ 八种基本类型

| 类型 | 大小 | 取值范围（约） | 默认值 | 包装类 |
|------|------|----------------|--------|--------|
| `byte` | 1 字节 | -128 ~ 127 | 0 | `Byte` |
| `short` | 2 | ±3.2万 | 0 | `Short` |
| `int` | 4 | ±21亿 | 0 | `Integer` |
| `long` | 8 | 很大 | 0L | `Long` |
| `float` | 4 | IEEE 754 | 0.0f | `Float` |
| `double` | 8 | IEEE 754 | 0.0d | `Double` |
| `char` | 2 | Unicode 码点 | `\u0000` | `Character` |
| `boolean` | JVM 相关 | true/false | false | `Boolean` |

```java
long big = 1_000_000_000L;      // 数字分隔符，提高可读性
int hex = 0xFF;                 // 十六进制
int bin = 0b1010;               // 二进制（Java 7+）
double scientific = 1.2e-3;
```

**企业注意：** 金额、汇率用 `BigDecimal`；计数超大用 `long`；不要用 `float` 做精确计算。

---

## ⭐ 变量与 `var`

```java
int count = 0;                    // 显式类型
var list = new ArrayList<String>(); // Java 10+，右边能推断才用 var
// var x;                        // 编译错误：无法推断
```

`var` 适用：泛型右侧类型很长、局部临时变量。**禁止**用于字段、方法参数、返回值（可读性）。

---

## ⭐ 运算符

| 类别 | 示例 |
|------|------|
| 算术 | `+ - * / %` |
| 自增 | `++i`, `i++`（后缀先取值再增） |
| 关系 | `== != < > <= >=` |
| 逻辑 | `&& \|\| !`（短路） |
| 位运算 | `& \| ^ ~ << >> >>>` |
| 三元 | `condition ? a : b` |
| 赋值 | `= += -=` |

**引用相等 vs 值相等：**

```java
String a = new String("hi");
String b = new String("hi");
a == b;           // false，比较引用
a.equals(b);      // true，比较内容
```

---

## ⭐ 字符串 `String`

- **不可变**：任何「修改」都产生新对象
- **字符串常量池**：字面量 `"hello"` 可能复用
- **`intern()`**：将堆中字符串放入常量池（慎用，JDK 7+ 池在堆）

```java
String s1 = "Hello";
String s2 = s1.substring(0, 3);  // "Hel"，新对象

// 拼接
String joined = String.join(", ", "a", "b", "c");
String formatted = String.format("user=%s, id=%d", name, id);
```

### 常用 API（企业高频）

```java
s.isBlank();                    // Java 11+
s.strip();                      // 去空白（Unicode 感知）
s.lines();                      // 按行 Stream
"abc".repeat(3);                // "abcabcabc"
path.startsWith("/api/");
path.contains("error");
```

### 大量拼接

```java
// 错误：循环里 + 产生大量中间 String
String bad = "";
for (int i = 0; i < 10000; i++) bad += i;

// 正确
StringBuilder sb = new StringBuilder(1024);
for (int i = 0; i < 10000; i++) sb.append(i);
String good = sb.toString();
```

单线程用 `StringBuilder`；需要同步才用 `StringBuffer`（少见）。

### 文本块（Java 15+）

```java
String sql = """
    SELECT id, name, status
    FROM users
    WHERE status = 'ACTIVE'
      AND dept_id = ?
    """;
```

MyBatis XML 仍用独立文件；文本块适合测试数据、内联 JSON/SQL 片段。

---

## ⭐ 数组

```java
int[] nums = new int[10];           // 默认 0
int[] primes = { 2, 3, 5, 7 };
int[][] matrix = { {1, 2}, {3, 4} };

// 增强 for
for (int n : nums) { /* ... */ }

// 与 List 转换
List<String> list = Arrays.asList("a", "b");  // 固定大小，不能 add/remove
List<String> mutable = new ArrayList<>(List.of("a", "b"));
String[] arr = list.toArray(String[]::new);
```

### `Arrays` 工具

```java
Arrays.sort(nums);
int idx = Arrays.binarySearch(nums, 5);  // 需已排序
Arrays.fill(nums, 0);
Arrays.copyOf(nums, nums.length * 2);
Arrays.equals(a, b);
Arrays.deepEquals(matrix1, matrix2);
```

---

## ⭐ 控制流

### if / while / for

```java
for (int i = 0; i < n; i++) { }
for (var item : collection) { }

int i = 0;
while (i < n) { i++; }

do { /* 至少执行一次 */ } while (condition);
```

### switch 表达式（Java 14+）

```java
enum Day { MON, TUE, WED, THU, FRI, SAT, SUN }

String dayType = switch (day) {
  case MON, TUE, WED, THU, FRI -> "work";
  case SAT, SUN -> "rest";
};

int numLetters = switch (day) {
  case MON, FRI, SUN -> 6;
  case TUE -> 7;
  case WED, THU, SAT -> 8;
  default -> throw new IllegalArgumentException("Unknown: " + day);
};
```

**企业用法：** 枚举状态机、错误码映射；复杂分支仍可用 if 或策略模式。

### break / continue / 标签

```java
outer:
for (int i = 0; i < 10; i++) {
  for (int j = 0; j < 10; j++) {
    if (i * j > 50) break outer;
  }
}
```

---

## 📌 大数 `BigInteger` / `BigDecimal`

```java
// 整数任意精度
BigInteger n = new BigInteger("999999999999999999999");

// 精确小数 — 金融必用
BigDecimal price = new BigDecimal("19.99");
BigDecimal qty = new BigDecimal("3");
BigDecimal total = price.multiply(qty);   // 59.97

// 禁止：new BigDecimal(19.99) — double 二进制误差
BigDecimal bad = new BigDecimal(19.99);   // 实际可能是 19.989999...

// 舍入
total.setScale(2, RoundingMode.HALF_UP);
```

ORM 映射金额字段常用 `BigDecimal` + `DECIMAL(19,4)`。

---

## 📌 输入输出（控制台）

```java
Scanner in = new Scanner(System.in, StandardCharsets.UTF_8);
System.out.print("Name: ");
String name = in.nextLine();
```

Web 项目从 **HTTP 请求体** 读 JSON；CLI 工具、批处理脚本才用 Scanner。

---

## 📌 随机数

```java
Random rnd = new Random();              // 非加密
int n = rnd.nextInt(100);               // [0, 100)

SecureRandom sr = new SecureRandom();   // 令牌、验证码、密钥
byte[] token = new byte[32];
sr.nextBytes(token);
```

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| `double` 算钱 | 用 `BigDecimal` |
| `==` 比较 String | 用 `equals`，忽略大小写用 `equalsIgnoreCase` |
| `Arrays.asList` 当可变 List | 返回固定大小，增删抛异常 |
| 整数除法 | `5 / 2 == 2`，要 `5 / 2.0` 或 `5.0 / 2` |
| 未初始化局部变量 | 编译器报错；字段有默认值 |

---

## 本章小结

- 掌握基本类型、String、数组、控制流 — 所有业务代码的基础
- String 不可变；循环拼接用 StringBuilder
- 金额用 BigDecimal；switch 表达式简化枚举分支

---

## 下一步

- [第 4 章：对象与类](./04-objects-classes)

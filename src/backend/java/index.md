# Java

## Java 教程

### Java StringBuffer 和 StringBuilder

核心区别就在于**线程安全性**。

#### 核心总结

| 特性         | StringBuffer              | StringBuilder                |
| :----------- | :------------------------ | :--------------------------- |
| **线程安全** | **是** (同步的，线程安全) | **否** (不同步，线程不安全)  |
| **性能**     | **较低** (因为同步的开销) | **较高** (通常快 10%-15%)    |
| **版本**     | Java 1.0                  | Java 1.5                     |
| **使用场景** | 多线程环境，共享变量      | 单线程环境，或方法内局部变量 |

---

#### 详细解析

##### 1. 线程安全性 (Thread Safety)

这是两者最根本、最重要的区别。

- **StringBuffer**： 是**线程安全**的。它的所有公开方法（如 `append()`, `insert()`, `delete()`）都使用了 **`synchronized`** 关键字进行修饰。这意味着多个线程在同一时间无法同时调用一个 StringBuffer 实例的这些方法，从而保证了数据的一致性，避免了竞态条件。

  ```java
  // StringBuffer 源码片段 (简化)
  @Override
  public synchronized StringBuffer append(String str) {
      toStringCache = null;
      super.append(str);
      return this;
  }
  ```

- **StringBuilder**： 是**线程不安全**的。它的方法**没有**使用 `synchronized` 修饰。因此，在多线程环境下同时操作同一个 StringBuilder 实例会导致不可预知的结果。但它也因此避免了同步带来的性能开销。
  ```java
  // StringBuilder 源码片段 (简化)
  @Override
  public StringBuilder append(String str) {
      super.append(str);
      return this;
  }
  ```

##### 2. 性能 (Performance)

由于 `StringBuffer` 的方法需要进行同步检查，而 `StringBuilder` 不需要，所以在**单线程环境**下，`StringBuilder` 的性能**显著高于** `StringBuffer`。

在大多数操作中，`StringBuilder` 的性能提升大约在 **10% 到 15%** 之间。虽然这个数字看起来不大，但在执行大量字符串拼接操作（如循环体内）时，性能差距会变得非常明显。

##### 3. 版本和历史 (Version)

- **StringBuffer** 从 Java 1.0 开始就存在了。
- **StringBuilder** 是在 Java **1.5** 版本中才被引入的。Sun 公司发现大部分字符串操作都是在单线程环境下进行的（例如方法内的局部变量），为这些场景专门设计一个非线程安全的类可以大幅提升性能。

---

#### 如何选择？

遵循一个非常简单直接的原则：

1.  **如果你的操作是在单线程下进行的，或者该对象不会被多个线程共享（例如，作为方法内的局部变量），那么请毫不犹豫地使用 `StringBuilder`。** 这是目前**绝大多数**的情况，也是默认的最佳选择。

2.  **只有在你的对象会被多个线程同时访问和修改时，才使用 `StringBuffer`。** 但这种场景在现代 Java 开发中相对较少，因为开发者更倾向于使用其他更现代的同步机制来控制并发访问，而不是依赖一个重量级的同步类。

#### 代码示例

**单线程环境示例 (推荐使用 StringBuilder)：**

```java
public class SingleThreadExample {
    public static void main(String[] args) {
        // 方法内局部变量 - 单线程，绝对安全
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < 10000; i++) {
            sb.append("hello"); // 性能更高
        }
        System.out.println(sb.length());
    }
}
```

**多线程环境示例 (必须使用 StringBuffer 或其他同步手段)：**

```java
public class MultiThreadExample {
    // 共享变量
    private static StringBuffer sharedBuffer = new StringBuffer();

    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(() -> {
            for (int i = 0; i < 1000; i++) {
                sharedBuffer.append("A");
            }
        });

        Thread t2 = new Thread(() -> {
            for (int i = 0; i < 1000; i++) {
                sharedBuffer.append("B");
            }
        });

        t1.start();
        t2.start();
        t1.join();
        t2.join();

        // 使用 StringBuffer 结果是稳定的 2000
        // 如果使用 StringBuilder，结果可能小于 2000，且每次运行可能不同
        System.out.println("Length: " + sharedBuffer.length());
    }
}
```

**注意**：即使在多线程环境下，如果每个线程都使用自己独立的 `StringBuilder` 实例（即不共享），那么使用 `StringBuilder` 也是完全安全且更高效的。

#### 共同点

- 都继承自 `AbstractStringBuilder` 类。
- 都是**可变的**（mutable）字符序列，这意味着它们可以在原地修改内容（追加、插入、删除等），而不会像 `String` 那样产生大量临时对象。
- 它们的 API 几乎完全一样，都提供了 `append()`, `insert()`, `delete()`, `reverse()` 等方法。这意味着它们在实际代码中可以很容易地互相替换（但要注意线程安全）。
  ![方法](image.png)

#### 结论

**在现代 Java 开发中，`StringBuilder` 是默认的首选，除非你有明确的、必须要求线程安全的理由。** 编译器在处理字符串拼接操作 `+` 时，在底层默认使用的也是 `StringBuilder`（在循环体内尤其要注意，手动创建 `StringBuilder` 通常性能更好）。

### Java 异常处理

#### 异常发生的原因

1. **用户输入错误**：例如，用户输入了无效的日期格式。
2. **运行时错误**：例如，除以零。
3. **外部资源错误**：例如，网络连接失败或文件不存在。

#### 异常的分类

Java 异常分为两大类：**检查型异常（Checked Exceptions）** 和 **运行时异常（Runtime Exceptions）**。

1. **检查型异常（Checked Exceptions）**：这些异常在编译时被检查，必须被显式捕获或声明抛出。常见的检查型异常包括 `IOException`, `SQLException`, `ClassNotFoundException` 等。
2. **运行时异常（Runtime Exceptions）**：这些异常在运行时发生，不需要显式捕获或声明抛出。常见的运行时异常包括 `NullPointerException`, `ArrayIndexOutOfBoundsException`, `ArithmeticException` 等。

#### 异常处理的关键字

Java 提供以下关键字来处理异常：

1. **try**：用于包裹可能抛出异常的代码块。
2. **catch**：用于捕获并处理特定的异常类型。
3. **finally**：用于执行无论是否发生异常都要执行的代码块。
4. **throw**：用于手动抛出一个异常。
5. **throws**：用于声明一个方法可能抛出的异常。

#### Exception 类的层次

![alt text](image-1.png)

#### Java 内置的异常类

1. 非检查型异常（Runtime Exceptions）
   - `NullPointerException` **空指针异常**：当应用程序试图在需要对象的地方使用 null 时，抛出该异常
   - `ArrayIndexOutOfBoundsException` **数组越界异常**：当应用程序试图访问数组中不存在的索引时，抛出该异常
   - `ArithmeticException` **算术异常**：当应用程序执行除以零等非法运算时，抛出该异常
   - `ClassCastException` **类型转换异常**：当应用程序试图将对象转换为不兼容的类型时，抛出该异常
   - `IllegalArgumentException` **非法参数异常**：当应用程序使用非法或不适当的参数调用方法时，抛出该异常
   - `IllegalStateException` **非法状态异常**：当应用程序试图在对象处于非法或不适当的状态下调用方法时，抛出该异常
   - `NumberFormatException` **数字格式异常**：当应用程序试图将字符串转换为数字，但字符串的格式不正确时，抛出该异常
   - `IndexOutOfBoundsException` **索引越界异常**：当应用程序试图访问数组或集合中不存在的索引时，抛出该异常
   - `ConcurrentModificationException` **并发修改异常**：当应用程序试图在迭代过程中修改集合时，抛出该异常
   - `UnsupportedOperationException` **不支持的操作异常**：当应用程序试图调用不支持的操作时，抛出该异常
2. 检查型异常（Checked Exceptions）
   - `IOException` **输入输出异常**：当应用程序试图进行输入/输出操作时，抛出该异常
   - `SQLException` **SQL 异常**：当应用程序试图执行 SQL 操作时，抛出该异常
   - `ClassNotFoundException` **类未找到异常**：当应用程序试图加载类但找不到该类时，抛出该异常
   - `FileNotFoundException` **文件未找到异常**：当应用程序试图打开文件但找不到该文件时，抛出该异常
   - `EOFException` **文件结束异常**：当应用程序试图读取文件但到达文件末尾时，抛出该异常
   - `InterruptedIOException` **中断输入输出异常**：当应用程序试图进行输入/输出操作但被中断时，抛出该异常
   - `SocketException` **套接字异常**：当应用程序试图使用套接字进行网络通信时，抛出该异常
   - `NoSuchElementException` **没有这样的元素异常**：当应用程序试图从迭代器或枚举中获取元素但找不到时，抛出该异常
   - `NoSuchMethodException` **没有这样的方法异常**：当应用程序试图调用类中不存在的方法时，抛出该异常
   - `NoSuchFieldException` **没有这样的字段异常**：当应用程序试图访问类中不存在的字段时，抛出该异常
   - `IllegalAccessException` **非法访问异常**：当应用程序试图访问类的私有成员时，抛出该异常
   - `InstantiationException` **实例化异常**：当应用程序试图实例化抽象类或接口时，抛出该异常
   - `InvocationTargetException` **调用目标异常**：当应用程序试图调用方法但目标方法抛出异常时，抛出该异常

#### 异常方法

- `public String getMessage()`: 返回异常的详细消息字符串。
- `public Throwable getCause()`: 返回导致此异常的底层原因（如果有的话）。
- `public String toString()`: 返回异常的简短描述。
- `public StackTraceElement[] getStackTrace()`: 返回异常的堆栈跟踪。
- `public void printStackTrace()`: 打印异常的堆栈跟踪到标准错误流。
- `public Throwable fillStackTrace()`: 填充堆栈跟踪信息。

#### 多重异常捕获

```java
try {
   // 程序代码
} catch (异常类型1 异常的变量名1){
  // 程序代码
} catch (异常类型2 异常的变量名2){
  // 程序代码
} catch (异常类型3 异常的变量名3){
  // 程序代码
}
```

#### 多异常合并捕获

java 7 引入了多异常捕获，允许在单个 catch 块中捕获多个异常类型。这可以简化代码并提高可读性。例如：

```java
try {
    // 可能抛出异常的代码
} catch (IOException | SQLException e) {
    // 处理 IOException 或 SQLException
} catch (Exception e) {
    // 处理其他异常
}
```

#### try-with-resources

Java 7 引入了 try-with-resources 语句，它是一种特殊的 try 语句，用于自动关闭实现了 `AutoCloseable` 接口的资源。例如：

```java
try (BufferedReader br = new BufferedReader(new FileReader("file.txt"))) {
    String line;
    while ((line = br.readLine()) != null) {
        System.out.println(line);
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

try-with-resources 处理多个资源，只需在括号中用分号分隔它们

#### 自定义异常

你可以通过继承 `Exception` 或其子类来创建自定义异常。例如：

```java
public class CustomException extends Exception {
    public CustomException(String message) {
        super(message);
    }
}
```

## Java 面向对象

### Java 继承

### Java Override/Overload

### Java 多态

### Java 抽象类

### Java 封装

### Java 接口

### Java 枚举

### Java 包(package)

### Java 反射

## Java 高级教程

### Java 数据结构

### Java 集合框架

### Java ArrayList

### Java LinkedList

### Java HashSet

### Java HashMap

### Java Iterator

### Java Object

### Java NIO Files

### Java 泛型

### Java 序列化

### Java 网络编程

### Java 发送邮件

### Java 多线程编程

### Java Applet 基础

### Java 文档注释

### Java8 新特性

### Java MySQL 连接

### Jav9 新特性

### Java 测验

### Java 常用类库

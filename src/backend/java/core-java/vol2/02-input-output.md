# 第 2 章：输入与输出

[← 卷 II 目录](../index)

> 原书 Chapter 2 — Input and Output

---

## ⭐ 流体系

```text
字节流                          字符流（指定 Charset）
InputStream / OutputStream      Reader / Writer
```

| 类 | 用途 |
|----|------|
| `InputStream` / `OutputStream` | 二进制、图片、网络 raw |
| `Reader` / `Writer` | 文本 UTF-8 |
| `DataInputStream` | 读 int、double 等原始类型 |
| `ObjectInputStream` | Java 序列化（慎用） |
| `BufferedInputStream` | 减少系统调用 |

```java
try (InputStream in = new FileInputStream("data.bin")) {
  byte[] buf = new byte[8192];
  int n;
  while ((n = in.read(buf)) != -1) {
    process(buf, 0, n);
  }
}
```

**缓冲：** 几乎总是包一层 `BufferedInputStream` / `BufferedReader`。

---

## ⭐ 字符集 Charset

```java
Charset utf8 = StandardCharsets.UTF_8;
byte[] bytes = "中文".getBytes(utf8);
String text = new String(bytes, utf8);

try (Reader reader = Files.newBufferedReader(path, utf8)) {
  // ...
}
```

**企业规范：** 全链路 UTF-8；禁止默认平台编码 `new String(bytes)`。

---

## ⭐ NIO.2 `Path` / `Files`（推荐）

```java
Path config = Path.of("config", "app.yml");
Path abs = config.toAbsolutePath().normalize();

String content = Files.readString(config, StandardCharsets.UTF_8);
Files.writeString(config, content, StandardCharsets.UTF_8,
    StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

List<String> lines = Files.readAllLines(config, StandardCharsets.UTF_8);
Files.copy(src, dst, StandardCopyOption.REPLACE_EXISTING);
Files.move(oldPath, newPath);
Files.deleteIfExists(path);

try (Stream<Path> walk = Files.walk(Path.of("logs"))) {
  walk.filter(Files::isRegularFile)
      .filter(p -> p.toString().endsWith(".log"))
      .forEach(this::archive);
}
```

Spring Boot 读 `application.yml`、日志归档、Excel/CSV 导入导出都基于 `Path`/`Files`。

---

## ⭐ `FileChannel` 与 NIO Buffer

```java
try (FileChannel channel = FileChannel.open(path,
    StandardOpenOption.READ)) {
  MappedByteBuffer buffer = channel.map(
      FileChannel.MapMode.READ_ONLY, 0, channel.size());
  // 大文件随机读、内存映射
}
```

适合：大日志分析、离线批处理；注意 MappedByteBuffer 释放与平台差异。

---

## ⭐ 对象序列化

```java
public class SessionToken implements Serializable {
  private static final long serialVersionUID = 1L;
  private String userId;
  private transient String sensitive;  // 不序列化
}

try (ObjectOutputStream oos = new ObjectOutputStream(
    Files.newOutputStream(path))) {
  oos.writeObject(token);
}
```

**企业注意：**

- Redis / Kafka / HTTP **优先 JSON**（Jackson）
- Java 序列化有**安全漏洞**（反序列化 RCE），禁止接收不可信字节流
- `serialVersionUID` 变更会导致反序列化失败

---

## 📌 `Properties` 配置文件

```java
Properties props = new Properties();
try (InputStream in = Files.newInputStream(path)) {
  props.load(in);
}
String url = props.getProperty("db.url");
```

`.properties` 仍见于老系统；新配置用 YAML + `@ConfigurationProperties`。

---

## 📌 标准输入输出

```java
System.out.println("info");
System.err.println("error");

Console console = System.console();
if (console != null) {
  char[] pwd = console.readPassword("Password: ");
}
```

---

## 📌 正则 `Pattern` / `Matcher`

```java
Pattern date = Pattern.compile("(\\d{4})-(\\d{2})-(\\d{2})");
Matcher m = date.matcher("订单日期 2024-06-30");
while (m.find()) {
  String year = m.group(1);
}

boolean ok = date.matcher(input).matches();
String replaced = date.matcher(input).replaceAll("$1/$2/$3");
```

**ReDoS：** 用户输入作正则源时避免 catastrophic backtracking；校验用简单规则或库。

---

## 📌 WatchService（目录监听）

```java
WatchService watcher = FileSystems.getDefault().newWatchService();
dir.register(watcher, StandardWatchEventKinds.ENTRY_MODIFY);
WatchKey key = watcher.take();
```

热加载配置、日志采集边缘场景。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 未 close 流 | try-with-resources |
| 平台默认编码 | 显式 UTF-8 |
| 大文件 readAllBytes | OOM；用流式读 |
| ObjectInputStream 外部数据 | RCE 风险 |
| 路径拼接字符串 | 用 `Path.resolve` |

---

## 本章小结

- 文本用 Reader/Writer + UTF-8；二进制用 Stream
- 日常文件操作用 `Files` / `Path`
- 序列化让位于 JSON；正则注意 ReDoS

---

## 下一步

- [第 3 章：XML](./03-xml)

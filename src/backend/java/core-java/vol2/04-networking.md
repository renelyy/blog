# 第 4 章：网络编程

[← 卷 II 目录](../index)

> 原书 Chapter 4 — Networking

---

## ⭐ 网络分层（后端视角）

```text
应用层    HTTP / HTTPS / gRPC
传输层    TCP（可靠、有序） / UDP（快、无保证）
网络层    IP
```

企业后端 **99% 是 HTTP/HTTPS REST**；消息队列、数据库各自协议；手写 Socket 极少。

---

## ⭐ IP 与 `InetAddress`

```java
InetAddress addr = InetAddress.getByName("api.example.com");
String host = addr.getHostName();
String ip = addr.getHostAddress();

InetAddress local = InetAddress.getLocalHost();
```

DNS 解析超时、缓存由 JVM/OS 控制；生产用域名 + 负载均衡，少硬编码 IP。

---

## 📌 Socket（TCP 了解）

```java
try (Socket socket = new Socket("example.com", 80);
     PrintWriter out = new PrintWriter(
         new OutputStreamWriter(socket.getOutputStream(), StandardCharsets.UTF_8), true);
     BufferedReader in = new BufferedReader(
         new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8))) {

  out.print("GET / HTTP/1.1\r\nHost: example.com\r\nConnection: close\r\n\r\n");
  in.lines().limit(20).forEach(System.out::println);
}
```

**ServerSocket** 监听端口、accept 连接 — 嵌入式、游戏、中间件底层；业务用 Tomcat/Netty。

```java
try (ServerSocket server = new ServerSocket(8080)) {
  while (true) {
    Socket client = server.accept();
    // 通常交给线程池处理
  }
}
```

---

## ⭐ HTTP Client（Java 11+，标准库）

```java
HttpClient client = HttpClient.newBuilder()
    .connectTimeout(Duration.ofSeconds(10))
    .followRedirects(HttpClient.Redirect.NORMAL)
    .version(HttpClient.Version.HTTP_2)
    .build();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/users/1"))
    .timeout(Duration.ofSeconds(30))
    .header("Accept", "application/json")
    .header("Authorization", "Bearer " + token)
    .GET()
    .build();

HttpResponse<String> response = client.send(request,
    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

if (response.statusCode() == 200) {
  String json = response.body();
}
```

### 异步请求

```java
client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
    .thenApply(HttpResponse::body)
    .thenAccept(body -> process(body))
    .exceptionally(ex -> { log.error("http fail", ex); return null; });
```

### POST JSON

```java
String json = "{\"name\":\"Tom\"}";
HttpRequest post = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/users"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(json))
    .build();
```

---

## 📌 Spring 中的 HTTP 客户端

| 组件 | 说明 |
|------|------|
| **RestTemplate** | 同步，经典 |
| **WebClient** | 响应式，Boot 3 推荐 |
| **OpenFeign** | 声明式接口 + 注解 |
| **HttpClient** | 工具类、无 Spring 场景 |

```java
// WebClient 示例
WebClient client = WebClient.create("https://api.example.com");
User user = client.get()
    .uri("/users/{id}", 1L)
    .retrieve()
    .bodyToMono(User.class)
    .block();
```

见 [OpenFeign](../../../spring/cloud/05-feign-loadbalancer)、[Gateway](../../../spring/cloud/04-gateway)。

---

## 📌 URI / URL

```java
URI uri = URI.create("https://api.example.com:443/v1/users?page=1");
String scheme = uri.getScheme();
String host = uri.getHost();
String path = uri.getPath();
String query = uri.getQuery();

URI resolved = baseUri.resolve("users/1");
```

`URL` 类遗留 API；新代码用 `URI` + `HttpClient`。

---

## 📌 HTTPS 与 TLS

- `HttpClient` 默认校验证书
- 自签证书需自定义 `SSLContext`（**仅限开发**）
- 生产：正规 CA、证书轮换、mTLS 双向认证（Feign + KeyStore）

---

## 📌 UDP（了解）

```java
DatagramSocket socket = new DatagramSocket();
byte[] buf = "ping".getBytes(StandardCharsets.UTF_8);
DatagramPacket packet = new DatagramPacket(buf, buf.length,
    InetAddress.getByName("host"), 9999);
socket.send(packet);
```

日志采集、DNS、游戏；业务系统少见。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 无超时 | connect/read 超时必设 |
| 连接不复用 | HttpClient 应单例复用 |
| 硬编码 URL | 配置中心 / 环境变量 |
| HTTP 200 即成功 | 还要校验 body 业务码 |
| 同步阻塞高并发 | WebClient / 虚拟线程 |

---

## 本章小结

- 理解 TCP/HTTP 即可；实现用 HttpClient 或 Spring 封装
- 超时、重试、熔断在框架层配置（Feign、Resilience4j）
- Socket 懂原理，少手写

---

## 下一步

- [第 5 章：JDBC](./05-jdbc)

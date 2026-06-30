# Web 与 REST

[← Boot 首页](./index)

> Boot 层 Web 开发要点：JSON、文件上传、拦截器、OpenAPI。

---

## ⭐ 依赖

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

默认 JSON：**Jackson**；可换 Gson / JSON-B。

---

## ⭐ REST 约定

```java
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {
  private final OrderService orderService;

  @GetMapping("/{id}")
  public OrderDto get(@PathVariable Long id) {
    return orderService.getById(id);
  }

  @PostMapping
  public ResponseEntity<OrderDto> create(@Valid @RequestBody CreateOrderRequest req) {
    OrderDto created = orderService.create(req);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) {
    orderService.delete(id);
  }
}
```

---

## 📌 统一响应包装（可选）

```java
public record ApiResult<T>(int code, String message, T data) {
  public static <T> ApiResult<T> ok(T data) {
    return new ApiResult<>(0, "success", data);
  }
}
```

配合 `@RestControllerAdvice` 统一异常 → `ApiResult.fail(...)`。

---

## 📌 拦截器 vs 过滤器

| 机制 | 层次 | 用途 |
|------|------|------|
| Filter | Servlet | 编码、CORS、链路 ID |
| HandlerInterceptor | Spring MVC | 登录校验、日志 |

```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(new AuthInterceptor()).addPathPatterns("/api/**");
  }
}
```

---

## 📌 文件上传

```yaml
spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 20MB
```

```java
@PostMapping("/upload")
public String upload(@RequestParam("file") MultipartFile file) throws IOException {
  file.transferTo(Path.of("/tmp", file.getOriginalFilename()));
  return "ok";
}
```

---

## 📌 SpringDoc OpenAPI（Swagger UI）

```xml
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
  <version>2.6.0</version>
</dependency>
```

访问 `/swagger-ui.html` 或 `/swagger-ui/index.html`

---

## 下一步

- [数据访问](./05-data-access)
- [Framework MVC](../framework/03-mvc-web)

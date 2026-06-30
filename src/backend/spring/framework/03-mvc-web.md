# Spring MVC 与 Web

[← Framework 首页](./index)

> **本节你将学到：** DispatcherServlet 流程、Controller、REST、参数绑定与响应。

---

## ⭐ DispatcherServlet 请求流程

```text
HTTP 请求
  → DispatcherServlet
  → HandlerMapping（找哪个 Controller 方法）
  → HandlerAdapter（执行方法）
  → Controller 返回 ModelAndView / 数据
  → ViewResolver（视图）或 MessageConverter（JSON）
  → HTTP 响应
```

Boot 内嵌 Tomcat 时，默认 `DispatcherServlet` 映射 `/`。

---

## ⭐ @Controller 与 @RestController

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping("/{id}")
  public User getById(@PathVariable Long id) {
    return userService.findById(id);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public User create(@Valid @RequestBody UserCreateRequest req) {
    return userService.create(req);
  }
}
```

| 注解 | 说明 |
|------|------|
| `@RestController` | `@Controller` + `@ResponseBody`（返回值直接写 body） |
| `@RequestMapping` | 类/方法路径、Method、Content-Type |
| `@GetMapping` 等 | `@RequestMapping(method=GET)` 简写 |

---

## ⭐ 参数绑定

| 注解 | 来源 |
|------|------|
| `@PathVariable` | URI 路径 `/users/{id}` |
| `@RequestParam` | Query `?page=1` |
| `@RequestBody` | JSON Body（需 Jackson） |
| `@RequestHeader` | 请求头 |
| `@CookieValue` | Cookie |
| `@ModelAttribute` | 表单字段绑定对象 |

```java
@GetMapping
public Page<User> list(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size) {
  return userService.page(page, size);
}
```

---

## 📌 校验（Bean Validation）

```java
public record UserCreateRequest(
    @NotBlank String username,
    @Email String email,
    @Size(min = 8) String password
) { }
```

```java
@PostMapping
public User create(@Valid @RequestBody UserCreateRequest req) { }
```

需 `spring-boot-starter-validation`；校验失败默认 400 + 错误详情（可 `@ControllerAdvice` 统一格式）。

---

## 📌 全局异常处理

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ResourceNotFoundException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public ApiError handleNotFound(ResourceNotFoundException ex) {
    return new ApiError(404, ex.getMessage());
  }
}
```

---

## 📌 静态资源与 CORS

Boot 默认静态资源：`/static`、`/public`、`/resources`、`/META-INF/resources`。

CORS：

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**").allowedOrigins("*").allowedMethods("*");
  }
}
```

---

## 📎 WebFlux（了解）

响应式栈：`RouterFunction` / `@RestController` + `Mono`/`Flux`，适合高并发 IO 密集。传统 Servlet MVC 仍是主流业务首选。

---

## 下一步

- [数据访问与事务](./04-data-transaction)
- [Boot Web 与 REST](../boot/04-web-rest)

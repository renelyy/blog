# 分页、错误码与统一响应

[← 返回索引](./index)

> **本节目标：** 统一分页结构、业务错误码、全局异常处理与校验响应格式。

---

## ⭐ 为什么需要统一格式

```text
前端 / 移动端 / 第三方
        ↓
   统一 { code, message, data }
        ↓
   错误码文档、i18n、监控告警
```

**避免：** 每个 Controller 自己拼 Map、有的返回字符串有的返回对象。

---

## ⭐ 统一响应结构

```java
public record ApiResponse<T>(
    int code,
    String message,
    T data,
    String traceId,
    long timestamp
) {
  public static <T> ApiResponse<T> ok(T data) {
    return new ApiResponse<>(0, "success", data, MDC.get("traceId"), System.currentTimeMillis());
  }

  public static <T> ApiResponse<T> fail(int code, String message) {
    return new ApiResponse<>(code, message, null, MDC.get("traceId"), System.currentTimeMillis());
  }
}
```

```json
{
  "code": 0,
  "message": "success",
  "data": { "id": 1001, "status": "PAID" },
  "traceId": "abc123",
  "timestamp": 1705286400123
}
```

| 字段 | 说明 |
|------|------|
| `code` | **业务码**，0 成功 |
| `message` | 可读说明 |
| `data` | 载荷 |
| `traceId` | 链路追踪 — 见 [observability](../observability/01-logging-mdc) |
| `timestamp` | 服务端时间 |

**HTTP 状态码仍要正确** — 不要所有响应都 200 + code≠0（部分团队这样做，需全链路统一）。

---

## ⭐ 分页结构

### 请求

```text
GET /api/orders?page=0&size=20&sort=createdAt,desc
```

| 参数 | 说明 |
|------|------|
| `page` | 页码，**从 0 开始**（Spring Data 惯例）或从 1 — **团队统一** |
| `size` | 每页条数，上限如 100 |
| `sort` | `field,asc|desc` |

### 响应

```java
public record PageResult<T>(
    List<T> content,
    int page,
    int size,
    long totalElements,
    int totalPages,
    boolean first,
    boolean last
) {
  public static <T> PageResult<T> from(Page<T> page) {
    return new PageResult<>(
        page.getContent(),
        page.getNumber(),
        page.getSize(),
        page.getTotalElements(),
        page.getTotalPages(),
        page.isFirst(),
        page.isLast());
  }
}
```

```json
{
  "code": 0,
  "data": {
    "content": [ { "id": 1 }, { "id": 2 } ],
    "page": 0,
    "size": 20,
    "totalElements": 153,
    "totalPages": 8,
    "first": true,
    "last": false
  }
}
```

**深分页：** 大 offset 慢 — 游标 `?afterId=1000&size=20`；见 [索引](../database/02-index-and-explain)。

---

## ⭐ 错误码设计

### 分段

```text
0           成功
10000-19999 通用（参数、鉴权）
20000-29999 用户模块
30000-39999 订单模块
...
```

```java
public enum ErrorCode {
  SUCCESS(0, "success"),
  INVALID_PARAM(10001, "参数无效"),
  UNAUTHORIZED(10002, "未登录"),
  FORBIDDEN(10003, "无权限"),
  ORDER_NOT_FOUND(30001, "订单不存在"),
  INSUFFICIENT_STOCK(30002, "库存不足");

  private final int code;
  private final String defaultMessage;
}
```

| 原则 | 说明 |
|------|------|
| **稳定** | 码值不随文案变 |
| **文档化** | OpenAPI / 错误码表 |
| **可监控** | 按 code 聚合告警 |
| **i18n** | message 用 code 查文案 |

---

## ⭐ 全局异常处理

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(MethodArgumentNotValidException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ApiResponse<Void> handleValidation(MethodArgumentNotValidException ex) {
    String msg = ex.getBindingResult().getFieldErrors().stream()
        .map(e -> e.getField() + ": " + e.getDefaultMessage())
        .collect(Collectors.joining("; "));
    return ApiResponse.fail(ErrorCode.INVALID_PARAM.getCode(), msg);
  }

  @ExceptionHandler(BusinessException.class)
  public ResponseEntity<ApiResponse<Void>> handleBusiness(BusinessException ex) {
    HttpStatus status = switch (ex.getErrorCode()) {
      case ORDER_NOT_FOUND -> HttpStatus.NOT_FOUND;
      case INSUFFICIENT_STOCK -> HttpStatus.CONFLICT;
      default -> HttpStatus.BAD_REQUEST;
    };
    return ResponseEntity.status(status)
        .body(ApiResponse.fail(ex.getErrorCode().getCode(), ex.getMessage()));
  }

  @ExceptionHandler(Exception.class)
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  public ApiResponse<Void> handleUnknown(Exception ex) {
    log.error("unexpected error", ex);
    return ApiResponse.fail(50000, "系统繁忙，请稍后重试");
  }
}
```

**生产：** 500 不返回堆栈；细节写日志 + traceId。

---

## ⭐ 参数校验

```java
public record CreateUserRequest(
    @NotBlank @Size(max = 64) String username,
    @NotBlank @Email String email,
    @Min(18) @Max(120) Integer age
) {}

@PostMapping
public ApiResponse<UserDto> create(@Valid @RequestBody CreateUserRequest req) {
  return ApiResponse.ok(userService.create(req));
}
```

**分组校验：** `@Validated(CreateGroup.class)` — 创建与更新不同规则。

---

## 📌 与 Spring Data 对接

```java
@GetMapping
public ApiResponse<PageResult<OrderDto>> list(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    OrderQuery query) {
  Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
  Page<OrderDto> result = orderService.search(query, pageable);
  return ApiResponse.ok(PageResult.from(result));
}
```

---

## 📌 批量与部分成功

```json
{
  "code": 0,
  "data": {
    "successCount": 8,
    "failCount": 2,
    "failures": [
      { "id": "101", "code": 30002, "message": "库存不足" }
    ]
  }
}
```

批量导入/批量操作 — **不要** 一个失败全 500，除非事务要求全成或全败。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| code 与 HTTP 语义冲突 | 404 资源却返回 200 |
| 错误信息泄露 | SQL、路径进 message |
| 分页无 size 上限 | 一次拉 100 万 |
| 校验消息英文中文混用 | 统一 i18n |
| 吞掉异常 | 全返回「系统错误」无法排查 |

---

## 本章小结

- **ApiResponse** + **PageResult** 团队统一
- 错误码 **分段、稳定、可文档化**
- `@RestControllerAdvice` 集中处理；校验用 Bean Validation

---

## 下一步

- [OpenAPI 与版本管理](./03-openapi-versioning)

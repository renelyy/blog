# 第 7 章：异常、断言与日志

[← 卷 I 目录](../index)

> 原书 Chapter 7 — Exceptions, Assertions, and Logging

---

## ⭐ 异常体系

```text
Throwable
├── Error                    JVM 级，一般不捕获
│   ├── OutOfMemoryError
│   └── StackOverflowError
└── Exception
    ├── RuntimeException     非受检（unchecked）
    │   ├── NullPointerException
    │   ├── IllegalArgumentException
    │   └── IllegalStateException
    └── 其他 Exception       受检（checked）
        ├── IOException
        └── SQLException
```

| 类型 | 谁处理 | 典型 |
|------|--------|------|
| **受检异常** | 调用者必须 catch 或 throws | IO、SQL |
| **非受检异常** | 可不声明 | 编程错误、业务异常 |
| **Error** | 一般不 catch | OOM |

**企业倾向：** Service 层抛 **RuntimeException**（业务异常）；Controller 边界统一转 HTTP 状态码。

---

## ⭐ try-catch-finally

```java
try {
  riskyOperation();
} catch (SpecificException ex) {
  log.warn("可恢复: {}", ex.getMessage());
  recover();
} catch (AnotherException ex) {
  throw new ServiceException("失败", ex);  // 包装保留栈
} finally {
  cleanup();  // 几乎总是执行；勿在 finally return
}
```

### try-with-resources（Java 7+）

```java
try (Connection conn = dataSource.getConnection();
     PreparedStatement ps = conn.prepareStatement(sql)) {
  ps.executeQuery();
}  // 自动 close，抑制异常顺序正确
```

任何实现 `AutoCloseable` 的资源都应用此写法：Connection、Stream、FileChannel。

### 多 catch 与 rethrow

```java
try {
  // ...
} catch (IOException | SQLException ex) {
  throw new DataAccessException("访问失败", ex);
}

// Java 7+ 重新抛出时不丢失类型信息
public void read() throws IOException {
  try {
    // ...
  } catch (IOException ex) {
    log.error("read failed", ex);
    throw ex;
  }
}
```

---

## ⭐ 自定义业务异常

```java
public class BusinessException extends RuntimeException {
  private final int code;

  public BusinessException(int code, String message) {
    super(message);
    this.code = code;
  }

  public int getCode() { return code; }
}

// 使用
if (order.getStatus() != PAID) {
  throw new BusinessException(40001, "订单未支付，无法发货");
}
```

### 全局异常处理（Spring）

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(BusinessException.class)
  public ResponseEntity<ApiError> handle(BusinessException ex) {
    return ResponseEntity.badRequest()
        .body(new ApiError(ex.getCode(), ex.getMessage()));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiError> handleUnknown(Exception ex) {
    log.error("未预期异常", ex);
    return ResponseEntity.internalServerError()
        .body(new ApiError(50000, "系统繁忙"));
  }
}
```

---

## 📌 异常最佳实践（原书 + 企业）

| 建议 | 说明 |
|------|------|
| 只捕获能处理的 | 否则包装后向上抛 |
| 具体异常优先 | 避免裸 `catch (Exception e)` 吞掉细节 |
| 日志带上下文 | `orderId`、`userId`、traceId |
| 不用异常控制流程 | 用 `Optional`、返回值、卫语句 |
| 不要空 catch | 至少 log |
| 保留 cause | `new X("msg", ex)` |

```java
// 反例
try { save(); } catch (Exception ignored) { }

// 正例
try {
  save();
} catch (DuplicateKeyException ex) {
  throw new BusinessException(409, "重复订单号");
}
```

---

## ⭐ 日志：JUL → SLF4J + Logback

`java.util.logging` 功能弱；企业统一 **SLF4J 门面 + Logback 实现**（Spring Boot 默认）。

```java
@Slf4j  // Lombok
public class OrderService {

  public void placeOrder(Order order) {
    log.debug("下单开始 orderId={} userId={}", order.getId(), order.getUserId());
    try {
      validate(order);
      repository.save(order);
      log.info("下单成功 orderId={}", order.getId());
    } catch (BusinessException ex) {
      log.warn("下单业务拒绝 orderId={} code={}", order.getId(), ex.getCode());
      throw ex;
    } catch (Exception ex) {
      log.error("下单系统失败 orderId={}", order.getId(), ex);
      throw ex;
    }
  }
}
```

### 日志级别

| 级别 | 用途 | 生产默认 |
|------|------|----------|
| ERROR | 需介入的失败 | ✅ |
| WARN | 可恢复、降级 | ✅ |
| INFO | 关键业务节点（下单、支付） | ✅ |
| DEBUG | SQL、参数、排查 | 按需开启 |
| TRACE | 极细 | 通常关闭 |

### 占位符 vs 拼接

```java
log.debug("user=" + user);           // 即使 DEBUG 关闭也会拼接 — 差
log.debug("user={}", user);            // 关闭时不格式化 — 好
```

### MDC（链路追踪）

```java
MDC.put("traceId", traceId);
try {
  log.info("处理请求");  // 日志格式可输出 %X{traceId}
} finally {
  MDC.clear();
}
```

SkyWalking、Logback MDC 与 `traceId` 打通，排查分布式请求必备。

---

## 📌 断言 `assert`

```java
assert n >= 0 : "n must be non-negative";
```

- 默认**关闭**（需 `-ea` 启用）
- **不用于生产校验** — 用 `Objects.requireNonNull`、`IllegalArgumentException`、Bean Validation（`@NotNull`）

---

## 📌 异常与事务

```java
@Transactional
public void transfer(Long from, Long to, BigDecimal amount) {
  debit(from, amount);
  if (someCondition) throw new RuntimeException();  // 默认回滚
  credit(to, amount);
}
```

- 默认只回滚 **RuntimeException** 和 **Error**
- 受检异常默认**不回滚** — 需 `@Transactional(rollbackFor = Exception.class)`

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 异常吞掉 | 线上「静默失败」 |
| 重复 log 同一异常 | 边界层 log 一次即可 |
| printStackTrace() | 应用 logger |
| 用异常做循环退出 | 性能差、难读 |
| SimpleDateFormat in log | 用 `DateTimeFormatter` |

---

## 本章小结

- 异常分层：底层包装、边界转换、全局响应
- SLF4J + 占位符 + MDC 是生产日志标准
- 断言仅开发期不变量，不作业务校验

---

## 下一步

- [第 8 章：泛型](./08-generics)

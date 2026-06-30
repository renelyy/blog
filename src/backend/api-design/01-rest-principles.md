# REST 设计原则

[← 返回索引](./index)

> **本节目标：** 掌握资源建模、URL 设计、HTTP 方法与状态码，写出一致的 REST API。

---

## ⭐ REST 是什么

**REST**（Representational State Transfer）= 用 **HTTP** 对 **资源** 进行 **表述** 与 **状态转移** 的架构风格，不是协议。

| 核心概念 | 说明 |
|----------|------|
| **资源 Resource** | 订单、用户、商品 — 用 URI 标识 |
| **表述 Representation** | JSON/XML 等 |
| **状态转移** | 通过 HTTP 方法改变资源状态 |
| **无状态** | 服务端不保存客户端会话（鉴权靠 Token） |

见 [Spring Web/REST](../spring/boot/04-web-rest)。

---

## ⭐ URL 设计规范

### 用名词，不用动词

```text
✅ GET    /api/orders
✅ POST   /api/orders
✅ GET    /api/orders/{orderId}
✅ PATCH  /api/orders/{orderId}

❌ POST   /api/createOrder
❌ GET    /api/getOrderById?id=1
```

### 复数、小写、kebab-case

```text
/api/users
/api/order-items
/api/field-operations
```

### 层级不宜过深

```text
✅ GET /api/orders/{orderId}/items
❌ GET /api/companies/{c}/departments/{d}/teams/{t}/members/{m}/orders
```

**过深时：** 用查询参数或独立资源 + filter。

```text
GET /api/order-items?orderId=1001
```

---

## ⭐ HTTP 方法语义

| 方法 | 语义 | 幂等 | 安全 |
|------|------|------|------|
| **GET** | 查询 | ✅ | ✅ |
| **POST** | 创建 / 非幂等动作 | ❌ | ❌ |
| **PUT** | 全量替换 | ✅ | ❌ |
| **PATCH** | 部分更新 | ⚠️ 视实现 | ❌ |
| **DELETE** | 删除 | ✅ | ❌ |

```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

  @GetMapping
  public PageResult<OrderDto> list(@Valid OrderQuery query) { }

  @GetMapping("/{id}")
  public OrderDto get(@PathVariable Long id) { }

  @PostMapping
  public ResponseEntity<OrderDto> create(@Valid @RequestBody CreateOrderRequest req) {
    OrderDto dto = orderService.create(req);
    return ResponseEntity.status(HttpStatus.CREATED)
        .location(URI.create("/api/orders/" + dto.id()))
        .body(dto);
  }

  @PatchMapping("/{id}")
  public OrderDto patch(@PathVariable Long id, @RequestBody PatchOrderRequest req) { }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) { }
}
```

**POST 用于动作（谨慎）：** `POST /api/orders/{id}/cancel` — 非 CRUD 的业务动作可接受，但优先 **PATCH status** 或独立命令资源。

---

## ⭐ HTTP 状态码

| 码 | 含义 | 场景 |
|----|------|------|
| **200** | OK | GET/PATCH 成功 |
| **201** | Created | POST 创建成功 |
| **204** | No Content | DELETE 成功 |
| **400** | Bad Request | 参数校验失败 |
| **401** | Unauthorized | 未登录 |
| **403** | Forbidden | 无权限 |
| **404** | Not Found | 资源不存在 |
| **409** | Conflict | 冲突（重复、状态不允许） |
| **422** | Unprocessable Entity | 语义错误（可选） |
| **429** | Too Many Requests | 限流 |
| **500** | Internal Server Error | 服务端异常 |

**原则：** 用 **4xx** 表达客户端问题，**5xx** 表达服务端问题； body 带统一错误结构 — 见 [02 章](./02-pagination-error-codes)。

---

## ⭐ 查询 vs 路径参数

| 类型 | 用途 | 例子 |
|------|------|------|
| **Path** | 资源标识 | `/orders/{id}` |
| **Query** | 过滤、排序、分页 | `?status=PAID&page=0&size=20` |
| **Header** | 元数据、版本、鉴权 | `Authorization`、`Accept` |

```text
GET /api/orders?status=PAID&sort=createdAt,desc&page=0&size=20
```

---

## ⭐ 请求与响应体

**入参 DTO、出参 DTO** — 不直接暴露 Entity：

```java
public record CreateOrderRequest(
    @NotNull Long userId,
    @NotEmpty @Valid List<OrderItemRequest> items
) {}

public record OrderDto(
    Long id,
    String status,
    BigDecimal totalAmount,
    Instant createdAt
) {}
```

| 实践 | 说明 |
|------|------|
| **camelCase** JSON 字段 | Java 惯例 |
| **ISO-8601** 时间 | `2024-01-15T10:00:00+08:00` |
| **金额 String 或 Number** | 团队统一；BigDecimal 序列化为字符串防精度丢失 |
| **null vs 省略** | 团队约定；推荐不返回 null 字段（Jackson `NON_NULL`） |

---

## 📌 幂等与 POST

```http
POST /api/payments
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
```

见 [分布式幂等](../distributed/02-idempotency-retry)。

---

## 📌 HATEOAS（了解）

```json
{
  "id": 1001,
  "status": "PAID",
  "_links": {
    "self": { "href": "/api/orders/1001" },
    "cancel": { "href": "/api/orders/1001/cancel", "method": "POST" }
  }
}
```

**企业 API** 多数 **不严格 HATEOAS** — 文档 + 固定 URL 即可；内部超媒体可选。

---

## 📌 与安全衔接

| 场景 | 做法 |
|------|------|
| 鉴权 | Bearer JWT / OAuth2 |
| 租户 | Header `X-Tenant-Id` 或 JWT claim |
| 敏感字段 | 响应脱敏 |

见 [security](../security/)。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| GET 带 body | 部分网关不支持 |
| 200 包一切错误 | 应用 4xx/5xx |
| URL 动词堆砌 | 难扩展、不 RESTful |
| 返回 Entity | 懒加载、字段泄露 |
| 无版本策略 | 破坏性变更伤客户端 — 见 [03 章](./03-openapi-versioning) |

---

## 本章小结

- **资源 + HTTP 动词 + 状态码** 表达语义
- URL：**名词复数、浅层级**；查询用 Query
- DTO 隔离；201 + Location；4xx/5xx 区分责任

---

## 下一步

- [分页、错误码与统一响应](./02-pagination-error-codes)

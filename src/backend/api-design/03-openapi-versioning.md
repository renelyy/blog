# OpenAPI 与版本管理

[← 返回索引](./index)

> **本节目标：** 用 SpringDoc 生成 OpenAPI 文档、管理 API 版本与兼容性策略。

---

## ⭐ OpenAPI 是什么

**OpenAPI 3**（原 Swagger）= REST API 的 **机器可读** 描述：路径、参数、模型、错误。

```text
代码注解 / YAML
      ↓
OpenAPI JSON
      ↓
Swagger UI / Knife4j / 代码生成 / 契约测试
```

---

## ⭐ SpringDoc（Spring Boot 3）

```xml
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
  <version>2.3.0</version>
</dependency>
```

```yaml
springdoc:
  api-docs:
    path: /v3/api-docs
  swagger-ui:
    path: /swagger-ui.html
    enabled: true   # 生产建议 false 或加鉴权
```

访问：`http://localhost:8080/swagger-ui.html`

---

## ⭐ 注解文档化

```java
@Tag(name = "订单", description = "订单 CRUD 与状态")
@RestController
@RequestMapping("/api/orders")
public class OrderController {

  @Operation(summary = "创建订单", description = "需要登录；幂等键见 Header")
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "创建成功"),
      @ApiResponse(responseCode = "400", description = "参数错误"),
      @ApiResponse(responseCode = "409", description = "库存不足")
  })
  @PostMapping
  public ResponseEntity<OrderDto> create(
      @Parameter(description = "幂等键") @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
      @Valid @RequestBody CreateOrderRequest req) {
    // ...
  }
}
```

```java
@Schema(description = "创建订单请求")
public record CreateOrderRequest(
    @Schema(description = "用户 ID", example = "1001")
    @NotNull Long userId,
    @NotEmpty List<OrderItemRequest> items
) {}
```

---

## ⭐ 分组与多模块

```java
@Bean
public GroupedOpenApi publicApi() {
  return GroupedOpenApi.builder()
      .group("public")
      .pathsToMatch("/api/**")
      .build();
}

@Bean
public GroupedOpenApi adminApi() {
  return GroupedOpenApi.builder()
      .group("admin")
      .pathsToMatch("/admin/**")
      .build();
}
```

微服务各自暴露 `/v3/api-docs` — 网关聚合（Knife4j Gateway）可选。

---

## ⭐ API 版本策略

| 策略 | 例子 | 适用 |
|------|------|------|
| **URL 路径** | `/api/v1/orders` | **最常用**，直观 |
| **Header** | `Accept: application/vnd.company.v2+json` | 纯 REST 风格 |
| **Query** | `/api/orders?version=2` | 少见 |

```java
@RestController
@RequestMapping("/api/v1/orders")
public class OrderControllerV1 { }

@RestController
@RequestMapping("/api/v2/orders")
public class OrderControllerV2 { }
```

**原则：**

- **向后兼容** 优先：加字段 OK，删/改字段要新版本
- **Deprecation** 响应头：`Deprecation: true`、`Sunset: Sat, 01 Jan 2025`
- 旧版本 **保留周期** 写进文档（如 6 个月）

---

## ⭐ 兼容性规则

| 变更 | 兼容性 |
|------|--------|
| 响应 **新增** 可选字段 | ✅ 兼容 |
| 请求 **新增** 可选字段 | ✅ 兼容 |
| 删除字段 / 改类型 | ❌ 新版本 |
| 改 URL / 改语义 | ❌ 新版本 |
| 改错误码含义 | ❌ 需公告 |

**Consumer-Driven Contract：** Spring Cloud Contract — [cloud/08](../spring/cloud/08-contract-function)。

---

## 📌 生产环境安全

```yaml
springdoc:
  swagger-ui:
    enabled: ${SWAGGER_ENABLED:false}

# 或 Spring Security 限制 /swagger-ui/** 仅内网角色
```

**禁止** 公网无鉴权暴露 Swagger — 泄露接口与模型。

---

## 📌 从 OpenAPI 生成代码

```bash
openapi-generator-cli generate \
  -i openapi.yaml \
  -g java \
  -o client-sdk
```

**用途：** 给前端/合作方生成 **客户端 SDK**；服务端仍以 Spring 注解为准或 **Design First**（YAML 先行，少见）。

---

## 📌 与测试衔接

```java
@WebMvcTest(OrderController.class)
class OrderControllerDocTest {

  @Autowired
  private MockMvc mockMvc;

  @Test
  void openapiSnapshot() throws Exception {
    mockMvc.perform(get("/v3/api-docs"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.openapi").value("3.0.1"));
  }
}
```

契约测试：响应结构符合 OpenAPI schema。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 文档与代码不同步 | CI 校验 / 注解必填 |
| 生产 Swagger 公开 | 信息泄露 |
| 无版本直接改字段 | 移动端崩溃 |
| v1 v2 无限并存 | 维护成本 — 设 sunset |
| Entity 当 Schema | 暴露内部字段 — 用 DTO |

---

## 本章小结

- **SpringDoc** 自动生成 OpenAPI + Swagger UI
- 版本推荐 **URL /api/v1**；兼容变更 vs 破坏性变更
- 生产关文档或鉴权；Contract 测下游

---

## API 设计模块回顾

| 章 | 要点 |
|----|------|
| 01 REST | 资源 URL、HTTP 方法、状态码 |
| 02 响应 | 分页、错误码、全局异常 |
| 03 OpenAPI | SpringDoc、版本、兼容性 |

---

## 下一步

- 继续 [后端路线图](../roadmap) — [design-patterns](../design-patterns/)
- [Spring Web/REST](../spring/boot/04-web-rest)
- [测试 MockMvc](../testing/03-spring-test)

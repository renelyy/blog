# API 设计规范

> RESTful 设计、分页、错误码、OpenAPI。与 [Spring Web/REST](../spring/boot/04-web-rest) 衔接。

---

## 学习路线

```text
REST 原则 → 分页与错误码 → OpenAPI 与版本
```

---

## 章节索引

| 章 | 标题 | 优先级 | 链接 |
|----|------|--------|------|
| 1 | REST 设计原则 | ⭐ | [01-rest-principles](./01-rest-principles) |
| 2 | 分页、错误码与统一响应 | ⭐ | [02-pagination-error-codes](./02-pagination-error-codes) |
| 3 | OpenAPI 与版本管理 | 📌 | [03-openapi-versioning](./03-openapi-versioning) |

- [章节覆盖说明](./coverage-map)

---

## 相关模块

| 模块 | 说明 |
|------|------|
| [Spring Web](../spring/boot/04-web-rest) | Controller、校验 |
| [security](../security/) | 鉴权与 401/403 |
| [testing](../testing/03-spring-test) | MockMvc 测 API |
| [distributed](../distributed/02-idempotency-retry) | 幂等键 |

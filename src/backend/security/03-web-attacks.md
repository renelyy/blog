# 常见 Web 攻击与防护

[← 返回索引](./index)

> **本节目标：** 理解 SQL 注入、XSS、CSRF、越权、SSRF 等 OWASP 高频问题及 Java/Spring 防护手段。

---

## ⭐ OWASP Top 10（后端视角摘要）

| 风险 | 后端要点 |
|------|----------|
| 注入 | SQL、命令、LDAP |
| 失效的鉴权 | 越权、弱密码 |
| 敏感数据泄露 | 明文、日志泄密 |
| XML 外部实体 | XXE |
| 访问控制失效 | IDOR、水平/垂直越权 |
| 安全配置错误 | 默认账号、CORS * |
| XSS | 输出编码 |
| 不安全反序列化 | Java 原生序列化 |
| 使用含漏洞组件 | 依赖 CVE |
| SSRF | 服务端请求内网 |

---

## ⭐ SQL 注入

**攻击：** 拼接 SQL

```java
// 危险
"SELECT * FROM users WHERE name = '" + input + "'"
// input = ' OR '1'='1
```

**防护：**

```java
// PreparedStatement / MyBatis #{}
WHERE name = #{name}

// ${} 仅动态表名/列名 + 白名单
```

见 [MyBatis 动态 SQL](../mybatis/06-dynamic-sql)、[数据库 SQL 基础](../database/01-sql-basics)。

---

## ⭐ XSS（跨站脚本）

**存储型 / 反射型：** 恶意脚本写入页面，窃取 Cookie。

**防护：**

```java
// 1. 输出转义（前端 + 后端）
String safe = HtmlUtils.htmlEscape(userInput);

// 2. Content-Security-Policy Header
http.headers(h -> h.contentSecurityPolicy(c -> c
    .policyDirectives("default-src 'self'; script-src 'self'")));

// 3. HttpOnly Cookie — JS 读不到 Session
// 4. JWT 放 Header 而非 Cookie（减 XSS 偷 Session，但 XSS 仍可发请求）
```

**规范：** 富文本用白名单 HTML 过滤器（OWASP Java HTML Sanitizer）。

---

## ⭐ CSRF（跨站请求伪造）

**场景：** 用户已登录银行 Cookie，恶意站点 `<form action="bank/transfer">` 自动提交。

**防护：**

| 方式 | 说明 |
|------|------|
| CSRF Token | 表单/Header 带同步 token |
| SameSite Cookie | `SameSite=Lax/Strict` |
| 前后端分离 + JWT Header | **无 Cookie 自动携带** → 常 disable CSRF |

```java
// 传统 MVC 表单
http.csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()));

// 纯 API + JWT
http.csrf(AbstractHttpConfigurer::disable);  // 确保不用 Cookie 鉴权
```

---

## ⭐ 越权（IDOR / 水平 / 垂直）

**水平越权：** 用户 A 访问用户 B 的订单 `GET /orders/1002`

**垂直越权：** 普通用户访问 `/api/admin/users`

**防护：**

```java
@GetMapping("/orders/{id}")
public OrderDto get(@PathVariable Long id, @AuthenticationPrincipal User user) {
  Order order = orderService.findById(id);
  if (!order.getUserId().equals(user.getId()) && !user.hasRole("ADMIN")) {
    throw new AccessDeniedException("无权访问");
  }
  return mapper.toDto(order);
}

// 或 @PreAuthorize + 自定义 Bean（见 01 章）
```

**数据权限：** 部门、租户 ID 写入 SQL WHERE（MyBatis 拦截器 / JPA Filter）。

---

## ⭐ SSRF（服务端请求伪造）

**攻击：** 接口 `GET /fetch?url=http://169.254.169.254/` 读云元数据。

**防护：**

- URL 白名单域名
- 禁止内网 IP 段（10/172/192/127）
- 禁用跳转跟随或限制
- 独立网络区跑爬虫服务

---

## ⭐ 不安全反序列化

```java
// 危险 — 不可信输入
ObjectInputStream ois = new ObjectInputStream(input);
Object obj = ois.readObject();  // Gadget 链 → RCE
```

**防护：** JSON（Jackson）+ 类型白名单；升级 Commons Collections 等；禁止 Java 原生反序列化外部数据。

见 [Core Java 安全](../java/core-java/vol2/10-security)。

---

## ⭐ 文件上传

```java
// 校验
- 扩展名白名单 + MIME 检测（不只信 Content-Type）
- 大小限制 spring.servlet.multipart.max-file-size
- 存储路径不可执行；随机文件名
- 图片重新编码去 EXIF
- 下载 Content-Disposition: attachment
```

---

## ⭐ 依赖漏洞

```bash
mvn org.owasp:dependency-check-maven:check
# 或 GitHub Dependabot / Snyk
```

关注 Log4j、Fastjson、Shiro、Spring 历史 CVE — 定期升级。

---

## 📌 安全 Header 清单

```java
http.headers(h -> h
    .frameOptions(f -> f.deny())
    .contentTypeOptions(Customizer.withDefaults())
    .referrerPolicy(r -> r.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
    .permissionsPolicy(p -> p.policy("geolocation=(), microphone=()")));
```

| Header | 作用 |
|--------|------|
| `X-Frame-Options` | 防点击劫持 |
| `X-Content-Type-Options: nosniff` | 防 MIME 嗅探 |
| `Strict-Transport-Security` | 强制 HTTPS |
| `Content-Security-Policy` | 限制资源加载 |

---

## 📌 接口安全基线

| 项 | 要求 |
|----|------|
| 鉴权 | 除公开接口外必须认证 |
| 限流 | 登录、短信、导出接口 |
| 参数校验 | `@Valid` + Bean Validation |
| 敏感操作 | 二次验证、审计日志 |
| 错误信息 | 不返回堆栈给客户端 |

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 只防 SQL 忽略越权 | 有 Token 仍可能看别人数据 |
| CORS `*` + Cookie | 危险组合 |
| 日志打密码/Token | 脱敏 |
| Swagger 生产暴露 | 加鉴权或关闭 |
| Actuator 未保护 | `/env` 泄露 |

---

## 本章小结

- 注入 → 预编译；XSS → 编码 + CSP；CSRF → Token/SameSite/JWT
- 越权是业务高发 — URL + 数据权限双层校验
- Header、依赖、上传、SSRF 纳入发布 checklist

---

## 下一步

- [数据安全与审计](./04-data-security)

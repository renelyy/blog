# 数据安全与审计

[← 返回索引](./index)

> **本节目标：** 掌握密码存储、传输加密、敏感数据脱敏、审计日志与合规要点。

---

## ⭐ 密码存储

**禁止：** 明文、MD5、SHA1 单次哈希。

```java
@Bean
PasswordEncoder passwordEncoder() {
  return new BCryptPasswordEncoder(12);  // strength 10～12
}

// 注册
user.setPasswordHash(encoder.encode(rawPassword));

// 登录
encoder.matches(rawPassword, user.getPasswordHash());
```

| 算法 | 说明 |
|------|------|
| **BCrypt** | Spring 默认推荐 |
| **Argon2** | 更新算法，Spring Security 5.8+ 支持 |
| **PBKDF2** | 合规场景 |

**盐：** BCrypt 内置随机盐，无需单独存 salt 字段。

---

## ⭐ 传输安全

| 层 | 要求 |
|----|------|
| 对外 API | **TLS 1.2+**（HTTPS） |
| 内网 | 零信任趋势下服务间 mTLS |
| 数据库 | SSL 连接；账号最小权限 |
| Redis | `requirepass` + 内网；TLS（云厂商支持） |

```yaml
spring:
  datasource:
    url: jdbc:mysql://host:3306/db?useSSL=true&requireSSL=true
```

---

## ⭐ 敏感字段加密存储

**场景：** 手机号、身份证、银行卡 — DB 24库需可逆加密或哈希检索。

```java
// 对称加密 AES-GCM — 密钥来自 KMS/Vault，不写死在代码
@Service
public class FieldEncryptor {
  private final SecretKey key;  // 从配置中心/KMS 注入

  public String encrypt(String plain) { /* AES/GCM */ }
  public String decrypt(String cipher) { /* ... */ }

  // 检索用手机号后四位 + 哈希索引
  public String hashForLookup(String phone) {
    return sha256(phone + pepper);
  }
}
```

| 策略 | 适用 |
|------|------|
| 哈希不可逆 | 密码 |
| 对称加密可逆 | 需展示的手机号 |
| 令牌化 Tokenization | 支付 PCI |
| 脱敏展示 | 日志、API 响应 |

---

## ⭐ 脱敏规范

```java
public static String maskPhone(String phone) {
  if (phone == null || phone.length() < 7) return "***";
  return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
}

public static String maskIdCard(String id) {
  return id.substring(0, 4) + "**********" + id.substring(id.length() - 4);
}
```

**日志：**

```java
// 坏
log.info("user login password={}", password);
log.info("token={}", jwt);

// 好
log.info("user login userId={}", userId);
```

使用 Logback 自定义 `PatternLayout` 或脱敏 Converter。

---

## ⭐ 审计日志

**记录谁、何时、对什么、做了什么、结果如何：**

```java
@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {
  private final AuditLogRepository auditRepo;

  @AfterReturning("@annotation(auditLog)")
  public void after(JoinPoint jp, AuditLog auditLog, Object result) {
    auditRepo.save(AuditLogEntity.builder()
        .userId(SecurityUtils.currentUserId())
        .module(auditLog.module())
        .action(auditLog.action())
        .target(extractTarget(jp))
        .ip(RequestUtils.clientIp())
        .success(true)
        .createdAt(Instant.now())
        .build());
  }
}

@AuditLog(module = "order", action = "delete")
public void deleteOrder(Long id) { }
```

| 字段 | 说明 |
|------|------|
| userId / username | 操作人 |
| action | CREATE/UPDATE/DELETE/EXPORT |
| resourceType + resourceId | 对象 |
| ip / userAgent | 来源 |
| requestId / traceId | 链路 |

**存储：** 独立审计表或 ELK；**禁止**与业务表混写随意删改。

---

## 📌 权限与最小原则

```sql
-- 应用账号仅 DML，不用 root
GRANT SELECT, INSERT, UPDATE, DELETE ON app_db.* TO 'app_user'@'%';

-- 只读报表账号
GRANT SELECT ON app_db.* TO 'report_user'@'%';
```

- 生产配置、密钥：**RBAC** + 配置中心加密（Nacos、Vault）
- 开发禁止用生产数据；脱敏后再导

---

## 📌 合规要点（概要）

| 法规/标准 | 后端相关 |
|-----------|----------|
| 个保法 | 最小采集、脱敏、删除权 |
| 等保 | 审计、身份鉴别、访问控制 |
| PCI DSS | 卡号不落库或令牌化 |

具体以法务/等保测评要求为准 — 技术实现配合制度。

---

## 📌 Redis / Session 中的敏感数据

```java
// Session 或 Redis 存用户上下文 — 勿存密码
redis.opsForValue().set("session:" + id, userContextDto, ttl);

// Token 黑名单
redis.opsForValue().set("blacklist:jti:" + jti, "1", ttlUntilExp);
```

见 [Redis 指南](../redis/)。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 密钥 commit 到 Git | git-secrets、环境变量 |
| 生产日志 DEBUG 开全量 | 泄露请求体 |
| 导出 Excel 无权限控制 | 批量数据泄露 |
| 审计日志可篡改 |  append-only、独立库 |
| 加密密钥与数据同库 | 密钥放 KMS |

---

## 本章小结

- 密码 BCrypt；传输 HTTPS；敏感字段加密 + 展示脱敏
- 审计日志独立、不可抵赖；DB 账号最小权限
- 与 [JWT](./02-jwt-oauth2)、[Web 攻击防护](./03-web-attacks) 组成安全闭环

---

## 相关模块

- [Core Java 安全](../java/core-java/vol2/10-security)
- [可观测性](../observability/) — 日志与 traceId

---

## 下一步

- [返回 security 索引](./index)
- 或继续 [消息队列](../messaging/)

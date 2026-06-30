# 第 10 章：安全

[← 卷 II 目录](../index)

> 原书 Chapter 10 — Security

---

## ⭐ 安全目标

| 目标 | 英文 | 手段 |
|------|------|------|
| 机密性 | Confidentiality | 加密传输与存储 |
| 完整性 | Integrity | 哈希、签名 |
| 认证 | Authentication | 登录、Token、mTLS |
| 授权 | Authorization | RBAC、数据权限 |
| 不可否认 | Non-repudiation | 审计日志、签名 |

---

## ⭐ SecurityManager（已废弃）

Java 17 起 **SecurityManager 废弃** — 沙箱 Applet 时代产物。企业安全靠：

- **Spring Security** — 认证授权
- **HTTPS / TLS** — 传输加密
- **密钥管理** — Vault、KMS、K8s Secret
- **WAF / 网关** — 边界防护

---

## ⭐ 密码学 JCA 架构

```text
应用
  ↓
JCA API（MessageDigest, Cipher, KeyPairGenerator…）
  ↓
Provider（SunJCE, BouncyCastle…）
```

### 哈希（不可逆）

```java
MessageDigest md = MessageDigest.getInstance("SHA-256");
byte[] hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
String hex = HexFormat.of().formatHex(hash);
```

**密码存储 — 禁止 SHA-256 裸哈希**，用慢哈希：

```java
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
String hashed = encoder.encode(rawPassword);
encoder.matches(rawPassword, hashed);  // 恒定时间比较
```

也可用 Argon2、PBKDF2。**禁止** MD5/SHA1 存密码；**禁止**明文。

### 对称加密 AES

```java
SecretKey key = KeyGenerator.getInstance("AES").generateKey();
Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
cipher.init(Cipher.ENCRYPT_MODE, key);
byte[] ciphertext = cipher.doFinal(plaintext);
```

敏感字段加密存储：密钥来自 KMS，不要硬编码在代码里。

### 非对称 RSA / EC

```java
KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
kpg.initialize(2048);
KeyPair pair = kpg.generateKeyPair();
PrivateKey privateKey = pair.getPrivate();
PublicKey publicKey = pair.getPublic();
```

JWT 签名、HTTPS 证书、双向 TLS。

---

## ⭐ KeyStore 与证书

```java
KeyStore ks = KeyStore.getInstance("PKCS12");
try (InputStream in = Files.newInputStream(Path.of("keystore.p12"))) {
  ks.load(in, password);
}
PrivateKey key = (PrivateKey) ks.getKey("server", password);
Certificate cert = ks.getCertificate("server");
```

| 格式 | 用途 |
|------|------|
| PKCS12 (.p12) | 私钥+证书打包 |
| JKS | 老格式 |
| PEM | Nginx/OpenSSL 常用 |

---

## ⭐ `SecureRandom`

```java
SecureRandom sr = SecureRandom.getInstanceStrong();
byte[] token = new byte[32];
sr.nextBytes(token);
String sessionId = Base64.getUrlEncoder().withoutPadding().encodeToString(token);
```

验证码、Session ID、CSRF Token — **禁止** `Random` 或 `UUID.randomUUID` 单独当安全令牌（UUID v4 可接受会话 ID，crypto token 用 SecureRandom）。

---

## ⭐ Web 安全（与 Spring 衔接）

| 威胁 | 原理 | 防护 |
|------|------|------|
| **SQL 注入** | 拼接 SQL | PreparedStatement、MyBatis `#{}` |
| **XSS** | 脚本注入页面 | 输出转义、CSP、HttpOnly Cookie |
| **CSRF** | 跨站伪造请求 | Token、SameSite Cookie |
| **越权** | IDOR | 鉴权 + 数据权限校验 |
| **SSRF** | 服务端请求内网 | URL 白名单 |
| **反序列化** | 恶意对象链 | 禁 Java 原生序列化外部输入 |

```java
// MyBatis 安全
WHERE name = #{name}   ✅
WHERE name = ${name}   ❌ 仅用于动态表名/列名且白名单
```

见 [Spring Security 入门](../../../spring/boot/08-security)。

---

## ⭐ 认证常见模式

| 模式 | 场景 |
|------|------|
| Session + Cookie | 传统 Web |
| JWT Bearer | 前后端分离 API |
| OAuth2 / OIDC | 第三方登录、SSO |
| mTLS | 服务间高安全 |

JWT 注意：短过期、HTTPS、敏感 claim 不明文、密钥轮换。

---

## 📌 序列化安全

```java
// 危险 — 不可信字节流
ObjectInputStream ois = new ObjectInputStream(socket.getInputStream());
Object obj = ois.readObject();  // Gadget 链 → RCE
```

**规则：** 外部输入用 JSON + 白名单类型；禁用默认 Java 序列化；升级 Commons Collections 等历史漏洞库。

---

## 📌 日志与隐私

- 不 log 密码、Token、身份证号全量
- 脱敏：手机 `138****1234`
- 审计日志：谁、何时、对什么资源、做了什么

---

## 📌 依赖安全

```bash
mvn org.owasp:dependency-check-maven:check
```

定期升级 Spring、Log4j、Fastjson 等有 CVE 历史的依赖。

---

## 本章小结

- 密码 BCrypt/Argon2；传输 TLS；Token SecureRandom
- SQL/XSS/CSRF/越权/反序列化是 Java Web 五大坑
- 框架 + 基础设施 + 规范，不靠 SecurityManager

---

## 下一步

- [Spring 生态](../../../spring/) — 企业开发主战场
- [Core Java 首页](../index)

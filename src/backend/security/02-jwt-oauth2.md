# JWT 与 OAuth2 / OIDC

[← 返回索引](./index)

> **本节目标：** 理解 JWT 结构、前后端分离登录流程，以及 OAuth2/OIDC 在微服务中的角色。

---

## ⭐ JWT 是什么

**JSON Web Token** = Header.Payload.Signature（Base64URL），**自包含**声明，服务端无状态校验。

```text
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0b20iLCJleHAiOjE3MTk4Nj... .SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
  │ Header              │ Payload (claims)           │ Signature
```

| 部分 | 内容 |
|------|------|
| Header | alg（HS256/RS256）、typ |
| Payload | sub、exp、iat、自定义 claims（roles） |
| Signature | 防篡改 |

**注意：** Payload **仅 Base64 编码，不加密** — 勿放密码、身份证号。

---

## ⭐ 登录签发流程（前后端分离）

```text
1. POST /api/auth/login { username, password }
2. 校验通过 → 生成 accessToken（短，15min～2h）
              + refreshToken（长，7d，存 DB/Redis 可选)
3. 返回 { accessToken, refreshToken, expiresIn }
4. 客户端 Header: Authorization: Bearer <accessToken>
5. accessToken 过期 → POST /api/auth/refresh { refreshToken }
```

```java
@Service
@RequiredArgsConstructor
public class AuthService {
  private final AuthenticationManager authManager;
  private final JwtTokenProvider jwtProvider;
  private final StringRedisTemplate redis;

  public TokenResponse login(LoginRequest req) {
    var auth = authManager.authenticate(
        new UsernamePasswordAuthenticationToken(req.username(), req.password()));
    String access = jwtProvider.createAccessToken(auth);
    String refresh = jwtProvider.createRefreshToken(auth.getName());
    redis.opsForValue().set("refresh:" + refresh, auth.getName(), Duration.ofDays(7));
    return new TokenResponse(access, refresh, jwtProvider.getAccessTtlSeconds());
  }

  public TokenResponse refresh(String refreshToken) {
    String user = redis.opsForValue().get("refresh:" + refreshToken);
    if (user == null) throw new UnauthorizedException("refresh 无效");
    // 可选：轮换 refresh，旧 token 作废
    return issueNewTokens(user);
  }

  public void logout(String refreshToken) {
    redis.delete("refresh:" + refreshToken);
    // accessToken 可入黑名单（剩余 TTL）防泄露继续使用
  }
}
```

---

## ⭐ JWT 实现要点

```java
@Component
public class JwtTokenProvider {
  private final SecretKey key;  // HS256 对称；生产 RS256 更合适

  public String createAccessToken(Authentication auth) {
    Instant now = Instant.now();
    return Jwts.builder()
        .subject(auth.getName())
        .claim("authorities", auth.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority).toList())
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plus(2, ChronoUnit.HOURS)))
        .signWith(key)
        .compact();
  }

  public boolean validate(String token) {
    try {
      Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
      return true;
    } catch (JwtException ex) {
      return false;
    }
  }
}
```

| 算法 | 说明 |
|------|------|
| **HS256** | 对称密钥；网关与认证服务共享 secret |
| **RS256** | 私钥签发、公钥验证；微服务只持公钥 |

---

## ⭐ OAuth2 四种角色

| 角色 | 说明 |
|------|------|
| **Resource Owner** | 用户 |
| **Client** | 前端/移动 App |
| **Authorization Server** | 发 Token（Keycloak、Auth0、自研） |
| **Resource Server** | API（校验 Token） |

### 常用授权模式

| 模式 | 场景 |
|------|------|
| **授权码 + PKCE** | 浏览器/移动 App（**推荐**） |
| 客户端凭证 | 服务间 M2M |
| 刷新令牌 | 续期 |
| ~~密码模式~~ | 已废弃，勿用 |

```text
用户 → 浏览器跳转授权页 → 同意 → 回调带 code
     → 后端用 code 换 access_token（PKCE 防 code 拦截）
     → 访问 Resource Server
```

---

## ⭐ Spring Resource Server

```xml
<dependency>
  <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
```

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://auth.example.com/realms/demo
          # 或 jwk-set-uri 指定公钥
```

```java
@Bean
SecurityFilterChain api(HttpSecurity http) throws Exception {
  http
      .csrf(AbstractHttpConfigurer::disable)
      .authorizeHttpRequests(a -> a
          .requestMatchers("/api/public/**").permitAll()
          .anyRequest().authenticated())
      .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
  return http.build();
}
```

JWT 的 `scope` / `authorities` 可映射：

```java
@Bean
JwtAuthenticationConverter jwtAuthenticationConverter() {
  var converter = new JwtAuthenticationConverter();
  converter.setJwtGrantedAuthoritiesConverter(jwt -> {
    List<String> roles = jwt.getClaimAsStringList("roles");
    return roles.stream()
        .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
        .collect(Collectors.toList());
  });
  return converter;
}
```

---

## ⭐ OIDC（OpenID Connect）

OAuth2 + **身份层** — `id_token`（JWT）含用户 profile（sub、email、name）。

与纯 JWT 自研对比：

| | 自研 JWT | OIDC + Keycloak |
|---|----------|-----------------|
| 开发量 | 自己写登录/刷新 | 标准协议、控制台 |
| SSO | 需自建 | 多应用单点登录 |
| 企业 | 中小项目 | 政企、多租户 |

---

## 📌 网关鉴权

```text
客户端 → Gateway（校验 JWT / 转发 Header）
            → 微服务 A（可选二次校验或信任网关）
            → 微服务 B
```

Spring Cloud Gateway：

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: api
          uri: lb://user-service
          predicates:
            - Path=/api/**
          filters:
            - TokenRelay=
```

见 [Gateway 章节](../spring/cloud/04-gateway)。

---

## 📌 Token 安全规范

| 规范 | 说明 |
|------|------|
| HTTPS | 必须 |
| 短 access + 长 refresh | 降低泄露影响 |
| refresh 轮换 | 用后作废旧 refresh |
| 登出黑名单 | Redis 存 jti 至 exp |
| 密钥轮换 | RS256 多 kid |
| 勿放 localStorage 讨论 | HttpOnly Cookie vs Memory（XSS 权衡） |

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 无 exp | Token 永不过期 |
| secret 硬编码 | 环境变量 / KMS |
| 不校验 iss/aud | 跨服务 Token 滥用 |
| refresh 无限续期 | 应绑定设备或限次数 |
| 把 JWT 当 Session 存一切 | 体积大、难撤销 |

---

## 本章小结

- JWT = 无状态凭证；OAuth2/OIDC = 标准授权与身份
- 前后端：login → access + refresh → Bearer Header
- 微服务用 Resource Server + issuer-uri 或网关统一鉴权

---

## 下一步

- [常见 Web 攻击与防护](./03-web-attacks)

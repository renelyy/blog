# Spring Security 入门

[← Boot 首页](./index)

> 对应官方 [Spring Security Reference](https://docs.spring.io/spring-security/reference/)。本章为**入门**；OAuth2/JWT 专册可后续扩写。

---

## ⭐ 依赖

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

启动后所有接口默认需认证（HTTP Basic，随机密码打印在日志）。

---

## ⭐ SecurityFilterChain（Boot 3 / Security 6）

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/actuator/health", "/api/public/**").permitAll()
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated())
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .httpBasic(Customizer.withDefaults());
    return http.build();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}
```

---

## 📌 内存用户（开发）

```java
@Bean
public UserDetailsService users(PasswordEncoder encoder) {
  UserDetails user = User.builder()
      .username("user")
      .password(encoder.encode("password"))
      .roles("USER")
      .build();
  return new InMemoryUserDetailsManager(user);
}
```

生产应从数据库 / LDAP / OAuth2 加载。

---

## 📌 方法级权限

```java
@EnableMethodSecurity
@Configuration
public class MethodSecurityConfig { }

@Service
public class OrderService {
  @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
  public void deleteOrder(Long orderId, Long userId) { }
}
```

---

## 📌 JWT 资源服务器（概要）

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
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
```

```java
http.oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
```

---

## ⚠️ 常见坑

| 问题 | 处理 |
|------|------|
| 403 CSRF | 前后端分离 API 常 disable CSRF + JWT |
| CORS 与 Security 顺序 | 在 Security 链里配置 cors |
| @PreAuthorize 不生效 | 确认 `@EnableMethodSecurity` |

---

## 下一步

- [Redis 与 NoSQL](./08-nosql-redis)

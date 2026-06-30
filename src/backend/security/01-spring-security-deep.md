# Spring Security 深入

[← 返回索引](./index)

> **本节目标：** 理解 Filter 链、认证/授权模型、SecurityFilterChain 配置与方法级权限。

---

## ⭐ Spring Security 架构

```text
HTTP 请求
  → FilterChainProxy
      → SecurityContextPersistenceFilter
      → UsernamePasswordAuthenticationFilter（表单登录）
      → BearerTokenAuthenticationFilter（JWT）
      → AuthorizationFilter（鉴权）
      → ... 其他 Filter
  → DispatcherServlet → Controller
```

**核心对象：**

| 对象 | 作用 |
|------|------|
| `Authentication` | 谁登录了（Principal、Credentials、Authorities） |
| `SecurityContext` | 当前线程的 Authentication |
| `UserDetails` | 用户信息加载契约 |
| `UserDetailsService` | 从 DB/LDAP 加载用户 |
| `PasswordEncoder` | 密码哈希（BCrypt） |
| `GrantedAuthority` | 权限/角色 |

---

## ⭐ SecurityFilterChain（Boot 3 / Security 6）

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(AbstractHttpConfigurer::disable)
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .sessionManagement(s -> s
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/actuator/health", "/api/auth/**").permitAll()
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.GET, "/api/public/**").permitAll()
            .anyRequest().authenticated())
        .exceptionHandling(ex -> ex
            .authenticationEntryPoint(new JsonAuthenticationEntryPoint())
            .accessDeniedHandler(new JsonAccessDeniedHandler()))
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
  }
}
```

**前后端分离 API：** 无 Session → `STATELESS` + JWT Filter；CSRF 通常关闭（Token 在 Header）。

入门配置见 [Boot Security 入门](../spring/boot/08-security)。

---

## ⭐ 认证流程

### 表单 / Basic（传统）

```text
1. 用户提交 username/password
2. AuthenticationManager 认证
3. UserDetailsService.loadUserByUsername
4. PasswordEncoder.matches
5. 成功 → SecurityContext 写入 Authentication
6. Session 保存（非 STATELESS 时）
```

### 自定义 JWT Filter

```java
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
  private final JwtTokenProvider tokenProvider;
  private final UserDetailsService userDetailsService;

  @Override
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
      FilterChain chain) throws ServletException, IOException {
    String token = resolveToken(req);
    if (token != null && tokenProvider.validate(token)) {
      String username = tokenProvider.getUsername(token);
      UserDetails user = userDetailsService.loadUserByUsername(username);
      var auth = new UsernamePasswordAuthenticationToken(
          user, null, user.getAuthorities());
      SecurityContextHolder.getContext().setAuthentication(auth);
    }
    chain.doFilter(req, res);
  }

  private String resolveToken(HttpServletRequest req) {
    String bearer = req.getHeader("Authorization");
    if (bearer != null && bearer.startsWith("Bearer ")) {
      return bearer.substring(7);
    }
    return null;
  }
}
```

---

## ⭐ UserDetailsService 从数据库加载

```java
@Service
@RequiredArgsConstructor
public class DbUserDetailsService implements UserDetailsService {
  private final UserRepository userRepository;

  @Override
  public UserDetails loadUserByUsername(String username) {
    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new UsernameNotFoundException(username));
    return org.springframework.security.core.userdetails.User.builder()
        .username(user.getUsername())
        .password(user.getPasswordHash())
        .disabled(!user.isEnabled())
        .authorities(user.getRoles().stream()
            .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
            .toList())
        .build();
  }
}
```

**角色前缀：** `hasRole("ADMIN")` 实际匹配 `ROLE_ADMIN`。

---

## ⭐ 授权：URL vs 方法

### URL 级

```java
.requestMatchers("/api/orders/**").hasAuthority("order:read")
```

### 方法级

```java
@PreAuthorize("hasAuthority('order:delete')")
public void deleteOrder(Long id) { }

@PreAuthorize("@orderAuth.canEdit(#id, authentication)")
public void updateOrder(Long id, OrderDto dto) { }

@Component("orderAuth")
public class OrderAuthorization {
  public boolean canEdit(Long orderId, Authentication auth) {
    // 数据权限：是否订单所属人
    return orderService.isOwner(orderId, auth.getName());
  }
}
```

| 注解 | 说明 |
|------|------|
| `@PreAuthorize` | 方法前 SpEL |
| `@PostAuthorize` | 方法后 |
| `@Secured` | 角色名数组 |
| `@PreFilter` / `@PostFilter` | 集合过滤 |

---

## ⭐ 统一 JSON 401/403

```java
public class JsonAuthenticationEntryPoint implements AuthenticationEntryPoint {
  @Override
  public void commence(HttpServletRequest req, HttpServletResponse res,
      AuthenticationException ex) throws IOException {
    res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    res.setContentType(MediaType.APPLICATION_JSON_VALUE);
    res.getWriter().write("""
        {"code":401,"message":"未登录或 Token 无效"}
        """);
  }
}
```

---

## 📌 CORS 与 Security

```java
@Bean
CorsConfigurationSource corsConfigurationSource() {
  CorsConfiguration config = new CorsConfiguration();
  config.setAllowedOrigins(List.of("https://app.example.com"));
  config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
  config.setAllowedHeaders(List.of("*"));
  config.setAllowCredentials(true);
  UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
  source.registerCorsConfiguration("/api/**", config);
  return source;
}
```

**生产：** 禁止 `*` + credentials；明确域名白名单。

---

## 📌 多 SecurityFilterChain

```java
@Bean
@Order(1)
SecurityFilterChain apiChain(HttpSecurity http) { /* /api/** JWT */ }

@Bean
@Order(2)
SecurityFilterChain actuatorChain(HttpSecurity http) { /* /actuator/** */ }
```

不同路径不同安全策略。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| `@PreAuthorize` 不生效 | 缺 `@EnableMethodSecurity` |
| 403 非 401 | 已认证但无权限 vs 未登录 |
| CSRF 与 Cookie Session | SPA 用 JWT 关 CSRF |
| 密码明文存库 | 必须 BCrypt |
| Filter 顺序错 | JWT Filter 在 UsernamePassword 之前 |
| 同类自调用 | `@PreAuthorize` 不走代理 |

---

## 本章小结

- Security = Filter 链 + Authentication + Authorization
- Boot 3 用 `SecurityFilterChain` Bean；API 用 STATELESS + JWT
- URL 规则 + `@PreAuthorize` + 自定义 Bean 做数据权限

---

## 下一步

- [JWT 与 OAuth2 / OIDC](./02-jwt-oauth2)

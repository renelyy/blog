# 自动配置原理

[← Boot 首页](./index)

> **本节你将学到：** Starter 如何触发自动配置、@Conditional 条件、如何排查与定制。

---

## ⭐ 工作流程

```text
@SpringBootApplication
  → @EnableAutoConfiguration
  → 加载 META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
  → 各 *AutoConfiguration 类按 @Conditional 决定是否生效
  → 注册 Bean（DataSource、DispatcherServlet…）
```

---

## ⭐ 示例：Web 自动配置

引入 `spring-boot-starter-web` 后自动：

- 内嵌 Tomcat，`server.port=8080`
- `DispatcherServlet`
- Jackson JSON 转换器
- 静态资源处理
- 错误页 `/error`

无需手写 XML。

---

## ⭐ @Conditional 系列

| 注解 | 条件 |
|------|------|
| `@ConditionalOnClass` | classpath 存在某类 |
| `@ConditionalOnMissingClass` | classpath 不存在 |
| `@ConditionalOnBean` | 容器已有某 Bean |
| `@ConditionalOnMissingBean` | 容器没有 |
| `@ConditionalOnProperty` | 配置项匹配 |

自定义自动配置包结构：

```java
@Configuration
@ConditionalOnClass(MyClient.class)
@EnableConfigurationProperties(MyProperties.class)
public class MyAutoConfiguration {

  @Bean
  @ConditionalOnMissingBean
  public MyClient myClient(MyProperties props) {
    return new MyClient(props.getUrl());
  }
}
```

注册文件：`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`

---

## 📌 排除自动配置

```java
@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class })
public class Application { }
```

或配置：

```yaml
spring:
  autoconfigure:
    exclude:
      - org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration
```

---

## 📌 查看生效的自动配置

启动加 `--debug` 或：

```yaml
debug: true
```

日志输出 **Positive matches** / **Negative matches**。

Actuator：`/actuator/conditions`（需引入 actuator）。

---

## 📌 覆盖默认 Bean

自己声明同类型 Bean，且满足 `@ConditionalOnMissingBean` 时，**你的实现优先**：

```java
@Configuration
public class DataSourceConfig {
  @Bean
  @Primary
  public DataSource dataSource() {
    // 自定义 Hikari 参数
  }
}
```

---

## 下一步

- [配置与 Profile](./03-configuration)

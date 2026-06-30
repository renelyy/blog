# Bean 进阶：生命周期、循环依赖与环境

[← Framework 首页](./index)

> 对应官方 [Core → IoC Container](https://docs.spring.io/spring-framework/reference/core/beans.html) 中进阶部分。

---

## ⭐ Bean 完整生命周期

```text
1. 实例化（构造器）
2. 属性填充（依赖注入）
3. BeanNameAware / BeanFactoryAware / ApplicationContextAware
4. BeanPostProcessor.postProcessBeforeInitialization
5. @PostConstruct / InitializingBean.afterPropertiesSet / init-method
6. BeanPostProcessor.postProcessAfterInitialization
7. Bean 就绪可用
8. 容器关闭 → @PreDestroy / DisposableBean / destroy-method
```

```java
@Component
public class LifecycleDemo {
  @PostConstruct
  void init() { log.info("初始化"); }

  @PreDestroy
  void shutdown() { log.info("销毁"); }
}
```

---

## 📌 @Lazy 延迟加载

```java
@Component
@Lazy
public class HeavyClient {
  // 首次注入或首次调用时才创建
}
```

单例默认容器启动时创建；`@Lazy` 适合启动慢、非必用 Bean。

---

## 📌 @Primary 与 @Qualifier

多个同类型 Bean 时：

```java
@Bean @Primary
public DataSource primaryDs() { ... }

@Bean
@Qualifier("readonly")
public DataSource readonlyDs() { ... }

@Service
public class ReportService {
  public ReportService(@Qualifier("readonly") DataSource ds) { }
}
```

---

## ⭐ 循环依赖（三级缓存）

**仅单例 + 字段/Setter 注入** 时，Spring 可能通过三级缓存解决 A↔B 循环。

**构造器循环依赖** → 启动失败（无法先实例化）。

| 做法 | 推荐 |
|------|------|
| 重构去掉循环 | ⭐ 最佳 |
| 改用 Setter/@Lazy | 临时 |
| 依赖构造器循环 | ❌ 不可行 |

---

## ⭐ Environment 与 @PropertySource

```java
@Configuration
@PropertySource("classpath:custom.properties")
public class AppConfig {
  @Autowired Environment env;

  @Bean
  public MyBean myBean() {
    return new MyBean(env.getProperty("my.key"));
  }
}
```

Boot 中多用 `application.yml` + `@ConfigurationProperties`。

---

## 📌 SpEL（Spring Expression Language）

```java
@Value("#{systemProperties['user.home']}")
private String userHome;

@Value("#{T(java.lang.Math).random() * 100.0}")
private double random;
```

XML/注解切面 pointcut、Security `@PreAuthorize` 等也常用 SpEL。

---

## 📌 类型转换 ConversionService

```java
@Component
public class StringToLocalDateConverter implements Converter<String, LocalDate> {
  @Override
  public LocalDate convert(String source) {
    return LocalDate.parse(source);
  }
}
```

Boot 自动注册 `Converter` Bean。

---

## 📎 FactoryBean

```java
public class ConnectionFactoryBean implements FactoryBean<Connection> {
  @Override public Connection getObject() { return DriverManager.getConnection(...); }
  @Override public Class<?> getObjectType() { return Connection.class; }
}
```

容器里拿到的是 `getObject()` 产物；要 FactoryBean 本身加 `&` 前缀。

---

## 下一步

- [校验与数据绑定](./06-validation)
- [Boot 配置与 Profile](../boot/03-configuration)

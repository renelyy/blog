# IoC 与依赖注入

[← Framework 首页](./index)

> **本节你将学到：** 控制反转（IoC）、依赖注入（DI）、Bean 生命周期与三种配置方式。

---

## ⭐ 核心概念

### IoC（控制反转）

传统写法：对象自己 `new` 依赖。

```java
public class UserService {
  private UserRepository repo = new UserRepositoryImpl(); // 紧耦合
}
```

IoC：**创建对象、组装依赖** 交给容器（Spring IoC Container），对象只声明「我需要什么」。

### DI（依赖注入）

DI 是 IoC 最常见的实现方式，通过以下途径注入依赖：

| 方式 | 说明 | 推荐度 |
|------|------|--------|
| **构造器注入** | 构造方法参数 | ⭐ 首选（不可变、易测试） |
| **Setter 注入** | setter 方法 | 可选依赖 |
| **字段注入** | `@Autowired` 在字段上 | 不推荐（难测试、隐藏依赖） |

```java
@Service
public class UserService {
  private final UserRepository userRepository;

  public UserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }
}
```

---

## ⭐ 容器：BeanFactory 与 ApplicationContext

| 接口 | 说明 |
|------|------|
| `BeanFactory` | 基础 IoC，延迟加载 Bean |
| `ApplicationContext` | BeanFactory 超集，**实际开发几乎都用它** |

`ApplicationContext` 额外提供：

- 更简单的 AOP 集成
- 国际化（MessageSource）
- 事件发布
- Web 环境 `WebApplicationContext`

**Bean**：由 Spring 容器实例化、组装并管理的对象；否则只是普通 Java 对象。

---

## ⭐ Bean 的作用域（Scope）

| Scope | 说明 |
|-------|------|
| `singleton` | **默认**，容器内单例 |
| `prototype` | 每次获取新建实例 |
| `request` | 每个 HTTP 请求一个（Web） |
| `session` | 每个 HTTP Session 一个（Web） |
| `application` | ServletContext 级别 |

```java
@Component
@Scope("prototype")
public class PrototypeBean { }
```

⚠️ 单例 Bean 注入 prototype Bean 时，prototype 不会在每次调用时新建——需 `@Lookup` 或 `ObjectProvider` 等方案。

---

## ⭐ 三种配置方式

### 1. 注解配置（主流）

```java
@Configuration
@ComponentScan("com.example")
public class AppConfig { }

@Service
public class UserService { }

@Repository
public class UserRepositoryImpl implements UserRepository { }
```

常用 stereotype：

| 注解 | 语义 |
|------|------|
| `@Component` | 通用组件 |
| `@Service` | 业务层 |
| `@Repository` | 持久层 |
| `@Controller` / `@RestController` | 表现层 |

### 2. Java 配置（@Configuration + @Bean）

```java
@Configuration
public class DataSourceConfig {
  @Bean
  public DataSource dataSource() {
    HikariDataSource ds = new HikariDataSource();
    ds.setJdbcUrl("jdbc:mysql://localhost:3306/demo");
    return ds;
  }
}
```

`@Bean` 方法默认 singleton；方法名即 bean 名称。

### 3. XML 配置（遗留项目）

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="...">
  <context:component-scan base-package="com.example"/>
  <bean id="userService" class="com.example.UserService">
    <constructor-arg ref="userRepository"/>
  </bean>
</beans>
```

Boot 项目一般**不再写 XML 容器配置**。

---

## 📌 依赖注入细节

### @Autowired

```java
@Autowired
public UserService(UserRepository repo) { }  // 构造器：可省略 @Autowired（单构造器时）

@Autowired
@Qualifier("mysqlRepo")
private UserRepository repo;
```

### @Resource / @Inject

- `@Resource`（JSR-250）：默认按名称
- `@Inject`（JSR-330）：类似 `@Autowired`

### 可选依赖

```java
@Autowired(required = false)
private Optional<CacheService> cacheService;
```

---

## 📌 Bean 生命周期（简化）

```text
实例化 → 属性赋值 → Aware 回调 → 初始化前(@PostConstruct)
  → 初始化 → 初始化后 → 使用中 → 销毁(@PreDestroy)
```

常用钩子：

```java
@PostConstruct
public void init() { }

@PreDestroy
public void destroy() { }
```

实现 `InitializingBean` / `DisposableBean` 接口方式较老，推荐注解。

---

## 📌 条件装配 @Conditional

```java
@Bean
@ConditionalOnProperty(name = "feature.x.enabled", havingValue = "true")
public FeatureX featureX() { return new FeatureX(); }
```

Spring Boot 自动配置大量基于此（`@ConditionalOnClass` 等）。

---

## ⚠️ 常见误区

| 误区 | 正确理解 |
|------|----------|
| `@Component` 能注入 `@Controller` 吗 | 能，但分层应遵守依赖方向 |
| 循环依赖 | 构造器注入循环会失败；setter/字段单例可能通过三级缓存解决（不推荐依赖） |
| 自己 new 的 Bean | 不受容器管理，无 AOP、无事务 |

---

## 下一步

- [AOP](./02-aop)
- [Spring Boot 快速上手](../boot/01-quick-start)

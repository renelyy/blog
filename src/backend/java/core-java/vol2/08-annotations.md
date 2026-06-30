# 第 8 章：注解与编译期处理

[← 卷 II 目录](../index)

> 原书 Chapter 8 — Scripting, Compiling, and Annotation Processing（**Nashorn 已移除**；企业重点 **注解 + APT**）

---

## ⭐ 注解是什么

注解为代码附加**元数据**，本身不是逻辑；由编译器、APT 或运行时框架读取。

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface AuditLog {
  String module() default "";
  String action() default "";
  boolean saveRequest() default true;
}

@AuditLog(module = "order", action = "create")
public Order createOrder(CreateOrderRequest req) {
  return orderService.create(req);
}
```

---

## ⭐ 元注解

| 元注解 | 作用 |
|--------|------|
| `@Target` | 可用于 CLASS / METHOD / FIELD / PARAMETER… |
| `@Retention` | SOURCE（源码）/ CLASS（字节码）/ **RUNTIME**（反射） |
| `@Documented` | 出现在 Javadoc |
| `@Inherited` | 子类继承类上注解 |
| `@Repeatable` | 同一元素多次注解 |

```java
@Target({ ElementType.TYPE, ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
public @interface RolesAllowed {
  String[] value();
}
```

**Spring / JUnit / Validation 都用 RUNTIME** — 启动时扫描。

---

## ⭐ 标准注解

| 注解 | 说明 |
|------|------|
| `@Override` | 编译器校验重写 |
| `@Deprecated` | 废弃 API；配合 `forRemoval` |
| `@SuppressWarnings` | 抑制编译警告 |
| `@FunctionalInterface` | 函数式接口 |
| `@SafeVarargs` | 泛型 varargs 安全 |

---

## ⭐ 运行时读取注解（反射）

```java
Method m = OrderController.class.getMethod("createOrder", CreateOrderRequest.class);
AuditLog audit = m.getAnnotation(AuditLog.class);
if (audit != null) {
  log.info("audit module={} action={}", audit.module(), audit.action());
}

// 类级别
RolesAllowed roles = clazz.getAnnotation(RolesAllowed.class);
```

Spring AOP `@Around("@annotation(AuditLog)")` 就是基于此。

---

## ⭐ Spring 注解体系（企业天天用）

### 组件注册

```java
@Component          // 通用
@Service            // 业务层
@Repository         // 持久层
@Controller         // MVC
@RestController     // = @Controller + @ResponseBody
@Configuration      // 配置类
@Bean               // 方法级 Bean 定义
```

### 依赖注入

```java
@Autowired          // 按类型注入
@Qualifier("main")  // 多实现区分
@Value("${app.name}") // 配置注入
@Resource           // JSR-250 按名称
```

### Web

```java
@RequestMapping("/api/orders")
@GetMapping @PostMapping @PutMapping @DeleteMapping
@PathVariable @RequestParam @RequestBody
@Valid              // 触发 Bean Validation
```

### 事务与缓存

```java
@Transactional(rollbackFor = Exception.class)
@Cacheable("users")
@Scheduled(cron = "0 0 2 * * ?")
@Async
```

**启动流程概要：** `@ComponentScan` → 解析类元数据 → 创建 BeanDefinition → 实例化 → `@Autowired` 注入 → `@PostConstruct`。

---

## ⭐ Bean Validation（JSR 380）

```java
public record CreateUserRequest(
    @NotBlank @Size(max = 64) String name,
    @Email String email,
    @Min(18) @Max(120) Integer age
) {}

@PostMapping("/users")
public User create(@Valid @RequestBody CreateUserRequest req) { }
```

校验注解：`@NotNull`、`@NotEmpty`、`@Pattern`、`@Past`、`@Future` 等。

---

## ⭐ Lombok（编译期注解处理）

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Slf4j
public class User {
  private Long id;
  private String name;
}
```

编译期生成 getter/setter/builder/slf4j — **IDE 需装 Lombok 插件**。

| 注解 | 生成 |
|------|------|
| `@Getter/@Setter` | 访问器 |
| `@Builder` | 建造者 |
| `@Slf4j` | `private static final Logger log` |
| `@RequiredArgsConstructor` | final 字段构造器 |

---

## 📌 编译期注解处理器（APT）

```java
@SupportedAnnotationTypes("com.example.AutoMapper")
@SupportedSourceVersion(SourceVersion.RELEASE_17)
public class MapperProcessor extends AbstractProcessor {
  @Override
  public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
    // 扫描 @AutoMapper，生成 MapperImpl.java
    return true;
  }
}
```

**MapStruct、Dagger、AutoValue** 均用 APT 生成类型安全代码 — 业务开发**会用**即可，少手写 Processor。

---

## 📌 编译器 API（了解）

`JavaCompiler` 动态编译源码 — 规则引擎、在线脚本场景；安全隔离是难题。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 注解继承误解 | 方法注解不继承 |
| 只保留 CLASS | 运行时反射读不到 |
| 过度注解驱动 | 逻辑藏分散，难调试 |
| Lombok + JPA | `@Builder` 与无参构造冲突需 `@AllArgsConstructor` 配置 |

---

## 本章小结

- 注解 = 元数据；RUNTIME + 反射 = Spring 魔法
- Validation、Lombok、MapStruct 提升生产力
- 理解扫描与 AOP 切点，读懂框架日志

---

## 下一步

- [第 9 章：模块系统](./09-modules)

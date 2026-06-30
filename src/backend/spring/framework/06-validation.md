# 校验与数据绑定

[← Framework 首页](./index)

> 对应官方 [Core → Validation](https://docs.spring.io/spring-framework/reference/core/validation.html)、[Data Binding](https://docs.spring.io/spring-framework/reference/core/validation/validation.html)。

---

## ⭐ Bean Validation（JSR-380）

Boot：

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

实现默认 **Hibernate Validator**。

```java
public record CreateUserRequest(
    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 32)
    String username,

    @NotBlank @Email
    String email,

    @NotNull @Min(18) @Max(120)
    Integer age
) {}
```

```java
@PostMapping("/users")
public User create(@Valid @RequestBody CreateUserRequest req) { }
```

---

## 常用约束注解

| 注解 | 说明 |
|------|------|
| `@NotNull` | 不能 null |
| `@NotBlank` | 字符串非空且 trim 后长度 > 0 |
| `@NotEmpty` | 集合/数组/字符串非空 |
| `@Size(min,max)` | 长度 |
| `@Min` / `@Max` | 数值范围 |
| `@Pattern(regexp)` | 正则 |
| `@Email` | 邮箱格式 |
| `@Past` / `@Future` | 日期过去/未来 |
| `@Positive` / `@Negative` | 正负数 |

---

## 📌 分组校验

```java
public interface Create { }
public interface Update { }

public class UserForm {
  @Null(groups = Create.class)
  @NotNull(groups = Update.class)
  private Long id;
}

@PostMapping
public void create(@Validated(Create.class) @RequestBody UserForm form) { }
```

---

## 📌 方法级校验

```java
@Service
@Validated
public class UserService {
  public User getById(@NotNull Long id) { ... }
}
```

需 `MethodValidationPostProcessor`（Boot 自动配置）。

---

## 📌 自定义校验

```java
@Target({FIELD, PARAMETER})
@Retention(RUNTIME)
@Constraint(validatedBy = PhoneValidator.class)
public @interface Phone {
  String message() default "手机号格式错误";
  Class<?>[] groups() default {};
  Class<? extends Payload>[] payload() default {};
}

public class PhoneValidator implements ConstraintValidator<Phone, String> {
  @Override
  public boolean isValid(String value, ConstraintValidatorContext ctx) {
    return value != null && value.matches("^1\\d{10}$");
  }
}
```

---

## ⭐ 数据绑定 @ModelAttribute

表单 / Query 绑定到对象：

```java
@GetMapping("/search")
public List<User> search(@Valid UserQuery query) { }
```

```java
public class UserQuery {
  private String keyword;
  @DateTimeFormat(iso = ISO.DATE)
  private LocalDate startDate;
}
```

绑定失败抛 `BindException`，可用 `@ControllerAdvice` 处理。

---

## 下一步

- [Spring MVC](./03-mvc-web)
- [Boot Web](../boot/04-web-rest)

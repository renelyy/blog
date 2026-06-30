# AOP 面向切面编程

[← Framework 首页](./index)

> **本节你将学到：** 横切关注点、切面语法、五种通知类型、与 `@Transactional` 的关系。

---

## 为什么需要 AOP？

日志、事务、权限、监控散落在各业务方法里 → 重复、难维护。

**AOP** 把这类**横切关注点**抽成切面（Aspect），通过**代理**在目标方法前后织入逻辑。

```text
调用方 → 代理对象 → [前置通知] → 目标方法 → [后置通知] → 返回
```

---

## ⭐ 核心术语

| 术语 | 说明 |
|------|------|
| **Aspect** | 切面，通知 + 切点的组合 |
| **Join Point** | 连接点，程序执行中的某点（Spring AOP 仅支持**方法执行**） |
| **Advice** | 通知，在切点执行的代码 |
| **Pointcut** | 切点，匹配哪些 Join Point |
| **Target** | 被代理的目标对象 |
| **Weaving** | 织入，把切面应用到目标（Spring 运行时织入） |

---

## ⭐ 五种通知

| 注解 | 时机 |
|------|------|
| `@Before` | 方法前 |
| `@After` | 方法后（含异常，类似 finally） |
| `@AfterReturning` | 正常返回后 |
| `@AfterThrowing` | 抛出异常后 |
| `@Around` | 包围，**最强大**，可控制是否 proceed |

```java
@Aspect
@Component
public class LoggingAspect {

  @Pointcut("execution(* com.example.service..*(..))")
  public void serviceLayer() { }

  @Before("serviceLayer()")
  public void logBefore(JoinPoint jp) {
    log.info("调用: {}", jp.getSignature().getName());
  }

  @Around("serviceLayer()")
  public Object logAround(ProceedingJoinPoint pjp) throws Throwable {
    long start = System.currentTimeMillis();
    try {
      return pjp.proceed();
    } finally {
      log.info("耗时 {} ms", System.currentTimeMillis() - start);
    }
  }
}
```

启用 AOP：

```java
@Configuration
@EnableAspectJAutoProxy
public class AopConfig { }
```

Spring Boot：`spring-boot-starter-aop` 自动启用。

---

## 📌 Pointcut 表达式（execution）

```text
execution(modifiers? ret-type declaring-type? name(params) throws?)

示例：
execution(public * com.example.service.*.*(..))
  → com.example.service 包下所有 public 方法

execution(* *..*Service.*(..))
  → 类名以 Service 结尾的所有方法
```

其它：`@annotation()`、`@within()`、`args()` 等。

---

## ⭐ @Transactional 就是 AOP

声明式事务由 `TransactionInterceptor` 切面实现：

```java
@Transactional(rollbackFor = Exception.class)
public void transfer(Long from, Long to, BigDecimal amount) {
  // ...
}
```

| 属性 | 说明 |
|------|------|
| `propagation` | 传播行为（REQUIRED、REQUIRES_NEW…） |
| `isolation` | 隔离级别 |
| `timeout` | 超时 |
| `readOnly` | 只读优化 |
| `rollbackFor` | 哪些异常回滚 |

⚠️ **同类内部自调用**不会走代理，事务不生效——需注入自身代理或拆到另一 Bean。

---

## 📎 代理方式

| 方式 | 条件 |
|------|------|
| **JDK 动态代理** | 目标实现了接口 |
| **CGLIB 子类代理** | 无接口或 `proxyTargetClass=true` |

Boot 2.x+ 默认 `spring.aop.proxy-target-class=true`，倾向 CGLIB。

---

## 下一步

- [Spring MVC](./03-mvc-web)
- [数据访问与事务](./04-data-transaction)

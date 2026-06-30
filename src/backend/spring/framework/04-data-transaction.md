# 数据访问与事务

[← Framework 首页](./index)

> **本节你将学到：** JdbcTemplate、事务传播、编程式 vs 声明式事务。

---

## ⭐ 数据访问层次

```text
Controller / Service
       ↓
Repository / Mapper（MyBatis）/ JpaRepository
       ↓
DataSource → JDBC
```

Spring 不替代 ORM/MyBatis，而是**统一异常**、**事务管理**、**连接管理**。

---

## 📌 JdbcTemplate

```java
@Repository
public class UserJdbcRepository {
  private final JdbcTemplate jdbc;

  public UserJdbcRepository(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  public Optional<User> findById(Long id) {
    var list = jdbc.query(
        "SELECT id, username FROM users WHERE id = ?",
        (rs, rowNum) -> new User(rs.getLong("id"), rs.getString("username")),
        id);
    return list.stream().findFirst();
  }
}
```

Boot 自动配置 `JdbcTemplate`（需 `spring-boot-starter-jdbc` + DataSource）。

---

## ⭐ 声明式事务 @Transactional

```java
@Service
public class OrderService {
  @Transactional
  public void placeOrder(Order order) {
    orderRepository.save(order);
    inventoryRepository.deduct(order.getItems());
  }
}
```

### 传播行为（Propagation）

| 值 | 含义 |
|----|------|
| `REQUIRED`（默认） | 有事务就加入，没有就新建 |
| `REQUIRES_NEW` | 总是新建，挂起当前 |
| `NESTED` | 嵌套事务（savepoint） |
| `SUPPORTS` | 有就加入，没有就非事务执行 |
| `NOT_SUPPORTED` | 非事务执行，挂起当前 |
| `MANDATORY` | 必须在事务内，否则异常 |
| `NEVER` | 不能在事务内 |

### 隔离级别

`DEFAULT`、`READ_UNCOMMITTED`、`READ_COMMITTED`、`REPEATABLE_READ`、`SERIALIZABLE`

---

## 📌 编程式事务 TransactionTemplate

```java
@Service
public class BatchService {
  private final TransactionTemplate txTemplate;

  public BatchService(PlatformTransactionManager tm) {
    this.txTemplate = new TransactionTemplate(tm);
  }

  public void runInTx() {
    txTemplate.executeWithoutResult(status -> {
      // 业务
    });
  }
}
```

适合细粒度控制；多数场景用 `@Transactional` 即可。

---

## 📌 与 MyBatis 集成

Spring 通过 `SqlSessionFactoryBean` + `@MapperScan` 管理 MyBatis；事务由 Spring 的 `DataSourceTransactionManager` 统一：

```java
@SpringBootApplication
@MapperScan("com.example.mapper")
public class Application { }
```

同一 `@Transactional` 方法内，MyBatis 多次操作共用一个连接。

详见 [MyBatis 指南](../../mybatis/) 与 [Boot 数据访问](../boot/05-data-access)。

---

## ⚠️ 事务失效场景

| 场景 | 原因 |
|------|------|
| 方法非 public | 代理无法拦截 |
| 同类自调用 | 绕过代理 |
| 异常被吞 | 未触发 rollback |
| 检查异常默认不回滚 | 需 `rollbackFor` |

---

## 下一步

- [Spring Boot 快速上手](../boot/01-quick-start)

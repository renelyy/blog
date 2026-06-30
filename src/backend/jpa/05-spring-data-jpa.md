# Spring Data JPA 实战

[← 返回索引](./index)

> **本节目标：** Repository 分层、事务边界、乐观锁、批量操作与项目结构规范。

---

## ⭐ 分层结构

```text
Controller  →  DTO / VO
Service     →  @Transactional 业务编排
Repository  →  JpaRepository / 自定义实现
Entity      →  仅持久化层
```

```java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
  private final UserService userService;

  @GetMapping("/{id}")
  public UserDto get(@PathVariable Long id) {
    return userService.getById(id);
  }
}

@Service
@RequiredArgsConstructor
public class UserService {
  private final UserRepository userRepo;
  private final UserMapper userMapper;

  @Transactional(readOnly = true)
  public UserDto getById(Long id) {
    User user = userRepo.findById(id)
        .orElseThrow(() -> new NotFoundException("user"));
    return userMapper.toDto(user);
  }

  @Transactional
  public UserDto create(CreateUserCommand cmd) {
    if (userRepo.existsByEmail(cmd.email())) {
      throw new BusinessException("email exists");
    }
    User user = new User();
    user.setUsername(cmd.username());
    user.setEmail(cmd.email());
    return userMapper.toDto(userRepo.save(user));
  }
}
```

---

## ⭐ Repository 接口

```java
public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmail(String email);
  boolean existsByEmail(String email);
}

// 自定义片段
public interface OrderRepositoryCustom {
  List<OrderStats> aggregateByMonth(YearMonth month);
}

public interface OrderRepository extends JpaRepository<Order, Long>, OrderRepositoryCustom {}

@RequiredArgsConstructor
public class OrderRepositoryImpl implements OrderRepositoryCustom {
  private final EntityManager em;

  @Override
  public List<OrderStats> aggregateByMonth(YearMonth month) {
    // Criteria / nativeQuery
    return List.of();
  }
}
```

**命名：** 实现类 `XxxRepositoryImpl`（Spring Data 约定后缀）。

---

## ⭐ 事务实践

| 场景 | 建议 |
|------|------|
| 单表 CRUD | Service 方法 `@Transactional` |
| 只读列表 | `readOnly = true` |
| 跨 Repository | 同一 Service 方法内 — **一个事务** |
| 长事务 | 避免 — 锁表、连接占用 |
| 自调用 | `@Transactional` 同类内部调用**不生效** — 拆类或注入 self |

```java
@Transactional
public void transfer(Long fromId, Long toId, BigDecimal amount) {
  Account from = accountRepo.findById(fromId).orElseThrow();
  Account to = accountRepo.findById(toId).orElseThrow();
  from.debit(amount);
  to.credit(amount);
  // 一次 commit
}
```

传播、隔离见 [Spring 事务](../spring/framework/04-data-transaction)。

---

## ⭐ 乐观锁

```java
@Entity
public class Product {
  @Version
  private Long version;

  private int stock;
}

@Service
public class ProductService {
  @Transactional
  public void deductStock(Long productId, int qty) {
    Product p = productRepo.findById(productId).orElseThrow();
    if (p.getStock() < qty) throw new BusinessException("insufficient stock");
    p.setStock(p.getStock() - qty);
    // UPDATE ... WHERE id=? AND version=? — 冲突抛 OptimisticLockException
  }
}
```

高并发扣库存 → 乐观锁 + 重试，或 **Redis/DB 原子 UPDATE**。

---

## ⭐ 批量插入

默认 `saveAll` 逐条 INSERT — 大量数据慢。

```yaml
spring.jpa.properties.hibernate.jdbc.batch_size: 50
spring.jpa.properties.hibernate.order_inserts: true
spring.jpa.properties.hibernate.order_updates: true
```

```java
@Transactional
public void batchInsert(List<User> users) {
  for (int i = 0; i < users.size(); i++) {
    em.persist(users.get(i));
    if (i % 50 == 0) {
      em.flush();
      em.clear();  // 防一级缓存撑爆
    }
  }
}
```

**超大批量：** JDBC batch 或 MyBatis — 见 [MyBatis](../mybatis/)。

---

## ⭐ 多数据源（了解）

```java
@Configuration
@EnableJpaRepositories(
    basePackages = "com.example.order.repo",
    entityManagerFactoryRef = "orderEmf",
    transactionManagerRef = "orderTx")
public class OrderJpaConfig { }
```

**原则：** 不同 bounded context 不同库；同库尽量单 EM。

---

## 📌 测试

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)  // 用 Testcontainers MySQL
class UserRepositoryTest {
  @Autowired UserRepository userRepo;

  @Test
  void findByEmail() {
    User u = new User();
    u.setEmail("a@b.com");
    u.setUsername("test");
    userRepo.save(u);
    assertThat(userRepo.findByEmail("a@b.com")).isPresent();
  }
}
```

集成测试：`@SpringBootTest` + `@Transactional` 自动回滚（或 Testcontainers）。

---

## 📌 与 Flyway 协作

```yaml
spring.jpa.hibernate.ddl-auto: validate
spring.flyway.enabled: true
```

Entity 与迁移脚本**同步变更** — 先写 migration，再改 Entity。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| Repository 写业务逻辑 | 应放 Service |
| 大事务里远程 RPC | 占连接 — 先 RPC 再短事务写库 |
| save 在循环 | N 次 flush — batch 或 bulk |
| 不查就 save  detached | merge 语义 — 用 DTO 新建 Entity |
| `@Transactional` on private | AOP 不生效 |

---

## 本章小结

- Controller/Service/Repository 职责清晰；Entity 不外泄
- 事务在 Service；乐观锁、批量有专门配置
- validate + Flyway；测试 @DataJpaTest / Testcontainers

---

## 下一步

- [MyBatis vs JPA 选型](./06-mybatis-vs-jpa)

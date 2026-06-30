# JPA 与 Hibernate 概览

[← 返回索引](./index)

> **本节目标：** 理解 ORM、JPA 规范与 Hibernate 实现，以及 EntityManager 基本用法。

---

## ⭐ 什么是 JPA

**JPA**（Jakarta Persistence API）= Java **ORM 规范**（接口标准），不是实现。

| 层次 | 说明 |
|------|------|
| **JPA** | 规范：`@Entity`、`EntityManager`、JPQL |
| **Hibernate** | 最流行的 JPA **实现**（Boot 默认） |
| **Spring Data JPA** | 在 JPA 之上再封装 Repository |

```text
业务代码 → Spring Data JPA → Hibernate → JDBC → MySQL
MyBatis  → SqlSession / Mapper → JDBC → MySQL
```

**对比 MyBatis：** JPA **对象化**、自动生成 SQL；MyBatis **SQL 可控**、手写映射。见 [06-mybatis-vs-jpa](./06-mybatis-vs-jpa)。

---

## ⭐ ORM 解决什么

| 痛点 | ORM |
|------|-----|
| 手写 JDBC 样板 | 实体 ↔ 表自动映射 |
| SQL 字符串 | JPQL / 方法名生成 |
| 结果集映射 | 自动填充对象 |
| 一级缓存 | 同 Session 内重复查 |

**代价：** SQL 不透明、N+1、复杂报表 SQL 难写 — 需理解底层行为。

---

## ⭐ 核心 API

| API | 作用 |
|-----|------|
| `EntityManager` | 持久化上下文入口：persist、merge、find、remove |
| `EntityManagerFactory` | 创建 EM 工厂 |
| `PersistenceContext` | 托管实体集合（一级缓存） |
| `Query` / `TypedQuery` | JPQL / 原生 SQL |

Spring 中通常注入 **Repository**，底层仍是 `EntityManager`（Hibernate Session）。

---

## ⭐ 实体生命周期

```text
New（瞬态）
  → persist() → Managed（持久态，在 PersistenceContext 中）
  → detach() / clear() → Detached（游离态）
  → merge() → Managed
  → remove() → Removed（事务 commit 后删库）
```

```java
User user = new User();           // New
user.setName("Tom");
em.persist(user);                 // Managed — flush 时 INSERT

em.detach(user);                  // Detached
user.setName("Jerry");            // 改游离对象不会自动 UPDATE

user = em.merge(user);            // 合并回 Managed
em.remove(user);                  // Removed
```

**Spring `@Transactional` 方法结束** → flush + commit；方法外实体 **Detached**。

---

## ⭐ Boot 依赖与配置

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate   # 生产：validate 或 none；开发可用 update
    show-sql: false
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.MySQLDialect
    open-in-view: false    # 生产建议 false，防懒加载拖到 Controller
  datasource:
    url: jdbc:mysql://localhost:3306/demo
    username: app
    password: ***
```

| ddl-auto | 说明 |
|----------|------|
| `none` | 不改表 |
| `validate` | 校验实体与表一致 |
| `update` | 自动改表（开发） |
| `create-drop` | 启动建表，关闭删表（测试） |

**生产禁止** `update`/`create` 自动改表 — 用 Flyway/Liquibase，见 [数据库指南](../database/01-sql-basics)。

---

## ⭐ 最小示例

```java
@Entity
@Table(name = "users")
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 64)
  private String username;

  @Column(nullable = false)
  private String email;
}

public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmail(String email);
}

@Service
@RequiredArgsConstructor
public class UserService {
  private final UserRepository userRepo;

  @Transactional
  public User create(String username, String email) {
    User user = new User();
    user.setUsername(username);
    user.setEmail(email);
    return userRepo.save(user);
  }
}
```

---

## 📌 JPA vs JDBC vs MyBatis

| | JPA | MyBatis | JDBC |
|---|-----|---------|------|
| SQL | 多数自动生成 | 手写 | 手写 |
| 学习曲线 | 关联、缓存、懒加载 | SQL + XML | 低层 |
| 复杂查询 | JPQL/Criteria/Native | 灵活 | 灵活 |
| 迁移换库 | dialect 辅助 | SQL 可能要改 | SQL 可能要改 |

---

## 📌 与 Spring 事务

JPA 操作必须在 **事务** 内（读也建议 `@Transactional(readOnly=true)`）：

```java
@Transactional(readOnly = true)
public User get(Long id) {
  return userRepo.findById(id).orElseThrow();
}
```

见 [Spring 事务](../spring/framework/04-data-transaction)。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| `open-in-view=true` | 懒加载在 Controller 触发，难排查 |
| ddl-auto=update 生产 | 表结构失控 |
| 把 Entity 当 DTO 返回 | 懒加载序列化失败 / 泄露 |
| 无事务调用 save | `TransactionRequiredException` |
| 混用 JPA 与 MyBatis 同一表 | 缓存不一致 — 需策略 |

---

## 本章小结

- JPA = 规范，Hibernate = 实现，Spring Data JPA = Repository 封装
- 理解实体状态与 PersistenceContext
- Boot 生产：validate + Flyway + open-in-view=false

---

## 下一步

- [实体映射与生命周期](./02-entity-mapping)

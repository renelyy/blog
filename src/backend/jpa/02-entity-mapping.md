# 实体映射与生命周期

[← 返回索引](./index)

> **本节目标：** 掌握 @Entity 映射、主键策略、枚举、审计字段与常见映射注解。

---

## ⭐ 基本实体映射

```java
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_email", columnList = "email")
})
@Getter @Setter
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "username", nullable = false, length = 64, unique = true)
  private String username;

  @Column(nullable = false, length = 128)
  private String email;

  @Column(name = "status", nullable = false)
  private UserStatus status = UserStatus.ACTIVE;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;
}
```

---

## ⭐ 主键策略

| 策略 | 说明 |
|------|------|
| `IDENTITY` | 数据库自增（MySQL AUTO_INCREMENT）— **最常用** |
| `SEQUENCE` | Oracle/PostgreSQL 序列 |
| `TABLE` | 单独序列表 |
| `AUTO` | 让 JPA 选择（MySQL 通常 IDENTITY） |

**分布式 ID：** 不用自增 → `@GeneratedValue` 配合雪花/UUID 或 Hibernate `@GenericGenerator`。

```java
@Id
@Column(length = 32)
private String id;  // 应用层 SnowflakeId.nextId()
```

---

## ⭐ 枚举映射

```java
public enum UserStatus {
  ACTIVE, DISABLED, LOCKED
}

// 推荐：存字符串可读
@Enumerated(EnumType.STRING)
@Column(length = 32)
private UserStatus status;

// ORDINAL 存 0,1,2 — 改枚举顺序会破坏历史数据，禁止
```

---

## ⭐ 审计字段

### 手动

```java
@PrePersist
void onCreate() {
  Instant now = Instant.now();
  this.createdAt = now;
  this.updatedAt = now;
}

@PreUpdate
void onUpdate() {
  this.updatedAt = Instant.now();
}
```

### Spring Data JPA Auditing

```java
@EntityListeners(AuditingEntityListener.class)
@Entity
public class User {
  @CreatedDate
  @Column(updatable = false)
  private Instant createdAt;

  @LastModifiedDate
  private Instant updatedAt;

  @CreatedBy
  private String createdBy;

  @LastModifiedBy
  private String updatedBy;
}

@Configuration
@EnableJpaAuditing
public class JpaAuditConfig { }
```

---

## ⭐ 嵌入类型 @Embeddable

值对象嵌入同一表：

```java
@Embeddable
public class Address {
  private String province;
  private String city;
  private String street;
}

@Entity
public class User {
  @Embedded
  private Address address;
}
```

列名：`address_province`、`address_city`… 可用 `@AttributeOverride` 重命名。

---

## ⭐ 大字段与 JSON

```java
@Lob
@Column(columnDefinition = "TEXT")
private String remark;

// Hibernate 6 + MySQL JSON
@JdbcTypeCode(SqlTypes.JSON)
@Column(columnDefinition = "json")
private Map<String, Object> extra;
```

---

## ⭐ 逻辑删除

```java
@Entity
@SQLDelete(sql = "UPDATE users SET deleted = 1 WHERE id = ?")
@Where(clause = "deleted = 0")
public class User {
  private boolean deleted = false;
}
```

或 Spring Data `@SQLRestriction("deleted = 0")`（Hibernate 6.3+）。

---

## 📌 DTO 与 Entity 分离

```java
// API 层 — Record
public record UserDto(Long id, String username, String email) {}

// 持久层 — Entity，不直接返回给前端
@Entity
public class User { ... }

// MapStruct 转换
UserDto toDto(User user);
```

**禁止** Entity 直接暴露 REST + 懒加载字段 JSON 序列化。

---

## 📌 金额与时间

```java
@Column(precision = 19, scale = 4)
private BigDecimal amount;

private Instant createdAt;      // 推荐
private LocalDate birthDate;
// 避免 java.util.Date
```

与 [数据库类型](../database/01-sql-basics)、[java.time](../java/core-java/vol2/06-date-time) 一致。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 无无参构造器 | JPA 要求 public/protected 无参构造 |
| `equals/hashCode` 用 id | 未持久化 id=null 时 Set 行为异常；可用业务键或 Hibernate 类级别建议 |
| `@Column nullable=false` 无 DB 约束 | 需 DDL 一致 |
| 双向关联 toString 循环 | 只打单面或 id |
| Lombok `@Data` on Entity | `@EqualsAndHashCode(onlyExplicitlyIncluded=true)` |

---

## 本章小结

- 映射注解 + 主键 IDENTITY + 枚举 STRING + 审计
- Entity 与 DTO 分离；逻辑删除、BigDecimal、Instant
- 生产 DDL 用迁移工具，不靠 ddl-auto update

---

## 下一步

- [关联关系与 Fetch](./03-relationships)

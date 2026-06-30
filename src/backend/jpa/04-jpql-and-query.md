# JPQL 与 Criteria 查询

[← 返回索引](./index)

> **本节目标：** 掌握 JPQL、@Query、原生 SQL、Specification 与分页排序。

---

## ⭐ JPQL 基础

**JPQL** = 面向**实体**的查询语言（不是表名）。

```java
// 实体名 Order，属性名 status — 不是表 orders
@Query("SELECT o FROM Order o WHERE o.status = :status AND o.createdAt >= :since")
List<Order> findRecent(@Param("status") OrderStatus status, @Param("since") Instant since);
```

| JPQL | SQL |
|------|-----|
| `FROM Order o` | `FROM orders o` |
| `o.user.username` | JOIN users |
| `COUNT(o)` | `COUNT(*)` |

---

## ⭐ 常用 JPQL 片段

```java
// 更新 / 删除 — 需 @Modifying + @Transactional
@Modifying(clearAutomatically = true)
@Query("UPDATE User u SET u.status = :status WHERE u.id = :id")
int updateStatus(@Param("id") Long id, @Param("status") UserStatus status);

@Modifying
@Query("DELETE FROM OrderItem i WHERE i.order.id = :orderId")
void deleteByOrderId(@Param("orderId") Long orderId);

// 聚合
@Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
List<Object[]> countByStatus();

// 构造函数投影
@Query("SELECT new com.example.dto.OrderDto(o.id, o.user.username, o.totalAmount) FROM Order o")
List<OrderDto> findOrderDtos();
```

---

## ⭐ 方法名派生查询

```java
public interface UserRepository extends JpaRepository<User, Long> {

  Optional<User> findByEmail(String email);

  List<User> findByStatusAndCreatedAtAfter(UserStatus status, Instant after);

  boolean existsByUsername(String username);

  long countByStatus(UserStatus status);

  Page<User> findByStatus(UserStatus status, Pageable pageable);

  List<User> findTop10ByOrderByCreatedAtDesc();
}
```

**关键字：** `And`、`Or`、`Between`、`Like`、`In`、`IsNull`、`OrderBy`、`Top`/`First`。

**过长方法名** → 改 `@Query` 或 Specification。

---

## ⭐ 分页与排序

```java
Page<User> page = userRepo.findByStatus(
    UserStatus.ACTIVE,
    PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt")));

// page.getContent(), getTotalElements(), getTotalPages()
```

**深分页：** `OFFSET` 大时慢 — 见 [索引与 EXPLAIN](../database/02-index-and-explain)；游标 `WHERE id > :lastId LIMIT 20`。

---

## ⭐ 原生 SQL

```java
@Query(value = """
    SELECT u.id, u.username, COUNT(o.id) AS order_count
    FROM users u
    LEFT JOIN orders o ON o.user_id = u.id
    GROUP BY u.id, u.username
    HAVING COUNT(o.id) > :minOrders
    """, nativeQuery = true)
List<Object[]> findActiveBuyers(@Param("minOrders") long minOrders);

// 接口投影
@Query(value = "SELECT id, username FROM users WHERE id = :id", nativeQuery = true)
Optional<UserSummary> findSummaryById(@Param("id") Long id);
```

**注意：** 换库 SQL 可能不兼容；复杂报表可 **MyBatis 并存**。

---

## ⭐ Specification（动态条件）

```java
public class UserSpecs {
  public static Specification<User> hasStatus(UserStatus status) {
    return (root, query, cb) ->
        status == null ? null : cb.equal(root.get("status"), status);
  }

  public static Specification<User> usernameLike(String keyword) {
    return (root, query, cb) ->
        keyword == null ? null : cb.like(root.get("username"), "%" + keyword + "%");
  }
}

// Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {}

// Service
Specification<User> spec = Specification
    .where(UserSpecs.hasStatus(status))
    .and(UserSpecs.usernameLike(keyword));
Page<User> page = userRepo.findAll(spec, pageable);
```

**Type-safe 替代：** **Querydsl** 或 **Blaze-Persistence**（大型项目）。

---

## ⭐ Criteria API（了解）

与 Specification 底层相同，类型安全但冗长：

```java
CriteriaBuilder cb = em.getCriteriaBuilder();
CriteriaQuery<User> cq = cb.createQuery(User.class);
Root<User> root = cq.from(User.class);
cq.select(root).where(cb.equal(root.get("status"), UserStatus.ACTIVE));
List<User> list = em.createQuery(cq).getResultList();
```

日常优先 **@Query / 方法名 / Specification**。

---

## 📌 只读查询优化

```java
@Transactional(readOnly = true)
@Query("SELECT u FROM User u WHERE u.id = :id")
Optional<User> findByIdReadOnly(@Param("id") Long id);
```

Hibernate：`readOnly=true` 可跳过 dirty checking。

---

## 📌 二级缓存（了解）

```java
@Entity
@Cacheable
@org.hibernate.annotations.Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Product { }
```

需配置 EhCache/Redis 等 — **热点只读、变更少** 的维表可考虑；默认不必开。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| @Modifying 无 @Transactional | 更新失败 |
| JPQL 用表名 | 应用实体名 |
| `SELECT o FROM Order o JOIN FETCH o.items` 分页 | 结果集膨胀 |
| LIKE 前导 `%` | 索引失效 |
| 方法名 typo | 启动时报错 PropertyReferenceException |

---

## 本章小结

- JPQL 面向实体；复杂用 @Query，动态用 Specification
- 分页 Pageable；报表可用 nativeQuery
- @Modifying 要事务；深分页注意性能

---

## 下一步

- [Spring Data JPA 实战](./05-spring-data-jpa)

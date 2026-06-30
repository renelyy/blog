# 关联关系与 Fetch

[← 返回索引](./index)

> **本节目标：** 掌握 @OneToMany、@ManyToOne、@ManyToMany，以及懒加载与 N+1 问题。

---

## ⭐ 关系类型

| 注解 | 说明 | 外键位置 |
|------|------|----------|
| `@ManyToOne` | 多对一 | **当前表** |
| `@OneToMany` | 一对多 | 对方表 |
| `@OneToOne` | 一对一 | 一方或独立表 |
| `@ManyToMany` | 多对多 | **中间表** |

**规范：** 双向关联**只在一方维护**（`mappedBy` 方只读）；优先 **ManyToOne + OneToMany**，慎用 ManyToMany。

---

## ⭐ 一对多 / 多对一（订单示例）

```java
@Entity
public class Order {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<OrderItem> items = new ArrayList<>();

  public void addItem(OrderItem item) {
    items.add(item);
    item.setOrder(this);
  }
}

@Entity
public class OrderItem {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "order_id")
  private Order order;

  private Long productId;
  private int quantity;
}
```

| 属性 | 说明 |
|------|------|
| `mappedBy = "order"` | OrderItem 拥有外键，Order.items 反向 |
| `cascade = ALL` | 保存 Order 级联 items |
| `orphanRemoval = true` | 从 list 移除 item → DELETE |
| `FetchType.LAZY` | **默认多对一/一对多懒加载** |

---

## ⭐ Fetch 策略

| 类型 | 行为 |
|------|------|
| **LAZY** | 访问时才 SELECT — 默认（ToMany） |
| **EAGER** | 主查询时 JOIN/额外 SELECT — ToOne 默认 EAGER |

```java
@ManyToOne(fetch = FetchType.LAZY)  // 推荐显式 LAZY
private User user;
```

**生产：** 关联几乎全 **LAZY**；需要时用 **JOIN FETCH** 或 **EntityGraph** 一次加载。

---

## ⭐ N+1 问题

```java
// 1 条 SQL 查 100 个订单
List<Order> orders = orderRepo.findAll();
// 访问 order.getUser() → 每条 1 次 SELECT → 共 101 次
orders.forEach(o -> o.getUser().getUsername());
```

### 解决 1：JOIN FETCH（JPQL）

```java
@Query("SELECT o FROM Order o JOIN FETCH o.user WHERE o.status = :status")
List<Order> findWithUser(@Param("status") OrderStatus status);
```

### 解决 2：@EntityGraph

```java
@EntityGraph(attributePaths = {"user", "items"})
List<Order> findByStatus(OrderStatus status);
```

### 解决 3：DTO 投影 / @Query 只查需要的列

```java
@Query("SELECT new com.example.OrderSummary(o.id, o.user.username) FROM Order o")
List<OrderSummary> findSummaries();
```

### 解决 4：批量抓取（Hibernate 配置）

```yaml
spring.jpa.properties.hibernate.default_batch_fetch_size: 16
```

---

## ⭐ 多对多

```java
@Entity
public class Student {
  @ManyToMany
  @JoinTable(
      name = "student_course",
      joinColumns = @JoinColumn(name = "student_id"),
      inverseJoinColumns = @JoinColumn(name = "course_id"))
  private Set<Course> courses = new HashSet<>();
}
```

**企业更推荐：** 中间表**实体化**（Enrollment），带成绩、时间 — 变 Two ManyToOne。

---

## ⭐ Cascade 与孤儿

| CascadeType | 说明 |
|-------------|------|
| `PERSIST` | 级联 persist |
| `MERGE` | 级联 merge |
| `REMOVE` | 级联 remove |
| `ALL` | 以上 |

**不要** 对 `@ManyToOne` 轻易 `CascadeType.ALL` — 可能误删共享 User。

---

## 📌 分页与关联

```java
// 错误：分页 + fetch join 集合 → 内存分页不准
@Query(value = "SELECT o FROM Order o JOIN FETCH o.items",
       countQuery = "SELECT count(o) FROM Order o")
Page<Order> findAllWithItems(Pageable pageable);
// 应对：只 fetch ToOne；或 @BatchSize；或分两步查
```

---

## 📌 open-in-view

```yaml
spring.jpa.open-in-view: false
```

- `true`（Boot 默认）：整个 HTTP 请求内 Session 打开 → Controller 访问懒加载不报错，**隐藏 N+1**
- `false`：**推荐** — Service 层显式 fetch 或 DTO

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| N+1 | 见上；开 SQL 日志排查 |
| 双向关联不设 mappedBy | 两表都维护外键 |
| EAGER 一对多 | findAll 爆炸 JOIN |
| LazyInitializationException | Session 外访问 lazy — open-in-view=false 后常见 |
| equals 双向集合 | 只在一端 add |

---

## 本章小结

- 外键在 Many 侧；`mappedBy` 维护反向
- 默认 LAZY + 按需 JOIN FETCH / EntityGraph
- N+1 是 JPA 第一性能杀手，必须会查会修

---

## 下一步

- [JPQL 与 Criteria 查询](./04-jpql-and-query)

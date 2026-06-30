# 第 5 章：JDBC 与数据库编程

[← 卷 II 目录](../index)

> 原书 Chapter 5 — Database Programming

---

## ⭐ JDBC 架构

```text
应用代码
   ↓ JDBC API（java.sql）
JDBC 驱动（MySQL Connector、PostgreSQL JDBC…）
   ↓ 数据库协议
MySQL / PostgreSQL / Oracle …
```

Spring JDBC、MyBatis、JPA **底层都是 JDBC**。懂 JDBC 才能排查：连接泄漏、事务未提交、驱动兼容。

---

## ⭐ 核心接口

| 接口 | 作用 |
|------|------|
| `Connection` | 数据库会话 |
| `Statement` | 静态 SQL（**避免**拼接） |
| `PreparedStatement` | 预编译 + 参数绑定 |
| `CallableStatement` | 存储过程 |
| `ResultSet` | 查询结果游标 |
| `DataSource` | 连接池抽象（生产必用） |

---

## ⭐ 基本查询

```java
String url = "jdbc:mysql://localhost:3306/demo"
    + "?useSSL=false&serverTimezone=Asia/Shanghai&characterEncoding=utf8";
String user = System.getenv("DB_USER");
String pass = System.getenv("DB_PASS");

try (Connection conn = DriverManager.getConnection(url, user, pass);
     PreparedStatement ps = conn.prepareStatement(
         "SELECT id, name, email, status FROM users WHERE id = ? AND status = ?")) {

  ps.setLong(1, 1L);
  ps.setString(2, "ACTIVE");

  try (ResultSet rs = ps.executeQuery()) {
    while (rs.next()) {
      long id = rs.getLong("id");
      String name = rs.getString("name");
      String email = rs.getString("email");
      // rs.getObject("created_at", LocalDateTime.class);  // JDBC 4.2+
    }
  }
}
```

**永远用 `PreparedStatement`** — 防 SQL 注入：

```java
// 危险 — 永远不要
String sql = "SELECT * FROM users WHERE name = '" + input + "'";
```

---

## ⭐ 更新与批处理

```java
try (PreparedStatement ps = conn.prepareStatement(
    "INSERT INTO users (name, email) VALUES (?, ?)")) {
  for (User u : batch) {
    ps.setString(1, u.getName());
    ps.setString(2, u.getEmail());
    ps.addBatch();
  }
  int[] counts = ps.executeBatch();
}
```

---

## ⭐ 事务

```java
conn.setAutoCommit(false);
try {
  debit(conn, fromAccount, amount);
  credit(conn, toAccount, amount);
  conn.commit();
} catch (SQLException ex) {
  conn.rollback();
  throw ex;
} finally {
  conn.setAutoCommit(true);
}
```

**隔离级别：**

```java
conn.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);
```

| 级别 | 脏读 | 不可重复读 | 幻读 |
|------|------|------------|------|
| READ UNCOMMITTED | 可能 | 可能 | 可能 |
| READ COMMITTED | 否 | 可能 | 可能 |
| REPEATABLE READ | 否 | 否 | InnoDB 大致否 |
| SERIALIZABLE | 否 | 否 | 否 |

Spring `@Transactional` 自动管理连接与提交/回滚，见 [Spring 事务](../../../spring/framework/04-data-transaction)。

---

## ⭐ `DataSource` 与连接池

生产**禁止**每次 `DriverManager.getConnection`：

```java
HikariConfig config = new HikariConfig();
config.setJdbcUrl(url);
config.setUsername(user);
config.setPassword(pass);
config.setMaximumPoolSize(20);
config.setMinimumIdle(5);
config.setConnectionTimeout(30_000);
config.setIdleTimeout(600_000);
config.setMaxLifetime(1_800_000);

DataSource ds = new HikariDataSource(config);
try (Connection conn = ds.getConnection()) { /* ... */ }
```

Spring Boot 默认 HikariCP：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/demo
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      pool-name: MainPool
```

**连接泄漏征兆：** 池耗尽、获取连接超时 — 检查未 close、事务未结束。

---

## 📌 ResultSet 类型与滚动

```java
PreparedStatement ps = conn.prepareStatement(sql,
    ResultSet.TYPE_SCROLL_INSENSITIVE,
    ResultSet.CONCUR_READ_ONLY);
ResultSet rs = ps.executeQuery();
rs.last();
int rows = rs.getRow();
```

MyBatis 默认 forward-only；特殊报表可能用到。

---

## 📌 元数据

```java
DatabaseMetaData meta = conn.getMetaData();
ResultSet tables = meta.getTables(null, null, "users", new String[]{"TABLE"});

ResultSetMetaData rsMeta = rs.getMetaData();
int colCount = rsMeta.getColumnCount();
String colName = rsMeta.getColumnName(1);
```

代码生成器、多数据源工具会用。

---

## 📌 SQL 基础（原书 5.2）

```sql
-- 查询
SELECT id, name FROM users WHERE status = 'ACTIVE' ORDER BY id LIMIT 10 OFFSET 0;

-- 聚合
SELECT dept_id, COUNT(*) cnt FROM users GROUP BY dept_id HAVING cnt > 5;

-- 连接
SELECT u.name, d.dept_name
FROM users u INNER JOIN dept d ON u.dept_id = d.id;

-- 子查询 / EXISTS
SELECT * FROM orders o
WHERE EXISTS (SELECT 1 FROM order_item i WHERE i.order_id = o.id);

-- DML
INSERT INTO users (name, email) VALUES (?, ?);
UPDATE users SET name = ? WHERE id = ?;
DELETE FROM users WHERE id = ?;
```

复杂 SQL 在 MyBatis XML 或 DBA 审核后上线。

---

## 📌 与 ORM 分工

| 层次 | 技术 |
|------|------|
| 简单 CRUD | MyBatis-Plus / JPA |
| 复杂 SQL | MyBatis XML |
| 多数据源 | dynamic-datasource |
| 连接池 | HikariCP |
| 事务 | Spring `@Transactional` |

- [MyBatis 快速上手](../../../mybatis/01-quick-start)
- [MyBatis Spring Boot 集成](../../../mybatis/11-spring-boot)
- [Spring Boot 数据访问](../../../spring/boot/05-data-access)

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| 字符串拼 SQL | SQL 注入 |
| 不 close 资源 | try-with-resources |
| 长事务 | 锁表、池耗尽 |
| N+1 查询 | ORM 懒加载或循环查库 |
| `SELECT *` | 浪费 IO；指定列 |

---

## 本章小结

- JDBC = Connection + PreparedStatement + ResultSet + 事务
- 生产用 DataSource 连接池
- 框架封装日常开发，排障仍需 JDBC 功底

---

## 下一步

- [第 6 章：日期与时间](./06-date-time)

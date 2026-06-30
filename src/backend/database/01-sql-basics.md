# SQL 基础与范式

[← 返回索引](./index)

> **本节目标：** 掌握 DDL/DML、JOIN、聚合、子查询与表设计基础，能写出 MyBatis/Spring 背后对应的 SQL。

---

## ⭐ SQL 语言分类

| 类型 | 全称 | 作用 | 示例 |
|------|------|------|------|
| **DDL** | Data Definition | 定义结构 | `CREATE TABLE`、`ALTER` |
| **DML** | Data Manipulation | 增删改查 | `INSERT`、`UPDATE`、`DELETE`、`SELECT` |
| **DCL** | Data Control | 权限 | `GRANT`、`REVOKE` |
| **TCL** | Transaction Control | 事务 | `COMMIT`、`ROLLBACK` |

企业开发 **90% 是 DML + 少量 DDL**（Flyway/Liquibase 管理表结构变更）。

---

## ⭐ DDL：建表

```sql
CREATE TABLE users (
  id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
  username    VARCHAR(64)  NOT NULL COMMENT '登录名',
  email       VARCHAR(128) NOT NULL COMMENT '邮箱',
  status      TINYINT      NOT NULL DEFAULT 1 COMMENT '1启用 0禁用',
  dept_id     BIGINT       NULL COMMENT '部门ID',
  created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
                         ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_username (username),
  KEY idx_dept_status (dept_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='用户表';
```

**企业规范：**

- 字符集 **utf8mb4**（支持 emoji、完整 Unicode）
- 主键优先 **BIGINT 自增** 或 **雪花 ID**（分布式）
- 每张表必有 `created_at` / `updated_at`
- 逻辑删除用 `deleted`（0/1）或 `deleted_at`，不要物理删业务数据

```sql
ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL AFTER email;
ALTER TABLE users DROP INDEX idx_old;
```

---

## ⭐ DML：增删改查

### INSERT

```sql
INSERT INTO users (username, email, dept_id)
VALUES ('tom', 'tom@example.com', 10);

-- 批量
INSERT INTO users (username, email) VALUES
  ('a', 'a@x.com'),
  ('b', 'b@x.com');

-- 插入或更新（MySQL）
INSERT INTO users (id, username, email)
VALUES (1, 'tom', 'new@example.com')
ON DUPLICATE KEY UPDATE email = VALUES(email), updated_at = NOW(3);
```

### UPDATE / DELETE

```sql
UPDATE users SET status = 0, updated_at = NOW(3) WHERE id = 1001;

-- 逻辑删除（推荐）
UPDATE users SET deleted = 1, updated_at = NOW(3) WHERE id = 1001;

DELETE FROM users WHERE id = 1001;  -- 仅测试/归档表
```

**规范：** UPDATE/DELETE **必须带 WHERE**；生产先 `SELECT` 确认影响行数。

### SELECT 基础

```sql
SELECT id, username, email, status
FROM users
WHERE status = 1
  AND dept_id IN (10, 20)
  AND created_at >= '2024-01-01'
ORDER BY id DESC
LIMIT 20 OFFSET 0;
```

| 子句 | 顺序 | 说明 |
|------|------|------|
| SELECT | 1 | 列或表达式 |
| FROM | 2 | 表 |
| JOIN | 3 | 连接 |
| WHERE | 4 | 行过滤（索引友好） |
| GROUP BY | 5 | 分组 |
| HAVING | 6 | 分组后过滤 |
| ORDER BY | 7 | 排序 |
| LIMIT | 8 | 分页 |

---

## ⭐ JOIN 连接

```sql
-- 内连接：两表都匹配才出现
SELECT u.id, u.username, d.dept_name
FROM users u
INNER JOIN dept d ON u.dept_id = d.id
WHERE u.status = 1;

-- 左连接：保留左表全部行
SELECT u.username, o.order_no
FROM users u
LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'PAID';

-- 自连接
SELECT e.name AS emp, m.name AS manager
FROM employee e
LEFT JOIN employee m ON e.manager_id = m.id;
```

| 类型 | 说明 |
|------|------|
| INNER JOIN | 交集 |
| LEFT JOIN | 左表全保留，右表无匹配则 NULL |
| RIGHT JOIN | 右表全保留（少用，可改 LEFT） |
| CROSS JOIN | 笛卡尔积（慎用） |

**MyBatis 多表：** 复杂 JOIN 写在 XML；简单 1-N 可拆两次查询避免大 JOIN。

---

## ⭐ 聚合与子查询

```sql
-- 聚合
SELECT dept_id, COUNT(*) AS cnt, AVG(salary) AS avg_sal
FROM employee
WHERE status = 1
GROUP BY dept_id
HAVING cnt > 5;

-- 子查询（IN）
SELECT * FROM users
WHERE dept_id IN (SELECT id FROM dept WHERE region = '华东');

-- 子查询（EXISTS）— 有时比 IN 更优
SELECT * FROM orders o
WHERE EXISTS (
  SELECT 1 FROM order_item i
  WHERE i.order_id = o.id AND i.product_id = 100
);

-- 派生表
SELECT t.dept_id, t.cnt
FROM (
  SELECT dept_id, COUNT(*) AS cnt FROM employee GROUP BY dept_id
) t
WHERE t.cnt > 10;
```

---

## ⭐ 常用函数

```sql
-- 字符串
CONCAT(last_name, ', ', first_name)
SUBSTRING(email, 1, LOCATE('@', email) - 1)

-- 日期（MySQL 8 推荐与 java.time 对应）
NOW(3)
DATE_FORMAT(created_at, '%Y-%m-%d')
DATE_ADD(NOW(), INTERVAL 7 DAY)

-- 条件
IFNULL(phone, 'N/A')
CASE status WHEN 1 THEN '启用' WHEN 0 THEN '禁用' ELSE '未知' END

-- 窗口函数（MySQL 8+）
SELECT id, username, dept_id,
       ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY created_at) AS rn
FROM users;
```

---

## ⭐ 数据库范式（表设计）

| 范式 | 要求 | 目的 |
|------|------|------|
| **1NF** | 列原子、无重复组 | 字段不可再拆 |
| **2NF** | 1NF + 非主键列完全依赖主键 | 消除部分依赖 |
| **3NF** | 2NF + 非主键列不依赖其他非主键列 | 消除传递依赖 |

**反范式（企业常见）：** 为查询性能冗余字段，如订单表存 `user_name` 快照，用空间换 JOIN。

### 典型 ER 示例

```text
users (1) ──< orders (N) ──< order_items (N) >── products (1)
dept  (1) ──< users   (N)
```

**设计原则：**

- 实体表 + 关联表（N-N 用中间表）
- 金额 `DECIMAL(19,4)`，不用 `DOUBLE`
- 状态用 `TINYINT` 或 `VARCHAR` 枚举码，文档化含义

---

## 📌 与 MyBatis / JDBC 对应

MyBatis XML 中就是上述 SQL + `#{}` 占位：

```xml
<select id="findByDept" resultType="User">
  SELECT id, username, email, status
  FROM users
  WHERE dept_id = #{deptId} AND status = 1 AND deleted = 0
  ORDER BY id DESC
  LIMIT #{offset}, #{pageSize}
</select>
```

见 [MyBatis XML 映射](../mybatis/04-xml-mapper)、[JDBC 章节](../java/core-java/vol2/05-jdbc)。

---

## 📌 企业实践

| 实践 | 说明 |
|------|------|
| 表结构变更 | Flyway/Liquibase 脚本入 Git，禁止手工改生产 |
| 命名 | 小写蛇形 `order_item`；索引 `idx_` / 唯一 `uk_` |
| 分页 | 深分页用「上次最大 id」代替大 OFFSET |
| EXPLAIN | 上线前对核心 SQL 跑执行计划（下章） |

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| `SELECT *` | 浪费 IO；ORM 映射明确列 |
| 无 WHERE 的 UPDATE/DELETE | 全表事故 |
| utf8 非 utf8mb4 | emoji 乱码/截断 |
| 浮点存金额 | 精度丢失 → DECIMAL |
| 大 OFFSET | `LIMIT 1000000, 20` 极慢 |
| 隐式类型转换 | `WHERE phone = 13800138000` 若 phone 是 varchar 可能不走索引 |

---

## 本章小结

- DDL 管结构，DML 管数据；建表 utf8mb4 + 主键 + 时间戳
- JOIN / 聚合 / 子查询是复杂报表与 MyBatis XML 的基础
- 范式指导建模，适度反范式换性能

---

## 下一步

- [索引与 EXPLAIN](./02-index-and-explain)

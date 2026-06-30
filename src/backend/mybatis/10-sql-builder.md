# SQL 构建器

[← 返回索引](./index)

> **本节你将学到：** 在 Java 代码中优雅拼接 SQL，配合 `@SelectProvider` 使用。

---

## 解决什么问题？

在 Java 里手写 SQL 字符串：

- `+` 拼接易丢空格
- `WHERE` / `AND` 逻辑混乱
- 可读性差

MyBatis 提供 `org.apache.ibatis.jdbc.SQL` 类（3.2+），类似流式 API。

---

## ⭐ 基本用法

::: v-pre
```java
public String selectPersonSql() {
  return new SQL() {{
    SELECT("P.ID, P.USERNAME, P.PASSWORD, P.FULL_NAME");
    SELECT("P.LAST_NAME, P.CREATED_ON, P.UPDATED_ON");
    FROM("PERSON P");
    INNER_JOIN("DEPARTMENT D ON D.ID = P.DEPARTMENT_ID");
    WHERE("P.ID = A.ID");
    WHERE("P.FIRST_NAME LIKE ?");
    OR();
    WHERE("P.LAST_NAME LIKE ?");
    ORDER_BY("P.ID");
  }}.toString();
}
```
:::

两种风格：

- **匿名内部类双括号** — `new SQL()` 加双括号初始化块
- **链式** — `new SQL().SELECT(...).FROM(...).toString()`

---

## 📌 动态条件

::: v-pre
```java
public String selectPersonLike(final String id, final String firstName, final String lastName) {
  return new SQL() {{
    SELECT("P.ID, P.USERNAME, P.FULL_NAME");
    FROM("PERSON P");
    if (id != null) {
      WHERE("P.ID LIKE #{id}");
    }
    if (firstName != null) {
      WHERE("P.FIRST_NAME LIKE #{firstName}");
    }
    if (lastName != null) {
      WHERE("P.LAST_NAME LIKE #{lastName}");
    }
    ORDER_BY("P.LAST_NAME");
  }}.toString();
}
```
:::

匿名内部类访问外部变量时，变量需 **final**（或 effectively final）。

---

## 📌 常用方法

| 方法 | 说明 |
|------|------|
| `SELECT` / `SELECT_DISTINCT` | SELECT 子句 |
| `FROM` | FROM |
| `JOIN` / `INNER_JOIN` / `LEFT_OUTER_JOIN` / `RIGHT_OUTER_JOIN` | 连接 |
| `WHERE` | 自动 AND 连接；`OR()` 切换 OR |
| `GROUP_BY` / `HAVING` | 分组 |
| `ORDER_BY` | 排序 |
| `INSERT_INTO` / `VALUES` / `INTO_COLUMNS` / `INTO_VALUES` | INSERT |
| `UPDATE` / `SET` | UPDATE |
| `DELETE_FROM` | DELETE |
| `LIMIT` / `OFFSET` | 分页（3.5.2+，原样插入，不转换方言） |
| `OFFSET_ROWS` / `FETCH_FIRST_ROWS_ONLY` | 标准分页语法 |
| `ADD_ROW` | 批量 INSERT 多行（3.5.2+） |

3.4.2+ 支持可变参数：

```java
return new SQL()
  .SELECT("P.ID", "A.USERNAME")
  .FROM("PERSON P", "ACCOUNT A")
  .WHERE("P.ID = A.ID", "P.FULL_NAME LIKE #{name}")
  .toString();
```

### 批量插入（3.5.2+）

```java
return new SQL()
  .INSERT_INTO("PERSON")
  .INTO_COLUMNS("ID", "FULL_NAME")
  .INTO_VALUES("#{mainPerson.id}", "#{mainPerson.fullName}")
  .ADD_ROW()
  .INTO_VALUES("#{subPerson.id}", "#{subPerson.fullName}")
  .toString();
```

---

## 🔧 已废弃：SqlBuilder / SelectBuilder

3.2 之前基于 ThreadLocal 的 `SqlBuilder`、`SelectBuilder` **已废弃**，请用 `SQL` 类。

```java
// 勿用
import static org.apache.ibatis.jdbc.SqlBuilder.*;
```

---

## 与 Provider 配合

见 [注解映射 - @SelectProvider](./08-annotations.md#selectprovider--insertprovider-等)。

---

## 下一步

- [附录：速查表](./appendix-reference.md)

# 结果映射（resultMap）

[← 返回索引](./index)

> **本节你将学到：** 何时需要 resultMap、关联/集合映射、N+1 问题、自动映射等级。

---

## 什么时候需要 resultMap？

| 场景 | 方案 |
|------|------|
| 列名 = 属性名（或驼峰） | `resultType` 即可 ⭐ |
| 列名不一致 | `resultMap` 或 SQL 别名 📌 |
| 一对一 / 一对多 / 继承 | `association` / `collection` / `discriminator` 📎 |
| 构造器注入不可变对象 | `constructor` 📎 |

---

## ⭐ 基础 resultMap

```xml
<resultMap id="userResultMap" type="User">
  <id property="id" column="user_id"/>
  <result property="username" column="user_name"/>
  <result property="password" column="hashed_password"/>
</resultMap>

<select id="selectUser" resultMap="userResultMap">
  SELECT user_id, user_name, hashed_password FROM users WHERE id = #{id}
</select>
```

| 子元素 | 作用 |
|--------|------|
| `id` | 主键标识，缓存与嵌套映射性能关键 |
| `result` | 普通字段映射 |

**最佳实践：** 复杂 resultMap **逐步构建**，每步写单元测试。

---

## 📌 association（一对一）

两种加载方式：

### 方式 A：嵌套 Select（简单，注意 N+1）

```xml
<resultMap id="blogResult" type="Blog">
  <association property="author" column="author_id"
               javaType="Author" select="selectAuthor"/>
</resultMap>

<select id="selectBlog" resultMap="blogResult">
  SELECT * FROM BLOG WHERE ID = #{id}
</select>

<select id="selectAuthor" resultType="Author">
  SELECT * FROM AUTHOR WHERE ID = #{id}
</select>
```

**N+1 问题：** 1 次查列表 + N 次查关联 = 性能差。可配合 `lazyLoadingEnabled` 延迟加载，但循环里仍会触发大量查询。

### 方式 B：嵌套结果（JOIN，推荐）📌

```xml
<select id="selectBlog" resultMap="blogResult">
  SELECT
    B.id AS blog_id, B.title AS blog_title,
    A.id AS author_id, A.username AS author_username
  FROM Blog B
  LEFT JOIN Author A ON B.author_id = A.id
  WHERE B.id = #{id}
</select>

<resultMap id="blogResult" type="Blog">
  <id property="id" column="blog_id"/>
  <result property="title" column="blog_title"/>
  <association property="author" javaType="Author">
    <id property="id" column="author_id"/>
    <result property="username" column="author_username"/>
  </association>
</resultMap>
```

**⚠️ 嵌套结果必须指定能唯一标识行的 `id` 元素**，否则性能与正确性都有问题。

### columnPrefix（同一 resultMap 复用）

```xml
<association property="coAuthor" resultMap="authorResult" columnPrefix="co_"/>
```

---

## 📌 collection（一对多）

```xml
<resultMap id="blogResult" type="Blog">
  <id property="id" column="blog_id"/>
  <collection property="posts" ofType="Post">
    <id property="id" column="post_id"/>
    <result property="subject" column="post_subject"/>
  </collection>
</resultMap>
```

读作：`posts` 是 `Post` 的 `List`。

| 属性 | 说明 |
|------|------|
| `ofType` | 集合**元素**类型（必填语义） |
| `javaType` | 集合类型如 `ArrayList`（常可省略） |

嵌套 Select 与嵌套结果的选择逻辑同 `association`。

---

## 📎 多结果集（ResultSet）

存储过程一次返回多个结果集时：

```xml
<select id="selectBlog" resultSets="blogs,authors" resultMap="blogResult" statementType="CALLABLE">
  {call getBlogsAndAuthors(#{id,jdbcType=INTEGER,mode=IN})}
</select>

<resultMap id="blogResult" type="Blog">
  <id property="id" column="id"/>
  <association property="author" resultSet="authors" column="author_id" foreignColumn="id">
    ...
  </association>
</resultMap>
```

---

## 📎 discriminator（鉴别器）

根据某列值映射不同子类型（类似 switch）：

```xml
<resultMap id="vehicleResult" type="Vehicle">
  <id property="id" column="id"/>
  <discriminator javaType="int" column="vehicle_type">
    <case value="1" resultMap="carResult"/>
    <case value="2" resultMap="truckResult"/>
  </discriminator>
</resultMap>

<resultMap id="carResult" type="Car" extends="vehicleResult">
  <result property="doorCount" column="door_count"/>
</resultMap>
```

---

## 📎 constructor（构造器映射）

```xml
<constructor>
  <idArg column="id" javaType="int" name="id"/>
  <arg column="username" javaType="String" name="username"/>
</constructor>
```

Java 8+ 配合 `-parameters` 和 `useActualParamName`，`arg` 顺序可与构造器不一致。

---

## ⭐ 自动映射（autoMapping）

全局由 `autoMappingBehavior` 控制：

| 等级 | 行为 |
|----------|------|
| `NONE` | 关闭 |
| `PARTIAL` | **默认**；不自动映射嵌套 resultMap 内部 |
| `FULL` | 全部自动映射；JOIN 时可能误映射同名列 ⚠️ |

单条 resultMap 可覆盖：

```xml
<resultMap id="userMap" type="User" autoMapping="false">
  <result property="password" column="hashed_password"/>
</resultMap>
```

配合 `mapUnderscoreToCamelCase=true` 可自动 `user_name` → `userName`。

---

## 支持的 JDBC 类型

用于 `jdbcType=` 声明：`VARCHAR`、`INTEGER`、`TIMESTAMP`、`CLOB`、`BLOB`、`CURSOR` 等。完整列表见 [附录](./appendix-reference.md#jdbc-类型)。

---

## 下一步

- [动态 SQL](./06-dynamic-sql.md)
- [缓存与日志](./09-cache-and-logging.md)

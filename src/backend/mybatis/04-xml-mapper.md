# XML 映射基础

[← 返回索引](./index)

> **本节你将学到：** Mapper XML 结构、CRUD 语句、参数绑定、`#{}` 与 `${}` 的区别。

---

## Mapper XML 顶层元素

按推荐顺序：

| 元素 | 优先级 | 说明 |
|------|--------|------|
| `cache` / `cache-ref` | 📎 | 缓存配置 |
| `resultMap` | 📌📎 | 结果映射 |
| `sql` | 📌 | 可复用 SQL 片段 |
| `insert` / `update` / `delete` / `select` | ⭐ | 语句 |

> 🔧 `parameterMap` 已**废弃**，不要用。

**文件头模板：**

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
  "https://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.mapper.UserMapper">
  <!-- ... -->
</mapper>
```

---

## ⭐ select（查询）

```xml
<select id="selectUser" parameterType="int" resultType="User">
  SELECT id, username, password FROM users WHERE id = #{id}
</select>
```

### 常用属性

| 属性 | 说明 |
|------|------|
| `id` | 语句唯一 ID |
| `parameterType` | 入参类型（可省略，自动推断） |
| `resultType` | 返回类型；**集合时写元素类型**，不是 `List` |
| `resultMap` | 与 resultType **二选一** |
| `useCache` | 是否用二级缓存，select 默认 true |
| `flushCache` | 是否清空缓存，select 默认 false |
| `timeout` | 超时秒数 |
| `fetchSize` | 驱动 fetchSize 建议值 |
| `databaseId` | 多数据库厂商标识 |

---

## ⭐ insert / update / delete

```xml
<insert id="insertUser" useGeneratedKeys="true" keyProperty="id">
  INSERT INTO users (username, password)
  VALUES (#{username}, #{password})
</insert>

<update id="updateUser">
  UPDATE users SET username = #{username} WHERE id = #{id}
</update>

<delete id="deleteUser">
  DELETE FROM users WHERE id = #{id}
</delete>
```

### 自增主键

**方式 1：`useGeneratedKeys`（MySQL / SQL Server 等）**

```xml
<insert id="insertAuthor" useGeneratedKeys="true" keyProperty="id">
  INSERT INTO Author (username, password, email, bio)
  VALUES (#{username}, #{password}, #{email}, #{bio})
</insert>
```

**方式 2：`selectKey`（Oracle 序列等）**

```xml
<insert id="insertAuthor">
  <selectKey keyProperty="id" resultType="int" order="BEFORE">
    SELECT seq_users.nextval FROM dual
  </selectKey>
  INSERT INTO Author (id, username, ...) VALUES (#{id}, #{username}, ...)
</insert>
```

| selectKey 属性 | 说明 |
|----------------|------|
| `order` | BEFORE（先取 id 再 insert）/ AFTER |
| `keyProperty` | 回填到 Java 对象的属性 |
| `keyColumn` | 主键列名（PostgreSQL 等非第一列主键时必填） |

### 📌 批量插入

```xml
<insert id="batchInsert" useGeneratedKeys="true" keyProperty="id">
  INSERT INTO Author (username, password, email, bio) VALUES
  <foreach item="item" collection="list" separator=",">
    (#{item.username}, #{item.password}, #{item.email}, #{item.bio})
  </foreach>
</insert>
```

### 📎 INSERT/UPDATE/DELETE 返回行（PostgreSQL RETURNING 等）

```xml
<select id="insertAndGetAuthor" resultType="Author"
        affectData="true" flushCache="true">
  INSERT INTO Author (username, password, email, bio)
  VALUES (#{username}, #{password}, #{email}, #{bio})
  RETURNING id, username, password, email, bio
</select>
```

---

## 📌 sql 片段 + include

```xml
<sql id="userColumns">${alias}.id, ${alias}.username</sql>

<select id="selectUsers" resultType="User">
  SELECT
    <include refid="userColumns"><property name="alias" value="t"/></include>
  FROM users t
</select>
```

---

## ⭐ 参数 `#{}` vs `${}`

| 语法 | 行为 | 用途 | 安全 |
|------|------|------|------|
| `#{}` | 预编译 `?`，TypeHandler 设值 | **值** | ✅ 防注入 |
| `${}` | 字符串直接拼接 | **列名、表名、ORDER BY** | ⚠️ 有注入风险 |

```xml
<!-- 值：用 #{} -->
WHERE id = #{id}

<!-- 动态列名：用 ${}，且必须白名单校验 -->
WHERE ${column} = #{value}
ORDER BY ${orderColumn}
```

### 复杂参数

```xml
<!-- JavaBean：按属性名 -->
#{username}, #{password}

<!-- 可空列建议指定 jdbcType -->
#{middleInitial,jdbcType=VARCHAR}

<!-- 完整形式 -->
#{property, javaType=int, jdbcType=NUMERIC, typeHandler=MyHandler}
```

### 📌 多参数（Mapper 接口）

```java
User find(@Param("id") Long id, @Param("name") String name);
```

XML：`#{id}`、`#{name}`

无 `@Param` 时：`#{param1}`、`#{param2}`，或开启 `useActualParamName` 用编译参数名。

### 📎 存储过程 OUT 参数

```xml
#{department, mode=OUT, jdbcType=CURSOR, javaType=ResultSet, resultMap=departmentResultMap}
```

---

## ⭐ 简单结果映射（零配置）

列名与属性名一致（或驼峰映射开启）时，**无需 resultMap**：

```xml
<select id="selectUsers" resultType="User">
  SELECT id, username, hashed_password FROM users WHERE id = #{id}
</select>
```

列名不一致时：

```xml
<!-- 方式 1：SQL 别名 -->
SELECT user_id AS id, user_name AS userName FROM users

<!-- 方式 2：resultMap -->
<resultMap id="userMap" type="User">
  <id property="id" column="user_id"/>
  <result property="username" column="user_name"/>
</resultMap>
```

复杂关联、集合 → [结果映射](./05-result-mapping.md)

---

## 下一步

- [结果映射](./05-result-mapping.md)
- [动态 SQL](./06-dynamic-sql.md)

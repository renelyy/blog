# 动态 SQL

[← 返回索引](./index)

> **本节你将学到：** 条件拼接、WHERE 陷阱、IN 列表、注解里写动态 SQL。

---

## 为什么需要动态 SQL？

JDBC 时代拼接 SQL 的痛苦：

- 忘记空格、`AND` / `WHERE` 重复
- 列表末尾多余逗号
- 可读性差、难维护

MyBatis 动态 SQL 用 XML 标签（OGNL 表达式）解决上述问题。

---

## ⭐ if

```xml
<select id="findActiveBlogLike" resultType="Blog">
  SELECT * FROM BLOG WHERE state = 'ACTIVE'
  <if test="title != null">
    AND title LIKE #{title}
  </if>
  <if test="author != null and author.name != null">
    AND author_name LIKE #{author.name}
  </if>
</select>
```

`test` 里是 OGNL 表达式，可访问参数对象属性。

---

## 📌 choose / when / otherwise

类似 Java `switch`，多条件**只选其一**：

```xml
<choose>
  <when test="title != null">
    AND title LIKE #{title}
  </when>
  <when test="author != null and author.name != null">
    AND author_name LIKE #{author.name}
  </when>
  <otherwise>
    AND featured = 1
  </otherwise>
</choose>
```

---

## ⭐ where / set / trim

### 问题：裸 if 拼接 WHERE

```sql
-- 全 null 时 → 语法错误
SELECT * FROM BLOG WHERE

-- 第一个 null、第二个有值 → 语法错误
SELECT * FROM BLOG WHERE AND title LIKE ...
```

### 解决：where

```xml
<select id="findActiveBlogLike" resultType="Blog">
  SELECT * FROM BLOG
  <where>
    <if test="state != null">state = #{state}</if>
    <if test="title != null">AND title LIKE #{title}</if>
  </where>
</select>
```

`where` 会：

- 无内容时不插入 WHERE
- 去掉开头多余的 AND / OR

### set（动态 UPDATE）

```xml
<update id="updateAuthorIfNecessary">
  UPDATE Author
  <set>
    <if test="username != null">username = #{username},</if>
    <if test="password != null">password = #{password},</if>
  </set>
  WHERE id = #{id}
</update>
```

自动处理多余逗号。

### trim（通用版）

```xml
<!-- 等价于 where -->
<trim prefix="WHERE" prefixOverrides="AND |OR ">
  ...
</trim>

<!-- 等价于 set -->
<trim prefix="SET" suffixOverrides=",">
  ...
</trim>
```

---

## ⭐ foreach（IN 查询）

```xml
<select id="selectPostInTracker" resultType="Post">
  SELECT * FROM POST P
  <where>
    <foreach item="item" index="index" collection="list"
             open="ID IN (" separator="," close=")" nullable="true">
      #{item}
    </foreach>
  </where>
</select>
```

| 属性 | 说明 |
|------|------|
| `collection` | List、Set、数组、Map |
| `item` | 当前元素变量名 |
| `index` | 索引（List/数组）或 key（Map） |
| `open/separator/close` | 括号与分隔符 |
| `nullable` | 集合为空时的行为（3.5.9+，默认见 settings） |

---

## 📌 bind（OGNL 外建变量）

```xml
<select id="selectBlogsLike" resultType="Blog">
  <bind name="pattern" value="'%' + _parameter.getTitle() + '%'"/>
  SELECT * FROM BLOG WHERE title LIKE #{pattern}
</select>
```

---

## 📎 script（注解中的动态 SQL）

```java
@Update({"<script>",
  "UPDATE Author",
  "  <set>",
  "    <if test='username != null'>username=#{username},</if>",
  "    <if test='password != null'>password=#{password},</if>",
  "  </set>",
  "WHERE id=#{id}",
  "</script>"})
void updateAuthorValues(Author author);
```

---

## 📎 多数据库（_databaseId）

配置 `databaseIdProvider` 后：

```xml
<insert id="insert">
  <selectKey keyProperty="id" resultType="int" order="BEFORE">
    <if test="_databaseId == 'oracle'">
      SELECT seq_users.nextval FROM dual
    </if>
    <if test="_databaseId == 'db2'">
      SELECT nextval FOR seq_users FROM sysibm.sysdummy1
    </if>
  </selectKey>
  INSERT INTO users VALUES (#{id}, #{name})
</insert>
```

---

## 📎 自定义脚本语言（LanguageDriver）

实现 `org.apache.ibatis.scripting.LanguageDriver`，可替换默认 XML 语言驱动。

```xml
<settings>
  <setting name="defaultScriptingLanguage" value="myLanguage"/>
</settings>
```

语句级：`lang="myLanguage"` 或 `@Lang(MyLanguageDriver.class)`。

可参考 [MyBatis-Velocity](https://github.com/mybatis/mybatis-velocity) 项目。

---

## 动态 SQL 元素一览

| 元素 | 优先级 | 用途 |
|------|--------|------|
| `if` | ⭐ | 条件片段 |
| `choose/when/otherwise` | 📌 | 多选一 |
| `where` | ⭐ | 动态 WHERE |
| `set` | ⭐ | 动态 SET |
| `trim` | 📌 | 通用前缀/后缀处理 |
| `foreach` | ⭐ | 遍历 / IN |
| `bind` | 📌 | 绑定变量 |
| `script` | 📌 | 注解动态 SQL 容器 |

---

## 下一步

- [Java API](./07-java-api.md)
- [注解映射](./08-annotations.md)

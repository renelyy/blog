# 注解映射

[← 返回索引](./index)

> **本节你将学到：** 常用注解、与 XML 混用、Provider 动态 SQL、注解的能力边界。

---

## ⭐ 何时用注解 vs XML

| 用注解 | 用 XML |
|--------|--------|
| 单表简单 CRUD | 复杂 JOIN、嵌套 resultMap |
| SQL 很短 | 长 SQL、动态 SQL 复杂 |
| 原型 / 小模块 | 团队统一 SQL 管理 |

> ⚠️ **官方原话：** 最强大的 MyBatis 映射**无法**仅用注解完成；注解与 XML **可自由混用**。

**混用规则：** 存在同名 XML 时，MyBatis 会自动加载 XML；复杂部分放 XML，简单放注解。

---

## ⭐ CRUD 注解

```java
public interface BlogMapper {
  @Select("SELECT * FROM blog WHERE id = #{id}")
  Blog selectBlog(int id);

  @Insert("INSERT INTO blog(title) VALUES(#{title})")
  @Options(useGeneratedKeys = true, keyProperty = "id")
  int insert(Blog blog);

  @Update("UPDATE blog SET title=#{title} WHERE id=#{id}")
  int update(Blog blog);

  @Delete("DELETE FROM blog WHERE id=#{id}")
  int delete(int id);
}
```

字符串数组会自动用空格连接，避免换行丢空格：

```java
@Select({"SELECT * FROM blog",
         "WHERE id = #{id}"})
Blog selectBlog(int id);
```

---

## 📌 结果映射注解

### @Results / @Result

```java
@Results(id = "userResult", value = {
  @Result(property = "id", column = "uid", id = true),
  @Result(property = "firstName", column = "first_name"),
  @Result(property = "lastName", column = "last_name")
})
@Select("SELECT * FROM users WHERE id = #{id}")
User getUserById(Integer id);

// 复用
@ResultMap("userResult")
@Select("SELECT * FROM users")
List<User> listUsers();
```

### @One / @Many（关联）

```java
@Select("SELECT * FROM blog WHERE id = #{id}")
@Results({
  @Result(property = "id", column = "id"),
  @Result(property = "author", column = "author_id",
          one = @One(select = "selectAuthor"))
})
Blog selectBlog(int id);
```

⚠️ 注解 API **不支持** 联合映射（循环引用限制）。

### @MapKey

```java
@MapKey("id")
Map<Integer, Author> selectAuthors();
```

---

## 📌 @Options

集中配置语句属性，避免 `@Select` 上堆满属性：

```java
@Options(useCache = true, flushCache = FlushCachePolicy.DEFAULT,
         timeout = 5000, fetchSize = 100)
@Select("SELECT * FROM blog")
List<Blog> selectAll();
```

注意：使用 `@Options` 后，未显式设置的项会取**默认值**。

---

## 📌 @SelectKey（主键）

插入**前**取序列：

```java
@Insert("INSERT INTO table3(id, name) VALUES(#{nameId}, #{name})")
@SelectKey(statement = "CALL next VALUE FOR TestSequence",
           keyProperty = "nameId", before = true, resultType = int.class)
int insertTable3(Name name);
```

插入**后**取自增：

```java
@Insert("INSERT INTO table2(name) VALUES(#{name})")
@SelectKey(statement = "CALL identity()",
           keyProperty = "nameId", before = false, resultType = int.class)
int insertTable2(Name name);
```

使用 `@SelectKey` 时，`@Options` 的主键相关设置会被忽略。

---

## ⭐ @SelectProvider / @InsertProvider 等

动态 SQL 在 Java 里生成：

::: v-pre
```java
@SelectProvider(type = UserSqlBuilder.class, method = "buildGetUsersByName")
List<User> getUsersByName(@Param("name") String name);

class UserSqlBuilder {
  public static String buildGetUsersByName(@Param("name") final String name) {
    return new SQL() {{
      SELECT("*");
      FROM("users");
      if (name != null) {
        WHERE("name LIKE #{name} || '%'");
      }
      ORDER_BY("id");
    }}.toString();
  }
}
```
:::

### ProviderMethodResolver（3.5.1+）

省略 `method`，默认解析为与 Mapper 方法同名：

```java
@SelectProvider(UserSqlProvider.class)
List<User> getUsersByName(String name);

class UserSqlProvider implements ProviderMethodResolver {
  public static String getUsersByName(final String name) { ... }
}
```

### 全局 defaultSqlProviderType（3.5.6+）

```java
configuration.setDefaultSqlProviderType(TemplateFilePathProvider.class);

@SelectProvider // 可省略 type
User findUser(int id);
```

---

## 📌 其它常用注解

| 注解 | 说明 |
|------|------|
| `@Param` | 多参数命名 |
| `@Flush` | 调用 `flushStatements()`（BATCH） |
| `@CacheNamespace` | 类级二级缓存 |
| `@CacheNamespaceRef` | 引用其它命名空间缓存 |
| `@Lang` | 指定脚本语言 |
| `@ConstructorArgs` / `@Arg` | 构造器映射 |
| `@TypeDiscriminator` / `@Case` | 鉴别器 |
| `@ResultType` | ResultHandler 场景指定类型 |
| `databaseId`（注解属性） | 多数据库 |

### databaseId 示例

```java
@Select(value = "SELECT SYS_GUID() FROM dual", databaseId = "oracle")
@Select(value = "SELECT uuid_generate_v4()", databaseId = "postgres")
@Select("SELECT RANDOM_UUID()")
String generateId();
```

---

## 📎 完整注解对照表

| 注解 | 作用对象 | XML 等价 |
|------|----------|----------|
| `@CacheNamespace` | 类 | `<cache>` |
| `@CacheNamespaceRef` | 类 | `<cache-ref>` |
| `@Results` / `@Result` | 方法 | `<resultMap>` |
| `@ConstructorArgs` / `@Arg` | 方法 | `<constructor>` |
| `@TypeDiscriminator` / `@Case` | 方法 | `<discriminator>` |
| `@Select` / `@Insert` / `@Update` / `@Delete` | 方法 | 对应语句 |
| `@SelectProvider` 等 | 方法 | 动态 SQL Provider |
| `@Options` | 方法 | 语句属性 |
| `@SelectKey` | 方法 | `<selectKey>` |
| `@Param` | 参数 | — |
| `@MapKey` | 方法 | selectMap |
| `@ResultMap` | 方法 | 引用 XML resultMap |
| `@One` / `@Many` | N/A | `<association>` / `<collection>` |
| `@Flush` | 方法 | flushStatements |
| `@Property` | N/A | `<property>` |
| `@Lang` | 方法/类 | lang 属性 |

---

## 下一步

- [SQL 构建器](./10-sql-builder.md)（Provider 里常用 `SQL` 类）
- [缓存与日志](./09-cache-and-logging.md)

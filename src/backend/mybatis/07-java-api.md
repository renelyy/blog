# Java API

[← 返回索引](./index)

> **本节你将学到：** SqlSessionFactoryBuilder / SqlSession 常用 API、事务、分页、ResultHandler。

---

## 📌 推荐目录结构

```text
/my_application
  /src
    /org/myapp/
      /data
        mybatis-config.xml
        BlogMapper.java
        BlogMapper.xml
      /model
      /service
```

非强制，但团队统一后更易维护。

---

## SqlSessionFactoryBuilder

五个 `build()` 重载：

```java
build(InputStream inputStream)
build(InputStream inputStream, String environment)
build(InputStream inputStream, Properties properties)
build(InputStream inputStream, String env, Properties props)
build(Configuration config)
```

**Resources 工具类**（`org.apache.ibatis.io.Resources`）：

```java
InputStream in = Resources.getResourceAsStream("org/mybatis/builder/mybatis-config.xml");
```

常用：`getResourceAsStream`、`getResourceAsProperties`、`classForName` 等。

---

## SqlSessionFactory → SqlSession

### openSession 重载

```java
openSession()                                          // 默认：事务开启、不自动提交
openSession(boolean autoCommit)
openSession(Connection connection)
openSession(TransactionIsolationLevel level)
openSession(ExecutorType execType)
openSession(ExecutorType execType, boolean autoCommit)
openSession(ExecutorType execType, Connection connection)
```

### ExecutorType

| 类型 | 行为 |
|------|------|
| `SIMPLE` | 每次新建 PreparedStatement |
| `REUSE` | 复用 PreparedStatement |
| `BATCH` | 批量更新，需 `flushStatements()` |

批量示例：

```java
try (SqlSession session = factory.openSession(ExecutorType.BATCH)) {
  Mapper mapper = session.getMapper(Mapper.class);
  for (Entity e : list) {
    mapper.insert(e);
  }
  session.flushStatements();
  session.commit();
}
```

---

## ⭐ SqlSession 语句方法

```java
<T> T selectOne(String statement, Object parameter)
<E> List<E> selectList(String statement, Object parameter)
<T> Cursor<T> selectCursor(String statement, Object parameter)
<K,V> Map<K,V> selectMap(String statement, Object parameter, String mapKey)
int insert(String statement, Object parameter)
int update(String statement, Object parameter)
int delete(String statement, Object parameter)
```

| 方法 | 注意 |
|------|------|
| `selectOne` | 多于 1 条抛异常；不确定条数用 `selectList` |
| `selectMap` | 指定属性作 key，整对象为 value |
| `selectCursor` | 惰性加载，适合大数据集 |

均有**无参**重载。

### 分页：RowBounds

```java
RowBounds rowBounds = new RowBounds(100, 25); // offset, limit
List<User> users = session.selectList("selectUsers", param, rowBounds);
```

⚠️ 内存分页，非 SQL `LIMIT`；生产应用 **PageHelper** 等插件。

### 流式：ResultHandler

```java
session.select("selectHugeTable", param, resultContext -> {
  MyEntity row = resultContext.getResultObject();
  // 逐行处理
  // resultContext.stop(); // 可提前停止
});
```

限制：

- 不缓存结果
- 复杂 resultMap 可能拿到未完全填充的对象

---

## 事务控制

```java
session.commit();
session.commit(true);   // force
session.rollback();
session.rollback(true);
```

默认：有 insert/update/delete 时自动 commit；否则 close 时 rollback。

Spring 项目用 `@Transactional`，不必手动 commit。

---

## 本地缓存

```java
session.clearCache();
```

`localCacheScope=STATEMENT` 时缓存仅语句级。

⚠️ 不要修改 Session 缓存返回的对象引用。

---

## ⭐ getMapper（推荐）

```java
AuthorMapper mapper = session.getMapper(AuthorMapper.class);
Author author = mapper.selectAuthor(5);
```

接口方法名 = 语句 id；返回类型须匹配。

### 多参数

```java
User find(@Param("id") Long id, @Param("name") String name);
// XML: #{id}, #{name}
```

### 继承

Mapper 接口可继承，注意子接口不要重复相同方法签名。

注解详情 → [注解映射](./08-annotations.md)

---

## Configuration 编程式配置

```java
Configuration configuration = new Configuration(environment);
configuration.setLazyLoadingEnabled(true);
configuration.setMapUnderscoreToCamelCase(true);
configuration.getTypeAliasRegistry().registerAlias(Blog.class);
configuration.addMapper(BoundBlogMapper.class);
SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(configuration);
```

`factory.getConfiguration()` 可运行时查看配置（生产环境慎用修改）。

---

## 下一步

- [注解映射](./08-annotations.md)
- [缓存与日志](./09-cache-and-logging.md)

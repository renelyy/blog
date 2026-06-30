# 快速上手

[← 返回索引](./index)

> **本节你将学到：** 5 分钟内完成安装、创建 SqlSessionFactory、执行第一条 SQL。

---

## ⭐ 安装

### Maven

```xml
<dependency>
  <groupId>org.mybatis</groupId>
  <artifactId>mybatis</artifactId>
  <version>3.5.19</version>
</dependency>
```

### 非 Maven

把 `mybatis-x.x.x.jar` 放到 classpath 即可。

---

## ⭐ 最小可运行示例

MyBatis 应用的**核心**只有一个：`SqlSessionFactory`。一切 SQL 执行都从这里开始。

### 第 1 步：全局配置文件 `mybatis-config.xml`

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
  PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
  "https://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
  <environments default="development">
    <environment id="development">
      <transactionManager type="JDBC"/>
      <dataSource type="POOLED">
        <property name="driver" value="${driver}"/>
        <property name="url" value="${url}"/>
        <property name="username" value="${username}"/>
        <property name="password" value="${password}"/>
      </dataSource>
    </environment>
  </environments>
  <mappers>
    <mapper resource="org/mybatis/example/BlogMapper.xml"/>
  </mappers>
</configuration>
```

| 元素 | 作用 |
|------|------|
| `environments` | 多环境（dev/test/prod），每个环境一套数据源 + 事务 |
| `transactionManager type="JDBC"` | 用 JDBC 提交/回滚 |
| `dataSource type="POOLED"` | 连接池（生产常用） |
| `mappers` | 告诉 MyBatis 去哪里找 SQL 映射 |

### 第 2 步：映射文件 `BlogMapper.xml`

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
  PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
  "https://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="org.mybatis.example.BlogMapper">
  <select id="selectBlog" resultType="Blog">
    select * from Blog where id = #{id}
  </select>
</mapper>
```

**三个关键点：**

1. `namespace` — 命名空间，**必须唯一**，通常 = Mapper 接口全限定名
2. `id="selectBlog"` — 语句 ID，接口方法名与之对应
3. `#{id}` — 预编译参数占位符（安全，防 SQL 注入）

### 第 3 步：构建工厂并查询

```java
String resource = "org/mybatis/example/mybatis-config.xml";
InputStream inputStream = Resources.getResourceAsStream(resource);
SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);

try (SqlSession session = sqlSessionFactory.openSession()) {
  BlogMapper mapper = session.getMapper(BlogMapper.class);
  Blog blog = mapper.selectBlog(101);
}
```

---

## ⭐ 推荐写法：Mapper 接口（类型安全）

**不推荐**（字符串 ID，易拼错、无 IDE 提示）：

```java
Blog blog = (Blog) session.selectOne("org.mybatis.example.BlogMapper.selectBlog", 101);
```

**推荐**（接口 + 注解或 XML 绑定）：

```java
BlogMapper mapper = session.getMapper(BlogMapper.class);
Blog blog = mapper.selectBlog(101);
```

对应接口：

```java
package org.mybatis.example;

public interface BlogMapper {
  Blog selectBlog(int id);
}
```

MyBatis 会为接口生成代理实现，方法名 `selectBlog` 自动对应 XML 里 `id="selectBlog"` 的语句。

---

## 📌 注解方式（简单 SQL 可用）

XML 可以换成注解：

```java
public interface BlogMapper {
  @Select("SELECT * FROM blog WHERE id = #{id}")
  Blog selectBlog(int id);
}
```

| 方式 | 适合 |
|------|------|
| XML | 复杂 SQL、动态 SQL、复杂 resultMap |
| 注解 | 单行简单 CRUD |
| 混合 | **允许**；同名 XML 会与注解互补（复杂映射仍靠 XML） |

> ⚠️ **注意：** 复杂嵌套关联、联合映射，官方明确建议用 XML，注解表达能力有限。

---

## 📌 不用 XML，纯 Java 配置

```java
DataSource dataSource = BlogDataSourceFactory.getBlogDataSource();
TransactionFactory transactionFactory = new JdbcTransactionFactory();
Environment environment = new Environment("development", transactionFactory, dataSource);
Configuration configuration = new Configuration(environment);
configuration.addMapper(BlogMapper.class);
SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(configuration);
```

与 XML 配置**等价**，适合程序化配置或测试。

---

## ⭐ 命名空间（namespace）规则

| 规则 | 说明 |
|------|------|
| 必须指定 | MyBatis 3 起 namespace **不再是可选的** |
| 推荐写法 | 设为 Mapper 接口全限定名，便于接口绑定 |
| 全限定名调用 | `org.mybatis.example.BlogMapper.selectBlog` |
| 短名称 | 全局唯一时可用 `selectBlog`；不唯一则报错 |

---

## 下一步

- 理解对象生命周期 → [核心概念](./02-core-concepts.md)
- 深入配置文件 → [配置详解](./03-configuration.md)

# 核心概念

[← 返回索引](./index)

> **本节你将学到：** MyBatis 运行时有哪些核心对象、各自活多久、为什么 SqlSession 不能共享。

---

## 架构一图流

```text
SqlSessionFactoryBuilder  →  一次性，建完工厂就丢
         ↓
SqlSessionFactory          →  应用级单例，整个应用一个
         ↓
SqlSession                 →  请求/方法级，每线程一个，用完关
         ↓
Mapper 接口实例             →  方法级，从 SqlSession 获取
```

---

## ⭐ 四大核心对象

### 1. SqlSessionFactoryBuilder

- **职责：** 解析配置（XML 或 Java），构建 `SqlSessionFactory`
- **生命周期：** **方法级** — 创建完 Factory 后就可以丢弃
- **不要：** 做成全局单例长期持有

```java
// 正确：局部使用
SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(inputStream);
```

### 2. SqlSessionFactory

- **职责：** 创建 `SqlSession`、暴露 `Configuration`
- **生命周期：** **应用级** — 运行期间只应存在一个实例
- **推荐：** 单例或静态单例

```java
// 错误：每次请求都 new 一个 Factory
SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(inputStream); // 别在循环里干这个
```

### 3. SqlSession

- **职责：** 执行 SQL、管理事务、获取 Mapper
- **生命周期：** **请求或方法级**
- **⚠️ 线程不安全，禁止共享**

| 禁止 | 原因 |
|------|------|
| 放在 static 字段 | 多线程并发访问 |
| 放在单例 Bean 的成员变量 | 同上 |
| 放在 HttpSession | 生命周期过长 |

**标准模式：**

```java
try (SqlSession session = sqlSessionFactory.openSession()) {
  BlogMapper mapper = session.getMapper(BlogMapper.class);
  // 业务逻辑
  session.commit(); // 需要写操作时
} // try-with-resources 自动 close
```

Web 场景：**一个 HTTP 请求 = 一个 SqlSession**，响应结束即关闭。

### 4. Mapper 接口

- **职责：** 声明式 SQL 调用入口
- **生命周期：** **方法级** — 在方法内 `getMapper()`，用完随 SqlSession 关闭
- **无需** 手动 close Mapper

```java
try (SqlSession session = sqlSessionFactory.openSession()) {
  BlogMapper mapper = session.getMapper(BlogMapper.class);
  mapper.selectBlog(1);
}
```

---

## 📌 与 Spring / MyBatis-Spring 集成

使用 **MyBatis-Spring** 或 **mybatis-spring-boot-starter** 时：

- `SqlSession` / `Mapper` 由容器注入，**不必**手动 `openSession()` / `close()`
- 事务由 Spring `@Transactional` 管理
- `SqlSessionFactory` 仍是应用级单例

你仍需要理解上述生命周期，以便排查「Session 泄漏」「事务不生效」等问题。

---

## ⭐ 配置 → 映射 → 执行 流程

```text
mybatis-config.xml
  ├── environments（数据源、事务）
  ├── settings（全局行为开关）
  ├── typeAliases / typeHandlers
  └── mappers（指向 XML 或接口）

BlogMapper.xml / @Select
  └── namespace + id + SQL + resultType/resultMap

Java 调用
  session.getMapper(BlogMapper.class).selectBlog(101)
    → 代理找到 mapped statement
    → 预编译 SQL + 设参
    → 执行 + 映射结果
```

---

## 📌 一级缓存（本地缓存）简述

每个 `SqlSession` 自带**本地缓存**（一级缓存）：

- 同一 Session 内，**相同 SQL + 相同参数** 的查询会走缓存
- `insert/update/delete` 或 `commit/rollback/close` 会清空
- 可通过 `settings.localCacheScope=STATEMENT` 改为语句级（一般不推荐）

二级缓存见 [缓存与日志](./09-cache-and-logging.md)。

---

## ⚠️ 常见误区

| 误区 | 正确做法 |
|------|----------|
| 每次查询 new SqlSessionFactory | Factory 单例，只 new SqlSession |
| 把 SqlSession 注入单例 Service | 用 Spring 管理 Mapper，或方法内开 Session |
| namespace 随便写 | 与 Mapper 接口全限定名一致 |
| 修改 Mapper 返回的 List 元素 | Session 缓存可能返回同一引用，修改会影响缓存 |

---

## 下一步

- [配置详解](./03-configuration.md)
- [XML 映射基础](./04-xml-mapper.md)

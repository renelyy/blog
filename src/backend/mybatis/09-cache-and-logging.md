# 缓存与日志

[← 返回索引](./index)

> **本节你将学到：** 一级/二级缓存、缓存配置、如何打开 SQL 日志排查问题。

---

## 缓存两级结构

```text
┌─────────────────────────────────────┐
│  二级缓存（Mapper namespace 级）      │  ← 需显式 <cache/>
│  跨 SqlSession 共享（事务提交后）      │
├─────────────────────────────────────┤
│  一级缓存（SqlSession 本地）          │  ← 默认开启
│  同一 Session 内重复查询              │
└─────────────────────────────────────┘
```

---

## ⭐ 一级缓存（本地）

- **作用域：** 单个 `SqlSession`
- **默认：** 开启，`localCacheScope=SESSION`
- **清空时机：** insert/update/delete、commit、rollback、close、`clearCache()`

⚠️ Session 缓存返回**同一对象引用**，修改会影响后续读取。

改为语句级（很少用）：

```xml
<setting name="localCacheScope" value="STATEMENT"/>
```

---

## 📌 二级缓存

### 开启

在 Mapper XML 中加一行：

```xml
<cache/>
```

效果：

- 该 namespace 下所有 select 结果可被缓存
- insert/update/delete **刷新**缓存
- 默认 LRU、1024 引用、无定时刷新
- 默认**读写**缓存（返回拷贝，非同一引用）

### 自定义属性

```xml
<cache
  eviction="FIFO"
  flushInterval="60000"
  size="512"
  readOnly="true"/>
```

| 属性 | 说明 |
|------|------|
| `eviction` | LRU / FIFO / SOFT / WEAK |
| `flushInterval` | 刷新间隔 ms |
| `size` | 最大引用数 |
| `readOnly` | true=共享同一实例（快但不安全） |

### 语句级控制

```xml
<select ... flushCache="false" useCache="true"/>
<insert ... flushCache="true"/>
```

### cache-ref（共享缓存）

```xml
<cache-ref namespace="com.other.mapper.SharedMapper"/>
```

### 📎 自定义 Cache 实现

```xml
<cache type="com.domain.something.MyCustomCache">
  <property name="cacheFile" value="/tmp/my-custom-cache.tmp"/>
</cache>
```

实现 `org.apache.ibatis.cache.Cache`；3.4.2+ 可实现 `InitializingObject` 做初始化。

### ⚠️ 二级缓存注意

- **事务性：** SqlSession commit/rollback 后才更新二级缓存
- 注解 Mapper 默认不缓存 → 用 `@CacheNamespace` / `@CacheNamespaceRef`
- 分布式环境慎用内置二级缓存 → Redis 等需自定义 `Cache` 或不用

全局开关：`settings.cacheEnabled=false` 关闭所有二级缓存。

---

## ⭐ 日志

### 内置日志实现（按探测顺序）

1. SLF4J
2. Apache Commons Logging
3. Log4j 2
4. Log4j（3.5.9 起废弃）
5. JDK logging

**都未找到 → 日志禁用。**

### 强制指定 logImpl

```xml
<settings>
  <setting name="logImpl" value="SLF4J"/>
</settings>
```

可选值：`SLF4J`、`LOG4J2`、`JDK_LOGGING`、`COMMONS_LOGGING`、`STDOUT_LOGGING`、`NO_LOGGING`

或代码（须在其它 MyBatis 调用**之前**）：

```java
LogFactory.useSlf4jLogging();
```

---

## 📌 如何看到 SQL？

MyBatis 日志级别：

- **SQL 语句：** DEBUG（JDK 为 FINE）
- **结果集详情：** TRACE（JDK 为 FINER）

### Logback 示例

```xml
<!-- logback.xml -->
<logger name="com.example.mapper.UserMapper" level="debug"/>
<!-- 仅一条语句 -->
<logger name="com.example.mapper.UserMapper.selectUser" level="trace"/>
<!-- 整个包 -->
<logger name="com.example.mapper" level="debug"/>
```

**XML Mapper 与接口用同一 logger 名**（namespace / 接口全限定名）。

Spring Boot：

```yaml
logging:
  level:
    com.example.mapper: debug
```

SLF4J / Log4j2 下 MyBatis 日志 category 可能带 `MYBATIS` 前缀。

### ⚠️ WebSphere 等容器

类路径已有 Commons Logging 时，可能**忽略**你的 Log4j 配置 → 显式设 `logImpl=SLF4J`。

---

## Log4j2 快速示例

```xml
<!-- log4j2.xml -->
<Logger name="org.mybatis.example.BlogMapper" level="trace"/>
<Root level="error">
  <AppenderRef ref="stdout"/>
</Root>
```

---

## 下一步

- [SQL 构建器](./10-sql-builder.md)
- [附录](./appendix-reference.md)

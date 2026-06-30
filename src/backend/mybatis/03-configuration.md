# 配置详解

[← 返回索引](./index)

> **本节你将学到：** `mybatis-config.xml` 顶层结构、必改 settings、数据源与 mapper 注册方式。

---

## 配置文件顶层结构

```text
configuration
├── properties          ⭐ 外部属性、占位符 ${}
├── settings            ⭐ 全局行为开关（最重要）
├── typeAliases         📌 类型别名
├── typeHandlers        📎 自定义 JDBC ↔ Java 转换
├── objectFactory       📎 对象实例化方式
├── plugins             📎 拦截器（分页插件等）
├── environments        ⭐ 环境 + 事务 + 数据源
├── databaseIdProvider  📎 多数据库厂商
└── mappers             ⭐ 注册 Mapper
```

---

## ⭐ properties（属性）

支持外部化配置，在 XML 中用 `${key}` 引用。

```xml
<properties resource="org/mybatis/example/config.properties">
  <property name="username" value="dev_user"/>
</properties>

<dataSource type="POOLED">
  <property name="username" value="${username}"/>
</dataSource>
```

### 加载优先级（高 → 低）

1. **方法参数** `build(reader, props)` 传入的 Properties
2. **resource / url** 指定的属性文件
3. **properties 元素体内** 内联属性

### 📎 占位符默认值（3.4.2+）

```xml
<property name="username" value="${username:ut_user}"/>
```

需开启：

```xml
<property name="org.apache.ibatis.parsing.PropertyParser.enable-default-value" value="true"/>
```

属性名含 `:` 时，可改分隔符：

```xml
<property name="org.apache.ibatis.parsing.PropertyParser.default-value-separator" value="?:"/>
```

---

## ⭐ settings（必学项精选）

完整表见 [附录：settings 速查](./appendix-reference.md#settings-完整表)。

| 设置 | 默认值 | 建议 | 说明 |
|------|--------|------|------|
| `mapUnderscoreToCamelCase` | false | **true** | `user_name` → `userName` |
| `cacheEnabled` | true | 保持 | 二级缓存总开关 |
| `lazyLoadingEnabled` | false | 按需 | 关联延迟加载 |
| `useGeneratedKeys` | false | 按需 | 强制 JDBC 返回自增主键 |
| `defaultExecutorType` | SIMPLE | BATCH 批量写 | SIMPLE / REUSE / BATCH |
| `jdbcTypeForNull` | OTHER | 按需 | 空值参数的 JDBC 类型 |
| `logImpl` | 自动探测 | SLF4J | 指定日志实现 |
| `autoMappingBehavior` | PARTIAL | 保持 | NONE / PARTIAL / FULL |
| `localCacheScope` | SESSION | 保持 | SESSION / STATEMENT |
| `useActualParamName` | true | 保持 | Java 8 `-parameters` 参数名 |

**Spring Boot 等价配置**（`application.yml`）：

```yaml
mybatis:
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.slf4j.Slf4jImpl
```

---

## 📌 typeAliases（类型别名）

缩短 XML 里的类名。

```xml
<!-- 单个 -->
<typeAliases>
  <typeAlias alias="Blog" type="domain.blog.Blog"/>
</typeAliases>

<!-- 包扫描：默认别名 = 类名首字母小写 -->
<typeAliases>
  <package name="domain.blog"/>
</typeAliases>
```

```java
@Alias("author")
public class Author { }
```

内置别名（部分）：`string`→String、`int`/`integer`→Integer、`map`→Map、`date`→Date 等，**不区分大小写**。完整列表见 [附录](./appendix-reference.md#内置类型别名)。

---

## 📎 typeHandlers（类型处理器）

JDBC 类型 ↔ Java 类型 的转换。多数场景用默认即可。

**何时自定义：** 特殊 JSON 列、加密字段、数据库特有类型。

```java
@MappedJdbcTypes(JdbcType.VARCHAR)
public class ExampleTypeHandler extends BaseTypeHandler<String> {
  // setNonNullParameter / getNullableResult ...
}
```

```xml
<typeHandlers>
  <typeHandler handler="org.mybatis.example.ExampleTypeHandler"/>
  <!-- 或包扫描 -->
  <package name="org.mybatis.example"/>
</typeHandlers>
```

### 📎 枚举

| Handler | 存什么 |
|---------|--------|
| `EnumTypeHandler`（默认） | 枚举 **名称** |
| `EnumOrdinalTypeHandler` | 枚举 **序数** |

---

## 📎 objectFactory / plugins

- **objectFactory：** 控制结果对象如何 `new` 出来（极少改）
- **plugins：** 实现 `Interceptor` 接口，拦截 Executor / ParameterHandler / ResultSetHandler / StatementHandler

分页插件（PageHelper 等）、审计字段填充通常走插件或 MyBatis-Plus 封装。

---

## ⭐ environments（环境 + 数据源）

```xml
<environments default="development">
  <environment id="development">
    <transactionManager type="JDBC"/>
    <dataSource type="POOLED">
      <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
      <property name="url" value="jdbc:mysql://localhost:3306/test"/>
      <property name="username" value="root"/>
      <property name="password" value="secret"/>
    </dataSource>
  </environment>
</environments>
```

| 要点 | 说明 |
|------|------|
| 一个 Factory 只能选一个 environment | 多库 = 多个 SqlSessionFactory |
| `default` | 未指定 environment 时使用 |

### 事务管理器

| type | 说明 |
|------|------|
| `JDBC` | 直接用 JDBC commit/rollback |
| `MANAGED` | 交给容器（JEE），默认关闭连接 |

Spring 项目：**不必配** transactionManager，Spring 会覆盖。

JDBC 可选属性 `skipSetAutoCommitOnClose=true`（3.5.10+）跳过关闭连接时的 autoCommit。

### 数据源 type

| type | 说明 |
|------|------|
| `UNPOOLED` | 每次新建连接，简单场景 |
| `POOLED` | **内置连接池**，常用 |
| `JNDI` | 容器 JNDI 数据源 |

**POOLED 常用池参数：**

| 属性 | 默认 | 说明 |
|------|------|------|
| `poolMaximumActiveConnections` | 10 | 最大活动连接 |
| `poolMaximumIdleConnections` | 同 active | 最大空闲 |
| `poolMaximumCheckoutTime` | 20000ms | 检出超时 |
| `poolPingEnabled` | false | 连接有效性检测 |

第三方连接池（Druid、HikariCP）：实现 `DataSourceFactory` 或 Spring Boot 直接配 DataSource Bean。

---

## 📎 databaseIdProvider（多数据库）

同一套 Mapper，按数据库执行不同 SQL（配合 XML/注解的 `databaseId` 属性）。

```xml
<databaseIdProvider type="DB_VENDOR">
  <property name="MySQL" value="mysql"/>
  <property name="Oracle" value="oracle"/>
</databaseIdProvider>
```

动态 SQL 中可用 `_databaseId` 变量。

---

## ⭐ mappers（注册映射）

四种方式，**任选其一或组合**：

```xml
<!-- 1. classpath 相对路径 -->
<mapper resource="org/mybatis/example/BlogMapper.xml"/>

<!-- 2. URL -->
<mapper url="file:///var/mappers/BlogMapper.xml"/>

<!-- 3. 接口类（纯注解 Mapper） -->
<mapper class="org.mybatis.example.BlogMapper"/>

<!-- 4. 包扫描（推荐 Spring Boot） -->
<package name="org.mybatis.example.mapper"/>
```

Spring Boot：

```yaml
mybatis:
  mapper-locations: classpath:mapper/**/*.xml
  type-aliases-package: com.example.domain
```

---

## 下一步

- [XML 映射基础](./04-xml-mapper.md)
- [附录：settings 完整表](./appendix-reference.md)

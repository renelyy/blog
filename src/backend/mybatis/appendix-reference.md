# 附录：速查表

[← 返回索引](./index)

> 官方配置项、类型别名、JDBC 类型的完整参考，便于查阅。

---

## settings 完整表

| 设置名 | 描述 | 有效值 | 默认值 |
|--------|------|--------|--------|
| `cacheEnabled` | 全局二级缓存开关 | true / false | true |
| `lazyLoadingEnabled` | 延迟加载全局开关 | true / false | false |
| `aggressiveLazyLoading` | 任一方法调用加载全部延迟属性 | true / false | false（≤3.4.1 为 true） |
| `multipleResultSetsEnabled` | 已废弃，无效果 | true / false | true |
| `useColumnLabel` | 用列标签而非列名 | true / false | true |
| `useGeneratedKeys` | JDBC 返回自增主键 | true / false | false |
| `autoMappingBehavior` | 自动映射等级 | NONE / PARTIAL / FULL | PARTIAL |
| `autoMappingUnknownColumnBehavior` | 未知列行为 | NONE / WARNING / FAILING | NONE |
| `defaultExecutorType` | 默认执行器 | SIMPLE / REUSE / BATCH | SIMPLE |
| `defaultStatementTimeout` | 语句超时（秒） | 正整数 | null |
| `defaultFetchSize` | 默认 fetchSize | 正整数 | null |
| `defaultResultSetType` | 默认 ResultSet 类型 | FORWARD_ONLY / SCROLL_* / DEFAULT | null |
| `safeRowBoundsEnabled` | 嵌套语句中允许 RowBounds | true / false | false |
| `safeResultHandlerEnabled` | 嵌套语句中允许 ResultHandler | true / false | true |
| `mapUnderscoreToCamelCase` | 下划线转驼峰 | true / false | false |
| `localCacheScope` | 一级缓存作用域 | SESSION / STATEMENT | SESSION |
| `jdbcTypeForNull` | NULL 参数 JDBC 类型 | JdbcType 常量 | OTHER |
| `lazyLoadTriggerMethods` | 触发延迟加载的方法 | 逗号分隔 | equals,clone,hashCode,toString |
| `defaultScriptingLanguage` | 默认动态 SQL 语言 | 类名/别名 | XmlLanguageDriver |
| `defaultEnumTypeHandler` | 默认枚举 TypeHandler | 类名/别名 | EnumTypeHandler |
| `callSettersOnNulls` | null 值是否调 setter | true / false | false |
| `returnInstanceForEmptyRow` | 全空行返回空实例 | true / false | false |
| `logPrefix` | 日志名前缀 | 字符串 | null |
| `logImpl` | 日志实现 | SLF4J/LOG4J2/... | 自动 |
| `proxyFactory` | 延迟加载代理 | JAVASSIST（CGLIB 3.5.10 废弃） | JAVASSIST |
| `vfsImpl` | VFS 实现 | 类名列表 | null |
| `useActualParamName` | 用方法参数名作占位符 | true / false | true |
| `configurationFactory` | 反序列化 Configuration 工厂 | 类名 | null |
| `shrinkWhitespacesInSql` | 压缩 SQL 空白 | true / false | false |
| `defaultSqlProviderType` | 默认 SqlProvider 类 | 类名/别名 | null |
| `nullableOnForEach` | foreach nullable 默认值 | true / false | false |
| `argNameBasedConstructorAutoMapping` | 构造器按参数名映射 | true / false | false |

### autoMappingUnknownColumnBehavior 说明

当 `autoMappingBehavior=FULL` 时，未知列行为：

- `NONE` — 不处理
- `WARNING` — 打 WARN 日志
- `FAILING` — 抛 `SqlSessionException`

---

## 内置类型别名

| 别名 | Java 类型 |
|------|-----------|
| `_byte` / `byte` | byte / Byte |
| `_short` / `short` | short / Short |
| `_int` / `_integer` / `int` / `integer` | int / Integer |
| `_long` / `long` | long / Long |
| `_float` / `float` | float / Float |
| `_double` / `double` | double / Double |
| `_boolean` / `boolean` | boolean / Boolean |
| `_char` / `_character` / `char` / `character` | char / Character |
| `string` | String |
| `date` | Date |
| `decimal` / `bigdecimal` | BigDecimal |
| `biginteger` | BigInteger |
| `object` | Object |
| `map` / `hashmap` | Map / HashMap |
| `list` / `arraylist` | List / ArrayList |
| `collection` | Collection |
| `iterator` | Iterator |
| `date[]` / `decimal[]` / `bigdecimal[]` / `biginteger[]` / `object[]` | 对应数组 |

包扫描默认别名：类名首字母小写；`@Alias("xxx")` 覆盖。

---

## JDBC 类型

MyBatis 支持的 `jdbcType` 枚举：

| | | | | | |
|--|--|--|--|--|--|
| BIT | FLOAT | CHAR | TIMESTAMP | OTHER | UNDEFINED |
| TINYINT | REAL | VARCHAR | BINARY | BLOB | NVARCHAR |
| SMALLINT | DOUBLE | LONGVARCHAR | VARBINARY | CLOB | NCHAR |
| INTEGER | NUMERIC | DATE | LONGVARBINARY | BOOLEAN | NCLOB |
| BIGINT | DECIMAL | TIME | NULL | CURSOR | ARRAY |

---

## 默认 TypeHandler（节选）

| TypeHandler | Java | JDBC |
|-------------|------|------|
| StringTypeHandler | String | CHAR, VARCHAR |
| IntegerTypeHandler | Integer, int | NUMERIC, INTEGER |
| LongTypeHandler | Long, long | BIGINT |
| DateTypeHandler | Date | TIMESTAMP |
| LocalDateTimeTypeHandler | LocalDateTime | TIMESTAMP |
| LocalDateTypeHandler | LocalDate | DATE |
| LocalTimeTypeHandler | LocalTime | TIME |
| EnumTypeHandler | Enum | VARCHAR（存 name） |
| EnumOrdinalTypeHandler | Enum | NUMERIC（存 ordinal） |
| BlobTypeHandler | byte[] | BLOB |
| ClobTypeHandler | String | CLOB |

3.4.5+ 默认支持 JSR-310 日期时间 API。

---

## select / insert / update / delete 属性速查

### select

`id`, `parameterType`, `resultType`, `resultMap`, `flushCache`, `useCache`, `timeout`, `fetchSize`, `statementType`, `resultSetType`, `databaseId`, `resultOrdered`, `resultSets`, `affectData`

### insert / update / delete

`id`, `parameterType`, `flushCache`, `timeout`, `statementType`, `useGeneratedKeys`, `keyProperty`, `keyColumn`, `databaseId`

### selectKey

`keyProperty`, `keyColumn`, `resultType`, `order`, `statementType`

---

## 动态 SQL 元素

`if`, `choose`, `when`, `otherwise`, `trim`, `where`, `set`, `foreach`, `bind`, `script`

---

## 插件可拦截接口

| 接口 | 方法 |
|------|------|
| Executor | update, query, flushStatements, commit, rollback, getTransaction, close, isClosed |
| ParameterHandler | getParameterObject, setParameters |
| ResultSetHandler | handleResultSets, handleOutputParameters |
| StatementHandler | prepare, parameterize, batch, update, query |

---

## POOLED 数据源参数

| 属性 | 默认 | 说明 |
|------|------|------|
| poolMaximumActiveConnections | 10 | 最大活动连接 |
| poolMaximumIdleConnections | 同 active | 最大空闲 |
| poolMaximumCheckoutTime | 20000 | 检出超时 ms |
| poolTimeToWait | 20000 | 获取连接失败重试间隔 |
| poolMaximumLocalBadConnectionTolerance | 3 | 坏连接容忍 |
| poolPingQuery | — | 检测 SQL |
| poolPingEnabled | false | 是否 ping |
| poolPingConnectionsNotUsedFor | 0 | ping 间隔 |

UNPOOLED 额外：`defaultTransactionIsolationLevel`, `defaultNetworkTimeout`；驱动属性加 `driver.` 前缀。

---

## 官方文档源码

MyBatis 文档 Markdown 源码在 GitHub 仓库，可提交 PR 改进官方文档：

https://github.com/mybatis/mybatis-3

---

[← 返回索引](./index)

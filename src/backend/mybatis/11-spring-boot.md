# Spring Boot 集成

[← 返回索引](./index)

> 官方 MyBatis 3 核心文档**不包含** Spring Boot 章节；实际项目几乎都用 **mybatis-spring-boot-starter**。本章补全「官方缺口」。

---

## ⭐ 依赖

```xml
<dependency>
  <groupId>org.mybatis.spring.boot</groupId>
  <artifactId>mybatis-spring-boot-starter</artifactId>
  <version>3.0.4</version>
</dependency>
<dependency>
  <groupId>com.mysql</groupId>
  <artifactId>mysql-connector-j</artifactId>
  <scope>runtime</scope>
</dependency>
```

版本与 Spring Boot 对应见 [starter README](https://github.com/mybatis/spring-boot-starter)。

---

## ⭐ 最小配置

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/demo?useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: secret
    driver-class-name: com.mysql.cj.jdbc.Driver

mybatis:
  mapper-locations: classpath:mapper/**/*.xml
  type-aliases-package: com.example.domain
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.slf4j.Slf4jImpl
```

```java
@SpringBootApplication
@MapperScan("com.example.mapper")
public class Application { }
```

**不再需要**手写 `SqlSessionFactoryBuilder`；容器管理 `SqlSessionFactory`、`SqlSessionTemplate`。

---

## ⭐ Mapper 接口

```java
@Mapper   // 可选，@MapperScan 已扫描
public interface UserMapper {
  User selectById(@Param("id") Long id);
  List<User> selectByKeyword(@Param("keyword") String keyword);
  int insert(User user);
}
```

```xml
<!-- resources/mapper/UserMapper.xml -->
<mapper namespace="com.example.mapper.UserMapper">
  <select id="selectById" resultType="User">
    SELECT id, username, email FROM users WHERE id = #{id}
  </select>
</mapper>
```

---

## ⭐ 事务（Spring 管理）

```java
@Service
@RequiredArgsConstructor
public class UserService {
  private final UserMapper userMapper;

  @Transactional
  public void createUser(User user) {
    userMapper.insert(user);
    // 同一事务内多次 DB 操作共用一个连接
  }
}
```

⚠️ 不要手动 `sqlSession.commit()`；交给 `@Transactional`。

---

## 📌 注入 SqlSession 的两种方式

| 方式 | 说明 |
|------|------|
| **Mapper 接口**（推荐） | 类型安全 |
| `SqlSessionTemplate` | 老代码或动态 statement id |

```java
@Service
public class LegacyService {
  private final SqlSessionTemplate sqlSession;

  public User get(Long id) {
    return sqlSession.selectOne("com.example.mapper.UserMapper.selectById", id);
  }
}
```

---

## 📌 PageHelper 分页

```xml
<dependency>
  <groupId>com.github.pagehelper</groupId>
  <artifactId>pagehelper-spring-boot-starter</artifactId>
  <version>2.1.0</version>
</dependency>
```

```yaml
pagehelper:
  helper-dialect: mysql
  reasonable: true
  support-methods-arguments: true
```

```java
public PageInfo<User> list(int pageNum, int pageSize) {
  PageHelper.startPage(pageNum, pageSize);
  List<User> list = userMapper.selectAll();
  return new PageInfo<>(list);
}
```

PageHelper 是**插件**，在 SQL 外层加 `LIMIT`；优于 MyBatis 原生 `RowBounds` 内存分页。

---

## 📌 多数据源

```java
@Configuration
@MapperScan(basePackages = "com.example.primary.mapper",
            sqlSessionFactoryRef = "primarySqlSessionFactory")
public class PrimaryDbConfig { ... }

@Configuration
@MapperScan(basePackages = "com.example.secondary.mapper",
            sqlSessionFactoryRef = "secondarySqlSessionFactory")
public class SecondaryDbConfig { ... }
```

每个数据源一套 `DataSource` + `SqlSessionFactory` + `@MapperScan`。

---

## 📌 配置类代替 yml（可选）

```java
@Configuration
public class MyBatisConfig {
  @Bean
  public ConfigurationCustomizer configurationCustomizer() {
    return c -> c.setMapUnderscoreToCamelCase(true);
  }
}
```

---

## ⚠️ 常见问题

| 现象 | 排查 |
|------|------|
| `Invalid bound statement` | namespace 与 Mapper 全限定名不一致；xml 未打进 jar |
| 驼峰不生效 | `map-underscore-to-camel-case` 或 `@ConfigurationCustomizer` |
| 分页无效 | PageHelper 依赖是否引入；`startPage` 是否紧挨查询 |
| 事务不生效 | Service 上 `@Transactional`；是否同类自调用 |

---

## 下一步

- [Spring Boot 数据访问](../spring/boot/05-data-access)
- [配置详解](./03-configuration)

[← 返回索引](./index)

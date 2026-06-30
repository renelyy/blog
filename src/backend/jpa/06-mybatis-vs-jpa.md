# MyBatis vs JPA 选型

[← 返回索引](./index)

> **本节目标：** 在企业项目中如何选型、混用与团队规范。

---

## ⭐ 核心差异

| 维度 | JPA / Hibernate | MyBatis |
|------|-----------------|---------|
| 范式 | **ORM 对象驱动** | **SQL 驱动** |
| SQL | 多数自动生成 | **手写** XML/注解 |
| 学习 | 关联、缓存、生命周期 | SQL + 映射 |
| 复杂 JOIN | JPQL / Native / 吃力 | **强项** |
| 报表 / 统计 | 常转 Native 或 MyBatis | **强项** |
| 表结构变更 | Entity + Flyway | Mapper XML |
| 性能调优 | 理解 Hibernate SQL 生成 | SQL 直接可见 |
| 动态 SQL | Specification / Querydsl | `<if>` `<choose>` |

---

## ⭐ 何时优先 JPA

| 场景 | 原因 |
|------|------|
| CRUD 为主、领域模型清晰 | Repository 开发快 |
| 关联不复杂、标准 Web 业务 | 映射注解即可 |
| 团队熟悉 DDD / Spring Data | 生态统一 |
| 多表对象图、级联保存 | cascade 方便 |
| 快速原型 / 内部系统 | ddl-auto + JPA 快 |

**典型：** 用户中心、权限、配置、工单主表 — 实体稳定、操作为主。

---

## ⭐ 何时优先 MyBatis

| 场景 | 原因 |
|------|------|
| 复杂 SQL、多表 JOIN、子查询 | SQL 一手掌控 |
| 报表、大屏、统计分析 | 列投影灵活 |
| DBA 强参与 SQL 评审 | XML 可审 |
| 遗留库、非规范表结构 | 不必强 ORM 映射 |
| 批量 ETL、大数据量读写 | JDBC 批处理直观 |
| 需要精确索引 hint | 手写 SQL |

**典型：** 运营报表、对账、搜索列表（多条件 JOIN + 聚合）。

见 [MyBatis 模块](../mybatis/)。

---

## ⭐ 混用策略（常见企业做法）

```text
同一 Spring Boot 项目
├── spring-boot-starter-data-jpa     → 主业务 CRUD
└── mybatis-spring-boot-starter      → 报表 / 复杂查询
         ↓
    同一 DataSource（注意事务管理器统一）
```

### 规范

1. **按模块/包划分**，不要同一 Entity 两套 Mapper 乱改
2. **写操作**尽量单一入口 — 避免 JPA 改完 MyBatis 缓存不知
3. **只读报表**走 MyBatis — 无一级缓存副作用
4. **事务：** 都用 Spring `@Transactional` + 同一 `PlatformTransactionManager`（JPA 为主时）

```java
@Service
@RequiredArgsConstructor
public class OrderQueryFacade {
  private final OrderRepository orderRepo;      // JPA — 单条、保存
  private final OrderReportMapper reportMapper; // MyBatis — 报表

  @Transactional(readOnly = true)
  public OrderDto get(Long id) { ... }

  @Transactional(readOnly = true)
  public List<OrderReportRow> monthlyReport(YearMonth month) {
    return reportMapper.selectMonthlyStats(month);
  }
}
```

---

## ⭐ 决策流程图

```text
                    新模块数据访问
                          │
              ┌───────────┴───────────┐
              │ 是否以 CRUD + 简单查询为主？ │
              └───────────┬───────────┘
                    是 │      │ 否
                       ▼      ▼
                  倾向 JPA   SQL 是否复杂 / 是否报表？
                                  │
                          是 ──→ MyBatis
                          否 ──→ JPA + @Query native
```

---

## ⭐ 团队能力

| 团队 | 建议 |
|------|------|
| 偏 Java 业务 | JPA 为主 |
| 偏 DBA / SQL | MyBatis 为主 |
| 混合 | **规范边界** + Code Review 清单 |

**培训：** JPA 必讲 N+1、事务、懒加载；MyBatis 必讲 SQL 注入防护、分页。

---

## ⭐ 与数据库模块衔接

| 主题 | 文档 |
|------|------|
| 索引、EXPLAIN | [database/02](../database/02-index-and-explain) |
| 事务隔离 | [database/03](../database/03-transaction-isolation) |
| 连接池、InnoDB | [database/04](../database/04-innodb-and-mvcc) |
| Spring 事务 | [framework/04](../spring/framework/04-data-transaction) |
| Boot 数据访问 | [boot/05](../spring/boot/05-data-access) |

**无论 JPA 还是 MyBatis，慢查询都要会 EXPLAIN。**

---

## 📌 迁移

| 方向 | 要点 |
|------|------|
| JPA → MyBatis | 保留 Entity 作 DTO 或废弃；SQL 从 Hibernate 日志导出调优 |
| MyBatis → JPA | 先简单表；复杂 SQL 暂留 MyBatis |
| 换 ORM 框架 | **大成本** — 非必要不换 |

---

## ⚠️ 常见误区

| 误区 | 事实 |
|------|------|
| JPA 不能写 SQL | Native Query / MyBatis 并存 |
| MyBatis 不能 ORM | 有自动映射，只是不管理持久化上下文 |
| JPA 一定慢 | N+1 和滥用 EAGER 才是慢 |
| 全项目只能选一个 | 大厂混用很常见，要有边界 |
| JPA 替代 Flyway | ddl-auto 不能上生产 |

---

## 本章小结

- **CRUD / 领域** → JPA；**复杂 SQL / 报表** → MyBatis
- 可混用：JPA 写 + MyBatis 读报表；统一事务与包结构
- 选型看业务形态与团队，没有绝对优劣

---

## JPA 模块回顾

| 章 | 要点 |
|----|------|
| 01 概览 | 规范/实现、EntityManager、生命周期 |
| 02 映射 | 主键、枚举、审计、DTO 分离 |
| 03 关联 | LAZY、N+1、JOIN FETCH |
| 04 查询 | JPQL、Specification、分页 |
| 05 实战 | 分层、事务、乐观锁、批量 |
| 06 选型 | 与 MyBatis 对比与混用 |

---

## 下一步

- 继续 [后端路线图](../roadmap) — `distributed/`、`jvm/` 等
- 对照 [MyBatis](../mybatis/) 与 [数据库](../database/)

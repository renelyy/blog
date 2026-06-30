# 第 6 章：日期与时间 API

[← 卷 II 目录](../index)

> 原书 Chapter 6 — The Date and Time API（`java.time`）

---

## ⭐ 为什么不用 `Date` / `Calendar`

| 旧 API 问题 | 后果 |
|-------------|------|
| `Date` 可变 | 传参后被改，难排查 |
| `Calendar` 笨重 | 月份 0 起、线程不安全 |
| `SimpleDateFormat` | **非线程安全**，不能 static |
| 时区混乱 | GMT/CST 混用 |

**Java 8+ 统一 `java.time`** — JSR-310，不可变、线程安全、清晰命名。

---

## ⭐ 核心类型一览

| 类型 | 含义 | 示例 |
|------|------|------|
| `LocalDate` | 日期（无时区） | 2024-06-30 |
| `LocalTime` | 时间 | 14:30:00.123 |
| `LocalDateTime` | 日期+时间 | 2024-06-30T14:30 |
| `ZonedDateTime` | 带时区完整时刻 | 2024-06-30T14:30+08:00[Asia/Shanghai] |
| `OffsetDateTime` | 带 UTC 偏移 | 2024-06-30T06:30Z |
| `Instant` | UTC 时间线点 | 存储/传输首选 |
| `Duration` | 时间量（秒/nano） | PT2H30M |
| `Period` | 日期量（年月日） | P1Y2M3D |

```java
LocalDate today = LocalDate.now();
LocalDate nextMonth = today.plusMonths(1);
LocalDate lastDay = today.with(TemporalAdjusters.lastDayOfMonth());

LocalDateTime dt = LocalDateTime.of(2024, 6, 30, 10, 0, 0);
Instant instant = Instant.now();
Duration between = Duration.between(start, end);
Period age = Period.between(birthDate, today);
```

---

## ⭐ 解析与格式化

```java
DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
String text = dt.format(fmt);
LocalDateTime parsed = LocalDateTime.parse("2024-06-30 10:00:00", fmt);

// ISO-8601 标准 — API 交互推荐
LocalDate.parse("2024-06-30");
Instant.parse("2024-06-30T02:00:00Z");
```

**企业规范：**

- REST JSON：`"2024-06-30T10:00:00+08:00"` 或 epoch millis
- Jackson：`JavaTimeModule` + `@JsonFormat` / 全局配置
- 日志：`DateTimeFormatter.ISO_LOCAL_DATE_TIME`

---

## ⭐ 时区

```java
ZoneId shanghai = ZoneId.of("Asia/Shanghai");
ZoneId utc = ZoneId.of("UTC");

ZonedDateTime zdt = ZonedDateTime.now(shanghai);
Instant instant = zdt.toInstant();  // 存库、跨系统

LocalDateTime local = instant.atZone(shanghai).toLocalDateTime();
```

**规则：** 存库用 UTC `Instant` 或带 offset；展示层转用户时区；**禁止**服务器本地时区隐式转换。

```java
// 测试：固定 Clock
Clock fixed = Clock.fixed(Instant.parse("2024-01-01T00:00:00Z"), shanghai);
LocalDate d = LocalDate.now(fixed);
```

---

## ⭐ TemporalAdjusters

```java
LocalDate firstDay = date.with(TemporalAdjusters.firstDayOfMonth());
LocalDate nextFriday = date.with(TemporalAdjusters.next(DayOfWeek.FRIDAY));
LocalDate workday = date.with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY));
```

报表周期、账单日计算常用。

---

## 📌 与数据库映射

| JDBC / SQL 类型 | Java 类型 |
|-----------------|-----------|
| `DATE` | `LocalDate` |
| `TIME` | `LocalTime` |
| `TIMESTAMP` | `LocalDateTime` |
| `TIMESTAMP WITH TIME ZONE` | `OffsetDateTime` / `Instant` |

MyBatis 3.4.5+ 内置 TypeHandler；JPA `@Column` + `AttributeConverter`。

---

## 📌 与旧 API 互操作

```java
Instant instant = legacyDate.toInstant();
Date legacy = Date.from(instant);
ZonedDateTime zdt = legacy.toInstant().atZone(ZoneId.systemDefault());
```

遗留代码迁移时过渡；新代码不写 `Date`。

---

## 📌 业务场景示例

```java
// 订单超时：创建后 30 分钟未支付关闭
Instant expireAt = order.getCreatedAt().plus(Duration.ofMinutes(30));
if (Instant.now().isAfter(expireAt)) {
  closeOrder(order);
}

// 仅比较日期（生日、有效期）
LocalDate expireDate = LocalDate.of(2025, 12, 31);
if (LocalDate.now().isAfter(expireDate)) {
  throw new BusinessException("已过期");
}
```

---

## ⚠️ 禁止

```java
new SimpleDateFormat("yyyy-MM-dd");     // 线程不安全
Calendar.getInstance().get(Calendar.MONTH);  // 易错
System.currentTimeMillis();             // 可以，但业务语义用 Instant
```

---

## 本章小结

- `Local*` 无时区业务日；`Instant` 存库传 API
- 格式化用 `DateTimeFormatter`；测试用 `Clock`
- 全链路 UTF-8 时区策略文档化

---

## 下一步

- [第 7 章：国际化](./07-i18n)

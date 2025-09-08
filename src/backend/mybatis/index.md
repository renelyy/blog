# MyBatis

## MyBatis 简介

MyBatis 是一款优秀的持久层框架，它支持自定义 SQL、存储过程以及高级映射。MyBatis 免除了几乎所有的 JDBC 代码以及设置参数和获取结果集的工作。MyBatis 可以通过简单的 XML 或注解来配置和映射原始类型、接口和 Java POJO（Plain Old Java Objects，普通老式 Java 对象）为数据库中的记录。

## MyBatis 核心组件

MyBatis 的核心组件包括：

1. **SqlSessionFactory**：用于创建 SqlSession 的工厂类。
2. **SqlSession**：用于执行 SQL 语句、获取映射器、管理事务等。

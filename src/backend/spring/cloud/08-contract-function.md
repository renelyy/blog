# Contract、Function 与其它组件

[← Cloud 首页](./index)

> 对应官方各子项目；本章为**概要 + 官方链接**，便于知道生态全貌。

---

## Spring Cloud Contract

**消费者驱动契约测试**：定义 API 契约 → 自动生成 Stub → 消费者/提供者分别验证。

```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-contract-verifier</artifactId>
  <scope>test</scope>
</dependency>
```

[Contract Reference](https://docs.spring.io/spring-cloud-contract/reference/)

---

## Spring Cloud Function

Serverless / Stream 的函数式基础：

```java
@Bean
public Function<String, String> uppercase() {
  return String::toUpperCase;
}
```

[Function Reference](https://docs.spring.io/spring-cloud-function/reference/)

---

## 其它集成（按需查阅）

| 项目 | 用途 | 文档 |
|------|------|------|
| **Consul** | 注册发现 + KV 配置 | [Consul](https://docs.spring.io/spring-cloud-consul/reference/) |
| **Zookeeper** | 注册发现 / 配置 | [Zookeeper](https://docs.spring.io/spring-cloud-zookeeper/reference/) |
| **Vault** | 密钥管理 | [Vault](https://docs.spring.io/spring-cloud-vault/reference/) |
| **Kubernetes** | K8s 原生发现与配置 | [K8s](https://docs.spring.io/spring-cloud-kubernetes/reference/) |
| **Task** | 短生命周期批任务 | [Task](https://docs.spring.io/spring-cloud-task/reference/) |

---

## Spring Cloud Alibaba（国内）

| 组件 | 能力 |
|------|------|
| Nacos | 注册 + 配置 |
| Sentinel | 限流熔断 |
| Seata | 分布式事务 |
| RocketMQ | 消息 |

[SCA 文档](https://sca.aliyun.com/)

---

## 下一步

- [附录：官方章节索引](../appendix-spring-reference)
- [覆盖说明](../coverage-map)

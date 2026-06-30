# 架构与概念

[← Cloud 首页](./index)

> 微服务常见模式与 Spring Cloud 在其中的位置。

---

## ⭐ 典型微服务架构

```text
                    ┌─────────────┐
    客户端 ────────→│   Gateway   │  统一入口、路由、鉴权
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
      ┌─────────┐    ┌─────────┐    ┌─────────┐
      │ order   │    │ user    │    │ product │
      │ service │    │ service │    │ service │
      └────┬────┘    └────┬────┘    └────┬────┘
           │              │              │
           └──────────────┼──────────────┘
                          ▼
              ┌───────────────────────┐
              │  Nacos / Eureka       │  注册中心
              │  Config / Nacos Config│  配置中心
              └───────────────────────┘
```

---

## ⭐ 12-Factor 与 Spring Cloud

| 原则 | Cloud 支持 |
|------|------------|
| 配置外部化 | Config / Nacos |
| 无状态进程 | 多实例 + 注册发现 |
| 端口绑定 | Boot 内嵌容器 |
| 并发扩展 | 水平扩容 + LoadBalancer |
| 日志流 | Actuator + ELK |

---

## ⭐ 服务注册发现流程

1. 服务启动 → 向注册中心**注册**（IP、端口、元数据）
2. 定期**心跳**，失败则剔除
3. 消费者从注册中心**拉取/订阅**服务列表
4. **LoadBalancer** 选一个实例发起调用

---

## 📌 Spring Cloud vs Spring Cloud Alibaba

| 能力 | Spring Cloud 原生 | Alibaba（国内常用） |
|------|-------------------|---------------------|
| 注册发现 | Eureka | **Nacos** |
| 配置 | Config Server | **Nacos Config** |
| 网关 | Gateway | Gateway（通用） |
| 熔断 | Resilience4j | **Sentinel** |
| 事务 | — | Seata |

Alibaba 文档：[SCA Reference](https://sca.aliyun.com/)

---

## 📌 单体 vs 微服务

| 何时微服务 | 何时单体 |
|------------|----------|
| 团队大、领域清晰 | 初创、业务探索 |
| 独立扩缩容 | 运维能力有限 |
| 技术栈异构 | 追求简单交付 |

Spring Boot 单体 + 模块化包结构，往往是合理起点。

---

## 下一步

- [服务注册与发现](./02-discovery)

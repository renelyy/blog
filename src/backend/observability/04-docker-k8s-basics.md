# Docker 与 K8s 入门

[← 返回索引](./index)

> **本节目标：** 掌握 Spring Boot 容器化、Dockerfile 最佳实践与 Kubernetes 核心概念。

---

## ⭐ 为什么容器化

| 收益 | 说明 |
|------|------|
| **环境一致** | 开发 = 测试 = 生产镜像 |
| **隔离** | 进程、文件系统、网络 |
| **弹性** | K8s 水平扩缩 |
| **交付** | CI 构建镜像 → 滚动发布 |

```text
代码 → Maven 打包 → Docker 镜像 → 镜像仓库 → K8s 部署
```

---

## ⭐ Spring Boot Dockerfile（推荐）

### 多阶段构建

```dockerfile
# 阶段 1：构建
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN ./mvnw dependency:go-offline -B
COPY src ./src
RUN ./mvnw package -DskipTests -B

# 阶段 2：运行
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app
USER app

COPY --from=builder /app/target/*.jar app.jar

ENV JAVA_OPTS="-Xms512m -Xmx512m -XX:+UseG1GC"
ENV TZ=Asia/Shanghai

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

| 实践 | 说明 |
|------|------|
| **多阶段** | 运行镜像不含 JDK/源码 |
| **非 root** | `USER app` |
| **JRE 非 JDK** | 镜像更小 |
| **层缓存** | 先 COPY pom 再 dependency |

---

## ⭐ 镜像优化

```dockerfile
# Spring Boot 2.3+ 分层 JAR（可选）
java -Djarmode=tools -jar app.jar extract --layers --destination extracted
# Dockerfile 按 dependencies / spring-boot-loader / snapshot-dependencies / application 分层 COPY
```

| 技巧 | 效果 |
|------|------|
| `.dockerignore` | 排除 target、.git |
| Alpine / Distroless | 减小体积与攻击面 |
| 固定基础镜像 tag | 可重现构建 |

---

## ⭐ Docker Compose（本地）

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/demo
      SPRING_DATA_REDIS_HOST: redis
    depends_on:
      - mysql
      - redis

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: demo

  redis:
    image: redis:7-alpine
```

`docker compose up -d` — 本地联调 MySQL/Redis/MQ。

---

## ⭐ Kubernetes 核心对象

```text
Pod（最小调度单元，1+ 容器）
  ↓ 由 Deployment 管理
Deployment（副本数、滚动更新）
  ↓ 暴露
Service（ClusterIP / NodePort / LoadBalancer）
  ↓ 对外
Ingress（HTTP 路由、TLS）
```

| 对象 | 作用 |
|------|------|
| **ConfigMap** | 配置 |
| **Secret** | 密码、证书 |
| **Namespace** | 环境隔离 |
| **HPA** | 按 CPU/QPS 自动扩缩 |

---

## ⭐ Deployment 示例

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
    spec:
      containers:
        - name: app
          image: registry.example.com/order-service:1.0.0
          ports:
            - containerPort: 8080
          env:
            - name: JAVA_OPTS
              value: "-Xms512m -Xmx512m"
            - name: SPRING_PROFILES_ACTIVE
              value: "prod"
          resources:
            requests:
              memory: "768Mi"
              cpu: "500m"
            limits:
              memory: "1Gi"
              cpu: "1000m"
          livenessProbe:
            httpGet:
              path: /actuator/health/liveness
              port: 8080
            initialDelaySeconds: 60
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /actuator/health/readiness
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: order-service
spec:
  selector:
    app: order-service
  ports:
    - port: 80
      targetPort: 8080
```

---

## ⭐ 滚动更新与回滚

```bash
kubectl set image deployment/order-service app=registry.example.com/order-service:1.0.1
kubectl rollout status deployment/order-service
kubectl rollout undo deployment/order-service   # 回滚
```

| 策略 | 说明 |
|------|------|
| `RollingUpdate` | 逐步替换，默认 |
| `maxUnavailable` | 最多不可用 Pod 数 |
| `maxSurge` | 最多额外 Pod 数 |

**配合：** 就绪探针通过后再接流量；**优雅停机** `server.shutdown=graceful`。

---

## 📌 配置外置

```yaml
# ConfigMap
spring:
  datasource:
    url: jdbc:mysql://mysql.prod.svc:3306/order
```

**敏感：** Secret 挂载或 Vault；**不要** 密码打进镜像。

Spring Cloud Config / Nacos — [cloud/03](../spring/cloud/03-config)。

---

## 📌 可观测性在 K8s

```text
Pod 日志 → stdout → 节点 Agent → Loki/ELK
/actuator/prometheus → ServiceMonitor → Prometheus
Sidecar / Agent → SkyWalking
```

**labels：** `app`、`version`、`env` — 与 metrics tags 一致。

见 [指标](./03-metrics-actuator)、[JVM 容器注意](../jvm/03-tuning-and-oom)。

---

## 📌 CI/CD 流水线（概念）

```text
git push → GitHub Actions / Jenkins
    → mvn test
    → docker build & push
    → kubectl apply / Helm upgrade
    → 冒烟 + 监控观察
```

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| `-Xmx` = memory limit | OOMKilled |
| 探针 initialDelay 太短 | 启动期反复重启 |
| latest 标签生产 | 不可追溯 — 用版本号 |
| 容器内时区 UTC | 日志时间乱 — 设 `TZ` |
| 无 resources requests | 调度不稳定 |
| root 运行 | 安全风险 |

---

## 本章小结

- **多阶段 Dockerfile** + 非 root + JRE + JAVA_OPTS
- **K8s：** Deployment、Service、探针、ConfigMap/Secret
- 与 **Actuator 健康检查**、**Prometheus**、**日志 stdout** 配套

---

## 可观测性模块回顾

| 章 | 要点 |
|----|------|
| 01 日志 | MDC、traceId、JSON、ELK |
| 02 链路 | Trace/Span、OTel、SkyWalking |
| 03 指标 | Prometheus、Grafana、告警 |
| 04 容器 | Docker、K8s、探针、发布 |

---

## 下一步

- 继续 [后端路线图](../roadmap) — `testing/`、`api-design/` 等
- [Boot 生产运维](../spring/boot/11-production)
- [Spring Cloud Gateway](../spring/cloud/04-gateway)

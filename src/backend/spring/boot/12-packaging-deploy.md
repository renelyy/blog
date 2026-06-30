# 打包与部署

[← Boot 首页](./index)

> 对应官方 [Packaging](https://docs.spring.io/spring-boot/reference/packaging/index.html)、[Deploying](https://docs.spring.io/spring-boot/reference/deployment/index.html)。

---

## ⭐ 可执行 JAR

```bash
./mvnw clean package -DskipTests
java -jar target/demo-0.0.1-SNAPSHOT.jar

# 传参
java -jar app.jar --spring.profiles.active=prod --server.port=9090
```

Spring Boot Maven Plugin  repackage 为 fat jar，内嵌 Tomcat。

---

## ⭐ Docker

```dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
```

多阶段构建：

```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /src
COPY . .
RUN mvn -q package -DskipTests

FROM eclipse-temurin:17-jre-alpine
COPY --from=build /src/target/*.jar /app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

---

## 📌 JVM 参数（生产）

```bash
java -Xms512m -Xmx512m \
  -XX:+UseG1GC \
  -Dfile.encoding=UTF-8 \
  -jar app.jar
```

容器内尊重 cgroup 内存限制；JDK 17+ 可 `-XX:MaxRAMPercentage=75.0`。

---

## 📌 WAR 部署外置 Tomcat

```java
@SpringBootApplication
public class Application extends SpringBootServletInitializer {
  @Override
  protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
    return builder.sources(Application.class);
  }
}
```

```xml
<packaging>war</packaging>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-tomcat</artifactId>
  <scope>provided</scope>
</dependency>
```

---

## 📎 GraalVM Native Image（概要）

```bash
./mvnw -Pnative native:compile
```

- 启动快、内存小
- 构建慢、反射/动态代理需 hints
- 见 [官方 Native 文档](https://docs.spring.io/spring-boot/reference/packaging/native-image/index.html)

---

## 📌 Kubernetes 要点

- **Deployment** + **Service**
- **liveness** → `/actuator/health/liveness`
- **readiness** → `/actuator/health/readiness`
- ConfigMap / Secret 注入环境变量
- 配置中心（Nacos/Config）替代大量 ConfigMap

---

## 下一步

- [Cloud 架构](../cloud/01-overview)
- [官方覆盖说明](../coverage-map)

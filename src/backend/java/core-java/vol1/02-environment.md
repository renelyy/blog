# 第 2 章：Java 编程环境

[← 卷 I 目录](../index)

> 原书 Chapter 2 — The Java Programming Environment

---

## ⭐ 安装 JDK

### 发行版选择

| 发行版 | 说明 |
|--------|------|
| **Eclipse Temurin**（Adoptium） | 免费、企业常用 |
| Oracle JDK | 商业使用需留意许可 |
| Amazon Corretto | AWS 环境常见 |
| GraalVM | Native Image、多语言 |

### 环境变量

```bash
# Linux / macOS
export JAVA_HOME=/usr/lib/jvm/temurin-17
export PATH=$JAVA_HOME/bin:$PATH

java -version    # openjdk version "17.0.x"
javac -version   # javac 17.0.x
```

Windows：系统属性 → 环境变量 → `JAVA_HOME` + `%JAVA_HOME%\bin` 加入 `Path`。

**多版本管理：** SDKMAN（Linux/macOS）、jEnv；CI/CD 中固定 JDK 镜像版本。

---

## ⭐ 命令行工具

| 命令 | 作用 |
|------|------|
| `javac` | 编译 `.java` → `.class` |
| `java` | 运行主类或 `-jar` |
| `jar` | 打包/解包、查看 Manifest |
| `javadoc` | 从注释生成 HTML API 文档 |
| `jshell` | REPL（Java 9+） |
| `jcmd` / `jstack` / `jmap` | 生产诊断线程、堆 |

### 编译与 classpath

```bash
# 单文件
javac com/example/App.java
java com.example.App

# 多目录 + 依赖 jar
javac -d out -cp lib/guava.jar src/com/example/*.java
java -cp out:lib/guava.jar com.example.App
```

Windows  classpath 分隔符为 `;`，Linux/macOS 为 `:`。

### 可执行 JAR

`META-INF/MANIFEST.MF`：

```text
Main-Class: com.example.App
Class-Path: lib/dependency.jar
```

```bash
jar cfe app.jar com.example.App -C out .
java -jar app.jar
```

Spring Boot 的 fat jar 由插件自动打 Manifest + 嵌套依赖，见 [Boot 打包部署](../../../spring/boot/12-packaging-deploy)。

---

## ⭐ Maven 项目结构（企业标准）

```text
my-service/
  pom.xml
  src/
    main/
      java/com/example/...     # 源码，包路径与目录一致
      resources/
        application.yml        # 配置
        mapper/*.xml           # MyBatis
    test/
      java/...                 # JUnit 测试
      resources/
  target/                      # 编译输出（不入 Git）
```

### 最小 pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>demo</artifactId>
  <version>1.0.0-SNAPSHOT</version>
  <packaging>jar</packaging>

  <properties>
    <java.version>17</java.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>5.10.2</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
</project>
```

### Maven 生命周期（常用）

| 阶段 | 作用 |
|------|------|
| `validate` | 校验 POM |
| `compile` | 编译主代码 |
| `test` | 运行单元测试 |
| `package` | 打 jar/war |
| `verify` | 集成测试 |
| `install` | 安装到本地 `~/.m2` |
| `deploy` | 发布到私服 |

```bash
mvn clean package -DskipTests   # 打包
mvn dependency:tree             # 查依赖冲突
```

### Spring Boot 项目

用 [Spring Initializr](https://start.spring.io/) 生成，自带 `spring-boot-maven-plugin`：

```bash
mvn spring-boot:run
```

---

## 📌 Gradle（了解）

部分 Android / Kotlin 项目用 Gradle；Spring 生态仍以 Maven 为主。

```kotlin
// build.gradle.kts 片段
plugins { java }
java { toolchain { languageVersion.set(JavaLanguageVersion.of(17)) } }
dependencies { testImplementation("org.junit.jupiter:junit-jupiter:5.10.2") }
```

---

## 📌 IDE 与工作流

| IDE | 特点 |
|-----|------|
| **IntelliJ IDEA** | 重构、Spring 支持最好，企业首选 |
| VS Code + Extension Pack for Java | 轻量 |
| Eclipse | 传统政企项目 |

**日常必备操作：**

- 断点调试（F8 单步、条件断点）
- 重构：Rename、Extract Method、Move Class
- Maven/Gradle 面板刷新依赖
- Git 集成、代码格式化（团队统一 `.editorconfig`）

企业几乎不用「记事本 + javac」；但 **CI 必须能命令行 `mvn package`**，不能只依赖 IDE 构建。

---

## 📌 JShell

```bash
jshell
|  Welcome to JShell -- Version 17
jshell> record Point(int x, int y) {}
jshell> var p = new Point(3, 4);
p ==> Point[x=3, y=4]
jshell> IntStream.range(1, 5).sum()
$3 ==> 10
```

适合：验证 API、写 Snippet、培训演示。复杂逻辑仍应写单元测试。

---

## 📌 包与源码组织

```text
com.example.order
  controller/   OrderController
  service/      OrderService, OrderServiceImpl
  repository/   OrderMapper / OrderRepository
  domain/       Order, OrderItem
  dto/          CreateOrderRequest
  config/       配置类
```

**约定：** 按**业务模块**或**分层**划分；避免 `util` 包无限膨胀。

---

## 📌 文档与注释

- **Javadoc**：公共 API 用 `/** */`，`mvn javadoc:javadoc` 生成站点
- **README**：如何启动、环境变量、端口
- **OpenAPI**：REST 接口用 Swagger/Knife4j 自动生成

---

## ⚠️ 常见问题

| 问题 | 处理 |
|------|------|
| `UnsupportedClassVersionError` | 运行 JVM 版本低于编译版本 |
| 找不到主类 | classpath 未包含 `out` 或 Manifest 错误 |
| 依赖冲突 | `mvn dependency:tree`，排除传递依赖 |
| 编码乱码 | POM 设 UTF-8，IDE File Encoding UTF-8 |

---

## 本章小结

- 安装 **JDK 17/21**，配置 `JAVA_HOME`
- 企业用 **Maven/Gradle + IDE**，命令行构建与 CI 一致
- 理解 classpath、jar、生命周期，才能排查「本地好使、流水线失败」

---

## 下一步

- [第 3 章：基本程序结构](./03-fundamentals)

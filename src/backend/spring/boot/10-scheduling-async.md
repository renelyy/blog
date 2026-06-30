# 调度与异步

[← Boot 首页](./index)

> 对应官方 [Task Execution and Scheduling](https://docs.spring.io/spring-boot/reference/features/task-execution-and-scheduling.html)。

---

## ⭐ @EnableAsync

```java
@SpringBootApplication
@EnableAsync
public class Application { }
```

```java
@Service
public class NotifyService {
  @Async
  public CompletableFuture<Void> sendAsync(String msg) {
    // 异步线程池执行
    return CompletableFuture.completedFuture(null);
  }
}
```

⚠️ `@Async` 同类自调用不生效；需注入自身代理或拆 Bean。

---

## 自定义线程池

```java
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {
  @Override
  @Bean(name = "taskExecutor")
  public Executor getAsyncExecutor() {
    ThreadPoolTaskExecutor ex = new ThreadPoolTaskExecutor();
    ex.setCorePoolSize(8);
    ex.setMaxPoolSize(32);
    ex.setQueueCapacity(500);
    ex.setThreadNamePrefix("async-");
    ex.initialize();
    return ex;
  }
}

@Async("taskExecutor")
public void doWork() { }
```

Boot 3.2+ 可配置：

```yaml
spring:
  task:
    execution:
      pool:
        core-size: 8
        max-size: 32
        queue-capacity: 500
```

---

## ⭐ @Scheduled

```java
@EnableScheduling
@SpringBootApplication
public class Application { }

@Scheduled(cron = "${job.report.cron:0 0 1 * * ?}")
public void report() { }
```

---

## 📌 分布式锁（多实例）

`@Scheduled` 在多 Pod 会重复执行 → **ShedLock** / **XXL-JOB** / Redis 锁。

---

## 下一步

- [生产运维](./11-production)

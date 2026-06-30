# 集成能力：事件、调度、缓存、邮件

[← Framework 首页](./index)

> 对应官方 Integration 章节：Events、Scheduling、Caching、Email。

---

## ⭐ 应用事件

```java
public record OrderCreatedEvent(Long orderId) { }

@Component
@RequiredArgsConstructor
public class OrderService {
  private final ApplicationEventPublisher events;

  public void create(Order order) {
    // 保存...
    events.publishEvent(new OrderCreatedEvent(order.getId()));
  }
}

@Component
public class OrderCreatedListener {
  @EventListener
  public void onOrderCreated(OrderCreatedEvent event) {
    log.info("订单创建: {}", event.orderId());
  }

  @Async
  @EventListener
  public void sendEmail(OrderCreatedEvent event) { }
}
```

`@Async` 需 `@EnableAsync`。

---

## ⭐ @Scheduled 定时任务

```java
@SpringBootApplication
@EnableScheduling
public class Application { }

@Component
public class ReportJob {
  @Scheduled(cron = "0 0 2 * * ?")
  public void dailyReport() { }

  @Scheduled(fixedDelay = 60000)
  public void heartbeat() { }
}
```

生产多实例需 **分布式调度**（XXL-JOB、ShedLock）。

---

## ⭐ @Cacheable 缓存

```java
@SpringBootApplication
@EnableCaching
public class Application { }
```

```yaml
spring:
  cache:
    type: redis   # 或 caffeine
```

```java
@Service
public class UserService {
  @Cacheable(cacheNames = "users", key = "#id")
  public User findById(Long id) { ... }

  @CacheEvict(cacheNames = "users", key = "#id")
  public void delete(Long id) { }

  @CachePut(cacheNames = "users", key = "#result.id")
  public User update(User user) { ... }
}
```

---

## 📌 JavaMail 发送邮件

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

```yaml
spring:
  mail:
    host: smtp.example.com
    username: user
    password: pass
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true
```

```java
@Service
@RequiredArgsConstructor
public class MailService {
  private final JavaMailSender mailSender;

  public void send(String to, String subject, String text) {
    SimpleMailMessage msg = new SimpleMailMessage();
    msg.setTo(to);
    msg.setSubject(subject);
    msg.setText(text);
    mailSender.send(msg);
  }
}
```

---

## 📌 RestTemplate / RestClient 同步调用

Boot 3.2+ 推荐 `RestClient`；老项目常见 `RestTemplate` + `@LoadBalanced`（Cloud）。

---

## 下一步

- [Boot 调度与异步](../boot/10-scheduling-async)
- [Boot Redis](../boot/08-nosql-redis)

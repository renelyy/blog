# WebSocket 与 STOMP

[← Framework 首页](./index)

> 对应官方 [Web → WebSocket](https://docs.spring.io/spring-framework/reference/web/websocket.html)。

---

## ⭐ WebSocket 用途

- 实时推送：聊天、通知、大屏
- 双向通信，比轮询省资源

---

## Spring WebSocket + STOMP

STOMP：子协议，提供订阅/发送语义（类似消息队列）。

### 依赖

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

### 配置

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
  }

  @Override
  public void configureMessageBroker(MessageBrokerRegistry registry) {
    registry.enableSimpleBroker("/topic", "/queue");
    registry.setApplicationDestinationPrefixes("/app");
  }
}
```

### 发送消息

```java
@Controller
public class ChatController {
  @MessageMapping("/chat.send")
  @SendTo("/topic/messages")
  public ChatMessage send(ChatMessage msg) {
    return msg;
  }
}
```

客户端：`/app/chat.send` 发送 → 订阅 `/topic/messages` 接收。

---

## 📌 SimpMessagingTemplate 主动推送

```java
@Service
@RequiredArgsConstructor
public class NotifyService {
  private final SimpMessagingTemplate messaging;

  public void pushToUser(String userId, Object payload) {
    messaging.convertAndSendToUser(userId, "/queue/notify", payload);
  }

  public void broadcast(Object payload) {
    messaging.convertAndSend("/topic/alerts", payload);
  }
}
```

---

## ⚠️ 生产注意

- 多实例需 **Redis/RabbitMQ** 做消息广播（SimpleBroker 仅单机）
- Gateway WebSocket 需专门路由配置
- 鉴权：HandshakeInterceptor 或 STOMP CONNECT 帧校验 Token

---

## 下一步

- [WebFlux 入门](./09-webflux)

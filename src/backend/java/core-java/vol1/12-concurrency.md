# 第 12 章：并发编程

[← 卷 I 目录](../index)

> 原书 Chapter 12 — Concurrent Programming — **企业后端必学**

---

## ⭐ 为什么需要并发

- **吞吐：** 多核 CPU 并行处理请求
- **响应：** IO 等待时不阻塞（异步、虚拟线程）
- **解耦：** 生产者-消费者、事件驱动

**Web 容器**（Tomcat）已为每个 HTTP 请求分配线程；业务还要处理：异步任务、定时Job、缓存并发读写、分布式锁等。

---

## ⭐ 线程基础

### 创建与启动

```java
// ❌ 生产避免裸 Thread
Thread t = new Thread(() -> doWork(), "worker-1");
t.start();

// ✅ 线程池
ExecutorService pool = Executors.newFixedThreadPool(8);
Future<String> future = pool.submit(() -> fetch());
String result = future.get(10, TimeUnit.SECONDS);
pool.shutdown();
pool.awaitTermination(60, TimeUnit.SECONDS);
```

### 线程状态

```text
NEW → RUNNABLE ⇄ BLOCKED（等 monitor）
              ⇄ WAITING（wait/join/park）
              ⇄ TIMED_WAITING（sleep/timeout）
              → TERMINATED
```

```java
thread.join();              // 等待结束
thread.interrupt();         // 协作式中断
Thread.currentThread().isInterrupted();  // 检查标志

Thread.sleep(1000);         // 不释放锁；抛 InterruptedException
Thread.yield();             // 提示调度器
```

### 中断处理模式

```java
while (!Thread.currentThread().isInterrupted()) {
  try {
    Task task = queue.take();
    process(task);
  } catch (InterruptedException ex) {
    Thread.currentThread().interrupt();  // 恢复中断标志
    break;
  }
}
```

**不要** 吞掉 `InterruptedException` 且不 `interrupt()`。

---

## ⭐ 线程池 `ThreadPoolExecutor`

### 核心参数

```java
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    8,                      // corePoolSize
    32,                     // maximumPoolSize
    60L, TimeUnit.SECONDS,  // keepAliveTime（非核心线程空闲回收）
    new ArrayBlockingQueue<>(500),  // 有界队列 — 必须
    new ThreadFactoryBuilder().setNameFormat("biz-%d").build(),
    new ThreadPoolExecutor.CallerRunsPolicy()
);
```

**任务提交流程：**

```text
线程数 < core → 新建线程
线程数 ≥ core → 入队
队列满 且 线程数 < max → 新建线程
队列满 且 线程数 = max → 拒绝策略
```

### Spring 配置

```java
@Bean("taskExecutor")
public Executor taskExecutor() {
  ThreadPoolTaskExecutor ex = new ThreadPoolTaskExecutor();
  ex.setCorePoolSize(8);
  ex.setMaxPoolSize(32);
  ex.setQueueCapacity(500);
  ex.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
  ex.setThreadNamePrefix("async-");
  ex.setWaitForTasksToCompleteOnShutdown(true);
  ex.setAwaitTerminationSeconds(30);
  ex.initialize();
  return ex;
}
```

```java
@Async("taskExecutor")
public CompletableFuture<User> loadUserAsync(Long id) {
  return CompletableFuture.completedFuture(repo.findById(id));
}
```

### 拒绝策略

| 策略 | 行为 | 场景 |
|------|------|------|
| AbortPolicy | 抛 `RejectedExecutionException` | 默认，快速失败 |
| CallerRunsPolicy | 调用者线程执行 | 削峰，不丢任务 |
| DiscardPolicy | 静默丢弃 | 可丢的指标 |
| DiscardOldestPolicy | 丢队列最老 | 实时性优先 |

**禁止** `Executors.newCachedThreadPool()` 无界扩线程上生产；**禁止** 无界 `LinkedBlockingQueue` 导致 OOM。

---

## ⭐ 同步：`synchronized`

```java
public class Counter {
  private int count;

  public synchronized void increment() { count++; }

  public synchronized int getCount() { return count; }
}

private final Object lock = new Object();
void update() {
  synchronized (lock) {
    // 临界区 — 互斥、可见性、可重入
  }
}
```

- 每个对象有 **monitor** 锁
- static synchronized 锁 Class 对象
- **可重入**：同线程可多次进入同一把锁

### `synchronized` vs `Lock`

| | synchronized | ReentrantLock |
|---|--------------|---------------|
| 语法 | 简单 | 需 try/finally |
| 中断 | 否 | `lockInterruptibly` |
| 超时 | 否 | `tryLock(timeout)` |
| 公平 | 非公平 | 可选公平 |
| 条件 | 单个 wait set | 多个 Condition |

---

## ⭐ `ReentrantLock` 与 `Condition`

```java
private final ReentrantLock lock = new ReentrantLock();
private final Condition notFull = lock.newCondition();
private final Condition notEmpty = lock.newCondition();

public void put(E item) throws InterruptedException {
  lock.lock();
  try {
    while (queue.size() == capacity) notFull.await();
    queue.add(item);
    notEmpty.signal();
  } finally {
    lock.unlock();
  }
}
```

**手写阻塞队列** 用 Condition；业务直接用 `ArrayBlockingQueue`。

---

## ⭐ 读写锁

```java
ReadWriteLock rwLock = new ReentrantReadWriteLock();

public User get(Long id) {
  rwLock.readLock().lock();
  try {
    return cache.get(id);
  } finally {
    rwLock.readLock().unlock();
  }
}

public void put(Long id, User user) {
  rwLock.writeLock().lock();
  try {
    cache.put(id, user);
  } finally {
    rwLock.writeLock().unlock();
  }
}
```

读多写少缓存；`StampedLock` 乐观读进一步优化（实现复杂）。

---

## ⭐ `volatile`

```java
private volatile boolean shutdown = false;

public void shutdown() {
  shutdown = true;
}

public void run() {
  while (!shutdown) { /* work */ }
}
```

- 保证**可见性**和**禁止指令重排**（happens-before）
- **不**保证 `count++` 原子性 — 用 `AtomicInteger` 或同步

---

## ⭐ 原子类与 CAS

```java
AtomicInteger counter = new AtomicInteger();
counter.incrementAndGet();
counter.compareAndSet(expect, update);

AtomicReference<User> ref = new AtomicReference<>();
ref.updateAndGet(u -> merge(u, patch));

LongAdder adder = new LongAdder();  // 高并发计数，分段累加
adder.increment();
long sum = adder.sum();
```

**LongAdder vs AtomicLong：** 写多读少统计用 LongAdder；需要 CAS 精确读用 AtomicLong。

---

## ⭐ 并发集合

```java
ConcurrentHashMap<Long, User> map = new ConcurrentHashMap<>();
map.putIfAbsent(id, user);
map.compute(id, (k, v) -> v == null ? create() : update(v));

CopyOnWriteArrayList<Listener> listeners = new CopyOnWriteArrayList<>();
// 写时复制，迭代不抛 CME，写成本高

BlockingQueue<Task> queue = new LinkedBlockingQueue<>(1000);
queue.put(task);   // 阻塞直到有空间
Task t = queue.take();  // 阻塞直到有元素
```

### 生产者-消费者完整示例

```java
BlockingQueue<OrderEvent> queue = new ArrayBlockingQueue<>(10_000);

// 生产者
void publish(OrderEvent e) throws InterruptedException {
  queue.put(e);
}

// 消费者线程池
Executors.newFixedThreadPool(4).submit(() -> {
  while (running) {
    OrderEvent e = queue.take();
    handle(e);
  }
});
```

---

## ⭐ 同步工具类

```java
// 等多路完成
CountDownLatch latch = new CountDownLatch(3);
executor.submit(() -> { work1(); latch.countDown(); });
// ... countDown x3
latch.await(30, TimeUnit.SECONDS);

// 多线程齐跑下一 phase
CyclicBarrier barrier = new CyclicBarrier(3, () -> merge());

// 限流 — 同时最多 N 个调用外部 API
Semaphore sem = new Semaphore(10);
sem.acquire();
try { callExternal(); } finally { sem.release(); }

// 交换数据
Exchanger<Data> ex = new Exchanger<>();
```

---

## ⭐ `CompletableFuture` 深入

```java
CompletableFuture<User> fUser = CompletableFuture
    .supplyAsync(() -> userClient.get(1L), pool);

CompletableFuture<Order> fOrder = CompletableFuture
    .supplyAsync(() -> orderClient.get(100L), pool);

CompletableFuture<Void> all = CompletableFuture.allOf(fUser, fOrder);
all.thenRun(() -> combine(fUser.join(), fOrder.join()));

// 链式
fUser
    .thenApply(User::getName)
    .thenCompose(name -> loadProfile(name))
    .exceptionally(ex -> { log.error("fail", ex); return "guest"; })
    .whenComplete((r, ex) -> metrics.record(ex == null));

// 竞速
CompletableFuture.anyOf(f1, f2, f3);
```

| 注意 | 说明 |
|------|------|
| 默认线程池 | `supplyAsync` 无参用 `ForkJoinPool.commonPool()` — 生产传自定义 pool |
| 事务 | `@Async` / CF 新线程**无**原 `@Transactional` |
| 异常 | `join()` 包装为 `CompletionException` |

---

## ⭐ `ThreadLocal`

```java
private static final ThreadLocal<UserContext> CTX = new ThreadLocal<>();

public static void set(UserContext ctx) { CTX.set(ctx); }
public static UserContext get() { return CTX.get(); }

// 请求结束 — 线程池场景必须 remove
public static void clear() { CTX.remove(); }
```

- 存用户上下文、租户 ID、Locale
- **泄漏：** 线程池复用线程，`remove()` 必须在 finally
- Java 21+ 考虑 **ScopedValue**（预览/演进）替代部分 ThreadLocal

---

## ⭐ Fork/Join

```java
ForkJoinPool pool = ForkJoinPool.commonPool();
long sum = pool.invoke(new RecursiveTask<Long>() {
  @Override
  protected Long compute() {
    if (length < THRESHOLD) return directSum();
    var left = new SumTask(arr, lo, mid);
    var right = new SumTask(arr, mid, hi);
    left.fork();
    return right.compute() + left.join();
  }
});
```

CPU 密集、可递归拆分；与 parallelStream 共享 commonPool — 注意互相抢资源。

---

## ⭐ 虚拟线程（Java 21+）

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
  List<Future<String>> futures = new ArrayList<>();
  for (int i = 0; i < 50_000; i++) {
    int id = i;
    futures.add(executor.submit(() -> jdbcQuery(id)));  // 阻塞 IO 不占用 OS 线程
  }
  for (Future<String> f : futures) f.get();
}
```

- Spring Boot 3.2+：`spring.threads.virtual.enabled=true`
- **pinning：** 虚拟线程内长时间 `synchronized` 可能钉住载体线程（Java 24 改进中）；优先 `ReentrantLock`、缩短临界区
- **不要** 用虚拟线程跑 CPU 密集（不会更快）

---

## 📌 线程安全单例

```java
// 静态 holder — 推荐
class Singleton {
  private Singleton() {}
  private static class Holder {
    static final Singleton INSTANCE = new Singleton();
  }
  static Singleton get() { return Holder.INSTANCE; }
}

// enum 单例 — 防反射
enum SingletonEnum { INSTANCE; }
```

双重检查锁（DCL）需 `volatile`；现更推荐 holder 或 enum。

---

## 📌 happens-before（JMM）

| 规则 | 含义 |
|------|------|
| 程序次序 | 同线程前 happens-before 后 |
| 监视器锁 | unlock happens-before 后续 lock |
| volatile | 写 happens-before 后续读 |
| 线程 start | start happens-before 子线程动作 |
| 线程 join | 子线程结束 happens-before join 返回 |
| 传递性 | A hb B, B hb C ⇒ A hb C |

没有 happens-before → 其他线程可能看到「半初始化」或陈旧值。

---

## 📌 死锁与排查

**死锁四条件：** 互斥、占有且等待、不可抢占、循环等待。

```java
// 固定加锁顺序避免死锁
synchronized (lockA) {
  synchronized (lockB) { /* ... */ }
}

// 或 tryLock 超时
if (lock1.tryLock(1, SECONDS)) {
  try {
    if (lock2.tryLock(1, SECONDS)) { /* ... */ }
  } finally { lock1.unlock(); }
}
```

排查：`jstack` 看 `Found one Java-level deadlock`；Arthas `thread -b`。

---

## ⚠️ 企业常见坑

| 问题 | 说明 |
|------|------|
| 事务 + @Async | 新线程无事务；拆分只读/写或编程式事务 |
| SimpleDateFormat static | 非线程安全 → `DateTimeFormatter` |
| 线程池无界队列 | OOM |
| 忘记 shutdown | 应用无法退出 |
| parallelStream + IO | 阻塞 commonPool |
| 共享 `Random` | 用 `ThreadLocalRandom` |
| 锁粒度过大 | 性能差；过小则复杂 |

---

## 本章小结

- **线程池**有界队列 + 命名线程 + 拒绝策略 + 优雅关闭
- **ConcurrentHashMap** / **BlockingQueue** / **CompletableFuture** 三板斧
- **虚拟线程**适合 IO 密集；CPU 密集仍用线程池 + 合理并行度
- 理解 happens-before、中断、事务边界 — 排查并发 bug 的基础

---

## 下一步

- [卷 II：Stream API](../vol2/01-streams)

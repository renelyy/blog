# 第 9 章：集合框架

[← 卷 I 目录](../index)

> 原书 Chapter 9 — Collections

---

## ⭐ 集合体系

```text
Iterable
  Collection
    List        有序、可重复、有索引
    Set         不重复（equals）
    Queue       FIFO / 优先级
  Map           键值对，key 不重复
```

**面向接口编程：** 声明 `List`、`Map`、`Set`；实现 `ArrayList`、`HashMap`、`HashSet`。

---

## ⭐ List 深入

### `ArrayList` 原理

- 内部 `Object[] elementData`
- 默认容量 10；扩容约 **1.5 倍**（`oldCapacity + (oldCapacity >> 1)`）
- `add` 均摊 O(1)；中间 insert O(n)

```java
List<String> list = new ArrayList<>(256);  // 预估容量，减少扩容拷贝
list.add("a");
list.add(0, "head");
list.get(0);
list.set(1, "A");
list.removeIf(s -> s.isBlank());
list.sort(String::compareToIgnoreCase);
```

### `LinkedList`

- 双向链表；**get(i) 是 O(n)** — 几乎总是输 ArrayList
- 适用：头尾频繁 `addFirst`/`removeFirst`，或作 `Deque`

### 选型

| 场景 | 选择 |
|------|------|
| 默认 | `ArrayList` |
| 栈/队列 | `ArrayDeque`（不是 LinkedList） |
| 读多写极少监听 | `CopyOnWriteArrayList` |

### `subList` 陷阱

```java
List<String> sub = list.subList(1, 3);  // 视图，非拷贝
sub.clear();                             // 影响原 list
// 原 list 结构性修改后 sub 操作 → ConcurrentModificationException
```

需要独立副本：`new ArrayList<>(list.subList(1, 3))`。

### `ListIterator`

```java
ListIterator<String> it = list.listIterator();
while (it.hasNext()) {
  String s = it.next();
  if (s.isEmpty()) it.remove();
  else it.set(s.trim());
}
```

---

## ⭐ Set 深入

**Set 语义：** 不含重复元素 — 由 `equals`/`hashCode`（HashSet）或 `compareTo`（TreeSet）决定。

### `HashSet`

- 底层 `HashMap`（元素作 key，`PRESENT` 作 value）
- O(1) 均摊 add/contains/remove

### `LinkedHashSet`

- 哈希表 + 双向链表维护**插入顺序**
- 略慢于 HashSet，需要顺序时用

### `TreeSet`

- 红黑树；O(log n)；**有序**（自然序或 Comparator）
- `NavigableSet`：`lower`、`floor`、`ceiling`、`higher`、`subSet`

```java
NavigableSet<Integer> set = new TreeSet<>();
set.add(10);
set.add(5);
set.add(20);
set.floor(12);   // 10
set.ceiling(12); // 20
set.subSet(5, true, 20, false);  // [5, 20)
```

### `EnumSet`

```java
EnumSet<Role> roles = EnumSet.of(Role.ADMIN, Role.USER);
EnumSet.allOf(Role.class);
EnumSet.complementOf(roles);
```

位向量实现，极快。

---

## ⭐ Queue / Deque / PriorityQueue

```java
Queue<String> q = new ArrayDeque<>();
q.offer("a");
q.poll();

Deque<String> stack = new ArrayDeque<>();
stack.push("a");
stack.pop();

PriorityQueue<Task> pq = new PriorityQueue<>(
    Comparator.comparingInt(Task::getPriority));
pq.offer(task);
Task urgent = pq.poll();  // 最小/最大堆顶，取决于 Comparator
```

**TopK、定时任务、Dijkstra** 常用 `PriorityQueue`。

| 类 | 说明 |
|----|------|
| `ArrayDeque` | 数组环形队列，**栈/队列首选** |
| `PriorityQueue` | 堆，无序迭代 |
| `ArrayBlockingQueue` | 有界阻塞队列 |
| `LinkedBlockingQueue` | 可选有界 |
| `DelayQueue` | 延迟元素 |

**不要用** `Stack` / `Vector` — 遗留同步类。

---

## ⭐ Map 深入

### `HashMap` 原理（Java 8+）

- 数组 + 链表 / **红黑树**（链表长度 ≥ 8 且数组 ≥ 64 时树化）
- **loadFactor** 默认 0.75；**capacity** 总是 2 的幂
- `hash(key)` → 桶下标；**equals** 判同 key

```java
Map<Long, User> map = new HashMap<>(128);  // 初始容量，减少 resize
```

**自定义 Key：** 必须一致实现 `equals`/`hashCode`；**不可变 key** 最佳（String、Long）。

```java
// ❌ 可变 key 改字段后 hash 变，get 找不到
class BadKey {
  int id;
  public int hashCode() { return id; }
}
```

### `LinkedHashMap`

- 插入顺序或 **accessOrder=true**（get 会移动节点）→ LRU

```java
Map<Long, User> lru = new LinkedHashMap<>(16, 0.75f, true) {
  @Override
  protected boolean removeEldestEntry(Map.Entry<Long, User> e) {
    return size() > 10_000;
  }
};
```

生产缓存：**Caffeine**（W-TinyLFU）> 手写 LRU > Redis。

### `TreeMap`

- 红黑树；key 有序；`NavigableMap`：`subMap`、`headMap`、`tailMap`

### Java 8+ Map API（必会）

```java
map.putIfAbsent(k, v);
map.computeIfAbsent(k, key -> load(key));
map.computeIfPresent(k, (key, val) -> update(val));
map.merge(k, 1, Integer::sum);
map.getOrDefault(k, defaultVal);

map.forEach((k, v) -> { });
map.replaceAll((k, v) -> transform(v));
```

---

## ⭐ `ConcurrentHashMap`（Java 8+）

- 取消分段锁；**CAS + synchronized 桶头**
- `get` 通常无锁；高并发读写性能优秀

```java
ConcurrentHashMap<Long, AtomicLong> counters = new ConcurrentHashMap<>();

counters.computeIfAbsent(id, k -> new AtomicLong()).incrementAndGet();

// compute 原子更新
map.compute(id, (k, v) -> v == null ? newUser() : merge(v));
```

| 方法 | 说明 |
|------|------|
| `putIfAbsent` | 原子 put |
| `compute` | 原子读-改-写 |
| `merge` | 合并值 |
| `forEach(parallelismThreshold, action)` | 并行遍历 |

**不允许 null key/value**（与 HashMap 不同）。

---

## ⭐ Iterator 与 fail-fast / fail-safe

```java
// ❌ CME
for (String s : list) {
  if (s.equals("x")) list.remove(s);
}

// ✅
list.removeIf(s -> s.equals("x"));
Iterator<String> it = list.iterator();
while (it.hasNext()) {
  if (it.next().equals("x")) it.remove();
}
```

- **fail-fast**（ArrayList、HashMap）：modCount 检测并发修改
- **weakly consistent**（ConcurrentHashMap）：迭代器反映某一时刻快照，不抛 CME

---

## ⭐ 不可变集合（Java 9+）

```java
List<String> list = List.of("a", "b", "c");
Set<String> set = Set.of("a", "b");
Map<String, Integer> map = Map.of("k1", 1, "k2", 2);
Map<String, Integer> map2 = Map.ofEntries(
    Map.entry("k1", 1), Map.entry("k2", 2));

List<String> frozen = List.copyOf(mutable);  // 防御性不可变拷贝
```

- 不允许 null
- `List.of` 只有 1 个元素与多元素 overload；`Set.of(a,b,a)` 抛异常

---

## 📌 `Arrays.asList` vs `List.of`

```java
String[] arr = {"a", "b"};
List<String> fixed = Arrays.asList(arr);  // 固定大小，底层是数组
arr[0] = "z";  // fixed 也变了
// fixed.add("c");  // UnsupportedOperationException

List<String> immutable = List.of("a", "b");  // 完全不可变
```

---

## 📌 Collections 工具

```java
Collections.sort(list);
Collections.sort(list, comparator);
int idx = Collections.binarySearch(list, key);  // 必须已排序

List<String> sync = Collections.synchronizedList(list);  // 迭代仍需外部 sync
List<String> unmod = Collections.unmodifiableList(list); // 视图

Collections.max(list);
Collections.min(list, comparator);
Collections.frequency(list, "a");
Collections.disjoint(a, b);
Collections.shuffle(list);
```

---

## 📌 复杂度速查

| 操作 | ArrayList | LinkedList | HashMap | TreeMap |
|------|-----------|------------|---------|---------|
| get | O(1) | O(n) | O(1) | O(log n) |
| add 尾 | O(1)* | O(1) | O(1)* | O(log n) |
| contains | O(n) | O(n) | O(1)* | O(log n) |
| 有序遍历 | 插入序 | 插入序 | 无序 | key 序 |

*均摊

---

## 📌 与 Stream 配合

```java
Map<Long, Long> countByDept = users.stream()
    .collect(Collectors.groupingBy(User::getDeptId, Collectors.counting()));

List<String> topNames = users.stream()
    .filter(User::isActive)
    .sorted(Comparator.comparing(User::getScore).reversed())
    .limit(10)
    .map(User::getName)
    .toList();
```

见 [卷 II Stream API](../vol2/01-streams)。

---

## ⚠️ 常见坑

| 坑 | 说明 |
|----|------|
| `Arrays.asList` 当可变 List | 不能 add/remove |
| subList 长期持有 | 阻碍 GC 整个大 list |
| HashMap key 可变 | get 失效 |
| `ConcurrentHashMap` null | 不允许 |
| 大 List contains | O(n)；用 Set 辅助 |
| `Vector`/`Hashtable` | 用 juc 包替代 |

---

## 本章小结

- ArrayList + HashMap + ConcurrentHashMap 覆盖日常 90%
- 理解 HashMap 桶/树化/loadFactor 有助于调优与排查
- Java 8 Map API、不可变集合、fail-fast 是面试与实战高频

---

## 下一步

- [第 12 章：并发](./12-concurrency)

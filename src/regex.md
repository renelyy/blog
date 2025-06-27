# 正则 Regex

## 实例方法

- `Regex.prototype.exec()`

  `exec()` 方法在一个指定字符串中执行一个搜索匹配。返回一个结果数组或 null。

在 JavaScript 中，`exec()` 是一个与**正则表达式**相关的方法，主要用于在字符串中执行搜索匹配。它可用于 **`RegExp` 对象**和 **`String` 对象**（间接通过 `RegExp` 调用）。以下是它的详细用法和常见场景：

---

## **1. `RegExp.prototype.exec()`**

### **语法**

```javascript
regexObj.exec(str);
```

- **`regexObj`**：正则表达式对象（如 `/pattern/flags` 或 `new RegExp("pattern", "flags")`）。
- **`str`**：要匹配的字符串。

### **返回值**

- **匹配成功**：返回一个**数组**（包含匹配结果和分组捕获），同时更新正则表达式的 `lastIndex`。
- **匹配失败**：返回 `null`。

### **返回数组的结构**

```javascript
[
  0: "完整匹配的文本",
  1: "第1个分组捕获的内容",
  2: "第2个分组捕获的内容",
  ...
  index: 匹配的起始位置,
  input: "原始输入字符串",
  groups: 命名分组对象（ES2018+）
]
```

### **示例**

```javascript
const regex = /foo(\d+)/;
const str = "foo123 bar";
const result = regex.exec(str);

console.log(result);
// 输出:
// [
//   "foo123",    // 完整匹配
//   "123",       // 分组捕获 (\d+)
//   index: 0,    // 匹配起始位置
//   input: "foo123 bar",
//   groups: undefined
// ]

console.log(result[0]); // "foo123"
console.log(result[1]); // "123"
console.log(result.index); // 0
```

---

## **2. 核心特性**

### **(1) 全局匹配（`g` 标志）**

当正则表达式使用 `g` 或 `y`（粘性匹配）标志时，`exec()` 会记录上一次的匹配位置（`lastIndex`），后续调用会从该位置继续搜索。

```javascript
const regex = /foo(\d+)/g;
const str = "foo123 foo456";

let result;
while ((result = regex.exec(str)) !== null) {
  console.log(`匹配: ${result[0]}, 数字: ${result[1]}, 位置: ${result.index}`);
}
// 输出:
// 匹配: foo123, 数字: 123, 位置: 0
// 匹配: foo456, 数字: 456, 位置: 7
```

### **(2) 分组捕获**

`exec()` 可以捕获正则中的**分组`()`**内容：

```javascript
const regex = /(\w+)\s(\w+)/;
const str = "John Doe";
const result = regex.exec(str);

console.log(result[1]); // "John"（第1个分组）
console.log(result[2]); // "Doe" （第2个分组）
```

### **(3) 命名分组（ES2018+）**

通过 `?<name>` 语法命名分组，结果会保存在 `groups` 属性中：

```javascript
const regex = /(?<first>\w+)\s(?<last>\w+)/;
const str = "John Doe";
const result = regex.exec(str);

console.log(result.groups.first); // "John"
console.log(result.groups.last); // "Doe"
```

---

## **3. 与 `String.prototype.match()` 的区别**

| 方法               | 返回值                                                    | 全局匹配 (`g`) 时的行为      | 分组捕获支持     |
| ------------------ | --------------------------------------------------------- | ---------------------------- | ---------------- |
| `regex.exec(str)`  | 单次匹配的数组（含分组信息）                              | 需循环调用，更新 `lastIndex` | ✅               |
| `str.match(regex)` | 无 `g` 时同 `exec`；有 `g` 时返回所有匹配的数组（无分组） | 直接返回全部匹配结果         | ❌（全局模式下） |

**示例对比**：

```javascript
const str = "foo123 foo456";
const regex = /foo(\d+)/g;

// exec() 需循环获取所有结果
let execResult;
while ((execResult = regex.exec(str)) !== null) {
  console.log(execResult[1]); // "123", 然后 "456"
}

// match() 全局模式下无法获取分组
const matchResult = str.match(regex);
console.log(matchResult); // ["foo123", "foo456"]（无分组信息）
```

---

## **4. 常见用途**

1. **提取字符串中的特定部分**（如日期、数字等）：

   ```javascript
   const dateRegex = /(\d{4})-(\d{2})-(\d{2})/;
   const dateStr = "2023-10-05";
   const match = dateRegex.exec(dateStr);
   console.log(match[1], match[2], match[3]); // "2023", "10", "05"
   ```

2. **循环处理全局匹配**（如日志分析）：

   ```javascript
   const logRegex = /ERROR: (\w+)/g;
   const log = "ERROR: timeout; ERROR: server_down";
   let error;
   while ((error = logRegex.exec(log)) !== null) {
     console.log(`发现错误: ${error[1]}`);
   }
   // 输出: "发现错误: timeout", "发现错误: server_down"
   ```

3. **结合命名分组提高可读性**：
   ```javascript
   const userRegex = /(?<name>\w+) is (?<age>\d+) years old/;
   const userStr = "Alice is 25 years old";
   const user = userRegex.exec(userStr);
   console.log(user.groups.name); // "Alice"
   console.log(user.groups.age); // "25"
   ```

---

## **5. 注意事项**

- **性能**：在长字符串中频繁调用 `exec()` 可能较慢，考虑先用 `test()` 检查是否存在匹配。
- **重置 `lastIndex`**：全局匹配后若需重新开始，需手动设置 `regex.lastIndex = 0`。
- **非全局模式**：无 `g` 标志时，每次 `exec()` 都从头开始匹配。

---

### **总结**

- `exec()` 是正则表达式的底层匹配方法，适合需要**分组捕获**或**逐步匹配**的场景。
- 全局匹配时需通过循环调用，而 `match()` 更简单但无法保留分组信息。
- 命名分组（ES2018）让代码更易读。

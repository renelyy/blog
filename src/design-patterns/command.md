# 命令模式

## 定义

命令模式将请求封装为一个对象，从而允许使用不同的请求、队列或日志请求，并支持可撤销的操作。

## 优点

1. 命令模式将请求封装为一个对象，使得请求的发送者和接收者解耦，方便扩展和维护。
2. 命令模式支持可撤销的操作，可以通过记录命令的历史来实现撤销操作。
3. 命令模式支持队列和日志请求，可以通过将命令放入队列或日志中来实现批量处理和持久化。

## 缺点

1. 命令模式可能会产生大量的命令对象，导致内存占用增加。
2. 命令模式可能会增加系统的复杂度，需要合理设计命令接口和命令对象。

## 使用场景

1. 当需要将请求封装为一个对象时，可以使用命令模式。例如，在 GUI 程序中，可以将按钮点击事件封装为一个命令对象。
2. 当需要支持可撤销的操作时，可以使用命令模式。例如，在文本编辑器中，可以记录用户的所有操作，并在需要时撤销这些操作。
3. 当需要支持队列和日志请求时，可以使用命令模式。例如，在订单系统中，可以将订单请求放入队列中，并在需要时持久化这些请求。

## 命令模式 UML

```
+-----------------+
|     Receiver    |
+-----------------+
| execute()       |
+-----------------+
        |
        |
        v
+-----------------+
|     Command     |
+-----------------+
| receiver: null  |
| execute()       |
+-----------------+
        |
        |
        v
+-----------------+
|     Invoker     |
+-----------------+
| command: null   |
| setCommand()    |
| executeCommand()|
+-----------------+
```

## 代码示例

```javascript
class Receiver {
  execute() {
    console.log("Receiver executed.");
  }
}

class Command {
  constructor(receiver) {
    this.receiver = receiver;
  }

  execute() {
    this.receiver.execute();
  }
}

class Invoker {
  constructor() {
    this.command = null;
  }

  setCommand(command) {
    this.command = command;
  }

  executeCommand() {
    this.command.execute();
  }
}

const receiver = new Receiver(); // 创建接收者对象
const command = new Command(receiver); // 创建命令对象，并将接收者对象传递给它
const invoker = new Invoker(); // 创建调用者对象

invoker.setCommand(command); // 将命令对象传递给调用者对象
invoker.executeCommand(); // 调用者对象执行命令对象，从而调用接收者对象的 execute() 方法
```

## 总结

命令模式是一种常用的设计模式，它可以帮助我们实现请求的封装、可撤销的操作和队列/日志请求。在实际开发中，我们可以根据具体的需求和场景选择合适的命令模式实现方式。

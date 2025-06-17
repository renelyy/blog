# 策略模式

## 定义

策略模式定义了一系列算法，并将每一个算法封装起来，使它们可以互相替换。这种模式让算法的变化不会影响到使用算法的客户。

## 优点

1. 策略模式可以避免使用多重条件语句，使代码更加简洁易读。
2. 策略模式可以方便地添加新的算法，只需要实现一个新的策略类即可。
3. 策略模式可以降低算法之间的耦合度，使算法可以独立变化。

## 缺点

1. 策略模式可能会产生大量的策略类，增加系统的复杂度。
2. 策略模式可能会增加客户端的负担，需要了解所有的策略类及其使用场景。

## 使用场景

1. 当一个对象有多种行为，并且这些行为可以在运行时动态切换时，可以使用策略模式。例如，一个购物车对象可以根据不同的支付方式（支付宝、微信、银行卡等）进行支付。
2. 当一个算法需要根据不同的输入参数产生不同的输出结果时，可以使用策略模式。例如，一个排序算法可以根据不同的排序规则（冒泡排序、快速排序、归并排序等）进行排序。
3. 当一个对象需要根据不同的条件执行不同的操作时，可以使用策略模式。例如，一个订单对象根据不同的订单状态（待支付、已支付、已发货、已收货等）执行不同的操作。

## 策略模式 UML

```
+-----------------+
|     Context     |
+-----------------+
| strategy: null  |
+-----------------+
| setStrategy()   |
| execute()       |
+-----------------+
        |
        |
        v
+-----------------+
|    Strategy     |
+-----------------+
| execute()       |
+-----------------+
```

## 代码示例

```javascript
class Context {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  execute() {
    this.strategy.execute();
  }
}

class StrategyA {
  execute() {
    console.log("Executing strategy A");
  }
}

class StrategyB {
  execute() {
    console.log("Executing strategy B");
  }
}

const context = new Context(new StrategyA());
context.execute(); // Executing strategy A

context.setStrategy(new StrategyB());
context.execute(); // Executing strategy B
```

## 总结

策略模式是一种常用的设计模式，它可以帮助我们实现算法的解耦和动态切换。在实际开发中，我们可以根据具体的需求和场景选择合适的策略模式实现方式。

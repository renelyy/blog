# 工厂模式

## 定义

工厂模式是一种创建型设计模式，它提供了一种创建对象的最佳方式，可以将对象的创建过程与使用过程分离，从而降低系统的耦合度。

## 优点

1. 工厂模式可以降低系统的耦合度，将对象的创建过程与使用过程分离，使得代码更加灵活和可维护。
2. 工厂模式可以封装对象的创建过程，使得代码更加简洁和易读。
3. 工厂模式可以提供对象的统一接口，使得代码更加一致和规范。

## 缺点

1. 工厂模式可能会增加系统的复杂度，特别是当需要创建的对象类型较多时。
2. 工厂模式可能会产生大量的对象实例，导致系统资源消耗过大。
3. 工厂模式可能会产生对象创建的延迟，导致系统性能下降。

## 使用场景

1. 当需要创建的对象类型较多时，可以使用工厂模式来封装对象的创建过程。
2. 当需要将对象的创建过程与使用过程分离时，可以使用工厂模式来降低系统的耦合度。
3. 当需要提供对象的统一接口时，可以使用工厂模式来提高代码的一致性和规范性。

## 工厂模式 UML

```
+-----------------+
|      Factory    |
+-----------------+
| createProduct() |
+-----------------+
       |
       |
       v
+-----------------+
|    Product     |
+-----------------+
| method()        |
+-----------------+
```

## 代码示例

```javascript
class Product {
  method() {
    console.log("Product method");
  }
}

class ConcreteProductA extends Product {
  method() {
    console.log("ConcreteProductA method");
  }
}

class ConcreteProductB extends Product {
  method() {
    console.log("ConcreteProductB method");
  }
}

class Factory {
  createProduct(type) {
    switch (type) {
      case "A":
        return new ConcreteProductA();
      case "B":
        return new ConcreteProductB();
      default:
        throw new Error("Invalid product type");
    }
  }
}

const factory = new Factory();
const productA = factory.createProduct("A");
productA.method(); // ConcreteProductA method

const productB = factory.createProduct("B");
productB.method(); // ConcreteProductB method
```

## 总结

工厂模式是一种常用的设计模式，它可以帮助我们实现对象的创建过程与使用过程的分离，从而降低系统的耦合度。在实际开发中，我们可以根据具体的需求和场景选择合适的工厂模式实现方式。

# ESMAScript 6 入门

## Class 的继承

### super 关键字

1. 第一种情况，super 作为函数调用时，代表父类的构造函数。ES6 要求，子类的构造函数必须执行一次 super()函数。
2. super 作为对象时，在普通方法中，指向父类的原型对象；在静态方法中，指向父类。
3. ES6 规定，在子类普通方法中通过 super 调用父类的方法时（此时调用的是父类原型对象的方法），方法内部的 this 指向当前的子类实例。
4. 另外，在子类的静态方法中通过 super 调用父类的方法时（此时调用的是父类的静态方法），方法内部的 this 指向当前的子类，而不是子类的实例。

```js
class Parent {
  name = "Parent";
  static myStatic() {
    console.log(this);
  }

  myMethod() {
    console.log(this);
  }
}

class Child extends Parent {
  name = "Child";
  constructor() {
    super();
  }

  static myStatic() {
    // 静态方法中 super 指向父类
    // 其方法内部的 this 指向当前的子类
    super.myStatic();
  }

  myMethod() {
    // 普通方法中 super 指向父类的原型对象
    // 其方法内部的 this 指向当前的子类实例
    super.myMethod();
  }
}

Child.myStatic(); // class Child {}
const child = new Child();
child.myMethod(); // Child {}
Parent.myStatic(); // false, Parent {}
```

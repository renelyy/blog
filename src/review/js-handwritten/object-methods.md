# Object 篇手写题

[← 返回索引](../index.md)

> new/create/深拷贝/继承

---

## 实现new

> 来源：`profile/JavaScript/JavaScript手写题/Object篇/实现new.js`

```javascript
function createObject(Con) {
  // 创建新对象obj
  // let obj = {};也可以
  let obj = Object.create(null)

  // 将obj.__proto__ -> 构造函数原型
  // (不推荐)obj.__proto__ = Con.prototype
  Object.setPrototypeOf(obj, Con.prototype)

  // 执行构造函数，并接受构造函数返回值
  const ret = Con.apply(obj, [].slice.call(arguments, 1))

  // 若构造函数返回值为对象，直接返回该对象
  // 否则返回obj
  return typeof ret === 'object' ? ret : obj
}

// TEST DEMO
function S(name, age) {
  this.name = name
  this.age = age
}
let o = new createObject(S, 'renel', 23)
console.log(o) // { name: 'renel', age: 23 }
```

---

## 实现Object.create()

> 来源：`profile/JavaScript/JavaScript手写题/Object篇/实现Object.create().js`

```javascript
function newCreate(prop, propertiesObject) {
  if (typeof proto !== 'object' && typeof proto !== 'function') {
    throw TypeError('Object prototype may only be an Object: ' + proto)
  }

  function _object(o) {
    function F() {}
    F.prototype = o
    return new F()
  }

  let o = _object(prop)

  if (propertiesObject !== undefined) {
    Object.keys(propertiesObject).forEach(prop => {
      let desc = propertiesObject[prop]
      if (typeof desc !== 'object' || desc === null) {
        throw TypeError('Object prorotype may only be an Object: ' + desc)
      } else {
        Object.defineProperty(o, prop, desc)
      }
    })
  }

  return o
}
```

---

## 继承

> 来源：`profile/JavaScript/JavaScript手写题/Object篇/继承.js`

```javascript
/**
 * 1. 原型链继承
 * 2. 盗用构造函数
 * 3. 组合继承 ------------------> JavaScript 中使用最多的继承模式
 * 4. 原型式继承
 * 5. 寄生式继承
 * 6. 寄生式组合继承 -------------> 引用类型继承的最佳模式
 * class 实现继承（补充）
 */

// 1. 原型链继承
{
  // 实现
  {
    console.log('------------------ 原型链继承 --------------------')
    function SuperType() {
      this.property = true
    }

    SuperType.prototype.getSuperValue = function () {
      return this.property
    }

    function SubType() {
      this.subproperty = false
    }

    // 继承 SuperType
    SubType.prototype = new SuperType()
    SubType.prototype.constructor = SubType

    SubType.prototype.getSubValue = function () {
      return this.subproperty
    }

    let instance = new SubType()
    console.log(instance.__proto__.__proto__ === SuperType.prototype)
    console.log(SubType.prototype.__proto__ === SuperType.prototype)
    console.log(SuperType.prototype.__proto__ === Object.prototype)
    console.log(instance.getSuperValue())

    // 为什么这里是 false 呢？因为 25 行修改了默认的原型，破坏了之前的结构，
    // 所以还要加 SubType.prototype.constructor = SubType 如 26 行
    console.log(SuperType.prototype.constructor === SuperType) // false
    console.log(SubType.prototype.constructor === SubType) // true

    // prototype.isPrototypeOf(instance)
  }
  // 问题
  {
    // 1. 原型中包含的引用值会在所有实例间共享
    // 2. 子类型在实例化时不能给父类型的构造函数传参
  }
}

// 2. 盗用构造函数（也叫对象伪装或经典继承）
// 为了解决原型包含引用值导致的继承问题
// 基本思路很简单：在子类构造函数中调用父类构造函数
// 可以传参
{
  console.log('------------------ 盗用构造函数 --------------------')
  // 实现
  {
    function SuperType(name) {
      this.colors = ['red', 'blue', 'green']
      this.name = name
    }

    SuperType.prototype.printName = function () {
      console.log(this.name)
    }

    function SubType(name, age) {
      // 继承 SuperType
      SuperType.call(this, name)
      this.age = age
    }

    let instance1 = new SubType('renel', 23)
    instance1.colors.push('black')
    console.log(instance1.colors) // "red,blue,green,black"
    let instance2 = new SubType('yangtao', 24)
    console.log(instance2.colors) // "red,blue,green"
    console.log(instance1)
    console.log(instance2)
    // instance1.printName() // instance1.printName is not a function
  }
  // 问题
  {
    // 1. 盗用构造函数的主要缺点，也是使用构造函数模式自定义类型的问题：
    //    必须在构造函数中定义方法，因此函数不能重用。
    // 2. 子类也不能访问父类原型上定义的方法，因此所有类型只能使用构造函数模式。
  }
}

// 3. 组合继承（也叫伪经典继承）
// 综合了原型链和盗用构造函数，将两者的优点集中了起来
// 基本的思路是：使用原型链继承原型上的属性和方法，而通过盗用构造函数继承实例属性
// 这样既可以把方法定义在原型上以实现重用，又可以让每个实例都有自己的属性
{
  console.log('------------------ 组合继承 --------------------')
  // 实现
  {
    function SuperType(name) {
      this.name = name
      this.colors = ['red', 'green', 'blue']
    }

    SuperType.prototype.sayName = function () {
      console.log(this.name)
    }

    function SubType(name, age) {
      // 继承属性
      SuperType.call(this, name)
      this.age = age
    }

    // 继承方法
    SubType.prototype = new SuperType()
    SubType.prototype.sayAge = function () {
      console.log(this.age)
    }

    // TEST DEMO
    let instance1 = new SubType('Nicholas', 29)
    instance1.colors.push('black')
    console.log(instance1.colors) // "red,blue,green,black"
    instance1.sayName() // "Nicholas";
    instance1.sayAge() // 29
    let instance2 = new SubType('Greg', 27)
    console.log(instance2.colors) // "red,blue,green"
    instance2.sayName() // "Greg";
    instance2.sayAge() // 27

    console.log(instance1 instanceof SubType) // true
    console.log(instance1 instanceof SuperType) // true
    console.log(SuperType.prototype.isPrototypeOf(instance1)) // true
    console.log(SubType.prototype.isPrototypeOf(instance1)) // true
  }
  // 组合继承弥补了原型链和盗用构造函数的不足，是 JavaScript 中使用最多的
  // 继承模式。而且组合继承也保留了 instanceof 操作符和 isPrototypeOf()
  // 方法识别合成对象的能力。
}

// 4. 原型式继承
// 一种不涉及严格意义上构造函数的继承方法
// 即使不自定义类型也可以通过原型实现对象之间的信息共享
// 推荐的原型式继承适用于这种情况：
// 你有一个对象，想在它的基础上再创建一个新对象。你需要把这个对象先传给
// object()，然后再对返回的对象进行适当修改。实际上克隆了两个传入的对
// 象，而且这个对象是共享的。
// ECMAScript 5 通过增加 Object.create(property, options)方法
// 将原型式继承的概念规范化了，options 里新增的属性会遮蔽原型对象上的
// 同名属性
// 原型式继承非常适合不需要单独创建构造函数，但仍然需要在对象间共享信息
// 的场合。但要记住，属性中包含的引用值始终会在相关对象间共享，跟使用原
// 型模式是一样的。
{
  console.log('------------------ 原型式继承 --------------------')
  // 实现
  {
    function object(o) {
      function F() {}
      F.prototype = o
      return new F()
    }

    let person = {
      name: 'Nicholas',
      friends: ['Shelby', 'Court', 'Van'],
    }
    let anotherPerson = object(person)
    let yetAnotherPerson = object(person)

    // 重写覆盖了原型对象的 name
    // anotherPerson.name = 'Greg'
    yetAnotherPerson.name = 'Linda'

    // 共享原型的 friends
    anotherPerson.friends.push('Rob')
    yetAnotherPerson.friends.push('Barbie')

    console.log(person.friends) // "Shelby,Court,Van,Rob,Barbie"
    console.log(anotherPerson)
    console.log(yetAnotherPerson)

    // Object.create()的第二个参数与 Object.defineProperties()的第二个
    // 参数一样：每个新增属性都通过各自的描述符来描述。以这种方式添加的属性会
    // 遮蔽原型对象上的同名属性。

    // MDN
    // options 可选。需要传入一个对象，该对象的属性类型参照
    // Object.defineProperties()的第二个参数。如果该参数
    // 被指定且不为 undefined，该传入对象的自有可枚举属性
    // (即其自身定义的属性，而不是其原型链上的枚举属性)将为
    // 新创建的对象添加指定的属性值和对应的属性描述符。
    let o = Object.create(person, {
      name: {
        writable: true,
        configurable: true,
        enumerable: true,
        value: 'renel',
      },
    })
    console.log(o.name) // renel
    console.log(o) // { name: 'renel' }
    console.log(o.__proto__)
  }
}

// 5. 寄生式继承
// 与原型式继承比较接近的一种继承方式是寄生式继承
// 寄生式继承背后的思路类似于寄生构造函数和工厂模式：创建一个实现继承的函
// 数，以某种方式增强对象，然后返回这个对象。
{
  console.log('------------------ 寄生式继承 --------------------')
  // 实现
  {
    function object(o) {
      function F() {}
      F.prototype = o
      return new F()
    }
    // 寄生式继承同样适合主要关注对象，而不在乎类型和构造函数的场景。
    //  object()函数不是寄生式继承所必需的，任何返回新对象的函数都
    // 可以在这里使用。
    function createAnother(original) {
      let clone = object(original) // 通过调用函数创建一个新对象
      clone.sayHi = function () {
        // 以某种方式增强这个对象
        console.log('hi')
      }
      return clone
    }
  }
  // 注意 通过寄生式继承给对象添加函数会导致函数难以重用，与构造函数模式类似。
}

// 6. 寄生式组合继承
// 组合继承其实也存在效率问题。最主要的效率问题就是父类构造函数始终会被调用两次：
// 一次在是创建子类原型时调用，另一次是在子类构造函数中调用。
{
  console.log('------------------ 寄生式组合继承 --------------------')
  // 组合继承展示重复调用和重复添加属性
  {
    function SuperType(name) {
      this.name = name
      this.colors = ['red', 'blue', 'green']
    }
    SuperType.prototype.sayName = function () {
      console.log(this.name)
    }
    function SubType(name, age) {
      // 第二次调用 SuperType() ------------------> ②
      // 添加属性到实例对象上 这波操作会覆盖原型上的属性
      SuperType.call(this, name)
      this.age = age
    }
    // 第一次调用 SuperType() --------------------> ①
    // 添加属性到原型对象上
    SubType.prototype = new SuperType()
    SubType.prototype.constructor = SubType
    SubType.prototype.sayAge = function () {
      console.log(this.age)
    }

    // ① 和 ② ----> 导致一一个问题，就是原型对象和实例上都添加了属性
  }

  // 怎么解决呢？
  // 寄生式组合继承通过盗用构造函数继承属性，但使用混合式原型链继承方法。
  // 基本思路是不通过调用父类构造函数给子类原型赋值，而是取得父类原型的一
  // 个副本。说到底就是使用寄生式继承来继承父类原型，然后将返回的新对象赋
  // 值给子类原型。

  // 寄生式组合继承实现
  {
    function object(original) {
      function F() {}
      F.prototype = original
      return new F()
    }

    function inheritPrototype(subType, superType) {
      let prototype = object(superType.prototype)
      prototype.constructor = subType
      subType.prototype = prototype
    }

    function SuperType(name) {
      this.name = name
      this.colors = ['red', 'green', 'blue']
    }

    SuperType.prototype.sayHi = function () {
      console.log('hi')
    }
    SuperType.prototype.sayName = function () {
      console.log(this.name)
    }

    function SubType(name, age) {
      SuperType.call(this, name)
      this.age = age
    }

    inheritPrototype(SubType, SuperType)

    SubType.prototype.sayAge = function () {
      console.log(this.age)
    }

    let instance1 = new SubType('renel', 22)
    let instance2 = new SubType('yangtao', 24)
    instance1.colors.push('yellow')
    console.log(instance1.colors)
    console.log(instance2.colors)
    instance1.sayHi()
    instance2.sayAge()
    instance2.sayName()

    // 这里只调用了一次 SuperType 构造函数，避免了 SubType.prototype 上
    // 不必要也用不到的属性，因此可以说这个例子的效率更高。而且，原型链仍然保
    // 持不变，因此 instanceof 操作符和isPrototypeOf()方法正常有效。寄生
    // 式组合继承可以算是引用类型继承的最佳模式。
  }
}

// class 实现继承（补充）
{
  class SuperType {
    constructor(name) {
      this.name = name
    }
    getName() {
      return this.name
    }
  }

  class SubType extends SuperType {
    constructor(name, age) {
      super(name)
      this.age = age
    }
  }

  let instance1 = new SubType('yy', 22)
  let instance2 = new SubType('renel', 24)
  console.log(instance1)
  console.log(instance2)
  console.log(instance1.getName())
  console.log(instance2.getName())
}
```

---


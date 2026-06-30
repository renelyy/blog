# TypeScript 学习笔记

[← 返回索引](../index.md)

> 迁移自 `profile/JavaScript/typescript/test/ts-notes.md`

---

# TypeScript学习笔记
## 环境准备
0. Node.js环境
1. 全局安装TypeScript npm install typescript -g
2. 安装ts-node(可以直接解析ts文件,不需要转行为js) npm install ts-node -g
    + 运行ts：ts-node Demo.ts

## 语法
1. 静态类型
TypeScript 的一个最主要特点就是可以定义静态类型，英文是 Static Typing。
```
基础静态类型 number,string,null,undefinde,symbol,boolean,void
const count: number = 1
const name: string = 'aaa'
let a = obj!.name // 非空断言 obj不能是null和undefined
对象类型
// 对象
const obj: { key: string, value: number } = { key: 'age', value: 18 }
// 数组
1. 基本类型
const arr: string[] = ['aaa', 'bbb', 'ccc']
2. 多种类型
const arr: (number | string)[] = [1, "string", 2]
3. 数组中嵌套对象
    // 使用类型别名(type alias)
type Person = { name: string, age: Number }
const arr: Person[] = [{name: 'aaa', age: 18}, {name: 'bbb', age:28}]
    // 使用类 class
class Person {
  name: string
  age: number
}
const arr: Person[] = [{name: 'aaa', age: 18}, {name: 'bbb', age:28}]
ex. 元组
const tuple: [string, string, number] = ['北京市', '海淀区', 100000]
// 类
class Dog {}
const xiaobai: Dog = new Dog()
// 函数 并指定返回值
const getName: () => string = () => {
  return 'xiaoming'
}
函数参数和返回类型定义
function getTotal(x: number, y: number): number {
  return x + y
}
// 无返回值
function sayHello(): void {
  console.log("hello world")
}
// never
function forNever(): never {
  while (true) {}
}
// 参数为结构对象时
function add({ x, y }: { x: number, y: number }): number {
  return x + y
}
function getNumber({ num }: { num: number }): number {
  return num
}
```
2. interface 接口
```
自定义类型
interface Person {
  name: string
  age: number
  origin: string
  hobby?: string // 非必选值
  [propname: string]: any // 任意值
  say(): string
}
const xiaoming: Person = {
  name: "小明",
  age: 18,
  origin: 北京市,
  birthday: '20201001',
  say () {
    return '大家好我是小明'
  }
}
const getInfo = (per: Person): void => {
  console.log(per.name + "年龄是：" + per.age)
  console.log(per.name + "籍贯是：" + per.origin)
  per.hobby && console.log(per.name + "爱好是：" + per.hobby)
}
getInfo(xiaoming)
// 接口和类的约束
class xiaohua implements Person {
  name = '小花'
  age = 18
  origin = 北京市
  say() {
    return '大家好我来自北京'
  }
  teach() {
    return '我是一个老师'
  }
}
// 继承
interface Teacher extends Person {
  teach(): string
}
const getInfo = (per: Teacher): void => {
  console.log(per.name + "年龄是：" + per.age)
  console.log(per.name + "籍贯是：" + per.origin)
  per.hobby && console.log(per.name + "爱好是：" + per.hobby)
}
getInfo(xiaohua)
```
3. 类
    1. TypeScript 中类的概念和 ES6 中原生类的概念大部分相同，但是也额外增加了一些新的特性
```
// 继承
class Person {
  introduction = '大家好我是小明'
  say() {
    return this.introduction
  }
}
class Teacher extends Person {
  teach() {
    return '我是一名教师'
  }
}
const xiaobai = new Teacher()
xiaobai.say()
xiaobai.teach()
// 重写
class Teacher extends Person {
  teach() {
    return '我是一名教师'
  }
  say() {
    return '我是教师小白'
  }
}
// super 关键字
class Teacher extends Person {
  teach() {
    return '我是一名教师'
  }
  say() {
    return '小白' + super.say()
  }
}
```
  2. 类的访问类型 关键词private protected public
```
class Person {
  public name:string // 不定义默认为public
  private age: number // 只能在类的内部调用
  protected hobby: string // 允许在类内及继承的子类中使用
  public say() {
    console.log(this.name)
  }
  public showAge() {
    console.log(this.age)
  }
  public showHobby() {
    console.log(this.hobby)
  }
}
class Teacher extends Person{
  public do(){
    console.log(this.hobby)
  }
}
/* 以下属于类的外部 */
const person = new Person()
person.name = 'aaa'
console.log(person.name)
person.say()
person.age = 18
console.log(person.age)
person.showAge()
person.hobby = '游泳'
console.log(person.hobby)
person.showHobby()
const xiaobai = new Teacher()
xiaobai.do()
```
  3. 类的构造函数
```
class Person {
  public name :string
  constructor(name:string) {
    this.name=name
  }
  constructor(public name:string){
  }
}
const person= new Person('xiaobai')
console.log(person.name)
// 继承中的写法
class Person {
  constructor(public name:string) {}
}
class Teacher extends Person{
  constructor(public age:number) {
    super('xiaobai')
  }
}
const teacher = new Teacher(18)
console.log(teacher.age)
console.log(teacher.name)
```
  4. TypeScript 类的 Getter Setter 和 static
```
// get set都是属性,可以保护私有变量
class Xiaojiejie {
  constructor(private _age:number){}
  get age() {
    return this._age - 10
  }
  set age(age:number) {
     this._age = age + 3
  }
}
const missA = new Xiaojiejie(28)
console.log('a', missA.age)
const missB = new Xiaojiejie(28)
missB.age = 25
console.log('b', missB.age)
// static 不需要进行声明对象，就可以直接使用
class Dog {
  static run() {
    return 'dog is running'
  }
}
console.log(Dog.run())
```
  5. 类的只读属性readonly和抽象类abstract
```
// 只读
class Person {
  public readonly name :string
  constructor(name:string ){
      this.name = name
  }
}
const person = new Person('aaa')
person.name= 'bbb'
console.log(person.name) // 报错
// 抽象类
abstract class Dog {
  abstract skill()  //因为没有具体的方法，所以我们这里不写大括号
}
class AlaskanMalamute extends Dog {
  skill(){
    console.log('阿拉斯加雪橇犬会拉雪橇')
  }
}
class GoldenRetriever extends Dog {
  skill(){
    console.log('金毛会看孩子')
  }
}
```


# 相同点

都可以描述一个对象或者函数

interface

interface User {
  name: string
  age: number
}

interface SetUser {
  (name: string, age: number): void;
}

type

type User = {
  name: string
  age: number
};

type SetUser = (name: string, age: number): void;

+ 拓展（extends）与 交叉类型（Intersection Types）

interface 可以 extends， 但 type 是不允许 extends 和 implement 的，但是 type 可以通过交叉类型 实现 interface 的 extend 行为，并且两者并不是相互独立的，也就是说 interface 可以 extends type, type 也可以 与 interface 类型 交叉 。
虽然效果差不多，但是两者语法不同。

interface extends interface

interface Name {
  name: string;
}
interface User extends Name {
  age: number;
}

type 与 type 交叉

type Name = {
  name: string;
}
type User = Name & { age: number  };

interface extends type

type Name = {
  name: string;
}
interface User extends Name {
  age: number;
}

type 与 interface 交叉

interface Name {
  name: string;
}
type User = Name & {
  age: number;
}

 

# 不同点

+ type 可以而 interface 不行

type 可以声明基本类型别名，联合类型，元组等类型

```typescript
// 基本类型别名
type Name = string

// 联合类型
interface Dog {
    wong();
}
interface Cat {
    miao();
}

type Pet = Dog | Cat

// 具体定义数组每个位置的类型
type PetList = [Dog, Pet]

// 当你想获取一个变量的类型时，使用 typeof
let div = document.createElement('div');
type B = typeof div

// 其他
type StringOrNumber = string | number;
type Text = string | { text: string };
type NameLookup = Dictionary<string, Person>;
type Callback<T> = (data: T) => void;
type Pair<T> = [T, T];
type Coordinates = Pair<number>;
type Tree<T> = T | { left: Tree<T>, right: Tree<T> };
```

type 语句中还可以使用 typeof 获取实例的 类型进行赋值

其他骚操作（见上方代码块）

+ interface 可以而 type 不行

interface 能够声明合并

interface User {
  name: string
  age: number
}

interface User {
  sex: string
}

/*
User 接口为 {
  name: string
  age: number
  sex: string
}
*/

总结
一般来说，如果不清楚什么时候用interface/type，能用 interface 实现，就用 interface , 如果不能就用 type 
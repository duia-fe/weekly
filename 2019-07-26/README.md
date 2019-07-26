#JS 原型和原型链

---

##什么是原型?

> 万物皆对象，只要是对象就有原型，并且原型也是对象,因此只要定义了一个对象, 那么就可以找到他的原型.
> 一般会有两个概念：构造函数和原型对象

###普通对象与函数对象

```js
function A() {}

let obj1 = {};
let obj2 = new Object();
let obj3 = new A();
let obj4 = new Image();
let obj5 = new Date();
let obj6 = function() {};
let obj7 = () => {};
let obj8 = new Function();

console.log('A:', typeof A);
console.log('obj1:', typeof obj1);
console.log('obj2:', typeof obj2);
console.log('obj3:', typeof obj3);
console.log('obj4:', typeof obj4);
console.log('obj5:', typeof obj5);
console.log('obj6:', typeof obj6);
console.log('obj7:', typeof obj7);
console.log('obj8:', typeof obj8);
```

凡是通过 new Function() 创建的对象都是函数对象，其他的都是普通对象，构造函数 A 和 obj6、obj7 底层也是通过 new Function()创建的，只是写法不一样。
**问题一：** 为什么通过 new A() 会是 object 呢？

###构造函数

```js
//构造函数
function Person(name, age) {
    this.name = name;
    this.age = age;
    this.sayName = function() {
        console.log(this.name);
        console.log(this.age);
    };
}
//实例
let person1 = new Person('张三', 18);
let person2 = new Person('李四', 23);
```

上面的例子中 person1 和 person2 都是 Person 的实例。这两个实例都有一个 constructor （构造函数）属性，该属性（是一个指针）指向 Person。 即：

```js
console.log(person1.constructor == Person); //true
console.log(person2.constructor == Person); //true
```

**记点：**
1、person1 和 person2 都是 构造函数 Person 的实例
2、实例的构造函数属性（constructor）指向构造函数。

###原型对象

```js
function Person() {}
Person.prototype.name = '张三';
Person.prototype.sayName = function() {
    console.log(this.name);
};

let person1 = new Person();
person1.sayName(); // '张三'

let person2 = new Person();
person2.sayName(); // '张三'

console.log(person1.sayName == person2.sayName); //true

let obj = new Object();
console.log(obj.prototype); //undefined
console.log(person1.prototype); //undefined
```

每个**函数对象**都有一个 prototype 属性,这个属性指向函数的原型对象
每个对象都有 **_proto_** 属性，但只有函数对象才有 prototype 属性

####那什么是原型对象呢？

```js
Person.prototype = {
    name: '张三',
    age: 28,
    sayName: function() {
        console.log(this.name); // 张三
    }
};
```

原型对象，顾名思义，它就是一个普通对象，原型对象就是 Person.prototype**问题一**

```js
Person.prototype.constructor == Person;
person1.constructor == Person;
```

> 在默认情况下，所有的原型对象都会自动获得一个 constructor（构造函数）属性，这个属性（是一个指针）指向 prototype 属性所在的函数（Person）

**结论：**原型对象（Person.prototype）是 构造函数（Person）的一个实例。

```js
console.log(typeof Function.prototype); // Function
console.log(typeof Function.prototype.prototype); //undefined
```

所以 Function.prototype 是函数对象（列外，不是普通函数）

####原型对象是用来做什么的呢？

```js
let Person = function(name) {
    this.name = name; // this 指的是谁？
};
Person.prototype.getName = function() {
    return this.name; // this 指的是谁？
};
let person1 = new person('张三');
person1.getName(); //张三
```

so....person1 继承了 Person 的属性，具体怎么实现的就要抛砖引玉出**原型链**

**问题二：null 为什么没有 _proto_？**
null 不是一个空引用, 而是一个原始值

**问题三：null 是一个独立的数据类型，为什么 typeof(null)的值是"object"？**
typeof null 结果是 object, 这是个历史遗留 bug

##原型链
1、person1._proto_ 是什么？
**答案：**Person.prototype
2、Person._proto_ 是什么？
**答案：**Function.prototype
3、Person.prototype._proto_ 是什么？
**答案：**Object.prototype
4、Object._proto_ 是什么？
**答案：**Function.prototype
5、Object.prototype._proto_ 是什么？
**答案：**null

####JavaScript 中有内置(build-in)构造器/对象共计 13 个
1.Function
2.Object
3.String
4.Array
5.Number
6.Boolean
7.Date
8.RegExp
9.Error

10.Global
11.Arguments

12.Math
13.JSON

```js
Math.__proto__ === Object.prototype; // true
Math.construrctor == Object; // true

JSON.__proto__ === Object.prototype; // true
JSON.construrctor == Object; //true
```

所有的构造器都来自于 Function.prototype，甚至包括根构造器 Object 及 Function 自身。所有构造器都继承了·Function.prototype·的属性及方法。如 length、call、apply、bind 等等

###Array 属性和方法继承

```js
let ary = [];
console.log(Object.getOwnPropertyNames(ary)); // ["length"]
```

上面代码明明只有 length 属性 为什么 Array 能用那么多方法和属性呢？
**因为 Array.prototype 虽然没这些方法，但是它有原型对象（proto）**

```js
ary.__proto__ === Array.prototype;
Array.prototype.__proto__ == Object.prototype;
```

ary 的 proto 指向 Array.prototype

> 所有函数对象的 proto 都指向 Function.prototype，它是一个空函数（Empty function）
> 所有对象的 _proto_ 都指向其构造器的 prototype

###疑点解惑

```js
Object._proto_ === Function.prototype; // true
```

Object 是函数对象，是通过 new Function()创建的，所以 Object.*proto*指向 Function.prototype。

```js
Function.__proto__ === Function.prototype; // true
```

Function 也是对象函数，也是通过 new Function()创建，所以 Function.**proto**指向 Function.prototype。

### 总结：

> 原型和原型链是 JS 实现继承的一种模型。
> 原型链的形成是真正是靠**proto** 而非 prototype



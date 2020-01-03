### 抛出一个问题

请问这样一段代码怎么使[...obj]不报错，打印[1, 2, 3]

```javascript
let obj = { x: 1, y: 2, z: 3 };
console.log([...obj]); // TypeError
```

### 迭代器（Iterator），也叫遍历器

JavaScript 原有表示数据结构的“集合”只有两个数组（Array）和对象（Object）,但是 ES6 又新增了 Set 和 Map 集合。为了让用户能组合使用这样四种不同的集合数据结构，就需要一种统一的接口机制，也就是迭代器。它是一种接口，为各种不同的数据结构提供统一的访问机制。任何数据结构只要部署 Iterator 接口，就可以完成遍历操作（即依次处理该数据结构的所有成员）。

**可迭代协议**
必须实现 @@iterator 方法也就是有名为 Symbol.iterator 的属性

**迭代器协议**
必须有一个 next()方法，调用返回一个包含两个属性的对象，分别是 value 和 done，当 done 的值为 true 的时候，调用 next()就没有用了，也就是遍历结束。

很少有只实现迭代器协议而不实现可迭代协议。

```javascript
var myIterator = {
  next: function() {
    // ...
  },
  [Symbol.iterator]: function() {
    return this;
  }
};
```

**迭代器作用**

- 为各种数据结构，提供一个统一的、简便的访问接口；
- 使得数据结构的成员能够按某种次序排列；
- ES6 创造了一种新的遍历命令 for...of 循环，Iterator 接口主要供 for...of 消费。

使用迭代协议的例子(Array，Map，Set，String，TypedArray，arguments 对象)

```javascript
let str = 'Hello world';
console.log(typeof str[Symbol.iterator]);
let b = str[Symbol.iterator]();
```

通过 @@iterator 方法重新定义迭代行为

```javascript
let str = new String('Hello world'); // need to construct a String object explicitly to avoid auto-boxing

str[Symbol.iterator] = function() {
  return {
    // this is the iterator object, returning a single element, the string "bye"
    next: function() {
      if (this._first) {
        this._first = false;
        return { value: 'bye', done: false };
      } else {
        return { value: undefined, done: true };
      }
    },
    _first: true
  };
};
```

### 上面问题的解决办法

```javascript
let obj = { x: 1, y: 2, z: 3 };
obj[Symbol.iterator] = function() {
  // iterator 是一个具有 next 方法的对象，
  // 它的返回至少有一个对象
  // 两个属性：value＆done。

  // 返回一个 iterator 对象
  return {
    next: function() {
      if (this._countDown === 3) {
        const lastValue = this._countDown;
        return { value: this._countDown, done: true };
      }
      this._countDown = this._countDown + 1;
      return { value: this._countDown, done: false };
    },
    _countDown: 0
  };
};
console.log([...obj]); // 打印 [1, 2, 3]
```

或者使用生成器（Generator）的写法

```javascript
let obj = { x: 1, y: 2, z: 3 };
obj[Symbol.iterator] = function*() {
  yield this.x;
  yield this.y;
  yield this.z;
};
console.log([...obj]); // 打印 [1, 2, 3]
```

或

```javascript
let obj = {
  x: 1,
  y: 2,
  z: 3,
  *[Symbol.iterator]() {
    yield this.x;
    yield this.y;
    yield this.z;
  }
};
console.log([...obj]); // 打印 [1, 2, 3]
```

### 使用迭代器的场景

- 1.解构赋值
  对数组和 Set 结构进行解构赋值时，会默认调用 Symbol.iterator 方法。
- 2.扩展运算符
  扩展运算符（...）也会调用默认的 Iterator 接口。
- 3.yield*
  yield*后面跟的是一个可遍历的结构，它会调用该结构的遍历器接口。
- 4.其他场合
  for...of
  Array.from()
  Map(), Set(), WeakMap(), WeakSet()（比如 new Map([['a',1],['b',2]])）
  Promise.all()
  Promise.race()

### 疑问：为什么对象（Object）没有默认部署 Iterator 接口？

### for...of 循环

for...of 语句在可迭代对象（包括 Array，Map，Set，String，TypedArray，arguments 对象等等）上创建一个迭代循环，调用自定义迭代钩子，并为每个不同属性的值执行语句，for...of 循环内部调用的是数据结构的 Symbol.iterator 方法。

**语法**

```javascript
/*
variable: 在每次迭代中，将不同属性的值分配给变量。
iterable: 被迭代枚举其属性的对象。
*/
for (variable of iterable) {
  //statements
}
```

**例子：**

```javascript
const a = ['x', 'y', 'z'];

for (const e of a) {
  console.log(e);
}
```

**for...of 与 for...in 的区别**

无论是 for...in 还是 for...of 语句都是迭代一些东西。它们之间的主要区别在于它们的迭代方式。

for...in 语句以任意顺序迭代对象的可枚举属性。

for...of 语句遍历可迭代对象定义要迭代的数据。

```javascript
Object.prototype.objCustom = function() {};
Array.prototype.arrCustom = function() {};

let iterable = [3, 5, 7];
iterable.foo = 'hello';

for (let i in iterable) {
  console.log(i); // logs 0, 1, 2, "foo", "arrCustom", "objCustom"
}

for (let i in iterable) {
  if (iterable.hasOwnProperty(i)) {
    console.log(i); // logs 0, 1, 2, "foo"
  }
}

for (let i of iterable) {
  console.log(i); // logs 3, 5, 7
}
```

---

分享：`虚竹`

---

- 扩展：[Promise 实现](./Promise.md)

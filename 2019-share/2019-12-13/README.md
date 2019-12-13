# ECMAScript 6 前瞻

复习：ECMAScript 是 JavaScript 的标准。
也就是说，ECMAScript 包含 javaScript。尽管 ECMAScript 是为了将 javaScript 标准化所发布的。搞不好以后会有新的语言会遵循 ECMAScript 的标准。

## ECMAScript 的历史

JavaScript 是大家所了解的语言名称，但是这个语言名称是商标（ Oracle 公司注册的商标）。因此，JavaScript 的正式名称是 ECMAScript 。1996 年 11 月，JavaScript 的创造者网景公司将 JS 提交给国际化标准组织 ECMA（European computer manufactures association，欧洲计算机制造联合会），希望这种语言能够成为国际标准，随后 ECMA 发布了规定浏览器脚本语言的标准，即 ECMAScript。这也有利于这门语言的开放和中立。

## ES6 是 ECMAScript 标准十余年来变动最大的一个版本，为其添加了许多新的语法特性。

-   1997 年 ECMAScript 1.0 诞生。

-   1998 年 6 月 ECMAScript 2.0 诞生，包含一些小的更改，用于同步独立的 ISO 国际标准。

-   1999 年 12 月 ECMAScript 3.0 诞生，它是一个巨大的成功，在业界得到了广泛的支持，它奠定了 JS 的基本语法，被其后版本完全继承。直到今天，我们一开始学习 JS ，其实就是在学 3.0 版的语法。

-   2000 年的 ECMAScript 4.0 是当下 ES6 的前身，但由于这个版本太过激烈，对 ES 3 做了彻底升级，所以暂时被"和谐"了。

    > ES4 饱受争议，当标准委员会最终停止开发 ES4 时，其成员同意发布一个相对谦和的 ES5 版本，随后继续制定一些更具实质性的新特性。这一明确的协商协议最终命名为“Harmony”，因此，ES5 规范中包含这样两句话：
    >
    > > ECMAScript 是一门充满活力的语言，并在不断进化中。
    > > 未来版本的规范中将持续进行重要的技术改进。

-   2009 年 12 月，ECMAScript 5.0 版正式发布。ECMA 专家组预计 ECMAScript 的第五个版本会在 2013 年中期到 2018 年作为主流的开发标准。2011 年 6 月，ES 5.1 版发布，并且成为 ISO 国际标准。

    > ES5 引入了 Object.create() 、 Object.defineProperty() 、 getters 和 setters 、严格模式以及 JSON 对象。我已经使用过所有这些新特性，并且我非常喜欢 ES5 做出的改进。但事实上，这些改进并没有深入影响我编写 JS 代码的方式，对我来说最大的革新大概就是新的数组方法：.map() 、. filter() 这些。

-   2013 年，ES6 草案冻结，不再添加新的功能，新的功能将被放到 ES7 中；2015 年 6 月， ES6 正式通过，成为国际标准。
    > ES6 经过持续几年的磨砺，它已成为 JS 有史以来最实质的升级，新的语言和库特性就像无主之宝，等待有识之士的发掘。新的语言特性涵盖范围甚广，小到受欢迎的语法糖，例如箭头函数（arrow functions）和简单的字符串插值（string interpolation），大到烧脑的新概念，例如代理（proxies）和生成器（generators）。

# ES6 let 与 const

> let 声明的变量只在 let 命令所在的代码块内有效。
> const 声明一个只读的常量，一旦声明，常量的值就不能改变。

let 和 const 这两个属性在坐的各位应该都怎么使用。我就不多做介绍了。
es6 在有 var 的声明属性的情况下新增 let 和 const 属性是为什么呢？
var 不香么？是的。var 已经不再满足 web 程序猿日常使用了。代码逻辑日益复杂。总会遇到一些问题：

-   #### var 不能用于定义常量
    ```js
    //var的使用
    var a = 'a';
    a = 'b';
    console.log(a); //b
    //es6的const使用。
    const a = 'a';
    a = 'b'; //error
    ```
-   #### var 可以重复声明变量
    ```js
    //var的使用
    var a = 'a';
    var a = 'b';
    console.log(a); //b
    //let的使用；
    let a = 'a';
    let a = 'b'; //error
    ```
-   #### var 存在变量提升

    ```js
    //var的使用
    console.log(a); // undefined
    var a = 'a';
    //以上代码等同于
    var a;
    console.log(a);
    a = 'a';
    //let 的使用
    console.log(a); //error
    let a = 'a';
    ```

-   #### var 不支持块级作用域

    ```js
    //var的使用
    if (true) {
        var a = 'a';
    }
    console.log(a); //a
    //let的使用
    if (true) {
        let a = 'a';
    }
    console.log(a); //error
    ```

# ES6 解构赋值

解构赋值是对赋值运算符的扩展。
他是一种针对数组或者对象进行模式匹配，然后对其中的变量进行赋值。
在代码书写上简洁且易读，语义更加清晰明了；也方便了复杂对象中数据字段获取。

### 数组解构：

```js
const nameArr = ['撩课', '小撩', '小煤球'];
//  普通写法
let name1 = nameArr[0];
let name2 = nameArr[1];
let name3 = nameArr[2];
//  解构写法
let [name1, name2, name3] = nameArr;
console.log(name1, name2, name3);

//  写法4：省略解构
let [, , sex] = nameArr;
console.log(c); //小煤球
```

### 对象解构：

```js
const obj = { name: '小煤球', age: 1, sex: '公' };
//  写法1
let { name, age, sex } = obj;
console.log(name, age, sex); // 结果: 小煤球 1 公

//  写法2： 解构重命名
let { name: name1, age: age1, sex: sex1 } = obj;
console.log(name1, age1, sex1); // 结果: 小煤球 1 公

//  写法3： 可以设置默认值
let { name, age, weight = '65' } = obj;
console.log(weight); // 65
```

### 实际应用

```js
const obj = {
    a: 'a',
    b: ['hello', { c: 'c' }]
};
//普通写法
let a = obj.a;
let b = obj.b;
let c = b[1].c;
let d = b[0];
//解构写法
let {
    a,
    b,
    b: [d, { c }]
} = obj;

console.log(a, b, c, d);

//普通写法
function name(params) {
    let a = params.a || 'aaaa';
    let b = params.b || [];
    console.log(a, b);
}
//解构写法
function name({ a = 'aaaa', b = [] }) {
    console.log(a, b);
}
name(obj);
```

### 函数解构

```js
function sum(...num) {
    var sumNum = 0;
    for (let i = 0; i < num.length; i++) {
        sumNum += parseInt(num[i]);
    }
    console.log(sumNum);
}
sum(1, 2, 3); //6
sum(1, 2, '3'); //6
```

### 字符串、数值、布尔值解构

```js
// String
let [a, b, c, ...rest] = 'test123';
console.log(a, b, c, rest); // t, e, s, [ 't', '1', '2', '3' ]
let { length: len } = 'hello'; // en // 5

// number
let { toString: s } = 123;
s === Number.prototype.toString; // true

// boolean
let { toString: s } = true;
s === Boolean.prototype.toString; // true

// Map
let [a, b] = new Map().set('f1', 'test1').set('f2', 'test2');
console.log(a, b); // [ 'f1', 'test1' ], [ 'f2', 'test2' ]

// Set
let [a, b, c] = new Set([1, 2, 2, 3]);
console.log(a, b); // 1, 2, 3
```

## 性能

当我们有解构赋值的形式来做函数参数时，执行的时候会增加很多中间变量，内存也会比之前高。但是业务代码还是更加关注可读性和可维护性。如果你写的是库代码，可以尝试这种优化，把参数展开后直接传递，到底能带来多少性能收益还得看最终的基准测试。

# 延展操作符

这个 … 操作符（也被叫做延展操作符 － spread operator）已经被 ES6 数组 支持。它允许传递数组或者类数组直接做为函数的参数而不用通过 apply。

上面再讲解构赋值的时候有使用固过 … 操作符。
延展操作符可以将数组展开。也可以将数据合并：

### 延展数组

```js
let arr1 = ['a', 'b', 'c'];
let arr2 = [1, 2, 3];
let result = [...arr1, ...arr2];
console.log(result);
console.log(...result);
//  [ "a", "b", "c", 1, 2, 3 ]
//  a b c 1 2 3
```

### 延展对象

注意: 如果对象中的属性一致, 会被覆盖

```js
let smallDog = { name: '小煤球', age: 1 };
let bigDog = { name: 'Python', sex: 2 };
let dog = { ...smallDog, ...bigDog };
console.log(dog);
// {name: "Python", age: 1, sex:2}
```

# ES6 Symbol

ES6 引入了一种新的原始数据类型 Symbol ，表示独一无二的值，最大的用法是用来定义对象的唯一属性名。
ES6 数据类型除了 Number 、 String 、 Boolean 、 Objec t、 null 和 undefined ，还新增了 Symbol 。

> Symbol 函数栈不能用 new 命令，因为 Symbol 是原始数据类型，不是对象。可以接受一个字符串作为参数，为新创建的 Symbol 提供描述，用来显示在控制台或者作为字符串的时候使用，便于区分。

```js
let sy = Symbol('KK');
console.log(sy); // Symbol(KK)
typeof sy; // "symbol"

// 相同参数 Symbol() 返回的值不相等
let sy1 = Symbol('kk');
sy === sy1; // false
```

### 使用场景

> 用作属性名

```js
let sy = Symbol('key1');

// 写法1
let syObject = {};
syObject[sy] = 'kk';
console.log(syObject); // {Symbol(key1): "kk"}
// 使用属性名调取属性
syObject[sy]; // "kk"
syObject.sy; // undefined

// 写法2
let syObject = {
    [sy]: 'kk'
};
console.log(syObject); // {Symbol(key1): "kk"}

// 写法3
let syObject = {};
Object.defineProperty(syObject, sy, { value: 'kk' });
console.log(syObject); // {Symbol(key1): "kk"}
```

#### 注意点

Symbol 值作为属性名时，该属性是公有属性不是私有属性，可以在类的外部访问。但是不会出现在 for...in 、 for...of 的循环中，也不会被 Object.keys() 、 Object.getOwnPropertyNames() 返回。如果要读取到一个对象的 Symbol 属性，可以通过 Object.getOwnPropertySymbols() 和 Reflect.ownKeys() 取到。

### 最后

Symbol 的使用可以很广泛，各位就自己挖掘吧。

分享：`徐旺`

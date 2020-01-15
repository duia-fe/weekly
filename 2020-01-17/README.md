# ES6 扩展

## 字符串的扩展

```javascript
includes(str,[n])：返回布尔值，表示是否找到了参数字符串。 第n个位置直到字符串结束
startsWith(str,[n])：返回布尔值，表示参数字符串是否在原字符串的头部。 第n个位置直到字符串结束
endsWith(str,[n])：返回布尔值，表示参数字符串是否在原字符串的尾部。 针对前n个字符
// str 参数字符串  n 开始搜索的位置 [0]
let s = 'Hello world!';
s.startsWith('Hello') // true
s.endsWith('!') // true
s.includes('o') // true

repeat() 返回一个新字符串，表示将原字符串重复n次。 参数存在小数点（向下取整）；不存在负数或者Infinity
'hello'.repeat(2) // "hellohello"
'na'.repeat(-0.9) // "" 参数是 0 到-1 之间的小数，则等同于 0
'na'.repeat(NaN) // ""  参数NaN等同于 0。
'na'.repeat('na') // "" 参数是字符串，则会先转换成数字。
'na'.repeat('3') // "nanana"

padStart(n,str)，padEnd(n,str)
// n是字符串补全生效的最大长度，str是用来补全的字符串(如果省略第二个参数，默认使用空格补全长度)。
'x'.padStart(5, 'ab') // 'ababx'
'x'.padEnd(5, 'ab') // 'xabab'
'abc'.padStart(10, '0123456789')// '0123456abc'
'x'.padStart(4) // '   x'
// 应用场景
'12'.padStart(10, '0') // "0000000012"
'12'.padStart(10, 'YYYY-MM-DD') // "YYYY-MM-12"
'09-12'.padStart(10, 'YYYY-MM-DD') // "YYYY-09-12"


trimStart() 消除字符串头部的空格 trimEnd() 消除尾部的空格
// trimLeft()是trimStart()的别名，trimRight()是trimEnd()的别名。
const s = '  abc  ';
s.trim() // "abc"
s.trimStart() // "abc  "
s.trimEnd() // "  abc"

matchAll() 返回一个正则表达式在当前字符串的所有匹配
String.prototype.matchAll() 它返回的是一个遍历器（Iterator），而不是数组
const string = 'test1test2test3';
// g 修饰符加不加都可以
const regex = /t(e)(st(\d?))/g;
for (const match of string.matchAll(regex)) {
  console.log(match);
}
// ["test1", "e", "st1", "1", index: 0, input: "test1test2test3"]
// ["test2", "e", "st2", "2", index: 5, input: "test1test2test3"]
// ["test3", "e", "st3", "3", index: 10, input: "test1test2test3"]
// 转数组
[...string.matchAll(regex)]  或者  Array.from(string.matchAll(regex))
```

## 正则的扩展

```javascript
// *** regexp构造函数
var regex = new RegExp('xyz', 'i'); //es5 不存在第二个参数
// 等价于
var regex = new RegExp(/xyz/i);
// 等价于
var regex = /xyz/i;

// *** 修饰符
// u 用来正确处理大于\uFFFF的 Unicode 字符
const r1 = /hello/;
const r2 = /hello/u;
r1.unicode; // false
r2.unicode; // true
// y  与g修饰符类似，也是全局匹配
// 不同之处在于，g修饰符只要剩余位置中存在匹配就可，而y修饰符确保匹配必须从剩余的第一个位置开始
// 实际上，y修饰符号隐含了头部匹配的标志^
var s = 'aaa_aa_a';
var r1 = /a+/g;
var r2 = /a+/y;
r1.exec(s); // ["aaa"]
r2.exec(s); // ["aaa"]
r1.exec(s); // ["aa"]
r2.exec(s); // null

var r = /hello\d/y;
r.sticky / // true
    // ES5 的 source 属性
    // 返回正则表达式的正文
    abc /
    ig.source /
    // "abc"

    // ES6 的 flags 属性
    // 返回正则表达式的修饰符
    abc /
    ig.flags;
// 'gi'

// ***字符串的正则方法
string.match(searchvalue);
// 在字符串中查找 "ain":
var str = 'The rain in SPAIN stays mainly in the plain';
var n = str.match('ain'); //ain
// 找到一个便停止查找，若要全部找出，可配合使用正则表达式：
var n = str.match(/ain/gi); //全局查找，忽略大小写
//[ain,AIN,ain,ain]

string.replace(searchvalue, newvalue);
// 在字符串中查找并替换“Microsoft”：
var str = 'Visit Microsoft! Visit Microsoft!';
var n = str.replace('Microsoft', 'Runoob');
//n："Visit Runoob! Visit Microsoft!"
// 此时只替换了第一处的值，若想继续替换，可使用正则表达式
var n = str.replace(/Microsoft/gi, 'Runoob'); //全局替换，忽略大小写
//n: "Visit Runoob! Visit Runoob!"

string.search(reg);
// 可以搜索字符串中是否含有指定内容
// 如果搜索到指定内容，则会返回第一次出现的索引，如果没有搜索到，返回-1
// 它可以接收一个正则表达式作为参数，然后根据正则表达式去检索字符串
var str1 = 'hello abc hello aec sdf afc';
var str2 = 'hello hello aec sdf afc';
var result1 = str1.search(/a[bef]c/);
var result2 = str2.search(/a[bef]c/);
console.log(result1 + ' ' + result2); //6 12

string.split();
// 可以将一个字符串拆分为一个数组
// 方法中可以传递一个正则表达式作为参数，这样方法将会根据正则表达式去拆分字符串
var str = '1a2B3d4g5c6';
var result = str.split(/[A-z]/);
console.log(result); //["1", "2", "3", "4", "5", "6"]
```

## 数值的扩展

```javascript
Number.isFinite()和Number.isNaN()
Number.isFinite()用来检查一个数值是否为有限的（finite） 注意，如果参数类型不是数值，Number.isFinite一律返回false

parseInt()和parseFloat()
// ES5的写法
parseInt('12.34') // 12
parseFloat('123.45#') // 123.45
// ES6的写法
Number.parseInt('12.34') // 12
Number.parseFloat('123.45#') // 123.45
// <!-- 目的，是逐步减少全局性方法，使得语言逐步模块化。 -->

Number.isInteger()用来判断一个数值是否为整数。 如果参数不是数值，Number.isInteger返回false。

Number.EPSILON 可以用来设置“能够接受的误差范围”。
function fn (left, right) {
  return Math.abs(left - right) < Number.EPSILON * Math.pow(2, 2);
}
0.1 + 0.2 === 0.3 // false
fn(0.1 + 0.2, 0.3) // true

1.1 + 1.3 === 2.4 // false
fn(1.1 + 1.3, 2.4) // true

Number.MAX_SAFE_INTEGER  Number.MIN_SAFE_INTEGER 用来表示这个范围的上下限。
Number.MAX_SAFE_INTEGER === Math.pow(2, 53) - 1
// true
Number.MAX_SAFE_INTEGER === 9007199254740991
// true
Number.MIN_SAFE_INTEGER === -Number.MAX_SAFE_INTEGER
// true
Number.MIN_SAFE_INTEGER === -9007199254740991
// true


Number.isSafeInteger()则是用来判断一个整数是否落在这个范围之内

Number.isSafeInteger = function (n) {
  return (typeof n === 'number' &&
    Math.round(n) === n &&
    Number.MIN_SAFE_INTEGER <= n &&
    n <= Number.MAX_SAFE_INTEGER);
}

```

## Math 对象的扩展

```javascript
Math.trunc 方法用于去除一个数的小数部分，返回整数部分
Math.trunc =function(x) {
  return x < 0 ? Math.ceil(x) : Math.floor(x);
};
Math.trunc(4.1) // 4
Math.trunc(-0.1234) // -0
// 对于非数值，Math.trunc内部使用Number方法将其先转为数值。
Math.trunc('123.456') // 123
Math.trunc(true) //1
Math.trunc(false) // 0
Math.trunc(null) // 0
// 对于空值和无法截取整数的值，返回NaN。
Math.trunc(NaN);      // NaN
Math.trunc('foo');    // NaN
Math.trunc();         // NaN
Math.trunc(undefined) // NaN


Math.sign 用来判断一个数到底是正数、负数、还是零。对于非数值，会先将其转换为数值。
Math.sign =  function(x) {
  x = +x; // convert to a number
  if (x === 0 || isNaN(x)) {
    return x;
  }
  return x > 0 ? 1 : -1;
};
// 返回五种值:
// 参数为正数，返回+1；
// 参数为负数，返回-1；
// 参数为 0，返回0；
// 参数为-0，返回-0;
// 其他值，返回NaN。
Math.sign(-5) // -1
Math.sign(5) // +1
Math.sign(0) // +0
Math.sign(-0) // -0
Math.sign(NaN) // NaN
// 如果参数是非数值，会自动转为数值。对于那些无法转为数值的值，会返回NaN。
Math.sign('')  // 0
Math.sign(true)  // +1
Math.sign(false)  // 0
Math.sign(null)  // 0
Math.sign('9')  // +1
Math.sign('foo')  // NaN
Math.sign()  // NaN
Math.sign(undefined)  // NaN


Math.cbrt方法用于计算一个数的立方根。
Math.cbrt = function(x) {
  var y = Math.pow(Math.abs(x), 1/3);
  return x < 0 ? -y : y;
};
Math.cbrt(-1) // -1
Math.cbrt(0)  // 0
Math.cbrt(1)  // 1
Math.cbrt(2)  // 1.2599210498948734
// 对于非数值，Math.cbrt方法内部也是先使用Number方法将其转为数值。
Math.cbrt('8') // 2
Math.cbrt('hello') // NaN


Math.hypot方法返回所有参数的平方和的平方根。
Math.hypot(3, 4);        // 5
Math.hypot(3, 4, 5);     // 7.0710678118654755
Math.hypot();            // 0
Math.hypot(NaN);         // NaN
Math.hypot(3, 4, 'foo'); // NaN
Math.hypot(3, 4, '5');   // 7.0710678118654755
Math.hypot(-3);          // 3
// 如果参数不是数值，Math.hypot方法会将其转为数值。只要有一个参数无法转为数值，就会返回 NaN。

指数运算符
// **
2 ** 2 // 4
2 ** 3 // 8
// 相当于 2 ** (3 ** 2)
2 ** 3 ** 2// 512
//  **=
let a = 1.5;
a **= 2;
// 等同于 a = a * a;

let b = 4;
b **= 3;
// 等同于 b = b * b * b;
```

## 函数的扩展

```javascript
// es6之前
function log(x, y) {
    //   y = y || 'World';
    if (typeof y === 'undefined') {
        y = 'World';
    }
    console.log(x, y);
}
log('Hello'); // Hello World
log('Hello', 'China'); // Hello China
log('Hello', ''); // Hello World

// es6
function log(x, y = 'World') {
    console.log(x, y);
}
log('Hello'); // Hello World
log('Hello', 'China'); // Hello China
log('Hello', ''); // Hello


// 指定了默认值以后，函数的length属性，将返回没有指定默认值的参数个数。也就是说，指定了默认值后，length属性将失真。
(function (a) {}).length // 1
(function (a = 5) {}).length // 0
(function (a, b, c = 5) {}).length // 2
(function(...args) {}).length // 0 函数的length属性，不包括 rest 参数。
// 如果设置了默认值的参数不是尾参数，那么length属性也不再计入后面的参数了。
(function (a = 0, b, c) {}).length // 0
(function (a, b = 1, c) {}).length // 1

// 作用域
var x = 1;
function f(x, y = x) {
  console.log(y);
}
f(2)

let x = 1;

function f(y = x) {
  let x = 2;
  console.log(y);
}
f()

// 应用
// 利用参数默认值，可以指定某一个参数不得省略，如果省略就抛出一个错误。
function throwIfMissing() {
  throw new Error('Missing parameter');
}

function foo(mustBeProvided = throwIfMissing()) {
  return mustBeProvided;
}

foo()
// Error: Missing parameter

// rest参数 用于获取函数的多余参数，
function add(...values) {
  let sum = 0;

  for (var val of values) {
    sum += val;
  }

  return sum;
}

add(2, 5, 3) // 10

// arguments对象不是数组，而是一个类似数组的对象。所以为了使用数组的方法，必须使用Array.prototype.slice.call先将其转为数组。
// rest 参数就不存在这个问题，它就是一个真正的数组，数组特有的方法都可以使用。下面是一个利用 rest 参数改写数组push方法的例子。
// arguments变量的写法
function sortNumbers() {
  return Array.prototype.slice.call(arguments).sort();
}

// rest参数的写法
const sortNumbers = (...numbers) => numbers.sort();
// 注意，rest 参数之后不能再有其他参数（即只能是最后一个参数），否则会报错。
// 报错
function f(a, ...b, c) {
  // ...
}

// 箭头函数
（1）函数体内的this对象，就是定义时所在的对象，而不是使用时所在的对象。
（2）不可以当作构造函数，也就是说，不可以使用new命令，否则会抛出一个错误。
（3）不可以使用arguments对象，该对象在函数体内不存在。如果要用，可以用 rest 参数代替。
（4）不可以使用yield命令，因此箭头函数不能用作 Generator 函数

function Timer() {
  this.s1 = 0;
  this.s2 = 0;
  // 箭头函数
  setInterval(() => this.s1++, 1000);
  // 普通函数
  setInterval(function () {
    this.s2++;
  }, 1000);
}
var timer = new Timer();
setTimeout(() => console.log('s1: ', timer.s1), 3100);
setTimeout(() => console.log('s2: ', timer.s2), 3100);

// 请问下面的代码之中有几个this？
function foo() {
  return () => {
    return () => {
      return () => {
        console.log('id:', this.id);
      };
    };
  };
}
var f = foo.call({id: 1});
var t1 = f.call({id: 2})()();
var t2 = f().call({id: 3})();
var t3 = f()().call({id: 4});
// 尾调用优化   指某个函数的最后一步是调用另一个函数。
// 即只保留内层函数的调用帧。如果所有函数都是尾调用，那么完全可以做到每次执行时，调用帧只有一项，这将大大节省内存。这就是“尾调用优化”的意义。
// 注意，目前只有 Safari 浏览器支持尾调用优化，Chrome 和 Firefox 都不支持。
function f(x){
  return g(x);
}


// 情况一
function f(x){
  let y = g(x);
  return y;
}

// 情况二
function f(x){
  return g(x) + 1;
}

// 情况三
function f(x){
  g(x);
}

function f(x) {
  if (x > 0) {
    return m(x)
  }
  return n(x);
}
// 注意，只有不再用到外层函数的内部变量，内层函数的调用帧才会取代外层函数的调用帧，否则就无法进行“尾调用优化”。
function addOne(a){
  var one = 1;
  function inner(b){
    return b + one;
  }
  return inner(a);
}

// 尾递归  如果尾调用自身，就称为尾递归。
function factorial(n, total) {
  if (n === 1) return total;
  return factorial(n - 1, n * total);
}

factorial(5, 1) // 120


// 正常的递归函数
function sum(x, y) {
  if (y > 0) {
    return sum(x + 1, y - 1);
  } else {
    return x;
  }
}
sum(1, 100000)
// Uncaught RangeError: Maximum call stack size exceeded(…)

// 蹦床函数（trampoline）可以将递归执行转为循环执行。
function trampoline(f) {
  while (f && f instanceof Function) {
    f = f();
  }
  return f;
}
function sum(x, y) {
  if (y > 0) {
    return sum.bind(null, x + 1, y - 1);
  } else {
    return x;
  }
}
trampoline(sum(1, 100000))
// 100001

// 真正的递归优化
function tco(f) {
  var value;
  var active = false;
  var accumulated = [];

  return function accumulator() {
    accumulated.push(arguments);
    if (!active) {
      active = true;
      while (accumulated.length) {
        value = f.apply(this, accumulated.shift());
      }
      active = false;
      return value;
    }
  };
}

var sum = tco(function(x, y) {
  if (y > 0) {
    return sum(x + 1, y - 1)
  }
  else {
    return x
  }
});

sum(1, 100000)
// 100001

// 函数参数的尾逗号  函数参数与数组和对象的尾逗号规则，保持一致了。
function clownsEverywhere(
  param1,
  param2,
) { /* ... */ }

clownsEverywhere(
  'foo',
  'bar',
);


//  Function.prototype.toString()
function /* foo comment */ foo () {}

foo.toString()
// "function /* foo comment */ foo () {}"

```

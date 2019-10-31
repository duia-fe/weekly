# js 设计模式之适配器模式

## 适配器模式概述

> 将一个接口转换成客户端需要的接口而不需要去修改客户端代码，使得不兼容的代码可以一起工作。

## 组成部分

1、客户端：调用接口的类

2、适配器：用来连接客户端接口和提供服务的接口的类

3、适配者：提供服务，但是却与客户端接口需求不兼容服务类。

## 使用场景

1、库的适配

2、参数的适配

3、数据的适配

## Example one

```js
// 第三方接口1
function Person1() {
    this.name = '张三';
    this.getName = function() {
        return this.name;
    };
}
// 第三方接口2
function Person2() {
    this.name = '李四';
    this.getName = function() {
        return this.name;
    };
}
// 我方调用
function callName(person) {
    return person.getName();
}

console.log(callName(new Person1())); //张三
console.log(callName(new Person2())); //李四
```

上面代码 `Person1` 和 `Person2` 是两个普通的对象，关键在于他们都有一个 `getName` 的方法，所以我们能很好的封装一个方法 `callNmae` 去调用他们，但第三方的接口方法并不在我们自己的控制范围之内，假如 `Person2` 的获取名字的方法不叫 `getName` 而叫 `getCNname` 呢？

```js
function Person2() {
    this.name = '李四';
    this.getCNname = function() {
        return this.name;
    };
}
```

`Person2` 是第三方的接口 我们没有权限去改动他，所以我们可以通过增加 `Person2Apadter` 适配器来解决此问题

```js
function Person2Apadter() {
    this.getName = function() {
        return new Person2().getCNname();
    };
}

console.log(callName(new Person1())); //张三
console.log(callName(new Person2Apadter())); //李四
```

## Example two

axios 适配器的使用

```js
axios
    .get('http://000.00:8081/api/test')
    .then(function(response) {
        console.log(response.data.data);
    })
    .catch(function(error) {
        console.log(error);
    });
```

当我们取我们想用的参数时，我们就要`response.data.data`,连续两个 `data`, 也有些接口设计部是很好可能连续出现三个`data`,所以这对我们取用数据是造成麻烦，容易混淆，怎么办呢？

```js
// 封装适配器（对axios进行封装）
function request() {
    return new Promise(function(reolve, reject) {
        axios
            .get('http://000.00:8081/api/test')
            .then(function(response) {
                reolve(response.data);
            })
            .catch(function(error) {
                console.log(error);
            });
    });
}

request().then(function(response) {
    console.log(response.data);
});
```

所以我们经常在项目中使用`axios` 时都会对`axios`进行一次封装，因为不只这一个原因，还有可能参数的不一样，请求地址的不一样都要是用不同的适配器

## 总结

> 适配器模式在 JS 中的使用场景很多，在参数的适配上，有许多库和框架都使用适配器模式；数据的适配在解决前后端数据依赖上十分重要。但是适配器模式本质上是一个亡羊补牢的模式，它解决的是现存的两个接口之间不兼容的问题，你不应该在软件的初期开发阶段就使用该模式；如果在设计之初我们就能够统筹的规划好接口的一致性，那么适配器就应该尽量减少使用。


分享：`邓伟`
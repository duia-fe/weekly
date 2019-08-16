# 设计模式（单例模式、工厂模式）

### 一、单例模式

在以前的程序员眼里（比如 java 开发），单例就是保证一个类只有一个实例，调用的时候一般是先判断实例存不存在，如果存在直接返回，如果不存在就创建了再返回（这种方式也叫懒汉式单例模式），这样一个类就只有一个实例对象。汤姆大叔说在 JavaScript 里，单例作为一个命名空间提供者，从全局命名空间里提供一个唯一的访问点来访问该对象。

简单的说就是保证一个类仅有一个实例，并全局都能访问这个实例以及实例的属性和方法。

##### JavaScript 中最简单的方式就是对象字面量

如：

```javascript
const SingletonTester = {
  name: '这是一个全局的SingletonTester',
  getName() {
    console.log(this.name); //这是一个全局的SingletonTester
  }
};
```

单例模式又有很多种实现方式，如懒汉式，饿汉式

##### 懒汉式单例（惰性）就是当访问到的时候才会创建实例，没有访问就不会创建，如果访问到有实例了就不再创建了

如：

```javascript
const SingletonTester = (function() {
  //参数：传递给单例的一个参数集合
  function Singleton(args) {
    //设置args变量为接收的参数或者为空（如果没有提供的话）
    args = args || {};
    //设置name参数
    this.name = 'SingletonTester';
    //设置pointX的值
    this.pointX = args.pointX || 6; //从接收的参数里获取，或者设置为默认值
    //设置pointY的值
    this.pointY = args.pointY || 10;
  }

  //实例容器
  let instance;

  return {
    name: 'SingletonTester',

    //获取实例的方法
    //返回Singleton的实例
    getInstance: function(args) {
      if (instance === undefined) {
        instance = new Singleton(args);
      }
      return instance;
    }
  };
})();

let singletonTest = SingletonTester.getInstance({ pointX: 5 });
let singletonTest2 = SingletonTester.getInstance({ pointX: 88 });
console.log(singletonTest === singletonTest2); // true
console.log(singletonTest.pointX); // 5
singletonTest2.pointX = 777;
console.log(singletonTest.pointX); // 77
```

特点： 效率低，第一次加载需要实例化，反应稍慢。每次调用 getInstance 方法都会进行同步，消耗不必要的资源。

##### 饿汉式单例就是不管什么时候访问都已经在最开始的时候创建好实例了。比如在浏览器访问页面执行 JavaScript，在最初就创建好实例。

如：

```javascript
const SingletonTester = (function() {
  //参数：传递给单例的一个参数集合
  function Singleton(args) {
    if (typeof Singleton.instance === 'object') {
      return Singleton.instance;
    }
    //设置args变量为接收的参数或者为空（如果没有提供的话）
    args = args || {};
    //设置name参数
    this.name = 'SingletonTester';
    //设置pointX的值
    this.pointX = args.pointX || 6; //从接收的参数里获取，或者设置为默认值
    //设置pointY的值
    this.pointY = args.pointY || 10;
    Singleton.instance = this;
  }

  let instance = new Singleton();
  return {
    name: 'SingletonTester',

    //返回Singleton的实例
    getInstance: function() {
      return instance;
    }
  };
})();

let singletonTest = SingletonTester.getInstance();
let singletonTest2 = SingletonTester.getInstance();
singletonTest2.pointX = 88;
console.log(singletonTest === singletonTest2); // true
console.log(singletonTest.pointX); // 88
```

特点：不需要的时候就加载了，造成资源浪费。

##### 其他方式

```javascript
function SingletonTester() {
  // 缓存的实例
  var instance = this;

  // 其它内容
  this.name = 'SingletonTester';

  // 重写构造函数
  SingletonTester = function() {
    return instance;
  };
}

let a = new SingletonTester();
let b = new SingletonTester();

a.name = 'SingletonTester2222';

console.log(a === b); //true
console.log(b.name); //SingletonTester2222
```

### 二、工厂模式

描述：定义一个创建对象的接口，但让实现这个接口的类来决定实例化哪个类。工厂方法让类的实例化推迟到子类中进行。

之前宇哥写了一个redux的，创建的reducer就是类似工厂模式的

比如我们把一个餐馆当成一个工厂，我们点的菜就是工厂里面生产出来的，我们要消费的东西。

##### 搞一个 ES6 语法的简单工厂：

```javascript
// 有一道麻婆豆腐
class Tofu {
  constructor() {
    this.name = '麻婆豆腐';
  }
  taste() {
    console.log(`${this.name}是麻辣的豆腐`);
  }
}
// 有一道土豆丝
class PotatoSilk {
  constructor() {
    this.name = '青椒土豆丝';
  }
  taste() {
    console.log(`${this.name}是土豆的味道`);
  }
}

//厨师->炒菜的工厂

class Cook {
  constructor(name) {
    switch (name) {
      case 'tofu':
        return new Tofu();
      case 'potatoSilk':
        return new PotatoSilk();
    }
  }
}

const tofu = new Cook('tofu');
tofu.taste(); //麻婆豆腐是麻辣的豆腐
const potatoSilk = new Cook('potatoSilk');
potatoSilk.taste(); //青椒土豆丝是土豆的味道
```

##### 复杂一点的工厂模式

```javascript
// 还是有一道麻婆豆腐
class Tofu {
  constructor() {
    this.name = '麻婆豆腐';
  }
  taste() {
    console.log(`${this.name}尝起来是麻辣的豆腐`);
  }
}
// 还是有一道土豆丝
class PotatoSilk {
  constructor() {
    this.name = '青椒土豆丝';
  }
  taste() {
    console.log(`${this.name}尝起来是土豆的味道`);
  }
}
// 然后还是有一道回锅肉
class TwiceCookedPork {
  constructor() {
    this.name = '回锅肉';
  }
  taste() {
    console.log(`${this.name}尝起来是甜甜的，猪肉的味道，可能还是得了猪瘟的`);
  }
}
// 然后还是有一道泡脚鸡杂
class HickenGiblets {
  constructor() {
    this.name = '泡脚鸡杂';
  }
  taste() {
    console.log(`${this.name}尝起来是酸酸的味道，脆脆的鸡郡肝、鸡肠`);
  }
}

// 然后有会炒素菜的厨师
class VegetableCook {
  cook(name) {
    switch (name) {
      case 'tofu':
        return new Tofu();
      case 'potatoSilk':
        return new PotatoSilk();
    }
  }
}

// 然后有会炒荤菜的厨师
class MeatDishesCook {
  cook(name) {
    switch (name) {
      case 'twiceCookedPork':
        return new TwiceCookedPork();
      case 'hickenGiblets':
        return new HickenGiblets();
    }
  }
}

// 厨师培训学校 培养厨师的
class CookFactory {
  constructor(name) {
    switch (name) {
      case 'vegetable':
        return new VegetableCook();
      case 'meatDishes':
        return new MeatDishesCook();
    }
  }
}

let vegetableCook = new CookFactory('vegetable'); // 一个炒素菜的厨师
let meatDishesCook = new CookFactory('meatDishes'); // 一个炒荤菜的厨师

//荤菜的厨师先炒肉
let twiceCookedPork = meatDishesCook.cook('twiceCookedPork'); //荤菜厨师炒了一个回锅肉
let hickenGiblets = meatDishesCook.cook('hickenGiblets'); // 荤菜厨师又炒了一个泡脚鸡杂

//上了一个回锅肉，开始尝尝
twiceCookedPork.taste(); //回锅肉尝起来是甜甜的，猪肉的味道，可能还是得了猪瘟的
//又上了一个泡脚鸡杂，开始尝尝
hickenGiblets.taste(); //泡脚鸡杂尝起来是酸酸的味道，脆脆的鸡郡肝、鸡肠

//素菜厨师也接着炒
let tofu = vegetableCook.cook('tofu'); //素菜厨师炒了一个你们要的麻婆豆腐
let potatoSilk = vegetableCook.cook('potatoSilk'); // 素菜厨师又炒了一个土豆丝

//上了一个麻婆豆腐，开始尝尝
tofu.taste(); //麻婆豆腐尝起来是麻辣的豆腐
//又上了一个土豆丝，开始尝尝
potatoSilk.taste(); //青椒土豆丝尝起来是土豆的味道
```

什么样的情况下使用：

- 对象的构建十分复杂
- 需要依赖具体环境创建不同实例
- 处理大量具有相同属性的小对象

---

分享：`虚竹`

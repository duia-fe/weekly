# 设计模式——职责链模式

职责链模式的定义是：使多个对象都有机会处理请求，从而避免请求的发送者和接收者之间的耦合关系，将这些对象连成一条链，并沿着这条链传递该请求，直到有一个对象处理它为止。

例子：

```javascript
//处理订单页面多重判断
// orderType: 订单类型
// toPay: 是否支付定金
// stock: 库存
// 入门级写法：
var setOrder = function(orderType, toPay, stock) {
    if (orderType === 1) {
        if (toPay) {
            console.log('500元定金预购订单，得到100元优惠券！');
        } else {
            if (stock > 0) {
                console.log('普通购买！');
            } else {
                console.log('库存不足！');
            }
        }
    } else if (orderType === 2) {
        if (toPay) {
            console.log('200元定金预购订单，得到50元优惠券！');
        } else {
            if (stock > 0) {
                console.log('普通购买！');
            } else {
                console.log('库存不足！');
            }
        }
    } else {
        if (stock > 0) {
            console.log('普通购买！');
        } else {
            console.log('库存不足！');
        }
    }
};

setOrder(1, true, 10);
```

上面这段代码虽然很简单，我们也得到了意料中的运行结果，但是却有很明显的缺点:

-   setOrder 函数比较庞大，包含了多个条件判断，这些语句需要覆盖所有的逻辑分支

-   setOrder 函数缺乏弹性，如果要加入一种新预购等级,就要深入函数内部实现，违反了开放-封闭原则

> ###### 开放-封闭原则思想：当需要改变一个程序的功能或者给这个程序增加新功能的时候，可以使用增加代码的方式，但是不允许改动程序的源代码。

职责链模式重构第一步：
现在我们采用职责链模式重构这段代码，先把 500 元订单、200 元订单以及普通购买分成 3 个函数。

```javascript
var order500 = function(orderType, toPay, stock) {
    if (orderType === 1 && toPay) {
        console.log('500元定金预购,得到100优惠券');
    } else {
        order200(orderType, toPay, stock); //将请求传递给200元订单
    }
};
var order200 = function(orderType, toPay, stock) {
    if (orderType === 2 && toPay) {
        console.log('200元定金预购,得到50优惠券');
    } else {
        orderNormal(orderType, toPay, stock); //将请求传递给普通订单
    }
};
var orderNormal = function(orderType, toPay, stock) {
    if (stock > 0) {
        console.log('普通购买');
    } else {
        console.log('库存不足');
    }
};
order500(1, true, 500); //输出：500元定金预购,得到100优惠券
order500(1, false, 500); //输出：普通购买,无优惠券
order500(2, true, 500); //输出：200元定金预购,得到50优惠券
order500(0, false, 500); //输出：普通购买,无优惠券
order500(0, false, 0); //输出：手机库存不足
```

可以看到，执行结果和前面那个巨大的 order 函数完全一样，但是代码的结构已经清晰了很多，我们把一个大函数拆分了 3 个小函数，去掉了许多嵌套的条件分支语句。

虽然已经把大函数拆分成了互不影响的 3 个小函数，但可以看到，请求在链条传递中的顺序非常僵硬，传递请求的代码被耦合在了业务函数之中，这依然是违反开放-封闭原则的，如果有天我们要增加 300 元预订或者去掉 200 元预订，意味着就必须改动这些业务函数内部。就像一根环环相扣打了死结的链条，如果要增加、拆除或者移动一个节点，就必须得先砸烂这根链条。

再接着改进：

```javascript
var order500 = function(orderType, toPay, stock) {
    if (orderType === 1 && toPay) {
        console.log('500元定金预购,得到100优惠券');
    } else {
        return 'next'; //设定一个固定的值，把请求往下传递。
    }
};
var order200 = function(orderType, toPay, stock) {
    if (orderType === 2 && toPay) {
        console.log('200元定金预购,得到50优惠券');
    } else {
        return 'next'; //设定一个固定的值，把请求往下传递。
    }
};
var orderNormal = function(orderType, toPay, stock) {
    if (stock > 0) {
        console.log('普通购买');
    } else {
        console.log('库存不足');
    }
};
//接下来需要把函数包装进职责链节点，我们定义一个构造函数Chain，在newChain的时候传递的参数即为需要被包装的函数，同时它还拥有一个实例属性this.successor，表示在链中的下一个节点。
var Chain = function(fn) {
    this.fn = fn;
    this.successor = null;
};
Chain.prototype.setNextSuccessor = function(successor) {
    return (this.successor = successor);
};
Chain.prototype.passRequest = function() {
    var ret = this.fn.apply(this, arguments);
    if (ret === 'next') {
        return this.successor && this.successor.passRequest.apply(this.successor, arguments);
    }
    return ret;
};

//分别先把函数封装成职责链的节点
var chainOrder500 = new Chain(order500);
var chainOrder200 = new Chain(order200);
var chainOrderNormal = new Chain(orderNormal);
//然 后 指 定 节 点 在 职 责 链 中 的 顺 序：
chainOrder500.setNextSuccessor(chainOrder200);
chainOrder200.setNextSuccessor(chainOrderNormal);

//运行
chainOrder500.passRequest(1, true, 500); // 输 出： 500 元 定 金 预 购， 得 到 100 优 惠
chainOrder500.passRequest(2, true, 500); // 输 出： 200 元 定 金 预 购， 得 到 50 优 惠
chainOrder500.passRequest(3, true, 500); // 输 出： 普 通 购 买， 无 优 惠 券
chainOrder500.passRequest(1, false, 0); // 输 出： 手 机 库 存 不 足

// 假如这个时候，需要再加一个预购
var order300 = function(orderType, toPay, stock) {
    //.........不写了
};
var chainOrder300 = new Chain(order300);
chainOrder500.setNextSuccessor(chainOrder300);
chainOrder300.setNextSuccessor(chainOrder300);
```

对于程序员来说，我们总是喜欢去改动那些相对容易改动的地方，就像改动框架的配置文件远比改动框架的源代码简单得多。在这里完全不用理会原来的订单函数代码，我们要做的只是增加一个节点，然后重新设置链中相关节点的顺序。

## 职责链模式的优缺点

职责链模式的最大优点就是解耦了请求发送者和 N 个接收者之间的复杂关系，由于不知道链中的哪个节点可以处理你发出的请求，所以你只需把请求传递给第一个节点即可。


# 设计模式——迭代器模式

迭代器模式是指提供一种方法顺序访问一个聚合对象中的各个元素，而又不需要暴露该对象的内部表示。

> .#### 在使用迭代器模式之后，即使不关心对象的内部构造，也可以按顺序访问其中的每个元素

JS 中数组的 map forEach 已经内置了迭代器

```javascript
[1, 2, 3].forEach(function(item, index, arr) {
    console.log(item, index, arr);
});
```

我们来手动封装一个遍历代码

```javascript
function each(obj, cb) {
    var value;
    if (Array.isArray(obj)) {
        //判断是不是Obj
        for (var i = 0; i < obj.length; ++i) {
            value = cb.call(obj[i], i, obj[i]);
            if (value === false) {
                break;
            }
        }
    } else {
        for (var i in obj) {
            value = cb.call(obj[i], i, obj[i]);
            if (value === false) {
                break;
            }
        }
    }
}

each([1, 2, 3], function(index, value) {
    console.log(index, value); //打印 0 1 ；1 2；2 3
});

each({ a: 1, b: 2 }, function(index, value) {
    console.log(index, value); //打印 a 1; b 2;
});
```

## 迭代器可以分为内部迭代器和外部迭代器，它们有各自的适用场景。

### 内部迭代器

我们刚刚编写的 each 函数属于内部迭代器，each 函数的内部已经定义好了迭代规则，它完全接手整个迭代过程，外部只需要一次初始调用。
内部迭代器在调用的时候非常方便，外界不用关心迭代器内部的实现，跟迭代器的交互也仅仅是一次初始调用，但这也刚好是内部迭代器的缺点。由于内部迭代器的迭代规则已经被提前规定，上面的 each 函数就无法同时迭代 2 个数组了。

### 外部迭代器

外部迭代器必须显式地请求迭代下一个元素。
外部迭代器增加了一些调用的复杂度，但相对也增强了迭代器的灵活性，我们可以手工控制迭代的过程或者顺序。

```javascript
var Iterator = function(obj) {
    var current = 0;
    var next = function() {
        current += 1;
    };
    var isDone = function() {
        return current >= obj.length;
    };
    var getCurrItem = function() {
        return obj[current];
    };
    return {
        next: next,
        isDone: isDone,
        getCurrItem: getCurrItem
    };
};
var compare = function(iterator1, iterator2) {
    while (!iterator1.isDone() && !iterator2.isDone()) {
        if (iterator1.getCurrItem() !== iterator2.getCurrItem()) {
            throw new Error('iterator1 和 iterator2 不 相 等');
        }
        iterator1.next();
        iterator2.next();
    }
    alert('iterator1 和 iterator2 相 等');
};
var iterator1 = Iterator([1, 2, 4]);
var iterator2 = Iterator([1, 2, 3]);
compare(iterator1, iterator2);
```

外部迭代器虽然调用方式相对复杂，但它的适用面更广，也能满足更多变的需求。内部迭代器和外部迭代器在实际生产中没有优劣之分，究竟使用哪个要根据需求场景而定。

再试试条件迭代，将每个条件语句拆分出逻辑函数，放入迭代器中迭代。

```javascript
function getManager() {
    var year = new Date().getFullYear();
    if (year <= 2000) {
        console.log('A');
    } else if (year >= 2100) {
        console.log('C');
    } else {
        console.log('B');
    }
}
getManager(); // B

// if else 的条件拆分

var year2000 = function() {
    var year = new Date().getFullYear();
    if (year <= 2000) {
        console.log('A');
    }
    return false;
};

var year2100 = function() {
    var year = new Date().getFullYear();
    if (year >= 2100) {
        console.log('C');
    }
    return false;
};

var year = function() {
    var year = new Date().getFullYear();
    if (year > 2000 && year < 2100) {
        console.log('B');
    }
    return false;
};

function iteratorYear() {
    for (var i = 0; i < arguments.length; ++i) {
        //arguments.length为函数实参个数，arguments.callee引用函数自身
        var ret = arguments[i]();
        if (ret !== false) {
            return ret;
        }
    }
}
iteratorYear(year2000, year2100, year); // B
```

> ###### Javascript 并没有重载函数的功能，但是 Arguments 对象能够模拟重载。Javascrip 中每个函数都会有一个 Arguments 对象实例 arguments，它引用着函数的实参，可以用数组下标的方式"[]"引用 arguments 的元素。

## 迭代器模式是一种相对简单的模式，简单到很多时候我们都不认为它是一种设计模式。目前的绝大部分语言都内置了迭代器。

# 设计模式——状态模式

事物内部状态的改变往往会带来事物的行为改变。在处理的时候，将这个处理委托给当前的状态对象即可，该状态对象会负责渲染它自身的行为

## 核心

区分事物内部的状态，把事物的每种状态都封装成单独的类，跟此种状态有关的行为都被封装在这个类的内部

实例：

```javascript
var Light = function() {
    this.state = 0;
    this.button = null;
};
Light.prototype.init = function() {
    var button = document.createElement('button'),
        self = this;
    button.innerHTML = '开 关';
    this.button = document.body.appendChild(button);
    this.button.onclick = function() {
        self.buttonWasPressed();
    };
};
Light.prototype.buttonWasPressed = function() {
    if (this.state === 0') {
        console.log('开 灯');
        this.state = 1;
    } else if (this.state === 1) {
        console.log('关 灯');
        this.state = 0;
    }
};
var light = new Light();
light.init();
```

一个很简单的状态机即拿即用。这个程序看起来没有任何的 BUG。那么问题来了，现在家里的电灯都是 “强光”，“正常”，“柔和”这样的设定。明显，上面的代码并不能解决这种问题

改造开始，先来一个小李子：

```javascript

Light.prototype.buttonWasPressed = function() {
    if (this.state === 0) {
        console.log('强 光');
        this.state = 1;
    } else if (this.state === 1) {
        console.log('正常光');
        this.state = 2;
    } else if (this.state === 2) {
        console.log('柔和光');
        this.state = 3;
    } else if (this.state === 3) {
        console.log('关灯');
        this.state = 0;
    }
};

```

这里很明显。我们伟大的开放封闭原则，又被我们彻底的打击了。
无疑，这大概就是一个入门的工程师写出来的，比如我！

改造改造：

```javascript
var OffLightState = function(light) {
    this.light = light;
};
OffLightState.prototype.buttonWasPressed = function() {
    console.log('柔和光'); // offLightState 对 应 的 行 为

    this.light.setState(this.light.normalLightState); // 切 换 状 态 到NormalLightState
};

var NormalLightState = function(light) {
    this.light = light;
};
NormalLightState.prototype.buttonWasPressed = function() {
    console.log('正常光'); // offLightState 对 应 的 行 为
    this.light.setState(this.light.weakLightState); // 切 换 状 态 到weakLightState
};

var WeakLightState = function(light) {
    this.light = light;
};
WeakLightState.prototype.buttonWasPressed = function() {
    console.log('强 光'); // weakLightState 对 应 的 行 为
    this.light.setState(this.light.strongLightState); // 切 换 状 态 到 strongLightState
};

var StrongLightState = function(light) {
    this.light = light;
};
StrongLightState.prototype.buttonWasPressed = function() {
    console.log('关 灯'); // strongLightState 对 应 的 行 为
    this.light.setState(this.light.offLightState); // 切 换 状 态 到 offLightState
};
// 改写Light
var Light = function() {
    this.offLightState = new OffLightState(this);
    this.normalLightState = new NormalLightState(this);
    this.weakLightState = new WeakLightState(this);
    this.strongLightState = new StrongLightState(this);
    this.button = null;
};
Light.prototype.init = function() {
    var button = document.createElement('button'),
        self = this;
    this.button = document.body.appendChild(button);
    this.button.innerHTML = '开 关';
    this.currState = this.offLightState; // 设 置 当 前 状 态
    this.button.onclick = function() {
        self.currState.buttonWasPressed();
    };
};

Light.prototype.setState = function(newState) {
    this.currState = newState;
};

var light = new Light();
light.init();
```
## 状态模式也许是被大家低估的模式之一。实际上，通过状态模式重构代码之后，很多杂乱无章的代码会变得清晰。虽然状态模式一开始并不是非常容易理解，但我们有必须去好好掌握这种设计模式。

分享：`徐旺`

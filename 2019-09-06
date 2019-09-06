/************************/
// 外观模式 ：  简化接口  对接口与调用者进行解耦

let obj1 = {}
obj1.children1 = function () {
    return "哈哈哈哈"
}
obj1.children2 = function () {
    return "嘿嘿嘿嘿"
}
obj1.children3 = function () {
    return "哟哟哟哟"
}
// 门面
obj1.facade = function () {
    this.children1()
    this.children2()
    this.children3()
}
obj1.men = function () {
    return this.facade()
}
// 作用：
// 1.在设计初期，应该要有意识地将不同的两个层分离，比如经典的三层结构。
// 2.在开发阶段，子系统往往因为不断的重构演化而变得越来越复杂，增加外观F可以提供一个简单的接口，减少他们之间的依赖。
// 3.在维护一个遗留的大型系统时，为系统开发一个外观Facade类，为设计粗糙和高度复杂的遗留代码提供比较清晰的接口，让新系统和Facade对象交互。

// 注意事项：
// 1.外观模式被开发者连续使用时会产生一定的性能问题，因为在每次调用时都要检测功能的可用性。

// 应用场景：处理很多的js兼容代码等等
var stopEvent = function (e) {
    //同时阻止事件默认行为和冒泡
    e.stopPropagation();
    e.preventDefault();
}
//stopEvent本身就是产门面
$("#a").click(function () {
    stopEvent(e);
})





// 享元模式  ： 用于性能优化    (减少创建对象的数量，以减少内存占用和提高性能   重用现有的同类对象，如果未找到匹配的对象，则创建新对象)

// 不使用享元模式的写法
var Model = function (sex, underwear) {
    this.sex = sex;
    this.underwear = underwear;
};
Model.prototype.takePhoto = function () {
    console.log('sex= ' + this.sex + ' underwear=' + this.underwear);
};
for (var i = 1; i <= 50; i++) {
    var maleModel = new Model('male', 'underwear' + i);
    maleModel.takePhoto();
};
for (var j = 1; j <= 50; j++) {
    var femaleModel = new Model('female', 'underwear' + j);
    femaleModel.takePhoto();
};
// 创建了100个对象，占用内存 

// 使用享元模式的写法
var Model = function (sex) {
    this.sex = sex;
};
Model.prototype.takePhoto = function () {
    console.log('sex= ' + this.sex + ' underwear=' + this.underwear);
};
// 分别创建一个男模特对象和一个女模特对象：
var maleModel = new Model('male'),
    femaleModel = new Model('female');

// 给男模特依次穿上所有的男装，并进行拍照：
for (var i = 1; i <= 50; i++) {
    maleModel.underwear = 'underwear' + i;
    maleModel.takePhoto();
};

// 　　同样，给女模特依次穿上所有的女装，并进行拍照：
for (var j = 1; j <= 50; j++) {
    femaleModel.underwear = 'underwear' + j;
    femaleModel.takePhoto();
};
// 、享元模式要求将对象的属性划分为内部状态与外部状态（状态在这里通常指属性）
// 1、内部状态存储于对象内部。
// 2、内部状态可以被一些对象共享。
// 3、内部状态独立于具体的场景，通常不会改变。
// 4、外部状态取决于具体的场景，并根据场景而变化，外部状态不能被共享






// 代理模式   创建具有现有对象的对象，以便向外界提供功能接口
// 实现 ： 代理对象内部含有对本体对象的引用，因而可以与调用本体的相关方法；同时，代理对象提供与本体对象相同的接口，方便在任何时刻代理本体对象。
// （1）保护代理:
// 保护代理主要用于控制不同权限的对象对本体对象的访问权限。比如很多人想访问本体A，如果有代理B存在的话，B会首先剔除不满足A的访问条件的访问者，符合条件的才能访问。

//用户本体
function User(name, code) {
    this.name = name;
    this.code = code;
};
User.prototype = {
    getName: function () {
        return this.name;
    },
    getCode: function () {
        return this.code;
    },
    post: function () {
        console.log("发帖子！");
    }
};
//代理论坛类
function Forum(user) {
    this.user = user;
};
Forum.prototype = {
    getUser: function () {
        return this.user;
    },
    post: function () {
        // 满足条件
        if (this.user.getCode() == "001" || this.user.getCode() == "003") {
            return this.user.post();
        }
        console.log("没权限发帖子！");
    }
};
//功能测试
new Forum(new User("bigbear", "003")).check(); // 审核帖子

// （2）虚拟代理
// 虚拟代理是将调用本体方法的请求进行管理，等到本体适合执行时，再执行。


/**在图片预加载中实现虚拟代理 */
var myImage = (function () {
    var imageNode = document.createElement('img');
    document.body.appendChild(imageNode);
    return {
        setSrc: function (src) {
            imageNode.src = src;
        }
    }
})()

//代理类
var proxyImage = (function () {
    var img = new Image();
    img.onload = function () {
        console.log(0)
        myImage.setSrc(this.src);
    }
    return {
        setSrc: function (src) {
            myImage.setSrc("本地图片");  /*********************************** */
            img.src = src; //缓存完毕之后会触发img的onload事件
        }
    }
})()

// （3）缓存代理
// 缓存代理可以为开销大的一些运算结果提供暂时性的存储，如果再次传进相同的参数是，直接返回结果，避免大量重复计算。

// ** 创建缓存代理工厂
//将缓存代理与工厂模式相结合，创建多种运算的缓存代理
var mult = function () {
    var a = 1;
    for (var i = 0; i < arguments.length; i++) {
        a = a * arguments[i];
    }
    return a;
}
var plus = function () {
    var a = 0;
    for (var i = 0; i < arguments.length; i++) {
        a = a + arguments[i];
    }
    return a;
}
//高阶函数:将函数作为参数或者返回值的函数
var proxyFactory = function (fn) {
    var cache = {}; //参数缓存列表
    return function () {
        var args = Array.prototype.join.call(arguments, ',');
        if (args in cache) {
            return cache[args];
        }
        //参数属性对应的是函数
        return cache[args] = fn.apply(this, arguments);
    }
}

//测试
var proxyMult = proxyFactory(mult),
    proxyPlus = proxyFactory(plus);

console.log(proxyMult(1, 2, 3, 4));
console.log(proxyMult(1, 2, 3, 4));
console.log(proxyPlus(5, 6, 7, 8));
console.log(proxyPlus(5, 6, 7, 8));

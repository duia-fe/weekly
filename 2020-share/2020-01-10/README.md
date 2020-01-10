# 什么是什么是装饰器

>* 装饰器在javascript中仅仅可以修饰类和属性，不能修饰函数。
>* 装饰器对类的行为的改变，是代表编译时发生的，而不是在运行时。
>* 个人认为装饰器是对类的一个补充


### 我们在下面的拦截类中注入一个打印日志的装饰器。

> 这里顺带演示一下类的修饰符。
> static表示该方法可以通过类直接访问，public表示该属性公开，protected表示只能通过实例调用，private，表示只能在实例内部调用。
```javascript
class proxyClass{
    public test;
    public proxy;
    public token;
    private prototypes = {};
    private target = {};
    constructor(target = {}){
        this.target = target;
        this.proxy = new Proxy(this.target,this.prototypes);
    }
    @log
    add(attr = {}): any{
        Object.assign(this.prototypes,attr);
        return this.proxy;
    }
}
```

### 装饰器会接收三个参数

1. 类的原型对象
2. 所要装饰的属性名
3. 该属性的描述对象。
```javascript
function log(constructor: object, name: string,descriptor: any){
    // 我们来打印一下属性的描述
    console.log(descriptor,"descriptor");
    const target = descriptor.value;
    descriptor.value = function(attr = {}){
        console.log('log',name,attr);
        return target.call(this,attr);
    };
    return descriptor;
}
```

# 什么是（Proxy）拦截器
>* Proxy 用于修改某些操作的默认行为，等同于在语言层面做出修改，所以属于一种“元编程”（meta programming），即对编程语言进行编程。
>* Proxy 可以理解成，在目标对象之前架设一层“拦截”，外界对该对象的访问，都必须先通过这层拦截，因此提供了一种机制，可以对外界的访问进行过滤和改写。Proxy 这个词的原意是代理，用在这里表示由它来“代理”某些操作，可以译为“代理器”。
>* vue3将底层数据驱动Object.defineProperty换成Proxy，解决了某些操作无法实时响应

### 如何创建一个拦截器

> const proxy = new Proxy(target, handler);
>* target 用Proxy包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）。
>* handler 一个对象，其属性是当执行一个操作时定义代理的行为的函数。

### 如何创建一个可撤销的代理对象（Proxy.revocable()）
>const revocable = Proxy.revocable(target, handler);

>该方法的返回值是一个对象，其结构为： {"proxy": proxy, "revoke": revoke}，其中：proxy
表示新生成的代理对象本身，和用一般方式 new Proxy(target, handler) 创建的代理对象没什么不同，只是它可以被撤销掉。

>revocable.revoke()
撤销方法，调用的时候不需要加任何参数，就可以撤销掉和它一起生成的那个代理对象。

> 一旦某个代理对象被撤销，它将变的几乎完全不可用，在它身上执行任何的可代理操作都会抛出 TypeError 异常

# 关于类(class)
> 上面我们类的修饰符，static表示该方法可以通过类直接访问，public表示该属性公开，protected表示只能通过实例调用，private，表示只能在实例内部调用。
> 接下来我们看一下类的继承


# 直接贴代码
example1
```javascript
// 我们来玩一个好玩的东西，通过代理进行链式操作
class exampleClass{
    private way = {};
    public proxy;
    constructor(initVal = 0){
        this.proxy = new Proxy({
            initVal,
            calculate: <any>[]
        },{
            get:(target, fnName) => {
                if(fnName == "get"){
                    return target.calculate.reduce( (val, fn) => fn(val),target.initVal);
                }else if(this.way.hasOwnProperty(fnName)){
                    target.calculate.push(this.way[fnName]);
                };
                return this.proxy;
            }
        })
    }
    injection(name:string,callback:Function){
        this.way[name] =  callback;
        return this;
    }
}

function example(){
    const the = new exampleClass(5);
    const result = the
    .injection('double',n => n*2)
    .injection('pow',n => n*n)
    .injection('reverseInt',n => n.toString().split("").reverse().join("") | 0)
    .proxy.double.reverseInt.get;
    console.log(result,'result');
}

export default example;
```
example2
```javascript
// Proxy 对象用于定义基本操作的自定义行为（如属性查找，赋值，枚举，函数调用等）
// https://juejin.im/post/5bf3e632e51d452baa5f7375
// vue3将数据驱动核心Object.defineProperty过渡到Proxy，解决了由于某些操作无法监听而导致数据不能实时响应

/**
 * 什么是装饰器
 * 装饰器在javascript中仅仅可以修饰类和属性，不能修饰函数。
 * 装饰器对类的行为的改变，是代表编译时发生的，而不是在运行时。
 * 个人理解就是对继承的一个补充
 */

function injeReadonly(target,key,value){
    Object.defineProperty(target,key,{
        configurable: false,//能否使用delete、能否需改属性特性、或能否修改访问器属性、，false为不可重新定义，默认值为true
        enumerable: false,//对象属性是否可通过for-in循环，flase为不可循环，默认值为true
        writable: false,//对象属性是否可修改,flase为不可修改，默认值为true
        value //对象属性的默认值，默认值为undefined
    });
}

function token(value) {
    return function(target) {
        // Object.defineProperties
        injeReadonly(target.prototype,'token',value);
    }
}

// 来做一个日志打印的装饰器
// 装饰器第一个参数是类的原型对象,第二个参数是所要装饰的属性名，第三个参数是该属性的描述对象。
function log(constructor: object, name: string, descriptor: any){
    // 我们来打印一下属性的描述
    console.log(descriptor,"descriptor");
    const target = descriptor.value;
    descriptor.value = function(attr = {}){
        console.log('log',name,attr);
        return target.call(this,attr);
    };
    return descriptor;
}

// 关于属性装饰器的隐式传参
function readonly(value){
    return function(...arg){
        const [target,name, descriptor] = arg;
        injeReadonly(target,name,value);
    }
}

// 这里我们注入一个不可修改的token，以免被恶意修改
@token('267e6b8405bda012c77367d67461915d')
// 创建一个拦截器
class proxyClass{
    @readonly("123456")
    public test;
    public proxy;
    public token;
    private prototypes = {};
    private target = {};
    constructor(target = {}){
        this.target = target;
        this.proxy = new Proxy(this.target,this.prototypes);
    }
    @log
    add(attr = {}): any{
        Object.assign(this.prototypes,attr);
        return this.proxy;
    }
}

const target = {};
const P = new proxyClass(target);

// 我们来改变test的值
P.test = "789";
console.log(P,P.test,"this is test!");

// 我们来尝试改变token的值
P.token = "this is token!";
console.log(P.token,"token");

// 我们来看基础实现
P.add({
    get(target, propKey){
        return propKey in target ? target[propKey] : 'not find!';
    }
});

P.proxy.a = "this is a";
console.log('a:',P.proxy.a,'b:',P.proxy.b,'说明对属性进行了访问拦截!');

// 接下来我们对属性的设置进行拦截！
P.add(
    {
        set(obj,prop,val){
            obj[prop] = val;
            console.log(obj,prop,val);
        }
    }
);
P.proxy.c = "this is c";

console.log(target,P,'P');

// 拦截propKey in proxy的操作，返回一个布尔值。
P.add({
    has(target, propKey):boolean{
        console.log("has",target, propKey);
        return false;
    }
});

console.log('a' in P.proxy);

// 拦截delete proxy[propKey]的操作，返回一个布尔值。
P.add({
    deleteProperty(target, propKey){
        console.log('deleteProperty',target,propKey);
        // delete target[propKey];
        return false;
    }
});

console.log(delete P.proxy.a,P.proxy.a);

// 拦截Object.getOwnPropertySymbols(proxy)、Object.getOwnPropertyNames(proxy)、Object.keys(proxy)、for...in循环，返回一个数组。
// 该方法返回目标对象所有自身的属性的属性名，而Object.keys()的返回结果仅包括目标对象自身的可遍历属性。
P.add({
    ownKeys(target){
        const arr = [];
        for(let key in target){
            arr.push(key);
        };
        return arr;
    }
});

console.log('this is keys',Object.keys(P.proxy));

// 好玩的例子
// const example = require('./example');
// example.default();
```
example3
```javascript
// 这里我们来做Object.defineProperty与proxy的对比

let data1:any = {};
function proxy(target,key,value){
    let oldData = value;
    Object.defineProperty(target,key,{
        configurable: false,//能否使用delete、能否需改属性特性、或能否修改访问器属性、，false为不可重新定义，默认值为true
        enumerable: false,//对象属性是否可通过for-in循环，flase为不可循环，默认值为true
        // writable: true,//对象属性是否可修改,flase为不可修改，默认值为true
        // value:[], //对象属性的默认值，默认值为undefined
        get(){
            console.log("data1-get",arguments);
            return oldData;
        },
        set(val){
            oldData = val;
            console.log('set',arguments,this);
        }
    });
}
proxy(data1,'arr',[1,2,3]);
data1.arr[1] = 4;

let data2 = {arr:[1,2,3]};
const ex2 = new Proxy(data2.arr,{
    get(target,keyName){
        console.log('data2-get',arguments);
        // return target[keyName];
        return false;
    },
    set(obj,prop,val){
        console.log('data2-set',arguments);
        return false;
    }
});
ex2[1] = 4;

// 参考https://segmentfault.com/q/1010000021048654
```
example4
```javascript
class test1{
    static names:string = "heyu1"
    public age:number = 18
    protected sex:string = "男"
    private card:string = "19910627";
    constructor(){
        console.log(this.card);
    }
    info(){
        console.log('this is test1-info');
    }
}

class test2 extends test1{
    constructor(){
        // 通过super去调用被覆盖的基类函数
        super();
        console.log(this.age);
        console.log(this.sex);
        // 这里调用私有属性会报错，不允许其他继承类以及外部使用
        // console.log(this.card);
        this.info();
    }
    info(){
        // super.info();
        console.log('this is test2-info');
    }
}

const ex = new test2();
console.log(test2.names);
console.log(ex.age);
// console.log(ex.sex);
// console.log(ex.card);
```
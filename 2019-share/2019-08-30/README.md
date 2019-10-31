import axios , { AxiosResponse } from "axios";

#### declare var window: any;
##### <中介者模式>，约定各个接口返回数据格式
```
interface BackDataProps {
    message: string; // 信息
    state: number; // 状态
    data: any; // 数据
}
```
##### 中介者
```
function DecoratorBackData({data,status,statusText}: AxiosResponse ): BackDataProps{
    return {
        message: statusText === "OK" ? "success" : statusText,
        state: status === 200 ? 0 : status,
        data: data.match(/<title>([^<]+)/)[1]
    }
}

function getWeatherInfo(): Promise<BackDataProps> {
    return axios({url:"/weather"})
    .then( rel => {
        // 中介者统一各个接口返回格式
        return DecoratorBackData(rel);
    });
}

function getZongheng(): Promise<BackDataProps> {
    return axios({url:"http://bang.test.duia.com/web/module/g-mds",method:"post"})
    .then( ({data,status,statusText}) => {
        return {
            message: data.stateInfo,
            state: data.state,
            data: data.resInfo
        }
    });
}
```
###### 原来的接口
```
getZongheng().then( rel => {
    console.log("getZongheng",rel);
});
```
###### 新截图模块的接口
```
getWeatherInfo().then(rel => {
    console.log("getWeatherInfo",rel);
});
```
-----
#### <混合模式>，在一个对象原型链上添加额外的职能函数或者重载某个函数
```
class Book{
    private num: number = 0;
    constructor(){

    }
    // 页数计算方式函数
    public count(num: number){
        return num ++;
    }
    public run(){
        this.num = this.count(this.num);
    }
    public print(){
        console.log("num===",this.num);
    }
    static extends(name: string, func: Function , Overload: boolean = false){
        if(this.prototype[name] === undefined || Overload){
            this.prototype[name] = func;
        }
    }
}
// 假设一本图书，我们修改了以前的页数计算方式，就阔以直接用改名称直接重载方法
Book.extends("count", num => num + 10, true);

const book = new Book();
book.run();
book.print();
```
-----
#### <装饰模式>，就是出厂基类实例化后直接在其引用上添加函数
##### 以上面的翻书为例，我们直接使用Book.extends会重载整个函数，会影响整个派生类的实例计算
```
class Desk extends Book{
    constructor(){
        super();
    }
}
// 在以下实例中，我们其实需要的原来的页数计算方式
const desk = new Desk();
desk.run();
desk.print();

// 这里我们就需要重新调整逻辑
// 注释 Book.extends("count", num => num + 10, true);
// 使用 book.count = num => num + 10;

// 下面我们来看一个更加直观的装饰模式
// 我们来创建一个简易的观察者，做数据驱动
declare var Object: any;
// 基于vue2的数据驱动
function observer(node: HTMLInputElement , feedback: HTMLElement ){
    const model = {
        val: ""
    };
    const back = {
        val: ""
    };
    Object.defineProperty(model,"val",{
        enumerable: true,
        get: function() {
            return back.val;
        },
        set: function(newValue) {
            if(node.value !== newValue){
                node.value = newValue;
            };
            feedback.innerText = newValue;
            back.val = newValue;
        }
    });
    node.onkeyup = function(){
        model.val = node.value;
    };
    return model;
}

const G = (name:string): Array<HTMLElement> => Array.from(document.querySelectorAll(name));

const input1 = observer(G("#input1")[0] as HTMLInputElement,G("#input11")[0]);
const input2 = observer(G("#input2")[0] as HTMLInputElement,G("#input22")[0]);
window.input1 = input1;
window.input2 = input2;
```
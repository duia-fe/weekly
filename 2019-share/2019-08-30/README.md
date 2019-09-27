import axios , { AxiosResponse } from "axios";

#### declare var window: any;
##### <�н���ģʽ>��Լ�������ӿڷ������ݸ�ʽ
```
interface BackDataProps {
    message: string; // ��Ϣ
    state: number; // ״̬
    data: any; // ����
}
```
##### �н���
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
        // �н���ͳһ�����ӿڷ��ظ�ʽ
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
###### ԭ���Ľӿ�
```
getZongheng().then( rel => {
    console.log("getZongheng",rel);
});
```
###### �½�ͼģ��Ľӿ�
```
getWeatherInfo().then(rel => {
    console.log("getWeatherInfo",rel);
});
```
-----
#### <���ģʽ>����һ������ԭ��������Ӷ����ְ�ܺ�����������ĳ������
```
class Book{
    private num: number = 0;
    constructor(){

    }
    // ҳ�����㷽ʽ����
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
// ����һ��ͼ�飬�����޸�����ǰ��ҳ�����㷽ʽ��������ֱ���ø�����ֱ�����ط���
Book.extends("count", num => num + 10, true);

const book = new Book();
book.run();
book.print();
```
-----
#### <װ��ģʽ>�����ǳ�������ʵ������ֱ��������������Ӻ���
##### ������ķ���Ϊ��������ֱ��ʹ��Book.extends������������������Ӱ�������������ʵ������
```
class Desk extends Book{
    constructor(){
        super();
    }
}
// ������ʵ���У�������ʵ��Ҫ��ԭ����ҳ�����㷽ʽ
const desk = new Desk();
desk.run();
desk.print();

// �������Ǿ���Ҫ���µ����߼�
// ע�� Book.extends("count", num => num + 10, true);
// ʹ�� book.count = num => num + 10;

// ������������һ������ֱ�۵�װ��ģʽ
// ����������һ�����׵Ĺ۲��ߣ�����������
declare var Object: any;
// ����vue2����������
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
### html5新特性

* ##### web worker 

    [参考链接](https://juejin.im/post/59c1b3645188250ea1502e46)
    JavaScript 是单线程的，在同一时刻只能处理一个任务，我们会通过 setTimeout()、setInterval()、ajax 和事件处理程序等技术模拟“并行”。但都不是真正意义上的并行。随着电脑计算能力的增强，尤其是多核 CPU 的出现，单线程带来很大的不便，无法充分发挥计算机的计算能力。 
    定义：Web Worker 是HTML5标准的一部分，这一规范定义了一套 API，它允许一段JavaScript程序运行在主线程之外的另外一个线程中。工作线程允许开发人员编写能够长时间运行而不被用户所中断的后台程序， 去执行事务或者逻辑，并同时保证页面对用户的及时响应，可以将一些大量计算的代码交给web worker运行而不冻结用户界面。
   

    1. 创建webworker
        ```
            var myWorker = new Worker(window.URL.createObjectURL(blob));
        ```
        注意： 同源限制：分配给 Worker 线程运行的脚本文件，必须与主线程的脚本文件同源。


    2. 主线程和子线程之间的通信：onmessage 事件和 postMessage() 方法实现
        ```
            //主线程
            myWorker.postMessage("start");
            myWorker.onmessage = function (event) {
               console.log("接收到的子组件返回的信息"+event.data)
            }

            //子线程
            function sendMsg(){
                postMessage("baogao");
            }
            this.addEventListener('message', function (e) {
                this.postMessage('主线程告诉我: ' + e.data);
            });
        ```
    3. 通过可转让对象来传递数据
        ```
                    
            var uInt8Array = new Uint8Array(1024*1024*32); // 32MB
            for (var i = 0; i < uInt8Array .length; ++i) {
            uInt8Array[i] = i;
            }

            console.log(uInt8Array.length); // 传递前长度:33554432

            var myTask = `
                onmessage = function (e) {
                    var data = e.data;
                    console.log('worker:', data);
                };
            `;

            var blob = new Blob([myTask]);
            var myWorker = new Worker(window.URL.createObjectURL(blob));
            myWorker.postMessage(uInt8Array.buffer, [uInt8Array.buffer]);

            console.log(uInt8Array.length); // 传递后长度:0
        ```
    4. Worker 加载脚本
        如果worker需要加载其他脚本，可通过importScripts()。
        ```
            //加载单个
            importScripts('script1.js');
            //加载多个
            importScripts('script1.js', 'script2.js');
        ```
    5. 终止worker
        ```
            //主线程终止
             myWorker.terminate();
            //子线程终止自己
            self.close()
        ```
    6. 处理错误 onerror 
        当 worker 出现运行时错误时，它的 onerror 事件处理函数会被调用。它会收到一个实现了 ErrorEvent 接口名为 error的事件。该事件不会冒泡，并且可以被取消；为了防止触发默认动作，worker 可以调用错误事件的 preventDefault() 方法。
        错误事件有三个实用的属性：filename - 发生错误的脚本文件名；lineno - 出现错误的行号；以及 message - 可读性良好的错误消息。

        ```
        myWorker.onerror = function onError(e) {
            console.log(['ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message].join(''));
        }
        ```



    * ###### 注意点
        >1. 同源限制：分配给 Worker 线程运行的脚本文件，必须与主线程的脚本文件同源
        >2. DOM 限制：Worker 线程所在的全局对象，与主线程不一样，无法读取主线程所在网页的 DOM 对象，也无法使用document、window、parent这些对象。但是，Worker线程可以读取navigator对象和location对象。
        >3. 通信限制：Worker 线程和主线程不在同一个上下文环境，它们不能直接通信，必须通过消息完成。
        >4. 脚本限制：Worker 线程不能执行alert()方法和confirm()方法，但可以使用 XMLHttpRequest 对象发出 AJAX 请求。
        >5. 文件限制：Worker 线程无法读取本地文件，即不能打开本机的文件系统（file://），它所加载的脚本，必须来自网络。


    

### css3 


* ##### clumn布局 
    * ###### 属性
        * column-count: 列数目
        * column-gap: 各列之间间隙宽度
        * column-width: 建议宽度；未必会使用，浏览器基于此数值进行计算
        * column-rule-width：列之间分割线宽度
        * column-rule-style：列之间分割线风格
        * column-rule-color：列之间分割线颜色
        * column-span: none | all   允许一个元素的宽度跨越多列
        * column-fill: 分列方式
    [参考链接](https://juejin.im/post/59ba816c6fb9a00a3e304047)
    应用： [瀑布流布局 demo](multi-column.html)

* ##### draggable 拖拽
    [参考链接](https://www.zhangxinxu.com/wordpress/2011/02/html5-drag-drop-%E6%8B%96%E6%8B%BD%E4%B8%8E%E6%8B%96%E6%94%BE%E7%AE%80%E4%BB%8B/)

* ##### grid布局 
    [参考链接](http://www.ruanyifeng.com/blog/2019/03/grid-layout-tutorial.html)


2019年11月29日 星期五
60秒看互联网圈内发生了什么？
----------------------
1.小红书将于近期内测电商直播，创作者可以进行直播+笔记和红包玩法
2.广州公安推出“真你”微信认证小程序 ，“刷脸”可识别微信网友真实身份
3.BOSS直聘完成数亿美元融资，领投方包括腾讯
4.百度CTO王海峰：百度大脑语音能力日均调用量超100亿次
5.抖音启动高校官抖联盟，与高校共建短视频生态
6.工信部：携号转网用户占总体2%，近半转入电信，转出移动最多
7.微软：8万台电脑被恶意软件劫持 变身比特币生成器
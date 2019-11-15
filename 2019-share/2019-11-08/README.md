
# 浏览器是如何解析html文档的
>* 打开网址的那一刻，开始请求服务器
>* 服务器响应并解析请求头，返回相应的html文档
>>浏览器从上到下读取标签，把他们分解成节点，从而创建 DOM 。
>* 使用 HTML 创建文档对象模型（ DOM ）
>* 使用 CSS 创建 CSS 对象模型（ CSSOM ）
>>当浏览器发现任何与节点相关的样式时，比如：外部，内部，或行内样式，立即停止 渲染 DOM ，并利用这些节点创建 CSSOM。这就是 CSS “ 渲染阻塞 “ 的由来。
如果我们在处理多个适配的时候，可以使用media这个属性，第一方便集中使用媒体查询，第二 media 属性指定要加载样式必须满足的条件。
比如我们通过工具做得路由切片就是一个很好的优化，通过按需加载，阔以再首屏中提升用户体验，当然还可以使用骨架屏。
>* 基于 DOM 和 CSSOM 执行脚本（ Scripts ）
>>同样会阻塞页面加载，所以我们一般把js脚本放在body最底部等dom加载完整再进行加载，让用户快速看到页面。
如果遇到独立的js脚本，比如第三方统计的外部代码，可以使用async这个属性，可以通知浏览器不要阻塞其余页面的加载，下载脚本处于较低的优先级。一旦下载完成，就可以执行。
>* 合并 DOM 和 CSSOM 形成渲染树（ Render Tree ）（重排）
>* 使用渲染树布局（ Layout ）所有元素（重绘）
>* 渲染（ Paint ）所有元素（渲染）
```
    <script>
        /*
        * 当我们的项目中需要展现的图片过多时，应该采用瀑布流或者将图片放在资源之后加载，请参照http://www.jq22.com/yanshi390。
        * 因为每个浏览器的并发数并不一样https://www.cnblogs.com/sunsky303/p/8862128.html，为了让我们的脚本资源和样式资源尽快加载，所以可以将图片资源放到最后加载。
        */
    </script>
```
# DOM，天生就慢
>* 浏览器通常会把js和DOM分开来分别独立实现。</li>
>>举个栗子冷知识，在IE中，js的实现名为JScript，位于jscript.dll文件中；DOM的实现则存在另一个库中，名为mshtml.dll（Trident）。
Chrome中的DOM实现为webkit中的webCore，但js引擎是Google自己研发的V8。
所以，在各个浏览器中有兼容性写法，而且在js中操作dom就要付出巨大的代价，因为它会导致浏览器重新计算页面的几何变化
而且，当我们使用document.get...去获取元素集合的时候，这时获取的集合处于一个实时的状态。
```
    <div id="dom_container"></div>
    <button onclick="realTime()">测试实时状态开始</button>
    <script>
        const dom_container = document.querySelector("#dom_container");
        const p_list = dom_container.getElementsByTagName("p");
        let p_leng = 0;
        function realTime(){
            setInterval(() => {
                console.log(new Date().valueOf());
                p_leng ++;
                const p = document.createElement("p");
                p.innerText = p_leng;
                dom_container.appendChild(p);
                console.log("p_list",p_list.length);
            },5000);
        }
    </script>
```
>*事件委托（Event Delegation）
>> 当页面中有大量的元素，并且这些元素都需要绑定事件处理器。
每绑定一个事件处理器都是有代价的，要么加重了页面负担，要么增加了运行期的执行时间。再者，事件绑定会占用处理时间，而且浏览器需要跟踪每个事件处理器，这也会占用更多的内存。还有一种情况就是，当这些工作结束时，这些事件处理器中的绝大多数都是不再需要的（并不是100%的按钮或链接都会被用户点击），因此有很多工作是没有必要的。
事件委托的原理很简单——事件逐层冒泡并能被父级元素捕获。
使用事件委托，只需要给外层元素绑定一个处理器，就可以处理在其子元素上触发的所有事件。
这里参考jq的事件委托。


---

by `何宇`

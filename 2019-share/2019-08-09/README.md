# 设计模式

**在面向对象软件设计过程中针对特定问题的简洁而优雅的解决方案**

一个模式就是一个可重用的方案，可应用于在软件设计中的常见问题。模式的另一种解释就是一个我们如何解决问题的模板 - 那些可以在许多不同的情况里使用的模板。

## 发布/订阅模式 
**在该模式下，可理解为两种角色：发布者和订阅者。发布订阅者模式就是一种一对多的依赖关系,一个完整的订阅发布模式，由发布者、订阅者、消息管理器三部分组成.**
![](http://a.jpg)

**情景分析**
用户A为订阅者，店铺为发布者，用户A和用户B订阅店铺，用户A无需主动去打店铺查询消息，店铺自动向用户A和用户B推送消息；若用户A不想接收店铺的消息，则可以对店铺取消订阅。

**该模式的优势**

- 松耦合：发布者无须关心有多少个订阅者，以及它们接受消息后会干什么，而订阅者也无须知道发布者何时发布消息
- 易维护：订阅者和发布者没有直接的逻辑往来
- 解决负载问题：在高并发情况下，实现消息分流机制，异步执行

**该模式的劣势**

- 消息无状态：发布者发布消息如果失败，订阅者无法获取该状态
- 订阅者的数量不可控：一对多的关系，不会限制订阅者的数量。（CPU占用大，进程阻塞）
- 发布者与订阅者关系陌生：订阅者只认消息，发布者只发布消息，两者无直接联系

**模式分析**

发布者：店铺，订阅者：用户A和用户B

每个发布者对象需要以下成员
- 一个数组，用于存储订阅者
- 订阅者注册方法，将订阅者添加到数组中
- 取消订阅，将订阅者从数组中删除
- 循环遍历，循环遍历数组中的每一个元素（订阅者），并且调用它们（订阅者）注册时所提供的方法，即发布消息



所有这三种方法都需要一个 type 参数。这是因为发布者可能触发多个事件（比如同时发布一本杂志和一份报纸），而订阅者可能仅选择订阅其中一种，而另外一种不订阅。

1.创建订阅者和发布者
```javascript
var shop = {
             list: [], // 缓存列表 存放订阅者回调函数
             listen: function(fn) {
             	this.list.push(fn); // 订阅消息添加到缓存列表
              },
             trigger: function() {
             	for (var i = 0, fn; (fn = this.list[i++]); ) {
                	fn.apply(this, arguments);
                }
              }
            };
            //用户A
            shop.listen(function(color,size) {
                console.log('1颜色是：' + color);
                console.log('1尺码是：' + size);
            });
            // 用户B
            shop.listen(function(color,size) {
                console.log('2颜色是：' + color);
                console.log('2尺码是：' + size);
            });
            shop.trigger('黑色',48)
```
最终打印结果是，两个用户均打印了颜色和尺寸。
1颜色是：黑色
1尺码是：48
2颜色是：黑色
2尺码是：48
由以上结果可以看出订阅者A、B均接收到发布者发布的信息；如果现在用户A只想订阅黑色的相关信息，用户B只想订阅红色相关信息，则此时，就需要一个type参数来区分他们。
```javascript
var shop = {
                list: [], // 缓存列表 存放订阅者回调函数
                listen: function(key,fn) {
                    if(!this.list[key]){
                        this.list[key]=[];
                    }
                    this.list[key].push(fn); // 订阅消息添加到缓存列表
                },
                trigger: function() {
                    var key=Array.prototype.shift.call(arguments);

                    var fns=this.list[key];
                    if(!fns||fns.length===0){
                        return
                    }
                    for (var i = 0, fn; (fn = fns[i++]); ) {
                        fn.apply(this, arguments);
                    }
                }
            };
            //用户A
            shop.listen('red',function(size) {
                console.log('1尺码是：' + size);
            });
            // 用户B
            shop.listen('black',function(size) {
                console.log('2尺码是：' + size);
            });
            shop.trigger('red',48)
            console.log(shop.list)
```
1尺码是：48

最终结果只有用户A接受到信息，因为发布的消息类型是'red'，而用户B订阅的是'black'，所示用户B不会接收到消息；当用户订阅了多种信息时，将用户的多种行为进行封装。
```javascript
var shop = {
                list: [], // 缓存列表 存放订阅者回调函数
                listen: function(key,fn) {
                    if(!this.list[key]){
                        this.list[key]=[];
                    }
                    this.list[key].push(fn); // 订阅消息添加到缓存列表
                },
                trigger: function() {
                    var key=Array.prototype.shift.call(arguments);
                    var fns=this.list[key];
                    if(!fns||fns.length===0){
                        return
                    }
                    for (var i = 0, fn; (fn = fns[i++]); ) {
                        fn.apply(this, arguments);
                    }
                } 
            };
            var initShop=function(obj){
                for(i in shop){
                    obj[i]=shop[i];
                }
            }
            var user={
                color:function(color){
                    console.log('user1订购的颜色：'+color);
                },
                size:function(size){
                    console.log('user1订购的尺寸：'+size);
                }
            }
            initShop(user);//初始化用户，使得用户具有订阅功能
            //用户
            user.listen('red',user.color);
            user.listen('size',user.size);

            user.trigger('red','红色');
            user.trigger('size',45);
```
打印结果为：
user1订购的颜色：红色
user1订购的尺寸：45
当用户想要对某类信息取消订阅，不想接收此类消息时，则需要进行取消订阅的操作。
```javascript
var shop = {
                list: [], // 缓存列表 存放订阅者回调函数
                listen: function(key,fn) {
                    if(!this.list[key]){
                        this.list[key]=[];
                    }
                    this.list[key].push(fn); // 订阅消息添加到缓存列表
                },
                trigger: function() {
                    var key=Array.prototype.shift.call(arguments);
                    var fns=this.list[key];
                    if(!fns||fns.length===0){
                        return
                    }
                    for (var i = 0, fn; (fn = fns[i++]); ) {
                        fn.apply(this, arguments);
                    }
                },
                remove:function(key,fn){
                    var fns=this.list[key];
                    if(!fn){
                        fn&&(fns.length=0)
                    }else{
                        for(var i=fns.length-1;i>=0;i--){
                            var _fn=fns[i];
                            if(_fn===fns[i]){
                                fns.splice(i,1);
                            }
                        }
                    }

                } 
            };
            var initShop=function(obj){
                for(i in shop){
                    obj[i]=shop[i];
                }
            }
            var user={
                color:function(color){
                    console.log('user1订购的颜色：'+color);
                },
                size:function(size){
                    console.log('user1订购的尺寸：'+size);
                }
            }
            initShop(user);
            //用户
            user.listen('red',user.color);
            user.listen('size',user.size);

            user.trigger('red','红色');
            user.trigger('size',45);
            user.remove('red',user.color);
            user.trigger('red','白色');
            user.trigger('size',45);
```
打印结果为：
user1订购的颜色：红色
user1订购的尺寸：45
user1订购的尺寸：45
# 设计模式——策略模式

 策略模式的定义是：定义一系列的算法，把它们一个一个封装起来，并且使它们可以相互替换。

 例子：
 
 ```javascript
    //根据绩效等级计算员工年终奖
    var getBonus =function(level,salary){
        //常规写法
        if(level === 'S'){
            return salary*4;
        }
        if(level === 'A'){
            return salary*3;
        }
        if(level === 'B'){
            return salary*2;
        }
    } 
    
    getBonus('S',8000);
    getBonus('A',10000);
    
```
上面这段代码虽然很简单，但是却有很明显的缺点:

* getBonus函数比较庞大，包含了多个条件判断，这些语句需要覆盖所有的逻辑分支

* getBonus函数缺乏弹性，如果要加入一种新的绩效等级C,就要深入函数内部实现，违反了开放-封闭原则

> ###### 开放-封闭原则思想：当需要改变一个程序的功能或者给这个程序增加新功能的时候，可以使用增加代码的方式，但是不允许改动程序的源代码。

* 算法的复用性差，如果在项目中的其他地方需要用到，只能CV

## 策略模式重构代码:

思路：将不变的部分和变化的部分隔开是每个设计模式的主题，策略模式也不例外，其目的就在于将算法的使用与算法的实现分离开来

```javascript
    //一个基于策略模式的程序至少由两部分组成。第一个部分是一组策略类，策略类封装了具体的算法并负责计算具体的计算过程；第二个部分是环境类，
    // 环境类接受客户的请求，随后把请求委托给某一个策略类。要做到这一点，说明环境类中要维持对某个策略对象的引用。
    
    //仿面向对象语言的策略模式
    var levelS = function(){};
    levelS.prototype.calc = function(salary){
        return salary*4;
    }
    
    var levelA = function(){};
    levelA.prototype.calc = function(salary){
        return salary*3;
    }
    
    var levelB = function() {};
    levelB.prototype.calc = function(salary){
        return salary*2;
    }
    
    var Bonus = function(){
        this.salary = null;
        this.levelObj = null;
    }
    Bonus.prototype.setSalary = function(salary){
        this.salary = salary;
    }
    Bonus.prototype.setLevelObj = function(levelObj){
        this.levelObj = levelObj;
    }
    Bonus.prototype.getBonus = function() {
        return this.levelObj.calc(this.salary);
    }
    
    
    var bonus = new Bonus();
    bonus.setSalary(10000);
    bonus.setLevelObj(new levelS());
    bonus.getBonus();  
    
    
    // JS版本的策略模式
    var levelObj = {
        S:function(salary){
            return salary*4;   
        },
        A:function(salary){
            return salary*3
        },
        B:function(salary){
            return salary*2;
        }
    }
    
    var getBonus = function(level,salary){
        return levelObj[level](salary);
    }
    
    getBonus('S',10000);
```

## 利用策略模式实现动画效果，详情查看同目录下的html文件


通过html文件可以看出，我使用策略模式把具体缓动的算法传入动画类中，来达到各种不同的缓动效果,这些算法都可以轻易地被替换为另外一个算法，这是策略模式的经典运用之一。

## 再来一个实际项目中经常碰到的业务场景(表单提交)

很多时候我们在涉及到表单提交的验证时，都是这样的：

```javascript

    function submit(userName,mobile,password){
        if(!userName){
            alert('用户名不能为空')
            return false;
        }
        if(password.length<6){
            alert('密码长度不能少于6位');
            return false;
        }
        if(!/(^1[3\5\8][0-9]{9}$)/.test(mobile)){
            alert('手机号码格式不正确')
            return false;
        }
    }

```
这和最上面的那个计算年终奖的最初版本一样，缺乏弹性，函数庞大。。。

引入策略模式优化：

```javascript

    // 策略类
    var strategies = {
        isNonEmpty:function(value,errorMsg){
            if(!value){
                return errorMsg;
            }
        },
        minLength:function(value,length,errorMsg){
            if(value.length<length){
                return errorMsg;
            }
        },
        isMobile:function(value,errorMsg){
            if(!/(^1[3\5\8][0-9]{9}$)/.test(value)){
                return errorMsg
            }
        }
    }
    
    // 环境类
    var Validator = function(){
    this.cache = [];    //保存校验规则
    }
    Validator.prototype.add = function(value,rule,errorMsg) {
      var ary = rule.split(':');
      this.cache.push(function() {
        var strategy = ary.shift();
        ary.unshift(value);
        ary.push(errorMsg);
        return strategies[strategy].apply(null,ary)
      })
    }
    Validator.prototype.start = function(){
        for(var i = 0,validatorFunc;validatorFunc=this.cache[i++];){
            var msg = validatorFunc();
            if(msg){
                return msg;
            }
        }
    }
    
    // 具体实施
    var validataFunc = function(){
    var validator = new Validator();
    // 添加校验规则
    validator.add(userName,'isNonEmpty','用户名不能为空');
    validator.add(password,'minlength:6','密码长度不能小于6');
    validator.add(mobile,'isNonEmpty','手机号码格式不正确');
    
    var errorMsg = validator.start();
    
    return errorMsg; //返回校验结果
    }
    
    function submit(){
        var errorMsg = validataFunc();
        if(errorMsg){
            alert(errorMsg);
            return false;
        }
        //否则通过校验，开始表单提交...
    }

```

分享：`李超凡`

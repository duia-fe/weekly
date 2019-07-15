# React一些新特性
## 1.React.PureComponent
----
React.PureComponent 与 React.Component 很相似。两者的区别在于 React.Component 并未实现 [shouldComponentUpdate()][1]，而 React.PureComponent 中以***浅层***对比 prop 和 state 的方式来实现了该函数。
如果赋予 React 组件相同的 props 和 state，render() 函数会渲染相同的内容，那么在某些情况下使用 React.PureComponent 可通过减少重复渲染次数来提高性能。
 
 下面是一个名为Title的class组件，先用React.Component的方式定义并在APP.jsx作为子组件引入：
 ```javascript
    //Title组件
    class Title extends Component {
        render() {
            console.log('渲染一次我就打印一次')
            let { info } = this.props;
            return (
                <div className="title">
                    <h1>{info}</h1>
                </div>
            );
        }
    }

    //App组件
    class App extends Component {
        constructor(props) {
            super(props);
            this.state = {
                arr: [1]
            };
        }
        handleClick() {
        this.setState({}); //每点击一次就setState
    }
        render() {
            let { arr } = this.state;
            return (
                <div className="App" onClick={() => this.handleClick()}>
                    <Title info={arr.join('-')} />
                </div>
            );
        }
    }
```
运行之后可以发现每次点击其实传入Title的info属性并没有变化，但是观察控制台会发现一直在打印，说明每次点击都会让Title重复渲染一次；当把Title换成用React.PureComponent定义就会发现组件只会渲染一次了！！

> **注意：PureComponent中实现的shouldComponentUpdate仅做浅层次的比较，如果对象中包含复杂的数据结构或者比较的是引用数据类型，则有可能造成无法发现深层次的变化而产生错误的结果，所以仅在你的 props 和 state 较为简单时，才使用 React.PureComponent，或者在深层数据结构发生变化时调用[forceUpdate()][2] 来确保组件被正确地更新。你也可以考虑使用 [immutable 对象][3]加速嵌套数据的比较**。

----
## 2.React.memo
----
React.memo 为高阶组件。它与 React.PureComponent 功能非常相似，但它适用于函数组件，但不适用于 class 组件。如果将上面的Title组件用React.memo来定义的话写法如下：
```javascript
    const title = props => (
        <div className="title">
            <h1>{props.info}</h1>
        </div>
    )
```

默认情况下其只会对复杂对象做浅层对比，如果你想要控制对比过程，那么请将自定义的比较函数通过第二个参数传入来实现。
```javascript
    function MyComponent(props) {
    /* 使用 props 渲染 */
    }
    function areEqual(prevProps, nextProps) {
    /*
    如果把 nextProps 传入 render 方法的返回结果与
    将 prevProps 传入 render 方法的返回结果一致则返回 true，
    否则返回 false
    */
    }
    export default React.memo(MyComponent, areEqual);
```

> **此方法仅作为性能优化的方式而存在。但请不要依赖它来“阻止”渲染，因为这会产生 bug。**

------

## 3.动态 import() 语法 (代码分割)
----
基本写法：
    
```javascript
    //以前的写法
    /*import { add } from './math';
    console.log(add(16, 26));*/
    
    //动态import()
    import("./math").then(math => {
    console.log(math.add(16, 26));
    });
```
目前我们工作中所用的Create React App支持此写法，不用手动配置解析！

----
## 4.React.lazy && Suspense
----
React.lazy 函数能让你像渲染常规组件一样处理动态引入（的组件）,写法如下：

```javascript
    const OtherComponent = React.lazy(() => import('./OtherComponent'));

    function MyComponent() {
        return (
            <div>
                <OtherComponent />
            </div>
        );
    }
```
这个代码将会在渲染组件时，自动导入包含 OtherComponent 组件的包。
React.lazy 接受一个函数，这个函数需要动态调用 import()。它必须返回一个 Promise，该 Promise 需要 resolve 一个 defalut export 的 React 组件。

**Suspense**
很多时候我们都需要在组件加载未完成时通过显示加载动画来防止页面过于单调，这个时候就需要Suspense了

```javascript
    const OtherComponent = React.lazy(() => import('./OtherComponent'));

    function MyComponent() {
        return (
            <div>
                <Suspense fallback={<div>Loading...</div>}>
                    <OtherComponent />
                </Suspense>
            </div>
        );
    }
```
fallback 属性接受**任何**在组件加载过程中你想展示的 **React 元素**。你可以将 Suspense 组件置于懒加载组件之上的任何位置。

> **React.lazy 和 Suspense 技术还不支持服务端渲染。如果你想要在使用服务端渲染的应用中使用，我们推荐 [Loadable Components][4] 这个库。它有一个很棒的服务端渲染打包指南。**

**拓展：**
之前我们项目中的路由代码分割都是自己通过ES6的async函数来实现的，现在可以考虑更换成官方的写法了

```javascript
    import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
    import React, { Suspense, lazy } from 'react';

    const Home = lazy(() => import('./routes/Home'));
    const About = lazy(() => import('./routes/About'));

    const App = () => (
        <Router>
            <Suspense fallback={<div>Loading...</div>}>
                <Switch>
                    <Route exact path="/" component={Home}/>
                    <Route path="/about" component={About}/>
                </Switch>
            </Suspense>
        </Router>
    );
```
> **之前分享会上出现了莫名警告，现在还未解决，我有时间再研究一下，解决后再更新此文档**

分享：`李超凡`

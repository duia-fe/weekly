# React 源码剖析(三)

- ### render & hydrate
- ### setState

## render() & hydrate() 初始渲染

```js
ReactDOM.render(element, container, callback);

ReactDOM.hydrate(element, container, callback);
```

- element：元素节点，react 最终计算的结果
- container：容器，整个 react 渲染的 dom 都会在这个容器内
- callback：可选的回调函数，该回调将在组件被渲染或更新之后被执行

### render 和 hydrate 的区别

```js
// hydrate源码
export function hydrate(element: React$Node, container: Container, callback: ?Function) {
  invariant(isValidContainer(container), 'Target container is not a DOM element.');
  if (__DEV__) {
    const isModernRoot = isContainerMarkedAsRoot(container) && container._reactRootContainer === undefined;
    if (isModernRoot) {
      console.error(
        'You are calling ReactDOM.hydrate() on a container that was previously ' +
          'passed to ReactDOM.createRoot(). This is not supported. ' +
          'Did you mean to call createRoot(container, {hydrate: true}).render(element)?'
      );
    }
  }
  // TODO: throw or warn if we couldn't hydrate?
  return legacyRenderSubtreeIntoContainer(null, element, container, true, callback);
}
// render源码
export function render(element: React$Element<any>, container: Container, callback: ?Function) {
  invariant(isValidContainer(container), 'Target container is not a DOM element.');
  if (__DEV__) {
    const isModernRoot = isContainerMarkedAsRoot(container) && container._reactRootContainer === undefined;
    if (isModernRoot) {
      console.error(
        'You are calling ReactDOM.render() on a container that was previously ' +
          'passed to ReactDOM.createRoot(). This is not supported. ' +
          'Did you mean to call root.render(element)?'
      );
    }
  }
  return legacyRenderSubtreeIntoContainer(null, element, container, false, callback);
}
```

在代码上是体现不出区别的，`hydrate` 主要是在使用`ReactDOMServer（服务端渲染，组件静态标记）`体现，之所以要区别出来主要还是标记绑定事件监听器不同

`isModernRoot` 判断有没有容器节点，抛出错误

```js
function legacyRenderSubtreeIntoContainer(parentComponent: ?React$Component<any, any>, children: ReactNodeList, container: Container, forceHydrate: boolean, callback: ?Function) {
  // 判断有没有react元素 是不是第一次
  let root: RootType = (container._reactRootContainer: any);
  if (!root) {
    // 首次调用
  } else {
    // 此步骤只会通过虚拟dom计算更新
  }
}
```

当首次调用时，容器节点里的所有 `DOM` 元素都会被替换，后续的调用则会使用 `React` 的 `DOM` 差分算法（DOM diffing algorithm）进行高效的更新。

### 首次调用

```js
//从 DOM 容器创建根目录
function legacyCreateRootFromDOMContainer(container: Container, forceHydrate: boolean): RootType {
  const shouldHydrate = forceHydrate || shouldHydrateDueToLegacyHeuristic(container);
  if (!shouldHydrate) {
    while ((rootSibling = container.lastChild)) {
      container.removeChild(rootSibling);
    }
  }

  return createLegacyRoot(
    container,
    shouldHydrate
      ? {
          hydrate: true
        }
      : undefined
  );
}
```

```js
export function createLegacyRoot(container: Container, options?: RootOptions): RootType {
  return new ReactDOMBlockingRoot(container, LegacyRoot, options);
}

ReactDOMRoot.prototype.unmount = ReactDOMBlockingRoot.prototype.unmount = function () {
  var root = this._internalRoot;
  var container = root.containerInfo;
  updateContainer(null, root, null, function () {
    unmarkContainerAsRoot(container);
  });
};
ReactDOMRoot.prototype.render = ReactDOMBlockingRoot.prototype.render = function (children: ReactNodeList): void {
  const root = this._internalRoot;
  var container = root.containerInfo;
  updateContainer(null, root, null, function () {
    unmarkContainerAsRoot(container);
  });
};
```

`legacyCreateRootFromDOMContainer` 就是把 `root dom`， `container` 内的其余节点清空创建一个 `new ReactRoot` 实例，最终执行的 `root.render` 就是 `new ReactDOMRoot` 的原型方法 `ReactDOMRoot.prototype.render`

- 在创建根目录的时候首先要清空其他节点
- `shouldHydrateDueToLegacyHeuristic` 判断容器有没有 `react` 根元素
- 然后通过 `while` 循环 删除所有的子节点
- `createLegacyRoot` 创建方法（具体实现方法暂定）

### 非首次调用

```js
fiberRoot = root._internalRoot;
updateContainer(children, fiberRoot, parentComponent, callback);
```

直接获取根元素进行计算更新

### callback 回调

```js
if (typeof callback === 'function') {
  const originalCallback = callback;
  callback = function () {
    const instance = getPublicRootInstance(fiberRoot);
    originalCallback.call(instance);
  };
}
```

`getPublicRootInstance()` 获取公共的实例

### 更新 Container

```js
// 释放更新
function unbatchedUpdates() {}

export function updateContainer(element: ReactNodeList, container: OpaqueRoot, parentComponent: ?React$Component<any, any>, callback: ?Function): Lane {
  const suspenseConfig = requestCurrentSuspenseConfig();
  const lane = requestUpdateLane(current, suspenseConfig);

  const context = getContextForSubtree(parentComponent);
  const update = createUpdate(eventTime, lane, suspenseConfig);

  enqueueUpdate(current, update);
  scheduleUpdateOnFiber(current, lane);
}
```

```js
export function unbatchedUpdates<A, R>(fn: (a: A) => R, a: A): R {
  // 暂存当前执行栈
  const prevExecutionContext = executionContext;、
  // 更改执行栈
  executionContext &= ~BatchedContext;
  executionContext |= LegacyUnbatchedContext;
  // 最后通过 "|=" 将当前的执行栈更改为 "LegacyUnbatchedContext"
  try {
    // 回调就是updateContainer
    return fn(a);
  } finally {
    // 在执行完回调之后，会恢复执行栈
    executionContext = prevExecutionContext;
    if (executionContext === NoContext) {
      // 刷新此批处理中计划的立即回调
      flushSyncCallbackQueue();
    }
  }
  }
}

```

在 `updateContainer()` 中

- 使用 `createUpdate` 创建 `update` 来标记 `react` 需要更新的点
- 设置完 `update` 属性再调用 `enqueueUpdate` 把 `update` 放入更新队列里,`react` 更新会在一个节点上整体进行很多个更新，这个更新 `queue` 就是管理多次更新的作用
- 最后执行 `scheduleWork` 通知 `react` 进行调度，根据任务的优先级进行更新

```js
var scheduleWork = scheduleUpdateOnFiber;

export function scheduleUpdateOnFiber(fiber: Fiber, lane: Lane) { {}
```

### FiberRoot

- 整个应用的起点
- 包含了传入的 `getElementById(root)`
- 记录整个应用更新过程的各种信息 `containerInfo` (包含了 `root` 节点等信息)

### FiberRoot 对象结构

> `FiberRoot` 是 `ReactRoot` 生成实例时调用 react-reconcile 模块的 createContainer 传入 getElementById(root) 执行 createFiberRoot 生成一个 FiberRoot 对象挂载到实例的 \_internalRoot

```js
export function createFiberRoot(containerInfo: any, tag: RootTag, hydrate: boolean, hydrationCallbacks: null | SuspenseHydrationCallbacks): FiberRoot {
  const root: FiberRoot = (new FiberRootNode(containerInfo, tag, hydrate): any);
  if (enableSuspenseCallback) {
    root.hydrationCallbacks = hydrationCallbacks;
  }

  // Cyclic construction. This cheats the type system right now because
  // stateNode is any.
  const uninitializedFiber = createHostRootFiber(tag);
  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;

  initializeUpdateQueue(uninitializedFiber);

  return root;
}
```

### Fiber

- `FiberRoot.current` 就是一个 `Fiber` 对象
- 每一个 `ReactElement` 对应一个 `Fiber` 对象
- 记录节点的各种状态 `class` 组件的 `this.state`、`this.props` ，在 `Fiber` 更新后才会更新 `class` 组件上的 `this.state`, `props`，是 `hooks` 实现的原理，`function` 组件是没有 `this.state` `this.props` 的，`Fiber` 有能力记录这些状态之后在 `function` 组件更新后拿到这些状态。
- 串联整个应用形成的树结构

### Fiber 的数据结构

`FiberNode` 有三个属性 `return、child、sibling`, 分别代表此 `Fiber` 对象的父节点，第一个子节点，自己的兄弟节点

```js
function FiberNode(tag: WorkTag, pendingProps: mixed, key: null | string, mode: TypeOfMode) {
  // Instance
  this.tag = tag; // 标记不同的组件类型，不同的更新方式
  this.key = key; // key
  this.elementType = null; // createElement 第一个参数，组件 或者 标签
  this.type = null; //  记录异步组件 resolved 后是 class 还是 function 组件
  this.stateNode = null; // 节点的实例，对应 class 组件或者 dom 节点，function 没有实例就没 stateNode

  // Fiber
  this.return = null; // 父亲节点
  this.child = null; // 第一个子节点
  this.sibling = null; // 自己的下一个兄弟节点
  this.index = 0;

  this.ref = null; // ref

  this.pendingProps = pendingProps; // 每个创建的新 props
  this.memoizedProps = null; // 老 props
  this.updateQueue = null; // 节点创建的 update 对象 queue
  this.memoizedState = null; // 老 state，新 state 是由 updateQueue 计算出来的然后覆盖这里
  this.firstContextDependency = null; // context 相关

  this.mode = mode; // 标记时创建，继承父节点 mod

  // Effects 副作用
  this.effectTag = NoEffect;
  this.nextEffect = null;

  this.firstEffect = null;
  this.lastEffect = null;

  this.expirationTime = NoWork; // 任务的过期时间
  this.childExpirationTime = NoWork; // 子节点更新的过期时间

  this.alternate = null; // Fiber 用来复制复用 Fiber 的。

  if (enableProfilerTimer) {
    this.actualDuration = 0;
    this.actualStartTime = -1;
    this.selfBaseDuration = 0;
    this.treeBaseDuration = 0;
  }
}
```

### ReactElement 对应的结构

![Image text](./1.png)

## setState

- 给节点的 Fiber 创建更新
- 更新的类型不同

### source

都是 `Component` 组件上的原型方法, 他们调用的 `enqueueSetState` 等方法都是由不同平台创建的 `updater` 对象上的，浏览器中的 updater 对象来自 `/packages/react-reconciler/src/ReactFiberClassComponent.new.js` 里的 `classComponentUpdater` 对象上

```js
function Component(props, context, updater) {
  this.props = props;
  this.context = context;
  // If a component has string refs, we will assign a different object later.
  this.refs = emptyObject;
  // We initialize the default updater but the real one gets injected by the
  // renderer.
  this.updater = updater || ReactNoopUpdateQueue;
}

Component.prototype.setState = function (partialState, callback) {
  // 仅仅调用了 updater 上的方法 updater 是初始化的第三个参数的实例属性，跟平台相关
  this.updater.enqueueSetState(this, partialState, callback, 'setState');
};
```

在这里 调用了 `this.updater` 中的 `enqueueSetState`,看着名字就知道这是一个 `setState` 的队列,

```js
this.updater = updater || ReactNoopUpdateQueue;
```

默认的初始值，真正的值其实就在 renderer 的时候注入进来的

### classComponentUpdater

- `enqueueSetState`, `enqueueForceUpdate` 几乎是相同的，在这里我们只看 `enqueueSetState`
- 发现 `enqueueSetState` 所执行的顺序跟 `ReactFiberReconclier.js` 的 `updateContainer` 几乎是一模一样的

```js
const classComponentUpdater = {
  isMounted,
  enqueueSetState(inst, payload, callback) {
    const fiber = ReactInstanceMap.get(inst); // 从 Map 对象中获取 Fiber 对象
    const currentTime = requestCurrentTime(); // 创建当前时间
    const expirationTime = computeExpirationForFiber(currentTime, fiber); // 优先级时间

    const update = createUpdate(expirationTime); // 创建 update
    update.payload = payload; // 设置payload
    if (callback !== undefined && callback !== null) {
      update.callback = callback; // 执行回调
    }

    enqueueUpdate(fiber, update); // 把 update 对象推入 Fiber 对象的 updateQueue 内
    scheduleWork(fiber, expirationTime); // 进行调度
  },
  enqueueReplaceState(inst, payload, callback) {
    // ...
  },
  enqueueForceUpdate(inst, callback) {
    // ...
  }
};
```

总结一下：这个 `setState` 其实什么都没做，它只是简单的把这个 `update` 操作装入了一个队列里

### updater 对象

```js
const updater = {
  isMounted: function (publicInstance) {
    return false;
  },
  enqueueForceUpdate: function (publicInstance) {
    if (queue === null) {
      warnNoop(publicInstance, 'forceUpdate');
      return null;
    }
  },
  enqueueReplaceState: function (publicInstance, completeState) {
    replace = true;
    queue = [completeState];
  },
  enqueueSetState: function (publicInstance, currentPartialState) {
    if (queue === null) {
      warnNoop(publicInstance, 'setState');
      return null;
    }
    queue.push(currentPartialState);
  }
};
```

`queue` 这是 `react` 提升性能的关键。并不是每次调用 `setState` `react` 都立马去更新了，而是每次调用 `setState`， `react` 只是 push 到了待更新的 `queue` 中, 下面是对这个 `queue` 的处理

```js
if (queue.length) {
  const oldQueue = queue;
  const oldReplace = replace;
  queue = null;
  replace = false;
  // 队列里面，只有一个，直接更换
  if (oldReplace && oldQueue.length === 1) {
    inst.state = oldQueue[0];
  } else {
    // 队列里面有好几个,先进行合并，再更新
    let nextState = oldReplace ? oldQueue[0] : inst.state;
    let dontMutate = true;
    for (let i = oldReplace ? 1 : 0; i < oldQueue.length; i++) {
      const partial = oldQueue[i];
      const partialState = typeof partial === 'function' ? partial.call(inst, nextState, element.props, publicContext) : partial;
      // 这里合并,新的是nextState
      if (partialState != null) {
        if (dontMutate) {
          dontMutate = false;
          nextState = Object.assign({}, nextState, partialState);
        } else {
          Object.assign(nextState, partialState);
        }
      }
    }
    //最后赋值给实例
    inst.state = nextState;
  }
} else {
  queue = null;
}
```

### 调用示例 render

```js
child = inst.render();
```

### 更新过程中会调用的生命周期

- componentWillReceiveProps (nextProps) ----- getDerivedStateFromProps(nextProps, prevState)
- shouldComponentUpdate(nextProps,nextState)
- componentWillUpdate (nextProps,nextState) ----- getSnapshotBeforeUpdate(prevProps, prevState)
- componentDidUpdate(prevProps,prevState)
- render()

by:`邓伟`

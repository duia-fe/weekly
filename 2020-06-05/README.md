# React 源码剖析(四)

## hooks 简略开始

- 在React.js中可以看到Hooks导入的代码：

```js
import {
  useCallback,
  useContext,
  useEffect,
  useImperativeMethods,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from './ReactHooks';
```
ReactHooks中会有上面的api:
```js
function resolveDispatcher() {
  const dispatcher = ReactCurrentOwner.currentDispatcher;
  return dispatcher;
}

export function useState<S>(initialState: (() => S) | S) {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}

export function useEffect(
  create: () => mixed,
  inputs: Array<mixed> | void | null,
) {
  const dispatcher = resolveDispatcher();
  return dispatcher.useEffect(create, inputs);
}

export function useContext<T>(
  Context: ReactContext<T>,
  observedBits: number | boolean | void,
) {
  const dispatcher = resolveDispatcher();
  // dev code
  return dispatcher.useContext(Context, observedBits);
}
```
Hooks跟其他React的API一样，只管定义，不管实现。他们都调用了ReactCurrentOwner.currentDispatcher.xxx对应的方法。那么这个ReactCurrentOwner.currentDispatcher是啥呢？

其实react在执行 `renderRoot` 开始渲染的时候，我们会设置这个值。
```js
import {Dispatcher} from './ReactFiberHooks';
if (enableHooks) {
  ReactCurrentOwner.currentDispatcher = Dispatcher;
}
```
- 同时在渲染完成离开 `renderRoot` 的时候设置为null.
- 那么这个 `Dispatcher` 又是什么？
```js
// ReactFiberHooks.js
export const Dispatcher = {
  readContext,
  useCallback,
  useContext,
  useEffect,
  useImperativeMethods,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
};
```
- 原来这里面就是HOOKS源头方法。

- 这里面涉及到队列调度这一块。hooks的执行的机制。等下一次或者下一个队友的分享吧，我实在没分析不下去了。

-   ### hooks:useState & useReducer

## useState

-   首先我们来看一下 useState 的使用。

```js
const [state, setState] = React.useState(0);
//直接赋值
setState(1); //1
//方法赋值
setState((prevState) => {
    return 1; //1
});
```

-   当我们的代码执行到了 useState 的时候，他到底做了什么呢？

```js
function basicStateReducer<S>(state: S, action: BasicStateAction<S>): S {
    return typeof action === 'function' ? action(state) : action;
}
export function useState<S>(initialState: (() => S) | S): [S, Dispatch<BasicStateAction<S>>] {
    if (__DEV__) {
        currentHookNameInDev = 'useState';
    }
    return useReducer(basicStateReducer, (initialState: any));
}
```

-   这里他直接调用了"useReducer"，可见 useState 不过就是个语法糖，本质其实就是 useReducer，那么 useReducer 具体做了什么呢？

## useReducer

-- 那么我们来看一下 useReducer 的使用:

```js
const initialState = { count: 0 };

function reducer(state, action) {
    switch (action.type) {
        case 'increment':
            return { count: state.count + 1 };
        case 'decrement':
            return { count: state.count - 1 };
        default:
            throw new Error();
    }
}
function init(initialCount) {
    return { ...initialCount, b: 1 };
}
const [state, dispatch] = React.useReducer(reducer, { count: 0 }, init);

const [state, dispatch] = React.useReducer(reducer, { count: 0 });

dispatch({ type: 'increment' });
```

-   ### useReducer 的源码

```js
export function useReducer<S, I, A>(reducer: (S, A) => S, initialArg: I, init?: (I) => S): [S, Dispatch<A>] {
    currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
    workInProgressHook = createWorkInProgressHook();
    //这两句代码是做一个第一次渲染和更新的，workInProgressHook 存在则更新，否则是第一次渲染。
    if (isReRender) {
        //这里判断首次渲染，isReRender是运行createWorkInProgressHook()改变该值的。为false即第一次渲染
        const queue: UpdateQueue<A> = (workInProgressHook.queue: any);
        const dispatch: Dispatch<A> = (queue.dispatch: any);
        if (renderPhaseUpdates !== null) {
            // Render phase updates are stored in a map of queue -> linked list
            const firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
            if (firstRenderPhaseUpdate !== undefined) {
                renderPhaseUpdates.delete(queue);
                let newState = workInProgressHook.memoizedState;
                let update = firstRenderPhaseUpdate;
                do {
                    // Process this render phase update. We don't have to check the
                    // priority because it will always be the same as the current
                    // render's.
                    const action = update.action;
                    if (__DEV__) {
                        isInHookUserCodeInDev = true;
                    }
                    newState = reducer(newState, action);
                    if (__DEV__) {
                        isInHookUserCodeInDev = false;
                    }
                    update = update.next;
                } while (update !== null);

                workInProgressHook.memoizedState = newState;

                return [newState, dispatch];
            }
        }
        return [workInProgressHook.memoizedState, dispatch];
    } else {
        let initialState;
        // 这里判断是否为useState调用。
        if (reducer === basicStateReducer) {
            initialState = typeof initialArg === 'function' ? ((initialArg: any): () => S)() : ((initialArg: any): S);
        } else {
            initialState = init !== undefined ? init(initialArg) : ((initialArg: any): S);
        }
        workInProgressHook.memoizedState = initialState;
        //这里关键部位Dispatch的生成调用dispatchAction。
        const queue: UpdateQueue<A> = (workInProgressHook.queue = {
            last: null,
            dispatch: null,
        });
        //这里看到queue的结构非常简单，只有一个last指针和dispatch，dispatch是用来记录更新state的方法的，接下去我们就要创建dispatch方法了
        const dispatch: Dispatch<A> = (queue.dispatch = (dispatchAction.bind(null, currentlyRenderingComponent, queue): any));

        return [workInProgressHook.memoizedState, dispatch];
    }
}
```

-   最后直接把 workInProgressHook.memoizedState 和 dispatch 返回给 useReducer。

### dispatch 是怎么去更改 state 的值并让其刷新的呢？

## dispatchAction

```js
function dispatchAction<A>(fiber: Fiber, queue: UpdateQueue<A>, action: A) {
    const alternate = fiber.alternate;
    if (fiber === currentlyRenderingFiber || (alternate !== null && alternate === currentlyRenderingFiber)) {
        //这其实就是判断这个更新是否是在渲染过程中产生的，currentlyRenderingFiber只有在FunctionalComponent更新的过程中才会被设置，在离开更新的时候设置为null，所以只要存在并更产生更新的Fiber相等，说明这个更新是在当前渲染中产生的，则这是一次reRender。
        didScheduleRenderPhaseUpdate = true;
        const update: Update<S, A> = {
            expirationTime: renderExpirationTime,
            action,
            eagerReducer: null,
            eagerState: null,
            next: null,
        };
        if (renderPhaseUpdates === null) {
            renderPhaseUpdates = new Map();
        }
        const firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
        if (firstRenderPhaseUpdate === undefined) {
            renderPhaseUpdates.set(queue, update);
        } else {
            // Append the update to the end of the list.
            let lastRenderPhaseUpdate = firstRenderPhaseUpdate;
            while (lastRenderPhaseUpdate.next !== null) {
                lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
            }
            lastRenderPhaseUpdate.next = update;
        }
    } else {
        flushPassiveEffects();

        const currentTime = requestCurrentTime();
        const expirationTime = computeExpirationForFiber(currentTime, fiber);

        const update: Update<S, A> = {
            expirationTime,
            action,
            eagerReducer: null,
            eagerState: null,
            next: null,
        };

        //将更新追加到列表的末尾。
        const last = queue.last;
        if (last === null) {
            //这是第一次更新。创建循环列表。
            update.next = update;
        } else {
            const first = last.next;
            if (first !== null) {
                update.next = first;
            }
            last.next = update;
        }
        queue.last = update;

        if (fiber.expirationTime === NoWork && (alternate === null || alternate.expirationTime === NoWork)) {
            //队列当前为空，这意味着我们可以急切地计算
            const lastRenderedReducer = queue.lastRenderedReducer;
            if (lastRenderedReducer !== null) {
                let prevDispatcher;
                try {
                    const currentState: S = (queue.lastRenderedState: any);
                    const eagerState = lastRenderedReducer(currentState, action);
                    // Stash the eagerly computed state, and the reducer used to compute
                    // it, on the update object. If the reducer hasn't changed by the
                    // time we enter the render phase, then the eager state can be used
                    // without calling the reducer again.
                    update.eagerReducer = lastRenderedReducer;
                    update.eagerState = eagerState;
                    if (is(eagerState, currentState)) {
                        // Fast path. We can bail out without scheduling React to re-render.
                        // It's still possible that we'll need to rebase this update later,
                        // if the component re-renders for a different reason and by that
                        // time the reducer has changed.
                        return;
                    }
                } catch (error) {
                    // Suppress the error. It will throw again in the render phase.
                } 
            }
        }
        scheduleWork(fiber, expirationTime);
    }
}
```
- 最后执行调度的函数scheduleWork；

来源:`https://react.jokcy.me/`;

by:`徐旺`

# Echarts源码结构浅析

- ### echarts构造函数
ZRender 是二维绘图引擎，它提供 Canvas、SVG、VML 等多种渲染方式。ZRender 也是 ECharts 的渲染器。
官网的总体结构图

![Image text](./zrender.png)

MVC结构分别在Stroage、Painter、Handler。
* Stroage(M) : shape数据CURD管理
* Painter(V) : canvase元素生命周期管理，视图渲染，绘画，更新控制
* Handler(C) : 事件交互处理
* shape : 图形实体
* tool : 绘画扩展相关实用方法，工具及脚手架
* animation : 动画扩展，提供promise式的动画接口和常用缓动函数

### 初始化
不让外部直接new ZRender进行初始化，init调用即可，提供全局可控同时减少全局污染和降低命名冲突的风险。
```js
var instances = {};    // ZRender实例map索引
/**
 * 初始化zrender实例
 * @param {HTMLElement} dom ZRender 容器，在调用该方法时，应该已有宽度和高度。
 * @param {Object} [opts] 配置项
 * @param {string} [opts.renderer='canvas'] 渲染方式 'canvas' or 'svg' 
 * @param {number} [opts.devicePixelRatio] 画布大小与容器大小之比，仅当 renderer 为 'canvas' 时有效。
 * @param {number|string} [opts.width] 画布宽度，设为 'auto' 则根据 devicePixelRatio 与容器宽度自动计算。
 * @param {number|string} [opts.height] 画布高度，设为 'auto' 则根据 devicePixelRatio 与容器高度自动计算。
 * @return {module:zrender/ZRender}
 */
function init(dom, opts) {
    var zr = new ZRender(guid(), dom, opts);
    instances[zr.id] = zr;
    return zr;
}
```
### zrender.dispose(zr) 销毁 ZRender 实例
```js 
/**
 * Dispose zrender instance
 * @param {module:zrender/ZRender} zr ZRender 实例，由 zrender.init 创建。
 */
function dispose(zr) {
    if (zr) {
        zr.dispose();
    }
    else {  //不传则销毁全部。
        for (var key in instances) {
            if (instances.hasOwnProperty(key)) {
                instances[key].dispose();
            }
        }
        instances = {};
    }

    return this;
}
```
也可直接通过zr.dispose()自己销毁

## zrender 构造函数
```js 
/**
 * @constructor
 * @alias module:zrender/ZRender
 * @param {string} id
 * @param {HTMLElement} dom
 * @param {Object} opts
 * @param {string} [opts.renderer='canvas'] 'canvas' or 'svg'
 * @param {number} [opts.devicePixelRatio]
 * @param {number} [opts.width] Can be 'auto' (the same as null/undefined)
 * @param {number} [opts.height] Can be 'auto' (the same as null/undefined)
 */
var ZRender = function (id, dom, opts) {

    opts = opts || {};

    /**
     * @type {HTMLDomElement}
     */
    this.dom = dom;

    /**
     * @type {string}
     */
    this.id = id;

    var self = this;
    var storage = new Storage();

    var rendererType = opts.renderer;
    // TODO WebGL 
    if (useVML) {  // ie8 不支持canvas ，使用vml
        if (!painterCtors.vml) {
            throw new Error('You need to require \'zrender/vml/vml\' to support IE8');
        }
        rendererType = 'vml';
    }
    else if (!rendererType || !painterCtors[rendererType]) {
        rendererType = 'canvas';
    }
    var painter = new painterCtors[rendererType](dom, storage, opts, id);
    this.storage = storage;//M
    this.painter = painter;//V

    var handerProxy = (!env$1.node && !env$1.worker) ? new HandlerDomProxy(painter.getViewportRoot(), painter.root) : null;
    this.handler = new Handler(storage, painter, handerProxy, painter.root); //C

    /**
     * 动画控制
     * @type {module:zrender/animation/Animation}
     */
    this.animation = new Animation({
        stage: {
            update: bind(this.flush, this)
        }
    });
    this.animation.start();

    /**
     * @type {boolean}
     * @private
     */
    this._needsRefresh;

    // 修改 storage.delFromStorage, 每次删除元素之前删除动画
    // FIXME 有点ugly
    var oldDelFromStorage = storage.delFromStorage;
    var oldAddToStorage = storage.addToStorage;

    storage.delFromStorage = function (el) {
        oldDelFromStorage.call(storage, el);

        el && el.removeSelfFromZr(self);
    };

    storage.addToStorage = function (el) {
        oldAddToStorage.call(storage, el);

        el.addSelfToZr(self);
    };
};
```
- Storage只是JS对象级别的对于Shape图形的增(add/addHover)删(del,delHover)改(mod)查(get/iterShape/getMaxZlevel等)，更像一个数据结构的东西
- Painter负责真正的绘图操作，这里是比较繁重的部分

  1. 负责canvas及其周边DOM元素的创建与处理
  2. 负责调用各个Shape（预定义好的）进行绘制
  3. 提供基本的操作方法，渲染(render)、刷新(refresh)、尺寸变化(resize)、擦除(clear)等
  Painter是调用canvas API实现的绘制,包括颜色，渐变色，变换，矩阵变化，绘制图片、文本等。

- Handler负责事件处理，解决基础的浏览器兼容问题、进行事件的注册与转发、拖动

storage内容仓库(M)部分代码

这是个典型的JS创建对象的结构, var Storage = function () {}; Storage.prototype={add:function(){}};方法附加在protype上，属性写在构造函数里，每个附加到prototype的方法都返回this，支持链式调用
```js
/**
 * 将元素存储在this._roots（数组）和this._displayList（数组）中，然后负责在其中进行增（addRoot，addToMap）删(delRoot,delFromMap)改（updateDisplayList）查（get，getDisplayList）。
 * @alias module:zrender/Storage
 * @constructor
 */
var Storage = function () { // jshint ignore:line
    this._roots = [];

    this._displayList = [];

    this._displayListLen = 0;
};
Storage.prototype ={
  ...
      /**
     * 添加图形(Shape)或者组(Group)到根节点
     * @param {module:zrender/Element} el
     */
    addRoot: function (el) {
        if (el.__storage === this) {
            return;
        }

        if (el instanceof Group) {
          // Group是一个容器，可以插入子节点，Group的变换也会被应用到子节点上
          /**
          *   @example
          *     var Group = require('zrender/container/Group');
          *     var Circle = require('zrender/graphic/shape/Circle');
          *     var g = new Group();
          *     g.position[0] = 100;
          *     g.position[1] = 100;
          *     g.add(new Circle({
          *         style: {
          *             x: 100,
          *             y: 100,
          *             r: 20,
          *         }
          *     }));
          *     zr.add(g);
          */
          
            el.addChildrenToStorage(this);
        }

        this.addToStorage(el);
        this._roots.push(el);
    },
  ...
}
```
## zrender之设计模式
   以发布订阅模式为例，将发布-订阅的功能提取出来，放在mixin/Eventful内，包括一下几种方法
   - one 一次绑定事件
   - on 绑定事件
   - isSilent 是否绑定了事件
   - off 解绑事件
   - trigger 事件分发，触发事件
   - triggerWithContext 带有context的事件分发
```javascript
Eventful.prototype = {

    constructor: Eventful,

    /**
     * The handler can only be triggered once, then removed.
     *
     * @param {string} event The event name.
     * @param {string|Object} [query] Condition used on event filter.
     * @param {Function} handler The event handler.
     * @param {Object} context
     */
    one: function (event, query, handler, context) {
        return on(this, event, query, handler, context, true);
    },

    /**
     * Bind a handler.
     *
     * @param {string} event The event name.
     * @param {string|Object} [query] Condition used on event filter.
     * @param {Function} handler The event handler.
     * @param {Object} [context]
     */
    on: function (event, query, handler, context) {
        return on(this, event, query, handler, context, false);
    },

    /**
     * Whether any handler has bound.
     *
     * @param  {string}  event
     * @return {boolean}
     */
    isSilent: function (event) {
        var _h = this._$handlers;
        return !_h[event] || !_h[event].length;
    },

    /**
     * Unbind a event.
     *
     * @param {string} [event] The event name.
     *        If no `event` input, "off" all listeners.
     * @param {Function} [handler] The event handler.
     *        If no `handler` input, "off" all listeners of the `event`.
     */
    off: function (event, handler) {
        var _h = this._$handlers;

        if (!event) {
            this._$handlers = {};
            return this;
        }

        if (handler) {
            if (_h[event]) {
                var newList = [];
                for (var i = 0, l = _h[event].length; i < l; i++) {
                    if (_h[event][i].h !== handler) {
                        newList.push(_h[event][i]);
                    }
                }
                _h[event] = newList;
            }

            if (_h[event] && _h[event].length === 0) {
                delete _h[event];
            }
        }
        else {
            delete _h[event];
        }

        return this;
    },

    /**
     * Dispatch a event.
     *
     * @param {string} type The event name.
     */
    trigger: function (type) {
        var _h = this._$handlers[type];
        var eventProcessor = this._$eventProcessor;

        if (_h) {
            var args = arguments;
            var argLen = args.length;

            if (argLen > 3) {
                args = arrySlice.call(args, 1);
            }

            var len = _h.length;
            for (var i = 0; i < len;) {
                var hItem = _h[i];
                if (eventProcessor
                    && eventProcessor.filter
                    && hItem.query != null
                    && !eventProcessor.filter(type, hItem.query)
                ) {
                    i++;
                    continue;
                }

                // Optimize advise from backbone
                switch (argLen) {
                    case 1:
                        hItem.h.call(hItem.ctx);
                        break;
                    case 2:
                        hItem.h.call(hItem.ctx, args[1]);
                        break;
                    case 3:
                        hItem.h.call(hItem.ctx, args[1], args[2]);
                        break;
                    default:
                        // have more than 2 given arguments
                        hItem.h.apply(hItem.ctx, args);
                        break;
                }

                if (hItem.one) {
                    _h.splice(i, 1);
                    len--;
                }
                else {
                    i++;
                }
            }
        }

        eventProcessor && eventProcessor.afterTrigger
            && eventProcessor.afterTrigger(type);

        return this;
    },

    /**
     * Dispatch a event with context, which is specified at the last parameter.
     *
     * @param {string} type The event name.
     */
    triggerWithContext: function (type) {
        var _h = this._$handlers[type];
        var eventProcessor = this._$eventProcessor;

        if (_h) {
            var args = arguments;
            var argLen = args.length;

            if (argLen > 4) {
                args = arrySlice.call(args, 1, args.length - 1);
            }
            var ctx = args[args.length - 1];

            var len = _h.length;
            for (var i = 0; i < len;) {
                var hItem = _h[i];
                if (eventProcessor
                    && eventProcessor.filter
                    && hItem.query != null
                    && !eventProcessor.filter(type, hItem.query)
                ) {
                    i++;
                    continue;
                }

                // Optimize advise from backbone
                switch (argLen) {
                    case 1:
                        hItem.h.call(ctx);
                        break;
                    case 2:
                        hItem.h.call(ctx, args[1]);
                        break;
                    case 3:
                        hItem.h.call(ctx, args[1], args[2]);
                        break;
                    default:
                        // have more than 2 given arguments
                        hItem.h.apply(ctx, args);
                        break;
                }

                if (hItem.one) {
                    _h.splice(i, 1);
                    len--;
                }
                else {
                    i++;
                }
            }
        }

        eventProcessor && eventProcessor.afterTrigger
            && eventProcessor.afterTrigger(type);

        return this;
    }
};
```
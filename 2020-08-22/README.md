# Echarts源码结构浅析

> 前言：Echarts底层渲染器是zRender，核心绘图功能均在zRender中，本文旨在分析Echarts对于zRender的二次封装，重点查看封装思路以及代码结构

直接查看src目录下的echarts.js
```javascript
    /**
     * @param {HTMLElement} dom
     * @param {Object} [theme] 主题（配色）
     * @param {Object} opts 初始化配置项
     * @param {number} [opts.devicePixelRatio] 物理像素分辨率与CSS像素分辨率之比,默认值为window.devicePixelRatio
     * @param {string} [opts.renderer] 渲染方式，接受'canvas' 或者 'svg'
     * @param {number} [opts.width] 绘制区域的高度，默认为目标dom的clientWidth
     * @param {number} [opts.height] 绘制区域的高度，默认为目标dom的clientHeight
     */
    export function init(dom, theme, opts) {
        if (__DEV__) {
            // 检查版本
            if ((zrender.version.replace('.', '') - 0) < (dependencies.zrender.replace('.', '') - 0)) {
                throw new Error(
                    'zrender/src ' + zrender.version
                    + ' is too old for ECharts ' + version
                    + '. Current version need ZRender '
                    + dependencies.zrender + '+'
                );
            }
            if (!dom) {
                // dom不存在，初始化失败
                throw new Error('Initialize failed: invalid dom.');
            }
        }
        var existInstance = getInstanceByDom(dom); //获取该dom上绑定的echarts实例
        if (existInstance) {
            // 如果存在就直接返回该实例对象并且发出警告
            if (__DEV__) {
                console.warn('There is a chart instance already initialized on the dom.');
            }
            return existInstance;
        }
        if (__DEV__) {
            // dom获取到了，但是没有获取到绘制高度和宽度
            if (zrUtil.isDom(dom)
                && dom.nodeName.toUpperCase() !== 'CANVAS'
                && (
                    (!dom.clientWidth && (!opts || opts.width == null))
                    || (!dom.clientHeight && (!opts || opts.height == null))
                )
            ) {
                console.warn('Can\'t get DOM width or height. Please check '
                + 'dom.clientWidth and dom.clientHeight. They should not be 0.'
                + 'For example, you may need to call this in the callback '
                + 'of window.onload.');
            }
        }
        var chart = new ECharts(dom, theme, opts); //Echarts实例化对象
        chart.id = 'ec_' + idBase++; //此次实例化对象的标识码id
        instances[chart.id] = chart; //每次实例化后将实例对象存入容器中
        modelUtil.setAttribute(dom, DOM_ATTRIBUTE_KEY, chart.id);//给选定的dom添加属性
        enableConnect(chart); //启动链接,处理状态
        return chart; //返回实例化的echarts对象
    }
    
    function enableConnect(chart) {
        var STATUS_PENDING = 0;
        var STATUS_UPDATING = 1;
        var STATUS_UPDATED = 2;
        var STATUS_KEY = '__connectUpdateStatus';
    
        function updateConnectedChartsStatus(charts, status) {
            // 遍历更新所有的echarts实例对象的__connectUpdateStatus状态
            for (var i = 0; i < charts.length; i++) {
                var otherChart = charts[i];
                otherChart[STATUS_KEY] = status; 
            }
        }
        //eventActionMap是个event--action的字典
        each(eventActionMap, function (actionType, eventType) {
            // 遍历字典重新绑定已存在的事件
            chart._messageCenter.on(eventType, function (event) {
                // 如果该实例对象的链接状态不是pending状态
                if (connectedGroups[chart.group] && chart[STATUS_KEY] !== STATUS_PENDING) {
                    if (event && event.escapeConnect) {
                        // 如果是脱离链接的事件则跳过
                        return;
                    }
                    var action = chart.makeActionFromEvent(event);
                    var otherCharts = [];
                    each(instances, function (otherChart) {
                        // 找出和当前实例对象处于同一group的其他实例对象并存放进数组
                        if (otherChart !== chart && otherChart.group === chart.group) {
                            otherCharts.push(otherChart);
                        }
                    });
                    updateConnectedChartsStatus(otherCharts, STATUS_PENDING); //更新数组中的实例对象的链接状态为pending
                    each(otherCharts, function (otherChart) {
                        if (otherChart[STATUS_KEY] !== STATUS_UPDATING) {
                            otherChart.dispatchAction(action);
                        }
                    });
                    // 上面所有的对象都dispatchAction了，所以更新所有的对象连接状态为updated
                    updateConnectedChartsStatus(otherCharts, STATUS_UPDATED);
                }
            });
        });
    }
 /**
     * @pubilc
     * @param {Object} payload action
     * @param {string} [payload.type] 
     * @param {Object|boolean} [opt] If pass boolean, means opt.silent
     * @param {boolean} [opt.silent=false] Whether trigger events.
     * @param {boolean} [opt.flush=undefined]
     *                  true: Flush immediately, and then pixel in canvas can be fetched
     *                      immediately. Caution: it might affect performance.
     *                  false: Not flush.
     *                  undefined: Auto decide whether perform flush.
     */
    echartsProto.dispatchAction = function (payload, opt) {
        if (this._disposed) {
            // 实例被销毁，控制台警告
            disposedWarning(this.id);
            return;
        }
        if (!isObject(opt)) {
            // opt不是对象的时候，改变opt值为对象
            opt = {silent: !!opt};
        }
        if (!actions[payload.type]) {
            // 如果没有这个事件就返回
            return;
        }
        // 避免在setOption和connect之前运行
        if (!this._model) {
            return;
        }
        // 如果正处于主线程
        if (this[IN_MAIN_PROCESS]) {
            this._pendingActions.push(payload);
            return;
        }
        // 执行派遣action
        doDispatchAction.call(this, payload, opt.silent);
    
        if (opt.flush) {
            this._zr.flush(true); //如果flush属性为true，就执行渲染器刷新操作
        }
        else if (opt.flush !== false && env.browser.weChat) {
            // In WeChat embeded browser, `requestAnimationFrame` and `setInterval`
            // hang when sliding page (on touch event), which cause that zr does not
            // refresh util user interaction finished, which is not expected.
            // But `dispatchAction` may be called too frequently when pan on touch
            // screen, which impacts performance if do not throttle them.
            this._throttledZrFlush(); //防止微信内置浏览器影响动画性能做的节流操作
        }
    
        flushPendingActions.call(this, opt.silent); //刷新处于pending状态的action
        triggerUpdatedEvent.call(this, opt.silent); //立即触发更新的action
    };
    
    function doDispatchAction(payload, silent) {
        // 获取action的详细信息
        var payloadType = payload.type;
        var escapeConnect = payload.escapeConnect; //标注本次action是否脱离链接
        var actionWrap = actions[payloadType];
        var actionInfo = actionWrap.actionInfo;
        
        var cptType = (actionInfo.update || 'update').split(':');
        var updateMethod = cptType.pop();
        cptType = cptType[0] != null && parseClassType(cptType[0]);
    
        this[IN_MAIN_PROCESS] = true; //标注正处于主线程中
        
        var payloads = [payload];
        var batched = false;
        // 将action打包在一起(batch属性为true的action才会被打包)
        if (payload.batch) {
            batched = true;
            payloads = zrUtil.map(payload.batch, function (item) {
                item = zrUtil.defaults(zrUtil.extend({}, item), payload);
                item.batch = null;
                return item;
            });
        }
    
        var eventObjBatch = [];
        var eventObj;
        var isHighDown = payloadType === 'highlight' || payloadType === 'downplay';
    
        // 遍历处理打包的action
        each(payloads, function (batchItem) {
            // Action can specify the event by return it.
            eventObj = actionWrap.action(batchItem, this._model, this._api); 
            // Emit event outside
            eventObj = eventObj || zrUtil.extend({}, batchItem);
            // Convert type to eventType
            eventObj.type = actionInfo.event || eventObj.type;
            eventObjBatch.push(eventObj);
            // light update does not perform data process, layout and visual.
            if (isHighDown) {
                // method, payload, mainType, subType
                updateDirectly(this, updateMethod, batchItem, 'series');
            }
            else if (cptType) {
                updateDirectly(this, updateMethod, batchItem, cptType.main, cptType.sub);
            }
        }, this);
        if (updateMethod !== 'none' && !isHighDown && !cptType) {
            // Still dirty
            if (this[OPTION_UPDATED]) {
                // FIXME Pass payload ?
                prepare(this);
                updateMethods.update.call(this, payload);
                this[OPTION_UPDATED] = false;
            }
            else {
                updateMethods[updateMethod].call(this, payload);
            }
        }
        // Follow the rule of action batch
        if (batched) {
            eventObj = {
                type: actionInfo.event || payloadType,
                escapeConnect: escapeConnect,
                batch: eventObjBatch
            };
        }
        else {
            eventObj = eventObjBatch[0];
        }
        this[IN_MAIN_PROCESS] = false; //主线程处理完了action设置为false
        !silent && this._messageCenter.trigger(eventObj.type, eventObj); //是否需要马上触发的action
    }
    /**
    * 
    * @param option 图表的配置项和数据
    * @param notMerge 是否不跟之前设置的 option 进行合并，默认为 false，即合并。
    * @param lazyUpdate
    */
    echartsProto.setOption = function (option, notMerge, lazyUpdate) {
        if (__DEV__) {
            // setOption不能在主线程中调用
            assert(!this[IN_MAIN_PROCESS], '`setOption` should not be called during main process.');
        }
        // 警告：实例已经被注销
        if (this._disposed) {
            disposedWarning(this.id);
            return;
        }
    
        var silent; //阻止调用 setOption 时抛出事件，默认为 false，即抛出事件。
        if (isObject(notMerge)) {
            lazyUpdate = notMerge.lazyUpdate;
            silent = notMerge.silent;
            notMerge = notMerge.notMerge;
        }
    
        this[IN_MAIN_PROCESS] = true;
    
        if (!this._model || notMerge) {
            var optionManager = new OptionManager(this._api);
            var theme = this._theme;
            var ecModel = this._model = new GlobalModel();
            ecModel.scheduler = this._scheduler;
            ecModel.init(null, null, theme, optionManager);
        }
    
        this._model.setOption(option, optionPreprocessorFuncs);
    
        if (lazyUpdate) {
            this[OPTION_UPDATED] = {silent: silent};
            this[IN_MAIN_PROCESS] = false;
        }
        else {
            prepare(this);
    
            updateMethods.update.call(this);
    
            // Ensure zr refresh sychronously, and then pixel in canvas can be
            // fetched after `setOption`.
            this._zr.flush();
    
            this[OPTION_UPDATED] = false;
            this[IN_MAIN_PROCESS] = false;
    
            flushPendingActions.call(this, silent);
            triggerUpdatedEvent.call(this, silent);
        }
    };
```
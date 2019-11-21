## 一、CSS动画的硬件加速

用CSS3动画替代JS模拟动画的好处：

* 不占用JS主线程；

* 可以利用硬件加速；

* 浏览器可对动画做优化（元素不可见时不动画减少对FPS影响）

[查看示例页面](./index.html)

浏览器接收到页面文档后，会将文档中的标记语言解析为DOM树。DOM树和CSS结合后形成浏览器构建页面的渲染树。渲染树中包含了大量的渲染元素，每一个渲染元素会被分到一个图层中，每个图层又会被加载到GPU形成渲染纹理，而图层在GPU中 transform 是不会触发 repaint 的，这一点非常类似3D绘图功能，最终这些使用 transform 的图层都会由独立的合成器进程进行处理。

> 通过chrome的performance面板，可以看出使用transform的示例中，没有触发repaint。原因就在于CSS transform 创建了一个新的复合图层，可以被GPU直接用来执行 transform 操作,支持硬件加速

浏览器什么时候会创建一个独立的复合图层呢？事实上一般是在以下几种情况下：
* 3D 或者 CSS transform
* video 和 canvas 标签
* CSS filters
* 元素覆盖时，比如使用了 z-index 属性

因此我们可以才推荐使用transform来完成动画功能，通过启用GPU硬件加速来减轻CPU的工作量。为了避免 2D transform 动画在开始和结束时发生的 repaint 操作，我们可以硬编码一些样式来解决这个问题：

```css
    .example1 {
      transform: translateZ(0);
    }
    
    .example2 {
      transform: rotateZ(360deg);
    }
```

这段代码的作用就是让浏览器执行 3D transform。浏览器通过该样式创建了一个独立图层，图层中的动画则有GPU进行预处理并且触发了硬件加速。

####  开启GPU硬件加速可能触发的问题：

通过-webkit-transform:transition3d/translateZ开启GPU硬件加速之后，有些时候可能会导致浏览器频繁闪烁或抖动，可以尝试以下办法解决：

```css
    -webkit-backface-visibility:hidden;
    -webkit-perspective: 1000;
```

然而这是种非常规的实现方式，这个时候就可以考虑用will-change属性了。属性详情可以看MDN上的描述



### 参考链接

- [An Introduction to Hardware Acceleration with CSS Animations](https://www.sitepoint.com/introduction-to-hardware-acceleration-css-animations/)
- [will-change属性](https://developer.mozilla.org/zh-CN/docs/Web/CSS/will-change)
- [任务切片](https://github.com/nextdoorUncleLiu/task-slice/blob/master/demo/src/index.js)
- [https://juejin.im/post/5c8a1db15188257e9044ec52](https://juejin.im/post/5c8a1db15188257e9044ec52)
- [性能优化之关于像素管道](https://juejin.im/post/5d1492bbe51d4556bc066fb5)
- [时间切片（Time Slicing）](https://juejin.im/post/5ce249896fb9a07ea712e26e)
- [让你的网页更丝滑](https://juejin.im/post/5cf2161af265da1bb80c15fb)

---

by `李超凡`

### 微信小程序问题分享

scroll-view 内 image 图片圆角问题  可以试试：transform:translateZ(0);

```xml
<view style="width: 320px;height: 150px;border-radius: 20px; overflow:hidden;">
  <scroll-view scroll-y="{{true}}" style="height: 100%;width:100%;border-radius: 20px;">
      <image style="width:100%;border-radius: 20px;" mode="widthFix" src="{{src}}"></image>
  </scroll-view>
  </view>
```

### 讨论微信/支付宝/百度等小程序，H5 的多端开发工具

- [Taro](https://taro.aotu.io/)
- [mpvue](http://mpvue.com/)
- [wepy](https://tencent.github.io/wepy/)

---

分享：`徐旺`

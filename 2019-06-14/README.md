
## HTML截屏

参考链接：[HTML截屏](http://html2canvas.hertzen.com/)

```
html2canvas(document.body).then(function(canvas) {
  let img = canvas.toDataURL("image/png");
});
```

#### 问题：
- 动画等不支持
解决办法：--

## vue新的语法 [参考链接](https://cn.vuejs.org/v2/style-guide/#%E6%B2%A1%E6%9C%89%E5%9C%A8-v-if-v-else-if-v-else-%E4%B8%AD%E4%BD%BF%E7%94%A8-key-%E8%B0%A8%E6%85%8E%E4%BD%BF%E7%94%A8)

- v-for与v-if不能一起使用
- 如果一组 v-if + v-else 的元素类型相同，最好使用 key (比如两个 <div> 元素)。默认情况下，Vue 会尽可能高效的更新 DOM。这意味着其在相同类型的元素之间切换时，会修补已存在的元素，而不是将旧的元素移除然后在同一位置添加一个新元素

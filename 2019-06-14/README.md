
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

## vue新的语法

- v-for与v-if不能一起使用
- 如果一组 v-if + v-else 的元素类型相同，最好使用 key (比如两个 <div> 元素)。默认情况下，Vue 会尽可能高效的更新 DOM。这意味着其在相同类型的元素之间切换时，会修补已存在的元素，而不是将旧的元素移除然后在同一位置添加一个新元素

# Web 体验优化中和图片相关

## 先上点背景知识~

**1、有损压缩：** 将次要的信息数据舍弃，牺牲一些质量来减少数据量、提高压缩比。这个过程是不可逆的。图片常见的有损压缩手段是合并相近的像素点

**2、无损压缩：** 数据经过压缩后，信息不受损失，还可以完全恢复到压缩前的样子

**3、索引色：** 一个字节 2^8 表示一个颜色，也就是最多支持 256 种颜色

**4、直接色：** 4 个数字表示一个颜色，分别表示红、黄、蓝以及透明度，所以最多可以表达 2^32 种颜色

**5、位图：** 又叫栅格图、点阵图，使用像素阵列来表示图像,每个象素有自己的颜色信息

**6、矢量图：** 计算机图形学中用点、直线或者多边形等基于数学方程的几何图元表示图像。相比较位图，矢量图保存最少的信息，体积更小，缩放不会失真

## 常用图片格式

- **JPEG/JPG：** 又称格式压缩的图片，最普遍被使用的扩展名格式为.jpg，其他常用的扩展名还包括 .jpeg、.jpe、.jfif 以及 .jif，其特点是有损压缩，直接色，位图，体积最小，常用于颜色较丰富、无透明要求的图片

- **PNG：** PNG 是一种无损压缩的位图图形格式，支持索引、灰度、RGB 三种颜色方案以及 Alpha 通道等特性， IE6 不支持 PNG 半透明，需要用 hack 方法解决

- **GIF：** 是一种位图图形文件格式，无损压缩、索引色，定义了动画循环多少次或是否无限次播放，现在聊天的动图都是基于该版本的 GIF。

  - 优秀的 LZW 算法在保证质量的同时将体积变的更小。
  - 可插入多帧实现动画效果。
  - 可实现透明效果。
  - 最多支持 256 色，故不适用于真彩色图片。

- **WebP：** 同时支持有损和无损压缩的图片文件格式；

- **SVG：** 可缩放矢量图形是一种基于可扩展编辑语言（XML），用于描述二维矢量图形的图形格式，SVG 的优点是文件可读，易于修改编辑。支持多种滤镜和特殊效果，在不改变图像内容的前提下可以实现位图中类似文字阴影的效果，还可以生成动态图形。

## 请求优化 拥抱 HTTP2

demo 感受一下牛逼哄哄的 HTTP/2 [HHTP/1.0 VS HHTP/2.0](https://http2.akamai.com/demo)

HTTP/1.x 在前面的请求没有完成前，后面的请求将会阻塞

HTTP/2.x 多路复用允许同时通过单一的 HTTP 请求多个响应

## 懒加载

> 只加载可视区的内容，当页面向下滚动时，再继续加载后面的内容。

图片懒加载的原理其实非常简单，我们先不设置图片的 src 属性，将图片的真实路径放到一个浏览器不认识的属性中（比如 data-src），然后我们去监听 scroll 事件。当页面的 scrollTop 与浏览器的高度之和大于图片距页面顶端的 Y (注意是整个页面不是浏览器窗口)时，说明图片已经进入可视区域，这是把 data-src 的值放到 src 中即可。

#### 为什么要使用懒加载？

- 对于大多数用户，特别是移动端和网速比较的用户，如果首屏加载过多的图片，页面将会加载得很慢而且浪费用户的流量。
- avascript 脚步通常要等到 DOM 加载完后才会执行，如果加载的资源过多，可能会影响网页的正常使用。
- 能够节省流量和减轻服务器压力，更近一步就是能够为公司省成本。

#### 插件推荐

[Lozad.js](https://github.com/ApoorvSaxena/lozad.js)

```js
<img class="lozad" data-src="image.png" />;

const observer = lozad(); // 默认会去找 .lozad 这个class
observer.observe();
```

[vue-lazyload](https://github.com/hilongjw/vue-lazyload)

[react-lazyload](https://github.com/twobin/react-lazyload)

## 正确使用缓存

![Image text](https://github.com/duia-fe/weekly/blob/master/2019-share/2019-12-06/1.jpg)

浏览器和服务器之间使用的缓存策略可以分为强缓存、协商缓存两种：

- 强缓存：在缓存数据未失效的情况下，不需要再和服务器发生交互
- 协商缓存：需要与服务端校验是否使用缓存

![Image text](https://github.com/duia-fe/weekly/blob/master/2019-share/2019-12-06/2.jpg)

## 雪碧图

> 雪碧图，CSS Sprites，国内也叫 CSS 精灵，是一种 CSS 图像合成技术，主要用于小图片显示。

多张小图合成一张图片，减少 http 的请求，然后用背景位置`background-position`对图片进行定位，

```js
  width: 32px;
  height: 32px;
  background-image: url(text.png);
  background-position: 0px -32px;
```

#### 自动生成雪碧图

使用 [spritesmith](https://github.com/twolfson/spritesmith)，该工具可自动合并图片，并得到图片在合并之后的相对位置

```js
const fs = require("fs");
const path = require("path");
const Spritesmith = require("spritesmith");

const baseDir = path.resolve("./images");
const files = fs.readdirSync(baseDir);
const sprites = files.map(file => path.join(baseDir, file));

const spritesmithFunc = () => {
  return new Promise(resolve => {
    Spritesmith.run({ src: sprites }, (err, result) => {
      resolve(result);
      if (err) {
        console.error(err);
      } else {
        console.info(result);
      }
    });
  });
};
```

运行的输出结果如下：

```js
{
  coordinates: {
    'images/zhifubao.png': { x: 0, y: 131, width: 32, height: 32 },
    'images/taobao.png': { x: 177, y: 0, width: 32, height: 32 },
    'images/weixin.png': { x: 0, y: 0, width: 32, height: 32 },
    ...
  },
  properties: { width: 64, height: 96 },
  image: <Buffer 89 56... 22705 more bytes>
}

```

- `coordinates` ：每张图片对应的尺寸和位置
- `properties`：生成的图片尺寸
- `image`：文件的 Buffer，可用于生成图片

#### 写入文件

```js
const writeFile = data => {
  //   const fbStr = data.toString();
  const filepath = "images/merge.png"; //写入如路径
  const dataBuffer = new Buffer(fbStr, "base64"); // 转成base64

  fs.writeFile(filepath, dataBuffer, function(err) {
    //用fs写入文件
    if (err) {
      console.log(err);
    } else {
      console.log("写入成功！");
    }
  });
};
```

#### 常用的构建工具

- [webpack-spritesmith](https://github.com/mixtur/webpack-spritesmith)
- [gulp.spritesmith](https://github.com/twolfson/gulp.spritesmith)
- [grunt-spritesmith](https://github.com/twolfson/grunt-spritesmith)

## 使用 iconfont

> iconfont 字体图标，即通过字体的方式展示图标，多用于渲染图标、简单图形、特殊字体等,可有效减少 HTTP 请求次数，而且一般字体体积较小，所以请求传输数据量较少

关于 @font-face 的说明可参考 [mozilla](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@font-face)

#### 推荐

- [IconFont 阿里巴巴矢量图标库](https://www.iconfont.cn/help/detail?spm=a313x.7781069.1998910419.14&helptype=code)
- [IcoMoon](https://icomoon.io/#docs)
- [Font Awesome](https://www.bootcss.com/p/font-awesome/#integration)

## 使用 Base64

使用 Base64 编码渲染图片有以下优点：

- 有效减少 HTTP 请求次数
- 可对数据进行简单加密，无法肉眼获取信息
- 没有跨域问题，无需考虑图片缓存

凡事皆有利弊，使用 Base64 编码同时也会带来一些问题：

- 编码后文件体积增大，仅适用于小体积图片编码
- 增加了编码和解码的工作量
- 不支持 IE 8.0 以下版本

## 图优化之体积优化

> 顾名思义，减少图片的体积

#### 在线工具

- [智图](https://zhitu.isux.us/)：免费，可以选择压缩质量，生成 Webp
- [TinyPNG](https://tinypng.com/)：免费，TinyPng 使用智能有损压缩技术减小 PNG 文件的文件大小

## 图优化之格式、尺寸优化

| 类型     | 动画   | 压缩类型           | 浏览器支持                            | 透明度 |
| -------- | ------ | ------------------ | ------------------------------------- | ------ |
| GIF      | 支持   | 无损压缩           | 所有                                  | 支持   |
| PNG      | 不支持 | 无损压缩           | 所有                                  | 支持   |
| JPRG/JPG | 不支持 | 有损压缩           | 所有                                  | 不支持 |
| webP     | 不支持 | 无损压缩或有损压缩 | Chrome、Opera、Firefox、Edge、Android | 支持   |

#### 多倍图

> 为了保证图片在不同 DPR（设备像素比）的设备上显示足够清晰，开发者需要针对不同设备适配不同倍数的图片

1. 使用 `picture` 标签

```js
<picture>
  <source srcset="photo@3x.jpg" media="(min-width: 800px)">
  <source srcset="photo@2x.jpg" media="(min-width: 600px)">
  <img srcset="photo.jpg">
</picture>
```

`IE`不支持`picture`标签

2. 使用 `img srcset` 属性

```js
<img src="photo.png" srcset="photo@2x.png 2x, photo@3x.png 3x" alt="photo" />
```

`IE`不支持`img srcset` 属性

3. 使用 `CSS3 img-set` 函数，兼容性相较于前两者较差

```js
background-image: image-set("photo.png" 1x,
                            "photo@2x.png" 2x,
                            "photo@3x.png" 3x);
```

#### 像素相关概念

- **DP** 设备像素，又名物理像素，即设备屏幕上真实的物理像素，以矩阵的形式排列，如 iphone X 屏幕分辨率为 2436\*1125，即屏幕每行包含 1125 个物理像素，每列包含 2436 个物理像素。

- **DIP** 设备无关像素，是一种基于屏幕坐标的抽象像素，应用程序以抽象像素为单位，如我们 CSS 中使用的 px，实际渲染时通过底层程序转换为物理像素。

- **DPR** 设备像素比，设备像素 / 设备无关像素的值即为设备像素比，在 Javascript 中可以通过 window.devicePixelRatio 来获取。

## 勿忘无障碍，关怀弱视力群体

#### 设置 Alt 属性

图片 `alt` 信息应简短,
图片的长信息介绍应被放到 `longdesc` 属性中

```js
<img src="" alt="图片说明" />
<img src="" longdesc="一段很长的文字一段很长的文字一段很长的文字一段很长的文字" />
```

by `邓伟`

const Koa = require('koa');
const app = new Koa();
const router = require('./router');

// 对于任何请求，app将调用该异步函数处理请求：
app.use(async (ctx, next) => {
    await next();
});

app.use(router.routes()).use(router.allowedMethods());

app.on('error', err => {
    log.error('server error', err);
});

// 在端口3000监听:
app.listen(3000);

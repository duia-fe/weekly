const Koa = require('koa');
const router = require('koa-router')();
const app = new Koa();

const user = require('./user');

// logger
app.use(async (ctx, next) => {
    await next();
    const rt = ctx.response.get('X-Response-Time');
    console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
});

// response
router.get('/', async (ctx, next) => {
    const users = await user.findAll();
    ctx.response.body = users;
});

app.use(router.routes());

app.listen({ port: 3001 }, () => console.log(`🚀 Server ready at http://localhost:3001`));

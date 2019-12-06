const Router = require('koa-router');
const router = new Router();
const fs = require('fs')
const path = require('path');
const Spritesmith = require('spritesmith');


const baseDir = path.resolve('./images');
const files = fs.readdirSync(baseDir)
const sprites = files.map(file => path.join(baseDir, file))

/**
 * 写入文件
 */
const writeFile = data => {
    const filepath = "images/merge.png"; //写入如路径
    const dataBuffer = new Buffer(data, "base64"); // 转成base64

    fs.writeFile(filepath, dataBuffer, function (err) {
        //用fs写入文件
        if (err) {
            console.log(err);
        } else {
            console.log("写入成功！");
        }
    });
};

/**
 * 合并
 */
const spritesmithFunc = () => {
    return new Promise(resolve => {
        Spritesmith.run({ src: sprites }, (err, result) => {
            if (err) {
                console.error(err)
            } else {
                console.info(result);
                writeFile(result.image)
                resolve(result)
            }
        })
    })
}

router.get('/', async (ctx, next) => {
    let textobj = await spritesmithFunc()
    ctx.body = textobj
    await next()
});

module.exports = router;

const Koa = require('koa');
const app = new Koa();
app
    .use(async(ctx,next)=>{
    ctx.body = 'index'
})
     .listen(4455)
  
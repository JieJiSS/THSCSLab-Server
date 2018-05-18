const Koa = require("koa");
const app = new Koa();
const views = require("koa-views");
const render = require("koa-ejs");
const path = require("path");
const json = require("koa-json");
const hash = require("./scripts/hash");
const session = require("koa-session-minimal");
const MysqlStore = require("koa-mysql-session");
const router = require("koa-router")();
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");
const staticCache = require("koa-static-cache");

const manage = require("./routes/manage");
const article = require("./routes/article");
const uploadMD = require("./routes/uploadMD");
//const config = require("./scripts/dbConfig");

// error handler
onerror(app);

// middlewares
const CONFIG = {
    key: 'kas', /** (string) cookie key (default is koa:sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 86400000,
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
    rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
    renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
  };
   
app.use(session(CONFIG, app));

// const sessionMysqlConfig = {
//     user: config.database.USERNAME,
//     password: config.database.PASSWORD,
//     database: config.database.DATABASE,
//     host: config.database.HOST
// };

// 配置session中间件
// app.use(session({
//   key: 'USER_SID',
//   store: new MysqlStore(sessionMysqlConfig)
// }))

// 缓存
app.use(staticCache(path.join(__dirname, './assets'), { dynamic: true }, {
    maxAge: 3 * 24 * 60 * 60
}));

app.use(
    bodyparser({
        enableTypes: ["json", "form", "text"],
        onerror: function(err, ctx) {
            ctx.throw("body parse error", 422);
        },
        formLimit: "1mb"
    })
);
app.use(json());
app.use(logger());

render(app, {
    root: path.join(__dirname, "views"),
    layout: false,
    viewExt: ".ejs",
    cache: false,
    writeResp: false,
    debug: false
});

// logger
app.use(async (ctx, next) => {
    const start = new Date();
    if (ctx.path === "/favicon.ico") return await next();
    if (!ctx.session.hash) ctx.session.hash = hash();
    await next();
    const ms = new Date() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// routes
app.use(manage.routes(), manage.allowedMethods());
app.use(article.routes(), article.allowedMethods());
app.use(uploadMD.routes(), uploadMD.allowedMethods());

// error-handling
app.on("error", (err, ctx) => {
    console.error("server error", err, ctx);
});

module.exports = app;

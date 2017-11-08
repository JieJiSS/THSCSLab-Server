const Koa = require("koa");
const app = new Koa();
const views = require("koa-views");
const render = require("koa-ejs");
const path = require("path");
const json = require("koa-json");
const hash = require("./scripts/hash");
const session = require("koa-session");
const router = require("koa-router")();
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");

const manage = require("./routes/manage");
const article = require("./routes/article");
const uploadMD = require("./routes/uploadMD");

// error handler
onerror(app);

const CONFIG = {
    key: "_kas",
    maxAge: "session",
    signed: false,
};

// middlewares
app.use(session(CONFIG, app));

app.use(
    bodyparser({
        enableTypes: ["json", "form", "text"],
        onerror: function(err, ctx) {
            ctx.throw("body parse error", 422);
        }
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

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
//app.use(require("koa-static")(path.join(__dirname, "assets"), { defer: false }));
/*
app.use(
    views(__dirname + "/views", {
        extension: "pug"
    })
);
*/

console.log("R: ", app.context.render)

render(app, {
    root: path.join(__dirname, "views"),
    layout: false,//"article",
    viewExt: ".ejs", // *.ejs
    cache: false,
    writeResp: false,
    debug: true /*@TODO false*/
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

// error-handling
app.on("error", (err, ctx) => {
    console.error("server error", err, ctx);
});

module.exports = app;

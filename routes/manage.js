const router = require("koa-router")();
const session = require("koa-session");
const path = require("path");
const readFile = require("../scripts/readFile");
const getExt = require("../scripts/getExt");
const toSafePath = require("../scripts/toSafePath");
const login = require("./login.js");
const send403 = require("../scripts/send403");

const sleep = require("../debug/sleep");

router.get("/login", async (ctx, next) => {
    ctx.type = "html";
    ctx.body = await readFile(path.join(__dirname, "views", "index.html"));
    console.log("/login");
});

router.post("/login-json", async (ctx, next) => {
    let json = ctx.request.body;
    let sess = ctx.session.hash;
    ctx.body = await login.login(sess, json);
});

router.post("/login-form", async (ctx, next) => {
    let json = ctx.request.body;
    console.log(json);
    let sess = ctx.session.hash;
    result = login.login(sess, json);
    ctx.body = String(result);
});

router.get("/manage", async (ctx, next) => {
    if(!("hash" in ctx.session) || !login.isLogin(ctx.session.hash)) {
        return send403(ctx);
    }
    ctx.type = ".html";
    ctx.body = await ctx.render("admin"); //@TODO
});

router.get(/^\/assets\/\S+$/, async (ctx, next) => {
    // DEBUG: await sleep(1000);
    const file = toSafePath(ctx.url);
    ctx.type = getExt(file);
    _path = path.join(__dirname, "..", file);
    console.log(_path);
    ctx.body = await readFile(_path);
});

module.exports = router;

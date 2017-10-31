const router = require("koa-router")();
const session = require("koa-session");
const path = require("path");
const readFile = require("../scripts/readFile");
const getExt = require("../scripts/getExt");
const toSafePath = require("../scripts/toSafePath");
const login = require("./login.js");

const ptr = require("path-to-regexp");

router.get("/", async (ctx, next) => {
    ctx.type = "html";
    ctx.body = await readFile(path.join(__dirname, "views", "index.html"));
    console.log("/");
});

router.post("/login-json", async (ctx, next) => {
    let json = ctx.request.body;
    let sess = ctx.session.hash;
    ctx.body = await login(sess, json);
});

router.post("/login-form", async (ctx, next) => {
    let json = ctx.request.body;
    let sess = ctx.session.hash;
    ctx.body = await login(sess, json);
});

router.get("/manage", async (ctx, next) => {
    ctx.type = ".html";
    ctx.body = await readFile(path.join(__dirname, "views", "manage.html"));
});

router.get(/^\/assets\/\S+$/, async (ctx, next) => {
    console.log("/assets");
    const file = toSafePath(ctx.url);
    ctx.type = getExt(file);
    _path = path.join(__dirname, "..", file);
    console.log(_path);
    ctx.body = await readFile(_path);
});

module.exports = router;

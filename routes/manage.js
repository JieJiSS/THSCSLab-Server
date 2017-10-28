const router = require("koa-router")();
const session = require("koa-session");
const path = require("path");
const readFile = require("../scripts/readFile");
const getExt = require("../scripts/getExt");
const toSafePath = require("../scripts/toSafePath");

const ptr = require("path-to-regexp");

router.get("/", async (ctx, next) => {
    ctx.type = "html";
    ctx.body = await readFile(path.join(__dirname, "views", "index.html"));
    console.log("/");
});

router.post("/login", async (ctx, next) => {
    let body = ctx.request.body; //parsed body
    console.log(body);
    let sess = ctx.session.hash;
    console.log(sess);
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

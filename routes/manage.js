const router = require("koa-router")();
const path = require("path");
const hash = require("../scripts/hash");
const readFile = require("../scripts/readFile");
const getExt = require("../scripts/getExt");

router.get("/", async (ctx, next) => {
    ctx.type = "html";
    ctx.body = await readFile(path.join(__dirname, "views", "index.html"));
});

router.post("/login/:user", async (ctx, next) => {
    let body = ctx.request.body; //parsed body
    console.log(body);
    ctx.type = ".html";
    ctx.body = await readFile(path.join(__dirname, "views", "login.html"));
});

router.get("/manage", async (ctx, next) => {
    ctx.type = ".html";
    ctx.body = await readFile(path.join(__dirname, "views", "manage.html"));
});

router.get("/assets/:path", async (ctx, next) => {
    ctx.type = getExt(ctx.params.path);
    ctx.body = await readFile(
        path.join(__dirname, "..", "assets", ctx.params.path)
    );
});

module.exports = router;

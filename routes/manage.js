const router = require("koa-router")();
const path = require("path");
const hash = require("../scripts/hash");
const readFile = require("../scripts/readFile");

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

module.exports = router;

const router = require("koa-router")();
const path = require("path");
const readFile = require("../scripts/readFile");

router.get("/login", async (ctx, next) => {
    ctx.type = ".html";
    ctx.body = await readFile(path.join(__dirname, "views", "manage.html"));
});

router.get("/manage", async (ctx, next) => {
    ctx.type = ".html";
    ctx.body = await readFile(path.join(__dirname, "views", "manage.html"));
});

module.exports = router;

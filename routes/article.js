const router = require("koa-router")();
const render = require("koa-ejs");



router.prefix("/article");

router.get("/", async (ctx, next) => {
    ctx.type = ".html";
    ctx.body = await readFile(path.join(__dirname, "views", "article.html"));
});

module.exports = router;

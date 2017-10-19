const router = require("koa-router")();
const path = require("path");
const readFile = require("../scripts/readFile");

router.get("/", async (ctx, next) => {
    ctx.type = ".html";
    ctx.body = await readFile(path.join(__dirname, "views", "blog.html"));
});

module.exports = router;

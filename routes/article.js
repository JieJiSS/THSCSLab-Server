const router = require("koa-router")();

router.prefix("/article");

router.get("/", async function(ctx, next) {
    await ctx.render("index", {
        
    });
});

router.get("/bar", function(ctx, next) {
    ctx.body = "this is a users/bar response";
});

module.exports = router;

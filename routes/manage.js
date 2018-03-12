const router = require("koa-router")();
const session = require("koa-session");
const path = require("path");
const readFile = require("../scripts/readFile");
const getExt = require("../scripts/getExt");
const toSafePath = require("../scripts/toSafePath");
const login = require("./login.js");
const send403 = require("../scripts/send403");
const userModel = require("../scripts/sql.js");
const moment = require("moment");

const sleep = require("../debug/sleep");

router.get("/login", async (ctx, next) => {
    ctx.type = "html";
    ctx.body = await readFile(path.join(__dirname, "views", "index.html"));
    console.log("/login");
});

router.get(/\/(index)?$/, async (ctx, next) => {
    ctx.body = {};
});

router.post("/login-form", async (ctx, next) => {
    let user = {
        username: ctx.request.body.username,
        password: ctx.request.body.password,
    };
    console.log(user);
    let sess = ctx.session.hash;
    console.log(sess);
    //result = login.login(sess, json);
    //ctx.body = String(result);
});

router.get("/manage", async (ctx, next) => {
    if(!("hash" in ctx.session) || !login.isLogin(ctx.session.hash)) {
        return send403(ctx);
    }
    ctx.type = ".html";
    ctx.body = await ctx.render("admin"); //@TODO
});

router.get("/signup", async (ctx, next) => {
    ctx.type = ".html";
    ctx.body = await ctx.render("signup", {
        session: ctx.session,
        error: ""
    });
});

router.post("/signup", async (ctx, next) => {
    let user = {
        username: ctx.request.body.username,
        password: ctx.request.body.password
    };
    console.log(user);
    let sess = ctx.session.hash;
    console.log(sess);
    //result = login.login(sess, json);
    //ctx.body = String(result);
    await userModel.findDataByName(user.username)
        .then(async (result) => {
            console.log(result)
            if (result.length) {
                ctx.type = ".html";
                ctx.body = await ctx.render("signup", {
                    session: ctx.session,
                    error: "该用户已存在。"
                });
            } else {
                let getName = Number(Math.random().toString().substr(3)).toString(36) + Date.now()
                await userModel.insertData([user.username, user.password, moment().format('YYYY-MM-DD HH:mm:ss')])
                    .then(res=>{
                        console.log('注册成功', res)
                        ctx.status = 301;
                        ctx.redirect("/index");
                    })
            }
        })
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

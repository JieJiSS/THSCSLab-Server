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
    ctx.body = await ctx.render("login", { error: "" });
});

router.get(/^\/(index)?$/, async (ctx, next) => {
    ctx.body = "Index page";
});

router.post("/login-form", async (ctx, next) => {
    let user = {
        username: ctx.request.body.username,
        password: ctx.request.body.password,
    };
    let sess = ctx.session.hash;
    await userModel.findUserData(user.username).then(async (result) => {
        if(result.length) {
            if(result[0].pass === user.password) {
                ctx.session.isLogined = true;
                ctx.session.username = user.username;
                ctx.status = 301;
                ctx.redirect("/article");
            } else {
                ctx.status = 301;
                ctx.redirect("/login#errcode=2");
            }
        } else {
            ctx.status = 301;
            ctx.redirect("/login#errcode=1");
        }
    });
    //result = login.login(sess, json);
    //ctx.body = String(result);
});

router.get("/manage", async (ctx, next) => {
    if(!ctx.session.isLogined) {
        send403(ctx);
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

router.post("/signup-form", async (ctx, next) => {
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
            if (result.length) {
                ctx.status = 301;
                ctx.redirect("/signup?errcode=1");
            } else {
                let getName = Number(Math.random().toString().substr(3)).toString(36) + Date.now();
                await userModel.insertData([
                    user.username, 
                    user.password, 
                    moment().format('YYYY-MM-DD HH:mm:ss')
                ]).then(res => {
                    ctx.status = 301;
                    ctx.redirect("/article");
                });
            }
        })
});

router.post("/logout", async (ctx, next) => {
    if (ctx.session.isLogined) {
        ctx.session.isLogined = false;
        ctx.username = undefined;
        ctx.body = {};
    } else {
        ctx.status = 403;
        ctx.body = {
            "error": "You are not logined."
        };
    }
})

router.get(/^\/assets\/\S+$/, async (ctx, next) => {
    // DEBUG: await sleep(1000);
    const file = toSafePath(ctx.url.replace(/\?.*$/, ""));
    ctx.type = getExt(file);
    _path = path.join(__dirname, "..", file);
    console.log(_path);
    ctx.body = await readFile(_path);
});

module.exports = router;

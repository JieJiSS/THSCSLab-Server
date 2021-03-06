"use strict";

const router = require("koa-router")();

const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const { promisify } = require("bluebird");

const removeMd = require("remove-markdown");

const antiInject = require("../scripts/antiInject");
const { toTitle } = require("../scripts/toTitle");

const exec = promisify(cp.exec);
const exists = promisify(fs.exists)
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

const $CMD = process.env["HOME"] + "/anaconda3/bin/python ./lib/recognize.py {txt} {json}";

const regex1 = /^slider\s*\(\s*(\w+)\s*\)\s*$/i,
    regex2 = /^end\s*$/i;

const md = require("markdown-it")({
    breaks: true,
    langPrefix: "lang-",
    linkify: true,
    typographer: false,
})
    .use(require("markdown-it-task-lists"))
    .use(require("markdown-it-container"), "slider", {
        validate: function (params) {
            var str = params.trim();
            return regex1.test(str) || regex2.test(str);
        },
        render: function (tokens, idx) {
            const token = tokens[idx];
            const inf = token.info;
            if (regex1.test(inf)) {
                let m = toSafeHTML(inf.match(regex1));
                let UNIT;
                if(isNaN(m[1])) {
                    if(!isNaN(parseFloat(m[1]))) { // 100.0px
                        let num = parseFloat(m[1]);
                        UNIT = getUnit(m[1]);
                        m[1] = num.toString() + UNIT;
                    }
                } else {
                    m[1] += "px";
                }
                return `<div class="container">
            <div class="row headline">
                <!-- Begin Headline -->
                <div class="headline-slider" style="width: ${m[1]}; margin-left: calc(338.5px - ${parseFloat(m[1])/2}${UNIT || "px"}) !important;">
                    <div class="flexslider">
                        <div class="flex-viewport" style="overflow: hidden; position: relative;">
                            <ul class="slides" v-data="width:${m[1]};duration:2" style>\n`;
            } else if (regex2.test(inf)) {
                return `</ul>
            </div>
            <ul class="flex-direction-nav">
                <li>
                    <a class="flex-prev" href="#">Previous</a>
                </li>
                <li>
                    <a class="flex-next" href="#">Next</a>
                </li>
            </ul>
        </div>
    </div>
</div>
<!-- End Headline -->
</div>\n`;
            }
            return "";
        }
    });

// const slideList = require("../config/slideList.js");
const CONFIG  = require("../config/articleConfig.json");

router.prefix("/article");

router.get("/", async (ctx) => {
    const files = await readdir(path.resolve(path.join(__dirname, "../md/")));
    const displayFiles = files.filter(str => str && !str.startsWith(".") && str.endsWith(".md")).map(str => str.slice(0, -3));
    ctx.body = await ctx.render("toc", {
        files: displayFiles
    });
});

router.get("/:title", async (ctx) => {
    /*
    let db = await MongoClient.connect(DB_CONN_STR);
    let result = await getData(db, ctx.params.title);
    db.close();
    let obj = result[0];
    */
    try {
        const fpath = path.join(__dirname, "../md/", ctx.params.title + ".md");
        const datapath = path.join(__dirname, "../md/", ctx.params.title + ".json");
        const txtpath = path.join(__dirname, "../md/", ctx.params.title + ".txt");
        const mdsource = (await readFile(fpath))
            .toString()
            .replace("\uFEFF", "")
            .replace(/^(#+)([^\s#])/gim, "$1 $2");
        let html = md.render(mdsource);
        if(!await exists(datapath)) {
            await writeFile(txtpath, removeMd(mdsource));
            //exec($CMD.replace("{txt}", txtpath).replace("{json}", datapath)).then(() => {}).catch(() => {});
            html = html + `<script>
              var recognizedData = {ready: false};
            </script>`;
        } else {
            html = html + `<script>
              var recognizedData = JSON.parse("${
                  (await readFile(datapath)).toString("utf-8")
              }");
              recognizedData.ready = true;
            </script>`;
        }
        let parsedTitle = html.match(/<h1>([\s\S]+?)<\/h1>/)[1];
        let hasSlide = false;
        //console.log(slideList, ctx.params.title);
        if(html.includes("<div class=\"flexslider\">")) {
            hasSlide = true;
        }
        const articleConfig = CONFIG[ctx.params.title] || {};
        let post_date = new Date();
        if(articleConfig.datetime) {
            post_date = new Date(articleConfig.datetime).toDateString();
        } else {
            post_date = ((await stat(fpath)).mtime).toDateString();
        }
        let obj = {
            title: toTitle(ctx.params.title),
            main_html: html,
            description: articleConfig.description || "This page was generated by the THSCSLab Server automatically.",
            author: articleConfig.author || "THSCSLab",
            post_date: post_date,
        };
        if(hasSlide) {
            ctx.body = await ctx.render("slide", {
                title: parsedTitle || toTitle(obj.title),
                _title: ctx.params.title,
                description: obj.description,
                main_html: obj.main_html,
                post_date: obj.post_date,
                author: obj.author || "",
            });
        } else { 
            ctx.body = await ctx.render("article", {
                title: parsedTitle || toTitle(obj.title),
                _title: ctx.params.title,
                description: obj.description,
                main_html: obj.main_html,
                post_date: obj.post_date,
                author: obj.author || "",
            });
        }
    } catch (err) {
        // console.log(err);
        ctx.status = 404;
        ctx.type = ".html";
        ctx.body = await ctx.render("error", {
            message: "Failed to fetch <code>/article/" + antiInject(ctx.params.title) + "</code>",
            error: {
                status: 404,
                stack: "Error 404 at article/:title"
            }
        });
    }
});

router.get("/", async (ctx) => {
    ctx.status = 302;
    ctx.redirect("/index");
});

function sleep(ms = 0) {
    if(typeof ms !== "number")
        throw new TypeError("ms is not a number (in async sleep(...))");
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
sleep();
function getUnit(str) {
    switch(true) {
    case /px$/i.test(str):
        return "px";
    case /vh$/i.test(str):
        return "vh";
    case /vw$/i.test(str):
        return "vw";
    case /em$/i.test(str):
        return "em";
    case /rem$/i.test(str):
        return "rem";
    case /%$/i.test(str):
        return "%";
    case /pt$/i.test(str):
        return "pt";
    default:
        return "px";
    }
}

function toSafeHTML(arr) {
    return arr.map(str => {
        return str.replace(/>/g, "&gt;").replace(/</g, "&lt;");
    });
}

module.exports = router;

"use strict";
const router = require("koa-router")();
const path = require("path");
const multer = require('koa-multer');
const md = require('markdown-it')();
const fs = require('fs');
const { promisify } = require('bluebird');
const { parseFilename, getFilename } = require("../scripts/toTitle");
const toSafePath = require("../scripts/toSafePath");

const rename = promisify(fs.rename);
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);
const unlink = fs.unlink;

//加载配置
const upload = multer({
    storage: multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, path.join(__dirname, "../md"));
        },
        filename: function(req, file, cb) {
            cb(null, file.originalname.replace(/\.md$/i, "") + "_" + Date.now() + ".md");
        }
    }),
    fileFilter: function(req, file, cb) {
        if (!file.originalname.slice(-3).toLowerCase() === ".md") {
            cb(null, false);
        } else {
            cb(null, true);
        }
    }
});
//路由

router.get("/upload-md", async (ctx, next) => {
    ctx.type = ".html";
    ctx.body = await readFile(path.join(__dirname, "/views/uploadmd.html"));
});

router.post("/upload-md", upload.single("file"), async (ctx, next) => {
    let filePath = path.join(__dirname, "../md", toSafePath(ctx.req.file.filename));
    let data = (await readFile(filePath))
        .toString()
        .replace("\uFEFF", "")
        .replace(/^(#+)([^\s#])/gim, "$1 $2");
    if(!data.trim().startsWith("#") || data.trim()[1] === "#") {
        ctx.body = await ctx.render("error", {
            message: "解析错误：该Markdown文件应该以恰好一个#作为开始，用于自动路径分配。",
            error: {
                status: 400,
                stack: "400 Bad Request"
            }
        });
        console.log("error1");
        return;
    }
    let html = md.render(data);
    let name = getFilename(html);
    if(typeof name === "object") {
        ctx.body = await ctx.render("error", {
            message: name.message,
            error: name
        });
        console.log("error2");
        return;
    }
    let fpath = path.join(__dirname, "../md", name);
    try {
        if((await stat(fpath)).isFile()) {
            let showName = name.replace(/\.md$/i, "");
            ctx.body = {
                success: false,
                filename: null,
                message: "文件已存在：" + showName,
                urlpath: "/article/" + showName,
            };
            unlink(filePath, err => {
                if(err) {
                    console.error("删除失败：", err.message);
                }
            });
            return;
        }
    } catch (err) {} //文件不存在
    try {
        await rename(filePath, fpath); // @TODO 直接写入html，只渲染一次。
    } catch (err) {
        ctx.body = {
            success: false,
            filename: null,
            message: `重命名失败：${err.message.replace(__dirname, "./")}。`,
            urlpath: null,
        };
        unlink(filePath, err => {
            if(err) {
                console.error("删除失败：", err.message);
            }
        });
        return;
    }
    let showName = name.replace(/\.md$/i, "");
    ctx.type = ".html";
    ctx.body = `<html>
    <head>
        <meta http-equiv="refresh" content="0; url=article/${ showName }" />
    </head>
</html>`;
});

module.exports = router;

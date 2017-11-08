"use strict";
const router = require("koa-router")();
const path = require("path");
const multer = require('koa-multer');
const md = require('markdown-it')();
const fs = require('fs');
const { promisify } = require('bluebird');
const { parseFilename, getFilename } = require("../scripts/toTitle");

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
router.post("/upload-md", upload.single("file"), async (ctx, next) => {
    let filePath = path.join(__dirname, "../md", ctx.req.file.filename);
    let data = (await readFile(filePath)).toString(),
        html = md.render(data);
    let name = getFilename(html),
        fpath = path.join(__dirname, "../md", name);
    try {
        if((await stat(fpath)).isFile()) {
            ctx.body = {
                success: false,
                filename: null,
                message: "文件已存在。"
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
            message: `重命名失败：${err.message.replace(__dirname, "./")}。`
        };
        unlink(filePath, err => {
            if(err) {
                console.error("删除失败：", err.message);
            }
        });
        return;
    }
    ctx.body = {
        success: true,
        filename: name, //返回文件名
        message: "上传完成。"
    };
});

module.exports = router;

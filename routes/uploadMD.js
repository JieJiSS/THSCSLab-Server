"use strict";
const router = require("koa-router")();
const path = require("path");
const multer = require('koa-multer');
const md = require('markdown-it')();
const { parseFilename } = require("../scripts/toTitle");

var storage = multer.diskStorage({
    //文件保存路径
    destination: function(req, file, callback) {
        callback(null, path.join(__dirname, "..", "md"));
    },
    //修改文件名称
    filename: function(req, file, callback) {
        console.log(file.encoding);
        let html = md.render(file.buffer.toString(file.encoding));
        console.log(html);
        let filename = html.split(/\<h1\/?\>/im)[1];
        filename = parseFilename(filename);
        console.log("Parsed Filename:", filename);
        return filename;
    }
});
//加载配置
let upload = multer({ storage: storage });
//路由
router.post("/upload-md", upload.single("file"), async (ctx, next) => {
    ctx.body = {
        filename: ctx.req.file.filename //返回文件名
    };
});  

module.exports = router;

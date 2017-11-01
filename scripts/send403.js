"use strict";

const readFile = require("./readFile");
const path = require("path");

async function send403(ctx) {
    ctx.status = 403;
    ctx.type = ".html";
    ctx.body = await readFile(path.join(__dirname, "..", "routes", "views", "403.html"));
    return;
}

module.exports = send403;

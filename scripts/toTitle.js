"use strict";
const PinYin = require("pinyin");

function toTitle (str) {
    let words = str.split("-");
    let pieces = [];
    words.forEach(s => {
        if(s.length < 1)
            return;
        pieces.push(s[0].toUpperCase() + s.substr(1));
    });
    return pieces.join(" ");
}

function parseFilename (fn = "") {
    console.log(fn);
    if(/^[0-9a-zA-Z\.\-\s]+$/.test(fn)) { //全英文标题
        let words = fn.replace(/\.md$/i, "").toLowerCase().split(/\s+/);
        console.log(words);
        return words.join("-") + ".md";
    }
    let joinedPinyin = joinArray(
        PinYin(fn.toLowerCase().replace(/\.md$/i, ""), {
            segment: false,
            style: PinYin.STYLE_NORMAL
        }),
        "-"
    );
    return joinedPinyin.replace(/\s+/g, "-") + ".md";
}

function joinArray(arr, sep=" ") { //dirty hack
    let strs = [];
    arr.forEach(v => {
        v[0] &&
        v[0].trim() &&
        v[0].trim().replace(/[^\w\-\.]/g, "") &&
        strs.push(
            v[0].trim().replace(/[^\w\-\.]/g, "")
        );
    });
    return strs.join(sep);
}

function getFilename(html = "") {
    if(!html.trim()) {
        throw new TypeError("Error In getFilename(...): invalid parameter `html`");
    }
    let filename;
    try {
        filename = html.split(/(\<h1\>|<\/h1>)/i)[2];
    } catch (err) {
        return {
            message: "未能成功分配网址路由：Markdown文件标题解析错误。",
            status: 500,
            stack: "In getFilename(...)"
        }
    }
    filename = parseFilename(filename);
    return filename;
}

module.exports = {
    toTitle,
    parseFilename,
    getFilename,
};

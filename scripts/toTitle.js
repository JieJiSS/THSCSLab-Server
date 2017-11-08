"use strict";
const py = require("pinyin");

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

function parseFilename (fn="") {
    if(!fn) {
        throw new TypeError("parseFilename requires fn: string as the argument.");
    }
    if(/^[0-9a-zA_Z\.\s]+$/.test(fn)) { //English
        let words = fn.replace(/\.md$/i, "").toLowerCase().split(/\s+/);
        return words.join("-") + ".md";
    }
    let joinedPinyin = joinArray(
        py(fn.toLowerCase().replace(/\.md$/i, ""), {
            segment: false,
            style: py.STYLE_TONE2
        }),
        "-"
    );
    return joinedPinyin.replace(/\s+/g, "-") + ".md";
}

function joinArray(arr, sep=" ") {
    let strs = [];
    arr.forEach(v => {
        v[0] && v[0].trim() && strs.push(v[0].trim());
    });
    return strs.join(sep)
}

module.exports = {
    toTitle,
    parseFilename,
};

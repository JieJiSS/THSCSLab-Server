"use strict";

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

module.exports = toTitle;

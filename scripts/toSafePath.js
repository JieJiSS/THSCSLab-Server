"use strict";

function toSafePath(unsafePath) {
    const safePath = decodeURIComponent(
        String(unsafePath)
        .replace(/\s/g, "")
        .replace(/\.{2,}/g, "")
        );
    return safePath;
}

module.exports = toSafePath;

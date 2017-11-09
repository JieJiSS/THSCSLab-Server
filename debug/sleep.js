"use strict";

function sleep(ms=1) {
    return new Promise((resolve, reject) => {
        try {
            setTimeout(resolve, ms);
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = sleep;

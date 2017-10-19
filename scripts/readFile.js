const fs = require("fs");
const promise = require("bluebird");

module.exports = promise.promisify(fs.readFile);
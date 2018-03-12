const { readFileSync } = require("fs");
const { join } = require("path");

const config = {
    database: {
        DATABASE: "nodesql",
        USERNAME: "root",
        PASSWORD: readFileSync(
            join(__dirname, "../", "PSWD.txt")
        ).toString(),
        PORT: "3306",
        HOST: "localhost"
    }
};

module.exports = config;

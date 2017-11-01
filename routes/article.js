const router = require("koa-router")();
const toTitle = require("../scripts/toTitle");

let MongoClient = require("mongodb").MongoClient;
const DB_CONN_STR = require("../scripts/getDB");

let getData = function(db, title) {
    return new Promise((resolve, reject) => {
        // 连接到表 blog
        let collection = db.collection("blog");
        var where = { title: title }; // search by title
        collection.find(where).toArray(function(err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
};

router.prefix("/article");

router.get("/:title", async (ctx, next) => {
    let db = await MongoClient.connect(DB_CONN_STR);
    let result = await getData(db, ctx.params.title);
    db.close();
    let obj = result[0];
    if (obj === null || obj === undefined) {
        obj = {};
        console.log(
            new Date().toJSON() + " - 502 - obj is null or undefined; title =",
            ctx.params.title
        );
    }
    delete obj._id;
    ctx.body = await ctx.render("article", {
        title: toTitle(obj.title),
        description: obj.description,
        main_html: obj.main_html,
        post_date: obj.post_date,
        author: obj.author || ""
    });
});

async function sleep(ms=0) {
    if(typeof ms !== "number")
        throw new TypeError("ms is not a number (in async sleep(...))")
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

module.exports = router;

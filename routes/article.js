const router = require("koa-router")();
const render = require("koa-ejs");

let MongoClient = require("mongodb").MongoClient;
const DB_CONN_STR = "mongodb://localhost:27017/test";

let getData = function(db, title, callback) {
    // 连接到表 blog
    let collection = db.collection("blog");
    var where = {
        title: title, // search by title
    };

    collection.find(where).toArray(function(err, result) {
        if (err) {
            console.log("Error:" + err);
            return;
        }
        callback(result);
    });
};

router.prefix("/article");

router.get("/:title", async (ctx, next) => {
    const title = ctx.params.title;
    let obj;
    MongoClient.connect(DB_CONN_STR, function (err, db) {
        if(err) {
            ctx.throw(502, "Failed to connect to db");
            console.log(new Date(), "- 502 -", err.stack);
            return;
        }
        getData(db, search.title, function (result) {
            db.close();
            obj = result[0];
            if(obj === null || obj === undefined) {
                obj = {};
                console.log(new Date().toJSON() + " - 502 - obj is null or undefined; search.title =", search.title);
            }
            delete obj._id;
            obj.title = search.title;
        });
    });
    //@TODO obj properties export
    ctx.type = ".html";
    ctx.body = await ctx.render("article", {
        real_title,
        description,
        html_body,
        edit_date,
        author,
    });
});

module.exports = router;

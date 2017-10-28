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
    console.log("title");
    await MongoClient.connect(DB_CONN_STR, async function (err, db) {
        if(err) {
            ctx.throw(502, "Failed to connect to db");
            console.log(new Date(), "- 502 -", err.stack);
            return;
        }
        await getData(db, ctx.params.title, async function (result) {
            db.close();
            let obj = result[0];
            if(obj === null || obj === undefined) {
                obj = {};
                console.log(new Date().toJSON() + " - 502 - obj is null or undefined; title =", ctx.params.title);
            }
            delete obj._id;
            //@TODO obj properties export
           // ctx.type = ".html";
            try {
            ctx.body = await ctx.render("article", {
                title: obj.title,
                description: obj.description,
                main_html: obj.main_html,
                post_date: obj.post_date,
                author: obj.author || "",
            });
            } catch(e) { console.log('fail\n'+e)}
        });
    });
});

module.exports = router;

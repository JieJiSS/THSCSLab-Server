"use strict";

let MongoClient = require("mongodb").MongoClient;
const DB_CONN_STR = require("../scripts/getDB");

async function login(session, json) {
    const db = await MongoClient.connect(DB_CONN_STR);
    let coll = db.collection("user");
    return new Promise(async (resolve, reject) => {
        //resolve(await coll.find({username: "1"}).toArray());
        let result = await coll.findOneAndUpdate(
            {
                username: json.username,
                password: json.password
            },
            {
                $set: {
                    username: json.username,
                    hash: json.password,
                    session: session
                }
            }
        );
        if (result.lastErrorObject.updatedExisting === true && result.ok === 1) {
            resolve("success");
        } else if (result.lastErrorObject.updatedExisting === true && result.ok === 0) {
            resolve("write DB failed")
        }
        if (result.lastErrorObject.updatedExisting === false) {
            resolve("wrong authentication");
        }
    });
}

module.exports = login;

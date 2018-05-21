"use strict";

// const fs = require("fs");
const path = require("path");
// const writeFile = require("util").promisify(fs.writeFile);

const LOGIN_CACHE = Object.create(null);
const USER_CACHE_PATH = path.join(__dirname, "../user/", "user.json");
let USER_CACHE = require(USER_CACHE_PATH);

function login(session, json) {
    if(USER_CACHE[json.username] === json.password) {
        LOGIN_CACHE[session] = true;
        return "Login successful.";
    }
}

function logout(session) {
    LOGIN_CACHE[session] = undefined;
}

function isLogin(session) {
    if(LOGIN_CACHE[session]) {
        return true;
    }
    return false;
}

function recache() {
    USER_CACHE = require(USER_CACHE_PATH);
}

function adduser(username, password_hash) {
    password_hash = password_hash.toLowerCase();
    if(username.trim() === "")
        return "Error: Invalid username.";
    if(username.trim().length > 32)
        return "Error: Username too long.";
    if(password_hash.length !== 64 || !isValidSHA256(password_hash))
        return "Error: Password hash check failed.";
    USER_CACHE = require(USER_CACHE_PATH);
    if(username in USER_CACHE)
        return "Error: This user already exists.";
    USER_CACHE[username] = password_hash;
}

function isValidSHA256(hash) {
    return /^[a-z0-9]{64}$/.test(hash);
}

module.exports = {
    login,
    isLogin,
    adduser,
    recache,
};

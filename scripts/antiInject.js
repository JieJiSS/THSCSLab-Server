function antiInject(str) {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

module.exports = antiInject;

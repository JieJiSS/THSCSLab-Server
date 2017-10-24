function getExt(str="") {
    if(!str || !String(str).trim())
        return "";
    let arr = String(str).trim().split(".");
    if(arr.length === 1) {
        return "";
    } else {
        return "." + arr[arr.length - 1];
    }
}

module.exports = getExt;

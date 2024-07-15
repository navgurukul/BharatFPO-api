const uuid = require('uuid');
const fs = require("fs");
const https = require('https');
const http = require('http');
const urlencode = require("urlencode");
const { APP_DIR_PATH } = process.env;
const baseDir = (APP_DIR_PATH ? APP_DIR_PATH : "") + "uploads/";
// const baseDir = "uploads/";
const generateSignedUrl = function (data) {
    return new Promise((resolve, reject) => {
        let dir = data["headers"].type ? "resource" : "objects";

        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir);
        }
        if (!fs.existsSync(baseDir + dir)) {
            fs.mkdirSync(baseDir + dir);
        }
        // extract file_name, file_extension, file_alias
        let file_name = data.file_name;
        let file_extension = file_name.substring(file_name.lastIndexOf('.'));
        if ([".jpeg", ".jpg", ".png", ".pdf", ".mp4", ".avi", ".mov"].includes(file_extension)) {
            let file_alias = dir + "/" + uuid.v4() + file_extension;
            try {
                fs.closeSync(fs.openSync(baseDir + file_alias, 'w'));
                // url and file_alias has been created
                data["url"] = data.host + "/api/putDataIntoFile?path=" + urlencode(file_alias);
                data["file_alias"] = data.host + "/" + file_alias;
                delete data["headers"]
                resolve(data)
            } catch (e) {
                reject(e);
            }
        } else {
            reject({ "success": false, "message": "Allowed jpeg,jpg,png and pdf" })
        }
    });
}
const putData = function (filepath, req) {
    let path = baseDir + filepath;
    return new Promise(async (resolve, reject) => {
        try {
            let p = urlencode.decode(path);
            let size = getFilesizeInBytes(p);
            if (!size) {
                // if file size is empty, means data is not present in file then write to file
                let stream = createWriteStreamSync(p, { flags: 'a' });
                req.on("data", (chunk) => {
                    stream.write(chunk);
                });
                req.on("end", () => {
                    stream.end();
                    resolve("uploaded");
                })
            } else {
                resolve("Already uploaded:" + size);
            }
        } catch (e) {
            console.log("Exception", e);
            reject(e);
        }
    });
}
const createWriteStreamSync = function (file, options) {
    if (!options)
        options = {};
    if (!options.flags)
        options.flags = 'w';
    if (!options.fd)
        options.fd = fs.openSync(file, options.flags);
    return fs.createWriteStream(null, options);
}
const getFilesizeInBytes = function (filename) {
    var stats = fs.statSync(filename)
    var fileSizeInBytes = stats["size"]
    return fileSizeInBytes
}
const downloadFileToDisk = function (url, _cb) {
    let fileName = url ? (url.split("/").length ? url.split("/")[(url.split("/").length - 1)] : url.split("/")[0]) : null;
    let dest = "/tmp/" + fileName;
    var file = fs.createWriteStream(dest);
    let isHttps = url.includes("https");
    if (isHttps) {
        https.get(url, function (response) {
            response.pipe(file);
            file.on('finish', function () {
                file.close(function () {
                    _cb(null, file)
                });  // close() is async, call cb after close completes.
            });
        });
    } else {
        http.get(url, function (response) {
            response.pipe(file);
            file.on('finish', function () {
                file.close(function () {
                    _cb(null, file)
                });  // close() is async, call cb after close completes.
            });
        });
    }

}
module.exports = {
    generateSignedUrl: generateSignedUrl,
    putData: putData,
    downloadFileToDisk: downloadFileToDisk
}

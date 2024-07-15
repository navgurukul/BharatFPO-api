const CreateLogs = require('../model/CreateLogs');
module.exports.createRequest = async function (req, res) {
    let d = res['__custombody__'] ? JSON.parse(res['__custombody__']) : {};
    if (req.method && req.method !== "GET") {
        CreateLogs.create({
            reqId: req.logsUniqueId,
            userId: req.user ? req.user.id : null,
            loginId: req.user ? req.user.loginId : null,
            token: req.headers['x-access-token'] ? req.headers['x-access-token'] : null,
            reqTimestamp: req.reqTimestamp,
            ReqMethod: req.method,
            reqPath: req.url,
            reqData: JSON.stringify({
                "params": req.params,
                "body": req.body,
                "query": req.query
            }),
            resTimetaken: (new Date() - req.reqTimestamp),
            resHttpStatus: res.statusCode,
            resData: res['__custombody__'] ? res['__custombody__'] : "",
            resTimestamp: d ? d['timestamp'] : ""
        }).then((res) => {
            return { "message": "request logs created successfully" };
        }).catch(err => {
            return { "message": "request logs created successfully" };
        })
    } else {
        return { "message": "request logs created successfully" };
    }
}
module.exports.setResponseBody = (req, res, next) => {
    const oldWrite = res.write,
        oldEnd = res.end,
        chunks = [];
    res.write = function (chunk) {
        chunks.push(Buffer.from(chunk));
        oldWrite.apply(res, arguments);
    };
    res.end = function (chunk) {
        if (chunk) {
            chunks.push(Buffer.from(chunk));
        }
        const body = Buffer.concat(chunks).toString('utf8');
        res.__custombody__ = body;
        oldEnd.apply(res, arguments);
    };
    next();
};
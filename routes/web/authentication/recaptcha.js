const CAPTCHA = require("../../../config").CAPTCHA;
const request = require("request");

module.exports = (req, res, next) => {
    if (req.headers.host && (req.headers.host.includes("localhost:5051") || req.headers.host.includes("127.0.0.1"))) {
        next();
    } else {
        if (!CAPTCHA || !CAPTCHA.SECRET_KEY) {
            return res.BadRequest({},"Secret key not found");
        }
        const secret_key = CAPTCHA.SECRET_KEY;

        // if (!req.body || !req.body.recaptcha) {
        //     return res.BadRequest({},"reCAPTCHA is empty or invalid");
        // }
        const token = req.body.recaptcha;
        const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${token}&remoteip=${req.connection.remoteAddress}`;
        request(url, function (err, response, body) {
            body = JSON.parse(body);
            if (body.success !== undefined && !body.success) {
                return res.BadRequest({},"reCAPTCHA failed",401);
            }
            next();
        });
    }
};

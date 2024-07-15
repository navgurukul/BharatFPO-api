const rateLimit = require("express-rate-limit");

module.exports.apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    max: 100
});
const express = require('express');
const router = express.Router();

const getSignedUrl = require("./getSignedUrl");
const putDataIntoFile = require("./putDataIntoFile");

const config = require('../../config/index');
const rateLimit = require("express-rate-limit");
const apiLimiter = rateLimit(config.rateLimit);

/* GET Signed Url to upload content. */
router.post('/getSignedUrl', apiLimiter, getSignedUrl);

// Upload content of file to particular path provided by getSignedUrl
router.put('/putDataIntoFile', putDataIntoFile);
router.post('/putDataIntoFile', putDataIntoFile);
router.put('/putDataIntoFile/:path', putDataIntoFile);

module.exports = router;

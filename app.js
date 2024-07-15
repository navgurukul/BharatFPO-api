require("rootpath")();
var express = require('express');
var app = express();
const morgan = require("morgan");
const path = require('path');
const dotenv = require('dotenv').config({ path: path.join(__dirname, ".env") });
var bodyParser = require('body-parser');
var webRoutes = require("./routes/web/routes");
const Send = require("./response/send");
var cors = require('cors');
require('./initialization');
require('./errorHandling/process');
app.use(morgan('dev'));
app.use(cors());

global._const = require('./routes/utils/constant');
app.use(bodyParser.json({ limit: "10mb", extended: true }));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: "10mb",
    parameterLimit: 50000
}));
app.get('/', async (req, res) => {
    res.send('Welcome peeps !');
});

app.use(Send);
// app.use(checkSpecialCharacter);
app.use("/web/api", webRoutes);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

//An error handling middleware
app.use((err, req, res, next) => {
    res.status(400);
    res.json({ message: "Oops, something went wrong.", err })
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    return res.BadRequest({}, "Page not found!");
});

(function () {
    var _log = console.log;
    var _error = console.error;
    var _warning = console.warning;

    console.error = function (errMessage) {
        _error.apply(console, arguments);
    };

    console.log = function (logMessage) {
        if (process.env.ENV == 'production') return;
        _log.apply(console, arguments);
    };

    console.warning = function (warnMessage) {
        _warning.apply(console, arguments);
    };
})();

module.exports = app;

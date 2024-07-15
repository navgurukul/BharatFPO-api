#!/usr/bin/env node

/**
 * Module dependencies.
 */
const cluster = require('cluster');
const path = require("path");
var app = require('./app');
require("dotenv").config({ path: path.join(__dirname, ".env") });
const numCPUs = process.env.ENV == "development" ? 1 : require('os').cpus().length;

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
        process.exit(1)
    });
} else {
    var debug = require('debug')('manyata_web_api:server');
    var http = require('http');

    /**
     * Get port from environment and store in Express.
     */

    var port = normalizePort(process.env.PORT || '4000');
    app.set('port', port);
    console.log(`Server has started at port: ${port}...`);
    /**
     * Create HTTP server.
     */

    var server = http.createServer(app);
    server.timeout = 5 * 60 * 1000;
    /**
     * Listen on provided port, on all network interfaces.
     */

    server.listen(port, '0.0.0.0');
    server.on('error', onError);
    server.on('listening', onListening);

    /**
     * Normalize a port into a number, string, or false.
     */

    function normalizePort(val) {
        var port = parseInt(val, 10);

        if (isNaN(port)) {
            // named pipe
            return val;
        }

        if (port >= 0) {
            // port number
            return port;
        }

        return false;
    }

    /**
     * Event listener for HTTP server "error" event.
     */

    function onError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        var bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Event listener for HTTP server "listening" event.
     */

    function onListening() {
        var addr = server.address();
        var bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        debug('Listening on ' + bind);
    }
    console.log(`Worker ${process.pid} started`);
}
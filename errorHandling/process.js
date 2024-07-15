process.on("syntaxError", function (err) {
    console.log("SyntaxError Node NOT Exiting...", err.stack);
});
process.on("uncaughtException", function (err) {
    console.log("Node NOT Exiting...", err);
});
process.on("unhandledRejection", (reason, promise) => {
    console.log("Unhandled Rejection =>\n", reason.stack || reason);
    // Recommended: send the information to sentry.io
    // or whatever crash reporting service you use
});
process.on("doesNotExist", (reason, promise) => {
    console.log("doesNotExist Rejection at:", reason.stack || reason);
    // Recommended: send the information to sentry.io
    // or whatever crash reporting service you use
});
process.on("ServiceUnavailableError", (reason, promise) => {
    console.log("ServiceUnavailableError Rejection at:", reason.stack || reason);
    // Recommended: send the information to sentry.io
    // or whatever crash reporting service you use
});
process.on('UnhandledPromiseRejectionWarning', () => {
    console.log("[UnhandledPromiseRejectionWarning]:", reason.stack || reason);
})
process.on("exit", (code) => {
    console.log(`About to exit with code: ${code}`);
});
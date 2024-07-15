var fs = require("fs");
var dirArr = ["public", "uploads"];
(() => {
    dirArr.forEach((dir, index) => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
            console.log("Created Dir", dir);
        }
    });
})();

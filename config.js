var fs = require("fs");
var path = require("path");
var defpath = path.join(__dirname, "/plugins/test_fixtures");

module.exports =  [
    {
        packagePath: "./plugins/express",
        host: process.env.IP || "0.0.0.0",
        port: process.env.PORT || 8100
    },
    {
        packagePath: "./plugins/parser-http",
        prefix: "/c/jan"
    },
    {
        packagePath: "./plugins/parser",
        definitions: fs.readdirSync(defpath).map(function (d) {
            return path.join(defpath, d);
        })
    }
];
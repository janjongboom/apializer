var express = require("express");
var assert = require("assert");

module.exports = function (options, imports, register) {
    assert(options.port, "Option 'port' is required");
    assert(options.host, "Option 'host' is required");
    
    var app = express();
    app.listen(options.port, options.host);
    
    app.get("/", function (req, res) {
        res.writeHead(200);
        res.end("Hello from Scrapey");
    });
    
    app.getModule = function () {
        return express;
    };
    
    register(null, {
        express: app
    });
};
var assert = require("assert");

module.exports = function setup (options, imports, register) {
    assert(options.prefix, "Option 'prefix' is required");
    
    var express = imports.express;
    
    console.log("web-plugin shit", express.getModule());
    
    express.use(options.prefix, express.getModule().router(function (app) {
        console.log("blah", options.prefix);
        app.get("/", function (req, res, next) {
            console.log(req);
            res.end("OK");
        });
        
    }));
    
    register();
};
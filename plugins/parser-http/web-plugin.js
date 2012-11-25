var assert = require("assert");
var request = require("request");

module.exports = function setup (options, imports, register) {
    assert(options.prefix, "Option 'prefix' is required");
    
    var app = imports.express;
    var parser = imports.parser;
            
    app.get(options.prefix + "/", function (req, res, next) {
        if (!req.query.url) return next("?url should be specified");
        
        parser.findHandler(req.query.url, function (err, handler) {
            if (err) return next(err);
            
            request.get(req.query.url, function (err, resp, body) {
                if (err) return next(err);
                if (resp.statusCode < 200 || resp.statusCode > 300) {
                    return next("Response should be 2xx but was " + resp.statusCode);
                }
                
                parser.parsePage(body, handler, function (err, feed) {
                    if (err) return next(err);
                    
                    res.writeHead(200, { "Content-Type": "application/json" });
                    if (req.query.callback) {
                        res.end(req.query.callback + "(" + JSON.stringify(feed, null, 4) + ")");
                    }
                    else {
                        res.end(JSON.stringify(feed, null, 4));
                    }
                });
            });
        });
    });
    
    register();
};
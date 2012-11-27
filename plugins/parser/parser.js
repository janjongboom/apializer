var Url = require("url");
var jsdom = require("jsdom");
var fs = require("fs");

module.exports = function (cache) {
    var self = this;
    
    this.cache = cache;
    
    this.parseUrl = function (url) {
        url = Url.parse(url);
        return {
            host: url.host,
            path: url.path
        };
    };
        
    this.findHandler = function (url, callback) {
        var parsed = self.parseUrl(url);
        var host = parsed.host;
        var path = parsed.path;
        
        var res = self.cache
            .filter(function (c) {
                return c.host.test(host);
            })
            .filter(function (c) {
                return c.path.test(path);
            });
        
        if (res.length > 1) {
            return callback("Multiple handlers found " + 
                res.map(function (r) { return r.name; }).join(","));
        }
        else if (res.length === 0) {
            return callback("No handlers found");
        }
        else {
            return callback(null, res[0]);
        }
    };
    
    this.parsePage = function (html, handler, callback) {
        self.instantiateJsdom(html, function (err, $) {
            if (err) return callback(err);
            
            var res = {};
            
            Object.keys(handler.extract).forEach(function (key) {
                try {
                    res[key] = handler.extract[key]($);
                    // now trim all strings
                    self.trimAllStrings(res[key]);
                }
                catch (ex) {
                    console.error("Parsing", key, "failed", ex);
                    res[key] = undefined;
                }
            });
            
            callback(null, res);
        });
    };
    
    this.instantiateJsdom = function (html, callback) {
        jsdom.env(html, [ __dirname + "/jquery.js" ], function(err, window) {
            if (err) return callback(err);
            
            callback(null, window.$);
        });
    };
    
    this.trimAllStrings = function (obj) {
        for (var k in obj) {
            if (!obj.hasOwnProperty(k)) continue;
            
            if (typeof obj[k] === "string")
                obj[k] = obj[k].trim();
            
            if (typeof obj[k] === "object")
                self.trimAllStrings(obj[k]);
        }
    };
};
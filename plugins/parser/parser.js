var Url = require("url");
var jsdom = require("jsdom");

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
        
    this.findHandler = function (host, path, callback) {
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
                res[key] = handler.extract[key]($);
            });
            
            callback(null, res);
        });
    };
    
    this.instantiateJsdom = function (html, callback) {
        jsdom.env(html, ["http://code.jquery.com/jquery.js"], function(err, window) {
            if (err) return callback(err);
            
            callback(null, window.$);
        });
    };
};
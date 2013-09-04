var Url = require("url");
var cheerio = require("cheerio");

module.exports = function (cache) {
    var self = this;
    
    this.cache = cache;
    
    this.parseUrl = function (url) {
        url = Url.parse(url);
        return url;
    };
        
    this.findHandler = function (url, $) {
        var parsedUrl = self.parseUrl(url);
        
        var res = self.cache
            .filter(function (c) {
                return c.matches(parsedUrl, $);
            });
            
        if (res.length > 1) {
            throw "Multiple handlers found " + 
                res.map(function (r) { return r.name; }).join(",");
        }
        else if (res.length === 0) {
            throw "No handlers found";
        }
        else {
            return res[0];
        }
    };
    
    this.parsePage = function (html, url, callback) {
        var $ = cheerio.load(html);
        var handler;
        try {
            handler = this.findHandler(url, $);
        }
        catch (ex) {
            return callback(ex);
        }
        
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
        
        callback(null, res, handler.name);
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
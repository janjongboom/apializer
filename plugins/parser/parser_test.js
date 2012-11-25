"use strict";

var assert = require("assert");
var Parser = require("./parser");
var request = require("request");

var ParserTest = function () {
    var parser, nuArticleHandler;
    
    this.timeout = 5000;
    
    this.setUp = function () {
        nuArticleHandler = require(__dirname + "/../test_fixtures/nu_nl_article");
        var cache = [
            nuArticleHandler
        ];
        
        parser = new Parser(cache);
    };
    
    this["test parsing nu.nl URL should give nu.nl and path"] = function(next) {
        var url = parser.parseUrl("http://www.nu.nl/sport/2966684/spits-hoesen-in-basis-ajax-roda-jc.html");
        assert.equal(url.host, "www.nu.nl");
        assert.equal(url.path, "/sport/2966684/spits-hoesen-in-basis-ajax-roda-jc.html");
        
        next();
    };
    
    this["test should get correct handler for nu.nl article"] = function(next) {
        parser.findHandler("nu.nl", "/cat/12345/title", function (err, handler) {
            assert.equal(err, null);
            assert.equal(handler.name, "Nu.nl article");
            
            next();
        });
    };
    
    this["test jsDom injection should pass"] = function(next) {
        var url = "http://www.nu.nl/lifestyle/2966302/yoko-ono-ontwerpt-mannencollectie-opening-ceremony.html";
        
        request.get(url, function (err, res, body) {
            assert.equal(err, null);
            assert.equal(res.statusCode, 200);
            
            parser.instantiateJsdom(body, function (err, $) {
                assert.equal(err, null);
                assert.equal(typeof $.ajax, "function");
                next();
            });
        });
    };
    
    this["test parsing nunl article"] = function(next) {
        var url = "http://www.nu.nl/lifestyle/2966302/yoko-ono-ontwerpt-mannencollectie-opening-ceremony.html";
        
        // todo mock this away
        request.get(url, function (err, res, body) {
            assert.equal(err, null);
            assert.equal(res.statusCode, 200);
            
            parser.parsePage(body, nuArticleHandler, function (err, data) {
                assert.equal(err, null);
                
                assert.equal(data.title, "Yoko Ono ontwerpt mannencollectie voor Opening Ceremony");
                assert.notEqual(data.image, null);
                assert.equal(data.image.width, 132);
                assert.equal(data.image.height, 132);
                assert.equal(data.image.src, "http://media.nu.nl/m/m1nx3bvalvan_sqr256.jpg");
                assert.equal(data.content.substr(0, 9), "AMSTERDAM");
                
                next();
            });
        });
    };
};

module.exports = new ParserTest();

!module.parent && require("asyncjs").test.testcase(module.exports).exec();
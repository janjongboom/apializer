"use strict";

var assert = require("assert");
var Parser = require("./parser");
var request = require("request");
var fs = require("fs");
var async = require("async");

var ParserTest = function () {
    var parser, articleHandlers = {};
    
    this.timeout = 5000;
    
    this.setUp = function (next) {
        async.map([
            "nu_nl_article.js",
            "cnn_article.js"
        ], function(file, next) {
            fs.readFile(__dirname + "/../test_fixtures/" + file, "utf8", function(err, data) {
                if (err) return next(err);
                
                var handler = new Function(data)();
                articleHandlers[file] = handler;
                
                next(null, handler);
            });
        }, function(err, handlers) {
            assert.equal(err, null);
            
            parser = new Parser(handlers);
            
            next();
        });
    };
    
    this["test parsing nu.nl URL should give nu.nl and path"] = function(next) {
        var url = parser.parseUrl("http://www.nu.nl/sport/2966684/spits-hoesen-in-basis-ajax-roda-jc.html");
        assert.equal(url.host, "www.nu.nl");
        assert.equal(url.path, "/sport/2966684/spits-hoesen-in-basis-ajax-roda-jc.html");
        
        next();
    };
    
    // this["test should get correct handler for nu.nl article"] = function(next) {
    //     parser.findHandler("http://nu.nl/cat/12345/title", function (err, handler) {
    //         assert.equal(err, null);
    //         assert.equal(handler.name, "Nu.nl article");
            
    //         next();
    //     });
    // };
    
    // this["test parsing nunl article"] = function(next) {
    //     var url = "http://www.nu.nl/lifestyle/2966302/yoko-ono-ontwerpt-mannencollectie-opening-ceremony.html";
        
    //     // todo mock this away
    //     request.get(url, function (err, res, body) {
    //         assert.equal(err, null);
    //         assert.equal(res.statusCode, 200);
            
    //         parser.parsePage(body, articleHandlers["nu_nl_article.js"], function (err, data) {
    //             assert.equal(err, null);
                
    //             assert.equal(data.title, "Yoko Ono ontwerpt mannencollectie voor Opening Ceremony");
    //             assert.notEqual(data.image, null);
    //             assert.equal(data.image.width, 132);
    //             assert.equal(data.image.height, 132);
    //             assert.equal(data.image.src, "http://media.nu.nl/m/m1nx3bvalvan_sqr256.jpg");
    //             assert.equal(data.content.substr(0, 9), "AMSTERDAM");
                
    //             next();
    //         });
    //     });
    // };
    
    // this["test parsing cnn article"] = function(next) {
    //     var url = "http://www.cnn.com/2013/05/07/us/ohio-missing-women-found/index.html?npt=NP1";
        
    //     // todo mock this away
    //     request.get(url, function (err, res, body) {
    //         assert.equal(err, null);
    //         assert.equal(res.statusCode, 200);
            
    //         parser.parsePage(body, articleHandlers["cnn_article.js"], function (err, data) {
    //             assert.equal(err, null);
                
    //             assert.equal(data.title, "'I never forgot about you': Families reunite with women held captive for years");
    //             assert.equal(data.image, "http://i2.cdn.turner.com/cnn/dam/assets/130506221101-georgina-gina-dejesus-story-top.png");
    //             assert.equal(data.body.substr(0, 8), "For more");
                
    //             next();
    //         });
    //     });
    // };
    
    this["test trimAllStrings should trim all strings"] = function (next) {
        var testObj = {
            first: "    hoi   ",
            second: {
                tra: {
                    hoi: "   pietje"
                },
                jodiela: "asdsad "
            },
            third: "sup",
            fourth: "nada    "
        };
        
        parser.trimAllStrings(testObj);
        
        assert.equal(testObj.first, "hoi");
        assert.equal(testObj.second.tra.hoi, "pietje");
        assert.equal(testObj.second.jodiela, "asdsad");
        assert.equal(testObj.third, "sup");
        assert.equal(testObj.fourth, "nada");
        
        next();
    };
};

module.exports = new ParserTest();

!module.parent && require("asyncjs").test.testcase(module.exports).exec();
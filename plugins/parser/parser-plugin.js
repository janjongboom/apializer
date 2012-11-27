var assert = require("assert");
var Parser = require("./parser");
var async = require("async");
var definitionChecker = require("./definition-checker").check;
var fs = require("fs");

module.exports = function(options, imports, register) {
    assert.equal(options.definitions instanceof Array, true, "Option 'definitions' is required");

    async.map(options.definitions, function (item, next) {
        fs.readFile(item, "ascii", function (err, data) {
            if (err) return next(err);
            
            // i know its evil, have to add proper protection to this stuff
            var definition = new Function(data)();
            definitionChecker(definition, function (err) {
                if (err) return next(err);
                
                next(null, definition);
            });
        });
    }, function (err, files) {
        if (err) return register(err);
        
        var parser = new Parser(files);
        
        register(null, {
            "parser": parser
        });
    });
};
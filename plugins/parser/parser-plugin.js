var assert = require("assert");
var Parser = require("./parser");
var async = require("async");

module.exports = function(options, imports, register) {
    assert.equal(options.definitions instanceof Array, true, "Option 'definitions' is required");

    async.map(options.definitions, function (item, next) {
        var reqd, err;
        
        try {
            reqd = require(item);
        }
        catch (ex) {            
            err = ex;
        }
        
        next(err, reqd);
    }, function (err, files) {
        if (err) return register(err);
        
        var parser = new Parser(files);
        
        register(null, {
            "parser": parser
        });
    });
};

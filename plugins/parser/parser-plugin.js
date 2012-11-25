var assert = require("assert");
var Parser = require("./parser");
var asyncjs = require("asyncjs");

module.exports = function(options, imports, register) {
    assert.equal(options.definitions instanceof Array, true, "Option 'definitions' is required");

    asyncjs.list(options.definitions).map(function (item, next) {
        try {
            next(null, require(item));
        }
        catch (ex) {
            next(ex);
        }
    }).end(function (err, files) {
        if (err) return register(err);
        
        var parser = new Parser(files);
        
        register(null, parser);
    });
};

var assert = require("assert");
var createWebBinding = require("./web");
var Parser = require("./parser");
var async = require("async");
var definitionChecker = require("./definition-checker").check;

module.exports = function setup (options, imports, register) {
    assert(options.prefix, "Option 'prefix' is required");
    assert(options.definitions instanceof Array, "Option 'definitions' is required");
    assert(options.allowedHeaders instanceof Array, "Option 'allowedHeaders' is required");
    assert(options.maxRequestSize, "Option 'maxRequestSize' is required");

    var app = imports.express;
    
    async.map(options.definitions, function (item, next) {
        // i know its evil, have to add proper protection to this stuff
        var definition = new Function(item)();
        definitionChecker(definition, function (err) {
            if (err) return next(err);
            
            next(null, definition);
        });
    }, function (err, files) {
        if (err) return register(err);
        
        var parser = new Parser(files);
        
        // now attach the parser to a URL
        var web = createWebBinding(app, parser, options.prefix, options.allowedHeaders,
          options.maxRequestSize);
        
        register(null, {
            onDestroy: function() {
                console.log('destroying', options.prefix);
                web.unregister();
            }
        });
    });
};
var assert = require("assert");
var createWebBinding = require("./web");
var async = require("async");
var definitionChecker = require("./definition-checker").check;
var vm = require('vm');

module.exports = function setup (options, imports, register) {
    assert(options.prefix, "Option 'prefix' is required");
    assert(options.definitions instanceof Array, "Option 'definitions' is required");
    assert(options.allowedHeaders instanceof Array, "Option 'allowedHeaders' is required");
    assert(options.maxRequestSize, "Option 'maxRequestSize' is required");

    var app = imports.express;

    async.map(options.definitions, function (item, next) {
        // this is not perfect, need parser that doesnt execute...
        // as we do all execution in parser-worker.js
        var definition = vm.createContext({});
        vm.runInContext(item, definition);

        definitionChecker(definition, function (err) {
            if (err) return next(err);

            next(null, definition);
        });
    }, function (err, files) {
        if (err) return register(err);

        var parsePage = imports.parser.parsePage.bind(imports.parser,
          options.definitions);

        // now attach the parser to a URL
        var web = createWebBinding(app, parsePage, options.prefix,
          options.allowedHeaders, options.maxRequestSize);

        register(null, {
            onDestroy: function() {
                console.log('destroying', options.prefix);
                web.unregister();
            }
        });
    });
};
var assert = require("assert");

module.exports = {
    check: function (definition, callback) {
        try {
            assert.equal(definition.version, "1.0.0", "version");
            assert.equal(typeof definition.name, "string", "Type of name");
            assert.equal(definition.host instanceof RegExp, true, "host instanceof RegExp");
            assert.equal(definition.path instanceof RegExp, true, "path instanceof RegExp");
            assert.equal(typeof definition.extract, "object", "Type of extract");
            
            assert.equal(Object.keys(definition.extract).every(function (k) {
                return typeof definition.extract[k] === "function";
            }), true, "All keys on extract are functions");
        }
        catch (ex) {
            if (ex.name === "AssertionError")
                return callback(ex.message + " should be '" + ex.expected + "' but was '" + ex.actual + "'");
            else
                return callback(ex);
        }
        
        callback();
    }
};
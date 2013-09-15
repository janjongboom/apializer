var assert = require("assert");

module.exports = {
  check: function(definition, callback) {
    try {
      // assert.equal(definition.version, "1.0.0", "version");
      assert.equal(typeof definition.name, "string", "Type of name");
      assert.equal(typeof definition.matches, "function", "Type of function");

      if (typeof definition.extract === 'object') {
        assert.equal(Object.keys(definition.extract).every(function(k) {
          return typeof definition.extract[k] === "function";
        }), true, "All keys on extract are functions");
      }
      else if (typeof definition.extract !== 'function') { // not function and not object?
        throw "Type of extract";
      }
    }
    catch (ex) {
      if (ex.name === "AssertionError") {
        return callback(ex.message + " should be '" + ex.expected + "' but was '" + ex.actual + "'");
      }
      else {
        return callback(ex);
      }
    }

    callback();
  }
};
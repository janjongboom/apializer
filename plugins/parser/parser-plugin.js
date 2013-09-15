var Parser = require('./parser');
var assert = require('assert');

module.exports = function(options, imports, register) {
  assert(options.maxRequestTime, "Option 'maxRequestTime' is required");

  var p = new Parser(options.maxRequestTime);
  register(null, {
    'parser': p
  });
};

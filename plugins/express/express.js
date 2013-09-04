var express = require("express");
var assert = require("assert");

module.exports = function(options, imports, register) {
  assert(options.port, "Option 'port' is required");
  assert(options.host, "Option 'host' is required");

  var app = express();

  // https://gist.github.com/jonsullivan/3126319
  var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Accept, Origin, Referer, User-Agent, Content-Type, Authorization, X-Mindflash-SessionID');

    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
  };

  app.use(allowCrossDomain);
  app.disable('x-powered-by');

  app.listen(options.port, options.host);

  app.get("/", function(req, res) {
    res.writeHead(200);
    res.end("Hello from Scrapey");
  });

  register(null, {
    express: app
  });
};
var express = require("express");
var Path = require('path');
var request = require("request");

module.exports = function(options, imports, register) {
  var app = imports.express;
  
  app.use(express.static(Path.join(__dirname, 'static')));
  app.use('/preview', express.bodyParser());
  
  app.post('/preview', function(req, res, next) {
    // @todo add cors
    getReq(req.body.url, function(err, body) {
      if (err) return next(err);
      
      imports.parser.parsePage([req.body.definition], body, req.body.url, function(err, feed, handler) {
        if (err) return next(err);
        
        res.end(JSON.stringify(feed, null, 4));
      });
    });
  });
  
  register(null, {
    'website': {}
  });
};

function getReq(url, callback) {
  request.get({
    url: url,
    encoding: null, // get data back as buffer
  }, function(err, res, body) {
    if (err) {
      return callback(err);
    }
    if (res.statusCode < 200 || res.statusCode >= 300) {
      return callback('Response statuscode was ' + res.statusCode + ' but expected 2xx');
    }
    callback(null, body);
  });
}
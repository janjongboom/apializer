var request = require('request');
var httpProxy = require('http-proxy');
var Url = require('url');

module.exports = function(app, parser, prefix) {
  var proxy = new httpProxy.RoutingProxy();

  app.all(prefix + '/', function(req, res, next) {
    var _next = next;
    next = function() {
      res.writeHead = _writeHead;
      res.write = _write;
      res.end = _end;

      _next.apply(this, arguments);
    };

    if (!req.query.url) {
      return next('?url should be specified');
    }

    var parsedUrl = Url.parse(req.query.url);
    var proxyOptions = {
      host: parsedUrl.host,
      port: parsedUrl.port || 80
    };

    req.url = parsedUrl.path;

    res.writeHead = function(code) {
      responseCode = code;
    };

    var _writeHead = res.writeHead.bind(res);
    var _write = res.write.bind(res);
    var _end = res.end.bind(res);

    var buffers = [];
    var totalLength = 0;
    var responseCode;

    console.log('proxying', req.url, proxyOptions);

    res.write = function(chunk, encoding) {
      totalLength += chunk.length;
      if (totalLength > 2 * 1024 * 1024) {
        console.log('request too big');

        res.writeHead = _writeHead;
        res.write = _write;
        res.end = _end;

        buffers = null;

        return next('Request exceeds maximum of 10 bytes');
      }
      console.log('write', chunk.length, encoding);
      buffers.push(chunk);
    };

    res.end = function(chunk, encoding) {
      console.log('end', chunk && chunk.length, encoding);
      var body = Buffer.concat(buffers).toString('utf8');
      console.log('i has body', body.substr(0, 100));

      parser.parsePage(body, req.query.url, function(err, feed, handlerName) {
        if (err) return next(err);

        res.setHeader('Content-Type', 'application/json; charset=utf8');
        res.setHeader('Scrapey-Handler', handlerName);

        console.log('writing head', responseCode, res._headers);
        _writeHead(responseCode);

        if (req.query.callback) {
          _write(req.query.callback + "(" + JSON.stringify(feed, null, 4) + ")");
        }
        else {
          _write(JSON.stringify(feed, null, 4));
        }
        _end();
      });
    };

    return proxy.proxyRequest(req, res, proxyOptions);
  });

    // request.get({
    //   uri: req.query.url,
    //   method: 'GET',
    //   encoding: 'utf8'
    // }, function(err, resp, body) {
    //   if (err) return next(err);
    //   if (resp.statusCode < 200 || resp.statusCode > 300) {
    //     return next("Response should be 2xx but was " + resp.statusCode);
    //   }

    //   parser.parsePage(body, req.query.url, function(err, feed, handlerName) {
    //     if (err) return next(err);

    //     res.writeHead(200, {
    //       "Content-Type": "application/json; charset=utf8",
    //       "Scrapey-Handler": handlerName
    //     });

    //   });
    // });

  console.log('Listening on', prefix);

  return {
    /**
     * Unregisters the URL
     */
    unregister: function() {
      Object.keys(app.routes).forEach(function(verb) {
        var route = app.routes[verb].filter(function(r) {
          return r.path === prefix + "/";
        })[0];
        if (route) {
          app.routes[verb].splice(app.routes[verb].indexOf(route), 1);
        }
      });
    }
  };
};
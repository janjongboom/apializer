var httpProxy = require('http-proxy');
var Url = require('url');
var chardet = require('chardet');
var Iconv  = require('iconv').Iconv;

module.exports = function(app, parser, prefix, allowedHeaders, maxRequestSize) {
  var proxy = new httpProxy.RoutingProxy();

  app.all(prefix + '/', function(req, res, next) {
    if (!req.query.url) {
      return next('?url should be specified');
    }

    var parsedUrl = Url.parse(req.query.url);
    var proxyOptions = {
      changeOrigin: true,
      target: {
        host: parsedUrl.host,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        https: parsedUrl.protocol === 'https:'
      },
      enable: {
        xforward: false
      }
    };

    req.url = parsedUrl.path;
    // we don't want people sending us gzip'ed stuff
    delete req.headers['accept-encoding'];

    var _setHeader = res.setHeader.bind(res);
    var _writeHead = res.writeHead.bind(res);
    var _write = res.write.bind(res);
    var _end = res.end.bind(res);

    var buffers = [];
    var totalLength = 0;
    var responseCode;

    function resetRes() {
      res.setHeader = _setHeader;
      res.writeHead = _writeHead;
      res.write = _write;
      res.end = _end;
    }

    var _next = next;
    next = function(err) {
      resetRes();

      _next(err);
    };

    res.setHeader = function(name, value) {
      // dont leak headers from client except if theyre in the list
      if (allowedHeaders.indexOf(name) === -1)
        return;

      _setHeader.apply(this, arguments);
    };

    res.writeHead = function(code) {
      responseCode = code;
    };

    res.write = function(chunk, encoding) {
      totalLength += chunk.length;
      if (totalLength > maxRequestSize) {
        buffers = null;

        return next('Request exceeds maximum of ' + maxRequestSize + ' bytes');
      }
      buffers.push(chunk);
    };

    res.end = function(chunk, encoding) {
      if (responseCode < 200 || responseCode >= 300) {
        resetRes();

        res.writeHead(responseCode);
        res.end();
        return;
      }
      var buffer = Buffer.concat(buffers);
      var charset = chardet.detect(buffer);
      var body;
      try {
        var iconv = new Iconv(charset, 'UTF-8');
        body = iconv.convert(buffer).toString('utf8');
      }
      catch (ex) {
        console.log('Error parsing', buffer.toString('utf8'), charset);
        return next('An error occured during parsing the response');
      }

      parser.parsePage(body, req.query.url, function(err, feed, handlerName) {
        if (err) return next(err);

        resetRes();

        res.setHeader('Content-Type', 'application/json; charset=utf8');
        res.setHeader('Scrapey-Handler', handlerName);

        res.writeHead(responseCode);

        if (req.query.callback) {
          res.end(req.query.callback + "(" + JSON.stringify(feed, null, 4) + ")");
        }
        else {
          res.end(JSON.stringify(feed, null, 4));
        }
      });
    };

    return proxy.proxyRequest(req, res, proxyOptions);
  });

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
var request = require("request");

module.exports = function(app, parser, prefix) {
    app.all(prefix + "/", function (req, res, next) {
        if (!req.query.url) return next("?url should be specified");
        
        request.get({
            uri: req.query.url,
            method: 'GET',
            encoding: 'utf8'
        }, function (err, resp, body) {
            if (err) return next(err);
            if (resp.statusCode < 200 || resp.statusCode > 300) {
                return next("Response should be 2xx but was " + resp.statusCode);
            }
            
            parser.parsePage(body, req.query.url, function (err, feed, handlerName) {
                if (err) return next(err);
                
                res.writeHead(200, {
                    "Content-Type": "application/json; charset=utf8",
                    "Access-Control-Allow-Origin": "*",
                    "Scrapey-Handler": handlerName
                });
                if (req.query.callback) {
                    res.end(req.query.callback + "(" + JSON.stringify(feed, null, 4) + ")");
                }
                else {
                    res.end(JSON.stringify(feed, null, 4));
                }
            });
        });
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
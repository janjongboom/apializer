var computecluster = require('compute-cluster');
var Path = require('path');

// allocate a compute cluster
var cc = new computecluster({
  module: Path.join(__dirname, './parser-worker.js'),
  max_request_time: 2
});

module.exports = function (cache) {
    var self = this;

    this.cache = cache;

    this.parsePage = function(htmlBuffer, url, callback) {
      cc.enqueue({
        cache: self.cache,
        htmlBuffer: htmlBuffer.toString('base64'),
        url: url
      }, function(err, res) {
        if (err) {
          console.error('[ClusterCrash] ' + err);
          return callback(err);
        }
        res = JSON.parse(res);
        if (!res.success) {
          return callback(res.error);
        }
        callback(null, res.feed, res.handler);
      });
    };

    // this.parseUrl = function (url) {
    //     url = Url.parse(url);
    //     return url;
    // };

    // this.findHandler = function ($, url, html) {
    //     var parsedUrl = self.parseUrl(url);

    //     var res = self.cache
    //         .filter(function (c) {
    //             try {
    //                 return c.matches($, parsedUrl, html);
    //             }
    //             catch (ex) {
    //                 console.error(c.name, 'match function fails!', ex);
    //                 return false;
    //             }
    //         });

    //     if (res.length > 1) {
    //         throw "Multiple handlers found " +
    //             res.map(function (r) { return r.name; }).join(",");
    //     }
    //     else if (res.length === 0) {
    //         throw "No handlers found";
    //     }
    //     else {
    //         return res[0];
    //     }
    // };

    // /**
    // * Non blocking parsePage
    // */
    // this.parsePage = function(html, url, callback) {
    //   var t = threads_a_gogo.create();
    //   t.eval('' + this.$parsePage);
    //   t.eval('parsePage(' + JSON.stringify(html) + ', ' + JSON.stringify(url) + ')', function(err, data) {
    //     if (err) return callback(err);

    //     callback(null, data.feed, data.handler);
    //   });
    // };

    // /**
    // * parsePage without Fibers attached
    // */
    // this.$parsePage = function parsePage(html, url, callback) {
    //     var $ = cheerio.load(html);
    //     var handler;
    //     try {
    //         handler = this.findHandler($, url, html);
    //     }
    //     catch (ex) {
    //         throw ex;
    //     }

    //     var res = {};

    //     if (typeof handler.extract === 'function') {
    //       try {
    //         res = handler.extract($, url, html);
    //       }
    //       catch (ex) {
    //         throw 'Parsing failed ' + ex;
    //       }
    //     }
    //     else {
    //       Object.keys(handler.extract).forEach(function (key) {
    //           try {
    //               res[key] = handler.extract[key]($, url, html);
    //               // now trim all strings
    //               self.trimAllStrings(res[key]);
    //           }
    //           catch (ex) {
    //               // console.error("Parsing", key, "failed", ex);
    //               res[key] = undefined;
    //           }
    //       });
    //     }

    //     return {
    //       handler: handler.name,
    //       feed: res
    //     };
    // };

    // this.trimAllStrings = function (obj) {
    //     for (var k in obj) {
    //         if (!obj.hasOwnProperty(k)) continue;

    //         if (typeof obj[k] === "string")
    //             obj[k] = obj[k].trim();

    //         if (typeof obj[k] === "object")
    //             self.trimAllStrings(obj[k]);
    //     }
    // };
};
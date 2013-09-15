var computecluster = require('compute-cluster');
var Path = require('path');

module.exports = function(maxRequestTime) {
  // allocate a compute cluster
  var cc = new computecluster({
    module: Path.join(__dirname, './parser-worker.js'),
    max_request_time: 2
  });

  this.parsePage = function(cache, htmlBuffer, url, callback) {
    cc.enqueue({
      cache: cache,
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
};

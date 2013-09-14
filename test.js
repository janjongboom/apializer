const computecluster = require('compute-cluster');

// allocate a compute cluster
var cc = new computecluster({
  module: './worker.js',
  max_request_time: 2
});

var toRun = 10

// then you can perform work in parallel
for (var i = 0; i < toRun; i++) {
  cc.enqueue({}, function(err, r) {
    if (err) console.log("an error occured:", err);
    else console.log("it's nice:", r);
    if (--toRun === 0) cc.exit();
  });
};
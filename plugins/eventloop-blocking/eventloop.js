module.exports = function(options, imports, register) {
  var last = +new Date();
  setInterval(function() {
    var n = +new Date();
    if (n - last > 10) {
      console.log('Event loop blocked', n-last, 'ms');
    }
    last = n;
  }, 1);

  register();
};

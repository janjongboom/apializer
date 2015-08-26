// Run |npm install async request| first
var async = require('async');
var request = require('request');

// The URL to your api'alizer instance
var APIALIZER = 'http://localhost:8100/c/ups-blog/';
var maxResultPages = 5;

var q = async.queue(function(url, next) {
  // Make the request to api'alizer
  request.get(APIALIZER + '?url=' + encodeURIComponent(url), function(err, res, body) {
    // Check the err variable and res.statusCode here

    // We'll get a JSON response so parse the body
    body = JSON.parse(body.toString('utf8'));
    // On the results page push all the links to post to the queue (+ prev page)
    if (res.headers['scrapey-handler'] === 'ups-result') {
      body.posts.forEach(function(p) { q.push(p.link); });
      if (--maxResultPages > 0) {
        body.previousPage && q.push(body.previousPage);
      }
    }
    else if (res.headers['scrapey-handler'] === 'ups-detail') {
      // We now have detail page, let's do something with it...
      console.log(body.title + ' (' + body.author + ') has ' + body.comments.length + ' comments');
    }
    next();
  });
}, 4); // 4 requests simultaneous

// Initial URL that we'll start scraping
q.push('http://blog.ups.com/');

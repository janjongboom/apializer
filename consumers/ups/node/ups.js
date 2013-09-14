// Run |npm install async request| first
var async = require('async');
var request = require('request');

// The URL to your scrapey instance
var SCRAPEY = 'http://localhost:8100/c/ups-blog/';

var handled = [];
var maxResultPages = 5;

var q = async.queue(function(url, next) {
  // Prevent handling the same URL multiple times...
  if (handled.indexOf(url) > -1)
    return next();
  handled.push(url);

  // Make the request to scrapey
  request.get({ url: SCRAPEY + '?url=' + encodeURIComponent(url), encoding: null }, function(err, res, body) {
    // Check the err variable and res.statusCode here

    // We'll get a JSON response so parse the body
    body = JSON.parse(body.toString('utf8'));
    // On the results page push all the links to post to the queue (+ next/prev page)
    if (res.headers['scrapey-handler'] === 'ups-result') {
      body.posts.forEach(function(p) { q.push(p.link); });
      if (--maxResultPages > 0) {
        body.previousPage && q.push(body.previousPage);
        body.nextPage && q.push(body.nextPage);
      }
    }
    else if (res.headers['scrapey-handler'] === 'ups-detail') {
      // We now have detail page, let's do something with it...
      console.log(body.title + ' (' + body.author + ') has ' + body.comments.length + ' comments');
    }
    next();
  });
}, 40); // 4 requests simultanious

// Initial URL that we'll start scraping
q.push('http://blog.ups.com/');

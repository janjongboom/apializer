// example url: /c/jsonp/?url=https://raw.githubusercontent.com/jan-os/janos/master/taskgraph.json

name = 'scrapey-jsonp'
matches = function() {
  return true;
}
extract = function($, location, html) {
  return JSON.parse(html);
}
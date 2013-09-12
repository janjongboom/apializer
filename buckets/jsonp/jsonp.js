name = 'scrapey-jsonp'
matches = function() {
  return true;
}
extract = function($, location, html) {
  return JSON.parse(html);
}
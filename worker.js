var cheerio = require('cheerio');
var Url = require("url");

function parseUrl(url) {
  url = Url.parse(url);
  return url;
}
function findHandler(cache, $, url, html) {
  var parsedUrl = parseUrl(url);

  var res = cache.filter(function(c) {
    try {
      return c.matches($, parsedUrl, html);
    }
    catch (ex) {
      console.error(c.name, 'match function fails!', ex);
      return false;
    }
  });

  if (res.length > 1) {
    throw "Multiple handlers found " + res.map(function(r) {
      return r.name;
    }).join(",");
  }
  else if (res.length === 0) {
    throw "No handlers found";
  }
  else {
    return res[0];
  }
}

/**
 * parsePage without Fibers attached
 */
function parsePage(cache, html, url) {
  var $ = cheerio.load(html);
  var handler;
  try {
    handler = this.findHandler(cache, $, url, html);
  }
  catch (ex) {
    throw ex;
  }

  var res = {};

  if (typeof handler.extract === 'function') {
    try {
      res = handler.extract($, url, html);
    }
    catch (ex) {
      throw 'Parsing failed ' + ex;
    }
  }
  else {
    Object.keys(handler.extract).forEach(function(key) {
      try {
        res[key] = handler.extract[key]($, url, html);
        // now trim all strings
        trimAllStrings(res[key]);
      }
      catch (ex) {
        // console.error("Parsing", key, "failed", ex);
        res[key] = undefined;
      }
    });
  }

  return {
    handler: handler.name,
    feed: res
  };
}

function trimAllStrings(obj) {
  for (var k in obj) {
    if (!obj.hasOwnProperty(k)) continue;

    if (typeof obj[k] === "string")
      obj[k] = obj[k].trim();

    if (typeof obj[k] === "object")
      trimAllStrings(obj[k]);
  }
}


process.on('message', function(m) {
  try {
    var p = parsePage(m.cache, m.html, m.url);
    p.success = true;
    process.send('complete', p);
  }
  catch (ex) {
    process.send('complete', {
      success: false,
      error: ex
    });
  }
});

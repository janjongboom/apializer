var cheerio = require('cheerio');
var Url = require("url");
var vm = require('vm');
var charsetDetector = require("node-icu-charset-detector").detectCharset;
var Iconv  = require('iconv').Iconv;

var cache = {};

function createDefinition(src) {
  if (cache[src]) return cache[src];

  // this is not perfect, think have to shell out...
  var definition = vm.createContext({});
  vm.runInContext(src, definition);

  cache[src] = definition;
  return cache[src];
}

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
function parsePage(cache, htmlBuffer, url) {
  cache = cache.map(createDefinition);

  var buffer = new Buffer(htmlBuffer, 'base64');
  var charset = charsetDetector(buffer).toString();
  var html;
  try {
    var iconv = new Iconv(charset, 'UTF-8');
    html = iconv.convert(buffer).toString('utf8');
  }
  catch (ex) {
    console.log('Error parsing', buffer.toString('utf8'), charset);
    throw 'An error occured during parsing the response';
  }

  var $ = cheerio.load(html);
  var handler;
  try {
    handler = findHandler(cache, $, url, html);
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
        res[key] = trimAllStrings(res[key]);
      }
      catch (ex) {
        console.error("Parsing", key, "failed", ex);
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
  if (typeof obj === 'string') {
    return obj.trim();
  }

  if (typeof obj === 'object' && 'toArray' in obj) { // jQuery array
    obj = obj.toArray();
  }

  if (obj instanceof Array) {
    obj.map(trimAllStrings);
  }
  else if (typeof obj === 'object') {
    Object.keys(obj).forEach(function(k) {
      obj[k] = trimAllStrings(obj[k]);
    });
  }

  return obj;
}


process.on('message', function(m) {
  try {
    var p = parsePage(m.cache, m.htmlBuffer, m.url);
    p.success = true;
    process.send(JSON.stringify(p));
  }
  catch (ex) {
    process.send(JSON.stringify({
      success: false,
      error: ex + ''
    }));
  }
});

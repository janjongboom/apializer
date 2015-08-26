# Api'alizer - APIify any website

Api'alizer is a service that allows to make a consumable API out of any HTTP interface. It works with transformation files written in jQuery that translate an HTML page into a JSON object, while keeping full compatibility with the underlying HTTP interface. That means that POSTs; cookies; and multi-page interactions will still work as expected.

* Transform HTML to JSON
* Write in javascript, coffeescript, etc. with jQuery support
* JSONP and CORS support

This is a nice way of building f.e. scrapers as the person writing the scraper only needs to know jQuery to create a well-defined API for a target website. Api'alizer also supports multiple page formats (e.g. this is a detail page, this is a result page) so no need to specify that from your end. The resulting API is easy to consume from any programming language. An example on how to scrape the UPS blog is available for node.js, PHP and C#.

## Installation

You'll need icu, on OS/X: `brew install icu4c && brew link icu4c --force`, on Debian: `apt-get install libicu-dev`. Also node.js 0.10+ or io.js.

* Run `npm install`
* Run `node server.js`
* Check out the '_examples' folder to see how to use this project in node.js, PHP or C#

## Get started: simple transformer

This transformer translates any repo homepage in GitHub into a JSON file that contains the name and description of the project.

Start Api'alizer, create a folder in `buckets/` directory (e.g. `github`), and make a file `repo.js`:

```js
// A name so you can identify the response (will be sent in the Scrapey-Handler header)
name = "github-repo"

matches = function($, location, rawHTML) {
  // Can this transfomer handle the page passed in? Return true or false. Can use jQuery, location object (window.location) or rawHTML to decide
  return $('.octicon-repo').length > 0;
}

extract = {
  // Have simple fields with a jQuery function. These fields will form your response.
  name: function($) {
    // You can also return arrays / objects / etc.
    return $('h1 strong').text();
  },
  stargazers: function($) {
    return $('.octicon-star').closest('li').find('a:last-child').text()
  }
}
```

You do not need to restart the service. Changes are automatically picked up from the file system. Now api'alizer is active under [http://localhost:8100/c/github/?url=https://github.com/mozilla-b2g/gaia](http://localhost:8100/c/github/?url=https://github.com/mozilla-b2g/gaia).

## Consuming

jQuery:

```js
var url = 'https://github.com/mozilla-b2g/gaia'
$.getJSON('http://localhost:8100/c/github/', { url: url }, function(data) {
  console.log(data.name);
})
```

PHP:

```php
<?php
$url = 'https://github.com/mozilla-b2g/gaia';
$data = json_decode(file_get_contents('http://localhost:8100/c/github/?' . http_build_query(array('url'=>$url))));
echo $data->name;
```

## Transformer syntax

A transformer has three fields:

* `name` - This is useful because any response handled by a transformer has a `Scrapey-Handler` header set.
* `matches` - Can this transformer handle the request coming in? It has three arguments, `$` (jQuery), `location` (window.location object) and `rawHTML` (string containing the full responseText). Should evaluate to true or false.
* `extract` - A function or an object with fields to extract. Every function has access to `$`, `location` and `rawHTML`. You can return any JSON structure.

## Advanced example: Scraping a blog

As an example I built a small scraper for the [UPS blog](http://blog.ups.com/). A blog has two types of pages, result page and detail page. For both of these we define a transformer by writing some jQuery to detect the page, and then extract the fields we need ([result](/janjongboom/apializer/blob/master/buckets/ups-blog/index.js), [detail](/janjongboom/apializer/blob/master/buckets/ups-blog/detail.js)). Detection normally uses jQuery or the URL.

After that we have a simple proxy up at /c/ups-blog, and we can throw random URLs from the blog at it ([example](http://localhost:8100/c/ups-blog/?url=http://blog.ups.com/page/2/)). To distinguish which kind of page we encountered the name of the transformer is returned in the `scrapey-handler` response header. We can use this in the consuming code to use the data more easy.

So let's say we want to scrape 30 articles, and they are spread out over multiple result pages, we can easily write a program in any language we want ([here's examples in node.js, PHP and C#](/janjongboom/apializer/tree/master/_examples/ups)). In pseudo code it would look like:

```js
queue = new Queue
queue.push('http://blog.ups.com') // First page

while (queue not empty)
    url = queue.pop() // Get URL and remove from queue

    // Make it into Api'alizer URL
    url = 'http://localhost:8100/c/ups-blog/?url=' + url

    // make request and get JSON out
    response = http_request(url)
    json = parse_json(response)

    // if we scraped a result page
    if 'ups-result' is response.header['scrapey-handler']
        // add the previous page link we saw to the queue to be scraped
        queue.push(json.previousPage)

    // detail page with a post
    else
        print 'Found post' + json.title
        articles_found += 1

    // if we found 30 articles, we stop the process
    if articles_found is 30
        break

print 'Done scraping!'
```

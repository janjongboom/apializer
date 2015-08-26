<?php
// The URL to your api'alizer instance
$SCRAPEY = 'http://localhost:8100/c/ups-blog/';
// Initial URL we'll start scraping from
$q = array('http://blog.ups.com/');
// Prevent scraping the whole blog, limit to 5 result pages
$maxResultPages = 5;

// Grab the next URL from our queue
while( $url = array_pop( $q ) ) {
  // Make request to api'alizer
  $body = json_decode(file_get_contents($SCRAPEY . '?' . http_build_query(array('url'=>$url))));
  // Find whether we have a result or detail page here
  $handler = array_shift(preg_grep("/^scrapey-handler: /i", $http_response_header));
  switch (preg_replace('/^scrapey-handler: /i', '', $handler)) {
    // If result page, add the previous page to the queue
    case 'ups-result':
      if ($body->previousPage && --$maxResultPages > 0)
        array_push($q, $body->previousPage);
      // And also add all the links to posts to the queue
      foreach ($body->posts as $p)
        array_push($q, $p->link);
      break;
    case 'ups-detail':
      // On a detail page we can consume the data
      print $body->title . " (" . $body->author . ") has " . count($body->comments) . " comments\r\n";
      break;
  }
}

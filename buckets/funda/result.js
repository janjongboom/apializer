// example page: /c/funda/?url=http://www.funda.nl/koop/amsterdam/

name = "funda-result"; // name for this schema

matches = function($, location) {
  return $('.results').length > 0
}

extract = {
  title: function($) {
    return $('title').text().trim().replace(' [funda]', '')
  },
  results: function($) {
    return $('.object-list li').filter(function() {
      return $(this).find('.specs').length > 0
    }).map(function() {
      var item = $(this)
      return {
        detailUrl: item.find('a').attr('href'),
        address: item.find('h3>a').first().text().trim(),
        price: item.find('.price-wrapper').text(),
        image: item.find('img').attr('src')
      }
    })
  },
  previousUrl: function($) {
    return $('a.prev').attr('href')
  },
  nextUrl: function($) {
    return $('a.next').attr('href')
  }
}

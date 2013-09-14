name = 'ups-result'

matches = function($, location) {
  return $('body').hasClass('home')
}

extract = {
  posts: function($) {
    return $('.theentry').map(function() {
      var post = $(this)
      return {
        title: post.find('a').attr('title'),
        link: post.find('a').attr('href'),
        image: post.find('img').attr('data-lazy-src'),
        summary: post.find('p').filter(function() {
            return $(this).find('a.more-link').length === 0
          }).map(function() {
            return $(this).text()
          })
      }
    })
  },

  nextPage: function($) {
    return $('.nav-next a').attr('href')
  },
  previousPage: function($) {
    return $('.nav-previous a').attr('href')
  }
}

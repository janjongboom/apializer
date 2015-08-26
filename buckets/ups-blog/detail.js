// example url: /c/ups-blog/?url=http://blog.ups.com/2015/08/19/diy-versus-difm-auto-parts-sales-how-do-you-steer-online-growth/

name = 'ups-detail'
matches = function($) {
  return $('body').hasClass('single-post')
}
extract = {
  title: function($) {
    return $('.entry-title').text()
  },
  author: function($) {
    return $('.the-meta>a').text()
  },
  content: function($) {
    return $('.entry-content p').map(function() { return $(this).text() })
  },
  image: function($) {
    return $('.entry-utility img').attr('data-lazy-src')
  },
  tags: function($) {
    return $('.entry-categorization a').map(function() { return $(this).text() })
  },
  comments: function($) {
    return $('.commentlist li').map(function() {
      return {
        author: $(this).find('.fn').text(),
        text: $(this).find('.comment-body').text(),
        date: new Date($(this).find('.comment-meta>strong').text().replace(/at /, ''))
      }
    })
  }
}
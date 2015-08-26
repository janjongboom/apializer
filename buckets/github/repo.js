// example page: /c/github/?url=https://github.com/jan-os/janos/

name = "github-repo"

matches = function($, location) {
  return location.hostname === 'github.com' &&
    $('.octicon-repo').length > 0;
}

extract = {
  name: function($) {
    return $('h1 strong').text();
  },
  contributors: function($) {
    var numbers = $('.numbers-summary li:last-child');
    return Number(numbers.find('.num').text())
  },
  stargazers: function($) {
    return $('.octicon-star').closest('li').find('a:last-child').text()
  },
  folders: function($) {
    return $('.files tr:has(.octicon-file-directory) .js-directory-link')
        .map(function() {
            return $(this).text()
        })
  }
}

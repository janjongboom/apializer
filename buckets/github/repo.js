name = "github-repo"

matches = function($, location) {
  return $('.js-repo-home-link').length > 0;
}

extract = {
  name: function($) {
    return $('.js-repo-home-link').text();
  },
  description: function($) {
    return $('.repository-description').text();
  }
}

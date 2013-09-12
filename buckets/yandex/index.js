name = 'yandex-index'
matches = function() {
  return true;
}
extract = {
  test: function($) {
    return $('.b-morda-search-form').attr('action');
  }
}
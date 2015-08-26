// example url: /c/yandex/?url=https://www.yandex.ru/

name = 'yandex-index'
matches = function() {
  return true;
}
extract = {
  weather: function($) {
    return $('.b-weather > .b-content-item__title').text();
  }
}
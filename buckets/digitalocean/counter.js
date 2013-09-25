name="digitalocean"
matches=function($) {
  return $('.servers_launched').length > 0
}
extract = {
  count: function($) {
    return [].slice.call($('.servers_launched .inner span.count').map(function(ix, el){ return $(el).text() })).join('')
  }
}
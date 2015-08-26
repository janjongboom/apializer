// example url: http://www.visitukheritage.gov.uk/servlet/com.eds.ir.cto.servlet.CtoDbQueryServlet?location=Kent&class1=All&freetext=&Submit=search

name = "uk-national-heritage"

matches = function($, location) {
  return location.path.indexOf('CtoDbQueryServlet') !== -1;
}

extract = {
  records: function($, url) {
    return $('table[border="1"] tr').map(function(ix, el) {
      if (ix === 0) return;

      el = $(el);
      return {
        desc: el.find('td:nth-child(2)').text(),
        location: el.find('td:nth-child(3)').text(),
        category: el.find('td:nth-child(4)').text(),
        link: el.find('td:nth-child(1) a').attr('href')
      };
    });
  }
};

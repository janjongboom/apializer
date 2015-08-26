// http://www.visitukheritage.gov.uk/servlet/com.eds.ir.cto.servlet.CtoDbQueryServlet?location=All&class1=All&freetext=&Submit=search

name = "uk-national-heritage"

matches = function($, location) {
  return (location + '').indexOf('CtoDbQueryServlet') !== -1;
}

extract = {
  records: function($, url) {
    return $('tr[valign=top]:gt(0)').map(function(ix, el) {
      el = $(el);
      return {
        desc: el.find('td:nth(1)').text(),
        location: el.find('td:nth(2)').text(),
        category: el.find('td:nth(3)').text(),
        link: el.find('td:nth(1) a').attr('href')
      };
    });
  }
};

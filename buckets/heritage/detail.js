// example url: http://www.visitukheritage.gov.uk/servlet/com.eds.ir.cto.servlet.CtoDetailServlet?ID=5221

name = "uk-national-heritage-detail"

matches = function($, location) {
  return location.path.indexOf('CtoDetailServlet') !== -1;
}

extract = {
  detail: function($) {
    var tds = $('table:nth-child(4) tr').map(function(ix, el) {
      return $(el).find('td:nth-child(3)');
    });

    return {
      uniqueId: tds[0].text(),
      category: tds[1].text(),
      accessDetails: tds[2].text(),
      contactName: tds[3].text(),
      contactAddress: tds[4].text(),
      contactReference: tds[5].text(),
      telephone: tds[6].text(),
      fax: tds[7].text(),
      email: tds[8].text(),
      description: tds[9].text()
    };
  }
};

// http://www.visitukheritage.gov.uk/servlet/com.eds.ir.cto.servlet.CtoDbQueryServlet?location=All&class1=All&freetext=&Submit=search

name = "uk-national-heritage-detail"

matches = function($, location) {
  return (location + '').indexOf('CtoDetailServlet') !== -1;
}

extract = {
  detail: function($) {
    var table = $('table:nth(2)');
    var tds = table.find('tr').map(function(ix, tr) {
      return $(tr).find('td:nth(2)');
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

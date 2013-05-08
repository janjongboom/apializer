return {
    name: "CNN Article", // name for this schema
    host: /^(\w+\.)?cnn\.com$/, // domain we work on
    path: /^\/\d{4}\//, // paths that we match /2013/05/05
    version: "1.0.0",
    
    extract: {
        title: function ($) {
            return $('.cnn_storyarea>h1').text();
        },
        body: function ($) {
            return [].slice.call($('.cnn_strycntntlft>p')).map(function(a) { 
                return $(a).text(); 
            }).join('\n\n');
        },
        image: function ($) {
            var img = $('.cnn_strycntntlft>div>img');
            return (!img.hasClass('box-image') && img.attr('src')) ||
                $('meta[itemprop="thumbnailUrl"]').attr('content');
        }
    }
};

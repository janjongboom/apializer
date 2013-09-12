return {
    name: "CNN Article", // name for this schema

    matches: function($, location) {
        return $('.cnn_storyarea').length > 0;
    },

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

return {
    name: "CNN NewsPulse", // name for this schema
    matches: function($, location) {
        return location.hostname === 'api.cnn.com';
    },
    extract: {
        stories: function ($) {
            return [].slice.call($('.nsDataRow')).map(function(i) {
                i = $(i);
                return {
                    link: i.find('.nsFullStoryLink').attr('href'),
                    title: i.find('.nsStory .thumb>span').eq(0).text(),
                    image: i.find('img').attr('src')
                };
            }).filter(function(i) {
                return i.link.indexOf('http://www.cnn.com') === 0;
            });
        }
    }
};

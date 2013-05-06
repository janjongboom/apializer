return {
    name: "CNN NewsPulse", // name for this schema
    host: /^api\.cnn\.com$/, // domain we work on
    path: /.*/, // paths that we match
    version: "1.0.0",
    
    extract: {
        stories: function ($) {
            return [].slice.call($('.nsDataRow')).map(function(i) {
                i = $(i);
                return {
                    link: i.find('.nsFullStoryLink').attr('href'),
                    title: i.find('.nsStory .thumb>span:first').text(),
                    image: i.find('img').attr('src')
                };
            }).filter(function(i) {
                return i.link.indexOf('http://www.cnn.com') === 0;
            });
        }
    }
};

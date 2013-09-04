return {
    name: "GigaPica page", // name for this schema
    matches: function(location, $) {
        return location.host === 'gigapica.geenstijl.nl' 
            && /^\/\d{4}\/\d{2}\//.test(location.path);
    },
    extract: {
        title: function ($) {
            return $(".artikel h1").text();
        },
        
        leaderImage: function ($) {
            return $(".artikel>img").attr("src");
        },
        
        articles: function ($) {
            return [].slice.call($(".artikel").find("p").has("img")).map(function (el) {
               return {
                   image: $(el).find("img").attr("src"),
                   text: $(el).text().trim()
               };
            });
        }
    }
};
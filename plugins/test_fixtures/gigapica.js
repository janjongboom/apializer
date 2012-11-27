return {
    name: "GigaPica page", // name for this schema
    host: /^gigapica\.geenstijl\.nl$/, // domain we work on
    path: /^\/\d{4}\/\d{2}\//, // paths that we match
    version: "1.0.0",
    
    extract: {
        title: function ($) {
            return $(".artikel h1").text();
        },
        
        leaderImage: function ($) {
            return $(".artikel>img").attr("src");
        },
        
        articles: function ($) {
            return Array.prototype.slice.call($(".artikel").find("p").has("img")).map(function (el) {
               return {
                   image: $(el).find("img").attr("src"),
                   text: $(el).text().trim()
               };
            });
        }
    }
};
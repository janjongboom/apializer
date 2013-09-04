return {
    name: "Nu.nl article", // name for this schema
    matches: function(location, $) {
        return $('#leadarticle').length > 0;
    },
    extract: {
        title: function ($) {
            return $("h1").eq(0).text();
        },
        
        image: function ($) {
            var img = $("#photo img");
            return {
                width: img.attr("width"),
                height: img.attr("height"),
                src: img.attr("src")
            };
        },
        
        content: function ($) {
            var eles = $(".article").find("h2.summary, p");
            var text = [].slice.call(eles).map(function (el) {
                return $(el).text();
            }).join("\n").trim();
            
            return text;
        }
    }
};
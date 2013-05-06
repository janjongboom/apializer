return {
    name: "Nu.nl article", // name for this schema
    host: /^(www\.)?nu\.nl$/, // domain we work on
    path: /^\/\w+\/\d+\//, // paths that we match
    version: "1.0.0",
    
    extract: {
        title: function ($) {
            return $("h1:first").text();
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
                return el.textContent;
            }).join("\n").trim();
            
            return text;
        }
    }
};
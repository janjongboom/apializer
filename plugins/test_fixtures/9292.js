return {
    name: "9292 reisadvies", // name for this schema
    
    matches: function(location, $) {
        return $('#reis-advies').length > 0;
    },
    
    version: "1.0.0",
    
    extract: {
        from: function ($) {
            return $("#advice-title h1")[0].childNodes[2].textContent;
        },
        
        to: function ($) {
            return $("#advice-title h1")[0].childNodes[4].textContent;
        },
        
        steps: function ($) {
            return [].slice.call($("ol.advice-steps li")).map(function (step) {
               step = $(step);
               return {
                  transportation: step.find(".step-header .vh").text(),
                  action: step.find(".step-header h3").text(),
                  start: {
                     time: step.find(".first-stop .leg-time").text(),
                     location: step.find(".first-stop .leg-title").text()
                  },
                  end: {
                      time: step.find(".last-stop .leg-time").text(),
                      location: step.find(".last-stop .leg-title").text()
                  }
               };
            });
        }
    }
};
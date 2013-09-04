#!/usr/bin/env node
// require("longjohn");

var architect = require("architect");
var config = architect.loadConfig(__dirname + "/config.js");

architect.createApp(config, function (err, app) {
    if (err) {
        console.error(err);
        console.trace();
        return;
    }

    app.getService('parser-manager').init(app);

    console.log("Scrapey service started...");
});

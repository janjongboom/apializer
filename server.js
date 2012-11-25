#!/usr/bin/env node
var architect = require("architect");

var config = architect.loadConfig(__dirname + "/config.js");

architect.createApp(config, function (err, app) {
    if (err) throw err;
    
    console.log("Scrapey service started...");
});
#!/usr/bin/env node
var architect = require("architect");
var config = architect.loadConfig(__dirname + "/config.js");

architect.createApp(config, function(err, app) {
  if (err) {
    console.error(err);
    console.trace();
    return;
  }

  app.on('error', function(err) {
    console.log('app.onerror', err);
  });

  app.getService('parser-manager').init(app);

  console.log("Api'alizer service started...");
});

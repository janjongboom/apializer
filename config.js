var path = require("path");

module.exports = [
  {
    packagePath: "./plugins/express",
    host: process.env.IP || "0.0.0.0",
    port: process.env.PORT || 8100
  },
  {
    packagePath: "./plugins/parser-manager-fs",
    bucketPath: path.join(__dirname, "./buckets")
  },
  {
    packagePath: "./plugins/parser",
    maxRequestTime: 2 // in seconds
  },
  "./plugins/website",
  "./plugins/eventloop-blocking"
];
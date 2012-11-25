var defFolder = __dirname + "/plugins/test_fixtures";

module.exports =  [
    {
        packagePath: "./plugins/express",
        host: process.env.IP || "0.0.0.0",
        port: process.env.PORT || 8100
    },
    {
        packagePath: "./plugins/parser-http",
        prefix: "/c/jan"
    },
    {
        packagePath: "./plugins/parser",
        definitions: [
            defFolder + "/nu_nl_article.js"
        ]
    }
];
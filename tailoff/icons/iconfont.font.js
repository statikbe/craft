const pkg = require("../../package.json");
const path = require("path");

module.exports = {
    files: ["./**/*.svg"],
    baseSelector: ".icon",
    classPrefix: "icon--",
    scssDest: "../css/core/icons.css",
    scssTemplate: "./template.hbs",
    fileName: "fonts/icons.[ext]",
    fontName: "icons",
    types: ["eot", "woff", "woff2", "ttf", "svg"]
};

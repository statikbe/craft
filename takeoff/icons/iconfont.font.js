const pkg = require('../../package.json');
const path = require('path');

module.exports = {
    files: [ './svg/**/*.svg' ],
    baseSelector: '.icon',
    classPrefix: 'icon--',
    scssDest: '../sass/core/_icons.scss',
    scssTemplate: './template.hbs',
    fileName: 'fonts/icons.[ext]',
    fontName: 'icons',
    types: ['eot', 'woff', 'woff2', 'ttf', 'svg'],
};

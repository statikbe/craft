'use strict';

import hljs from 'highlight.js/lib/highlight';
import 'highlight.js/styles/github.css';

import xml from 'highlight.js/lib/languages/xml';
hljs.registerLanguage('xml', xml);

$('.js-code-block').each(function () {

    var $this = $(this);
    var $parent = $this.parent();
    var $target = [];

    while (!$target.length) {
        $target = $parent.find('pre code');
        $parent = $parent.parent();
    }

    if (!$target) return;

    var sourceCodeLines = $this.html().trim().split('\n');
    var lastSourceCodeLine = sourceCodeLines[sourceCodeLines.length - 1];
    var sourceCodeWhitespace = lastSourceCodeLine.slice(0, lastSourceCodeLine.search(/\S/));

    $.each(sourceCodeLines, function (i, line) {
        sourceCodeLines[i] = line.replace(sourceCodeWhitespace, '');
    });

    $target.text(sourceCodeLines.join('\n'));
});

$('pre code').each(function (i, b) {
    hljs.highlightBlock(b);
});
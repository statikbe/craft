<?php

/**
 * Link Checker (statikbe/craft-link-checker): the broken links in the content of the pages, listed in the Broken links
 * dashboard widget. See the plugin's README for every setting. Run `ddev craft link-checker/report` for the full list.
 */

return [
    'sections' => '*',
    // The production domain of a project, so links to it count as links to the site itself, e.g. ['www.example.be']
    'internalHosts' => [],
    // Ids the templates render on every page: the skip link's target, the overview filters and the search results
    'knownAnchors' => ['main', 'results', 'filterResults'],
];

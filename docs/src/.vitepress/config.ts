import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/craft/',
  lang: 'en',
  title: "Statik's Craft Base Install",
  description: 'This is documentation for our Craft Base Install',
  lastUpdated: true,
  themeConfig: {
    siteTitle: 'Craft base install',
    // https://vitepress.dev/reference/default-theme-config
    logo: '/assets/favicon.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Frontend', link: '/frontend/components', activeMatch: '/frontend/' },
      { text: 'Craft', link: '/craft/about' },
    ],

    sidebar: {
      '/frontend/': [
        {
          text: 'Components',
          base: '/frontend/',
          collapsed: false,
          items: [
            { text: 'Accordion', link: 'accordion' },
            { text: 'Ajax Paging', link: 'ajaxpaging' },
            { text: 'Ajax Search', link: 'ajaxsearch' },
            { text: 'Autocomplete', link: 'autocomplete' },
            { text: 'Chip', link: 'chip' },
            { text: 'CKEditor', link: 'ckEditor' },
            { text: 'Dropdown', link: 'dropdown' },
            { text: 'Filter', link: 'filter' },
            { text: 'Formie', link: 'formie' },
            { text: 'General', link: 'general' },
            { text: 'Load more', link: 'loadmore' },
            { text: 'Masonry', link: 'masonry' },
            { text: 'Matrix', link: 'matrix' },
            { text: 'Page find', link: 'pagefind' },
            { text: 'Parallax', link: 'parallax' },
            { text: 'Pull out', link: 'pullOut' },
            { text: 'Responsive background', link: 'responsiveBackground' },
            { text: 'Search', link: 'search' },
            { text: 'Sticky header', link: 'stickyHeader' },
            { text: 'Swiper', link: 'swiper' },
            { text: 'Table', link: 'table' },
            { text: 'Toggle', link: 'toggle' },
            { text: 'Tooltip', link: 'tooltip' },
            { text: 'Validation', link: 'validation' },
            // insert the other form components here
            { text: 'Video background', link: 'videoBackground' },
            { text: 'Video toggle', link: 'videoToggle' },
          ],
        },
      ],
      '/craft/': [
        {
          text: 'Craft',
          collapsed: false,
          base: '/craft/',
          items: [{ text: 'About', link: 'about' }],
        },
        {
          text: 'Twig',
          collapsed: true,
          base: '/craft/twig/',
          items: [{ text: 'Introduction', link: 'custom-filters' }],
        },
      ],
    },

    search: {
      provider: 'local',
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/statikbe/craft' }],
  },
});

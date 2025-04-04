import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/craft/',
  lang: 'en-US',
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
            { text: 'Dropdown', link: 'dropdown' },
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

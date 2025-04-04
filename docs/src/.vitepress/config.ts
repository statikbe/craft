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
      { text: 'Frontend', link: '/frontend/components' },
      { text: 'Craft', link: '/craft/about' },
    ],

    sidebar: {
      '/frontend/': [
        {
          text: 'Components',
          collapsed: false,
          items: [
            { text: 'Accordion', link: 'frontend/accordion' },
            { text: 'Dropdown', link: 'frontend/dropdown' },
          ],
        },
      ],
      '/craft/': [
        {
          text: 'Craft',
          collapsed: false,
          items: [{ text: 'About', link: 'craft/about' }],
        },
        {
          text: 'Twig',
          collapsed: true,
          items: [{ text: 'Introduction', link: 'craft/twig/custom-filters' }],
        },
      ],
    },

    search: {
      provider: 'local',
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/statikbe/craft' }],
  },
});

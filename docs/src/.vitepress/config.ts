import { defineConfig } from 'vitepress';
import { whyframe } from '@whyframe/core';
import { whyframeVue } from '@whyframe/vue';

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
      { text: 'Examples', link: '/markdown-examples' },
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' },
          { text: 'Test', link: '/test' },
        ],
      },
    ],

    search: {
      provider: 'local',
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/statikbe/craft' }],
  },
  vite: {
    plugins: [
      // Initialize core plugin
      whyframe({
        defaultSrc: '/craft/frames/default', // provide our own html
      }),

      whyframeVue({
        include: /\.(?:vue|md)$/, // also scan in markdown files
      }),
    ],
  },
});

// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Static output (no SSR adapter). All pages prerendered at build time.
  output: 'static',

  // Public site URL — used by Astro for sitemap, canonical URLs, og:url, etc.
  site: 'https://tetrasoft.uz',

  integrations: [
    sitemap({
      // Hint search engines about importance + cadence per route type.
      serialize: (item) => {
        const url = item.url;
        if (url === 'https://tetrasoft.uz/') {
          return { ...item, changefreq: 'monthly', priority: 1.0 };
        }
        if (url.includes('/portfolio/') || url.includes('/services/')) {
          return { ...item, changefreq: 'yearly', priority: 0.7 };
        }
        return { ...item, changefreq: 'monthly', priority: 0.8 };
      },
    }),
  ],

  // i18n routing. Currently Russian-only; Uzbek will be added later by
  // appending 'uz' to `locales` and creating src/pages/uz/* routes.
  i18n: {
    defaultLocale: 'ru',
    locales: ['ru'],
    routing: {
      // Keep / serving the default (ru) locale without a /ru/ prefix.
      // Non-default locales (uz later) will live under /uz/.
      prefixDefaultLocale: false,
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});

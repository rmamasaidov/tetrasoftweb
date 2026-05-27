// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Static output (no SSR adapter). All pages prerendered at build time.
  output: 'static',

  // Public site URL — used by Astro for sitemap, canonical URLs, og:url, etc.
  site: 'https://tetrasoft.uz',

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

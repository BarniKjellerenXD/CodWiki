// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: { head: { htmlAttrs: { lang: 'en' }, title: 'CodWiki · Zombies companion' } },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css', '~/assets/css/companion.css', '~/assets/css/puzzles.css'],
  modules: [
    '@nuxt/fonts',
    '@nuxt/hints',
    '@nuxt/icon',
    '@nuxtjs/tailwindcss',
    'nuxt-api-party'
  ]
  ,
  apiParty: {
    endpoints: {
      reddit: {
        url: process.env.REDDIT_API_BASE_URL || 'https://www.reddit.com',
        headers: {
          'User-Agent': process.env.REDDIT_USER_AGENT || 'CodWiki/1.0 (by u/yourusername)',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }
    }
  },
  runtimeConfig: {
    public: {
      redditBase: process.env.REDDIT_API_BASE_URL || 'https://www.reddit.com'
    }
  },
  vite: {
    build: {
      // Vite 8 defaults CSS minify to lightningcss, which drops `li::marker`
      // selectors and rewrites list-style shorthand. esbuild keeps output
      // byte-compatible with the previously deployed site.
      cssMinify: 'esbuild'
    }
  }
})

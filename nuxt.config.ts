// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
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
  }
})

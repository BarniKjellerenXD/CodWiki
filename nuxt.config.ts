// https://nuxt.com/docs/api/configuration/nuxt-config
import { DEFAULT_SITE_URL } from './shared/seo.mjs'

export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'CodWiki · Zombies companion',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico?v=codwiki-1' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/icons/codwiki-16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icons/codwiki-32.png' },
        { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/icons/codwiki-48.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
    },
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // Keep local shared helpers in Nitro's bundle (Windows dev builds otherwise
  // rebase this external import outside the checkout).
  nitro: { externals: { inline: [/shared[\\/](?:retired-tools|dmz|seo(?:-overrides)?)\.mjs/] } },
  css: ['~/assets/css/main.css', '~/assets/css/companion.css', '~/assets/css/puzzles.css'],
  // DMZ pages only. Saira's width axis gives the condensed and wide menu
  // labels; pages set it with font-variation-settings because the generated
  // @font-face rules carry no font-stretch range.
  fonts: {
    google: { experimental: { variableAxis: { Saira: { wdth: [['50', '125']] } } } },
    families: [
      { name: 'Saira', provider: 'google', weights: ['300 800'], styles: ['normal'] },
      { name: 'JetBrains Mono', provider: 'google', weights: ['400 800'], styles: ['normal'] },
    ],
  },
  hooks: {
    // Google also sends Saira as static .woff faces for old browsers, one per
    // weight with all seven widths merged into its src list. Browsers picked
    // those over the variable faces, so 'wdth' did nothing and every label drew
    // at the first width (50). Keep only the woff2 variable faces.
    'fonts:providers'(providers) {
      const google = providers.google as any
      providers.google = (options: unknown) => Object.assign(async (ctx: unknown) => {
        const provider = await google(options)(ctx)
        return provider && {
          ...provider,
          async resolveFont(family: string, fontOptions: unknown) {
            const result = await provider.resolveFont(family, fontOptions)
            if (family === 'Saira' && result) {
              result.fonts = result.fonts.filter((font: any) => font.src.some((src: any) => src.format === 'woff2'))
            }
            return result
          },
        }
      }, { _name: 'google' })
    },
  },
  modules: [
    '@vercel/analytics/nuxt',
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
      siteUrl: DEFAULT_SITE_URL,
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

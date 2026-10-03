import catalogue from '~/data/catalogue.json'
import { resolvePageSeo, websiteSchema } from '#shared/seo.mjs'

// Register once in the app shell so a previous page's robots/canonical tags
// cannot survive navigation, including between planned entries and guides.
export function usePageSeo() {
  // Include these non-HTML endpoints when using `nuxt generate` as well.
  if (import.meta.server) prerenderRoutes(['/sitemap.xml', '/robots.txt'])
  const route = useRoute()
  const config = useRuntimeConfig()
  const page = computed(() => resolvePageSeo(catalogue, route.path, config.public.siteUrl))

  useSeoMeta({
    title: () => page.value.title,
    description: () => page.value.description,
    robots: () => page.value.robots,
    ogTitle: () => page.value.title,
    ogDescription: () => page.value.description,
    ogUrl: () => page.value.canonical,
    ogSiteName: 'CodWiki',
    ogType: 'website'
  })
  useHead(() => ({
    link: page.value.canonical ? [{ key: 'canonical', rel: 'canonical', href: page.value.canonical }] : [],
    script: page.value.type === 'home' ? [{
      key: 'website-schema',
      type: 'application/ld+json',
      textContent: JSON.stringify(websiteSchema(config.public.siteUrl)).replace(/</g, '\\u003c')
    }] : []
  }))
}

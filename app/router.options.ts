import type { RouterConfig } from '@nuxt/schema'
import catalogue from './data/catalogue.json'

const mapGuides = new Set(catalogue.maps.map(map => map.route))

export default {
  scrollBehavior(to, from, savedPosition) {
    // GuideArticle opens the appropriate view/disclosures before scrolling.
    // Map hashes identify dataset targets rather than document elements.
    if (mapGuides.has(to.path) && (to.hash || to.path === from.path)) return false
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash }
    return to.path === from.path ? false : { top: 0 }
  },
} satisfies RouterConfig

import type { RouterConfig } from '@nuxt/schema'
import catalogue from './data/catalogue.json'

const mapGuides = new Set([...catalogue.maps, ...catalogue.guides].map(map => map.route))

export default {
  scrollBehavior(to, from, savedPosition) {
    // The homepage opens saved game disclosures before focusing and scrolling.
    // Leave these anchors to it so router scrolling cannot cover their headings.
    if (to.path === '/' && /^#(?:game-[\w-]+|tools|top)$/.test(to.hash)) return false
    // GuideArticle opens the appropriate view/disclosures before scrolling.
    // Map hashes identify dataset targets rather than document elements.
    if (mapGuides.has(to.path) && (to.hash || to.path === from.path)) return false
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash }
    return to.path === from.path ? false : { top: 0 }
  },
} satisfies RouterConfig

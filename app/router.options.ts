import type { RouterConfig } from '@nuxt/schema'
import catalogue from './data/catalogue.json'

const mapGuides = new Set([...catalogue.maps, ...catalogue.guides].map(map => map.route))

// DMZ text is set in a condensed webfont, so a heading measured before the
// page and its fonts settle ends up off screen once they do. The first load
// is handled by the DMZ shell, since Nuxt skips this for the initial route.
function dmzHashPosition(hash: string, samePage: boolean) {
  const position = () => {
    const el = document.getElementById(decodeURIComponent(hash.slice(1)))
    return el ? { el, top: Number.parseFloat(getComputedStyle(el).scrollMarginTop) || 0 } : false
  }
  if (samePage) return position()
  const nuxtApp = useNuxtApp()
  return new Promise<ReturnType<typeof position>>((resolve) => {
    let done = false
    const settle = () => {
      if (done) return
      done = true
      document.fonts.ready.then(() => resolve(position()))
    }
    nuxtApp.hooks.hookOnce('page:finish', settle)
    setTimeout(settle, 600)
  })
}

export default {
  scrollBehavior(to, from, savedPosition) {
    // The homepage opens saved game disclosures before focusing and scrolling.
    // Leave these anchors to it so router scrolling cannot cover their headings.
    if (to.path === '/' && /^#(?:game-[\w-]+|tools|top)$/.test(to.hash)) return false
    // GuideArticle opens the appropriate view/disclosures before scrolling.
    // Map hashes identify dataset targets rather than document elements.
    if (mapGuides.has(to.path) && (to.hash || to.path === from.path)) return false
    if (savedPosition) return savedPosition
    // A DMZ page that only changes its query (a Tac-Map pin, an Intel category) stays put.
    if (to.path.startsWith('/dmz/') && to.path === from.path && to.hash === from.hash) return false
    if (to.hash && to.path.startsWith('/dmz/')) return dmzHashPosition(to.hash, to.path === from.path)
    if (to.hash) return { el: to.hash }
    return to.path === from.path ? false : { top: 0 }
  },
} satisfies RouterConfig

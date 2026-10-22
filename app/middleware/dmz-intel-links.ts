import { intelEntry, intelHome, categoryHome } from '#shared/dmz-stations.mjs'

// Old Intel links: /dmz/intel#intel-<id> opened a card on one long list, ?c=
// filtered it by category and #sources opened its source list. Each now opens
// where that entry or category lives.
export default defineNuxtRouteMiddleware((to, from) => {
  const nuxtApp = useNuxtApp()
  const router = useRouter()
  // Only first loads and links from other pages: the landing opens entries in
  // its own drawer, and Back or Forward must return to them.
  if (import.meta.client && !nuxtApp.isHydrating && (to.path === from.path || window.history.state?.current === to.fullPath)) return
  const id = /^#intel-(.+)$/.exec(to.hash)?.[1]
  const entry = id ? intelEntry(decodeURIComponent(id)) : undefined
  const target = entry ? intelHome(entry) : to.hash === '#sources' ? '/dmz/intel/all#sources' : null
  if (target) {
    // The server never sees the hash, and leaving mid-hydration breaks the
    // page, so a first load moves on once it has hydrated.
    if (!nuxtApp.isHydrating) return navigateTo(target, { replace: true })
    nuxtApp.hooks.hookOnce('app:suspense:resolve', () => { router.replace(target) })
    return
  }
  const home = typeof to.query.c === 'string' ? categoryHome(to.query.c) : null
  if (home) return navigateTo(home, { replace: true, redirectCode: 301 })
})

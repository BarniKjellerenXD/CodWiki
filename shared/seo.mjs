import { seoOverrides } from './seo-overrides.mjs'
import { retiredToolDestination } from './retired-tools.mjs'

export const DEFAULT_SITE_URL = 'https://codzmwiki.com'
export const SUPER_EASTER_EGG_PATH = '/guides/bo7-super-easter-egg'

export function siteOrigin(value = DEFAULT_SITE_URL) {
  const url = new URL(value)
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('Site URL must be an HTTP(S) origin, without credentials, a path, query or fragment.')
  }
  return url.origin
}

// This affects head metadata only. It never rewrites the reader's URL or hash.
export function seoPath(value) {
  const path = String(value).split(/[?#]/, 1)[0]
  if (!path.startsWith('/') || path.startsWith('//')) return null
  return path.replace(/\/+$/, '') || '/'
}

export function createSeoPages(catalogue) {
  const games = new Map(catalogue.games.map(game => [game.id, game]))
  const maps = new Map(catalogue.maps.map(map => [map.id, map]))
  const pages = new Map()
  const add = (route, title, description, indexable, type) => {
    const path = seoPath(route)
    if (!path) throw new Error(`Invalid catalogue route: ${route}`)
    const override = seoOverrides[path]
    pages.set(path, {
      path,
      title: override?.title || title,
      description: override?.description || description,
      indexable,
      type
    })
  }
  const edition = (game, map) => `${game.name}${map.group === 'chronicles' ? ' Zombies Chronicles' : ''}`

  add('/', 'Call of Duty Zombies Guides and Tools — CodWiki',
    'Call of Duty Zombies map guides, Easter egg steps and puzzle tools, with quick checklists and progress saved on your device.', true, 'home')

  for (const map of catalogue.maps) {
    const game = games.get(map.gameId)
    if (!game) throw new Error(`Missing game for ${map.id}`)
    const planned = map.status === 'planned'
    add(map.route,
      `${map.name}${planned ? '' : ' Guide'} — ${game.name} — CodWiki`,
      planned
        ? `${map.name} in ${game.name}. Guide planned; walkthroughs and puzzle tools have not been added yet.`
        : `${map.name} guide for ${edition(game, map)}, with quick checklists and detailed reference steps to follow during your match.`,
      !planned, planned ? 'planned' : 'guide')
  }

  for (const guide of catalogue.guides || []) {
    const map = maps.get(guide.map)
    const game = games.get(guide.gameId)
    if (!map || !game) throw new Error(`Missing parent map or game for ${guide.id}`)
    add(guide.route, `${guide.name} Guide — ${game.name} — CodWiki`,
      `${guide.name} in ${edition(game, map)}: quest instructions, quick checklists and links to the ${map.name} reference guide.`,
      map.status !== 'planned', 'guide')
  }

  for (const tool of catalogue.tools) {
    // A retired URL must not return to the sitemap through a stale catalogue.
    if (retiredToolDestination(tool.route)) continue
    const map = maps.get(tool.map)
    const game = map && games.get(map.gameId)
    if (!map || !game) throw new Error(`Missing parent map or game for ${tool.id}`)
    add(tool.route, `${tool.name} — ${map.name} (${game.shortName || game.name}) — CodWiki`,
      `${tool.name} for ${map.name} in ${edition(game, map)}. Use this helper alongside the map guide, with instructions and reference links.`,
      map.status !== 'planned', 'tool')
  }

  add(SUPER_EASTER_EGG_PATH, 'BO7 Super Easter Egg Guide — CodWiki',
    'Follow the Black Ops 7 toy quests and Rex Infernus Warden instructions, with map guide links and checklists saved on your device.', true, 'guide')
  return pages
}

export function resolvePageSeo(catalogue, route, siteUrl = DEFAULT_SITE_URL) {
  const path = seoPath(route)
  const page = createSeoPages(catalogue).get(path)
  if (page) return {
    ...page,
    canonical: page.indexable ? siteOrigin(siteUrl) + path : null,
    robots: page.indexable ? 'index, follow' : 'noindex, follow'
  }
  const wiki = path?.startsWith('/wiki/')
  return {
    path,
    title: wiki ? 'Community Wiki Viewer — CodWiki' : 'Page not found — CodWiki',
    description: wiki ? 'A viewer for the r/CODZombies community wiki. The original guide material comes from its community contributors.' : 'This CodWiki page is unavailable. Browse the homepage for map guides and puzzle tools.',
    indexable: false,
    type: wiki ? 'wiki' : 'unknown',
    canonical: null,
    robots: 'noindex, follow'
  }
}

export function sitemapUrls(catalogue, siteUrl = DEFAULT_SITE_URL) {
  const origin = siteOrigin(siteUrl)
  return [...createSeoPages(catalogue).values()]
    .filter(page => page.indexable)
    .map(page => origin + page.path)
    .sort()
}

const xmlEscape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;')

export function renderSitemap(catalogue, siteUrl = DEFAULT_SITE_URL) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + sitemapUrls(catalogue, siteUrl).map(url => `  <url><loc>${xmlEscape(url)}</loc></url>`).join('\n')
    + '\n</urlset>\n'
}

export function renderRobots(siteUrl = DEFAULT_SITE_URL) {
  return `User-agent: *\nDisallow:\n\nSitemap: ${siteOrigin(siteUrl)}/sitemap.xml\n`
}

export function websiteSchema(siteUrl = DEFAULT_SITE_URL) {
  return { '@context': 'https://schema.org', '@type': 'WebSite', name: 'CodWiki', url: siteOrigin(siteUrl) + '/' }
}

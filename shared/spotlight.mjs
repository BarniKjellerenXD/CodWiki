// Spotlight: the site-wide search behind the search button, Ctrl K and /.
// scripts/build-spotlight.mjs writes the index to public/spotlight/index.json;
// this module turns it into items and ranks them for a query.

export const SPOTLIGHT_GROUPS = [
  { id: 'pages', label: 'Guides and pages' },
  { id: 'tools', label: 'Tools' },
  { id: 'places', label: 'Map spots' },
  { id: 'steps', label: 'Quest steps and sections' },
  { id: 'dmz', label: 'DMZ Intel, keys and Orders' },
  { id: 'actions', label: 'Actions' },
]

// mode: z for Zombies, d for DMZ, '' for both. weight lifts bigger
// destinations, such as a whole guide, above a single step with the same words.
export const SPOTLIGHT_KINDS = {
  guide: { label: 'Guide', group: 'pages', mode: 'z', weight: 40, icon: 'guide' },
  quest: { label: 'Quest', group: 'pages', mode: 'z', weight: 40, icon: 'guide' },
  tool: { label: 'Tool', group: 'tools', mode: 'z', weight: 35, icon: 'tool' },
  section: { label: 'Section', group: 'steps', mode: 'z', weight: 20, icon: 'section' },
  part: { label: 'Quest part', group: 'steps', mode: 'z', weight: 18, icon: 'section' },
  step: { label: 'Step', group: 'steps', mode: 'z', weight: 0, icon: 'step' },
  spot: { label: 'Map spot', group: 'places', mode: 'z', weight: 12, icon: 'pin' },
  portal: { label: 'Rune portal', group: 'places', mode: 'z', weight: 12, icon: 'pin' },
  'dmz-page': { label: 'DMZ station', group: 'pages', mode: 'd', weight: 40, icon: 'station' },
  'dmz-section': { label: 'Briefing', group: 'pages', mode: 'd', weight: 22, icon: 'section' },
  'dmz-place': { label: 'Hajin place', group: 'places', mode: 'd', weight: 25, icon: 'pin' },
  'dmz-spot': { label: 'Hajin spot', group: 'places', mode: 'd', weight: 5, icon: 'pin' },
  'dmz-key': { label: 'Key', group: 'dmz', mode: 'd', weight: 25, icon: 'key' },
  'dmz-order': { label: 'Order', group: 'dmz', mode: 'd', weight: 25, icon: 'order' },
  'dmz-intel': { label: 'Intel', group: 'dmz', mode: 'd', weight: 15, icon: 'intel' },
  action: { label: 'Action', group: 'actions', mode: '', weight: 30, icon: 'action' },
}

export const SPOTLIGHT_SCOPES = [
  { id: 'all', label: 'Everything' },
  { id: 'map', label: 'This map' },
  { id: 'z', label: 'Zombies' },
  { id: 'd', label: 'DMZ' },
]

export function normalizeSpotlight(value) {
  return String(value ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

const MODE_WORDS = { z: 'zombies', d: 'dmz mw4 modern warfare 4 hajin' }

// Index rows are arrays to keep the download small:
// [name, kind, route, map, context, keywords, badge]. A route that starts
// with # or ? continues its map's guide route. maps[id] is [name, game name,
// extra search words, guide route]. The route is also the result's id.
export function hydrateSpotlight(index, extra = []) {
  const maps = index?.maps || {}
  const rows = (index?.items || []).map(([name, kind, route, map = '', context = '', keywords = '', badge = '']) => ({ name, kind, route: /^[#?]/.test(route) ? maps[map][3] + route : route, map, context, keywords, badge }))
  return [...rows, ...extra].map(row => {
    const info = SPOTLIGHT_KINDS[row.kind] || SPOTLIGHT_KINDS.section
    const where = maps[row.map]
    const context = [where && `${where[1]} · ${where[0]}`, row.context].filter(Boolean).join(' · ')
    const name = normalizeSpotlight(row.name)
    // The name without spaces, so "packapunch" and "raygun" still match.
    const flat = name.replace(/ /g, '')
    return {
      ...row,
      id: row.id || row.route,
      context,
      badge: row.badge || info.label,
      group: info.group,
      mode: info.mode,
      icon: info.icon,
      weight: info.weight,
      key: name,
      flat,
      hay: ` ${normalizeSpotlight(`${row.name} ${row.badge || ''} ${context} ${row.keywords || ''} ${where?.[2] || ''} ${MODE_WORDS[info.mode] || ''}`)} ${flat === name ? '' : `${flat} `}`,
    }
  })
}

const SQUARE = /^[a-z]\d{1,2}$/

function inScope(item, scope, map) {
  if (scope === 'map') return !!map && item.map === map
  if (scope === 'z' || scope === 'd') return item.mode === scope || item.mode === ''
  return true
}

// Short words must start a word; longer ones may sit inside one ("nade" finds grenade).
const wordIn = (hay, word) => word.length <= 2 ? hay.includes(` ${word}`) : hay.includes(word)

// Matches inside a word only count for words of three letters or more, as in wordIn.
function score(item, phrase, words, here) {
  const name = item.key
  const joined = phrase.replace(/ /g, '')
  let points = name === phrase || item.flat === joined ? 1000
    : name.startsWith(phrase) || item.flat.startsWith(joined) ? 500
    : ` ${name}`.includes(` ${phrase}`) ? 300
    : joined.length > 2 && (name.includes(phrase) || item.flat.includes(joined)) ? 150 : 0
  for (const word of words) {
    if (` ${name}`.includes(` ${word}`)) points += 40
    else if (word.length > 2 && (name.includes(word) || item.flat.includes(word))) points += 20
    else points += 4
    if (SQUARE.test(word) && item.hay.includes(` ${word} `)) points += 60
  }
  points += item.weight
  // On a guide or tool, that map's own name matches outrank exact names elsewhere;
  // DMZ has one map, so on DMZ pages every DMZ result counts as this map's.
  if ((here.map && item.map === here.map) || (here.mode === 'd' && item.mode === 'd')) points += 550
  else if (here.mode && item.mode === here.mode) points += 30
  return points - Math.min(name.length, 80) * 0.4
}

// One typo (two in long words) for words of four letters or more; used only
// when nothing matches exactly.
function nearWord(word, token) {
  if (Math.abs(word.length - token.length) > 2) return false
  const limit = word.length >= 8 ? 2 : 1
  let previous = Array.from({ length: token.length + 1 }, (_, index) => index)
  let before = null
  for (let i = 1; i <= word.length; i++) {
    const row = [i]
    let best = i
    for (let j = 1; j <= token.length; j++) {
      const cost = word[i - 1] === token[j - 1] ? 0 : 1
      row[j] = Math.min(previous[j] + 1, row[j - 1] + 1, previous[j - 1] + cost)
      if (before && i > 1 && j > 1 && word[i - 1] === token[j - 2] && word[i - 2] === token[j - 1]) row[j] = Math.min(row[j], before[j - 2] + 1)
      best = Math.min(best, row[j])
    }
    if (best > limit) return false
    before = previous
    previous = row
  }
  return previous[token.length] <= limit
}

// Typos are only forgiven in the result's own name, to keep the guesses close.
const tokensOf = new WeakMap()
function fuzzyMatch(item, words) {
  let tokens = tokensOf.get(item)
  if (!tokens) tokensOf.set(item, tokens = [...new Set(item.key.split(' '))])
  return words.every(word => wordIn(item.hay, word) || (word.length >= 4 && tokens.some(token => nearWord(word, token))))
}

// here: { map, mode } for the page the visitor is on, from spotlightContext.
export function searchSpotlight(items, query, { scope = 'all', here = {}, limit = 80 } = {}) {
  const phrase = normalizeSpotlight(query)
  if (!phrase) return { results: [], total: 0, fuzzy: false }
  const words = [...new Set(phrase.split(' '))]
  const pool = items.filter(item => inScope(item, scope, here.map))
  let hits = pool.filter(item => words.every(word => wordIn(item.hay, word)))
  let fuzzy = false
  if (!hits.length) {
    hits = pool.filter(item => fuzzyMatch(item, words))
    fuzzy = hits.length > 0
  }
  const ranked = hits.map(item => ({ item, points: score(item, phrase, words, here) - (fuzzy ? 100 : 0) }))
    .sort((a, b) => b.points - a.points || a.item.name.localeCompare(b.item.name))
  return { results: ranked.slice(0, limit).map(hit => hit.item), total: ranked.length, fuzzy }
}

// Groups follow the order their best result appears in, so the top hit's group leads.
export function groupSpotlight(results, { perGroup = 5, open = [] } = {}) {
  const groups = new Map()
  for (const item of results) {
    if (!groups.has(item.group)) groups.set(item.group, [])
    groups.get(item.group).push(item)
  }
  return [...groups].map(([id, list]) => ({
    id,
    label: SPOTLIGHT_GROUPS.find(group => group.id === id)?.label || id,
    total: list.length,
    items: open.includes(id) ? list : list.slice(0, perGroup),
  }))
}

// Which map or mode the current page belongs to, so its results rank first.
export function spotlightContext(path, items = []) {
  const clean = String(path || '').split(/[?#]/)[0].replace(/\/$/, '')
  if (/^\/dmz(?:\/|$)/.test(clean)) return { map: '', mode: 'd' }
  const page = clean && items.find(item => (item.kind === 'guide' || item.kind === 'tool' || item.kind === 'quest') && item.route === clean)
  if (page?.map) return { map: page.map, mode: 'z' }
  return { map: '', mode: /^\/(guides|tools)\//.test(clean) ? 'z' : '' }
}

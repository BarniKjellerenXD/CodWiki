// Builds the Spotlight index (public/spotlight/index.json) and the preview
// text (public/spotlight/text.json) from the generated search index and the
// structured content. Run after generate-catalogue.mjs, which imports this.
// They are static files fetched on first use, so no page bundles or prefetches
// them; app/data/spotlightVersion.json carries their hashes to bust caches.
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { dmzPages, dmzBriefingSections, dmzOrders, dmzStations } from '../shared/dmz.mjs'
import { dmzIntel, intelCategory } from '../shared/dmz-intel.mjs'
import { dmzKeys } from '../shared/dmz-keys.mjs'
import { intelHome, intelHomeLabel, intelStations, intelEverything } from '../shared/dmz-stations.mjs'
import { hajinPins, hajinLayer } from '../shared/dmz-map.mjs'
import { expansionGuides } from '../shared/expansion-guides.mjs'
import { typeInfo, locationType } from '../app/utils/mapFilters.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
const catalogue = read('shared/catalogue.json')
const search = read('app/data/searchIndex.json')
const quickQuests = read('app/data/quickQuests.json')
const tools = read('app/data/expansionTools.json')
const portals = read('app/data/mw3RunePortals.json')
// superEasterEgg.ts holds a plain JSON array; reading it as text avoids needing TypeScript support in Node.
const eggSource = fs.readFileSync(path.join(root, 'app/data/superEasterEgg.ts'), 'utf8')
const superEggMaps = JSON.parse(eggSource.slice(eggSource.indexOf('[')))

const items = []
const text = {}
const ids = new Set()
const plain = value => String(value || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/\s+/g, ' ').trim()
const clip = (value, size) => value.length > size ? `${value.slice(0, size - 1).replace(/\s+\S*$/, '')}…` : value
// Search words beyond a clipped name, without repeats. Lone digits stay, so
// "Modern Warfare 3" still matches a search for it.
const words = (value, skip = '') => {
  const seen = new Set(skip.toLowerCase().match(/[a-z0-9']+/g) || [])
  return (value.toLowerCase().match(/[a-z0-9][a-z0-9'-]+|\d/g) || []).filter(word => !seen.has(word) && seen.add(word)).join(' ')
}
// The route is each result's id, so it must be unique. Routes under a map's
// guide are stored from their # or ? on.
function add(name, kind, route, { map = '', context = '', keywords = '', badge = '', preview = '' } = {}) {
  if (ids.has(route)) throw new Error(`Spotlight route used twice: ${route}`)
  ids.add(route)
  const base = maps[map]?.[3]
  const row = [name, kind, base && /^[#?]/.test(route.slice(base.length)) && route.startsWith(base) ? route.slice(base.length) : route, map, context, keywords, badge]
  while (row.length > 3 && !row.at(-1)) row.pop()
  items.push(row)
  if (preview) text[route] = clip(plain(preview), 320)
}

// Maps: name, game and the words players use for them (bo3, Black Ops III …).
const maps = {}
const gameOf = id => catalogue.games.find(game => game.id === id)
for (const map of catalogue.maps) {
  const game = gameOf(map.gameId)
  maps[map.id] = [map.name, game.name, words(`${game.id} ${game.shortName || ''} ${(game.aliases || []).join(' ')} ${(map.aliases || []).join(' ')} ${map.edition || ''} ${map.mode || ''}`), map.route]
}
const guideMap = id => catalogue.maps.find(map => map.id === id)?.id || catalogue.guides?.find(guide => guide.id === id)?.map || ''
const guideRoute = id => catalogue.maps.find(map => map.id === id)?.route || catalogue.guides?.find(guide => guide.id === id)?.route
const guideIntro = new Map(expansionGuides.map(guide => [guide.id, guide.intro]))
const toolHelp = new Map(tools.map(tool => [tool.id, tool.help]))

// Zombies pages, sections and quest parts come from the generated search index,
// which already reads the hand-written BO7 guides.
for (const entry of search) {
  const map = entry.map && maps[entry.map] ? entry.map : ''
  if (entry.kind === 'Guide' || entry.kind === 'Map entry') add(entry.name, 'guide', entry.route, { map, keywords: 'guide main quest easter egg', preview: guideIntro.get(entry.id) })
  else if (entry.kind === 'Tool') add(entry.name, 'tool', entry.route, { map, keywords: 'solver tracker tool', preview: toolHelp.get(entry.id) })
  else if (entry.kind === 'Quest') add(entry.name, 'quest', entry.route, { context: 'Black Ops 7', keywords: entry.keywords })
  else if (entry.kind === 'Section' && map) add(entry.name, 'section', entry.route, { map })
  else if (entry.kind === 'Quick parts') add(entry.name, 'part', entry.route, { map, keywords: 'quick parts checklist' })
}

// Quick steps: the short line players tick off during a run.
for (const [guide, phases] of Object.entries(quickQuests)) {
  const route = guideRoute(guide)
  if (!route) continue
  for (const phase of phases) for (const step of phase.steps) {
    const line = plain(step.html)
    if (!line) continue
    const name = clip(line, 110)
    add(name, 'step', `${route}#quick-step-${step.id}`, { map: guideMap(guide), context: plain(phase.title), keywords: name === line ? '' : words(line, name), preview: name === line ? '' : line })
  }
}

// Super Easter Egg steps, filed under the map each toy comes from.
for (const egg of superEggMaps) {
  const map = egg.guide.split('/').pop()
  egg.steps.forEach(([title, body], index) => add(title, 'step', `/guides/bo7-super-easter-egg#${egg.id}-${egg.stepIds[index]}`, { map: maps[map] ? map : '', context: 'Super Easter Egg', keywords: 'super ee toy', preview: body }))
}

// Interactive-map spots. Spots that share a label on one map, such as three
// ammo caches, become one result that opens the first of them.
for (const file of fs.readdirSync(path.join(root, 'app/data/maps')).filter(file => file.endsWith('.json')).sort()) {
  const data = read(`app/data/maps/${file}`)
  const route = guideRoute(data.id)
  if (!route || !maps[data.id]) continue
  const groups = new Map()
  for (const location of data.locations || []) {
    const key = location.label.toLowerCase().replace(/\s+/g, ' ').trim()
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(location)
  }
  for (const spots of groups.values()) {
    const [first] = spots
    const type = typeInfo(locationType(first)).label
    const where = [...new Set(spots.map(spot => spot.floor || spot.grid).filter(Boolean))]
    const context = [type, spots.length > 1 ? `${spots.length} spots` : where[0]].filter(Boolean).join(' · ')
    add(first.label, 'spot', `${route}#map:${first.id}`, { map: data.id, context, keywords: words(`${type} ${where.join(' ')} ${first.grid || ''}`, first.label), preview: first.description })
  }
}

// MW3 rune portals open the portal finder with that entrance or exit chosen.
const portalTool = catalogue.tools.find(tool => tool.route === '/tools/mw3-rune-portals')
for (const portal of portals.entrances) add(`Rune portal ${portal.label}`, 'portal', `/tools/mw3-rune-portals?from=${portal.id}`, { map: portalTool?.map || '', context: `Entrance · ${portal.grid}${portal.nearbyArea ? ` near ${portal.nearbyArea}` : ''}`, keywords: 'dark aether rift entrance' })
for (const portal of portals.destinations) add(`Rune portal exit ${portal.label}`, 'portal', `/tools/mw3-rune-portals?to=${portal.id}`, { map: portalTool?.map || '', context: `Exit · ${portal.grid}${portal.nearbyArea ? ` near ${portal.nearbyArea}` : ''}`, keywords: `dark aether rift destination ${portal.code || ''}` })

// DMZ. Intel entries open on the station they live on, in its entry drawer.
for (const page of dmzPages) {
  const station = dmzStations.find(item => item.route === page.path)
  const shelf = [...intelStations, intelEverything].find(item => item.path === page.path)
  add(page.name, 'dmz-page', page.path, { context: shelf && !station ? 'DMZ · Intel' : 'DMZ', keywords: `${station?.label || shelf?.label || ''} station intel`, preview: page.description })
}
for (const section of dmzBriefingSections) add(section.title, 'dmz-section', `/dmz/briefing#${section.id}`, { context: 'DMZ · Briefing', keywords: `briefing basics` })
add('Hajin threat zones', 'dmz-place', '/dmz/hajin?view=threat#map', { context: 'DMZ · Tac-Map', keywords: `threat level zones low medium high critical danger map` })
for (const pin of hajinPins.filter(pin => !pin.same)) {
  const layer = hajinLayer(pin.layer)
  const major = ['poi', 'fortress', 'area', 'compound'].includes(pin.layer)
  add(pin.name, major ? 'dmz-place' : 'dmz-spot', `/dmz/hajin?pin=${pin.id}#map`, { context: `DMZ · Hajin · ${pin.square}${pin.threat ? ` · ${pin.threat} threat` : ''}`, keywords: `${layer.one} map`, badge: major ? '' : layer.one })
}
for (const order of dmzOrders) add(order.name, 'dmz-order', `/dmz/orders#order-${order.id}`, { context: `DMZ · Orders · ${order.chapter}`, keywords: `order ${words(order.tasks.map(task => task.text).join(' '), order.name)}`, preview: order.tasks.map(task => task.text).join(' · ') })
const keyIntel = new Set(dmzKeys.map(key => key.intel).filter(Boolean))
for (const key of dmzKeys) add(key.name, 'dmz-key', `/dmz/stash#key-${key.id}`, { context: `DMZ · Key tracker${key.rarity ? ` · ${key.rarity}` : ''}`, keywords: `key locked room ${key.rooms.flatMap(room => [room.name, ...(room.squares || [])]).join(' ')}`, badge: key.type === 'Locked room' ? 'Locked room' : 'Key', preview: key.summary })
for (const entry of dmzIntel.filter(entry => !entry.tracked && !keyIntel.has(entry.id))) {
  const category = intelCategory(entry.category).label
  const home = intelHomeLabel(entry)
  add(entry.name, 'dmz-intel', intelHome(entry), { context: `DMZ · ${home}${home === category ? '' : ` · ${category}`}`, keywords: `intel ${words(entry.summary, entry.name).split(' ').slice(0, 24).join(' ')}`, badge: entry.type || 'Intel', preview: entry.summary })
}

const files = { index: JSON.stringify({ version: 1, maps, items }) + '\n', text: JSON.stringify(text) + '\n' }
fs.mkdirSync(path.join(root, 'public/spotlight'), { recursive: true })
for (const [name, body] of Object.entries(files)) fs.writeFileSync(path.join(root, `public/spotlight/${name}.json`), body)
const hash = body => crypto.createHash('sha1').update(body).digest('hex').slice(0, 10)
fs.writeFileSync(path.join(root, 'app/data/spotlightVersion.json'), JSON.stringify({ index: hash(files.index), text: hash(files.text) }, null, 2) + '\n')
const size = body => Math.round(Buffer.byteLength(body) / 1024)
console.log(`Spotlight: ${items.length} results (${size(files.index)} KB) and ${Object.keys(text).length} previews (${size(files.text)} KB).`)

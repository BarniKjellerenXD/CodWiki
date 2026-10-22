import fs from 'node:fs'
import { parse } from '@vue/compiler-dom'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import desktopCatalogue from '../desktop-app/catalogue.js'
import { dmzPages, dmzStations, dmzBriefingSections, hajinPois, dmzOrders } from '../shared/dmz.mjs'
import { dmzIntel, intelCategory } from '../shared/dmz-intel.mjs'
import { intelHome, intelStations, intelEverything } from '../shared/dmz-stations.mjs'
import { hajinPins, hajinLayer } from '../shared/dmz-map.mjs'
import { guideTiers } from '../shared/dmz-guide.mjs'
import './generate-map-links.mjs'
import './generate-expansion.mjs'
import './build-mw3-rune-portals.mjs'
process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'))
const catalogue = JSON.parse(fs.readFileSync('shared/catalogue.json', 'utf8'))
fs.writeFileSync('app/data/catalogue.json', JSON.stringify(catalogue, null, 2) + '\n')
const actions = JSON.parse(fs.readFileSync('shared/desktop-actions.json', 'utf8'))
const entries = []
const quests = JSON.parse(fs.readFileSync('app/data/quickQuests.json', 'utf8'))
const attr = (n, name) => n.props?.find(p => p.name === name)?.value?.content || ''
const text = (n, clean = false) => clean && /g-tag|g-chev/.test(attr(n, 'class')) ? '' : n.type === 2 ? n.content : (n.children || []).map(c => text(c, clean)).join('')
for (const map of [...catalogue.maps, ...(catalogue.guides || [])]) {
  const game = catalogue.games.find(game => game.id === map.gameId)
  const keywords = `${game.id} ${game.name} ${(game.aliases || []).join(' ')} zombies ${(map.aliases || []).join(' ')} ${map.group || ''} ${map.edition || ''} ${map.mode || ''} ${map.status === 'planned' ? 'guide planned map entry' : 'main quest easter egg'}`
  entries.push({ id: map.id, name: map.name, map: map.map || map.id, kind: map.status === 'planned' ? 'Map entry' : 'Guide', route: map.route, keywords })
  const root = parse(fs.readFileSync(`app/components/guide/${map.id}.vue`, 'utf8'))
  const walk = (n, quick = false) => {
    quick ||= /\b(cheat-grid|quest-grid)\b/.test(attr(n, 'class'))
    if (/^h[123]$/.test(n.tag)) {
      const name = text(n, true).replace(/\s+/g, ' ').trim()
      const id = attr(n, 'id') || `${n.tag}-${text(n).toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')}`
      if (name && !quick && id !== 'wiki_main_quest_cheat_sheet') entries.push({ id: `${map.id}:${id}`, name, map: map.map || map.id, kind: 'Section', route: `${map.route}#${id}`, keywords: `${map.name} ${keywords}` })
    }
    n.children?.forEach(child => walk(child, quick))
  }
  walk(root)
  for (const phase of quests[map.id] || []) entries.push({ id:`${map.id}:quick-${phase.id}`, name:phase.title, map:map.id, kind:'Quick parts', route:`${map.route}#quick-${phase.id}`, keywords:map.name+' main quest checklist' })
}
for (const tool of catalogue.tools) { const map=catalogue.maps.find(m=>m.id===tool.map); entries.push({ ...tool, kind: 'Tool', keywords: `${map.gameId} ${catalogue.games.find(g=>g.id===map.gameId).name} ${map.name} solver tracker` }) }
entries.push({ id: 'super-ee', name: 'Super Easter Egg', map: '', kind: 'Quest', route: '/guides/bo7-super-easter-egg', keywords: 'super ee toys warden exfil' })
const dmzKeywords = 'mw4 modern warfare 4 dmz hajin exclusion zone extraction'
const dmzContext = 'Modern Warfare 4 · DMZ'
const dmzPageId = page => `dmz${page.path.slice(4).replaceAll('/', '-') || '-stations'}`
const intelShelf = page => [...intelStations, intelEverything].find(item => item.path === page.path)
for (const page of dmzPages) entries.push({ id: dmzPageId(page), name: page.name, map: '', kind: 'DMZ', context: dmzContext, route: page.path, keywords: `${dmzKeywords} ${page.description}` })
for (const section of dmzBriefingSections) entries.push({ id: `dmz-briefing:${section.id}`, name: section.title, map: '', kind: 'Section', context: `${dmzContext} · How DMZ works`, route: `/dmz/briefing#${section.id}`, keywords: `${dmzKeywords} briefing basics` })
// Guide stages open on their stage, found by any sign or step title.
for (const tier of guideTiers) entries.push({ id: `dmz-guide:${tier.id}`, name: `${tier.name} game`, map: '', kind: 'Section', context: `${dmzContext} · Progression guide`, route: `/dmz/guide?stage=${tier.id}`, keywords: `${dmzKeywords} guide progression stage what to do next ${tier.short} ${tier.signs.map(([, text]) => text).join(' ')} ${tier.steps.map(step => step.title).join(' ')}` })
// Hajin places open their Tac-Map card. A fortress named like its location is that location.
for (const poi of hajinPois) { const pin = poi.toLowerCase().replace(/[^a-z0-9]+/g, '-'); entries.push({ id: `dmz-hajin:${pin}`, name: poi, map: '', kind: 'Location', context: `${dmzContext} · Hajin`, route: `/dmz/hajin?pin=${pin}#map`, keywords: `${dmzKeywords} poi point of interest map` }) }
for (const pin of hajinPins.filter(pin => ['fortress', 'area', 'compound'].includes(pin.layer) && !pin.same)) entries.push({ id: `dmz-hajin:${pin.id}`, name: pin.name, map: '', kind: 'Location', context: `${dmzContext} · Hajin ${hajinLayer(pin.layer).one.toLowerCase()}`, route: `/dmz/hajin?pin=${pin.id}#map`, keywords: `${dmzKeywords} map ${pin.square}` })
entries.push({ id: 'dmz-hajin:threat-zones', name: 'Hajin threat zones', map: '', kind: 'Section', context: `${dmzContext} · Hajin Tac-Map`, route: '/dmz/hajin?view=threat#map', keywords: `${dmzKeywords} threat level zones low medium high critical extreme danger map` })
for (const order of dmzOrders) entries.push({ id: `dmz-order:${order.id}`, name: order.name, map: '', kind: 'DMZ Order', context: `${dmzContext} · Orders tracker`, route: '/dmz/orders', keywords: `${dmzKeywords} orders ${order.tasks.map(task => task.text).join(' ')}` })
// Tracked Orders already have search entries that open the tracker. The
// homepage bundles this index, so Intel keywords keep only distinct summary words.
const intelWords = entry => [...new Set(entry.summary.toLowerCase().match(/[a-z0-9][a-z0-9'-]{3,}/g) || [])].slice(0, 18).join(' ')
for (const entry of dmzIntel.filter(entry => !entry.tracked)) entries.push({ id: `dmz-intel:${entry.id}`, name: entry.name, map: '', kind: entry.type || 'DMZ Intel', context: `${dmzContext} · Intel · ${intelCategory(entry.category).label}`, route: intelHome(entry), keywords: `${dmzKeywords} intel ${intelCategory(entry.category).label.toLowerCase()} ${intelWords(entry)}` })
fs.writeFileSync('app/data/searchIndex.json', JSON.stringify(entries, null, 2) + '\n')
const nav = catalogue.maps.flatMap(m => [
  { id: m.id, map: m.id, game: m.gameId, gameName: catalogue.games.find(g=>g.id===m.gameId).name, group: m.group || '', status: m.status || 'available', keywords: [...(catalogue.games.find(g=>g.id===m.gameId).aliases || []), ...(m.aliases || []), m.edition || '', m.mode || ''].join(' '), kind: 'guide', section: m.name, label: m.status === 'planned' ? 'Map entry · guide planned' : 'Guide', url: m.route, accel: m.shortcut || null, icon: '◇' },
  ...(catalogue.guides || []).filter(g=>g.map===m.id).map(g=>({ id:g.id, map:m.id, game:m.gameId, gameName:catalogue.games.find(g=>g.id===m.gameId).name, kind:'quest', section:m.name, label:g.name.replace('Outbreak: ', ''), url:g.route, accel:null, icon:'◇' })),
  ...catalogue.tools.filter(t=>t.map===m.id).map(t=>({ id:t.id, map:m.id, game:m.gameId, gameName:catalogue.games.find(g=>g.id===m.gameId).name, kind:'tool', section:m.name, label:t.name, url:t.route, accel:t.shortcut || null, icon:'↗' }))
])
const navGames = catalogue.games.map(game => ({ ...game, planned: catalogue.maps.filter(map => map.gameId === game.id).every(map => map.status === 'planned') }))
fs.writeFileSync('public/desktop-catalogue.json', JSON.stringify(desktopCatalogue.createCatalogueManifest(nav, navGames), null, 2) + '\n')
// DMZ ships inside the app, outside the live catalogue: released apps reject non-Zombies routes there.
const navModes = [{ id: 'dmz', name: 'DMZ', title: dmzContext, route: '/dmz', summary: `Modern Warfare 4 · ${dmzPages.length} pages · Orders tracker` }]
const navModeEntries = dmzPages.map(page => {
  const station = dmzStations.find(station => station.route === page.path)
  return { id: dmzPageId(page), map: dmzPageId(page), game: 'dmz', gameName: dmzContext, group: '', status: 'available', keywords: `${dmzKeywords} ${page.description}`, kind: 'guide', section: page.name, label: station ? `${station.label} station` : intelShelf(page) ? `Intel · ${intelShelf(page).label}` : 'Station menu', url: page.path, accel: null, icon: '◇' }
})
if (navModeEntries.some(entry => nav.some(item => item.id === entry.id))) throw new Error('A DMZ desktop entry ID is already used by the catalogue')
fs.writeFileSync('desktop-app/renderer/nav.js', `// Generated from shared/catalogue.json and shared/dmz.mjs; run node scripts/generate-catalogue.mjs.\nconst NAV = ${JSON.stringify(nav,null,2)}\nconst NAV_GAMES = ${JSON.stringify(navGames,null,2)}\nconst SYSTEM_ACTIONS = ${JSON.stringify(actions,null,2)}\nconst NAV_MODES = ${JSON.stringify(navModes,null,2)}\nconst NAV_MODE_ENTRIES = ${JSON.stringify(navModeEntries,null,2)}\nif (typeof window !== 'undefined') { window.NAV = NAV; window.NAV_GAMES = NAV_GAMES; window.SYSTEM_ACTIONS = SYSTEM_ACTIONS; window.NAV_MODES = NAV_MODES; window.NAV_MODE_ENTRIES = NAV_MODE_ENTRIES }\nif (typeof module !== 'undefined') { module.exports = NAV; module.exports.games = NAV_GAMES; module.exports.SYSTEM_ACTIONS = SYSTEM_ACTIONS; module.exports.MODES = NAV_MODES; module.exports.MODE_ENTRIES = NAV_MODE_ENTRIES }\n`)
console.log(`Generated ${entries.length} search entries and ${nav.length + navModeEntries.length} desktop shortcuts, ${navModeEntries.length} of them DMZ.`)
const css = fs.readFileSync('app/assets/css/main.css', 'utf8')
fs.writeFileSync('desktop-app/renderer/themes.css', '/* Generated from the website theme tokens. */\n' + [...css.matchAll(/:root\[data-theme="[^"]+"\] \{[^}]+\}/g)].map(m=>m[0]).join('\n') + '\n')
// Spotlight reads the search index written above.
await import('./build-spotlight.mjs')

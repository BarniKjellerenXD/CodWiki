// MW4 DMZ Intel stations: where each Intel entry lives, and the helpers the
// stations share. The Boss Board, 3D Printer and Operators are FOB stations
// with pages of their own; Intel's other shelves sit under /dmz/intel, which
// opens on the Ask-first questions. Any DMZ page opens an entry in the shell's
// drawer from a #intel-<id> link.

import { dmzStations, dmzOrders } from './dmz.mjs'
import { dmzIntel, intelCategory, intelSearchText } from './dmz-intel.mjs'
import { dmzKeys } from './dmz-keys.mjs'
import { hajinPins } from './dmz-map.mjs'

const stationIcon = id => dmzStations.find(station => station.id === id).icon
export const intelIcons = {
  missions: 'M5 21V4 M5 4h11l-2 4 2 4H5',
  armory: 'M4 7.5l8-4.5 8 4.5v9l-8 4.5-8-4.5z M4 7.5l8 4.5 8-4.5 M12 12v9',
  manual: 'M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z M5 19.5A1.5 1.5 0 0 0 6.5 21H19 M9 7h6 M9 10.5h6',
  status: 'M3 12h4l2.5-6 5 12 2.5-6h4',
  all: 'M4 6h16 M4 12h16 M4 18h16',
  search: 'M10.5 18a7.5 7.5 0 1 0 0-15a7.5 7.5 0 0 0 0 15z M16 16l5 5',
  key: 'M8 15a4 4 0 1 0 0-8a4 4 0 1 0 0 8 M11.5 11H21 M18 11v3 M15 11v2',
  exfil: 'M12 21V9 M7 13l5-5 5 5 M5 3h14',
  bug: 'M9 7a3 3 0 0 1 6 0 M7 10h10v5a5 5 0 0 1-10 0z M12 10v10 M3 13h4 M17 13h4 M4 8l3 2 M20 8l-3 2 M4 19l3-2 M20 19l-3-2',
  clock: 'M12 21a9 9 0 1 0 0-18a9 9 0 1 0 0 18 M12 7v5l3 2',
  start: 'M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z',
  loot: 'M3 5h18v4H3z M4 9h16v11H4z M10 13h4',
}

// ---------------------------------------------------------------- Stations

// Every Intel category has one home: a station below or a hand-off.
export const intelStations = [
  { id: 'boss', label: 'Boss Board', path: '/dmz/boss-board', icon: stationIcon('boss'), categories: ['enemies'], fob: true, desc: 'Lieutenants and Commanders: where players find them, what they drop, and the forces around them.' },
  { id: 'printer', label: '3D Printer', path: '/dmz/printer', icon: stationIcon('printer'), categories: ['crafting'], fob: true, desc: 'Every recipe with its materials, and a planner that adds up what to loot this run.' },
  { id: 'operators', label: 'Operators', path: '/dmz/operators', icon: stationIcon('operators'), categories: ['traits', 'operators'], fob: true, desc: 'The three trait trees side by side, plus Active Duty, MIA and Dog Tags.' },
  { id: 'missions', label: 'Missions', path: '/dmz/intel/missions', icon: intelIcons.missions, categories: ['missions'], desc: 'Story Missions, Dynamic Ops, Side Ops and contracts. Orders you tick off live in the Orders tracker.' },
  { id: 'armory', label: 'Armory', path: '/dmz/intel/armory', icon: intelIcons.armory, categories: ['gear'], desc: 'Weapons, contraband, equipment, consumables, backpacks and kits.' },
  { id: 'manual', label: 'Field manual', path: '/dmz/intel/field-manual', icon: intelIcons.manual, categories: ['mechanics', 'exfil', 'vehicles', 'fob', 'economy', 'tips'], desc: 'How the zone works: rules, infil and exfil, vehicles, the FOB, cash and field notes.' },
  { id: 'status', label: 'Status', path: '/dmz/intel/status', icon: intelIcons.status, categories: ['issues', 'dates'], desc: 'Known issues by fix status, and the dates that matter.' },
]
export const intelHandoffs = [
  { id: 'deploy', category: 'map', label: 'Tac-Map', path: '/dmz/hajin', icon: stationIcon('deploy'), desc: 'Hajin places stay on the map, with their Intel one tap away.' },
  { id: 'stash', category: 'keys', label: 'Key tracker', path: '/dmz/stash', icon: stationIcon('stash'), desc: 'Keys and locked rooms stay in the tracker.' },
]
export const intelEverything = { id: 'all', label: 'Everything', path: '/dmz/intel/all', icon: intelIcons.all, desc: 'Every entry on one long page, with category, confidence and search filters.' }

export const intelStation = id => intelStations.find(station => station.id === id)
export const stationOf = entry => intelStations.find(station => station.categories.includes(entry.category))
export const stationEntries = station => dmzIntel.filter(entry => station.categories.includes(entry.category))
export const intelCount = category => dmzIntel.filter(entry => entry.category === category).length

const byId = new Map(dmzIntel.map(entry => [entry.id, entry]))
export const intelEntry = id => byId.get(id)
const entriesOf = ids => ids.map(id => byId.get(id)).filter(Boolean)

const detailOf = (entry, label) => (entry?.details || []).find(([name]) => name === label)?.[1]
export { detailOf as intelDetail }

// ---------------------------------------------------------------- Places

const PLACE_LAYERS = ['poi', 'area', 'compound', 'fortress']
// Tac-Map places whose card lists this entry, major locations first.
export function entryPlaces(entry) {
  return hajinPins
    .filter(pin => PLACE_LAYERS.includes(pin.layer) && pin.intel?.includes(entry.id) && !pin.same)
    .sort((a, b) => PLACE_LAYERS.indexOf(a.layer) - PLACE_LAYERS.indexOf(b.layer) || a.name.localeCompare(b.name))
    .map(pin => ({ id: pin.id, name: pin.name, square: pin.square, threat: pin.threat, major: pin.layer === 'poi' }))
}
export const placeLink = id => `/dmz/hajin?pin=${id}#map`
// Opens the Tac-Map with one layer switched on for this visit, e.g. every police station.
export const layerLink = id => `/dmz/hajin?layer=${id}#map`

// Major places on the Tac-Map, with the Intel each card lists.
export const intelPlaces = hajinPins.filter(pin => pin.layer === 'poi').map(pin => ({
  id: pin.id, name: pin.name, square: pin.square, threat: pin.threat, intel: entriesOf(pin.intel || []).filter(entry => entry.id !== pin.id && entry.id !== 'hajin-exclusion-zone'),
}))

// A grid square such as H6 lists the places inside it.
export function placesInSquare(query) {
  const square = query.trim().toUpperCase()
  if (!/^[A-Z]\d{1,2}$/.test(square)) return []
  return hajinPins.filter(pin => PLACE_LAYERS.includes(pin.layer) && pin.square === square && !pin.same)
    .map(pin => ({ id: pin.id, name: pin.name, square: pin.square, major: pin.layer === 'poi' }))
}

// ---------------------------------------------------------------- Homes

const pinIds = new Set(hajinPins.filter(pin => !pin.same).map(pin => pin.id))
const trackedKey = new Map(dmzKeys.filter(key => key.intel).map(key => [key.intel, key.id]))

// The one address that shows an entry best. Spotlight, the search index and
// old /dmz/intel#intel-<id> links all go here.
export function intelHome(entry) {
  if (entry.tracked) return `/dmz/orders#${entry.id}`
  if (entry.category === 'keys') return trackedKey.has(entry.id) ? `/dmz/stash#key-${trackedKey.get(entry.id)}` : `/dmz/stash#intel-${entry.id}`
  if (entry.category === 'map') {
    const pin = pinIds.has(entry.id) ? entry.id : entryPlaces(entry)[0]?.id
    return pin ? `/dmz/hajin?pin=${pin}#intel-${entry.id}` : `/dmz/hajin#intel-${entry.id}`
  }
  return `${stationOf(entry).path}#intel-${entry.id}`
}
const homeLabels = { '/dmz/hajin': 'Tac-Map', '/dmz/stash': 'Key tracker', '/dmz/orders': 'Orders tracker' }
export function intelHomeLabel(entry) {
  const path = intelHome(entry).split(/[?#]/)[0]
  return homeLabels[path] || intelStations.find(station => station.path === path).label
}
// Old ?c= category links open the category's page.
export function categoryHome(category) {
  if (category === 'latest') return `${intelEverything.path}?c=latest`
  if (category === 'map') return intelHandoffs[0].path
  if (category === 'keys') return intelHandoffs[1].path
  const station = intelStations.find(item => item.categories.includes(category))
  if (!station) return null
  return station.categories.length > 1 && station.path.startsWith('/dmz/intel/') ? `${station.path}#${category}` : station.path
}

// ---------------------------------------------------------------- Boss Board

// Named targets first, then the forces around them.
export function bossGroups() {
  const enemies = dmzIntel.filter(entry => entry.category === 'enemies')
  const commander = entry => entry.type === 'Boss' || detailOf(entry, 'Type') === 'Commander'
  const overview = new Set(['lieutenants', 'commanders', 'boss-board'])
  const placed = entry => entryPlaces(entry).length && detailOf(entry, 'Location')
  return [
    { id: 'lieutenants', title: 'Lieutenants', intro: byId.get('lieutenants'), entries: enemies.filter(entry => entry.type === 'Lieutenant' && !overview.has(entry.id)) },
    { id: 'commanders', title: 'Commanders and bosses', intro: byId.get('commanders'), entries: enemies.filter(entry => commander(entry) && !overview.has(entry.id)) },
    { id: 'named', title: 'Other named targets', entries: enemies.filter(entry => entry.type === 'Enemy' && placed(entry) && !overview.has(entry.id)) },
    { id: 'forces', title: 'Enemy forces', entries: enemies.filter(entry => entry.type === 'Enemy' && !placed(entry) && !overview.has(entry.id)) },
  ].filter(group => group.entries.length)
}

// ---------------------------------------------------------------- 3D Printer

// "30 Chemicals + 1 Binding Catalyst (Rare)" and "30 Metals, 3 Reactive Metals"
// both parse; anything else is unknown.
const RARITIES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Ultra']
const RARITY_TAG = /\s*\((Common|Uncommon|Rare|Epic|Legendary|Ultra)\)$/
export const PRINTER_RESOURCES = ['Synthetics', 'Electronics', 'Chemicals', 'Metals']
const ingredientRarity = new Map((detailOf(byId.get('3d-printer-ingredients'), 'Named') || '').split(' · ')
  .map(pair => pair.split(': ')).filter(([, rarity]) => RARITIES.includes(rarity)))

export function recipeMaterials(entry) {
  const text = detailOf(entry, 'Materials')
  if (!text) return []
  const parts = text.split(/\s*[+,]\s*/).map(part => part.match(/^(\d+)\s+(.+)$/))
  if (parts.some(part => !part)) return []
  return parts.map(([, amount, label]) => {
    const name = label.replace(RARITY_TAG, '').trim()
    return { name, amount: Number(amount), rarity: label.match(RARITY_TAG)?.[1] || ingredientRarity.get(name) || (PRINTER_RESOURCES.includes(name) ? 'Resource' : undefined) }
  })
}
export const printerRecipes = dmzIntel.filter(entry => entry.category === 'crafting' && / recipe$/i.test(entry.name))
export const recipeUnlock = entry => detailOf(entry, 'Unlock')
export const recipeName = entry => entry.name.replace(/ recipe$/i, '')

// Adds up a plan of { id: count } into one list: Resources first, then by rarity.
export function sumMaterials(plan) {
  const totals = new Map()
  for (const [id, count] of Object.entries(plan)) {
    const entry = byId.get(id)
    if (!entry || !(count > 0)) continue
    for (const item of recipeMaterials(entry)) {
      const total = totals.get(item.name) || { ...item, amount: 0 }
      total.amount += item.amount * count
      totals.set(item.name, total)
    }
  }
  const rank = item => item.rarity === 'Resource' ? -1 : item.rarity ? RARITIES.indexOf(item.rarity) : RARITIES.length
  return [...totals.values()].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
}

// The print plan is saved on the device like the trackers. Recipe IDs are
// Intel IDs: never rename one.
export const DMZ_PRINTER_KEY = 'codwiki-dmz-printer-v1'
export const PRINT_MAX = 9
const recipeIds = new Set(printerRecipes.map(entry => entry.id))
export function normalizePrinterPlan(raw) {
  const plan = {}
  for (const [id, value] of Object.entries(raw?.plan || {})) {
    const count = Number(value)
    if (recipeIds.has(id) && Number.isInteger(count) && count > 0) plan[id] = Math.min(count, PRINT_MAX)
  }
  return { plan }
}
export function readPrinterPlan(raw) {
  try {
    const value = JSON.parse(raw)
    return normalizePrinterPlan(value?.version === 1 ? value : {})
  } catch { return normalizePrinterPlan({}) }
}

// ---------------------------------------------------------------- Operators

export const traitTrees = ['Warfighter', 'Scout', 'Survivalist']
export function traitPlace(entry) {
  const tree = traitTrees.find(name => (detailOf(entry, 'Tree') || '').startsWith(name))
  return { tree, kind: detailOf(entry, 'Type') }
}

// ---------------------------------------------------------------- Status

export const issueStates = [
  { id: 'investigating', label: 'Being looked at' },
  { id: 'fixed', label: 'Fixed' },
  { id: 'design', label: 'Working as designed' },
  { id: 'unknown', label: 'No word yet' },
]
export function issueState(entry) {
  const status = detailOf(entry, 'Status') || ''
  if (/^investigating/i.test(status)) return 'investigating'
  if (/fix/i.test(status)) return 'fixed'
  if (/by design/i.test(status)) return 'design'
  return 'unknown'
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
// A date from the details (2026-11-06) or the name (Patch 20 Oct 2026).
function isoOf(entry) {
  const iso = (entry.details || []).map(([, value]) => value.match(/\b(\d{4}-\d{2}-\d{2})\b/)?.[1]).find(Boolean)
  if (iso) return iso
  const [, day, month, year] = entry.name.match(/\b(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4})\b/) || []
  return day ? `${year}-${String(MONTHS.indexOf(month) + 1).padStart(2, '0')}-${day.padStart(2, '0')}` : undefined
}
export function intelTimeline() {
  const dated = dmzIntel.filter(entry => entry.category === 'dates').map(entry => ({ entry, iso: isoOf(entry) }))
  return [...dated.filter(item => item.iso).sort((a, b) => a.iso.localeCompare(b.iso)), ...dated.filter(item => !item.iso)]
}

// ---------------------------------------------------------------- Related entries

// An entry can be found by name in other entries' text. Single words match
// case-sensitively and exactly ("Healer", not "healers"); longer names match
// loosely. Long names never turn up in prose, so they are skipped.
const escapeRe = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
// Names that turn up in almost every text and link nowhere useful.
const TOO_COMMON = new Set(['the-fob', 'north-korean-forces', 'hajin-exclusion-zone', 'compounds'])
const mentionable = dmzIntel.filter(entry => !TOO_COMMON.has(entry.id)).map(entry => {
  const name = entry.name.replace(/\s*\(.*?\)/g, '').replace(/\s+recipe$/i, '').replace(/^Tier \d+:\s*/, '').trim()
  if (name.length < 4 || name.split(' ').length > 4) return null
  const single = !name.includes(' ')
  return { entry, key: name.toLowerCase(), re: single ? new RegExp(`(^|[^A-Za-z0-9])${escapeRe(name)}([^A-Za-z0-9]|$)`) : new RegExp(`(^|[^a-z0-9])${escapeRe(name.toLowerCase())}s?([^a-z0-9]|$)`), single }
}).filter(Boolean).sort((a, b) => b.key.length - a.key.length)

// Entries named in a piece of text, longest names first so "Medium Backpack"
// is not also read as "Backpack".
export function mentionsIn(text, skip = []) {
  const lower = text.toLowerCase()
  const found = []
  for (const item of mentionable) {
    if (skip.includes(item.entry.id) || !lower.includes(item.key)) continue
    if (!item.re.test(item.single ? text : lower)) continue
    if (found.some(other => other.key !== item.key && other.key.includes(item.key))) continue
    found.push(item)
  }
  return found.map(item => item.entry)
}
const proseOf = entry => [entry.summary, entry.note, ...(entry.details || []).map(([, value]) => value)].filter(Boolean).join(' \n ')

let mentionIndex
function mentionedBy(entry) {
  if (!mentionIndex) {
    mentionIndex = new Map()
    for (const other of dmzIntel) for (const named of mentionsIn(proseOf(other), [other.id])) mentionIndex.set(named.id, [...(mentionIndex.get(named.id) || []), other])
  }
  return mentionIndex.get(entry.id) || []
}

export function relatedIntel(entry, limit = 8) {
  const places = entryPlaces(entry)
  const majors = places.filter(place => place.major).map(place => place.id)
  const samePlace = intelPlaces.filter(place => majors.includes(place.id)).flatMap(place => place.intel)
    .filter((other, index, list) => other.id !== entry.id && list.findIndex(item => item.id === other.id) === index)
  const named = mentionsIn(proseOf(entry), [entry.id])
  const namedBy = mentionedBy(entry).filter(other => !named.includes(other))
  const siblings = dmzIntel.filter(other => other.id !== entry.id && other.category === entry.category && other.type === entry.type)
  return { places, samePlace: samePlace.slice(0, limit), named: named.slice(0, limit), namedBy: namedBy.slice(0, limit), siblings: siblings.slice(0, limit), siblingCount: siblings.length }
}

// The entries an Order's own text names, for its card in the Orders tracker.
export function orderIntel(order) {
  const text = [order.summary, order.note, ...order.tasks.map(task => task.text)].filter(Boolean).join(' \n ')
  return mentionsIn(text, [`order-${order.id}`]).filter(entry => !entry.tracked)
}
export const intelOrders = dmzOrders

// ---------------------------------------------------------------- Quick find

// Every word must appear; name hits rank above summary hits.
export function rankIntel(query, { entries = dmzIntel, limit = 20 } = {}) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return { results: [], total: 0 }
  const phrase = words.join(' ')
  const scored = []
  for (const entry of entries) {
    const text = intelSearchText(entry)
    if (!words.every(word => text.includes(word))) continue
    const name = entry.name.toLowerCase()
    const kind = `${entry.type || ''} ${intelCategory(entry.category)?.label || ''}`.toLowerCase()
    let score = name === phrase ? 1000 : name.startsWith(phrase) ? 400 : name.includes(phrase) ? 200 : 0
    for (const word of words) {
      if (new RegExp(`(^|[^a-z0-9])${escapeRe(word)}`).test(name)) score += 60
      else if (name.includes(word)) score += 30
      else if (kind.includes(word)) score += 15
      else if (entry.summary.toLowerCase().includes(word)) score += 8
      else score += 1
    }
    score += { official: 3, confirmed: 2, reported: 0 }[entry.confidence] || 0
    scored.push({ entry, score })
  }
  scored.sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
  return { results: scored.slice(0, limit).map(item => item.entry), total: scored.length }
}
export const intelSuggestions = ['Bale', 'Medkit', 'exfil', 'H6', 'Secure Slots', 'crash', 'Season 1', 'Colossus']

// ---------------------------------------------------------------- Ask first

// The Intel landing asks what you are doing. Answers stay inside Intel: steps
// answers list entries in reading order; the others open a Status section.
// ids must be real Intel entries; tests check them.
export const intelNeeds = [
  {
    id: 'new', label: 'First deploy', ask: 'I am new to DMZ', icon: intelIcons.start, kind: 'steps',
    intro: 'Ten short reads in the order you need them, from the Ready Up screen to getting out with your loot.',
    steps: [
      { title: 'Before you deploy', ids: ['deployment-options', 'recommended-infil-kit', 'free-loadout', 'persistent-stash-and-wipes'] },
      { title: 'In the zone', ids: ['threat-levels', 'start-in-low-threat-areas', 'health-and-the-tourniquet'] },
      { title: 'Getting out', ids: ['exfil-sites', 'extract-early-dont-get-greedy', 'death-and-failed-exfil'] },
    ],
  },
  {
    id: 'exfil', label: 'Getting out', ask: 'How do I extract safely?', icon: intelIcons.exfil, kind: 'steps',
    intro: 'The ways out of Hajin, and what players say about holding an exfil.',
    steps: [
      { title: 'Ways out', ids: ['exfil-sites', 'alternate-exfil-methods', 'flare-exfil', 'fulton-balloon', 'story-mission-exfils'] },
      { title: 'Staying alive', ids: ['exfil-camping', 'plan-around-exfil-campers', 'extract-early-dont-get-greedy', 'successful-exfil'] },
    ],
    more: { to: '/dmz/intel/field-manual#exfil', label: 'Infil and exfil in the Field manual' },
  },
  {
    id: 'loot', label: 'Good loot', ask: 'Where is the good loot?', icon: intelIcons.loot, kind: 'steps',
    intro: 'Spots players report for cash, recipes and Weapon Manuals, from keyless safes to the late-game lockers.',
    steps: [
      { title: 'Money without keys', ids: ['cheonwang-peak-array', 'compound-safes', 'train', 'valuables'] },
      { title: 'Recipes and Weapon Manuals', ids: ['chang-san-air-base', 'weapon-manuals', 'how-crafting-works'] },
      { title: 'Keys worth the trip', ids: ['counting-room-vault-key', 'jin-taes-private-lounge', 'supreme-leader-access-card', 'reactor-drc-locker'] },
      { title: 'Late game', ids: ['haneul-nuclear-reactor', 'irradiated-container', 'missile-silo-bunkers'] },
    ],
  },
  { id: 'broken', label: 'Something broke', ask: 'Is it the game or me?', icon: intelIcons.bug, to: '/dmz/intel/status#issues', toLabel: 'Status' },
  { id: 'next', label: 'What is coming', ask: 'When is Season 1?', icon: intelIcons.clock, to: '/dmz/intel/status#dates', toLabel: 'Status' },
]
export const intelNeed = id => intelNeeds.find(need => need.id === id)
export const needEntries = need => entriesOf((need.steps || []).flatMap(step => step.ids))

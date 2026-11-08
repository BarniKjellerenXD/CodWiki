// What the Hajin Tac-Map shows about each reported site, with no Leaflet in it:
// plain-language spots, the ground a rough spot could be on, grouping by zoom,
// the fan that spreads a group, search, grouped lists and saved preferences.
// DmzTacMap.client.vue draws from these; tests/dmz-map-view.test.mjs checks them.

import { hajinMap, hajinLayers, hajinLayer, hajinPins, hajinPin, hajinReports, hajinRoutes, routeStopLabel, precisionOf, TIERS, NEAR_RADIUS, PLACE_REACH, ALIASES, LEGACY_LAYERS, MAP_SECTIONS, threatLevels } from './dmz-map.mjs'
import { keyOfReport } from './dmz-keys.mjs'
import { dmzIntel } from './dmz-intel.mjs'

const PLACES = ['poi', 'fortress', 'area', 'compound']
const pinById = new Map(hajinPins.map(pin => [pin.id, pin]))
const intelName = new Map(dmzIntel.map(entry => [entry.id, entry.name]))
const placeName = id => pinById.get(id)?.name || ''
const capital = text => text ? `${text[0].toUpperCase()}${text.slice(1)}` : text

// What each service marker is, in a sentence. Buildings take "Inside the".
const SERVICE_KIND = { police: 'police station', clinic: 'clinic', fire: 'fire station', gas: 'gas station', 'marine-gas': 'marine gas station', ammo: 'ammo and armor cache', uav: 'UAV tower', 'lt-tower': 'Lieutenant tower' }
const BUILDINGS = ['police', 'clinic', 'fire', 'gas', 'marine-gas']
const serviceName = pin => `the ${SERVICE_KIND[pin.layer]} near ${placeName(pin.near)}`

// "Inside the police station near Pyonghwa Village", "Somewhere in Cheongun Village".
export function siteLabel(report) {
  const from = report.from && pinById.get(report.from)
  const side = report.side && report.dist === 'same-building' ? `, ${report.side} side` : ''
  // Sites under the map, such as X01's bosses, hang on the way down.
  if (report.below) return `Inside ${report.below}: take the lift ${report.side} of ${from.name}`
  if (report.moves) return from ? `Seen around ${PLACES.includes(from.layer) ? from.name : serviceName(from)}; moves between matches` : `Seen in square ${report.squares[0]}; moves between matches`
  switch (report.precision) {
    case 'exact': return `${BUILDINGS.includes(from.layer) ? 'Inside' : 'At'} ${serviceName(from)}${side}`
    case 'building': return `Somewhere inside ${from.name}${side}`
    case 'near': return `${capital(report.side)} of ${PLACES.includes(from.layer) ? from.name : serviceName(from)}, rough spot`
    case 'place': return `Somewhere in ${from.name}`
    default: return `Somewhere in square ${report.squares[0]}`
  }
}

// "Key card square F5", "Sources disagree: F7 / F6", or the square the marker is drawn in.
export function squareLine(report) {
  const squares = report.squares || []
  if (report.squaresDisagree && squares.length > 1) return `Sources disagree: ${squares.join(' / ')}`
  if (squares.length) return `${report.type === 'key-room' ? 'Key card square' : 'Sources give square'} ${squares.join(', ')}`
  return `Drawn in ${report.square}`
}

// The ground a site could be on, for the map to draw when it is selected:
// a circle in official units and the squares sources give. Pinned sites have none.
export function reportArea(report) {
  if (report.tier === 'pinned') return null
  const squares = report.squares || []
  const from = report.from && pinById.get(report.from)
  if (report.moves) return { circle: from ? { at: from.at, radius: PLACE_REACH[from.layer] || PLACE_REACH.fortress } : null, squares }
  if (report.precision === 'near') return { circle: { at: report.at, radius: NEAR_RADIUS[report.dist] || NEAR_RADIUS.short }, squares }
  if (report.precision === 'place') return { circle: { at: from.at, radius: PLACE_REACH[from.layer] }, squares }
  return { circle: null, squares }
}

export const tierCounts = (reports = hajinReports) => Object.fromEntries(TIERS.map(tier => [tier, reports.filter(report => report.tier === tier).length]))

// Screen pixels per official unit at a Leaflet zoom. In CRS.Simple one art pixel
// is one latlng unit at zoom 0.
export const pxPerUnit = zoom => hajinMap.toArt.scale * 2 ** zoom

const layerOrder = new Map(hajinLayers.map((layer, index) => [layer.id, index]))
const tierOrder = tier => TIERS.indexOf(tier)
const placeAt = new Map()
for (const pin of hajinPins) if (PLACES.includes(pin.layer) && !pin.same) placeAt.set(pin.at.join(','), placeAt.get(pin.at.join(',')) || pin.id)

// Sites that would overlap on screen join one group, but never across major
// locations. A group sits on one member's own spot, never an average: the
// major location's own label first, then any place label, then the spot most
// members share. sites: [{ id, at, top, tier, type, name }].
export function groupSites(sites, ppu, radius) {
  const list = [...sites].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  const parent = list.map((_, index) => index)
  const find = index => { while (parent[index] !== index) { parent[index] = parent[parent[index]]; index = parent[index] } return index }
  const limit = radius / ppu
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j]
      if (a.top !== b.top || Math.abs(a.at[0] - b.at[0]) > limit || Math.abs(a.at[1] - b.at[1]) > limit) continue
      if (Math.hypot(a.at[0] - b.at[0], a.at[1] - b.at[1]) <= limit) parent[find(i)] = find(j)
    }
  }
  const sets = new Map()
  list.forEach((site, index) => {
    const root = find(index)
    if (!sets.has(root)) sets.set(root, [])
    sets.get(root).push(site)
  })
  return [...sets.values()].map(members => {
    const top = members[0].top
    const hubs = new Map()
    for (const site of members) {
      const spot = site.at.join(',')
      if (!hubs.has(spot)) hubs.set(spot, { at: site.at, count: 0, first: site.id })
      hubs.get(spot).count++
    }
    const ownSpot = pinById.get(top)?.at.join(',')
    const hub = hubs.get(ownSpot) || [...hubs.entries()].find(([spot]) => placeAt.has(spot))?.[1]
      || [...hubs.values()].sort((a, b) => b.count - a.count || (a.first < b.first ? -1 : 1))[0]
    const anchor = hub.at
    const anchorPin = ownSpot === anchor.join(',') ? top : placeAt.get(anchor.join(','))
    const sorted = [...members].sort((a, b) => tierOrder(a.tier) - tierOrder(b.tier) || (layerOrder.get(a.type) ?? 99) - (layerOrder.get(b.type) ?? 99) || a.name.localeCompare(b.name))
    return { key: `${top}@${anchor.join(',')}`, top, anchor, ...(anchorPin ? { anchorPin } : {}), members: sorted.map(site => site.id) }
  })
}

// Pixel offsets that spread a group around its spot: up to eight on an inner
// ring and eight on an outer one, clockwise from 12 o'clock over at most 300°,
// leaving a 60° gap on the side where the place's label sits (`gap`, degrees
// clockwise from 12 o'clock). Past 16 members, the last slot says how many more.
export const FAN_MAX = 16
export function fanOffsets(n, { touch = false, gap = 180 } = {}) {
  const slots = Math.min(n, FAN_MAX)
  const inner = Math.min(slots, 8)
  const radii = touch ? [46, 88] : [38, 74]
  const out = []
  for (const [count, r, ring] of [[inner, radii[0], 1], [slots - inner, radii[1], 2]]) {
    if (!count) continue
    const step = count === 1 ? 0 : Math.min(300 / (count - 1), 72)
    const start = gap + 180 - step * (count - 1) / 2
    for (let i = 0; i < count; i++) {
      const angle = (start + i * step) * Math.PI / 180
      out.push({ dx: Math.round(Math.sin(angle) * r), dy: Math.round(-Math.cos(angle) * r), ring })
    }
  }
  if (n > FAN_MAX) out[out.length - 1].more = n - FAN_MAX + 1
  return out
}

// Search. A grid square lists what sources put in it and the places in it;
// other text must match every word, in any order, and ranks by where it matched.
export const norm = text => String(text || '').toLocaleLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, '')
export const SQUARE_QUERY = /^([a-j])\s*-?\s*([1-9])$/i
export function squareOfQuery(query) {
  const match = String(query || '').trim().match(SQUARE_QUERY)
  return match ? `${match[1].toUpperCase()}${match[2]}` : ''
}
const aliasesOf = id => ALIASES[placeName(id)] || []
const reportEntries = hajinReports.map(report => {
  const key = keyOfReport(report.id)
  return {
    kind: 'report', id: report.id, item: report, name: norm(report.name), key: key?.id,
    named: norm([key?.name, report.intel && intelName.get(report.intel)].filter(Boolean).join(' ')),
    about: norm([hajinLayer(report.type)?.one, hajinLayer(report.type)?.label, placeName(report.from), placeName(report.anchor), placeName(report.top), ...aliasesOf(report.anchor), ...aliasesOf(report.top), ...(report.squares || []), report.square].join(' ')),
    where: norm([report.where, report.note].join(' ')),
  }
})
const pinEntries = hajinPins.filter(pin => !pin.same).map(pin => ({
  kind: 'pin', id: pin.id, item: pin, name: norm(PLACES.includes(pin.layer) ? pin.name : `${hajinLayer(pin.layer).one} ${placeName(pin.near)}`), named: '',
  about: norm([hajinLayer(pin.layer).one, hajinLayer(pin.layer).label, pin.square, ...(pin.parts || []).map(([part]) => part), placeName(pin.near), placeName(pin.parent), ...aliasesOf(pin.id)].join(' ')), where: norm(pin.desc),
}))
const routeEntries = hajinRoutes.map(route => ({
  kind: 'route', id: route.id, item: route, name: norm(route.name), named: '',
  about: norm(['route', ...route.stops.map(stop => `${routeStopLabel(stop)} ${placeName(stop.place)}`), ...route.squares].join(' ')), where: norm(route.summary),
}))
const sectionRank = id => MAP_SECTIONS.findIndex(section => section.layers.includes(id))
const entryLayer = entry => entry.kind === 'report' ? entry.item.type : entry.kind === 'pin' ? entry.item.layer : 'route'
function rankOf(entry, text, words) {
  const all = `${entry.name} ${entry.named} ${entry.about} ${entry.where}`
  if (!words.every(word => all.includes(word))) return -1
  if (entry.name.startsWith(text)) return 0
  const starts = entry.name.split(/[^a-z0-9]+/).filter(Boolean)
  if (words.every(word => starts.some(start => start.startsWith(word)))) return 1
  if (words.every(word => `${entry.name} ${entry.named}`.includes(word))) return 2
  if (words.every(word => `${entry.name} ${entry.named} ${entry.about}`.includes(word))) return 3
  return 4
}
// held: { [keyId]: 'held' | 'used' }, from the key tracker.
export function searchMap(query, { held = {} } = {}) {
  const square = squareOfQuery(query)
  if (square) {
    const sourced = hajinReports.filter(report => report.squares?.includes(square) || (report.tier !== 'area' && report.square === square))
    const placeIn = hajinReports.filter(report => !report.squares?.length && !sourced.includes(report) && pinById.get(report.anchor)?.square === square)
    return { square, sourced, placeIn, pins: hajinPins.filter(pin => !pin.same && pin.square === square), routes: hajinRoutes.filter(route => route.squares.includes(square)) }
  }
  const text = norm(query).trim()
  if (!text) return { square: '', items: [] }
  const words = text.split(/\s+/)
  const items = []
  for (const entry of [...reportEntries, ...pinEntries, ...routeEntries]) {
    const rank = rankOf(entry, text, words)
    if (rank >= 0) items.push({ kind: entry.kind, id: entry.id, item: entry.item, rank, held: !!entry.key && held[entry.key] === 'held' })
  }
  items.sort((a, b) => a.rank - b.rank || Number(b.held) - Number(a.held) || sectionRank(entryLayer(a)) - sectionRank(entryLayer(b)) || norm(a.item.name).localeCompare(norm(b.item.name)))
  return { square: '', items }
}

// Lists group sites by the major location they belong to, in map order, or by
// square in reading order (A1, B1 … J1, A2 …). items: reports or pins.
const majors = hajinPins.filter(pin => pin.layer === 'poi').map(pin => pin.id)
const topRank = id => majors.includes(id) ? majors.indexOf(id) : majors.length
export function itemTop(item) {
  if (item.top) return item.top
  const pin = item.near ? pinById.get(item.near) : item
  const parent = pin?.parent && pinById.get(pin.parent)
  return parent && parent.id !== pin.id ? parent.id : pin?.id
}
export function itemSquare(item) { return item.squares?.[0] || (item.anchor ? pinById.get(item.anchor)?.square : item.square) || item.square }
const squareRank = square => { const [c, r] = [hajinMap.grid.columns.indexOf(square[0]), Number(square.slice(1))]; return r * 100 + c }
export function listGroups(items, by = 'place') {
  const groups = new Map()
  for (const item of items) {
    const id = by === 'square' ? itemSquare(item) : itemTop(item)
    if (!groups.has(id)) groups.set(id, [])
    groups.get(id).push(item)
  }
  return [...groups].map(([id, members]) => by === 'square'
    ? { id, square: id, name: `Square ${id}`, items: members }
    : { id, pin: pinById.get(id) ? id : undefined, name: placeName(id) || (id?.startsWith('square:') ? `Square ${id.slice(7)}` : 'Elsewhere'), square: pinById.get(id)?.square || id?.slice(7), threat: pinById.get(id)?.threat, items: members })
    .sort((a, b) => by === 'square' ? squareRank(a.id) - squareRank(b.id) : topRank(a.id) - topRank(b.id) || a.name.localeCompare(b.name))
}

// Saved map preferences, under codwiki-dmz-tacmap-v1. `known` lists the layers
// that existed at the save, so layers added since take their default instead
// of being switched off; a save without it knew only LEGACY_LAYERS.
export const TACMAP_PREFS = 'codwiki-dmz-tacmap-v1'
export function normalizePrefs(raw) {
  const value = raw && typeof raw === 'object' ? raw : {}
  const ids = hajinLayers.map(layer => layer.id)
  const saved = Array.isArray(value.layers) ? value.layers : null
  const known = Array.isArray(value.known) ? value.known : LEGACY_LAYERS
  return {
    layers: ids.filter(id => saved && known.includes(id) ? saved.includes(id) : hajinLayer(id).on),
    levels: Array.isArray(value.levels) ? threatLevels.filter(level => value.levels.includes(level)) : [...threatLevels],
    grid: typeof value.grid === 'boolean' ? value.grid : true,
    wheel: typeof value.wheel === 'boolean' ? value.wheel : true,
    collapsed: Array.isArray(value.collapsed) ? MAP_SECTIONS.map(section => section.id).filter(id => value.collapsed.includes(id)) : MAP_SECTIONS.filter(section => !section.open).map(section => section.id),
    hideUsed: value.hideUsed === true,
  }
}
export function prefsToSave(prefs) {
  const known = hajinLayers.map(layer => layer.id)
  return { ...normalizePrefs({ ...prefs, known }), known }
}
export function readPrefs(text) {
  try { return normalizePrefs(JSON.parse(text)) } catch { return normalizePrefs(null) }
}

export { precisionOf }

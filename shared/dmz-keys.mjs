// DMZ key tracker: every key and locked room in the Intel database, merged with
// the key rooms reported on the Hajin Tac-Map. Players mark keys held or used;
// marks stay on the device, apart from Zombies progress and the Orders tracker.

import { dmzIntel, DMZ_INTEL_CHECKED } from './dmz-intel.mjs'
import { hajinPins, hajinPin, hajinReports } from './dmz-map.mjs'

export const DMZ_KEYS_CHECKED = DMZ_INTEL_CHECKED

// Intel `keys` entries about keys and doors in general, or doors that no key
// is known to open. The tracker links them instead of listing them as keys.
export const KEY_GUIDE_IDS = [
  'keys', 'lieutenant-keys-and-loot-rooms', 'keys-keypad-doors', 'poi-power-and-security-puzzles',
  'alternate-entrances-and-breaching', 'heavenly-luck-casino-vault', 'casino-penthouse-cartel-hideout',
]

const RARITIES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Ultra']
const majors = hajinPins.filter(pin => pin.layer === 'poi').map(pin => pin.id)

// The major location a place belongs to, or the place itself when it stands alone.
function topPlace(pin) {
  const parent = pin.parent && hajinPin(pin.parent)
  return parent && parent.id !== pin.id ? parent : pin
}

const bare = name => name.replace(/\s*\(.*\)$/, '')
const sameName = (a, b) => [a, b].map(name => bare(name).toLowerCase().replace(/^the\s+|\s+key$/g, '').replace(/[^a-z0-9]/g, '')).reduce((x, y) => x === y)

function roomOf(report) {
  const pin = report.anchor ? hajinPin(report.anchor) : undefined
  return {
    report: report.id, name: bare(report.name), where: report.where, confidence: report.confidence,
    // A room with no square of its own falls back to its place's square.
    squares: report.squares || (pin ? [pin.square] : []), placeSquare: !report.squares && !!pin,
    ...(pin ? { place: pin.id, placeName: pin.name, area: topPlace(pin).id, areaName: topPlace(pin).name } : {}),
    ...(report.videos?.length ? { videos: report.videos } : {}),
  }
}

const keyRooms = hajinReports.filter(report => report.type === 'key-room')
const keyEntries = dmzIntel.filter(entry => entry.category === 'keys')
const rarityOf = entry => {
  const word = (entry.details || []).find(([label]) => label === 'Rarity')?.[1].split(/[\s(]/)[0]
  return RARITIES.includes(word) ? word : undefined
}

// Key IDs are saved on players' devices: never rename one.
const fromIntel = keyEntries.filter(entry => !KEY_GUIDE_IDS.includes(entry.id)).map(entry => {
  const rooms = keyRooms.filter(report => report.intel === entry.id).map(roomOf)
  // A key with no reported room may still name a major location in Intel.
  const place = rooms.length ? undefined : hajinPins.find(pin => pin.layer === 'poi' && pin.intel?.includes(entry.id))
  return {
    id: entry.id, name: entry.name, type: entry.type, intel: entry.id, confidence: entry.confidence, rarity: rarityOf(entry), summary: entry.summary,
    // A room is named only where its name differs from the key's.
    rooms: rooms.map(room => sameName(room.name, entry.name) ? { ...room, name: undefined } : room),
    ...(place ? { place: place.id, placeName: place.name } : {}),
  }
})
// Reported rooms whose Intel card is not a key (a Lieutenant, say) get an entry of their own.
const fromReports = keyRooms.filter(report => !fromIntel.some(key => key.intel === report.intel)).map(report => ({
  id: report.id, name: bare(report.name), type: 'Locked room', intel: report.intel, confidence: report.confidence, rooms: [{ ...roomOf(report), name: undefined }],
}))

const areaOf = key => key.rooms.find(room => room.area)?.area || key.place
const areaRank = id => id ? (majors.includes(id) ? majors.indexOf(id) : majors.length) : majors.length + 1
export const dmzKeys = [...fromIntel, ...fromReports]
  .map(key => ({ ...key, area: areaOf(key) }))
  .sort((a, b) => areaRank(a.area) - areaRank(b.area) || (a.area || '').localeCompare(b.area || '') || a.name.localeCompare(b.name))

export const dmzKeyGuides = KEY_GUIDE_IDS.map(id => keyEntries.find(entry => entry.id === id)).filter(Boolean)

// Places a key's rooms sit in, major locations first; the place filter offers these.
export const dmzKeyPlaces = [...new Set(dmzKeys.flatMap(key => key.rooms.length ? key.rooms.map(room => room.area) : [key.place]).filter(Boolean))]
  .sort((a, b) => areaRank(a) - areaRank(b) || a.localeCompare(b))
  .map(id => ({ id, name: hajinPin(id).name }))

export const keyPlaceIds = key => key.rooms.length ? key.rooms.map(room => room.area).filter(Boolean) : key.place ? [key.place] : []
export const keySquares = key => [...new Set(key.rooms.flatMap(room => room.squares))]

// What published openings have shown inside each key's rooms, as a haul tier: an editorial
// call, never a rank or a drop rate. openings counts the published openings (a write-up or
// video that opens the room and shows what was inside). sources are the pages behind them,
// or, where no opening is published, the pages that show the room.
export const HAULS = [
  { id: 'top', label: 'Top haul' },
  { id: 'steady', label: 'Steady haul' },
  { id: 'starter', label: 'Starter haul' },
]
export const KEY_HAULS = {
  'counting-room-vault-key': { haul: 'top', openings: 6, sources: ['gamerant-counting-room-vault-key', 'mw4meta-best-loot-spots', 'dmztracker-valuables', 'youtube-m-wmh49eqk0', 'youtube-10vlyimbvuu', 'youtube-fqrecqctutc'] },
  // Both DMZ Codex pages write up the run in the video, so this is one opening.
  'jin-taes-private-lounge': { haul: 'top', openings: 1, sources: ['dmzcodex-jin-tae-private-lounge', 'dmzcodex-items-jin-taes-private', 'youtube-t1j2laas3vs'] },
  'supreme-leader-access-card': { haul: 'top', openings: 3, sources: ['gamerant-supreme-leader-bunker-location', 'mw4meta-best-loot-spots', 'reddit-1xeahkp'] },
  'reactor-drc-locker': { haul: 'top', openings: 3, sources: ['dmzcodex-reactor-drc-locker-guide', 'mw4meta-best-loot-spots', 'reddit-1xdlss1'] },
  'rozes-high-rise-armory': { haul: 'top', openings: 1, sources: ['gamerant-rozes-highrise-armory-location'] },
  'the-chemists-secure-armory': { haul: 'top', openings: 1, sources: ['youtube-fqq_niskd14'] },
  'vault-armory': { haul: 'top', openings: 1, sources: ['youtube-86olmsrtjo8'] },
  'shopping-drc-locker': { haul: 'top', openings: 1, sources: ['dmzcodex-shopping-drc-locker-guide', 'dmzcodex-drc-lockers'] },
  'air-base-drc-weapons-locker': { haul: 'top', openings: 1, sources: ['dmzcodex-air-base-drc-locker'] },
  // These two are one run each, shown in the video and written up by DMZ Codex.
  'train-depot-storageroom': { haul: 'steady', openings: 1, sources: ['dmzcodex-rail-depot-storage-key', 'youtube-nmwm5jjkt7w'] },
  'hazard-storehouse': { haul: 'steady', openings: 1, sources: ['dmzcodex-hazard-storehouse-key', 'youtube-x50zjbnjfkw'] },
  'hoesik-supply-room-key': { haul: 'steady', openings: 1, sources: ['dmzcodex-items-hoesik-supply-room'] },
  'black-market-weapons-locker-key': { haul: 'steady', openings: 0, sources: ['youtube-el5jwsztuy0'] },
  'police-station-armory': { haul: 'steady', openings: 1, sources: ['mw4meta-best-loot-spots'] },
  'gun-store-weapons-locker-key': { haul: 'steady', openings: 0, sources: ['youtube-6eu9cjjwxgg'] },
  'militia-arms-depot-key': { haul: 'steady', openings: 0, sources: ['dexerto-wikis-keys-militia-arms'] },
  're-education-center-annex': { haul: 'steady', openings: 1, sources: ['dmzcodex-re-education-center-annex', 'dmzcodex-dmz-keys-loot-rooms-guide'] },
  'mirae-electrical-room': { haul: 'starter', openings: 1, sources: ['dmzcodex-mirae-electrical-room'] },
  'coin-mining-den': { haul: 'starter', openings: 0, sources: ['youtube-lqcunvlvc24'] },
  'mechanics-shack': { haul: 'starter', openings: 1, sources: ['youtube-qyeywhox8ya'] },
  'old-barber-shop': { haul: 'starter', openings: 0, sources: ['youtube-ue93msx6tak', 'youtube-afupfbizixe'] },
  'fire-station-storage': { haul: 'starter', openings: 0, sources: ['dmzcodex-fire-station-storage'] },
}

export const keyHaul = key => KEY_HAULS[key.id]
const haulRank = key => key.id in KEY_HAULS ? HAULS.findIndex(item => item.id === KEY_HAULS[key.id].haul) : HAULS.length
export const openingsLabel = count => count ? `${count} opening${count > 1 ? 's' : ''}` : 'No opening published yet'
// 'Top haul · 3 openings'; a key with no haul call has no label.
export function haulLabel(key) {
  const haul = KEY_HAULS[key.id]
  return haul ? `${HAULS.find(item => item.id === haul.haul).label} · ${openingsLabel(haul.openings)}` : undefined
}
// Top hauls first, then steady and starter, then keys with no haul call; more openings first
// within a tier. Ties keep their order.
export const sortKeysByHaul = keys => [...keys].sort((a, b) => haulRank(a) - haulRank(b) || (KEY_HAULS[b.id]?.openings || 0) - (KEY_HAULS[a.id]?.openings || 0))

// The videos on a key's room reports, each once, for its Watch it done fold.
export function keyVideos(key) {
  const seen = new Set()
  return key.rooms.flatMap(room => room.videos || []).filter(video => {
    const id = `${video.id}@${video.at || ''}`
    return !seen.has(id) && seen.add(id)
  })
}

export function keySearchText(key) {
  return [key.name, key.type, key.rarity, key.placeName, ...key.rooms.flatMap(room => [room.name, room.where, room.placeName, room.areaName, ...room.squares])]
    .filter(Boolean).join(' ').toLowerCase()
}

// A grid square such as "F5" lists every key with a room in it; other text must
// match every word. mark: all | held | used | none. place: a place id, 'all', or
// 'none' for keys with no place on the map yet.
export function filterKeys(keys, { query = '', mark = 'all', place = 'all', confidence = null, marks = {} } = {}) {
  const text = query.trim().toLowerCase()
  const square = text.match(/^([a-j])\s*-?\s*([1-9])$/)
  const words = text.split(/\s+/).filter(Boolean)
  return keys.filter(key =>
    (mark === 'all' || (mark === 'none' ? !marks[key.id] : marks[key.id] === mark))
    && (place === 'all' || (place === 'none' ? !keyPlaceIds(key).length : keyPlaceIds(key).includes(place)))
    && (!confidence || confidence.includes(key.confidence))
    && (square ? keySquares(key).includes(`${square[1].toUpperCase()}${square[2]}`) : words.every(word => keySearchText(key).includes(word))))
}

export const DMZ_KEYS_KEY = 'codwiki-dmz-keys-v1'
export const KEY_MARKS = ['held', 'used']

// Keeps only known key IDs marked held or used.
export function normalizeDmzKeys(raw) {
  const marks = {}
  for (const key of dmzKeys) {
    const value = raw?.marks?.[key.id]
    if (KEY_MARKS.includes(value)) marks[key.id] = value
  }
  return { marks }
}

export function readDmzKeys(raw) {
  try {
    const value = JSON.parse(raw)
    return normalizeDmzKeys(value?.version === 1 ? value : {})
  } catch { return normalizeDmzKeys({}) }
}

export function keyTally(marks) {
  const values = Object.values(marks)
  return { held: values.filter(value => value === 'held').length, used: values.filter(value => value === 'used').length, total: dmzKeys.length }
}

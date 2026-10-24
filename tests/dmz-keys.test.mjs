import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { dmzKeys, dmzKeyGuides, dmzKeyPlaces, KEY_GUIDE_IDS, DMZ_KEYS_KEY, HAULS, KEY_HAULS, filterKeys, haulLabel, keyPlaceIds, keySquares, keyTally, keyVideos, normalizeDmzKeys, readDmzKeys, sortKeysByHaul } from '../shared/dmz-keys.mjs'
import { dmzIntel } from '../shared/dmz-intel.mjs'
import { hajinPin, hajinReports } from '../shared/dmz-map.mjs'
import { anySource, NO_PERCENT } from '../shared/dmz-sightings.mjs'
import { dmzStations, dmzPages, DMZ_ORDERS_KEY } from '../shared/dmz.mjs'

const search = JSON.parse(fs.readFileSync(new URL('../app/data/searchIndex.json', import.meta.url)))
const intel = new Map(dmzIntel.map(entry => [entry.id, entry]))
const keyRooms = hajinReports.filter(report => report.type === 'key-room')
const stash = fs.readFileSync(new URL('../app/pages/dmz/stash.vue', import.meta.url), 'utf8')

// Every key ID so far. Marks are saved on players' devices under these IDs.
const SAVED_KEY_IDS = [
  'air-base-access-card-multi-use', 'air-base-drc-weapons-locker', 'airbase-armory-keycard', 'bank-branch-vault-access', 'black-keycard',
  'black-market-weapons-locker-key', 'citadel-south-wing-supply-room', 'coin-mining-den', 'commandant-office', 'counting-room-vault-key',
  'executive-arms-auction', 'field-depot', 'fire-station-storage', 'gas-station-electrical-room', 'gorani-loot-room-rice-mill-rooftop',
  'goranis-scout-overlook-key-room', 'gun-store-weapons-locker-key', 'haksan-school-armory', 'hanex-guard-station', 'hazard-storehouse',
  'hoesik-supply-room-key', 'imjin-mill-foremans-office', 'iskras-control-room', 'jang-uis-converted-power-room', 'jin-taes-private-lounge',
  'knrp-reactor-01', 'lucera-suite-703-bedroom-key', 'mechanics-shack', 'militia-arms-depot-key', 'mill-explosives-lab',
  'mirae-electrical-room', 'nenshin-it-room', 'nurigo-mall-sealed-room', 'old-barber-shop', 'police-station-armory',
  'police-station-key', 'police-weapon-depository', 'prison-encampment-storage', 're-education-center-annex', 'reactor-02-control-room',
  'reactor-drc-locker', 'rice-mill-bunker', 'rozes-high-rise-armory', 'shop-records-room', 'shopping-drc-locker',
  'silo-control-room', 'supreme-leader-access-card', 'the-chemists-secure-armory', 'the-doctors-command-office', 'train-depot-storageroom',
  'underground-propaganda-store-room', 'vault-armory', 'weapons-mod-workshop',
]

test('every Intel key is tracked or linked as a guide, and every key links to a real Intel entry', () => {
  const keys = dmzIntel.filter(entry => entry.category === 'keys')
  for (const entry of keys) {
    const tracked = dmzKeys.some(key => key.intel === entry.id)
    assert.notEqual(tracked, KEY_GUIDE_IDS.includes(entry.id), entry.id)
  }
  assert.equal(dmzKeyGuides.length, KEY_GUIDE_IDS.length)
  for (const key of dmzKeys) {
    assert.ok(intel.has(key.intel), `${key.id} → ${key.intel}`)
    assert.ok(['official', 'confirmed', 'reported'].includes(key.confidence), key.id)
    assert.ok(key.name && key.type, key.id)
  }
  assert.equal(new Set(dmzKeys.map(key => key.id)).size, dmzKeys.length)
})

test('every reported key room appears once, on a real report and place', () => {
  const rooms = dmzKeys.flatMap(key => key.rooms)
  assert.deepEqual(rooms.map(room => room.report).sort(), keyRooms.map(report => report.id).sort())
  for (const room of rooms) {
    const report = keyRooms.find(item => item.id === room.report)
    assert.equal(room.place, report.anchor || undefined, room.report)
    if (room.place) assert.ok(hajinPin(room.place) && hajinPin(room.area), room.report)
    for (const square of room.squares) assert.match(square, /^[A-J][1-9]$/, room.report)
    assert.equal(room.placeSquare, !report.squares && !!report.anchor, room.report)
  }
  // A room whose report matches a key's Intel card sits under that key.
  for (const report of keyRooms) {
    const key = dmzKeys.find(item => item.rooms.some(room => room.report === report.id))
    if (report.intel && intel.get(report.intel).category === 'keys') assert.equal(key.intel, report.intel, report.id)
  }
  for (const place of dmzKeyPlaces) assert.ok(hajinPin(place.id), place.id)
})

test('the Stash station opens the key tracker with counts that match the data', () => {
  const station = dmzStations.find(item => item.id === 'stash')
  assert.equal(station.locked, undefined)
  assert.equal(station.lockNote, undefined)
  assert.equal(station.route, '/dmz/stash')
  assert.ok(dmzPages.some(page => page.path === station.route))
  assert.ok(fs.existsSync(new URL('../app/pages/dmz/stash.vue', import.meta.url)))
  assert.ok(station.facts.some(fact => fact.includes(`${dmzKeys.length} keys`) && fact.includes(`${keyRooms.length} reported rooms`)))
  assert.ok(search.some(entry => entry.route === '/dmz/stash' && entry.kind === 'DMZ'))
})

test('saved marks keep known keys marked held or used and survive bad data', () => {
  const [first, second, third] = dmzKeys
  const state = normalizeDmzKeys({ marks: { [first.id]: 'held', [second.id]: 'used', [third.id]: 'lost', ghost: 'held' } })
  assert.deepEqual(state, { marks: { [first.id]: 'held', [second.id]: 'used' } })
  assert.deepEqual(normalizeDmzKeys(null), { marks: {} })
  assert.deepEqual(readDmzKeys('not json'), { marks: {} })
  assert.deepEqual(readDmzKeys(null), { marks: {} })
  assert.deepEqual(readDmzKeys(JSON.stringify({ version: 2, marks: { [first.id]: 'held' } })), { marks: {} })
  assert.deepEqual(readDmzKeys(JSON.stringify({ version: 1, marks: { [first.id]: 'held' } })), { marks: { [first.id]: 'held' } })
  assert.deepEqual(keyTally(state.marks), { held: 1, used: 1, total: dmzKeys.length })
})

test('key marks use their own storage key, apart from Orders and Zombies progress', () => {
  assert.equal(DMZ_KEYS_KEY, 'codwiki-dmz-keys-v1')
  assert.notEqual(DMZ_KEYS_KEY, DMZ_ORDERS_KEY)
  const composable = fs.readFileSync(new URL('../app/composables/useDmzKeys.ts', import.meta.url), 'utf8')
  assert.match(composable, /localStorage\.getItem\(DMZ_KEYS_KEY\)/)
  assert.match(composable, /localStorage\.setItem\(DMZ_KEYS_KEY/)
  assert.equal(composable.match(/try \{/g).length, 2)
  assert.doesNotMatch(composable, /DMZ_ORDERS_KEY|useProgress/)
})

test('search, mark, place and confidence filters narrow the list', () => {
  const names = keys => keys.map(key => key.name)
  // A square lists every key with a room in it.
  const f5 = filterKeys(dmzKeys, { query: 'f5' })
  assert.ok(f5.length && f5.every(key => keySquares(key).includes('F5')))
  assert.ok(names(f5).includes('Mirae Electrical Room'))
  assert.deepEqual(names(filterKeys(dmzKeys, { query: 'mechanic shack' })), ["Mechanic's Shack"])
  // A key with rooms in two places shows under either.
  const gunStore = dmzKeys.find(key => key.id === 'gun-store-weapons-locker-key')
  assert.ok(filterKeys(dmzKeys, { place: 'songdo-wharf' }).includes(gunStore))
  assert.ok(filterKeys(dmzKeys, { place: 'cheongun-village' }).includes(gunStore))
  assert.ok(filterKeys(dmzKeys, { place: 'none' }).every(key => !keyPlaceIds(key).length))
  const marks = { 'mechanics-shack': 'held', 'vault-armory': 'used' }
  assert.deepEqual(names(filterKeys(dmzKeys, { mark: 'held', marks })), ["Mechanic's Shack"])
  assert.deepEqual(names(filterKeys(dmzKeys, { mark: 'used', marks })), ['Vault Armory'])
  assert.equal(filterKeys(dmzKeys, { mark: 'none', marks }).length, dmzKeys.length - 2)
  assert.ok(filterKeys(dmzKeys, { confidence: ['reported'] }).every(key => key.confidence === 'reported'))
  assert.equal(filterKeys(dmzKeys, { confidence: [] }).length, 0)
})

test('key IDs saved on devices are never renamed or dropped', () => {
  const ids = new Set(dmzKeys.map(key => key.id))
  for (const id of SAVED_KEY_IDS) assert.ok(ids.has(id), id)
})

test('haul tiers name real keys, with whole opening counts and real sources', () => {
  const ids = new Set(dmzKeys.map(key => key.id))
  assert.ok(Object.keys(KEY_HAULS).length)
  for (const [id, haul] of Object.entries(KEY_HAULS)) {
    assert.ok(ids.has(id), id)
    assert.ok(HAULS.some(item => item.id === haul.haul), `${id}: ${haul.haul}`)
    assert.ok(Number.isInteger(haul.openings) && haul.openings >= 0, `${id}: ${haul.openings}`)
    // Several pages can write up one opening, never the other way round.
    assert.ok(haul.sources.length && haul.openings <= haul.sources.length, id)
    assert.equal(new Set(haul.sources).size, haul.sources.length, id)
    for (const source of haul.sources) assert.ok(anySource(source), `${id} → ${source}`)
  }
})

test('keys sort by haul tier, then openings, and the chips never rank', () => {
  const tier = key => key.id in KEY_HAULS ? HAULS.findIndex(item => item.id === KEY_HAULS[key.id].haul) : HAULS.length
  const openings = key => KEY_HAULS[key.id]?.openings || 0
  const sorted = sortKeysByHaul(dmzKeys)
  assert.equal(sorted.length, dmzKeys.length)
  for (let i = 1; i < sorted.length; i++) {
    const [a, b] = [sorted[i - 1], sorted[i]]
    assert.ok(tier(a) < tier(b) || (tier(a) === tier(b) && openings(a) >= openings(b)), `${a.id} before ${b.id}`)
  }
  // Keys with no haul call keep their place order.
  assert.deepEqual(sorted.filter(key => !(key.id in KEY_HAULS)), dmzKeys.filter(key => !(key.id in KEY_HAULS)))
  const label = id => haulLabel(dmzKeys.find(key => key.id === id))
  assert.equal(label('reactor-drc-locker'), 'Top haul · 3 openings')
  assert.equal(label('train-depot-storageroom'), 'Steady haul · 1 opening')
  assert.equal(label('gun-store-weapons-locker-key'), 'Steady haul · No opening published yet')
  assert.equal(label('iskras-control-room'), undefined)
  for (const key of dmzKeys) {
    const text = haulLabel(key)
    if (!text) continue
    assert.doesNotMatch(text, /#\s*\d|\brank|\bbest\b|reported loot/i, key.id)
    assert.doesNotMatch(text, NO_PERCENT, key.id)
  }
})

test('the Watch it done fold lists each room video once, and every video resolves', () => {
  const refId = video => `${video.id}@${video.at || ''}`
  assert.ok(dmzKeys.some(key => keyVideos(key).length), 'some key has room videos')
  for (const key of dmzKeys) {
    const videos = keyVideos(key)
    const fromReports = key.rooms.flatMap(room => hajinReports.find(report => report.id === room.report).videos || [])
    assert.deepEqual(new Set(videos.map(refId)), new Set(fromReports.map(refId)), key.id)
    assert.equal(new Set(videos.map(refId)).size, videos.length, key.id)
    for (const video of videos) {
      assert.equal(anySource(video.id)?.type, 'video', `${key.id} → ${video.id}`)
      assert.ok(video.why, `${key.id} → ${video.id}`)
    }
  }
})

test('the Stash page orders by what openings have shown, with no numbered ranks or page-top links', () => {
  const template = stash.slice(stash.indexOf('<template>'), stash.lastIndexOf('</template>'))
  assert.match(template, /Ordered by what openings have shown/)
  assert.match(template, /<DmzVideoGuides\b[^>]*title="Watch it done"[^>]*variant="fold"/)
  assert.match(stash, /sortKeysByHaul\(group\.keys\)/)
  assert.doesNotMatch(template, /#n\b|#\{\{|by reported loot|\bbest\b/i)
  assert.doesNotMatch(template, NO_PERCENT)
  assert.doesNotMatch(stash, /\b(?:to|href)="\/dmz/)
  // Map links come from placeLink, not a hand-built address.
  assert.doesNotMatch(stash, /[`'"]\/dmz\/hajin/)
})

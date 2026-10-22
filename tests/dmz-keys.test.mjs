import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { dmzKeys, dmzKeyGuides, dmzKeyPlaces, KEY_GUIDE_IDS, DMZ_KEYS_KEY, filterKeys, keyPlaceIds, keySquares, keyTally, normalizeDmzKeys, readDmzKeys } from '../shared/dmz-keys.mjs'
import { dmzIntel } from '../shared/dmz-intel.mjs'
import { hajinPin, hajinReports } from '../shared/dmz-map.mjs'
import { dmzStations, dmzPages, DMZ_ORDERS_KEY } from '../shared/dmz.mjs'

const search = JSON.parse(fs.readFileSync(new URL('../app/data/searchIndex.json', import.meta.url)))
const intel = new Map(dmzIntel.map(entry => [entry.id, entry]))
const keyRooms = hajinReports.filter(report => report.type === 'key-room')

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

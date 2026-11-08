import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { hajinLayers, hajinPin, hajinPins, hajinReports, hajinRoutes, hajinThreatSeeds, hajinMap, MAP_SECTIONS, QUICK_FINDS, LEGACY_LAYERS, PLACE_REACH, REPORT_MOVED, resolvePinId, TIERS, squareOf } from '../shared/dmz-map.mjs'
import { siteLabel, squareLine, reportArea, tierCounts, pxPerUnit, groupSites, fanOffsets, FAN_MAX, searchMap, listGroups, normalizePrefs, prefsToSave, readPrefs } from '../shared/dmz-map-view.mjs'
import { dmzKeys, keyOfReport } from '../shared/dmz-keys.mjs'

const PLACES = new Set(['poi', 'fortress', 'area', 'compound'])
const ids = JSON.parse(fs.readFileSync(new URL('./fixtures/hajin-ids.json', import.meta.url)))

test('every reported site has a tier its precision allows', () => {
  for (const report of hajinReports) {
    assert.ok(TIERS.includes(report.tier), report.id)
    const expected = report.moves ? 'approx' : { exact: 'pinned', building: 'pinned', near: 'approx', place: 'area', square: 'area' }[report.precision]
    assert.equal(report.tier, expected, report.id)
    assert.ok(report.top && (report.top.startsWith('square:') || PLACES.has(hajinPin(report.top)?.layer)), `${report.id} top ${report.top}`)
    // Something that roams has to say so.
    if (/\broam/i.test(`${report.where} ${report.note || ''}`) && report.type === 'boss') assert.ok(report.moves, `${report.id} roams but has no moves flag`)
  }
  const counts = tierCounts()
  assert.equal(Object.values(counts).reduce((sum, count) => sum + count, 0), hajinReports.length)
})

test('each site says in words where it is, as sure as its tier', () => {
  for (const report of hajinReports) {
    const label = siteLabel(report)
    const from = report.from && hajinPin(report.from)
    if (report.below) assert.match(label, new RegExp(`^Inside ${report.below}: take the lift `), report.id)
    else if (report.moves) assert.match(label, /moves between matches$/, report.id)
    else if (report.tier === 'pinned') assert.match(label, /^(Inside the|At the|Somewhere inside) /, report.id)
    else if (report.tier === 'area') assert.match(label, /^Somewhere in /, report.id)
    else assert.match(label, / of .+, rough spot$/, report.id)
    // The label names the marker it hangs on, or the square.
    const names = from ? [from.name, hajinPin(from.near || '')?.name].filter(Boolean) : [report.squares[0]]
    assert.ok(names.some(name => label.toLowerCase().includes(name.toLowerCase())), `${report.id}: ${label}`)
    assert.ok(squareLine(report).length > 8, report.id)
  }
})

test('the words back each claimed building and side', () => {
  const KIND = { police: /police/i, clinic: /clinic|hospital|medical/i, fire: /fire/i, gas: /gas|fuel/i, 'marine-gas': /gas|fuel|marine|jetty|pier/i, ammo: /ammo|armou?r|cache/i, uav: /uav|tower/i, 'lt-tower': /tower/i }
  for (const report of hajinReports) {
    if (report.service) assert.match(`${report.where} ${report.note || ''}`, KIND[hajinPin(report.service).layer], `${report.id}: where text does not mention its building`)
    if (report.side && report.dist !== 'same-building') {
      const side = new RegExp(report.side.replace('-', '[- ]?'), 'i')
      assert.match(`${report.where} ${report.note || ''}`, side, `${report.id}: where text does not give its side`)
    }
  }
})

test('rough and somewhere-in sites have ground to show; pinned ones do not', () => {
  for (const report of hajinReports) {
    const area = reportArea(report)
    if (report.tier === 'pinned') { assert.equal(area, null, report.id); continue }
    assert.ok(area, report.id)
    // Underground sites hang on the way down and claim no ground on the surface.
    if (report.below) { assert.equal(area.circle, null, report.id); continue }
    if (area.circle) {
      assert.ok(area.circle.radius >= 30 && area.circle.at.length === 2, report.id)
      // The ground shown always takes in the marker itself.
      assert.ok(Math.hypot(report.at[0] - area.circle.at[0], report.at[1] - area.circle.at[1]) <= area.circle.radius, `${report.id}: its circle misses its own marker`)
    } else assert.ok(area.squares.length, `${report.id} has neither a circle nor a square`)
  }
  for (const seed of hajinThreatSeeds) assert.ok(Object.values(PLACE_REACH).includes(seed.reach))
})

const site = (id, at, top = 'x', extra = {}) => ({ id, at, top, tier: 'pinned', type: 'key-room', name: id, ...extra })

test('groups never mix major locations and sit on a member’s own spot', () => {
  const sites = hajinReports.map(report => ({ id: report.id, at: report.at, top: report.top, tier: report.tier, type: report.type, name: report.name }))
  for (const zoom of [-1.5, -0.5, 0.5, 1.5]) {
    const groups = groupSites(sites, pxPerUnit(zoom), 34)
    const seen = groups.flatMap(group => group.members)
    assert.equal(seen.length, sites.length)
    assert.equal(new Set(seen).size, sites.length)
    for (const group of groups) {
      const members = group.members.map(id => sites.find(item => item.id === id))
      assert.ok(members.every(item => item.top === group.top), group.key)
      assert.ok(members.some(item => item.at[0] === group.anchor[0] && item.at[1] === group.anchor[1]), group.key)
      assert.equal(group.key, `${group.top}@${group.anchor.join(',')}`)
    }
    // Shuffled input gives the same groups.
    const again = groupSites([...sites].reverse(), pxPerUnit(zoom), 34)
    assert.deepEqual(again.map(group => [group.key, group.members]).sort(), groups.map(group => [group.key, group.members]).sort())
  }
  // Far apart, only shared spots merge; two spots 21 units apart merge when zoomed out and split when zoomed in.
  const pair = [site('a', [1024, 2316]), site('b', [1044, 2321]), site('c', [1044, 2321]), site('d', [1044, 2321], 'y')]
  assert.deepEqual(groupSites(pair, 100, 34).map(group => group.members.length).sort(), [1, 1, 2])
  assert.deepEqual(groupSites(pair, 0.49, 42).map(group => group.members.length).sort(), [1, 3])
  assert.deepEqual(groupSites(pair, 3, 42).map(group => group.members.length).sort(), [1, 1, 2])
  // Pinned members lead.
  const mixed = groupSites([site('z', [5, 5], 'x', { tier: 'area' }), site('m', [5, 5])], 1, 34)[0]
  assert.deepEqual(mixed.members, ['m', 'z'])
})

test('a group anchors on its major location’s own label when a member sits there', () => {
  const grid = hajinPin('the-grid')
  const sites = [site('one', grid.at, 'the-grid'), site('two', [grid.at[0] + 5, grid.at[1]], 'the-grid'), site('three', [grid.at[0] + 5, grid.at[1]], 'the-grid')]
  const [group] = groupSites(sites, 1, 34)
  assert.deepEqual(group.anchor, grid.at)
  assert.equal(group.anchorPin, 'the-grid')
})

test('a fan keeps its members apart and off the label’s side', () => {
  for (const touch of [false, true]) {
    for (const gap of [90, 180]) {
      for (let n = 1; n <= FAN_MAX; n++) {
        const slots = fanOffsets(n, { touch, gap })
        assert.equal(slots.length, n)
        for (let i = 0; i < slots.length; i++) {
          for (let j = i + 1; j < slots.length; j++) {
            const chord = Math.hypot(slots[i].dx - slots[j].dx, slots[i].dy - slots[j].dy)
            assert.ok(chord >= (touch ? 32 : 26), `n=${n} touch=${touch}: ${chord}`)
          }
          const angle = (Math.atan2(slots[i].dx, -slots[i].dy) * 180 / Math.PI + 360) % 360
          const off = Math.abs(((angle - gap + 540) % 360) - 180)
          assert.ok(off >= 29.5, `n=${n} slot ${i} sits in the label gap (${off}°)`)
        }
      }
    }
  }
  const crowd = fanOffsets(23)
  assert.equal(crowd.length, FAN_MAX)
  assert.equal(crowd.at(-1).more, 8)
  assert.ok(crowd.slice(0, -1).every(slot => !slot.more))
})

test('layer sections and quick finds cover the layers', () => {
  const listed = MAP_SECTIONS.flatMap(section => section.layers)
  assert.deepEqual([...listed].sort(), hajinLayers.map(layer => layer.id).sort())
  assert.equal(new Set(listed).size, listed.length)
  for (const layer of hajinLayers) assert.ok(layer.section && layer.short, layer.id)
  const reported = new Set(hajinLayers.filter(layer => layer.group === 'Reported').map(layer => layer.id))
  for (const find of QUICK_FINDS) for (const id of find.layers) assert.ok(reported.has(id), `${find.id}: ${id}`)
  const all = new Set(hajinLayers.map(layer => layer.id))
  for (const id of LEGACY_LAYERS) assert.ok(all.has(id), id)
})

test('saved map preferences survive new layers and bad input', () => {
  const defaults = hajinLayers.filter(layer => layer.on).map(layer => layer.id)
  assert.deepEqual(normalizePrefs(null).layers, defaults)
  assert.deepEqual(readPrefs('not json').layers, defaults)
  assert.deepEqual(normalizePrefs({ layers: 'nope', levels: 3 }).levels.length, 5)
  // A save from before `known` keeps its legacy choices; layers added since take their default.
  const old = normalizePrefs({ layers: ['poi', 'gas', 'bogus'], grid: false })
  for (const id of LEGACY_LAYERS) assert.equal(old.layers.includes(id), ['poi', 'gas'].includes(id), id)
  for (const layer of hajinLayers.filter(layer => !LEGACY_LAYERS.includes(layer.id))) assert.equal(old.layers.includes(layer.id), layer.on, layer.id)
  assert.equal(old.grid, false)
  assert.ok(!old.layers.includes('bogus'))
  // With `known`, every listed layer keeps the reader's choice.
  const saved = prefsToSave({ layers: ['exfil'], collapsed: ['places', 'nope'], hideUsed: true })
  assert.deepEqual(saved.known, hajinLayers.map(layer => layer.id))
  const back = normalizePrefs(JSON.parse(JSON.stringify(saved)))
  assert.deepEqual(back.layers, ['exfil'])
  assert.deepEqual(back.collapsed, ['places'])
  assert.equal(back.hideUsed, true)
})

test('every key room maps back to its key', () => {
  for (const key of dmzKeys) for (const room of key.rooms) assert.equal(keyOfReport(room.report)?.id, key.id, room.report)
})

test('search ranks names first and finds keys, places and squares', () => {
  const first = query => searchMap(query).items[0]?.id
  assert.equal(first('count'), 'counting-room-vault-heavenly-luck-casino')
  assert.ok(searchMap('casino count').items.some(item => item.id === 'counting-room-vault-heavenly-luck-casino'))
  assert.ok(searchMap('Supreme Leader Access Card').items.some(item => item.id === 'supreme-leaders-bunker'))
  assert.deepEqual(searchMap('   ').items, [])
  const f4 = searchMap('f4')
  assert.equal(f4.square, 'F4')
  assert.ok(f4.sourced.some(report => report.id === 'counting-room-vault-heavenly-luck-casino'))
  assert.ok(f4.pins.every(pin => pin.square === 'F4'))
  assert.ok(searchMap('E5').sourced.some(report => report.id === 'train-depot-storageroom-cheongun-village'))
  // A held key's room ranks first among equal matches.
  const rooms = searchMap('armory').items.filter(item => item.kind === 'report' && keyOfReport(item.id))
  const tied = rooms.filter(item => item.rank === rooms[0].rank)
  assert.ok(tied.length > 1, 'needs two key rooms that tie on "armory"')
  const last = tied.at(-1)
  const held = searchMap('armory', { held: { [keyOfReport(last.id).id]: 'held' } }).items
  assert.equal(held.filter(item => item.rank === rooms[0].rank)[0].id, last.id)
})

test('lists group by major location in map order, or by square in reading order', () => {
  const groups = listGroups(hajinReports.filter(report => report.type === 'key-room'))
  assert.equal(groups.reduce((sum, group) => sum + group.items.length, 0), hajinReports.filter(report => report.type === 'key-room').length)
  const majors = hajinPins.filter(pin => pin.layer === 'poi').map(pin => pin.id)
  const order = groups.map(group => group.id).filter(id => majors.includes(id))
  assert.deepEqual(order, majors.filter(id => order.includes(id)))
  const squares = listGroups(hajinReports, 'square').map(group => group.id)
  const rank = square => Number(square.slice(1)) * 100 + 'ABCDEFGHIJ'.indexOf(square[0])
  assert.deepEqual(squares, [...squares].sort((a, b) => rank(a) - rank(b)))
})

test('every Tac-Map link from before still opens something', () => {
  const current = new Set([...hajinPins.map(pin => pin.id), ...hajinReports.map(report => report.id), ...hajinRoutes.map(route => route.id)])
  for (const id of [...ids.pins, ...ids.reports, ...ids.routes]) assert.ok(current.has(resolvePinId(id)), `${id} no longer opens anything`)
  for (const [from, to] of Object.entries(REPORT_MOVED)) {
    assert.ok(!current.has(from), `${from} is still a current id`)
    assert.ok(current.has(resolvePinId(to)), `${from} moves to ${to}, which does not exist`)
  }
})

test('reported spots stay on the art', () => {
  for (const report of hajinReports) assert.ok(squareOf(report.at) && report.at[0] > 0 && report.at[1] > 0 && report.at[0] < 4096 && hajinMap, report.id)
})

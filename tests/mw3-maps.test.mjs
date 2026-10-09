import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { mw3Guides } from '../shared/mw3-guides.mjs'

const sources = JSON.parse(fs.readFileSync('docs/mw3-map-sources.json'))
const datasets = sources.maps.map(map => JSON.parse(fs.readFileSync(`app/data/maps/${map.id}.json`)))
const find = id => datasets.find(data => data.id === id)
const target = (data, id) => data.targets.find(target => target.id === id)
const members = (data, id) => target(data, id).locationIds.map(id => data.locations.find(location => location.id === id))
const urzikstan = find('mw3-urzikstan')

test('five MW3 maps retain credited 4K artwork and independently recorded coordinate evidence', () => {
  assert.equal(datasets.length, 5)
  assert.equal(datasets.reduce((sum, data) => sum + data.locations.length, 0), 445)
  assert.equal(sources.locations.length, 445)
  for (const art of sources.maps) {
    const bytes = fs.readFileSync('public' + art.image)
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), art.sha256)
    assert.equal(bytes.length, art.bytes)
    assert.equal(art.width, 4096)
    assert.equal(art.height, 4096)
    assert.match(art.credit, /Activision.*WZHUB/)
  }
  for (const data of datasets) {
    assert.equal(data.grid.columns.join(''), 'ABCDEFGHIJ')
    assert.equal(data.grid.rows.join(''), '0123456789')
    for (const loc of data.locations) {
      const evidence = sources.locations.find(record => record.map === data.id && record.id === loc.id)
      assert.ok(evidence, `${data.id}/${loc.id}`)
      assert.deepEqual([loc.x, loc.y], evidence.normalized)
      if (evidence.publishedPosition) {
        assert.deepEqual([loc.x, loc.y], [evidence.publishedPosition[1] / 256, -evidence.publishedPosition[0] / 256])
        assert.notDeepEqual(evidence.publishedPosition, [0, 0], 'A source placeholder is not a real location')
      } else assert.equal(loc.precision, 'area')
      assert.match(loc.grid, /^[A-J][0-9](?:\/[A-J][0-9])?$/)
      if (loc.areaRadius) assert.ok(loc.precision === 'area' && loc.areaRadius > 0 && loc.areaRadius <= .1)
    }
  }
})

test('Urzikstan presents a quiet overview while retaining useful support and travel references', () => {
  assert.equal(urzikstan.locations.length, 338)
  assert.equal(urzikstan.locations.filter(loc => loc.overview).length, 41)
  for (const category of ['quest', 'area', 'perk', 'ammo', 'upgrade', 'equipment', 'travel', 'weapon']) assert.ok(urzikstan.locations.some(loc => loc.category === category))
  assert.equal(members(urzikstan, 'dark-aether-portals').length, 4)
  for (const season of [2, 3, 5]) assert.equal(members(urzikstan, `season-${season}-portal`)[0].precision, 'area')
  assert.equal(members(urzikstan, 'free-perks').length, 8)
  assert.ok(members(urzikstan, 'free-perks').every(loc => loc.category === 'perk' && !loc.perkType))
})

test('Red Worm references distinguish clue walls, current USB selection and candidate arenas', () => {
  assert.equal(members(urzikstan, 'red-worm-clue-walls').length, 4)
  assert.equal(members(urzikstan, 'red-worm-usbs').length, 12)
  assert.equal(members(urzikstan, 'red-worm-arenas').length, 4)
  for (const id of ['red-worm-clue-walls', 'red-worm-usbs', 'red-worm-arenas']) assert.equal(target(urzikstan, id).kind, 'candidates')
  for (const loc of members(urzikstan, 'red-worm-usbs')) {
    assert.match(loc.state, /selection changes/)
    assert.doesNotMatch(loc.label, /Alpha|Bravo|Charlie|Delta/)
    assert.match(loc.description, /not permanently tied/)
  }
  assert.ok(members(urzikstan, 'red-worm-arenas').every(loc => /Possible arena/.test(loc.state)))
})

test('vault and Unstable Rift references avoid inventing a fixed Knight truck or active obelisk set', () => {
  assert.equal(members(urzikstan, 'vault-transmitters').length, 3)
  assert.match(target(urzikstan, 'vault-transmitters').description, /Knight rides a moving truck/)
  assert.ok(urzikstan.locations.every(loc => !/Knight/i.test(loc.label)))
  const obelisks = members(urzikstan, 'unstable-obelisks')
  assert.equal(obelisks.length, 54)
  assert.ok(obelisks.every(loc => /not every site is active/.test(loc.state)))
  assert.equal(target(urzikstan, 'unstable-obelisks').kind, 'candidates')
  assert.equal(find('mw3-unstable-rift'), undefined)
})

test('all seasonal maps include three contract starters and their documented exit references', () => {
  for (const [season, count] of [[1, 2], [2, 4], [3, 1], [5, 2]]) {
    const data = find(`mw3-dark-aether-season-${season}`)
    const contracts = data.locations.filter(loc => /^(contracts|obelisk)-/.test(loc.id))
    assert.equal(contracts.length, 3, `Season ${season}`)
    assert.equal(members(data, 'exits').length, count)
    assert.ok(members(data, 'exits').every(loc => loc.overview && loc.category === 'travel'))
  }
  assert.deepEqual(members(find('mw3-dark-aether-season-1'), 'exits').map(loc => loc.floor), ['Roof', 'Underground / lower tunnel'])
  assert.deepEqual(members(find('mw3-dark-aether-season-5'), 'exits').map(loc => loc.floor), ['Roof', 'Lower / ground'])
})

test('seasonal secrets retain story eligibility, possible keys and approximate interior searches', () => {
  const s1 = find('mw3-dark-aether-season-1')
  assert.equal(s1.locations.filter(loc => loc.id.startsWith('keys-')).length, 7)
  assert.ok(s1.locations.filter(loc => loc.id.startsWith('keys-')).every(loc => loc.state === 'Possible key spawn'))
  const s2 = find('mw3-dark-aether-season-2')
  for (const id of ['mw2-target-detour', 'mw2-mirror-detour', 'mw2-ship-detour']) assert.equal(members(s2, id)[0].state, 'Countermeasures story objective')
  assert.equal(members(s2, 'stadium-music')[0].precision, 'area')
  const s3 = find('mw3-dark-aether-season-3')
  assert.equal(members(s3, 'gyanxi-spores').length, 4)
  assert.match(members(s3, 'gyanxi-spores').at(-1).label, /central Rift Heart/)
  const s5 = find('mw3-dark-aether-season-5')
  for (const id of ['cosmos-maze', 'cosmos-computer', 'cosmos-maintenance']) {
    assert.equal(members(s5, id)[0].precision, 'area')
    assert.equal(members(s5, id)[0].state, 'Elder-only secret quest')
    assert.ok(members(s5, id)[0].floor)
  }
  assert.match(members(s5, 'cosmos-maze')[0].description, /does not pinpoint/)
})

test('cross-guide map links resolve the portal and gold-upgrade locations on Urzikstan', () => {
  let count = 0
  const targetIds = new Set([...urzikstan.targets, ...urzikstan.locations].map(item => item.id))
  for (const guide of mw3Guides) for (const phase of guide.phases) for (const step of phase.steps) {
    for (const link of step.links || []) if (link.href.includes('#map:')) {
      assert.ok(link.href.startsWith('/guides/mw3-urzikstan#map:'))
      assert.ok(targetIds.has(link.href.split('#map:')[1]), step.id)
      count++
    }
  }
  assert.equal(count, 19)
  const catalogue = JSON.parse(fs.readFileSync('shared/catalogue.json'))
  assert.equal(catalogue.maps.filter(map => map.gameId === 'mw3' && map.interactiveMap).length, 5)
  assert.ok(catalogue.maps.filter(map => map.gameId === 'mw3' && map.interactiveMap).every(map => map.aliases.includes('interactive map')))
})

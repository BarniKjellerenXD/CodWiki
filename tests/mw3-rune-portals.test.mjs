import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { readPortalSelection, portalQuery, portalMatches, separatePortalMarkers } from '../app/utils/mw3RunePortals.mjs'
import { retiredToolDestination } from '../shared/retired-tools.mjs'
import { mw3Guides } from '../shared/mw3-guides.mjs'

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'))
const data = read('app/data/mw3RunePortals.json')
const atlas = read('app/data/maps/mw3-urzikstan.json')
const research = read('docs/remaining-games/puzzle-data.json').mwRunePortals
const assets = read('docs/remaining-games/assets.json').assets

test('portal finder covers every calibrated entrance and destination with distinct identities', () => {
  assert.equal(data.entrances.length, 17)
  assert.equal(data.destinations.length, 24)
  const all = [...data.entrances, ...data.destinations]
  assert.equal(new Set(all.map(point => point.id)).size, 41)
  for (const [kind, prefix] of [['entrances', 'entry'], ['destinations', 'exit']]) {
    assert.deepEqual(data[kind].map(point => point.id), research[kind].map(point => point.id))
    assert.deepEqual(new Set(data[kind].map(point => point.id)), new Set(atlas.locations.filter(point => point.id.startsWith(`portals-${prefix}-`)).map(point => point.sourceId || point.id.split('-').at(-1))))
    for (const point of data[kind]) {
      const original = atlas.locations.find(location => location.id === `portals-${prefix}-${point.id}`)
      assert.equal(point.x, original.x)
      assert.equal(point.y, original.y)
      assert.equal(point.grid, original.grid)
      assert.ok(point.nearbyArea)
    }
  }
  assert.deepEqual(data.map, { id: atlas.layers[0].id, label: atlas.layers[0].label, image: atlas.layers[0].image, width: 4096, height: 4096 })
})

test('all 24 ordered codes match the reviewed plates and every reference asset is intact', () => {
  assert.equal(new Set(data.destinations.map(point => point.glyphIds.join(','))).size, 24)
  for (const destination of data.destinations) {
    const original = research.destinations.find(point => point.id === destination.id)
    assert.deepEqual(destination.glyphIds, original.glyphIds)
    assert.equal(destination.code.id, original.codeAssetId)
    assert.equal(destination.photo.id, original.contextAssetId)
    assert.equal(destination.glyphIds.length, 3)
    assert.ok(destination.glyphIds.every(id => data.glyphs.some(glyph => glyph.id === id)))
  }
  for (const photo of [...data.entrances.flatMap(point => point.photos), ...data.destinations.flatMap(point => [point.code, point.photo])]) {
    const original = assets.find(asset => asset.id === photo.id)
    assert.equal(photo.src, '/images/remaining/' + path.basename(original.localPath))
    const bytes = fs.readFileSync('public' + photo.src)
    assert.equal(createHash('sha256').update(bytes).digest('hex'), original.sha256)
    assert.deepEqual([photo.width, photo.height], original.dimensions)
    assert.match(photo.source, /^https:\/\/wzhub\.gg\//)
  }
  const known = data.destinations.find(point => point.id === research.fixture.expectedDestination)
  assert.equal(known.grid, 'I6')
  assert.deepEqual(known.glyphIds, ['mwz-glyph-01', 'mwz-glyph-02', 'mwz-glyph-03'])
  assert.ok(data.destinations.find(point => point.id === 'm2393').code.src.endsWith('.png'))
})

test('destinations sharing F2 and F7 are separately selectable and never share a code', () => {
  for (const grid of ['F2', 'F7']) {
    const choices = data.destinations.filter(point => portalMatches(point, grid))
    assert.equal(choices.length, 2)
    assert.notEqual(choices[0].label, choices[1].label)
    assert.notDeepEqual(choices[0].glyphIds, choices[1].glyphIds)
    assert.notEqual(choices[0].code.src, choices[1].code.src)
    for (const point of choices) assert.equal(readPortalSelection({ to: point.id }, null, data).to, point.id)
  }
  assert.ok(data.destinations.some(point => portalMatches(point, 'ORLOV H2')))
})

test('any entrance keeps the selected destination and its shooting order', () => {
  for (const entrance of data.entrances) {
    const selection = readPortalSelection({ to: 'm2112', from: entrance.id }, null, data)
    assert.equal(selection.to, 'm2112')
    assert.equal(selection.from, entrance.id)
    assert.equal(selection.invalidLink, false)
  }
  assert.deepEqual(readPortalSelection({ to: 'm2112' }, null, data), { to: 'm2112', from: '', invalidLink: false })
})

test('explicit links override saved selections, including partial and invalid links', () => {
  const saved = JSON.stringify({ version: 2, to: 'm2112', from: 'm2111' })
  assert.deepEqual(readPortalSelection({}, saved, data), { to: 'm2112', from: 'm2111', invalidLink: false })
  assert.deepEqual(readPortalSelection({ to: 'm2393' }, saved, data), { to: 'm2393', from: '', invalidLink: false })
  assert.deepEqual(readPortalSelection({ from: 'm2111' }, saved, data), { to: '', from: 'm2111', invalidLink: false })
  for (const to of ['unknown', 'm2111', ['m2112', 'm2393'], null, 123]) {
    assert.deepEqual(readPortalSelection({ to }, saved, data), { to: '', from: '', invalidLink: true })
  }
  for (const value of ['{bad', 'null', '{}', '[]', JSON.stringify({ version: 1, to: 'm2112' }), JSON.stringify({ version: 2, to: 'missing' })]) {
    assert.deepEqual(readPortalSelection({}, value, data), { to: '', from: '', invalidLink: false })
  }
})

test('shared query and clearing preserve unrelated URL state without stale portal IDs', () => {
  assert.deepEqual(portalQuery({ to: 'm2112', from: 'm2111', view: 'map' }, { to: 'm2393', from: '' }), { view: 'map', to: 'm2393' })
  assert.deepEqual(portalQuery({ to: 'm2112', from: 'm2111', view: 'map' }, { to: '', from: '' }), { view: 'map' })
})

test('close map markers remain separately clickable without changing their source positions', () => {
  for (const size of [256, 512, 1024]) {
    const original = [...data.entrances, ...data.destinations].map(point => ({ id: point.id, x: point.x * size, y: point.y * size }))
    const snapshot = structuredClone(original)
    const shown = separatePortalMarkers(original)
    assert.deepEqual(original, snapshot)
    assert.deepEqual(shown.map(point => point.id), original.map(point => point.id))
    for (let i = 0; i < shown.length; i++) for (let j = i + 1; j < shown.length; j++) assert.ok(Math.hypot(shown[i].x - shown[j].x, shown[i].y - shown[j].y) >= 37.9)
  }
  const equal = separatePortalMarkers([{ id: 'a', x: 20, y: 20 }, { id: 'b', x: 20, y: 20 }])
  assert.ok(equal.every(point => Number.isFinite(point.x) && Number.isFinite(point.y)))
  assert.ok(equal[1].x - equal[0].x >= 38)
})

test('the portal tool is reachable from discovery and the guide, with its redirect removed', () => {
  assert.equal(retiredToolDestination('/tools/mw3-rune-portals'), null)
  assert.match(fs.readFileSync('app/pages/tools/mw3-rune-portals.vue', 'utf8'), /PuzzlePage tool="mw3-rune-portals"/)
  for (const file of ['app/data/catalogue.json', 'app/data/searchIndex.json', 'public/desktop-catalogue.json', 'desktop-app/renderer/nav.js']) assert.ok(fs.readFileSync(file, 'utf8').includes('mw3-rune-portals'), file)
  const phase = mw3Guides.find(guide => guide.id === 'mw3-urzikstan').phases.find(phase => phase.id === 'rune-portals')
  assert.ok(phase.steps.some(step => step.links?.some(link => link.href === '/tools/mw3-rune-portals')))
})

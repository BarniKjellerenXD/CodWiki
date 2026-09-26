import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from '@vue/compiler-dom'
import { parse as parseSfc, compileScript } from '@vue/compiler-sfc'
import { transformSync } from 'esbuild'
import * as Vue from 'vue'
import { decodeGuideHash, mapAnchor, mapTargetFromAnchor, phaseForAnchor, readerView, readReaderContext } from '../app/utils/mapNavigation.mjs'
import { emptyProgress, ensureRun, readProgress, resetRun } from '../app/utils/companion.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const readJson = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
const catalogue = readJson('shared/catalogue.json')
const quests = readJson('app/data/quickQuests.json')
const validId = /^[a-z0-9-]+$/
const attribute = (node, name) => node.props?.find(prop => prop.type === 6 && prop.name === name)?.value?.content
const hasAttribute = (node, name) => node.props?.some(prop => prop.type === 6 && prop.name === name)
const plainText = node => node.type === 2 ? node.content : (node.children || []).map(plainText).join('')

function loadMap(id) { return readJson(`app/data/maps/${id}.json`) }

function guideReferences(id) {
  const anchors = new Set()
  const hiddenAnchors = new Set()
  const duplicateAnchors = []
  const links = []
  const tree = parse(fs.readFileSync(path.join(root, `app/components/guide/${id}.vue`), 'utf8'))
  function walk(node, parents = [], hidden = false) {
    hidden ||= (attribute(node, 'class') || '').split(/\s+/).some(name => name === 'cheat-grid' || name === 'quest-grid')
    let anchor = attribute(node, 'id')
    if (!anchor && /^h[123]$/.test(node.tag)) anchor = node.tag + '-' + plainText(node).toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
    if (anchor) {
      if (anchors.has(anchor)) duplicateAnchors.push(anchor)
      anchors.add(anchor)
      if (hidden) hiddenAnchors.add(anchor)
    }
    if (node.tag === 'ShowOnMap') {
      const returnNode = parents.findLast(parent => hasAttribute(parent, 'data-guide-step') || (['li', 'p', 'tr'].includes(parent.tag) && attribute(parent, 'id')))
      links.push({ target: attribute(node, 'target'), returnAnchor: returnNode && attribute(returnNode, 'id'), line: node.loc.start.line, hidden })
    }
    node.children?.forEach(child => walk(child, [...parents, node], hidden))
  }
  walk(tree)
  return { anchors, hiddenAnchors, duplicateAnchors, links }
}

function assertUniqueIds(items, label) {
  assert.ok(Array.isArray(items) && items.length, `${label}: expected a nonempty array`)
  const ids = items.map(item => item.id)
  for (const id of ids) assert.match(id, validId, `${label}: invalid ID ${id}`)
  assert.equal(new Set(ids).size, ids.length, `${label}: duplicate IDs`)
}

// Check actual image headers: a changed crop or image size invalidates the
// coordinate contract even when the JSON still parses successfully.
function imageDimensions(file) {
  const bytes = fs.readFileSync(file)
  if (path.extname(file) === '.svg') {
    const svg = parse(bytes.toString()).children.find(node => node.tag === 'svg')
    assert.ok(svg, `${file}: no SVG root`)
    const box = attribute(svg, 'viewBox')?.trim().split(/[\s,]+/).map(Number)
    if (box?.length === 4) return [box[2], box[3]]
    return [Number(attribute(svg, 'width')), Number(attribute(svg, 'height'))]
  }
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)]
  if (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') {
    for (let offset = 12; offset + 8 < bytes.length;) {
      const kind = bytes.toString('ascii', offset, offset + 4)
      const size = bytes.readUInt32LE(offset + 4)
      const payload = offset + 8
      if (kind === 'VP8X') return [bytes.readUIntLE(payload + 4, 3) + 1, bytes.readUIntLE(payload + 7, 3) + 1]
      if (kind === 'VP8 ') return [bytes.readUInt16LE(payload + 6) & 0x3fff, bytes.readUInt16LE(payload + 8) & 0x3fff]
      if (kind === 'VP8L') { const bits = bytes.readUInt32LE(payload + 1); return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1] }
      offset = payload + size + (size % 2)
    }
  }
  assert.fail(`${file}: expected a supported local SVG, PNG or WebP map image`)
}

test('map navigation distinguishes overview, targets, legacy anchors and malformed hashes', () => {
  for (const hash of ['#map', 'map', '#%6Dap']) assert.equal(mapTargetFromAnchor(decodeGuideHash(hash)), '')
  for (const hash of ['#map:power-switch', '#map%3Apower-switch', '#map%3Aofficial-1234']) {
    const target = mapTargetFromAnchor(decodeGuideHash(hash))
    assert.ok(target)
    assert.equal(mapTargetFromAnchor(mapAnchor(target)), target)
  }
  for (const hash of ['#wiki_main_quest', '#quick-phase-1', '#quick-step-phase-1-ol-2']) assert.equal(mapTargetFromAnchor(decodeGuideHash(hash)), null)
  for (const value of ['', undefined, null, 'map:', 'map:a/b', 'map:<script>', 'map:a b', 'Map:upper', 'map:a#b']) assert.equal(mapTargetFromAnchor(value), null)
  for (const hash of ['#%E0%A4%A', '#%', '#%zz']) assert.equal(decodeGuideHash(hash), '')
  for (const target of [undefined, '', null, 5, 'bad/id', 'not a target']) assert.equal(mapAnchor(target), 'map')
  assert.equal(mapAnchor('official-1234'), 'map:official-1234')
})

test('map navigation finds a reading phase from legacy, full, quick and individual step anchors', () => {
  const phases = [
    { id: 'setup', detail: 'wiki_power', legacy: 'wiki_old_power', steps: [{ id: 'turn-on-power' }, { id: 'pack-a-punch' }] },
    { id: 'quest', detail: 'wiki_main_quest', steps: [{ id: 'find-parts' }] },
  ]
  for (const anchor of ['wiki_power', 'wiki_old_power', 'quick-setup', 'quick-step-turn-on-power', 'quick-step-pack-a-punch']) assert.equal(phaseForAnchor(phases, anchor), phases[0], anchor)
  assert.equal(phaseForAnchor(phases, 'quick-step-find-parts'), phases[1])
  assert.equal(phaseForAnchor(phases, 'map:turn-on-power'), undefined)
  assert.equal(phaseForAnchor(phases, 'quick-step-missing'), undefined)
  const headings = [{ id: 'wiki_main_quest', level: 1 }, { id: 'wiki_power', level: 2 }, { id: 'unmapped-evidence', level: 3 }]
  assert.equal(phaseForAnchor(phases, 'guide-step-power-object', headings), phases[0])
  assert.equal(phaseForAnchor(phases, 'guide-step-side-quest', [...headings, { id: 'wiki_side_quests', level: 1 }, { id: 'side-quest', level: 2 }]), undefined)
})

test('map reader context upgrades old saves and never restores a map target as a reading anchor', () => {
  assert.equal(readerView('full'), 'full')
  for (const value of ['map', 'quick', '', undefined, null]) assert.equal(readerView(value), 'quick')
  assert.deepEqual(readReaderContext({ view: 'full', section: 'wiki_power' }), { view: 'full', section: 'wiki_power' })
  assert.deepEqual(readReaderContext({ view: 'quick', section: 'quick-phase-2' }), { view: 'quick', section: 'quick-phase-2' })
  assert.deepEqual(readReaderContext({ view: 'map', section: 'map:power', reader: { view: 'full', section: 'guide-step-power' } }), { view: 'full', section: 'guide-step-power' })
  assert.deepEqual(readReaderContext({ view: 'map', section: 'map:official-1798', reader: { view: 'full', section: 'guide-step-official-1798-1' } }), { view: 'full', section: 'guide-step-official-1798-1' })
  for (const section of ['map', 'map:power']) {
    assert.deepEqual(readReaderContext({ view: 'map', section }), { view: 'quick', section: '' })
    assert.deepEqual(readReaderContext({ view: 'full', section: 'wiki_power', reader: { view: 'full', section } }), { view: 'full', section: 'wiki_power' })
  }
  for (const reader of [null, false, 'bad', [], { view: 'map', section: 'guide-step-power' }, { view: 'quick', section: 42 }]) assert.deepEqual(readReaderContext({ view: 'full', section: 'wiki_power', reader }), { view: 'full', section: 'wiki_power' })
  assert.deepEqual(readReaderContext(null), { view: 'quick', section: '' })
})

test('map progress round-trips the selected target and an independent reading location', () => {
  const progress = emptyProgress()
  const run = ensureRun(progress, 'paradox-junction')
  Object.assign(run, { done: ['step-one'], view: 'map', section: 'map:headsets', reader: { view: 'full', section: 'guide-step-headsets' }, hideCompleted: true, collapsed: { wiki_setup: true }, groups: ['wiki_side_quests'] })
  progress.last = { route: '/guides/paradox-junction', title: 'Paradox Junction', section: 'map:headsets' }
  const restored = readProgress(JSON.stringify(progress))
  assert.equal(restored.runs['paradox-junction'].view, 'map')
  assert.equal(restored.runs['paradox-junction'].section, 'map:headsets')
  assert.deepEqual(restored.runs['paradox-junction'].reader, { view: 'full', section: 'guide-step-headsets' })
  assert.deepEqual(restored.runs['paradox-junction'].done, ['step-one'])
  assert.deepEqual(restored.last, progress.last)
  const legacy = readProgress(JSON.stringify({ version: 1, runs: { 'astra-malorum': { view: 'full', section: 'wiki_main_quest', done: ['one'] } } }))
  assert.deepEqual(legacy.runs['astra-malorum'].reader, { view: 'full', section: 'wiki_main_quest' })
})

test('map progress reset clears both resume positions and only the chosen run', () => {
  const progress = emptyProgress()
  const run = ensureRun(progress, 'paradox-junction')
  Object.assign(run, { done: ['one'], view: 'map', section: 'map:headsets', reader: { view: 'full', section: 'guide-step-headsets' }, hideCompleted: true, collapsed: { wiki_setup: true }, groups: ['wiki_side_quests'] })
  Object.assign(ensureRun(progress, 'astra-malorum'), { done: ['two'], view: 'map', section: 'map:mars', reader: { view: 'quick', section: 'quick-phase-3' } })
  progress.toys['paradox-junction'] = true
  progress.last = { route: '/guides/paradox-junction', title: 'Paradox Junction', section: 'map:headsets' }
  const otherRun = structuredClone(progress.runs['astra-malorum'])
  resetRun(progress, 'paradox-junction')
  assert.deepEqual(run.done, [])
  assert.equal(run.section, '')
  assert.deepEqual(run.reader, { view: 'full', section: '' })
  assert.equal(progress.last.section, '')
  assert.deepEqual(progress.runs['astra-malorum'], otherRun)
  assert.equal(progress.toys['paradox-junction'], true)
  assert.equal(run.view, 'map')
  assert.equal(run.hideCompleted, true)
  assert.deepEqual(run.collapsed, { wiki_setup: true })
  assert.deepEqual(run.groups, ['wiki_side_quests'])
  progress.last = { route: '/guides/astra-malorum', title: 'Astra Malorum', section: 'map:mars' }
  resetRun(progress, 'paradox-junction')
  assert.equal(progress.last.section, 'map:mars')
})

test('every catalogue map has a dataset and all normalized locations point to valid local artwork', async t => {
  for (const entry of catalogue.maps) await t.test(entry.id, () => {
    const data = loadMap(entry.id)
    assert.equal(data.id, entry.id)
    assert.equal(typeof data.name, 'string')
    assert.ok(data.name.trim())
    assertUniqueIds(data.layers, `${entry.id} layers`)
    assertUniqueIds(data.locations, `${entry.id} locations`)
    const layerIds = new Set(data.layers.map(layer => layer.id))
    assert.ok(layerIds.has(data.defaultLayer), `${entry.id}: missing default layer`)
    assert.ok(Array.isArray(data.sources) && data.sources.length, `${entry.id}: missing attribution`)
    for (const source of data.sources) {
      assert.ok(source.name?.trim())
      assert.ok(['https:', 'http:'].includes(new URL(source.url).protocol), `${entry.id}: unsupported source URL`)
    }
    for (const layer of data.layers) {
      assert.ok(layer.label?.trim(), `${entry.id}/${layer.id}: missing label`)
      assert.ok(Number.isInteger(layer.width) && layer.width > 0 && Number.isInteger(layer.height) && layer.height > 0, `${entry.id}/${layer.id}: invalid artwork dimensions`)
      assert.ok(layer.image.startsWith(`/maps/${entry.id}/`), `${entry.id}/${layer.id}: expected locally hosted artwork`)
      const publicRoot = path.join(root, 'public')
      const file = path.resolve(publicRoot, '.' + layer.image)
      assert.ok(file.startsWith(publicRoot + path.sep), `${entry.id}/${layer.id}: asset escapes public directory`)
      assert.ok(fs.existsSync(file), `${entry.id}/${layer.id}: missing ${layer.image}`)
      assert.deepEqual(imageDimensions(file), [layer.width, layer.height], `${entry.id}/${layer.id}: artwork dimensions changed; review coordinates`)
      if (layer.focusBounds) {
        assert.equal(layer.focusBounds.length, 2)
        assert.ok(layer.focusBounds.every(point => Array.isArray(point) && point.length === 2))
        assert.ok(layer.focusBounds.flat().every(value => Number.isFinite(value) && value >= 0 && value <= 1), `${entry.id}/${layer.id}: focus bounds outside artwork`)
        assert.ok(layer.focusBounds[0][0] < layer.focusBounds[1][0] && layer.focusBounds[0][1] < layer.focusBounds[1][1], `${entry.id}/${layer.id}: reversed or empty focus bounds`)
      }
    }
    for (const location of data.locations) {
      const label = `${entry.id}/${location.id}`
      assert.ok(layerIds.has(location.layerId), `${label}: unknown layer ${location.layerId}`)
      assert.ok(Number.isFinite(location.x) && location.x >= 0 && location.x <= 1, `${label}: x outside normalized artwork bounds`)
      assert.ok(Number.isFinite(location.y) && location.y >= 0 && location.y <= 1, `${label}: y outside normalized artwork bounds`)
      assert.ok(['point', 'area'].includes(location.precision), `${label}: expected explicit point/area precision`)
      assert.ok(location.label?.trim() && location.description?.trim(), `${label}: missing readable location guidance`)
      assert.equal(typeof location.category, 'string', `${label}: missing category`)
      assert.ok(location.category.trim())
      if (location.source) assert.ok(data.sources.some(source => source.name === location.source) || /^https?:\/\//.test(location.source), `${label}: unresolved source reference`)
    }
  })
})

test('every map exposes Cursed Mister Peeks candidates as perks with a dedicated guide destination', () => {
  for (const { id } of catalogue.maps) {
    const data = loadMap(id)
    const spawns = data.locations.filter(location => location.perkType === 'mister-peeks')
    assert.ok(spawns.length, `${id}: missing Cursed perk spawn references`)
    const target = data.targets.find(target => target.id === 'cursed-mister-peeks')
    assert.equal(target?.kind, 'candidates', `${id}: do not imply every spawn is active`)
    assert.equal(target.guideAnchor, 'wiki_cursed_mister_peeks')
    assert.deepEqual([...target.locationIds].sort(), spawns.map(location => location.id).sort(), `${id}: candidate group must include every tagged spawn and exclude other Peeks quests`)
    for (const spawn of spawns) {
      assert.equal(spawn.category, 'perk')
      assert.match(spawn.state, /Cursed mode.*possible spawn/)
      assert.ok(spawn.source, `${id}/${spawn.id}: missing reference`)
    }
    const guide = guideReferences(id)
    assert.ok(guide.links.some(link => link.target === target.id && link.returnAnchor === target.guideAnchor))
  }
})

test('map targets and both guide views resolve to existing locations and stable reading anchors', async t => {
  for (const entry of catalogue.maps) await t.test(entry.id, () => {
    const data = loadMap(entry.id)
    const guide = guideReferences(entry.id)
    const phases = quests[entry.id]
    const stepIds = new Set(phases.flatMap(phase => phase.steps.map(step => step.id)))
    const readingAnchors = new Set([...guide.anchors, ...phases.map(phase => `quick-${phase.id}`), ...[...stepIds].map(id => `quick-step-${id}`)])
    const locationIds = new Set(data.locations.map(location => location.id))
    assertUniqueIds(data.targets, `${entry.id} targets`)
    assert.deepEqual(guide.duplicateAnchors, [], `${entry.id}: duplicate reading anchors`)
    for (const target of data.targets) {
      assert.ok(target.title?.trim(), `${entry.id}/${target.id}: missing target title`)
      assert.ok(Array.isArray(target.locationIds) && target.locationIds.length, `${entry.id}/${target.id}: empty location group`)
      assert.equal(new Set(target.locationIds).size, target.locationIds.length, `${entry.id}/${target.id}: duplicate group members`)
      for (const id of target.locationIds) assert.ok(locationIds.has(id), `${entry.id}/${target.id}: unknown location ${id}`)
      if (locationIds.has(target.id)) assert.deepEqual(target.locationIds, [target.id], `${entry.id}/${target.id}: group shadows an unrelated location`)
      if (target.kind) assert.ok(['single', 'candidates', 'sequence', 'area'].includes(target.kind), `${entry.id}/${target.id}: unsupported target kind`)
      if (target.guideAnchor) assert.ok(readingAnchors.has(target.guideAnchor), `${entry.id}/${target.id}: missing guide anchor ${target.guideAnchor}`)
    }
    const targetIds = new Set([...locationIds, ...data.targets.map(target => target.id)])
    assert.ok(data.quickLinks && Object.keys(data.quickLinks).length, `${entry.id}: no quick map links`)
    for (const [stepId, target] of Object.entries(data.quickLinks)) {
      assert.ok(stepIds.has(stepId), `${entry.id}: quick map link references removed step ${stepId}`)
      assert.ok(targetIds.has(target), `${entry.id}/${stepId}: missing map target ${target}`)
      assert.equal(mapTargetFromAnchor(mapAnchor(target)), target, `${entry.id}/${stepId}: target cannot be shared in a URL`)
    }
    assert.ok(guide.links.length, `${entry.id}: no full-guide ShowOnMap links`)
    for (const link of guide.links) {
      assert.ok(targetIds.has(link.target), `${entry.id}:${link.line}: ShowOnMap references missing target ${link.target}`)
      assert.ok(link.returnAnchor && readingAnchors.has(link.returnAnchor), `${entry.id}:${link.line}: ShowOnMap needs a stable return-to-step anchor`)
    }
  })
})

test('generated map quick-link registry matches all datasets and contains only target IDs', () => {
  const files = fs.readdirSync(path.join(root, 'app/data/maps')).filter(file => file.endsWith('.json')).sort()
  assert.deepEqual(files.map(file => file.replace(/\.json$/, '')).sort(), catalogue.maps.map(map => map.id).sort())
  const expected = Object.fromEntries(files.map(file => { const data = loadMap(file.replace(/\.json$/, '')); return [data.id, data.quickLinks || {}] }))
  const registry = readJson('app/data/mapQuickLinks.json')
  assert.deepEqual(registry, expected, 'Run node scripts/generate-map-links.mjs after changing map bindings')
  for (const links of Object.values(registry)) for (const value of Object.values(links)) assert.equal(typeof value, 'string')
})

test('map targets and ShowOnMap links avoid permanently hidden legacy summary grids', async t => {
  for (const entry of catalogue.maps) await t.test(entry.id, () => {
    const data = loadMap(entry.id)
    const guide = guideReferences(entry.id)
    // These old summaries remain in the source for compatibility, but opening
    // their disclosures cannot reveal a .cheat-grid or .quest-grid ancestor.
    const hiddenTargets = data.targets.filter(target => target.guideAnchor && guide.hiddenAnchors.has(target.guideAnchor)).map(target => `${target.id} → ${target.guideAnchor}`)
    assert.deepEqual(hiddenTargets, [], `${entry.id}: map guide links must return to visible walkthrough content`)
    const hiddenLinks = guide.links.filter(link => link.hidden).map(link => `${link.target} at line ${link.line}`)
    assert.deepEqual(hiddenLinks, [], `${entry.id}: ShowOnMap links must not be inserted in permanently hidden summaries`)
  })
})

// Exercise the component's real reactive selection/filter logic without a DOM
// or Leaflet instance. Lifecycle hooks are skipped; the browser smoke checks
// cover canvas creation, resizing, pointer interaction and focus restoration.
let viewerScript
function viewerFixture(saved, storageFails = false, environment = {}) {
  if (!viewerScript) {
    const filename = path.join(root, 'app/components/InteractiveMap.client.vue')
    const { descriptor } = parseSfc(fs.readFileSync(filename, 'utf8'), { filename })
    viewerScript = transformSync(compileScript(descriptor, { id: 'map-filter-tests' }).content, { loader: 'ts', format: 'cjs' }).code
  }
  const persisted = new Map([['codwiki-map-ui-v2:fixture', saved]])
  const storage = {
    getItem(key) { if (storageFails) throw new Error('Storage unavailable'); return persisted.get(key) ?? null },
    setItem(key, value) { if (storageFails) throw new Error('Storage unavailable'); persisted.set(key, value) },
  }
  const module = { exports: {} }
  const require = name => {
    if (name === 'vue') return Vue
    if (name === 'leaflet') return { latLng: (lat, lng) => ({ lat, lng }), ...environment.leaflet }
    if (name === 'leaflet/dist/leaflet.css') return {}
    throw new Error(`Unexpected runtime dependency in map logic test: ${name}`)
  }
  const lifecycle = { mounted: [], beforeUnmount: [] }
  new Function('module', 'exports', 'require', 'ref', 'computed', 'watch', 'onMounted', 'onBeforeUnmount', 'nextTick', 'localStorage', 'window', 'requestAnimationFrame', 'cancelAnimationFrame', 'ResizeObserver', viewerScript)(module, module.exports, require, Vue.ref, Vue.computed, () => {}, callback => lifecycle.mounted.push(callback), callback => lifecycle.beforeUnmount.push(callback), Vue.nextTick, storage, environment.window, environment.requestAnimationFrame, environment.cancelAnimationFrame, environment.ResizeObserver)
  const props = Vue.reactive({
    active: true, canReturn: true, targetId: '',
    data: {
      id: 'fixture', name: 'Fixture', defaultLayer: 'ground', sources: [], quickLinks: {},
      layers: [{ id: 'ground', label: 'Ground', width: 2000, height: 1000 }, { id: 'upper', label: 'Upper floor', width: 2000, height: 1000 }],
      locations: [
        { id: 'room', label: 'Boiler Room', layerId: 'ground', category: 'area', x: 0.2, y: 0.3, precision: 'area', description: 'Room below the stairs.' },
        { id: 'quest', label: 'Quest part', layerId: 'ground', category: 'quest', x: 0.5, y: 0.3, precision: 'area', description: 'Check the workbench.' },
        { id: 'perk', label: 'Speed Cola', layerId: 'ground', category: 'perk', x: 0.7, y: 0.3, precision: 'point', description: 'Beside the door.' },
        { id: 'upstairs', label: 'Upper workshop', layerId: 'upper', category: 'area', x: 0.4, y: 0.5, precision: 'area', description: 'Above the stairs.' },
      ],
      targets: [{ id: 'candidates', title: 'Possible part spawns', kind: 'candidates', locationIds: ['quest', 'upstairs'] }],
    },
  })
  const events = []
  const state = module.exports.default.setup(props, { expose() {}, emit: (...event) => events.push(event) })
  return { props, state, events, persisted, lifecycle }
}

test('map viewer defaults to quest and area browsing, and selected locations bypass category/search filters', () => {
  const { props, state } = viewerFixture()
  assert.equal(state.category.value, 'quest-areas')
  assert.deepEqual(state.filteredLocations.value.map(location => location.id), ['room', 'quest', 'upstairs'])
  assert.deepEqual(state.visibleLocations.value.map(location => location.id), ['room', 'quest'])
  props.targetId = 'perk'
  assert.deepEqual(state.visibleLocations.value.map(location => location.id), ['room', 'quest', 'perk'])
  state.query.value = 'upper'
  assert.deepEqual(state.filteredLocations.value.map(location => location.id), ['upstairs'])
  assert.deepEqual(state.visibleLocations.value.map(location => location.id), ['perk'])
  props.targetId = ''
  assert.deepEqual(state.visibleLocations.value, [])
  state.category.value = 'all'
  state.query.value = 'Speed Cola'
  assert.deepEqual(state.filteredLocations.value.map(location => location.id), ['perk'])
  state.clearFilters()
  assert.equal(state.filteredLocations.value.length, 4)
})

test('map viewer restores validated filters and layers while recovering from bad or unavailable storage', () => {
  for (const category of ['quest-areas', 'all', 'perk']) {
    const { state, persisted } = viewerFixture(JSON.stringify({ layer: 'upper', category, wheelZoom: true }))
    state.restorePreferences()
    assert.equal(state.category.value, category)
    assert.equal(state.layerId.value, 'upper')
    assert.equal(state.wheelZoom.value, true)
    state.savePreferences()
    assert.deepEqual(JSON.parse(persisted.get('codwiki-map-ui-v2:fixture')), { layer: 'upper', category, perkFilter: 'all', wheelZoom: true })
  }
  for (const saved of [undefined, 'broken JSON', 'null', '42', JSON.stringify({ layer: 'removed-floor', category: 'removed-category', wheelZoom: 'yes' })]) {
    const { state } = viewerFixture(saved)
    assert.doesNotThrow(() => state.restorePreferences())
    assert.equal(state.category.value, 'quest-areas')
    assert.equal(state.layerId.value, 'ground')
    assert.equal(state.wheelZoom.value, true)
  }
  const { state } = viewerFixture(null, true)
  assert.doesNotThrow(() => { state.restorePreferences(); state.savePreferences() })
  assert.equal(state.category.value, 'quest-areas')
  assert.equal(state.wheelZoom.value, true)
})

test('map viewer migrates automatic scroll-zoom defaults while keeping layers, categories and new explicit opt-outs', () => {
  const { state, persisted } = viewerFixture()
  persisted.set('codwiki-map-ui-v1:fixture', JSON.stringify({ layer: 'upper', category: 'perk', wheelZoom: false }))
  state.restorePreferences()
  assert.equal(state.layerId.value, 'upper')
  assert.equal(state.category.value, 'perk')
  assert.equal(state.wheelZoom.value, true, 'The automatically saved v1 false should not disable the new default')
  state.savePreferences()
  assert.deepEqual(JSON.parse(persisted.get('codwiki-map-ui-v2:fixture')), { layer: 'upper', category: 'perk', perkFilter: 'all', wheelZoom: true })
  state.wheelZoom.value = false
  state.savePreferences()
  state.wheelZoom.value = true
  state.restorePreferences()
  assert.equal(state.wheelZoom.value, false, 'An explicit v2 opt-out must survive reopening the map')
  assert.equal(state.layerId.value, 'upper')
  assert.equal(state.category.value, 'perk')
  persisted.set('codwiki-map-ui-v2:fixture', 'malformed JSON')
  state.restorePreferences()
  assert.equal(state.layerId.value, 'upper', 'A malformed current save can still recover legacy browsing preferences')
  assert.equal(state.category.value, 'perk')
  assert.equal(state.wheelZoom.value, true)
})

test('map viewer keeps candidate groups together while focusing members across layers', () => {
  const { props, state, events } = viewerFixture()
  props.targetId = 'candidates'
  state.selectTarget()
  assert.equal(state.focusId.value, '', 'No candidate should be presented as the preferred spawn')
  assert.deepEqual(state.selectedLayers.value.map(layer => layer.id), ['ground', 'upper'])
  state.chooseLocation(props.data.locations[3])
  assert.equal(state.focusId.value, 'upstairs')
  assert.equal(state.layerId.value, 'upper')
  assert.equal(props.targetId, 'candidates')
  assert.deepEqual(events, [])
  assert.equal(state.selectedLocations.value.length, 2)
  state.chooseLocation(props.data.locations[2])
  assert.deepEqual(events, [['select', 'perk']], 'An unrelated pin should select its own location')
})

test('map viewer separates tagged Mister Peeks perks from ordinary perks and preserves selected pins', () => {
  const { props, state, persisted } = viewerFixture()
  props.data.locations.push(
    { id: 'peeks-ground', label: 'Mister Peeks — Boiler Room', layerId: 'ground', category: 'perk', perkType: 'mister-peeks', precision: 'area', x: 0.2, y: 0.3, description: 'Check beside the stairs.', state: 'Cursed mode · possible spawn' },
    { id: 'peeks-upper', label: 'Mister Peeks — Upper workshop', layerId: 'upper', category: 'perk', perkType: 'mister-peeks', precision: 'area', x: 0.4, y: 0.5, description: 'Check the desk.', state: 'Cursed mode · possible spawn' },
    { id: 'peeks-quest', label: 'Mister Peeks quest', layerId: 'ground', category: 'quest', precision: 'area', x: 0.5, y: 0.3, description: 'Carry the quest object.' },
  )
  state.category.value = 'perk'
  assert.equal(state.perkCount.value, 3)
  assert.equal(state.peeksCount.value, 2)
  assert.deepEqual(state.filteredLocations.value.map(location => location.id), ['perk', 'peeks-ground', 'peeks-upper'])
  state.perkFilter.value = 'mister-peeks'
  assert.deepEqual(state.filteredLocations.value.map(location => location.id), ['peeks-ground', 'peeks-upper'])
  props.targetId = 'perk'
  assert.deepEqual(state.visibleLocations.value.map(location => location.id), ['perk', 'peeks-ground'], 'The selected ordinary perk remains visible under the Peeks subfilter')
  state.query.value = 'upper'
  assert.deepEqual(state.filteredLocations.value.map(location => location.id), ['peeks-upper'])
  state.query.value = 'Cursed mode'
  assert.equal(state.filteredLocations.value.length, 2, 'The documented mode/state is searchable')
  state.query.value = 'Mister Peeks'
  assert.equal(state.filteredLocations.value.length, 2, 'An unrelated quest with the same name is not a Peeks perk spawn')
  state.savePreferences()
  assert.equal(JSON.parse(persisted.get('codwiki-map-ui-v2:fixture')).perkFilter, 'mister-peeks')
  state.perkFilter.value = 'all'
  state.restorePreferences()
  assert.equal(state.perkFilter.value, 'mister-peeks')
  props.data.locations = props.data.locations.filter(location => location.perkType !== 'mister-peeks')
  state.restorePreferences()
  assert.equal(state.perkFilter.value, 'all', 'A removed/unavailable subtype must not leave an empty saved filter')
  state.clearFilters()
  assert.equal(state.perkFilter.value, 'all')
})

test('map viewer converts normalized artwork corners and center with a top-left authoring origin', () => {
  const { state } = viewerFixture()
  const layer = { width: 2000, height: 1000 }
  for (const [x, y, lat, lng] of [[0, 0, 1000, 0], [1, 0, 1000, 2000], [0, 1, 0, 0], [1, 1, 0, 2000], [0.5, 0.5, 500, 1000]]) assert.deepEqual(state.coordinate({ x, y }, layer), { lat, lng })
})

test('map viewer avoids Leaflet zoom-transition teardown races and stops queued work before removing layers', () => {
  const calls = []
  const frames = new Map()
  let nextFrame = 1
  let options
  const fakeMap = {
    options: {}, on() {},
    stop() { calls.push('stop') },
    off(event) { assert.equal(event, 'zoomend', 'Keep Leaflet internal unload listeners intact'); calls.push('off') },
    remove() { calls.push('remove') },
  }
  const media = { matches: false, addEventListener() {}, removeEventListener() { calls.push('remove-motion-listener') } }
  const environment = {
    leaflet: {
      CRS: { Simple: {} },
      map(_element, value) { options = value; fakeMap.options = value; return fakeMap },
      layerGroup() { return { addTo() { return this }, clearLayers() { calls.push('clear-layers') } } },
    },
    window: { matchMedia() { return media } },
    requestAnimationFrame(callback) { const id = nextFrame++; frames.set(id, callback); return id },
    cancelAnimationFrame(id) { frames.delete(id) },
    ResizeObserver: class { observe() {} disconnect() { calls.push('disconnect-observer') } },
  }
  const { props, state, lifecycle } = viewerFixture(null, false, environment)
  // No layers are needed to exercise the viewer's real construction/teardown;
  // Leaflet drawing is intentionally outside this non-browser fixture.
  props.data.layers = []
  props.data.locations = []
  state.canvasRef.value = { addEventListener() {}, removeEventListener() { calls.push('remove-wheel-listener') } }
  lifecycle.mounted.forEach(callback => callback())
  assert.equal(state.mapError.value, false)
  assert.equal(state.ready.value, true)
  assert.equal(options.scrollWheelZoom, true, 'Scrolling should zoom by default')
  assert.equal(options.zoomAnimation, false, 'Never create Leaflet’s uncancelled zoom-transition timeout')
  assert.equal(options.markerZoomAnimation, false)
  assert.equal(frames.size, 1)
  state.motionChanged({ matches: true })
  assert.equal(options.inertia, false)
  state.motionChanged({ matches: false })
  assert.equal(options.inertia, true)
  assert.equal(options.zoomAnimation, false, 'Changing reduced-motion preference must not re-enable zoom transitions')
  calls.length = 0
  lifecycle.beforeUnmount.forEach(callback => callback())
  assert.equal(frames.size, 0, 'Cancel the outstanding ResizeObserver animation frame')
  assert.ok(calls.indexOf('stop') < calls.indexOf('clear-layers'))
  assert.ok(calls.indexOf('clear-layers') < calls.indexOf('remove'))
  for (const action of ['disconnect-observer', 'remove-motion-listener', 'remove-wheel-listener', 'off', 'remove']) assert.ok(calls.includes(action), `Missing cleanup: ${action}`)
  assert.equal(state.map, undefined)
})

test('map viewer preserves overlay removal hooks when replacing artwork and leaving the guide', () => {
  const subscriptions = new Set()
  const calls = []
  let sequence = 0
  function overlay() {
    const id = ++sequence
    let removeHook = true
    return {
      on() { return this },
      off(events) {
        // Model Leaflet's own once('remove') listener, which a blanket off()
        // would erase and leave a stale zoom/viewreset listener on the map.
        if (!events || events.split(' ').includes('remove')) removeHook = false
        assert.equal(events, 'load error', 'Only detach viewer-owned image callbacks')
        return this
      },
      addTo() { subscriptions.add(id); return this },
      remove() { if (removeHook) subscriptions.delete(id); calls.push(`remove-image-${id}`); return this },
    }
  }
  const bounds = { pad() { return this } }
  const environment = {
    leaflet: { latLngBounds() { return bounds }, point() {}, imageOverlay: overlay },
    cancelAnimationFrame() {},
  }
  const { state, lifecycle } = viewerFixture(null, false, environment)
  state.map = {
    setMinZoom() {}, setMaxBounds() {}, getBoundsZoom() { return -1 },
    getZoom() { return -1 }, getMinZoom() { return -2 }, getMaxZoom() { return 3 },
    fitBounds() { assert.equal(subscriptions.size, 1, 'Exactly the current overlay should receive reset events') },
    stop() { calls.push('stop') }, off() {},
    remove() { assert.equal(subscriptions.size, 0, 'All overlay map listeners must be removed before the map'); calls.push('remove-map') },
  }
  state.renderLayer()
  state.layerId.value = 'upper'
  state.renderLayer()
  assert.deepEqual([...subscriptions], [2], 'Layer switching must not leave the removed image subscribed')
  lifecycle.beforeUnmount.forEach(callback => callback())
  assert.deepEqual([...subscriptions], [])
  assert.ok(calls.indexOf('stop') < calls.indexOf('remove-image-2'))
  assert.ok(calls.indexOf('remove-image-2') < calls.indexOf('remove-map'))
  assert.equal(state.artwork, undefined)
})

test('map viewer refits selected locations on responsive size changes without interrupting ordinary panning', () => {
  const frames = new Map()
  const fits = []
  let nextFrame = 1
  let width = 360
  let height = 440
  const environment = {
    leaflet: { latLngBounds(...points) { return { points } }, point() {} },
    requestAnimationFrame(callback) { const id = nextFrame++; frames.set(id, callback); return id },
    cancelAnimationFrame(id) { frames.delete(id) },
  }
  const { props, state } = viewerFixture(null, false, environment)
  props.data.targets.push({ id: 'same-floor', title: 'Two locations', locationIds: ['room', 'quest'] })
  props.targetId = 'same-floor'
  state.canvasRef.value = { getBoundingClientRect() { return { width, height } } }
  state.map = {
    invalidateSize() {}, getBoundsZoom() { return -1 }, setMinZoom() {},
    getZoom() { return -1 }, getMinZoom() { return -2 }, getMaxZoom() { return 3 },
    fitBounds(bounds) { fits.push(bounds.points) },
  }
  function resize() {
    state.resizeMap()
    const pending = [...frames.values()]
    frames.clear()
    pending.forEach(callback => callback())
  }
  const selection = [[{ lat: 700, lng: 400 }, { lat: 700, lng: 1000 }]]
  resize()
  assert.deepEqual(fits, [selection], 'Initial visible dimensions must frame the selected group')
  resize()
  assert.equal(fits.length, 1, 'Unchanged dimensions must preserve the user’s pan/zoom position')
  width = 920
  resize()
  assert.deepEqual(fits.at(-1), selection)
  assert.equal(fits.length, 2, 'Widening the canvas must bring all selected pins into view')
  height = 750
  resize()
  assert.equal(fits.length, 3, 'Expand/height changes must also refit')
  width = 0
  resize()
  assert.equal(fits.length, 3, 'Hidden canvases must not fit zero bounds')
  width = 920
  resize()
  assert.equal(fits.length, 4, 'A visible canvas must recover after hiding, even at its previous size')
  props.targetId = ''
  width = 600
  resize()
  assert.deepEqual(fits.at(-1), [[0, 0], [1000, 2000]], 'Without a selection, resized canvases fit the overview')
  resize()
  assert.equal(fits.length, 5, 'Ordinary overview panning remains unchanged')
})

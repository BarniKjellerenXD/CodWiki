import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import { parse } from '@vue/compiler-dom'
import { emptyProgress, readProgress, ensureRun, resetRun, searchCatalogue } from '../app/utils/companion.mjs'
const require = createRequire(import.meta.url)
const { siteForDevelopment, isInternal, mergeOrder, mergeShortcuts, matchAccel } = require('../desktop-app/runtime.js')
const { groupNavigation } = require('../desktop-app/renderer/navigation.js')
const catalogue = JSON.parse(fs.readFileSync(new URL('../shared/catalogue.json', import.meta.url)))
const index = JSON.parse(fs.readFileSync(new URL('../app/data/searchIndex.json', import.meta.url)))
const quests = JSON.parse(fs.readFileSync(new URL('../app/data/quickQuests.json', import.meta.url)))

test('search finds tools and guide sections, handles accents and multiple words', () => {
  assert.equal(searchCatalogue(index, 'serum')[0].route, '/tools/ashes-serum')
  assert.ok(searchCatalogue(index, 'serum').some(e=>e.route.endsWith('#wiki_create_the_serum')))
  assert.ok(searchCatalogue(index, 'kowakujo clock').some(e=>e.route==='/tools/kowakujo-clock-solver'))
  assert.ok(searchCatalogue(index, 'Kowakujō').length)
  assert.equal(searchCatalogue(index, '').length, 0)
  assert.equal(searchCatalogue(index, 'no-such-map-981').length, 0)
})
test('progress survives serialisation; resetting one run preserves toys and preferences', () => {
  const state = emptyProgress()
  const ashes = ensureRun(state, 'ashes-of-the-damned')
  ashes.done = ['phase-1-ol-1']; ashes.view = 'full'; ashes.groups = ['wiki_key_features']; ashes.collapsed = { wiki_ol: true }
  ensureRun(state, 'rex-infernus').done = ['phase-2-ol-1']
  state.toys.ashes = true
  state.last = { route:'/guides/ashes-of-the-damned',title:'Ashes',section:'quick-phase-1' }
  const restored = readProgress(JSON.stringify(state))
  assert.deepEqual(restored.runs['ashes-of-the-damned'].done, ashes.done)
  resetRun(restored, 'ashes-of-the-damned')
  assert.deepEqual(restored.runs['ashes-of-the-damned'].done, [])
  assert.equal(restored.toys.ashes, true)
  assert.equal(restored.runs['ashes-of-the-damned'].view, 'full')
  assert.deepEqual(restored.runs['ashes-of-the-damned'].groups, ['wiki_key_features'])
  assert.deepEqual(restored.runs['rex-infernus'].done, ['phase-2-ol-1'])
  assert.equal(restored.last.section, '')
})
test('malformed or obsolete progress recovers without preventing navigation', () => {
  for(const raw of [null, 'null', 'broken json', '{"version":99}', '[]']) assert.deepEqual(readProgress(raw), emptyProgress())
  const recovered = readProgress(JSON.stringify({version:1,runs:{ashes:{done:['one','one',3],view:'invalid'}},last:{route:'https://outside.test',title:'bad'}}))
  assert.deepEqual(recovered.runs.ashes.done,['one'])
  assert.equal(recovered.runs.ashes.view,'quick')
  assert.equal(recovered.last,null)
})
test('every map has unique stable step IDs and a real detailed reference', () => {
  for (const map of catalogue.maps) {
    const phases = quests[map.id]
    assert.ok(phases.length, map.id)
    const source = fs.readFileSync(`app/components/guide/${map.id}.vue`, 'utf8')
    const allIds = phases.flatMap(p=>p.steps.map(s=>s.id))
    assert.equal(new Set(allIds).size, allIds.length, map.id)
    for (const phase of phases) assert.ok(source.includes(`id="${phase.detail}"`), `${map.id}: ${phase.detail}`)
  }
})
test('catalogue links and generated desktop shortcuts stay in sync', () => {
  const nav = require('../desktop-app/renderer/nav.js')
  assert.equal(nav.length, catalogue.maps.length + catalogue.tools.length)
  assert.ok(!nav.some(n=>n.id==='bo7-super-easter-egg'))
  for(const item of [...catalogue.maps,...catalogue.tools]) assert.ok(fs.existsSync(`app/pages${item.route}.vue`), item.route)
  for(const map of catalogue.maps) assert.ok(fs.existsSync('public'+map.image))
  assert.equal(new Set(nav.map(n=>n.accel)).size, nav.length)
})
test('new desktop entries appear without losing saved ordering or removed entry handling', () => {
  const entries=[{id:'ashes'},{id:'rex'},{id:'new-tool'}]
  assert.deepEqual(mergeOrder(['rex','removed','ashes','rex'], entries), ['rex','ashes','new-tool'])
})

test('desktop upgrades add Paradox notes while preserving customised and cleared shortcuts', () => {
  const nav = require('../desktop-app/renderer/nav.js')
  const defaults = Object.fromEntries(nav.map(item => ['nav:' + item.id, item.accel]))
  const added = nav.find(item => item.id === 'paradox-notes')
  assert.equal(added.url, '/tools/paradox-note-order')
  const saved = { ...defaults }
  delete saved['nav:paradox-notes']
  assert.equal(mergeShortcuts(defaults, saved)['nav:paradox-notes'], 'Ctrl+Alt+1')
  saved['nav:' + nav[0].id] = 'Ctrl+Alt+1'
  saved['nav:' + nav[1].id] = null
  saved['nav:removed'] = 'Ctrl+9'
  const merged = mergeShortcuts(defaults, saved)
  assert.equal(merged['nav:paradox-notes'], null)
  assert.equal(merged['nav:' + nav[0].id], 'Ctrl+Alt+1')
  assert.equal(merged['nav:' + nav[1].id], null)
  assert.equal(merged['nav:removed'], undefined)
  assert.deepEqual(mergeShortcuts(defaults, null), defaults)
  const groups = groupNavigation(nav, nav.filter(item => item.id !== added.id).map(item => item.id))
  assert.ok(groups.find(group => group.id === 'paradox-junction').items.some(item => item.id === added.id))
})

test('desktop tool shortcuts accept shifted digits and require the exact modifiers', () => {
  assert.equal(matchAccel('Ctrl+Shift+1', { key: '!', code: 'Digit1', control: true, shift: true }), true)
  assert.equal(matchAccel('Ctrl+Alt+1', { key: '1', code: 'Digit1', control: true, alt: true }), true)
  assert.equal(matchAccel('Ctrl+Alt+1', { key: '1', code: 'Digit1', control: true }), false)
  assert.equal(matchAccel('Ctrl+1', { key: '!', code: 'Digit1', control: true, shift: true }), false)
  assert.equal(matchAccel('Alt+ArrowLeft', { key: 'ArrowLeft', alt: true }), true)
  assert.equal(matchAccel('Ctrl+Space', { key: ' ', control: true }), true)
  assert.equal(matchAccel('+', { key: '+' }), false)
})

test('legacy flat sidebar order becomes one category per map with its guide first', () => {
  const nav = require('../desktop-app/renderer/nav.js')
  const guides = nav.filter(item => item.kind === 'guide').reverse()
  const tools = nav.filter(item => item.kind === 'tool').reverse()
  const order = [...guides, ...tools].map(item => item.id)
  const groups = groupNavigation(nav, [...order, 'removed-entry', order[0]])
  assert.equal(groups.length, catalogue.maps.length)
  assert.deepEqual(groups.map(group => group.id), guides.map(item => item.id))
  assert.equal(groups.flatMap(group => group.items).length, nav.length)
  for (const group of groups) {
    assert.equal(group.items[0].kind, 'guide')
    assert.equal(group.items[0].label, 'Guide')
    assert.ok(group.items.every(item => item.map === group.id))
    assert.deepEqual(group.items.slice(1).map(item => item.id), tools.filter(item => item.map === group.id).map(item => item.id))
  }
  const incomplete = groupNavigation(nav, [tools[0].id])
  assert.equal(incomplete.flatMap(group => group.items).length, nav.length)
  assert.ok(incomplete.every(group => group.items[0].kind === 'guide'))
})
test('desktop preview is loopback-only and packaged builds use production', () => {
  assert.equal(siteForDevelopment('http://127.0.0.1:3000/path',false),'http://127.0.0.1:3000')
  assert.equal(siteForDevelopment('http://127.0.0.1:3000',true),'https://codguides.wolden.eu')
  assert.throws(()=>siteForDevelopment('http://example.com',false))
  assert.equal(isInternal('https://codguides.wolden.eu.evil.test', 'https://codguides.wolden.eu'), false)
  assert.equal(isInternal('https://codguides.wolden.eu/tools/ashes-serum#one', 'https://codguides.wolden.eu'), true)
})
test('generated section anchors match IDs created by the guide reader', () => {
  const attr=(n,key)=>n.props?.find(p=>p.name===key)?.value?.content || ''
  const plain=n=>n.type===2?n.content:(n.children||[]).map(plain).join('')
  for(const map of catalogue.maps) {
    const anchors=new Set()
    const walk=n=>{ const id=attr(n,'id'); if(id) anchors.add(id); if(/^h[123]$/.test(n.tag)&&!id) anchors.add(n.tag+'-'+plain(n).toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-'));n.children?.forEach(walk) }
    walk(parse(fs.readFileSync(`app/components/guide/${map.id}.vue`,'utf8')))
    for(const entry of index.filter(e=>e.map===map.id&&e.kind==='Section')) assert.ok(anchors.has(entry.route.split('#')[1]),entry.route)
  }
})

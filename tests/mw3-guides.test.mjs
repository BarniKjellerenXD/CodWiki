import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import { mw3Guides } from '../shared/mw3-guides.mjs'
import { expansionTools } from '../shared/expansion-tools.mjs'
import { retiredTools } from '../shared/retired-tools.mjs'
import { visibleGuidePhases } from '../app/utils/guideBranches.mjs'
import { readProgress, ensureRun } from '../app/utils/companion.mjs'
import legacy from './fixtures/mw3-guide-anchors-v1.json' with { type: 'json' }
const require = createRequire(import.meta.url)
const { groupNavigation, filterNavigation } = require('../desktop-app/renderer/navigation.js')
const nav = require('../desktop-app/renderer/nav.js')
const urzikstan = mw3Guides.find(guide => guide.id === 'mw3-urzikstan')

test('all six MW3 guides expose complete instructions without route filters or tool panels', () => {
  assert.equal(mw3Guides.length, 6)
  for (const guide of mw3Guides) {
    assert.equal(guide.defaultView, 'full')
    assert.equal(guide.branches, undefined)
    for (const branch of ['', 'story', 'unlock', 'ordinary', 'elder']) assert.deepEqual(visibleGuidePhases(guide.phases, branch), guide.phases)
    for (const phase of guide.phases) { assert.equal(phase.branches, undefined); assert.deepEqual(phase.tools, []) }
    for (const link of guide.sectionLinks) assert.ok(guide.phases.some(phase => link.id === `details-${phase.id}`), `${guide.id}/${link.id}`)
    const page = fs.readFileSync(`app/pages/guides/${guide.id}.vue`, 'utf8')
    assert.match(page, /default-view="full"/)
    assert.doesNotMatch(page, /MwzMilestones|:branches=/)
    assert.doesNotMatch(fs.readFileSync(`app/components/guide/${guide.id}.vue`, 'utf8'), /InlineTool|guideBranch|data-guide-branches/)
  }
})

test('every existing MW3 section and step anchor survives the reorganization', () => {
  for (const guide of mw3Guides) {
    const html = fs.readFileSync(`app/components/guide/${guide.id}.vue`, 'utf8')
    const anchors = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1])
    assert.equal(new Set(anchors).size, anchors.length, guide.id)
    for (const anchor of legacy.guides[guide.id]) assert.ok(anchors.includes(anchor), `${guide.id}: lost ${anchor}`)
  }
})

test('portal overview links to all four full rituals and optional seasonal Easter eggs', () => {
  const index = urzikstan.phases.find(phase => phase.id === 'dark-aether-portals')
  assert.ok(index)
  for (const season of [1, 2, 3, 5]) {
    const step = index.steps.find(step => step.id === `mw3-portal-season-${season}`)
    assert.equal(step.links.length, 2)
    assert.ok(step.links.every(link => link.href.startsWith(`/guides/mw3-dark-aether-season-${season}#details-`)))
    const guide = mw3Guides.find(guide => guide.id === `mw3-dark-aether-season-${season}`)
    const sections = guide.phases.map(phase => phase.id)
    const collection = season === 2 ? 'countermeasures' : season === 5 ? 'echo-relics' : 'relics'
    assert.ok(sections.indexOf(collection) < sections.indexOf('attunement'))
    assert.ok(sections.indexOf('attunement') < sections.indexOf('portal'))
    assert.ok(sections.indexOf('portal') < sections.indexOf('contracts'))
  }
  assert.ok(urzikstan.phases.indexOf(index) < urzikstan.phases.findIndex(phase => phase.id === 'contracts'))
})

test('eight independent free-perk activities each retain an illustrated action and location', () => {
  const perks = urzikstan.phases.filter(phase => phase.id.startsWith('free-'))
  assert.equal(perks.length, 8)
  for (const perk of perks) {
    assert.equal(perk.steps.length, 1)
    assert.ok(perk.steps[0].text.length > 80)
    assert.equal(perk.steps[0].images.length, 1)
    const image = perk.steps[0].images[0]
    assert.ok(fs.existsSync('public' + image.src), image.src)
    assert.ok(image.source && image.credit)
  }
  const vault = urzikstan.phases.find(phase => phase.id === 'vault')
  assert.match(vault.steps.map(step => step.text).join(' '), /Pawn.*Bishop.*Rook.*Knight/)
  assert.match(vault.steps.at(-1).text, /King Mimic/)
})

test('Red Worm instructions cover preparation, four current USBs, storm activation, attacks and extraction', () => {
  const worm = urzikstan.phases.find(phase => phase.id === 'red-worm')
  const text = worm.steps.map(step => step.text).join(' ')
  assert.match(text, /Pack-a-Punch III/)
  assert.match(text, /Alpha.*Bravo.*Charlie.*Delta/)
  assert.match(text, /TWO nearby ammunition caches.*four seismic refractors/)
  assert.match(text, /storm.*insert each matching drive/i)
  assert.match(text, /weakpoints.*tracking orbs/i)
  assert.match(text, /parachute/)
  assert.match(text, /spawned exit/)
  assert.ok(worm.steps.some(step => step.images?.some(image => image.assetId === 'reddit-red-worm-chart')))
})

test('MW3 discovery is six direct guides plus the photo finder; retired recorders still redirect to useful sections', () => {
  assert.deepEqual(expansionTools.filter(tool => tool.id.startsWith('mw3-')).map(tool => tool.id), ['mw3-red-worm-photos'])
  const groups = groupNavigation(nav).filter(group => group.game === 'mw3')
  assert.equal(groups.length, 6)
  assert.ok(groups.every(group => group.items[0].kind === 'guide'))
  assert.deepEqual(groups.find(group => group.id === 'mw3-urzikstan').items.filter(item => item.kind === 'tool').map(item => item.id), ['mw3-red-worm-photos'])
  assert.ok(groups.filter(group => group.id !== 'mw3-urzikstan').every(group => group.items.length === 1))
  assert.ok(filterNavigation(groupNavigation(nav), 'bo7', 'Red Worm').some(group => group.id === 'mw3-urzikstan'))
  for (const id of ['mw3-rune-portals', 'mw3-red-worm-usbs', 'mw3-dark-aether-reference', 'mw3-union-runes']) {
    assert.ok(retiredTools[id])
    assert.ok(!nav.some(entry => entry.id === id))
    const [route, anchor] = retiredTools[id].split('#')
    assert.ok(fs.readFileSync(`app/components/guide/${route.split('/').at(-1)}.vue`, 'utf8').includes(`id="${anchor}"`))
  }
})

test('completion and reading state keep their keys when activities move into their own sections', () => {
  const raw = { version: 1, runs: { 'mw3-urzikstan': { done: ['mw3-vault-open', 'mw3-free-perks'], section: 'guide-step-mw3-vault-open', view: 'full', groups: ['wiki_key_features'], collapsed: {} } }, toys: {}, last: null }
  const state = readProgress(JSON.stringify(raw))
  const run = ensureRun(state, 'mw3-urzikstan')
  assert.deepEqual(run.done, raw.runs['mw3-urzikstan'].done)
  assert.equal(run.section, raw.runs['mw3-urzikstan'].section)
  const ids = urzikstan.phases.flatMap(phase => phase.steps.map(step => step.id))
  assert.ok(run.done.every(id => ids.includes(id)))
})

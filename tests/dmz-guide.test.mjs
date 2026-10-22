import test from 'node:test'
import assert from 'node:assert/strict'
import { guideTiers, guideVests, guideSignIcons, guideDeployments, guideOpFit, guideFitLabels, guideVestSources, guideOpFitSources, guideTierSources, guideSource, stepKind, intelSteps, normalizeGuideProgress, readGuideProgress } from '../shared/dmz-guide.mjs'
import { guideConcepts, guideCriteria, guideScores, guideMix } from '../shared/dmz-guide-lab.mjs'
import { dmzStations, dmzPages, dmzDock, dmzLabPages } from '../shared/dmz.mjs'
import { dmzIntel } from '../shared/dmz-intel.mjs'
import { hajinPin } from '../shared/dmz-map.mjs'

const intelIds = new Set(dmzIntel.map(entry => entry.id))
const CONFIDENCE = ['official', 'confirmed', 'reported']

test('the guide runs Early, Mid, Late, each with ordered steps and a vest from the ladder', () => {
  assert.deepEqual(guideTiers.map(tier => tier.id), ['early', 'mid', 'late'])
  for (const tier of guideTiers) {
    assert.ok(tier.steps.length >= 5, tier.id)
    assert.ok(guideVests.some(vest => vest.id === tier.vest && vest.tier === tier.id), `${tier.id} vest ${tier.vest}`)
    assert.equal(new Set(tier.steps.map(step => step.id)).size, tier.steps.length, tier.id)
  }
  // Every tier but the last says how to know you are ready for the next.
  for (const tier of guideTiers.slice(0, -1)) assert.ok(tier.ready.length, tier.id)
  // The vest ladder climbs in plates.
  const plates = guideVests.filter(vest => !vest.side).map(vest => vest.plates)
  assert.deepEqual(plates, [...plates].sort((a, b) => a - b))
})

test('each stage has a picker line and several signs, armor only one of them', () => {
  for (const tier of guideTiers) {
    assert.ok(tier.short, tier.id)
    assert.ok(tier.signs.length >= 3, tier.id)
    for (const [icon, text] of tier.signs) assert.ok(guideSignIcons[icon] && text, `${tier.id} ${icon}`)
    assert.equal(tier.signs.filter(([icon]) => icon === 'armor').length, 1, tier.id)
  }
})

test('guide links point at real Intel entries, places and sources', () => {
  const sources = [...guideVestSources, ...guideOpFitSources, ...guideDeployments.flatMap(item => item.sources), ...guideTiers.flatMap(guideTierSources)]
  for (const id of sources) assert.ok(guideSource(id)?.url, `source ${id}`)
  for (const item of [...guideVests, ...guideDeployments]) if (item.intel) assert.ok(intelIds.has(item.intel), item.intel)
  for (const tier of guideTiers) {
    for (const step of tier.steps) {
      for (const id of step.intel || []) assert.ok(intelIds.has(id), `${tier.id}/${step.id} intel ${id}`)
      assert.ok(CONFIDENCE.includes(step.confidence), `${tier.id}/${step.id}`)
      assert.ok(step.sources.length, `${tier.id}/${step.id} has no source`)
    }
    for (const item of [...tier.print, ...(tier.hunt || [])]) if (item.intel) assert.ok(intelIds.has(item.intel), `${tier.id} ${item.intel}`)
    const pins = [...tier.farm.flatMap(item => item.pins), ...tier.places.go, ...tier.places.avoid, ...(tier.hunt || []).flatMap(item => item.pins)]
    for (const id of pins) assert.ok(hajinPin(id), `${tier.id} place ${id}`)
  }
})

test('early places to start are rated Low somewhere, and places to avoid are not', () => {
  const early = guideTiers[0]
  for (const id of early.places.go) assert.ok(hajinPin(id).parts.some(([, level]) => level === 'Low'), id)
  for (const id of early.places.avoid) assert.ok(!hajinPin(id).parts.some(([, level]) => level === 'Low'), id)
})

test('every Dynamic Op has an early-game rating and each objective an icon', () => {
  const ops = dmzIntel.filter(entry => entry.type === 'Dynamic Op' && entry.id !== 'dynamic-operations')
  assert.deepEqual(new Set(guideOpFit.map(item => item.id)), new Set(ops.map(entry => entry.id)))
  for (const item of guideOpFit) assert.ok(guideFitLabels[item.fit] && item.why, item.id)
  for (const op of ops) for (const step of intelSteps(op.id)) assert.notEqual(stepKind(step).id, 'step', `${op.id}: ${step}`)
  assert.equal(stepKind('Plant the Bomb on the WMD').id, 'bomb')
  assert.equal(stepKind('Find the Biological WMD and plant the explosive').id, 'bomb')
  assert.equal(stepKind('Find the HVT').id, 'find')
})

test('the Guide station counts match the guide, and the page is indexed and docked', () => {
  const station = dmzStations.find(item => item.id === 'guide')
  const steps = guideTiers.reduce((sum, tier) => sum + tier.steps.length, 0)
  assert.ok(station.facts.includes(`${guideTiers.length} stages · ${steps} steps in order`), station.facts[0])
  assert.ok(dmzPages.some(page => page.path === station.route))
  assert.ok(dmzDock.includes('guide'))
})

test('saved guide progress keeps known steps and the last stage, and drops the rest', () => {
  assert.deepEqual(normalizeGuideProgress({ done: ['early:orders-1', 'early:orders-1', 'early:nope', 'mid:orders-1'], tier: 'mid' }), { done: ['early:orders-1'], tier: 'mid' })
  assert.deepEqual(normalizeGuideProgress({ done: 'early:orders-1', tier: 'endgame' }), { done: [], tier: '' })
  assert.deepEqual(readGuideProgress('{not json'), { done: [], tier: '' })
})

test('every guide concept is a lab page with a full score, and the mix opens the live guide', () => {
  for (const concept of guideConcepts) assert.ok(dmzLabPages.some(page => page.path === concept.path), concept.path)
  for (const id of [...guideConcepts.map(concept => concept.id), guideMix.id]) {
    assert.deepEqual(Object.keys(guideScores[id]).sort(), guideCriteria.map(criterion => criterion.id).sort(), id)
    assert.ok(Object.values(guideScores[id]).every(score => [1, 2, 3].includes(score)), id)
  }
  assert.ok(guideMix.parts.every(id => guideConcepts.some(concept => concept.id === id)))
  assert.ok(dmzPages.some(page => page.path === guideMix.path))
})

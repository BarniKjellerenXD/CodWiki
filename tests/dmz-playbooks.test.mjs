import test from 'node:test'
import assert from 'node:assert/strict'
import { bossPlaybooks, bossPlaybook, materialPlaybooks, materialSpots } from '../shared/dmz-playbooks.mjs'
import { guideTiers, guideSource } from '../shared/dmz-guide.mjs'
import { dmzIntel } from '../shared/dmz-intel.mjs'
import { hajinPin } from '../shared/dmz-map.mjs'
import { bossGroups } from '../shared/dmz-stations.mjs'

const intelIds = new Set(dmzIntel.map(entry => entry.id))
const CONFIDENCE = ['official', 'confirmed', 'reported']
// Unknown: a Commander drop no source gives a rarity for.
const RARITY = ['Resource', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Unknown']

test('every boss on the Boss Board and in the guide has a playbook', () => {
  // General Kang is a story-mission target you sedate, covered by the Tier 1 step.
  const board = bossGroups().filter(group => ['lieutenants', 'commanders'].includes(group.id)).flatMap(group => group.entries.map(entry => entry.id)).filter(id => id !== 'general-kang')
  const hunts = guideTiers.flatMap(tier => (tier.hunt || []).map(item => item.intel))
  for (const id of [...board, ...hunts]) assert.ok(bossPlaybook(id), id)
  assert.equal(new Set(bossPlaybooks.map(book => book.id)).size, bossPlaybooks.length)
})

test('boss playbooks name real Intel, places and sources, and say how to kill', () => {
  for (const book of bossPlaybooks) {
    assert.ok(intelIds.has(book.id), book.id)
    for (const pin of book.pins) assert.ok(hajinPin(pin), `${book.id} pin ${pin}`)
    for (const id of book.sources) assert.ok(guideSource(id)?.url, `${book.id} source ${id}`)
    assert.ok(CONFIDENCE.includes(book.confidence), book.id)
    assert.ok(book.find.length && book.kill.length >= 3 && book.loot.length, book.id)
  }
})

test('the decoy Lieutenant playbook explains how to tell the real one', () => {
  const gorani = bossPlaybook('gorani')
  assert.ok(gorani.fight.some(line => /decoy/i.test(line)))
  assert.ok(gorani.kill.some(line => /decoy/i.test(line)))
})

test('every material the guide sends you to farm has exact spots', () => {
  const farm = guideTiers.flatMap(tier => (tier.farm || []).map(item => item.name))
  for (const name of farm) {
    const item = materialSpots(name)
    assert.ok(item?.spots?.length, name)
    // Hint-only materials say what to print them from instead.
    assert.ok(item.spots.some(spot => spot.search) || item.print, `${name} says what to search or print`)
  }
  assert.equal(new Set(materialPlaybooks.map(item => item.name)).size, materialPlaybooks.length)
})

test('material playbooks name real places and sources, and say how to get each one', () => {
  for (const item of materialPlaybooks) {
    assert.ok(RARITY.includes(item.rarity), `${item.name} rarity`)
    assert.ok(item.hint, item.name)
    assert.ok(item.spots?.length || item.print, `${item.name} has spots or a print recipe`)
    for (const spot of item.spots || []) {
      assert.ok(spot.where, item.name)
      if (spot.pin) assert.ok(hajinPin(spot.pin), `${item.name} pin ${spot.pin}`)
    }
    for (const id of item.sources) assert.ok(guideSource(id)?.url, `${item.name} source ${id}`)
    assert.ok(CONFIDENCE.includes(item.confidence), item.name)
  }
})

test('guide steps with a how list cite where it came from', () => {
  const steps = guideTiers.flatMap(tier => tier.steps).filter(step => step.how)
  assert.ok(steps.length >= 15)
  for (const step of steps) {
    assert.ok(step.how.length && step.how.every(line => typeof line === 'string' && line.length), step.id)
    for (const id of step.sources) assert.ok(guideSource(id)?.url, `${step.id} source ${id}`)
  }
})

test('guide-only sources do not repeat an Intel source under another id', async () => {
  const { intelSources } = await import('../shared/dmz-intel.mjs')
  const { guideSources } = await import('../shared/dmz-guide-sources.mjs')
  const norm = url => url.replace(/^https?:\/\/(www\.)?/, '').replace(/[#?].*$/, '').replace(/\/$/, '').toLowerCase()
  const intelUrls = new Set(Object.values(intelSources).filter(source => source.url).map(source => norm(source.url)))
  for (const [id, source] of Object.entries(guideSources)) assert.ok(!intelUrls.has(norm(source.url)), id)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { bossPlaybooks, bossPlaybook, materialPlaybooks, materialSpots } from '../shared/dmz-playbooks.mjs'
import { guideTiers, guideSource } from '../shared/dmz-guide.mjs'
import { dmzIntel } from '../shared/dmz-intel.mjs'
import { hajinPin, hajinReports } from '../shared/dmz-map.mjs'
import { bossGroups } from '../shared/dmz-stations.mjs'
import { anySource } from '../shared/dmz-sightings.mjs'

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

test('Commander where rows and Watch it done links cite real sources', () => {
  const commanders = bossPlaybooks.filter(book => book.where)
  assert.deepEqual(commanders.map(book => book.id), ['colossus', 'deathstalker', 'main-nk-battle-tank'])
  for (const book of commanders) {
    assert.ok(book.lead, book.id)
    for (const row of book.where) {
      assert.ok(row.sources.length, `${book.id}: ${row.where}`)
      for (const id of row.sources) assert.ok(anySource(id)?.url, `${book.id}: ${row.where} source ${id}`)
      for (const video of row.videos || []) assert.equal(anySource(video.id)?.type, 'video', `${book.id}: ${row.where} video ${video.id}`)
    }
    // A report row's anchor is a real place, so the mini-map can show it.
    for (const row of book.where.filter(item => item.report)) {
      const anchor = hajinReports.find(report => report.id === row.report)?.anchor
      assert.ok(hajinPin(anchor), `${book.id}: ${row.report}`)
    }
  }
  for (const book of bossPlaybooks) {
    for (const video of book.videos || []) assert.equal(anySource(video.id)?.type, 'video', `${book.id} video ${video.id}`)
    assert.ok(!(book.videos?.length && book.noVideo), `${book.id} has videos and a no-video line`)
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
  // One page per URL, query and fragment aside, except that each YouTube v= id is its own page.
  const norm = url => {
    const link = new URL(url)
    const video = /(^|\.)youtube\.com$/.test(link.hostname) && link.searchParams.get('v')
    return `${link.hostname.replace(/^www\./, '')}${link.pathname.replace(/\/$/, '')}`.toLowerCase() + (video ? `?v=${video}` : '')
  }
  const intelUrls = new Set(Object.values(intelSources).filter(source => source.url).map(source => norm(source.url)))
  for (const [id, source] of Object.entries(guideSources)) assert.ok(!intelUrls.has(norm(source.url)), id)
})

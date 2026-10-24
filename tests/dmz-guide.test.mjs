import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { guideTier, guideTiers, guideVests, guideSignIcons, guideDeployments, guideOpFit, guideFitLabels, guideVestSources, guideOpFitSources, guideTierSources, guideLootSources, guideLootVideos, guideSource, stepKind, intelSteps, normalizeGuideProgress, readGuideProgress } from '../shared/dmz-guide.mjs'
import { guideConcepts, guideCriteria, guideScores, guideMix } from '../shared/dmz-guide-lab.mjs'
import { dmzStations, dmzPages, dmzDock, dmzLabPages } from '../shared/dmz.mjs'
import { dmzIntel } from '../shared/dmz-intel.mjs'
import { hajinLayer, hajinPin, hajinReports } from '../shared/dmz-map.mjs'
import { bossPlaybook } from '../shared/dmz-playbooks.mjs'
import { BARRACKS, recipePlaybook } from '../shared/dmz-recipe-spots.mjs'
import { NO_PERCENT, independentReports } from '../shared/dmz-sightings.mjs'

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

test('both Tempered steps read the one chain in the recipe spots, with what to do if it goes wrong', () => {
  const tempered = recipePlaybook('tempered-armor-vest-recipe')
  assert.ok(tempered.how.length >= 4 && tempered.fallback.length)
  for (const [tier, id] of [['mid', 'tempered-recipe'], ['late', 'tempered']]) {
    const step = guideTier(tier).steps.find(item => item.id === id)
    assert.deepEqual(step.how, tempered.how, `${tier}/${id}`)
    assert.deepEqual(step.fallback, tempered.fallback, `${tier}/${id}`)
  }
  for (const tier of guideTiers) {
    for (const step of tier.steps.filter(item => 'fallback' in item)) {
      assert.ok(Array.isArray(step.fallback) && step.fallback.length && step.fallback.every(line => typeof line === 'string' && line.length), `${tier.id}/${step.id}`)
    }
  }
  assert.doesNotMatch(fs.readFileSync(new URL('../shared/dmz-guide.mjs', import.meta.url), 'utf8'), /\bdoctorOffice\b/)
})

test('the Commander hunt cards use the playbook pins', () => {
  const hunts = guideTier('late').hunt.filter(item => bossPlaybook(item.intel)?.where)
  assert.deepEqual(hunts.map(item => item.intel), ['colossus', 'deathstalker', 'main-nk-battle-tank'])
  for (const item of hunts) assert.deepEqual(item.pins, bossPlaybook(item.intel).pins, item.intel)
})

// ------------------------------------------------------------- Loot cards

const lootCards = guideTiers.flatMap(tier => tier.loot || [])
const reportById = new Map(hajinReports.map(report => [report.id, report]))
// What a card shows from its reports: their own where and note.
const reportText = card => card.rows.filter(row => row.report).flatMap(row => [reportById.get(row.report).where, reportById.get(row.report).note]).filter(Boolean)
// The words a loot card shows: titles, notes, steps, row text, its reports'
// words and video lines.
const lootText = card => [
  card.title, card.note, card.noVideo, ...(card.how || []), ...(card.fallback || []), ...(card.videos || []).map(video => video.why),
  ...card.rows.flatMap(row => [row.where, row.search, row.note, ...(row.how || []), ...(row.fallback || [])]),
  ...reportText(card),
].filter(Boolean)

test('each stage has its loot cards, in the agreed order', () => {
  assert.deepEqual(guideTiers.map(tier => (tier.loot || []).map(card => card.id)), [
    ['loot-safes', 'loot-free-kit', 'loot-train', 'loot-first-route'],
    ['loot-manuals', 'loot-casino', 'loot-reactor'],
    ['loot-bunker', 'loot-drc', 'loot-irradiated', 'loot-silos'],
  ])
  // Card ids are page anchors, so no two may match.
  const ids = lootCards.map(card => card.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const id of ids) assert.match(id, /^loot-[a-z0-9-]+$/)
})

test('loot rows use the sightings shape and point at real reports, places, layers and Intel', () => {
  const KINDS = ['mission', 'scripted', 'seen', 'unplaced', 'listed']
  const reports = new Map(hajinReports.map(report => [report.id, report]))
  for (const card of lootCards) {
    assert.ok(card.title && card.rows.length, card.id)
    for (const row of card.rows) {
      const name = `${card.id}: ${row.where}`
      assert.ok(KINDS.includes(row.kind), `${name}: kind ${row.kind}`)
      assert.ok(row.where && row.sources?.length, name)
      assert.ok(['report', 'pin', 'layer'].filter(field => row[field]).length <= 1, `${name} has more than one target`)
      if (row.report) assert.ok(reports.has(row.report), `${name}: report ${row.report}`)
      if (row.pin) assert.ok(hajinPin(row.pin), `${name}: pin ${row.pin}`)
      if (row.layer) assert.ok(hajinLayer(row.layer), `${name}: layer ${row.layer}`)
      if (row.mission) assert.ok(intelIds.has(row.mission), `${name}: mission ${row.mission}`)
      // A report row carries the report's own sources, so the guide cites what the map does.
      if (row.report) for (const id of reports.get(row.report).sources) assert.ok(row.sources.includes(id), `${name}: ${id}`)
      if (row.kind === 'listed') assert.equal(row.seen, undefined, `${name}: listed rows have no count`)
      else assert.ok(Number.isInteger(row.seen) && row.seen > 0 && row.seen <= independentReports(row.sources), `${name}: seen ${row.seen}`)
    }
    for (const id of card.intel || []) assert.ok(intelIds.has(id), `${card.id} intel ${id}`)
  }
  for (const tier of guideTiers) {
    for (const id of guideLootSources(tier)) assert.ok(guideSource(id)?.url, `${tier.id} loot source ${id}`)
    assert.ok(guideLootSources(tier).every(id => guideTierSources(tier).includes(id)), tier.id)
  }
})

test('the loot cards name the agreed reports', () => {
  const reportsOf = id => lootCards.find(card => card.id === id).rows.map(row => row.report).filter(Boolean)
  assert.deepEqual(reportsOf('loot-safes'), ['cheonwang-peak-array-safes'])
  assert.deepEqual(reportsOf('loot-first-route'), ['nurigo-east-loot-route'])
  assert.deepEqual(reportsOf('loot-manuals'), ['chang-san-barracks'])
  assert.deepEqual(reportsOf('loot-casino'), ['casino-vault-run', 'heavenly-luck-casino-basement-vault'])
  assert.deepEqual(reportsOf('loot-reactor'), ['haneul-reactor-loot-route'])
  assert.deepEqual(reportsOf('loot-bunker'), ['supreme-leaders-bunker'])
  assert.deepEqual(reportsOf('loot-drc'), ['reactor-drc-locker', 'shopping-drc-locker-drc-labs-under-nurigo', 'air-base-drc-weapons-locker'])
  assert.deepEqual(reportsOf('loot-irradiated'), ['reactor-02-decontamination-machine'])
  assert.deepEqual(reportsOf('loot-silos'), ['silo-bunkers-chang-san', 'silo-bunkers-prison'])
  assert.deepEqual(lootCards.find(card => card.id === 'loot-safes').rows.map(row => row.layer).filter(Boolean), ['compound'])
  assert.deepEqual(lootCards.find(card => card.id === 'loot-free-kit').rows.map(row => row.layer).filter(Boolean), ['fire'])
  const cash = lootCards.find(card => card.id === 'loot-casino').rows.find(row => row.kind === 'mission')
  assert.equal(cash.mission, 'operation-silent-ledger')
  // Two threads report gear in the small camps.
  const camps = lootCards.find(card => card.id === 'loot-free-kit').rows.find(row => row.where === 'Small military camps')
  assert.deepEqual(camps.sources, ['reddit-1xcq7w7', 'reddit-where-are-the-parachutes'])
})

test('the Weapon Manual card reads the barracks run from the recipe spots', () => {
  const barracks = lootCards.find(card => card.id === 'loot-manuals').rows.find(row => row.report === 'chang-san-barracks')
  assert.equal(barracks.how, BARRACKS.how)
  assert.equal(barracks.fallback, BARRACKS.fallback)
  // The how-to it shows cites what the recipe spots cite.
  for (const id of BARRACKS.sources) assert.ok(guideLootSources(guideTier('mid')).includes(id), id)
})

test('loot cards show their reports\' words instead of retyping them', () => {
  // Any run of four words a card's own text shares with its reports' where or note.
  const words = text => text.toLowerCase().match(/[a-z0-9']+/g) || []
  const runs = text => { const list = words(text); return list.slice(3).map((_, index) => list.slice(index, index + 4).join(' ')) }
  for (const card of lootCards) {
    const theirs = new Set(reportText(card).flatMap(runs))
    const own = [card.note, ...(card.how || []), ...(card.fallback || []), ...card.rows.filter(row => !row.report).flatMap(row => [row.search, row.note])].filter(Boolean)
    for (const line of own) for (const run of runs(line)) assert.ok(!theirs.has(run), `${card.id} retypes "${run}" from its report`)
  }
})

test('every loot card has a video or says it has none, and lists each video once', () => {
  for (const card of lootCards) {
    const videos = guideLootVideos(card)
    assert.ok(videos.length || card.noVideo, `${card.id} has no video and no noVideo line`)
    assert.equal(new Set(videos.map(video => video.id)).size, videos.length, card.id)
    for (const video of videos) assert.equal(guideSource(video.id)?.type, 'video', `${card.id}: ${video.id}`)
  }
  // Report videos follow the card's own, so the casino card shows the vault run's.
  const casino = lootCards.find(card => card.id === 'loot-casino')
  assert.deepEqual(guideLootVideos(casino).map(video => video.id), hajinReports.find(report => report.id === 'casino-vault-run').videos.map(video => video.id))
  assert.deepEqual(guideLootVideos(lootCards.find(card => card.id === 'loot-safes')).map(video => video.id), ['youtube-ap6kpzmgau8', 'youtube-3vvrydq1yqq', 'youtube-9crz7eenjxs'])
})

test('loot text gives no rates, ranks or superlatives', () => {
  const text = lootCards.flatMap(lootText)
  assert.ok(text.length > 40)
  for (const line of text) {
    assert.doesNotMatch(line, NO_PERCENT, line)
    assert.doesNotMatch(line, /\b(best|complete|official|verified|most)\b|#\d/i, line)
  }
  // The train card keeps to what sources say: no UAV, cash or recipes on board, and no claim it is easy.
  assert.doesNotMatch(lootText(lootCards.find(card => card.id === 'loot-train')).join(' '), /\b(UAV|cash|recipes?|easy|runs? (players|you) over)\b/i)
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

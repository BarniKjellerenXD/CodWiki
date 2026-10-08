import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { awGuides } from '../shared/aw-guides.mjs'
import { awTools } from '../shared/aw-tools.mjs'
import { vanguardGuides } from '../shared/vanguard-guides.mjs'
import { vanguardTools } from '../shared/vanguard-tools.mjs'
import { evaluateAW, applyDescentEvent, descentNumberPlan } from '../app/utils/aw.mjs'
import { evaluateVanguard, terraPageCandidates, vanguardCipherPairs, permutations, terraPositions } from '../app/utils/vanguard.mjs'
import { clearScope, changeObservation, groupVisible } from '../app/utils/remainingUi.mjs'

const tools = [...awTools, ...vanguardTools]
const guides = [...awGuides, ...vanguardGuides]
const layout = { 'screen-0': 'Yellow', 'screen-1': 'Blue', 'screen-2': 'Red', 'screen-3': 'Green' }
const planState = (targets, currents) => Object.fromEntries(targets.flatMap((target, i) => [[`target-${i}`, target], [`current-${i}`, currents[i]]]))

test('all eight game destinations have authored routes and resolvable contextual tools', () => {
  assert.deepEqual(awGuides.map(g => g.id), ['aw-outbreak', 'aw-infection', 'aw-carrier', 'aw-descent'])
  assert.deepEqual(vanguardGuides.map(g => g.id), ['vanguard-der-anfang', 'vanguard-terra-maledicta', 'vanguard-shi-no-numa', 'vanguard-the-archon'])
  for (const g of guides) {
    const phases = [...g.phases, ...g.sidePhases]
    assert.equal(new Set(phases.map(p => p.id)).size, phases.length, g.id)
    const steps = phases.flatMap(p => p.steps)
    assert.equal(new Set(steps.map(s => s.id)).size, steps.length, g.id)
    assert.ok(g.phases.length >= 5 && g.sidePhases.length >= 2, g.id)
    assert.ok(steps.every(s => s.text.length >= 35 && s.quick), g.id)
    for (const p of phases) for (const toolId of p.tools) assert.equal(tools.find(t => t.id === toolId)?.map, g.id)
    for (const link of steps.flatMap(s => s.links || [])) if (link.href.startsWith('#details-')) assert.ok(phases.some(p => `#details-${p.id}` === link.href), link.href)
  }
  for (const t of tools) assert.ok(guides.find(g => g.id === t.map)?.phases.concat(guides.find(g => g.id === t.map).sidePhases).some(p => p.id === t.guidePhase && p.tools.includes(t.id)), t.id)
})

test('guide pictures resolve to existing researched assets with source provenance', () => {
  const assets = JSON.parse(fs.readFileSync(new URL('../docs/remaining-games/assets.json', import.meta.url))).assets
  for (const g of guides) for (const item of [...g.phases, ...g.sidePhases].flatMap(p => p.steps.flatMap(s => s.images || []))) {
    const asset = assets.find(a => a.id === item.assetId)
    assert.ok(asset?.localPath && fs.existsSync(new URL(`../docs/remaining-games/${asset.localPath}`, import.meta.url)), item.src)
    assert.ok(item.alt && item.source && item.credit, item.src)
  }
})

test('Infection search atlas separates the 36 candidate sites into four districts', () => {
  const atlas = awGuides.find(g => g.id === 'aw-infection').sidePhases.find(p => p.id === 'meat-locations')
  assert.deepEqual(atlas.steps.map(s => s.images.length), [8, 10, 8, 10])
  assert.match(awGuides.find(g => g.id === 'aw-infection').phases.find(p => p.id === 'burger').steps[0].text, /one piece at a time/)
})

test('Simon maps repeated flashes through a random left-to-right monitor arrangement', () => {
  const result = evaluateAW('aw-descent-simon', { ...layout, 'flash-0': 'Red', 'flash-1': 'Red', 'flash-2': 'Yellow' })
  assert.equal(result.status, 'ready')
  assert.deepEqual(result.lines, ['1. Red → monitor 3 from the left', '2. Red → monitor 3 from the left', '3. Yellow → monitor 1 from the left'])
  assert.equal(evaluateAW('aw-descent-simon', { ...layout, 'screen-0': 'Red', 'flash-0': 'Red' }).status, 'invalid')
  assert.equal(evaluateAW('aw-descent-simon', { ...layout, 'flash-1': 'Red' }).status, 'invalid')
  assert.equal(evaluateAW('aw-descent-simon', { ...layout, 'flash-0': 'Pink' }).status, 'invalid')
  assert.equal(evaluateAW('aw-descent-simon', { 'flash-0': 'Red' }).status, 'waiting')
})

test('editing Simon layout reinterprets observations; clearing flashes preserves the layout', () => {
  const state = { ...layout, 'flash-0': 'Red' }
  assert.match(evaluateAW('aw-descent-simon', { ...state, 'screen-1': 'Red', 'screen-2': 'Blue' }).lines[0], /monitor 2/)
  const definition = awTools.find(t => t.id === 'aw-descent-simon')
  const scope = definition.resetScopes.find(s => s.id === 'flashes')
  assert.ok(scope.fields.every(id => id.startsWith('flash-')))
  assert.ok(!scope.fields.some(id => id.startsWith('screen-')))
})

test('number-panel arithmetic wraps decimal digits and permits leading zero', () => {
  const result = descentNumberPlan(planState(['1', '0', '0', '0'], ['8', '0', '0', '0']))
  assert.equal(result.status, 'ready')
  assert.match(result.lines[0], /3 remaining/)
  assert.match(result.lines[1], /0 remaining/)
  assert.match(result.lines.join(' '), /one slam may hit several/i)
  assert.match(result.lines.join(' '), /ammunition does not/i)
  assert.equal(descentNumberPlan(planState(['00', '0', '0', '0'], ['0', '0', '0', '0'])).status, 'invalid')
})

test('number-panel missing observations only block the missing digit', () => {
  const result = descentNumberPlan(planState(['1', '0', '0', '0'], ['', '9', '0', '0']))
  assert.equal(result.status, 'waiting')
  assert.match(result.lines[0], /record both/)
  assert.match(result.lines[1], /1 remaining/)
})

test('an Exo Slam event counts hits and separately updates jumps and kills', () => {
  assert.deepEqual(applyDescentEvent(['8', '9', '2', '5'], { hits: 2, jumps: 1, kills: 1 }), ['0', '0', '2', '6'])
  assert.deepEqual(applyDescentEvent(['0', '0', '9', '0'], { purchases: 1, ammo: true }), ['0', '0', '9', '0'])
  assert.deepEqual(applyDescentEvent(['0', '0', '9', '0'], { purchases: 1 }), ['0', '0', '0', '0'])
  assert.deepEqual(applyDescentEvent(['', '0', '0', '0'], { hits: 2 }), ['', '0', '0', '0'])
  assert.throws(() => applyDescentEvent(['0', '0', '0', '0'], { hits: -1 }))
  assert.throws(() => applyDescentEvent(['0', '0', '0', '0'], { hits: 1.5 }))
})

test('Terra enumerates all 24 orders and conditions rejection on its accepted prefix', () => {
  assert.equal(terraPageCandidates({}).candidates.length, 24)
  const result = terraPageCandidates({ 'accepted-0': 'Top', 'accepted-1': 'Left', 'rejected-0': 'Top → Left → Right' })
  assert.equal(result.status, 'ready')
  assert.deepEqual(result.candidates, [['Top', 'Left', 'Bottom', 'Right']])
  const scoped = terraPageCandidates({ 'rejected-0': 'Top → Left → Right' }).candidates
  assert.equal(scoped.length, 23)
  assert.ok(scoped.some(order => order[2] === 'Right' && order[0] !== 'Top'))
})

test('every full Terra order can be isolated by three observed accepted positions', () => {
  for (const order of permutations(terraPositions)) {
    const state = Object.fromEntries(order.slice(0, 3).map((position, i) => [`accepted-${i}`, position]))
    assert.deepEqual(terraPageCandidates(state).candidates, [order])
  }
})

test('Terra refuses gaps, duplicates, invalid rejections and contradictory records', () => {
  for (const state of [{ 'accepted-1': 'Left' }, { 'accepted-0': 'Top', 'accepted-1': 'Top' }, { 'accepted-0': 'Top', 'rejected-0': 'Top' }, { 'rejected-0': 'Top → Top' }, { 'rejected-0': 'Diagonal' }]) assert.equal(terraPageCandidates(state).status, 'invalid')
})

test('all fifteen Shi No Numa papers resolve to distinct reviewed photograph cells', () => {
  assert.equal(vanguardCipherPairs.length, 15)
  assert.equal(new Set(vanguardCipherPairs.map(p => `${p.column},${p.row}`)).size, 15)
  for (const pair of vanguardCipherPairs) {
    const result = evaluateVanguard('vanguard-shi-no-numa-cipher', { 'paper-0': pair.paper })
    assert.equal(result.status, 'waiting')
    assert.match(result.lines[0], new RegExp(`column ${pair.column}, row ${pair.row}`))
    assert.match(result.lines[0], /RIGHT-HAND wheel marking/)
    assert.equal(result.images[0].src, '/images/remaining/asset-0063.webp')
  }
  const state = { 'paper-0': '木 · wood', 'paper-1': '日 · sun', 'paper-2': '心 · heart', 'ring-0': 'Outer', 'ring-1': 'Inner', 'ring-2': 'Middle' }
  assert.equal(evaluateVanguard('vanguard-shi-no-numa-cipher', state).status, 'ready')
  assert.equal(evaluateVanguard('vanguard-shi-no-numa-cipher', { ...state, 'paper-0': 'unknown' }).status, 'invalid')
  assert.equal(evaluateVanguard('vanguard-shi-no-numa-cipher', { ...state, 'ring-0': 'Inner' }).status, 'invalid')
})

test('Archon accepts only selected 3/4/5 complete observations and explicit locks', () => {
  for (const count of [3, 4, 5]) {
    const state = { stage: String(count), ...Object.fromEntries(Array.from({ length: count }, (_, i) => [`symbol-${count}-${i}`, `Shape ${i + 1}`])) }
    assert.equal(evaluateVanguard('vanguard-archon-runes', state).status, 'waiting')
    const result = evaluateVanguard('vanguard-archon-runes', { ...state, [`locked-${count}`]: true })
    assert.equal(result.status, 'ready')
    assert.ok(result.lines[0].includes('ground landmark unrecorded'))
    assert.equal(evaluateVanguard('vanguard-archon-runes', { ...state, [`symbol-${count}-0`]: ' ', [`locked-${count}`]: true }).status, 'waiting')
  }
  assert.equal(evaluateVanguard('vanguard-archon-runes', { stage: '6' }).status, 'invalid')
})

test('Archon reset contracts archive locked observations and isolate other stage fields', () => {
  const t = vanguardTools.find(t => t.id === 'vanguard-archon-runes')
  const declared = new Set(t.fields.map(f => f.id))
  for (const count of [3, 4, 5]) {
    const scope = t.resetScopes.find(s => s.id === `attempt-${count}`)
    assert.deepEqual(scope.preserveWhen, { field: `locked-${count}`, value: true })
    assert.ok(scope.fields.every(id => id === `locked-${count}` || id.startsWith(`symbol-${count}-`)))
    assert.ok(!scope.fields.some(id => id.startsWith('landmark-')))
    for (const [from, to] of Object.entries(scope.preserveSnapshot)) {
      assert.ok(declared.has(from) && declared.has(to))
      assert.equal(to, `previous-${from}`)
    }
  }
})

test('Archon actual reset archives a locked attempt, keeps ground notes and protects previous observation', () => {
  const t = vanguardTools.find(t => t.id === 'vanguard-archon-runes')
  const scope = t.resetScopes.find(s => s.id === 'attempt-3')
  const state = { stage: '3', 'symbol-3-0': 'Split crown', 'symbol-3-1': 'Fork', 'symbol-3-2': 'Circle', 'landmark-3-0': 'Beside boxcar', 'locked-3': true, 'symbol-4-0': 'Other stage', 'screen-0': 'Red' }
  assert.equal(changeObservation(t, state, 'symbol-3-0', 'Changed'), state)
  const next = clearScope(t, state, scope)
  assert.equal(next['previous-symbol-3-0'], 'Split crown')
  assert.equal(next['previous-landmark-3-0'], 'Beside boxcar')
  assert.equal(next['symbol-3-0'], '')
  assert.equal(next['landmark-3-0'], 'Beside boxcar')
  assert.equal(next['locked-3'], false)
  assert.equal(next['symbol-4-0'], 'Other stage')
  assert.equal(next['screen-0'], 'Red')
  assert.equal(clearScope(t, next, scope)['previous-symbol-3-0'], 'Split crown')
  assert.ok(groupVisible(t.groups.find(g => g.id === 'stage-3'), next))
  assert.ok(!groupVisible(t.groups.find(g => g.id === 'stage-4'), next))
})

test('evaluators never consume another game’s tool state', () => {
  assert.equal(evaluateAW('vanguard-terra-pages', layout), null)
  assert.equal(evaluateVanguard('aw-descent-simon', { stage: '3' }), null)
})

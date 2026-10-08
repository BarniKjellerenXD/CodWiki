import test from 'node:test'
import assert from 'node:assert/strict'
import { ww2Guides } from '../shared/ww2-guides.mjs'
import { ww2Tools } from '../shared/ww2-tools.mjs'
import { ww2References as refs } from '../shared/ww2-references.mjs'
import { evaluateWW2, rotationSolution, statueMatrix, decodeWW2Digits } from '../app/utils/ww2.mjs'
import { changeObservation, groupVisible } from '../app/utils/remainingUi.mjs'

const mod = value => (value % 4 + 4) % 4
const digits = (code, n) => Array.from({ length: n }, (_, index) => Math.floor(code / 4 ** (n - index - 1)) % 4)
const apply = (state, matrix, actions) => state.map((value, row) => mod(value + matrix[row].reduce((total, weight, col) => total + weight * actions[col], 0)))

test('statues use the affected row’s rate and correct B2/C2 route', () => {
  assert.deepEqual(statueMatrix(2), [[1, 1, 0, 0], [2, 2, 2, 0], [0, 1, 1, 1], [0, 0, 1, 1]])
  assert.deepEqual(rotationSolution([0, 2, 2], statueMatrix(1), [2, 2, 2]), { actions: [0, 2, 2], total: 4 })
  const result = evaluateWW2('ww2-shadowed-statues', { wall: '1', 'statue-0': '0', 'statue-1': '2', 'statue-2': '2' })
  assert.deepEqual(result.lines, ['Shoot statue B 2 times.', 'Shoot statue C 2 times.'])
  assert.equal(evaluateWW2('ww2-shadowed-statues', { wall: '2', 'statue-0': '2', 'statue-1': '1', 'statue-2': '2', 'statue-3': '2' }).status, 'invalid')
})

test('all 832 statue states return an exact minimum route or a proven unreachable state', () => {
  let checked = 0
  let unreachable = 0
  for (let wall = 1; wall <= 4; wall++) {
    const matrix = statueMatrix(wall)
    const n = matrix.length
    const reachable = new Map()
    // Build reverse reachability from the target, independent of input-state search.
    for (let code = 0; code < 4 ** n; code++) {
      const actions = digits(code, n)
      const state = matrix.map((row, index) => mod(2 - row.reduce((sum, weight, col) => sum + weight * actions[col], 0)))
      const cost = actions.reduce((sum, value) => sum + value, 0)
      const key = state.join(',')
      if (!reachable.has(key) || cost < reachable.get(key)) reachable.set(key, cost)
    }
    for (let code = 0; code < 4 ** n; code++) {
      const state = digits(code, n)
      const solution = rotationSolution(state, matrix, Array(n).fill(2))
      const cost = reachable.get(state.join(','))
      if (cost === undefined) {
        assert.equal(solution, null)
        unreachable++
      } else {
        assert.deepEqual(apply(state, matrix, solution.actions), Array(n).fill(2))
        assert.equal(solution.total, cost)
        assert(solution.actions.every(value => value >= 0 && value <= 3))
      }
      checked++
    }
  }
  assert.equal(checked, 832)
  assert(unreachable > 0)
})

test('all 256 base Hammer states are solvable, with the correct A1 fixture', () => {
  const matrix = refs.frozenHammer.matrix.map(row => row.map(weight => -weight))
  assert.deepEqual(rotationSolution([2, 1, 0, 0], matrix, [0, 0, 0, 0]), { actions: [1, 0, 0, 0], total: 1 })
  const costs = new Map()
  for (let code = 0; code < 256; code++) {
    const actions = digits(code, 4)
    const state = matrix.map(row => mod(-row.reduce((sum, weight, col) => sum + weight * actions[col], 0)))
    const cost = actions.reduce((sum, value) => sum + value, 0)
    const key = state.join(',')
    if (!costs.has(key) || cost < costs.get(key)) costs.set(key, cost)
  }
  assert.equal(costs.size, 256)
  for (let code = 0; code < 256; code++) {
    const state = digits(code, 4)
    const solution = rotationSolution(state, matrix, [0, 0, 0, 0])
    assert(solution)
    assert.deepEqual(apply(state, matrix, solution.actions), [0, 0, 0, 0])
    assert.equal(solution.total, costs.get(state.join(',')))
  }
})

test('radio lookup retains decimal zeroes, all chart rows, and unknown states', () => {
  const result = evaluateWW2('ww2-shadowed-radio', { region: 'Barnim', series: 'TX', model: '3' })
  assert.equal(result.status, 'ready')
  assert.equal(result.lines[0], 'Left dial: 26.5')
  assert.equal(result.lines[1], 'Right dial: 50.1')
  for (const region of refs.shadowedRadio.regions) {
    for (const series of refs.shadowedRadio.series) {
      for (const model of refs.shadowedRadio.modelNumbers) {
        const answer = evaluateWW2('ww2-shadowed-radio', { region: region.name, series, model })
        assert.equal(answer.status, 'ready')
        assert.match(answer.lines[0], /\d+\.\d$/)
        assert.match(answer.lines[1], /\d+\.\d$/)
      }
    }
  }
  assert.equal(evaluateWW2('ww2-shadowed-radio', {}).status, 'waiting')
  assert.equal(evaluateWW2('ww2-shadowed-radio', { region: 'Unknown', series: 'TX', model: '3' }).status, 'invalid')
})

test('axe Morse preserves zeroes and rejects invalid/missing digit positions', () => {
  assert.equal(decodeWW2Digits('----- / .----').lines[0], 'Map clue: 01')
  assert.equal(decodeWW2Digits('...').status, 'waiting')
  assert.equal(decodeWW2Digits('...... -----').status, 'invalid')
  assert.equal(decodeWW2Digits('----- .-..-').status, 'invalid')
  assert.equal(decodeWW2Digits('----- .---- ..---').status, 'invalid')
})

test('artillery fuse keeps signed two-digit strings separate from ship examples', () => {
  const state = Object.fromEntries(['-', '0', '2', '+', '4', '0'].map((value, index) => [`dial-${index}`, value]))
  const result = evaluateWW2('ww2-darkest-artillery', state)
  assert.equal(result.lines[0], 'R.I.P. Saw fuse coordinates: -02 / +40')
  assert.equal(evaluateWW2('ww2-darkest-artillery', { ...state, stage: 'ships' }).status, 'waiting')
  assert.equal(evaluateWW2('ww2-darkest-artillery', { stage: 'ships', ship: '1' }).lines[0], 'Chart example 1: +07 / -50')
})

test('safe counts require explicit confirmation, allow repeated sites and retain alternating directions', () => {
  const state = Object.fromEntries(['1', '2', '3', '4'].map((value, index) => [`count-${index}`, value]))
  assert.equal(evaluateWW2('ww2-shadowed-safe', state).status, 'waiting')
  for (let index = 0; index < 4; index++) state[`confirmed-${index}`] = true
  state['location-0'] = state['location-1'] = 'Church drop-pod door'
  const result = evaluateWW2('ww2-shadowed-safe', state)
  assert.equal(result.status, 'ready')
  assert.match(result.lines[1], /Clockwise → 1/)
  assert.match(result.lines[2], /Counterclockwise → 2/)
  assert.match(result.lines[3], /Clockwise → 3/)
  assert.match(result.lines[4], /Counterclockwise → 4/)
})

test('shield history permits repeated patterns but forbids a repeated pool', () => {
  const state = { 'pool-0': 'Morgue', 'pool-1': 'Overlook', 'pool-2': 'Ice Caves', 'pattern-0': '2', 'pattern-1': '2', 'pattern-2': '7', 'confirmed-0': true, 'confirmed-1': true, 'confirmed-2': true }
  const result = evaluateWW2('ww2-frozen-shield', state)
  assert.equal(result.status, 'ready')
  assert.match(result.lines[0], /^1\. Morgue → pattern 2/)
  assert.match(result.lines[1], /^2\. Overlook → pattern 2/)
  assert.equal(evaluateWW2('ww2-frozen-shield', { ...state, 'pool-2': 'Morgue' }).status, 'invalid')
})

test('rune stages do not inherit old codes and holes cannot collapse order', () => {
  const state = { stage: '1', 'stage-1-0': 'Fork', 'stage-1-1': 'Loop', 'stage-1-confirmed': true }
  assert.equal(evaluateWW2('ww2-tortured-runes', state).status, 'ready')
  assert.equal(evaluateWW2('ww2-tortured-runes', { ...state, stage: '2' }).status, 'waiting')
  assert.equal(evaluateWW2('ww2-tortured-runes', { ...state, 'stage-1-1': '', 'stage-1-2': 'Triangle' }).status, 'invalid')
})

test('Hangman shows all fitting words rather than choosing a first candidate', () => {
  assert.equal(evaluateWW2('ww2-shadowed-hangman', { mask: 'R_A_ER' }).lines[0], 'REAPER → Insta-Kill')
  assert.equal(evaluateWW2('ww2-shadowed-hangman', { mask: '______' }).status, 'ambiguous')
  assert.equal(evaluateWW2('ww2-shadowed-hangman', { mask: 'R_A_ER', rejected: 'R' }).status, 'invalid')
})

test('all 11 destinations and 12 tools have authored content and valid owner phases', () => {
  assert.equal(ww2Guides.length, 11)
  assert.equal(ww2Tools.length, 12)
  assert.equal(new Set(ww2Guides.map(guide => guide.id)).size, 11)
  const byGuide = new Map(ww2Guides.map(guide => [guide.id, guide]))
  for (const guide of ww2Guides) {
    const phases = [...guide.phases, ...guide.sidePhases]
    assert(guide.sources.length)
    assert(phases.every(phase => phase.steps.length && phase.steps.every(step => step.text.length > 25 && step.quick)))
    assert.equal(new Set(phases.map(phase => phase.id)).size, phases.length)
    const steps = phases.flatMap(phase => phase.steps)
    assert.equal(new Set(steps.map(step => step.id)).size, steps.length)
  }
  for (const tool of ww2Tools) {
    assert(byGuide.has(tool.map))
    assert([...byGuide.get(tool.map).phases, ...byGuide.get(tool.map).sidePhases].some(phase => phase.id === tool.guidePhase))
    assert.equal(new Set(tool.fields.map(field => field.id)).size, tool.fields.length)
    assert.equal(evaluateWW2(tool.id, {}, tool).status, 'waiting')
  }
})

test('Final Reich branch requirements and chapter/survival schedules stay distinct', () => {
  const reich = ww2Guides.find(guide => guide.id === 'ww2-the-final-reich')
  assert.deepEqual(reich.branches.map(branch => branch.id), ['casual', 'hardcore'])
  for (const id of ['bloodthirst', 'reaper', 'hurricane', 'midnight', 'red-talon', 'keepsakes', 'second-voices', 'rabenherz', 'hardcore-hilt', 'escort-klaus']) assert.deepEqual(reich.phases.find(phase => phase.id === id).branches, ['hardcore'])
  assert.deepEqual(reich.phases.find(phase => phase.id === 'casual-hilt').branches, ['casual'])
  for (const id of ['ww2-into-the-storm', 'ww2-across-the-depths', 'ww2-beneath-the-ice']) assert.match(ww2Guides.find(guide => guide.id === id).phases[0].steps[1].quick, /1 \/ 4 \/ 7/)
  for (const id of ['ww2-bodega-cervantes', 'ww2-uss-mount-olympus', 'ww2-altar-of-blood']) assert.match(ww2Guides.find(guide => guide.id === id).phases[1].steps[0].quick, /1 \/ 5 \/ 10/)
})

test('editing confirmed observations requires reconfirmation without destroying history', () => {
  const safe = ww2Tools.find(tool => tool.id === 'ww2-shadowed-safe')
  const state = { 'count-0': '4', 'confirmed-0': true, 'count-1': '7', 'confirmed-1': true }
  const edited = changeObservation(safe, state, 'count-0', '5')
  assert.equal(edited['count-0'], '5')
  assert.equal(edited['confirmed-0'], false)
  assert.equal(edited['count-1'], '7')
  assert.equal(edited['confirmed-1'], true)
  const statues = ww2Tools.find(tool => tool.id === 'ww2-shadowed-statues')
  const changedWall = changeObservation(statues, { wall: '1', 'statue-0': '0', 'statue-1': '2', 'statue-2': '2' }, 'wall', '2')
  assert.equal(evaluateWW2(statues.id, changedWall).status, 'waiting')
  const runes = ww2Tools.find(tool => tool.id === 'ww2-tortured-runes')
  const stageOne = { stage: '1', 'stage-1-0': 'Fork', 'stage-1-confirmed': true }
  const nextStage = changeObservation(runes, stageOne, 'stage', '2')
  assert.equal(nextStage['stage-1-confirmed'], true)
  assert.equal(evaluateWW2(runes.id, nextStage).status, 'waiting')
  assert.equal(groupVisible(runes.groups.find(group => group.id === 'stage-1'), nextStage), false)
  assert.equal(groupVisible(runes.groups.find(group => group.id === 'stage-2'), nextStage), true)
})

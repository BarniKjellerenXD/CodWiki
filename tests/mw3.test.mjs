import test from 'node:test'
import assert from 'node:assert/strict'
import data from '../app/data/remainingReferences.json' with { type: 'json' }
import { evaluateMW3 } from '../app/utils/mw3.mjs'
import { mw3Tools } from '../shared/mw3-tools.mjs'
const evaluate = (id, state) => evaluateMW3(id, state, mw3Tools.find(t => t.id === id))
test('all 24 photographed triplets reverse to distinct marker identities, including repeated grids', () => {
  assert.equal(data.mwRunePortals.destinations.length, 24)
  for (const destination of data.mwRunePortals.destinations) {
    const result = evaluate('mw3-rune-portals', { mode: 'Read code', ...Object.fromEntries(destination.glyphIds.map((g, i) => [`glyph-${i}`, g])) })
    assert.equal(result.destination, destination.id)
    assert.equal(result.images.length, 2)
  }
  assert.equal(evaluate('mw3-rune-portals', { mode: 'Read code', 'glyph-0': 'mwz-glyph-01' }).status, 'waiting')
  assert.equal(evaluate('mw3-rune-portals', { mode: 'Read code', 'glyph-0': 'mwz-glyph-01', 'glyph-1': 'mwz-glyph-01', 'glyph-2': 'mwz-glyph-01' }).status, 'invalid')
})
test('Red Worm readiness requires distinct observed drives, carried state and actual arena', () => {
  const state = Object.fromEntries(['Alpha', 'Bravo', 'Charlie', 'Delta'].flatMap((d, i) => [[`drive-${i}`, d], [`photo-${i}`, data.redWorm.candidateLocations[i].id], [`carried-${i}`, true]]))
  assert.equal(evaluate('mw3-red-worm-usbs', state).status, 'waiting')
  Object.assign(state, { arena: 'north paired caches', caches: true })
  assert.equal(evaluate('mw3-red-worm-usbs', state).status, 'ready')
  assert.equal(evaluate('mw3-red-worm-usbs', { ...state, 'drive-3': 'Alpha' }).status, 'invalid')
  assert.equal(evaluate('mw3-red-worm-usbs', { ...state, 'carried-3': false }).status, 'waiting')
})
test('reference distinguishes story, unlock, ordinary and Elder, and blueprint eligibility', () => {
  for (const rift of data.mwRifts) for (const goal of ['Story', 'First portal unlock', 'Acquisitions', 'Schematics']) {
    const result = evaluate('mw3-dark-aether-reference', { season: String(rift.season), goal })
    assert.equal(result.status, 'ready')
    assert.ok(result.links[0].href.startsWith(`/guides/${rift.mapId}?branch=`))
    if (goal === 'Schematics') assert.match(result.lines.join(' '), /15 minutes/)
    if (goal === 'Acquisitions') assert.match(result.lines.join(' '), /30 minutes/)
  }
  assert.match(evaluate('mw3-dark-aether-reference', { goal: 'Blueprint', season: '5' }).lines.join(' '), /Elder only/)
  assert.match(evaluate('mw3-dark-aether-reference', { goal: 'Blueprint', season: '3' }).lines.join(' '), /ordinary or Elder/)
  assert.equal(evaluate('mw3-dark-aether-reference', { goal: 'Blueprint', season: '1' }).status, 'invalid')
  assert.match(evaluate('mw3-dark-aether-reference', { goal: 'Schematics', season: '1', reward: 'Stash Increase' }).links[0].href, /season-5/)
})
test('Union records preserve two independent ordered observations', () => {
  const state = Object.fromEntries(['a', 'b'].flatMap(c => [0, 1, 2].map(i => [`${c}-rune-${i}`, `${c}${i}`])))
  assert.equal(evaluate('mw3-union-runes', { ...state, 'a-done': true }).status, 'waiting')
  const result = evaluate('mw3-union-runes', { ...state, 'a-done': true, 'b-done': true })
  assert.equal(result.status, 'ready')
  assert.match(result.lines[0], /a0.*a1.*a2/)
  assert.match(result.lines[1], /b0.*b1.*b2/)
  assert.equal(evaluate('mw3-union-runes', { 'a-done': true }).status, 'invalid')
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { changeObservation, clearScope, fieldLocked, groupVisible } from '../app/utils/remainingUi.mjs'
import { visibleGuidePhases, branchForGuideAnchor } from '../app/utils/guideBranches.mjs'
import { normalizeMwzMilestones, readMwzMilestones } from '../app/utils/mwzMilestones.mjs'
test('changing puzzle context invalidates observations, while editing a note does not', () => {
  const definition = { fields: [{ id: 'filter' }, { id: 'code' }, { id: 'made', type: 'check' }, { id: 'note' }], invalidates: [{ field: 'filter', fields: ['code', 'made'] }] }
  const state = { filter: 'Red', code: '09', made: true, note: 'safe' }
  assert.deepEqual(changeObservation(definition, state, 'filter', 'Blue'), { filter: 'Blue', code: '', made: false, note: 'safe' })
  assert.equal(changeObservation(definition, state, 'filter', 'Red').code, '09')
  assert.equal(changeObservation(definition, state, 'note', 'changed').made, true)
  assert.equal(changeObservation(definition, state, 'unknown', 'bad'), state)
})
test('archive a locked attempt before clearing it; repeated empty resets preserve archive', () => {
  const definition = { fields: [{ id: 'symbol' }, { id: 'previous' }, { id: 'locked', type: 'check' }, { id: 'landmark' }] }
  const scope = { fields: ['symbol', 'locked'], preserveWhen: { field: 'locked', value: true }, preserveSnapshot: { symbol: 'previous' } }
  const first = clearScope(definition, { symbol: 'crescent', previous: 'older', locked: true, landmark: 'gate' }, scope)
  assert.deepEqual(first, { symbol: '', previous: 'crescent', locked: false, landmark: 'gate' })
  assert.deepEqual(clearScope(definition, first, scope), first)
  assert.equal(fieldLocked({ lockedBy: 'locked' }, { locked: true }), true)
  assert.equal(groupVisible({ showWhen: { field: 'stage', value: '3' } }, { stage: '4' }), false)
})
test('branch navigation reveals the matching route without changing completion data', () => {
  const phases = [{ id: 'setup', steps: [] }, { id: 'ritual', detail: 'details-ritual', branches: ['unlock'], steps: [{ id: 'offer' }] }, { id: 'contracts', branches: ['ordinary', 'elder'], steps: [] }]
  assert.deepEqual(visibleGuidePhases(phases, 'elder').map(p => p.id), ['setup', 'contracts'])
  assert.equal(branchForGuideAnchor(phases, 'guide-step-offer', 'elder'), 'unlock')
  assert.equal(branchForGuideAnchor(phases, 'quick-contracts', 'elder'), 'elder')
})
test('milestones accept explicit booleans in their own versioned record', () => {
  assert.equal(normalizeMwzMilestones({ 'portal-1': true, 'story-2': 'true', intruder: true })['portal-1'], true)
  assert.equal(normalizeMwzMilestones({ 'story-2': 'true' })['story-2'], false)
  assert.equal('intruder' in normalizeMwzMilestones({ intruder: true }), false)
  assert.equal(readMwzMilestones('{bad')['portal-1'], false)
  assert.equal(readMwzMilestones(JSON.stringify({ version: 1, observations: { 'portal-1': true } }))['portal-1'], true)
  assert.equal(readMwzMilestones(JSON.stringify({ version: 2, observations: { 'portal-1': true } }))['portal-1'], false)
})

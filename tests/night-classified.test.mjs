import test from 'node:test'
import assert from 'node:assert/strict'
import { solveZodiac, solveStake, skadiResult, updateSkadiCode } from '../app/utils/nightClassified.mjs'
import { guides, tools } from '../shared/bo4-night-classified.mjs'

const zodiac={ 'sign-0':'Aries','sign-1':'Leo','sign-2':'Gemini','count-0-0':'0','count-0-1':'1','count-0-2':'0','count-1-0':'3','count-1-1':'4','count-1-2':'0','count-2-0':'1','count-2-1':'2','count-2-2':'0' }
test('zodiac distinguishes unread positions from confirmed zero and orders sums',()=>{
  assert.equal(solveZodiac({...zodiac,'count-0-0':''}).status,'waiting')
  assert.deepEqual(solveZodiac(zodiac).entries.map(x=>x.sign),['Aries','Gemini','Leo'])
  assert.deepEqual(solveZodiac(zodiac).entries.map(x=>x.total),[1,3,7])
})
test('zodiac refuses conflicting observations and tied totals',()=>{
  assert.equal(solveZodiac({...zodiac,'sign-2':'Aries'}).status,'invalid')
  assert.equal(solveZodiac({...zodiac,'count-2-1':'0'}).status,'invalid')
  assert.equal(solveZodiac({...zodiac,'count-2-1':'-1'}).status,'invalid')
})
test('stake maps tree sequence to observed stone locations, not fixed locations',()=>{
  const state={'tree-0':'up','tree-1':'down','tree-2':'up-bar','tree-3':'down-bar','stone-0':'down-bar','stone-1':'up','stone-2':'down','stone-3':'up-bar'}
  assert.deepEqual(solveStake(state).entries.map(x=>x.location),['Behind Vapr','Fountain by perk','Railing by barrier','Gazebo'])
  assert.equal(solveStake({...state,'stone-3':'down-bar'}).status,'invalid')
  assert.equal(solveStake({...state,'tree-2':''}).status,'waiting')
})
test('Skadi preserves zeros and never confuses collection with accepted input',()=>{
  const state={'slot-0':'0042','slot-1':'1000','slot-2':'9876','slot-3':'0000'}
  assert.equal(skadiResult(state).entries[0].code,'0042')
  assert.match(skadiResult(state).message,/Next: enter 0042/)
  assert.equal(skadiResult({...state,'accepted-1':true}).status,'invalid')
  assert.equal(skadiResult({...state,'slot-0':'42'}).status,'invalid')
  const accepted={...state,...Object.fromEntries([0,1,2,3].map(i=>[`accepted-${i}`,true])),rounds:'3'}
  assert.match(skadiResult(accepted).message,/collect the case/)
  const changed=updateSkadiCode(accepted,1,'0007')
  assert.equal(changed['accepted-0'],true)
  assert.equal(changed['accepted-1'],false)
  assert.equal(changed['accepted-3'],false)
  assert.equal(changed.rounds,'0')
})
test('all specialized tools have declared persisted observation fields',()=>{
  assert.equal(guides.length,2)
  const definitions=Object.fromEntries(tools.map(tool=>[tool.id,tool]))
  assert.ok(definitions['bo4-dead-of-the-night-alistair'].fields.some(field=>field.id==='shape-blue'))
  assert.ok(definitions['bo4-classified-codes'].fields.some(field=>field.id==='rounds'))
  for(const guide of guides){
    const ids=guide.phases.flatMap(phase=>phase.steps.map(step=>step.id))
    assert.equal(new Set(ids).size,ids.length)
    for(const phase of [...guide.phases,...guide.sidePhases]) for(const tool of phase.tools)assert.ok(definitions[tool])
  }
})

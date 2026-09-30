import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { bloodOfTheDead } from '../shared/blood-of-the-dead.mjs'
import { evaluateTool, normalizeTool } from '../app/utils/expansionTools.mjs'

const observed = {'source-0':'1','target-0':'F','source-1':'3','target-1':'B','source-2':'6','target-2':'D'}
test('Power House requires observed replacements and does not infer a fixed translation', () => {
  assert.equal(evaluateTool('bo4-blood-powerhouse', {'source-0':'1','source-1':'2','source-2':'3'}).status,'waiting')
  const result=evaluateTool('bo4-blood-powerhouse',observed)
  assert.equal(result.status,'ready')
  assert.deepEqual(result.lines, ['1 → F — Spirit Blast at this lever','3 → B — Spirit Blast at this lever','6 → D — Spirit Blast at this lever'])
  assert.equal(evaluateTool('bo4-blood-powerhouse',{...observed,'done-1':true}).message,'1 / 3 levers confirmed')
  assert.equal(evaluateTool('bo4-blood-powerhouse',{...observed,'source-2':'1'}).status,'invalid')
  assert.equal(evaluateTool('bo4-blood-powerhouse',{...observed,'target-2':'F'}).status,'invalid')
  assert.equal(evaluateTool('bo4-blood-powerhouse',{...observed,'target-2':'Z'}).status,'waiting')
})

test('existing Power House notes survive alongside the new symbol slots', () => {
  const old={'generator-0':'arch','number-0':'1','monitor-0':'circle with arrows'}
  const next=normalizeTool('bo4-blood-powerhouse',{...old,...observed,'slot-0':'6','panel-5':'near door'})
  for(const [key,value] of Object.entries(old)) assert.equal(next[key],value)
  assert.equal(next['slot-0'],'6')
  assert.equal(next['panel-5'],'near door')
  assert.equal(evaluateTool('bo4-blood-powerhouse',old).status,'waiting')
})

test('trial progress counts stones only and preserves leading zeros in book codes', () => {
  const state={code:'007',assignment:'Docks','check-0':true}
  assert.equal(evaluateTool('bo4-blood-trials',state).message,'1 / 5 stones collected')
  assert.equal(evaluateTool('bo4-blood-trials',state).lines[0],'Citadel code: 007')
  assert.equal(evaluateTool('bo4-blood-trials',{...state,code:'7'}).status,'invalid')
  assert.equal(evaluateTool('bo4-blood-trials',{...state,code:'xyz'}).status,'invalid')
  assert.equal(evaluateTool('bo4-blood-trials',{...state,...Object.fromEntries([0,1,2,3,4].map(i=>[`check-${i}`,true]))}).message,'5 / 5 stones collected')
})

test('guide retains saved quest IDs, keeps side projects out of the main run and ships all images', () => {
  const phases=bloodOfTheDead.phases
  for(const name of ['setup','birds','morse','challenges','finale']) {
    const phase=phases.find(p=>p.id===name)
    for(let i=1;i<=3;i++) assert.ok(phase.steps.some(s=>s.id===`${name}-${i}`))
  }
  const all=[...phases,...bloodOfTheDead.sidePhases]
  const ids=all.flatMap(p=>p.steps.map(s=>s.id))
  assert.equal(new Set(ids).size,ids.length)
  const quick=JSON.parse(fs.readFileSync('app/data/quickQuests.json'))[bloodOfTheDead.id]
  for(const side of bloodOfTheDead.sidePhases) assert.ok(!quick.some(p=>p.id===side.id))
  const paths=[bloodOfTheDead.image,...all.flatMap(p=>p.steps.flatMap(s=>(s.images||[]).map(i=>i.src)))]
  for(const path of paths) assert.ok(fs.statSync(`public${path}`).size>1000,path)
  assert.ok(fs.statSync('public/images/blood-of-the-dead/powerhouse-symbols.png').size>1000)
  const guide=fs.readFileSync(`app/components/guide/${bloodOfTheDead.id}.vue`,'utf8')
  for(const phase of all) assert.ok(guide.includes(`id="details-${phase.id}"`))
})

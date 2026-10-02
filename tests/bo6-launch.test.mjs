import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {terminusSymbols,terminusLabResult,straussSetting,straussRoute,aetherellaFigures} from '../app/utils/bo6Launch.mjs'
import {guides,tools} from '../shared/bo6-launch.mjs'

test('Terminus does not fabricate a code before all observations exist',()=>{
 for(const input of [{},{x:'0'},{x:'0',y:'11'},{x:'',y:'11',z:'20'}]) assert.equal(terminusLabResult(input).status,'waiting')
 assert.equal(terminusLabResult({x:'1',y:'10',z:'20'}).status,'invalid')
 assert.equal(terminusLabResult({x:0,y:10,z:20}).status,'invalid')
})
test('Terminus preserves zero as input and uses absolute value only for the final entry',()=>{
 assert.deepEqual(terminusLabResult({x:'0',y:'11',z:'20'}).code,['11','46','31'])
 assert.deepEqual(terminusLabResult({x:'22',y:'0',z:'10'}).code,['55','15','12'])
 assert.deepEqual(terminusLabResult({x:'20',y:'10',z:'0'}).code,['51','05','10'])
 const negative=terminusLabResult({x:'11',y:'0',z:'0'})
 assert.equal(negative.status,'invalid')
 assert.deepEqual(negative.values,[])
})
test('every reference-symbol combination has a bounded result or explicit conflicting-input state',()=>{
 let ready=0,invalid=0
 for(const x of terminusSymbols) for(const y of terminusSymbols) for(const z of terminusSymbols){
  const result=terminusLabResult({x:x.value,y:y.value,z:z.value})
  if(result.status==='invalid'){assert.equal(y.value,'0');assert.equal(z.value,'0');invalid++;continue}
  ready++;assert.equal(result.status,'ready');assert.equal(result.code.length,3)
  assert.ok(result.code.every(value=>/^\d{2}$/.test(value)))
  assert.ok(result.values.every(value=>value>=0&&value<=99))
 }
 assert.equal(ready,210);assert.equal(invalid,6)
})
test('Strauss derives each lamp from its local reading, independent of legacy confirmations',()=>{
 assert.equal(straussSetting('red'),'green');assert.equal(straussSetting('green'),'red');assert.equal(straussSetting('yellow'),'yellow');assert.equal(straussSetting(''),null)
 const route=straussRoute({hill:'red','hill-done':true,'yard-done':true,roof:'yellow'})
 assert.equal(route[0].target,'green')
 assert.equal(route[1].target,null)
 assert.equal(route[2].target,'yellow')
 assert.deepEqual(route,straussRoute({hill:'red',roof:'yellow'}))
})
test('Aetherella guide preserves all nine photographed sightlines after retiring the tracker',()=>{
 assert.equal(aetherellaFigures.length,9)
 assert.equal(new Set(aetherellaFigures.map(p=>p.id)).size,9)
 const phase=guides.find(g=>g.id==='bo6-liberty-falls').sidePhases.find(p=>p.id==='aetherella')
 assert.ok(phase.steps.some(s=>s.id==='aetherella-route'))
 assert.deepEqual(phase.tools,[])
 for(const figure of aetherellaFigures){
  const step=phase.steps.find(s=>s.id===`aetherella-${figure.id}`)
  assert.ok(step.text.includes(figure.location),figure.id)
  assert.equal(step.images[0].src,figure.image)
  assert.ok(step.images[0].alt.includes(figure.name))
 }
 assert.ok(!tools.some(t=>['bo6-liberty-aetherella','bo6-liberty-vault','bo6-terminus-nathan'].includes(t.id)))
})
test('launch guides have complete authored structure and resolvable tools and illustrated landmarks',()=>{
 const toolIds=new Set(tools.map(t=>t.id))
 for(const guide of guides){
  const phases=[...guide.phases,...guide.sidePhases]
  assert.equal(new Set(phases.map(p=>p.id)).size,phases.length)
  const steps=phases.flatMap(p=>p.steps)
  assert.equal(new Set(steps.map(s=>s.id)).size,steps.length)
  assert.ok(steps.length>=30)
  for(const group of ['Key Features','Main Quest','Side Quests']) assert.equal(phases.filter(p=>p.group===group).length,1)
  for(const phase of phases){assert.ok(Array.isArray(phase.tools));for(const id of phase.tools)assert.ok(toolIds.has(id));for(const step of phase.steps)assert.ok(step.quick&&step.text)}
  const images=[guide.image,...steps.flatMap(s=>(s.images||[]).map(i=>i.src))]
  for(const src of images) assert.ok(fs.existsSync(path.join('public',src)),src)
 }
 for(const item of aetherellaFigures)assert.ok(fs.existsSync(path.join('public',item.image)),item.image)
 for(const tool of tools)assert.equal(new Set(tool.fields.map(f=>f.id)).size,tool.fields.length)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {bloodSimonPanels,simonRound,simonSequence,recordSimonFlash,clearSimonSequence,removeSimonFlash,steadySimonPanels,toggleSteadySimonPanel} from '../app/utils/bloodSimon.mjs'
import {normalizeTool} from '../app/utils/expansionTools.mjs'

test('five independent Simon rounds accept repeated panels and enforce the observed round length',()=>{
  for(let round=1;round<=5;round++) {
    let state=clearSimonSequence({'source-0':'2','target-0':'E','simon-steady-C':true},round)
    const input=['A','C','A','A','F'].slice(0,round)
    for(const panel of input)state=recordSimonFlash(state,panel)
    assert.deepEqual(simonSequence(state).map(p=>p.id),input)
    assert.equal(recordSimonFlash(state,'D'),state)
    assert.equal(recordSimonFlash(state,'unknown'),state)
    const removed=removeSimonFlash(state)
    assert.deepEqual(simonSequence(removed).map(p=>p.id),input.slice(0,-1))
    const cleared=clearSimonSequence(state,Math.min(5,round+1))
    assert.deepEqual(simonSequence(cleared),[])
    assert.equal(cleared['source-0'],'2');assert.equal(cleared['target-0'],'E');assert.equal(cleared['simon-steady-C'],true)
  }
  assert.equal(simonRound({'simon-round':'8'}),1)
  assert.deepEqual(simonSequence({'simon-round':'3','simon-map-0':'A','simon-map-2':'C'}).map(p=>p.id),['A'])
})

test('editing a sparse saved sequence cannot resurrect later stale flashes',()=>{
  const sparse={'simon-round':'3','simon-map-0':'A','simon-map-2':'F','source-0':'2'}
  const appended=recordSimonFlash(sparse,'B')
  assert.deepEqual(simonSequence(appended).map(p=>p.id),['A','B'])
  assert.equal(appended['simon-map-2'],'')
  assert.equal(appended['source-0'],'2')
  const removed=removeSimonFlash(sparse)
  assert.deepEqual(simonSequence(removed),[])
  assert.equal(removed['simon-map-2'],'')
  assert.deepEqual(simonSequence(recordSimonFlash(removed,'D')).map(p=>p.id),['D'])
})

test('steady lights are independent observations limited to three distinct positions',()=>{
  let state={'simon-round':'2','simon-map-0':'B','slot-0':'4','panel-3':'My old label'}
  for(const id of ['A','C','F'])state=toggleSteadySimonPanel(state,id)
  assert.deepEqual(steadySimonPanels(state).map(p=>p.id),['A','C','F'])
  assert.equal(toggleSteadySimonPanel(state,'B'),state)
  state=toggleSteadySimonPanel(state,'C');state=toggleSteadySimonPanel(state,'D')
  assert.deepEqual(steadySimonPanels(state).map(p=>p.id),['A','D','F'])
  const saved=normalizeTool('bo4-blood-powerhouse',state)
  assert.equal(saved['slot-0'],'4');assert.equal(saved['panel-3'],'My old label')
  assert.equal(saved['simon-map-0'],'B');assert.equal(saved['simon-steady-F'],true)
  assert.deepEqual(simonSequence(normalizeTool('bo4-blood-powerhouse',{'slot-0':'4','panel-3':'My old label'})),[])
  assert.deepEqual(normalizeTool('bo4-blood-powerhouse',JSON.parse(JSON.stringify(saved))),saved)
})

test('every spatial marker has a real local reference photo and fits the schematic',()=>{
  assert.equal(new Set(bloodSimonPanels.map(p=>p.id)).size,6)
  for(const panel of bloodSimonPanels) {
    assert.ok(panel.x>0&&panel.x<100&&panel.y>0&&panel.y<100)
    const image=fs.readFileSync(`public${panel.image}`)
    assert.equal(image.subarray(8,12).toString(),'WEBP')
  }
})

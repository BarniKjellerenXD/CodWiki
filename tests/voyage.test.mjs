import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { clockTargets, movesFromTwelve, clockLocations, outletLocations, voyagePlanets } from '../app/utils/voyage.mjs'
import { evaluateTool, normalizeTool } from '../app/utils/expansionTools.mjs'
import { voyage } from '../shared/bo4-voyage.mjs'

test('clock targets cover every clock face position and distinguish hours from minutes',()=>{
  for(let h=1;h<=12;h++) for(let m=0;m<60;m+=5) {
    const state={'water-hour':String(h),'water-minute':String(m).padStart(2,'0')}
    const water=clockTargets(state)[1]
    assert.equal(water.valid,true)
    assert.equal(water.hour,h); assert.equal(water.minute,m)
    const r=evaluateTool('bo4-voyage-clocks',state)
    assert.equal(r.status,'ready'); assert.match(r.lines[1],/Engine Room · top-right/)
  }
  assert.equal(movesFromTwelve(12),'Leave at 12')
  assert.equal(movesFromTwelve(10),'2 left / anticlockwise')
  assert.equal(movesFromTwelve(6),'6 right / clockwise')
  assert.equal(evaluateTool('bo4-voyage-clocks',{'fire-hour':'3','fire-minute':'50'}).lines[0],'Fire — Bridge minutes: 50 (2 left / anticlockwise from 12).')
  assert.match(evaluateTool('bo4-voyage-clocks',{'air-hour':'8','air-minute':'00'}).lines[1],/Poop Deck · left.*4 left/)
  assert.equal(evaluateTool('bo4-voyage-clocks',{'fire-hour':'13','fire-minute':'50'}).status,'waiting')
  assert.equal(evaluateTool('bo4-voyage-clocks',{'fire-hour':'3','fire-minute':'51'}).status,'waiting')
  assert.equal(evaluateTool('bo4-voyage-clocks',{'fire-room':'Bridge','air-room':'Bridge'}).status,'invalid')
})

test('old mislabelled clock observations survive but never become inferred Air/Earth clues',()=>{
  const old={'hour-2':'3','minute-2':'50','hour-3':'1','minute-3':'05'}
  const saved=normalizeTool('bo4-voyage-clocks',old)
  assert.equal(saved['hour-2'],'3');assert.equal(saved['minute-3'],'05')
  assert.equal(saved['air-hour'],'');assert.equal(saved['earth-minute'],'')
  assert.equal(evaluateTool('bo4-voyage-clocks',old).status,'waiting')
})

test('outlet observations create the fixed trial route without consulting old progress flags',()=>{
  const fire={'outlet-3':'Dining Hall','ready-3':true}
  assert.equal(evaluateTool('bo4-voyage-outlets',fire).status,'waiting')
  assert.match(evaluateTool('bo4-voyage-outlets',fire).lines[3],/Fire: Dining Hall/)
  assert.deepEqual(evaluateTool('bo4-voyage-outlets',{...fire,'done-3':true}),evaluateTool('bo4-voyage-outlets',fire))
  assert.equal(evaluateTool('bo4-voyage-outlets',{...fire,'outlet-0':'Dining Hall'}).status,'invalid')
  assert.equal(evaluateTool('bo4-voyage-outlets',{'done-0':true,'outlet-0':'Aft Decks'}).status,'waiting')
  const done=Object.fromEntries(outletLocations.slice(0,4).flatMap((r,i)=>[[`outlet-${i}`,r.name],[`ready-${i}`,true],[`done-${i}`,true]]))
  assert.equal(evaluateTool('bo4-voyage-outlets',done).status,'ready')
  assert.deepEqual(evaluateTool('bo4-voyage-outlets',done).lines,outletLocations.slice(0,4).map((r,i)=>`${i+1}. ${['Poison','Water','Electric','Fire'][i]}: ${r.name}`))
  assert.equal(normalizeTool('bo4-voyage-outlets',{'ready-0':'true'})['ready-0'],false)
})

test('planet route rejects sequence gaps and duplicates, fixes Sun last and retains symbol activation',()=>{
  const state=Object.fromEntries(voyagePlanets.slice(0,8).map((p,i)=>[`slot-${i}`,p.name]))
  const result=evaluateTool('bo4-voyage-sky',state)
  assert.equal(result.status,'ready'); assert.equal(result.lines.length,9)
  assert.match(result.lines[7],/Neptune.*Aft Decks/); assert.match(result.lines[8],/Sun.*Forecastle/)
  assert.equal(evaluateTool('bo4-voyage-sky',{'slot-1':'Mercury'}).status,'invalid')
  assert.equal(evaluateTool('bo4-voyage-sky',{...state,'slot-3':'Mercury'}).status,'invalid')
  assert.equal(evaluateTool('bo4-voyage-sky',{...state,'slot-8':'Venus'}).status,'invalid')
  assert.equal(normalizeTool('bo4-voyage-sky',{'found-Neptune':true,'orb-0':true})['found-Neptune'],true)
  assert.equal(normalizeTool('bo4-voyage-sky',{'route-position':'8'})['route-position'],'8')
  assert.equal(normalizeTool('bo4-voyage-sky',{'route-position':'9'})['route-position'],'')
})

test('Voyage preserves original progress IDs and ships every referenced location image',()=>{
  const ids=voyage.phases.flatMap(p=>p.steps.map(s=>s.id))
  for(const [name,count] of [['setup',2],['clocks',3],['pipes',3],['boss',3]]) for(let i=1;i<=count;i++) assert.ok(ids.includes(`${name}-${i}`))
  const all=[...voyage.phases,...voyage.sidePhases]
  const allIds=all.flatMap(p=>p.steps.map(s=>s.id));assert.equal(new Set(allIds).size,allIds.length)
  const assets=[voyage.image,...all.flatMap(p=>p.steps.flatMap(s=>(s.images||[]).map(i=>i.src))),...clockLocations.flatMap(l=>['clock','symbol'].map(type=>`/images/bo4-voyage-of-despair/${l.image}-${type}.webp`)),...outletLocations.map(l=>`/images/bo4-voyage-of-despair/${l.image}-outlet.webp`),...voyagePlanets.map(l=>`/images/bo4-voyage-of-despair/${l.image}-planet-symbol.webp`)]
  for(const asset of assets) { const bytes=fs.readFileSync(`public${asset}`);assert.ok(bytes.length>1000,asset);assert.equal(bytes.toString('ascii',8,12),'WEBP',asset) }
})

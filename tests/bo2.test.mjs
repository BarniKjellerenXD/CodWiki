import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {bo2Guides} from '../shared/bo2-guides.mjs'
import {bo2Tools} from '../shared/bo2-tools.mjs'
import {plannedMaps} from '../shared/planned-maps.mjs'
import {normalizeTool,evaluateTool} from '../app/utils/expansionTools.mjs'
import {sanitizePuzzleState} from '../app/utils/puzzleState.mjs'
import {mahjongResult,signResult,leverOrders,leverCandidates,leverFeedback,nextLeverOrder,leverResult,bellResult,bellRooms,mahjongTiles,mineSigns,mahjongLocations,toolSections} from '../app/utils/bo2.mjs'
const json=p=>JSON.parse(fs.readFileSync(p,'utf8'))
const full=g=>[...g.phases,...g.sidePhases]
test('all twelve BO2 entries have authored guides, real mode labels and connected helpers',()=>{
 assert.equal(bo2Guides.length,12);assert.equal(plannedMaps.filter(m=>m.gameId==='bo2').length,0)
 const catalogue=json('app/data/catalogue.json'),search=json('app/data/searchIndex.json'),quick=json('app/data/quickQuests.json')
 for(const g of bo2Guides){
  const phases=full(g),steps=phases.flatMap(p=>p.steps)
  assert.ok(g.image,g.id);assert.ok(g.sources.length>=2,g.id);assert.ok(g.sidePhases.length,g.id)
  assert.equal(new Set(phases.map(p=>p.id)).size,phases.length,g.id)
  assert.equal(new Set(steps.map(s=>s.id)).size,steps.length,g.id)
  assert.ok(steps.every(s=>s.text&&s.quick),g.id)
  assert.ok(phases.some(p=>p.group==='Side Quests'),g.id)
  assert.equal(catalogue.maps.find(m=>m.id===g.id).status,undefined)
  assert.equal(search.find(e=>e.id===g.id).kind,'Guide')
  assert.equal(quick[g.id].length,g.phases.length)
  for(const p of phases)for(const id of p.tools){assert.equal(bo2Tools.find(t=>t.id===id)?.map,g.id);assert.equal(toolSections[id],p.id)}
 }
 for(const t of bo2Tools){assert.ok(!['tracker','recorder'].includes(t.kind));assert.ok(full(bo2Guides.find(g=>g.id===t.map)).some(p=>p.tools.includes(t.id)))}
 assert.equal(bo2Tools.length,6)
 assert.equal(catalogue.maps.find(m=>m.id==='bo2-diner').mode,'Turned')
 assert.equal(catalogue.maps.find(m=>m.id==='bo2-borough').mode,'Grief / Turned')
})
test('BO2 guide and helper images have provenance, bytes and valid crop bounds',()=>{
 const credited=new Set([...json('docs/bo2-assets.json').assets,...json('docs/chronicles-assets.json').assets].map(a=>a.src))
 const srcs=new Set(bo2Guides.flatMap(g=>[g.image,...full(g).flatMap(p=>p.steps.flatMap(s=>(s.images||[]).map(i=>i.src)))]))
 for(const p of mahjongLocations)srcs.add(p.src)
 for(const src of srcs){assert.ok(credited.has(src),src);const b=fs.readFileSync('public'+src);assert.ok(b.length>1000,src);assert.ok(b[0]===255||b.subarray(1,4).toString()==='PNG'||b.toString('ascii',0,4)==='RIFF',src)}
 assert.equal(mahjongLocations.length,11)
 for(const [items,w,h] of [[mahjongTiles,1280,720],[mineSigns,2560,1275]])for(const item of items){const[x,y,cw,ch]=item.box;assert.ok(x>=0&&y>=0&&cw>0&&ch>0&&x+cw<=w&&y+ch<=h,item.id)}
})
test('Mahjong pairs the observed colours, refuses duplicates and never fills unknowns',()=>{
 const s={'number-1':'Blue','number-2':'Red','number-3':'Black','number-4':'Green','direction-North':'Red','direction-East':'Green','direction-South':'Blue','direction-West':'Black'}
 assert.deepEqual(mahjongResult(s).order.map(p=>p.direction),['South','North','West','East'])
 assert.equal(mahjongResult({...s,'number-4':''}).status,'waiting')
 assert.equal(mahjongResult({...s,'direction-West':'Red'}).status,'invalid')
 assert.equal(mahjongResult({...s,'number-1':'Yellow'}).status,'invalid')
 assert.equal(evaluateTool('bo2-die-rise-mahjong',s).status,'ready')
})
test('Buried sign matching distinguishes similar red-stroke glyphs and catches duplicates',()=>{
 const s={'line-0':'bone','line-1':'consumption','line-2':'dry'}
 assert.deepEqual(signResult(s).signs.map(p=>p.name),['Bone Orchard Vein','Consumption Cross','Dry Gulcher Shaft'])
 assert.equal(signResult({...s,'line-2':'bone'}).status,'invalid')
 assert.equal(signResult({'line-0':'dry'}).status,'waiting')
 assert.equal(signResult({}).signs[0],null)
})
test('lever solver finds every possible secret from exact-position spark feedback',()=>{
 assert.equal(leverOrders.length,24);assert.equal(new Set(leverOrders.map(o=>o.join())).size,24)
 for(const answer of leverOrders){
  const trials=[]
  for(let i=0;i<6;i++){
   const candidates=leverCandidates(trials);assert.ok(candidates.some(c=>c.join()===answer.join()))
   const next=nextLeverOrder(candidates)
   if(next.join()===answer.join())break
   trials.push({order:next,feedback:leverFeedback(next,answer)})
  }
  assert.deepEqual(nextLeverOrder(leverCandidates(trials)),answer)
 }
})
test('unknown spark feedback does not become a rejection and contradictions stop suggestions',()=>{
 const first={order:['Red','Green','Blue','Yellow'],feedback:['spark','','','']}
 assert.equal(leverCandidates([first]).length,6)
 assert.ok(leverCandidates([first]).every(o=>o[0]==='Red'))
 const s={'saved-0':true,'saved-1':true}
 for(let i=0;i<4;i++){s[`trial-0-${i}`]=first.order[i];s[`trial-1-${i}`]=first.order[i];s[`spark-0-${i}`]=i===0?'spark':'';s[`spark-1-${i}`]=i===0?'dark':''}
 assert.equal(leverResult(s).status,'invalid');assert.equal(leverResult(s).suggestion,null)
 assert.equal(leverResult({'saved-0':true}).status,'invalid')
 assert.equal(leverResult({}).candidates.length,24)
})
test('bells use the calibrated room and row without inventing untested mappings',()=>{
 assert.equal(bellResult({light:'0'}).status,'waiting')
 const s={light:'7'}
 for(let i=0;i<9;i++)s[`bell-${i}`]=bellRooms[i%3].bells[(Math.floor(i/3)+1)%3]
 assert.equal(bellResult(s).room,'Barn');assert.equal(bellResult(s).bell,'Hay bale by wall opening')
 assert.equal(bellResult(s).calibrated,9)
 assert.equal(bellResult({...s,'bell-3':s['bell-0']}).status,'invalid')
 assert.equal(bellResult({...s,'bell-7':''}).status,'waiting')
 assert.equal(bellResult({...s,'bell-7':'unverified bell'}).status,'invalid')
})
test('all helper state round-trips, rejects foreign inputs and keeps BO2 Origins separate',()=>{
 for(const t of bo2Tools){
  const raw=Object.fromEntries(t.fields.map(f=>[f.id,f.type==='check'?true:f.options?.[0]||'']))
  const state=normalizeTool(t.id,raw)
  assert.deepEqual(sanitizePuzzleState(t.id,JSON.parse(JSON.stringify(state))),state)
  assert.equal(normalizeTool(t.id,{...raw,injected:'no'}).injected,undefined)
 }
 assert.equal(normalizeTool('bo2-die-rise-mahjong',{'number-1':'Yellow'})['number-1'],'')
 assert.equal(normalizeTool('bo2-buried-levers',{'saved-0':'true'})['saved-0'],false)
 const pattern=bo2Tools.find(t=>t.id==='bo2-origins-ice').fields[0].options[3]
 assert.deepEqual(evaluateTool('bo2-origins-ice',{pattern}),evaluateTool('bo3-origins-ice',{pattern}))
 assert.equal(normalizeTool('bo2-origins-ice',{}).pattern,'')
 assert.equal(evaluateTool('bo2-origins-fire',{'fire-11':true,'fire-7':true,'fire-3':true,'fire-4':true}).status,'ready')
 const text=JSON.stringify(bo2Guides.find(g=>g.id==='bo2-origins'))
 assert.ok(!text.includes('GobbleGum'));assert.ok(!text.includes('bo3-origins-'))
 assert.ok(!full(bo2Guides.find(g=>g.id==='bo2-origins')).some(p=>p.id==='samantha'))
})

import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {createRequire} from 'node:module'
import {classicGuides} from '../shared/classic-guides.mjs'
import {classicTools} from '../shared/classic-tools.mjs'
import {plannedMaps} from '../shared/planned-maps.mjs'
import {lighthouseResult,lighthouseDials,classicAtlases,classicGongs,classicSections,classicToolSection} from '../app/utils/classic.mjs'
import {normalizeTool,evaluateTool} from '../app/utils/expansionTools.mjs'
import {sanitizePuzzleState} from '../app/utils/puzzleState.mjs'
import {gongResult,moonSequence,tilePairs} from '../app/utils/chronicles.mjs'
import {searchCatalogue} from '../app/utils/companion.mjs'
const require=createRequire(import.meta.url)
const {groupNavigation}=require('../desktop-app/renderer/navigation.js')
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'))
const full=g=>[...g.phases,...g.sidePhases]

test('all fifteen classic entries have complete authored routes, side secrets and generated discovery',()=>{
 assert.equal(classicGuides.length,15);assert.equal(plannedMaps.filter(map=>['bo1','waw'].includes(map.gameId)).length,0)
 assert.equal(classicGuides.filter(g=>g.gameId==='bo1').length,11)
 assert.equal(classicGuides.filter(g=>g.gameId==='waw').length,4)
 const catalogue=read('app/data/catalogue.json'),search=read('app/data/searchIndex.json'),quick=read('app/data/quickQuests.json')
 for(const g of classicGuides){
  const phases=full(g),steps=phases.flatMap(p=>p.steps),groups=phases.map(p=>p.group).filter(Boolean)
  assert.ok(g.image,g.id);assert.ok(g.sources.length>=2,g.id);assert.ok(g.sidePhases.length,g.id)
  assert.ok(steps.length>=8,g.id);assert.ok(steps.every(s=>s.text&&s.quick),g.id)
  assert.equal(new Set(phases.map(p=>p.id)).size,phases.length,g.id)
  assert.equal(new Set(steps.map(s=>s.id)).size,steps.length,g.id)
  assert.equal(new Set(groups).size,groups.length,g.id);assert.ok(groups.includes('Side Quests'))
  assert.equal(catalogue.maps.find(m=>m.id===g.id).status,undefined)
  assert.equal(search.find(m=>m.id===g.id).kind,'Guide')
  assert.equal(quick[g.id].length,g.phases.length)
  for(const p of phases)for(const id of p.tools)assert.equal(classicTools.find(t=>t.id===id)?.map,g.id)
 }
 assert.equal(classicTools.length,7)
 for(const tool of classicTools){
  assert.notEqual(tool.kind,'tracker')
  const g=classicGuides.find(g=>g.id===tool.map)
  assert.ok(full(g).some(p=>p.tools.includes(tool.id)),tool.id)
  assert.ok(full(g).some(p=>p.id===classicSections[tool.id]),tool.id)
 }
})

test('BO2 dropdown groups only the seven standalone modes and keeps search and desktop links',()=>{
 const catalogue=read('app/data/catalogue.json'),search=read('app/data/searchIndex.json')
 const expected=['borough','bus-depot','cell-block','diner','farm','nuketown-zombies','town'].map(s=>'bo2-'+s)
 assert.deepEqual(catalogue.maps.filter(m=>m.gameId==='bo2'&&m.group==='survival').map(m=>m.id).sort(),expected)
 assert.deepEqual(catalogue.maps.filter(m=>m.gameId==='bo2'&&!m.group).map(m=>m.id).sort(),['buried','die-rise','mob-of-the-dead','origins','tranzit'].map(s=>'bo2-'+s))
 const entries=require('../desktop-app/renderer/nav.js')
 const groups=groupNavigation(entries,[...entries].reverse().map(e=>e.id))
 assert.deepEqual(Array.from(groups.filter(g=>g.game==='bo2'&&g.group==='survival'),g=>g.id).sort(),expected)
 for(const name of ['Farm','Bus Depot','Town'])assert.ok(searchCatalogue(search,name).some(r=>r.route==='/guides/bo2-'+name.toLowerCase().replaceAll(' ','-')))
})

test('lighthouse solver reaches the target from all 10,000 starts under an independent physical simulation',()=>{
 // Pressing a floor increments itself and floors directly touching it; no wrap between top and bottom.
 const effects=[[0,1],[0,1,2],[1,2,3],[2,3]]
 for(let value=0;value<10000;value++){
  const start=String(value).padStart(4,'0').split('').map(Number)
  const state=Object.fromEntries(lighthouseDials.map((d,i)=>[d.id,String(start[i])]))
  const answer=lighthouseResult(state)
  assert.equal(answer.status,'ready')
  const actual=[...start]
  answer.turns.forEach((d,i)=>{assert.ok(Number.isInteger(d.count)&&d.count>=0&&d.count<10);for(let p=0;p<d.count;p++)for(const floor of effects[i])actual[floor]=(actual[floor]+1)%10})
  assert.deepEqual(actual,[2,7,4,6],value)
 }
 assert.deepEqual(lighthouseResult({yellow:'0',orange:'0',blue:'0',purple:'0'}).turns.map(t=>t.count),[4,8,5,1])
 assert.equal(lighthouseResult({yellow:'2',orange:'7',blue:'4',purple:'6'}).total,0)
 assert.equal(lighthouseResult({yellow:'0',orange:'0',blue:'0'}).status,'waiting')
 for(const bad of ['10','-1','x',null,true])assert.equal(lighthouseResult({yellow:bad,orange:'0',blue:'0',purple:'0'}).status,'invalid')
 assert.equal(evaluateTool('bo1-cotd-dials',{yellow:'0',orange:'0',blue:'0',purple:'0'}).total,18)
})

test('classic references have credited local image bytes and complete photographed location sets',()=>{
 const credited=new Set([...read('docs/classic-assets.json').assets,...read('docs/chronicles-assets.json').assets].map(a=>a.src))
 const sources=new Set(classicGuides.flatMap(g=>[g.image,...full(g).flatMap(p=>p.steps.flatMap(s=>(s.images||[]).map(i=>i.src)))]))
 for(const a of Object.values(classicAtlases))for(const g of a.groups)for(const p of g.locations)sources.add(p.src)
 for(const p of [...classicGongs,...lighthouseDials])sources.add(p.src)
 for(const src of sources){assert.ok(credited.has(src),src);const b=fs.readFileSync('public'+src);assert.ok(b.length>1000,src);assert.ok(b[0]===255||b.subarray(1,4).toString()==='PNG'||b.toString('ascii',0,4)==='RIFF',src)}
 assert.deepEqual(classicAtlases['bo1-cotd-locations'].groups.map(g=>g.locations.length),[3,4,4,4,4,3])
 assert.equal(classicAtlases['bo1-shang-locations'].groups[0].locations.length,12)
 assert.equal(classicGongs.length,8);assert.equal(classicGongs[4].name,'Spawn · M14')
})

test('edition requirements and rewards do not inherit remaster-only quests',()=>{
 const get=id=>classicGuides.find(g=>g.id===id)
 for(const g of classicGuides)assert.ok(!full(g).some(p=>['samantha','space-dog'].includes(p.id)),g.id)
 const asc=full(get('bo1-ascension')).flatMap(p=>p.steps).map(s=>s.text).join(' ')
 assert.match(asc,/90 seconds/);assert.match(asc,/does not award permanent perks/);assert.doesNotMatch(asc,/Mark II|Widow’s Wine/)
 const moon=get('bo1-moon');assert.match(moon.intro,/2–4 players/);assert.match(moon.phases[0].steps[0].text,/Ensemble Cast/)
 assert.ok(!get('waw-nacht-der-untoten').sidePhases.some(p=>p.id==='undone'))
 assert.ok(get('bo1-nacht-der-untoten').sidePhases.some(p=>p.id==='undone'))
 assert.ok(get('bo1-shangri-la').sidePhases.some(p=>p.id==='monkey-secret'))
 for(const id of ['waw-der-riese','bo1-der-riese']){
  const targets=full(get(id)).flatMap(p=>p.steps).find(s=>s.id==='der-targets')
  assert.equal(targets.images.length,3);assert.ok(targets.images.every(p=>p.src.includes('_waw')))
 }
})

test('reused puzzle components preserve BO1 observations without importing BO3 state',()=>{
 const state={'slot-0':'Red','slot-1':'Red','slot-2':'Blue',stage:'Final three games'}
 const original=normalizeTool('bo1-moon-simon',state)
 assert.deepEqual(sanitizePuzzleState('bo1-moon-simon',JSON.parse(JSON.stringify(original))),original)
 assert.deepEqual(moonSequence(original).positions,[1,1,3])
 assert.equal(normalizeTool('bo3-moon-simon',{})['slot-0'],'')
 const paired=normalizeTool('bo1-shang-tiles',{'symbol-0-0':'1','symbol-1-3':'1','place-0-0':'MPL wall','place-1-3':'Bridge ramp'})
 assert.equal(tilePairs(paired).ready,1)
 assert.equal(tilePairs(paired).pairs[0].bridge.label,'Bridge ramp')
 const gongs=Object.fromEntries(classicGongs.map((g,i)=>[g.key,i<4?'Correct':'Wrong']))
 assert.equal(gongResult(gongs,classicGongs).status,'ready')
 assert.equal(gongResult({...gongs,'gong-4':'Correct'},classicGongs).status,'invalid')
 for(const tool of classicTools){const clean=normalizeTool(tool.id,{...original,unexpected:'remove'});assert.ok(!('unexpected'in clean));assert.deepEqual(sanitizePuzzleState(tool.id,clean),clean)}
})

test('location-finder links follow the selected collection to a real guide step',()=>{
 for(const [id,atlas] of Object.entries(classicAtlases)){
  const guide=classicGuides.find(g=>g.id===`bo1-${atlas.map}`)
  for(const group of atlas.groups)assert.ok(full(guide).some(p=>p.id===classicToolSection(id,{collection:group.id})),`${id}/${group.id}`)
 }
 assert.equal(classicToolSection('bo1-cotd-locations',{collection:'vodka'}),'vodka')
 assert.equal(classicToolSection('bo1-cotd-locations',{collection:'pap'}),'setup')
 assert.equal(classicToolSection('bo1-moon-labs',{collection:'cable'}),'device')
 assert.equal(classicToolSection('bo1-cotd-locations',{collection:'unknown'}),'fuse')
 assert.equal(classicToolSection('bo1-shang-tiles',{}),'tiles')
})

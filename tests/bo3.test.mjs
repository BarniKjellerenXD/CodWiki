import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {bo3Guides} from '../shared/bo3-guides.mjs'
import {bo3Tools} from '../shared/bo3-tools.mjs'
import {plannedMaps} from '../shared/planned-maps.mjs'
import {retiredToolDestination} from '../shared/retired-tools.mjs'
import {normalizeTool} from '../app/utils/expansionTools.mjs'
import {observedSequence,terminalPosition,plantPlan,plantRecipes,plantWaters,plantSupplies,plantPlanter,revelationLocations,shadowGlyphs,voidGlyphs,terminalGlyphs} from '../app/utils/bo3.mjs'
const json=p=>JSON.parse(fs.readFileSync(p,'utf8'))
const catalogue=json('app/data/catalogue.json'), quick=json('app/data/quickQuests.json'), search=json('app/data/searchIndex.json')

test('BO3 guides include setup, main quest, side quests and valid contextual tools',()=>{
  assert.equal(bo3Guides.length,6)
  for(const g of bo3Guides){
    assert.ok(g.sources.some(s=>s.includes('reddit.com')) && g.sources.some(s=>!s.includes('reddit.com')))
    const phases=[...g.phases,...g.sidePhases], ids=phases.flatMap(p=>p.steps.map(s=>s.id))
    assert.equal(new Set(ids).size,ids.length,g.id)
    assert.ok(phases.some(p=>p.group==='Side Quests'),g.id)
    assert.ok(g.phases.length>=3 && g.sidePhases.length>=2,g.id)
    for(const p of phases) for(const id of p.tools) assert.equal(bo3Tools.find(t=>t.id===id)?.map,g.id)
    assert.ok(quick[g.id].every(p=>p.steps.every(s=>ids.includes(s.id))))
    const anchors=new Set(phases.map(p=>`details-${p.id}`))
    for(const p of phases) for(const s of p.steps) for(const link of s.links||[]) if(link.href.startsWith('#')) assert.ok(anchors.has(link.href.slice(1)),link.href)
  }
})
test('expanded guides preserve every legacy phase and completion ID',()=>{
  const legacy=json('tests/fixtures/bo3-progress-v1.json')
  for(const g of bo3Guides){const ids=g.phases.flatMap(p=>p.steps.map(s=>s.id));for(const p of legacy[g.id]){assert.ok(g.phases.some(phase=>phase.id===p.id),`${g.id}: ${p.id}`);for(const id of p.steps)assert.ok(ids.includes(id),`${g.id}: ${id}`)}}
})
test('every BO3 guide and finder photo is a local WebP with source provenance',()=>{
  const manifest=json('docs/bo3-assets.json')
  const sources=new Set(manifest.map(m=>m.file))
  const images=new Set([...bo3Guides.flatMap(g=>[g.image,...[...g.phases,...g.sidePhases].flatMap(p=>p.steps.flatMap(s=>(s.images||[]).map(i=>i.src)))]),...Object.values(revelationLocations).flat().map(l=>l.src)])
  for(const src of images){const file='public'+src;assert.ok(sources.has(file),src);const bytes=fs.readFileSync(file);assert.equal(bytes.toString('ascii',0,4),'RIFF',src);assert.equal(bytes.toString('ascii',8,12),'WEBP',src)}
  assert.deepEqual(Object.values(revelationLocations).map(a=>a.length),[16,12,6,7])
})
test('symbol observations reject duplicates and gaps without guessing',()=>{
  const ids=shadowGlyphs.map(g=>g.id)
  assert.equal(observedSequence({},'glyph',3,ids,{unique:true}).status,'waiting')
  assert.equal(observedSequence({'glyph-0':'s1','glyph-2':'s3'},'glyph',3,ids,{unique:true}).status,'waiting')
  assert.equal(observedSequence({'glyph-0':'s1','glyph-1':'s1'},'glyph',3,ids,{unique:true}).status,'invalid')
  assert.equal(observedSequence({'glyph-0':'invented'},'glyph',3,ids).status,'invalid')
  assert.deepEqual(observedSequence({'glyph-0':'s3','glyph-1':'s1','glyph-2':'s9'},'glyph',3,ids,{unique:true}).values,['s3','s1','s9'])
})
test('safe may repeat a symbol while terminal boards require a permutation and remain independent',()=>{
  const ids=terminalGlyphs.map(g=>g.id)
  assert.equal(observedSequence({'safe-0':'circle','safe-1':'circle','safe-2':'rocket'},'safe',3,ids).status,'ready')
  const state={'board-0-0':'rocket','board-0-1':'d','board-0-2':'circle','board-0-3':'bolt','board-1-0':'circle','board-1-1':'bolt','board-1-2':'d','board-1-3':'rocket'}
  assert.equal(terminalPosition(state,'0','rocket').position,1)
  assert.equal(terminalPosition(state,'1','rocket').position,4)
  assert.equal(terminalPosition({...state,'board-0-3':'rocket'},'0','rocket').status,'invalid')
  assert.equal(terminalPosition({},'0','rocket').position,null)
})
test('bow helper bookmarks lead to the preserved guide routes and disappear from tool discovery',()=>{
  for(const path of ['/tools/bo3-de-bows','/tools/bo3-de-bows.html','/tools/bo3-de-bows/'])assert.equal(retiredToolDestination(path),'/guides/bo3-der-eisendrache#details-bows')
  assert.ok(!bo3Tools.some(t=>t.id==='bo3-de-bows'))
  assert.ok(!catalogue.tools.some(t=>t.id==='bo3-de-bows'))
  assert.ok(!search.some(t=>t.id==='bo3-de-bows'))
  const guide=bo3Guides.find(g=>g.id==='bo3-der-eisendrache')
  const bowPhase=guide.phases.find(p=>p.id==='bows')
  assert.equal(bowPhase.tools.length,0)
  assert.equal(bowPhase.steps.find(s=>s.id==='bows-1').links.length,4)
  assert.ok(bo3Tools.some(t=>t.id==='bo3-revelations-runes'))
  assert.ok(bo3Tools.some(t=>t.id==='bo3-revelations-collections'))
})
test('every water recipe resolves to an illustrated local location with recorded image provenance',()=>{
  const manifest=json('docs/bo3-assets.json')
  const images=[plantPlanter,...plantSupplies.map(s=>s.image),...Object.values(plantWaters).flatMap(w=>w.images)]
  for(const image of images){
    const source=manifest.find(m=>m.file===`public${image.src}`)
    assert.ok(source, image.src)
    const bytes=fs.readFileSync(`public${image.src}`)
    const valid=bytes.toString('ascii',0,4)==='RIFF' && bytes.toString('ascii',8,12)==='WEBP' || bytes[0]===255 && bytes[1]===216 || bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
    assert.ok(valid,image.src)
  }
  for(const recipe of Object.values(plantRecipes))for(const colour of recipe.water)assert.ok(plantWaters[colour].images.length && plantWaters[colour].directions.length)
  const anchors=new Set(bo3Guides.find(g=>g.id==='bo3-zetsubou-no-shima').phases.concat(bo3Guides.find(g=>g.id==='bo3-zetsubou-no-shima').sidePhases).map(p=>p.id))
  for(const recipe of Object.values(plantRecipes))if(recipe.link)assert.ok(anchors.has(recipe.link.anchor))
})
test('plant planner counts planting as care one and never guarantees a flak shell',()=>{
  const state={goal:'flak',planted:'8',...Object.fromEntries([0,1,2].flatMap(i=>[[`water-${i}`,'Blue'],[`shot-${i}`,true]]))}
  const result=plantPlan(state)
  assert.equal(result.harvest,11);assert.equal(result.status,'ready');assert.match(result.message,/chance/)
  assert.equal(plantPlan({...state,'shot-1':false}).status,'invalid')
  assert.equal(plantPlan({...state,'water-1':'Purple'}).status,'invalid')
  for(const bad of ['0','-1','2.5','eight'])assert.equal(plantPlan({...state,planted:bad}).status,'invalid')
  assert.equal(plantPlan({...state,'water-2':''}).status,'waiting')
})
test('fruit accepts color permutations; Masamune requires rainbow at its special planter',()=>{
  for(const colors of [['Blue','Green','Purple'],['Purple','Blue','Green'],['Green','Purple','Blue']]){
    const state={goal:'fruit',...Object.fromEntries(colors.map((w,i)=>[`water-${i}`,w]))}
    assert.equal(plantPlan(state).status,'ready')
    assert.equal(plantPlan({...state,'shot-0':true}).status,'invalid')
  }
  const state={goal:'masamune','water-0':'Rainbow','water-1':'Rainbow','water-2':'Rainbow'}
  assert.equal(plantPlan(state).status,'ready');assert.match(plantPlan(state).recipe.place,/Secret planter/)
  assert.equal(plantPlan({...state,'water-2':'Blue'}).status,'invalid')
})
test('old text observations and old checklists survive alongside new visual fields',()=>{
  for(const [id,raw,key] of [
    ['bo3-shadows-glyphs',{'slot-0':'old red star','glyph-0':'s1'},'slot-0'],
    ['bo3-de-void',{'glyph-0':'old moon','name-0':'Griffon','symbol-0':'moon'},'glyph-0'],
    ['bo3-de-terminals',{'station-0-1':'old bolt','safe-0':'bolt'},'station-0-1'],
    ['bo3-revelations-runes',{'slot-0':'old rune','rune-0':'4'},'slot-0'],
    ['bo3-zetsubou-plants',{goal:'flak',planted:'8','water-0':'Blue','shot-0':true},'water-0'],
    ['bo3-revelations-collections',{'check-19':true,collection:'bone'},'check-19']
  ]){assert.equal(normalizeTool(id,raw)[key],raw[key]);assert.equal(bo3Tools.find(t=>t.id===id).version,1)}
})
test('symbol crops stay within their credited screenshots',()=>{
  for(const [glyphs,w,h] of [[shadowGlyphs,2560,1440],[voidGlyphs,1919,1078],[terminalGlyphs,2560,1440]])for(const g of glyphs){const[x,y,cw,ch]=g.box;assert.ok(x>=0&&y>=0&&cw>0&&ch>0&&x+cw<=w&&y+ch<=h,g.id)}
})
test('27 legacy map entries are discoverable and never expose fake tools or progress',()=>{
  assert.equal(plannedMaps.length,27)
  for(const m of plannedMaps){assert.equal(catalogue.maps.find(x=>x.id===m.id).status,'planned');assert.equal(quick[m.id],undefined);assert.equal(search.find(x=>x.id===m.id).kind,'Map entry');assert.ok(!catalogue.tools.some(t=>t.map===m.id))}
  assert.deepEqual(['bo2','bo1','waw'].map(id=>plannedMaps.filter(m=>m.gameId===id).length),[12,11,4])
})

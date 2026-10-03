import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {chroniclesGuides} from '../shared/chronicles-guides.mjs'
import {chroniclesTools} from '../shared/chronicles-tools.mjs'
import {expansionTools} from '../shared/expansion-tools.mjs'
import {normalizeTool,evaluateTool} from '../app/utils/expansionTools.mjs'
import {iceSymbols,fireSymbols,tileSymbols,locationAtlases,gongLocations,tilePairs,moonSequence,gongResult} from '../app/utils/chronicles.mjs'
import {retiredToolDestination} from '../shared/retired-tools.mjs'
const json=p=>JSON.parse(fs.readFileSync(p,'utf8'))
test('eight Chronicles guides have sources, illustrated steps and working contextual tools',()=>{
 assert.equal(chroniclesGuides.length,8)
 for(const g of chroniclesGuides){
  assert.equal(g.group,'chronicles');assert.ok(g.sources.some(s=>s.includes('reddit.com')));assert.ok(g.sources.some(s=>!s.includes('reddit.com')))
  const phases=[...g.phases,...g.sidePhases],ids=phases.flatMap(p=>p.steps.map(s=>s.id))
  assert.equal(new Set(ids).size,ids.length,g.id);assert.equal(new Set(phases.map(p=>p.id)).size,phases.length)
  assert.ok(phases.some(p=>p.group==='Side Quests'),g.id)
  assert.ok(phases.flatMap(p=>p.steps).filter(s=>s.images?.length).length>=2,g.id)
  for(const p of phases)for(const id of p.tools)assert.equal(expansionTools.find(t=>t.id===id)?.map,g.id,id)
 }
})
test('old guide checkpoints and retired bookmarks remain reachable',()=>{
 for(const old of json('tests/fixtures/chronicles-legacy-ids.json')){
  const g=chroniclesGuides.find(g=>g.id===old.id),ids=g.phases.flatMap(p=>p.steps.map(s=>s.id))
  for(const p of old.phases){assert.ok(g.phases.some(next=>next.id===p.id));for(const id of p.steps)assert.ok(ids.includes(id),`${g.id}: ${id}`)}
 }
 for(const [id,map,anchor] of [['bo3-verruckt-setup','bo3-verruckt','setup'],['bo3-ascension-luna','bo3-ascension','luna'],['bo3-origins-staffs','bo3-origins','staff-build']]){
  assert.equal(retiredToolDestination(`/tools/${id}.html`),`/guides/${map}#details-${anchor}`)
  assert.ok(!expansionTools.some(t=>t.id===id))
 }
})
test('all guide, finder and glyph images have real local bytes and source provenance',()=>{
 const manifest=json('docs/chronicles-assets.json');const sources=new Set(manifest.assets.map(a=>a.src))
 const srcs=new Set([...chroniclesGuides.flatMap(g=>[g.image,...[...g.phases,...g.sidePhases].flatMap(p=>p.steps.flatMap(s=>(s.images||[]).map(i=>i.src)))]),...Object.values(locationAtlases).flatMap(a=>a.groups.flatMap(g=>g.locations.map(l=>l.src))),...gongLocations.map(g=>g.src)])
 for(const src of srcs){assert.ok(sources.has(src),src);const b=fs.readFileSync('public'+src);assert.ok(b.length>1000,src);assert.ok(b.toString('ascii',0,4)==='RIFF'||b[0]===0xff||b.subarray(1,4).toString()==='PNG',src)}
 assert.equal(locationAtlases['bo3-nacht-secrets'].groups[0].locations.length,8)
 assert.equal(locationAtlases['bo3-verruckt-dolls'].groups[0].locations.length,10)
 assert.equal(locationAtlases['bo3-kino-dolls'].groups[0].locations.length,10)
 assert.equal(gongLocations.length,8)
})
test('ice and fire mappings match the inspected source charts and stay inside them',()=>{
 assert.equal(iceSymbols.length,12);assert.equal(tileSymbols.length,12)
 assert.equal(iceSymbols[0].rune,'Downward triangle');assert.equal(iceSymbols[11].rune,'L + double-branch stem')
 for(const s of iceSymbols)for(const box of [s.input,s.output]){assert.ok(box[0]>=0&&box[1]>=0);assert.ok(box[0]+box[2]<=1771&&box[1]+box[3]<=1102)}
 assert.deepEqual(fireSymbols.map(s=>s.value),[11,5,9,7,6,3,4])
 const result=evaluateTool('bo3-origins-fire',{'fire-11':true,'fire-7':true,'fire-3':true,'fire-4':true})
 assert.equal(result.status,'ready');assert.ok(result.lines.includes('Torch 4 — bloodstain'))
})
test('tile pairs depend on two observed symbols and duplicates are exposed',()=>{
 assert.equal(tilePairs({}).ready,0)
 const s={'symbol-0-3':'7','symbol-1-8':'7','place-0-3':'by steps','place-1-8':'bridge entrance'}
 const pair=tilePairs(s).pairs.find(p=>p.symbol.id==='7');assert.equal(pair.minecart.label,'by steps');assert.equal(pair.bridge.index,8)
 assert.equal(tilePairs({...s,'symbol-0-5':'7'}).duplicates.length,1)
 assert.equal(tilePairs({'tile-0-3':'Sun','tile-1-8':'Sun'}).ready,0,'legacy text is not treated as visual evidence')
})
test('Moon allows repeated colours, detects gaps and ignores obsolete two-by-two layout notes',()=>{
 const s={'slot-0':'Blue','slot-1':'Blue','slot-2':'Red','screen-0':'Yellow'}
 assert.deepEqual(moonSequence(s).positions,[3,3,1]);assert.equal(moonSequence(s).hasGap,false)
 assert.equal(moonSequence({'slot-1':'Red'}).hasGap,true)
 assert.equal(evaluateTool('bo3-moon-simon',s).lines[0],'1. Computer 3 from the left (Blue)')
})
test('gongs never infer untested locations and reject impossible observations',()=>{
 assert.equal(gongResult({}).status,'waiting')
 const s=Object.fromEntries([0,2,4,7].map(i=>[`gong-${i}`,'Correct']))
 assert.equal(gongResult(s).status,'ready');assert.equal(gongResult(s).wrong.length,0)
 assert.equal(gongResult({...s,'gong-1':'Correct'}).status,'invalid')
 assert.equal(gongResult(Object.fromEntries([0,1,2,3,4].map(i=>[`gong-${i}`,'Wrong']))).status,'invalid')
})
test('Chronicles state round-trips and preserves old version-one observations',()=>{
 for(const t of chroniclesTools){const raw=Object.fromEntries(t.fields.map(f=>[f.id,f.type==='check'?true:f.options?.[0]||'observed']));const saved=normalizeTool(t.id,raw);assert.deepEqual(normalizeTool(t.id,JSON.parse(JSON.stringify(saved))),saved);assert.equal(t.version,1)}
 for(const [id,key,value] of [['bo3-nacht-secrets','check-2',true],['bo3-shang-tiles','tile-1-8','old moon note'],['bo3-moon-simon','screen-0','Yellow'],['bo3-kino-knocks','slot-2','5']])assert.equal(normalizeTool(id,{[key]:value})[key],value)
})
test('catalogue, search, quick guides and desktop tools include the expanded maps',()=>{
 const catalogue=json('app/data/catalogue.json'),search=json('app/data/searchIndex.json'),quick=json('app/data/quickQuests.json')
 for(const g of chroniclesGuides){assert.equal(catalogue.maps.find(m=>m.id===g.id).group,'chronicles');assert.ok(search.some(s=>s.id===g.id));assert.equal(quick[g.id].length,g.phases.length)}
 for(const t of chroniclesTools)assert.ok(catalogue.tools.some(s=>s.id===t.id))
})

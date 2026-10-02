import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {ravenTrophies,ravenSolution,castleRunes,trapEyes,castleSequence,bookPositions,tombRockSymbols,tombDoorSelection,tombVases} from '../app/utils/bo6CastleTomb.mjs'
import {guides,tools} from '../shared/bo6-castle-tomb.mjs'

test('Raven solution maps every real antiquity to the correct two rings',()=>{
 const expected={ram:['Fire','Aries'],lion:['Fire','Leo'],bird:['Air','Gemini'],fish:['Water','Pisces'],scorpion:['Water','Scorpio']}
 for(const [id,pair] of Object.entries(expected)){
  const result=ravenSolution(id)
  assert.deepEqual([result.element,result.zodiac],pair)
  assert.ok(fs.existsSync(path.join('public',result.photo)))
 }
 for(const invalid of [undefined,'','Aries','taurus',0])assert.equal(ravenSolution(invalid),null)
 assert.equal(ravenTrophies.length,5)
})

test('rune recorder preserves observed order and never fills missing observations',()=>{
 assert.equal(castleSequence().complete,false)
 assert.equal(castleSequence({'vase-0':'rune-2','vase-1':'unknown'}).filled,1)
 const state=Object.fromEntries(['rune-20','rune-1','rune-9','rune-4','rune-17','rune-3'].map((id,i)=>[`vase-${i}`,id]))
 const result=castleSequence(state)
 assert.equal(result.complete,true)
 assert.deepEqual(result.rows.map(row=>row.symbol.id),Object.values(state))
 delete state['vase-4']
 assert.equal(castleSequence(state).rows[4].symbol,null)
 assert.equal(castleSequence(state).complete,false)
})

test('book uses column reading order and accepts only photographed eye designs',()=>{
 assert.deepEqual(bookPositions,['Top left','Bottom left','Top right','Bottom right'])
 const state={'page-0':'four-rays','page-1':'eye-ring','page-2':'eye','page-3':'eight-rays'}
 assert.deepEqual(castleSequence(state,'page',4,trapEyes).rows.map(row=>row.symbol.id),Object.values(state))
 state['page-1']='rune-1'
 assert.equal(castleSequence(state,'page',4,trapEyes).complete,false)
})

test('all 56 three-rock combinations map to exactly three unique gateway cells',()=>{
 let combinations=0
 for(let a=0;a<6;a++)for(let b=a+1;b<7;b++)for(let c=b+1;c<8;c++){
  const selected=[a,b,c].map(index=>tombRockSymbols[index])
  const result=tombDoorSelection(Object.fromEntries(selected.map(row=>[row.id,true])))
  assert.equal(result.complete,true)
  assert.equal(result.invalid,false)
  assert.equal(new Set(result.selected.map(row=>`${row.column}:${row.row}`)).size,3)
  assert.deepEqual(result.selected.map(row=>row.id),selected.map(row=>row.id))
  combinations++
 }
 assert.equal(combinations,56)
 assert.deepEqual(tombRockSymbols.map(row=>[row.column,row.row]),[['Left',1],['Left',2],['Left',3],['Left',4],['Right',1],['Right',2],['Right',3],['Right',4]])
})

test('gateway solution rejects incomplete, malformed and excessive observations',()=>{
 for(const state of [{},{'rock-1':true},{'rock-1':'true','rock-2':true,'rock-3':true},{'rock-9':true}])assert.equal(tombDoorSelection(state).complete,false)
 const excessive=tombDoorSelection({'rock-1':true,'rock-2':true,'rock-3':true,'rock-4':true})
 assert.equal(excessive.complete,false)
 assert.equal(excessive.invalid,true)
})

test('photographic crop coordinates stay within credited source images',()=>{
 const manifest=JSON.parse(fs.readFileSync('docs/bo6-castle-tomb-assets.json','utf8'))
 const files=new Set(manifest.map(row=>row.file))
 for(const collection of [castleRunes,trapEyes,tombRockSymbols]){
  assert.equal(new Set(collection.map(row=>row.id)).size,collection.length)
  for(const row of collection){
   const [x,y,width,height]=row.box.split(' ').map(Number)
   assert.ok(x>=0&&y>=0&&width>0&&height>0)
   assert.ok(x+width<=row.width&&y+height<=row.height,row.id)
   assert.ok(files.has(`public${row.src}`),row.src)
  }
 }
 assert.equal(castleRunes.length,20)
 assert.equal(trapEyes.length,4)
 assert.equal(tombRockSymbols.length,8)
 for(const row of manifest){
  const bytes=fs.readFileSync(row.file)
  assert.ok(bytes.length>100,row.file)
  assert.ok(bytes.toString('ascii',0,4)==='RIFF'||bytes[0]===0xff&&bytes[1]===0xd8,row.file)
  assert.ok(row.source.startsWith('https://')&&row.credit&&row.guide,row.file)
 }
})

test('guide and helper data retain complete references and unique progress keys',()=>{
 const toolIds=new Set(tools.map(row=>row.id))
 assert.equal(tools.length,6)
 assert.equal(tombVases.length,10)
 for(const guide of guides){
  assert.match(guide.intro,/Standard mode/)
  assert.ok(guide.sources.some(source=>source.includes('reddit.com')))
  const steps=[]
  for(const phase of [...guide.phases,...guide.sidePhases]){
   assert.ok(Array.isArray(phase.tools))
   for(const id of phase.tools)assert.ok(toolIds.has(id),id)
   for(const step of phase.steps){
    steps.push(step.id)
    assert.ok(step.text&&step.quick,step.id)
    for(const image of step.images||[])assert.ok(fs.existsSync(path.join('public',image.src)),image.src)
   }
  }
  assert.equal(new Set(steps).size,steps.length,guide.id)
 }
 for(const tool of tools)assert.equal(new Set(tool.fields.map(field=>field.id)).size,tool.fields.length,tool.id)
 const runeFields=tools.find(row=>row.id==='bo6-citadelle-symbols').fields
 assert.equal(runeFields.find(field=>field.id==='vase-0').options.length,20)
 assert.equal(runeFields.find(field=>field.id==='page-0').options.length,4)
})

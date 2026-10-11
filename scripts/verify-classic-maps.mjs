import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { classicGuides } from '../shared/classic-guides.mjs'
import { bo2Guides } from '../shared/bo2-guides.mjs'
import { bo3Guides } from '../shared/bo3-guides.mjs'
import { chroniclesGuides } from '../shared/chronicles-guides.mjs'
import { mapTypes } from '../app/utils/mapFilters.mjs'

const root=fileURLToPath(new URL('../',import.meta.url))
const guides=new Map([...classicGuides,...bo2Guides,...bo3Guides,...chroniclesGuides].map(g=>[g.id,g]))
const summary=JSON.parse(fs.readFileSync(path.join(root,'docs/map-expansion-research/classic-map-implementation.json'),'utf8'))
let links=0,markers=0
for(const row of summary.maps){
  const data=JSON.parse(fs.readFileSync(path.join(root,`app/data/maps/${row.id}.json`),'utf8'))
  const g=guides.get(data.id),steps=new Set([...g.phases,...g.sidePhases].flatMap(p=>p.steps.map(s=>s.id)))
  const layers=new Set(data.layers.map(l=>l.id)),locations=new Set(data.locations.map(l=>l.id)),targets=new Set(data.targets.map(t=>t.id))
  assert.equal(locations.size,data.locations.length,`${data.id}: unique locations`)
  assert.equal(targets.size,data.targets.length,`${data.id}: unique targets`)
  assert.ok(layers.has(data.defaultLayer))
  assert.ok(data.sources.length && data.coverage.note && data.locations.length>1)
  for(const layer of data.layers){assert.ok(fs.existsSync(path.join(root,'public',layer.image)),`${data.id}: image exists`);assert.ok(layer.width>0&&layer.height>0)}
  for(const location of data.locations){
    assert.ok(layers.has(location.layerId),`${data.id}: layer ${location.layerId}`)
    assert.ok(location.x>=0&&location.x<=1&&location.y>=0&&location.y<=1)
    assert.equal(location.precision,'area',`${data.id}: no false surveyed points`)
    assert.ok(mapTypes[location.typeId],`${data.id}: known type ${location.typeId}`)
    assert.ok(location.description.length>40 && location.source)
  }
  for(const [step,target] of Object.entries(data.quickLinks)){assert.ok(steps.has(step),`${data.id}: authored guide step ${step}`);assert.ok(targets.has(target),`${data.id}: quick target ${target}`)}
  for(const target of data.targets){assert.ok(target.locationIds.length);for(const id of target.locationIds)assert.ok(locations.has(id));assert.ok(steps.has(target.guideAnchor.replace(/^guide-step-/,'')))}
  markers+=data.locations.length;links+=data.targets.length
}
for(const gap of summary.gaps)assert.ok(!fs.existsSync(path.join(root,`app/data/maps/${gap.id}.json`)),`Unsupported guide must remain unavailable: ${gap.id}`)
console.log(`Classic validation passed: ${summary.maps.length} maps, ${markers} area markers, ${links} real guide targets, ${summary.gaps.length} explicit gaps.`)

// Optional visual QA: use a supplied sharp installation, never a production dependency.
const sharpPath=process.env.CLASSIC_QA_SHARP
if(sharpPath){
  const require=createRequire(import.meta.url),sharp=require(sharpPath)
  const folder=path.join(root,'docs/map-expansion-research/classic-renders');fs.mkdirSync(folder,{recursive:true})
  const cards=[]
  for(const row of summary.maps){
    const file=path.join(root,`public/maps/${row.id}/overview.svg`)
    if(!fs.existsSync(file))continue
    const png=await sharp(file).resize(350,245).png().toBuffer()
    cards.push({input:png,left:(cards.length%4)*350,top:Math.floor(cards.length/4)*245})
  }
  await sharp({create:{width:1400,height:Math.ceil(cards.length/4)*245,channels:4,background:'#0b141d'}}).composite(cards).png().toFile(path.join(folder,'contact-sheet.png'))
  for(const id of ['waw-verruckt','bo1-kino-der-toten','bo2-tranzit','bo2-mob-of-the-dead','bo3-gorod-krovi','bo3-revelations'])await sharp(path.join(root,`public/maps/${id}/overview.svg`)).png().toFile(path.join(folder,`${id}.png`))
  const origin=await sharp(path.join(root,'public/maps/bo2-origins/origins-zedz.jpg')).metadata()
  assert.equal(origin.width,5760);assert.equal(origin.height,3240)
  console.log(`Rendered ${cards.length} original diagrams and verified Origins dimensions.`)
}

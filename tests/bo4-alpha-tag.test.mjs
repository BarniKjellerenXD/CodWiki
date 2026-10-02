import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { alphaRooms, parseAlphaClock, alphaClockRoute, alphaFinalCode, tagRiddleLocations, findTagRiddles } from '../app/utils/bo4AlphaTag.mjs'
import { guides, tools } from '../shared/bo4-alpha-tag.mjs'
const root=fileURLToPath(new URL('../',import.meta.url))

test('clock route preserves broadcast order and identifies every possible remaining room',()=>{
  for(const remaining of Object.keys(alphaRooms)) {
    const letters=Object.keys(alphaRooms).filter(letter=>letter!==remaining).reverse()
    const state=Object.fromEntries(letters.map((letter,i)=>[`slot-${i}`,`${letter}${['0115','1200','1245','0630','0900'][i]}`]))
    const result=alphaClockRoute(state)
    assert.equal(result.status,'ready')
    assert.equal(result.remaining,remaining)
    assert.deepEqual(result.clues.map(row=>row.letter),letters)
    assert.equal(result.clues[0].time,'01:15')
    assert.equal(result.clues[2].minute,45)
  }
})

test('clock helper withholds unknowns and rejects malformed or duplicate room clues',()=>{
  assert.equal(alphaClockRoute({}).status,'waiting')
  assert.equal(alphaClockRoute({'slot-0':'a0115'}).clues[0].room,'Yellow House')
  assert.equal(alphaClockRoute({'slot-0':'A0115','slot-3':'A1245'}).status,'invalid')
  for(const value of ['A0015','G0115','A1360','A01','A0117','11200','A0115junk']) {
    assert.equal(parseAlphaClock(value),null,value)
    assert.equal(alphaClockRoute({'slot-0':value}).status,'invalid',value)
  }
  const partial=alphaClockRoute({'slot-3':'D0630'})
  assert.equal(partial.remaining,null)
  assert.equal(partial.clues[0].index,3)
})

test('final keypad conversion keeps leading zeros and never fills an unread hand',()=>{
  for(let hour=1;hour<=12;hour++)for(const minute of ['00','15','30','45']) {
    assert.equal(alphaFinalCode(String(hour),minute),String(hour).padStart(2,'0')+minute)
  }
  for(const [hour,minute] of [['','00'],['6',''],['0','15'],['13','00'],['6','60'],['6','0']])assert.equal(alphaFinalCode(hour,minute),null)
})

test('photo finder separates 20 offering clues from four Seal safes and accepts alternate wording',()=>{
  assert.equal(tagRiddleLocations.length,24)
  assert.equal(new Set(tagRiddleLocations.map(row=>row.key)).size,24)
  assert.equal(findTagRiddles('','Offering').length,20)
  assert.equal(findTagRiddles('','Seal').length,4)
  assert.equal(findTagRiddles('bread bakes')[0].key,'Offering: Where bread breaks')
  assert.equal(findTagRiddles('CAGES','Seal')[0].location,'Boathouse — framed map')
  assert.equal(findTagRiddles('cages','Offering').length,0)
  assert.equal(findTagRiddles('underwater')[0].key,'Offering: Where lungs close')
  assert.deepEqual(findTagRiddles('not-a-real-clue'),[])
  assert.equal(findTagRiddles('')[0].key,'Offering: Where one mysteries')
})

test('authored guides have real local images, valid own tools and unique saved progress IDs',()=>{
  for(const guide of guides) {
    assert.ok(fs.existsSync(path.join(root,'public',guide.image)))
    const phases=[...guide.phases,...guide.sidePhases]
    const ids=phases.flatMap(phase=>phase.steps.map(step=>step.id))
    assert.equal(new Set(ids).size,ids.length,guide.id)
    assert.equal(new Set(phases.map(phase=>phase.id)).size,phases.length)
    for(const phase of phases) {
      for(const id of phase.tools)assert.ok(tools.some(tool=>tool.id===id&&tool.map===guide.id),id)
      for(const step of phase.steps) {
        assert.ok(step.text.length>40,step.id)
        assert.ok(step.quick.length>10,step.id)
        for(const image of step.images||[])assert.ok(fs.existsSync(path.join(root,'public',image.src)),image.src)
        for(const link of step.links||[])if(link.href.startsWith('#details-'))assert.ok(phases.some(p=>`#details-${p.id}`===link.href),link.href)
      }
    }
  }
  for(const row of tagRiddleLocations)assert.ok(fs.existsSync(path.join(root,'public',row.image)),row.image)
  for(const tool of tools)assert.equal(new Set(tool.fields.map(field=>field.id)).size,tool.fields.length,tool.id)
})

test('Tag charge instructions stay in the guide after retiring its duplicate tracker',()=>{
  assert.ok(!tools.some(tool=>tool.id==='bo4-tag-challenges'))
  const guide=guides.find(guide=>guide.id==='bo4-tag-der-toten')
  const charges=guide.phases.find(phase=>phase.id==='charges')
  const text=charges.steps.map(step=>`${step.text} ${step.note||''}`).join(' ')
  for(const place of ['Beach','Lagoon','Sunken Path','Boathouse','Golden Iceberg'])assert.ok(text.includes(place))
  assert.equal(charges.tools.length,0)
})

test('Rushmore hides old generic fields while preserving their saved-state declarations',()=>{
  const fields=tools.find(tool=>tool.id==='bo4-alpha-rushmore').fields
  const visible=fields.filter(field=>!field.hidden)
  assert.equal(visible.length,7)
  for(let i=0;i<4;i++) {
    assert.equal(fields.find(field=>field.id===`purpose-${i}`).hidden,true)
    assert.equal(fields.find(field=>field.id===`code-${i}`).hidden,true)
  }
  assert.ok(visible.some(field=>field.id==='personnel-0'))
  assert.ok(visible.some(field=>field.id==='painting-2'))
})

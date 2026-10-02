import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { guides, tools } from '../shared/bo4-ix-ancient.mjs'
import { danuWait, dormantHands, tributeResult, raSymbols } from '../app/utils/chaosTools.mjs'

test('Eternal Flame counts claimed rewards for the whole party with half-point precision', () => {
  const solo = tributeResult({players:'1',epic:'1',legendary:'1'})
  assert.equal(solo.earned,10)
  assert.equal(solo.remaining,0)
  const duo = tributeResult({players:'2',epic:'2',legendary:'1',common:'3'})
  assert.equal(duo.earned,17.5)
  assert.equal(duo.remaining,.5)
  assert.equal(tributeResult({players:'4',epic:'6'}).remaining,0)
})

test('Eternal Flame requires a player count and rejects fractional or negative reward counts', () => {
  assert.equal(tributeResult({}).status,'waiting')
  for (const raw of ['-1','1.5','NaN','1000','abc']) assert.equal(tributeResult({players:'1',epic:raw}).status,'invalid')
  assert.equal(tributeResult({players:'1',epic:'0'}).remaining,9)
})

test('Danu does not count the placement-round remainder as a full round or promise readiness', () => {
  assert.match(danuWait('wood','10','11'),/^0 possible full rounds/)
  assert.match(danuWait('wood','10','13'),/^2 possible full rounds/)
  assert.match(danuWait('plant','10','13'),/green smoke/)
  assert.match(danuWait('mix','10','12'),/Collect only when the mixture is ready/)
  assert.match(danuWait('wood','20','19'),/earlier/)
})

test('All twenty Oracle choices resolve to real local image assets and an actionable location', () => {
  assert.equal(dormantHands.length,20)
  assert.equal(new Set(dormantHands.map(item => item.clue)).size,20)
  for (const item of dormantHands) {
    assert.ok(item.location.length > 25)
    assert.ok(existsSync(new URL(`../public${item.image}`, import.meta.url)),item.image)
  }
})

test('Guides preserve original saved IDs and all referenced tools, steps and images are valid', () => {
  const required = {
    'bo4-ix': {setup:3,danu:3,ra:3,zeus:3,boss:2},
    'bo4-ancient-evil': {setup:3,flame:3,theater:2,boss:2}
  }
  const toolIds = new Set(tools.map(tool => tool.id))
  for (const guide of guides) {
    const phases = [...guide.phases,...guide.sidePhases]
    const allSteps = phases.flatMap(phase => phase.steps)
    const ids = allSteps.map(step => step.id)
    assert.equal(new Set(ids).size,ids.length,`${guide.id}: duplicate step ID`)
    for (const [phase,count] of Object.entries(required[guide.id])) {
      assert.ok(guide.phases.some(item => item.id===phase))
      for (let i=1;i<=count;i++) assert.ok(ids.includes(`${phase}-${i}`),`${guide.id}: missing ${phase}-${i}`)
    }
    for (const phase of phases) for (const id of phase.tools) assert.ok(toolIds.has(id),id)
    for (const step of allSteps) for (const image of step.images || []) assert.ok(existsSync(new URL(`../public${image.src}`,import.meta.url)),image.src)
  }
})

test('Ra symbol values remain compatible with existing saved sequences', () => {
  const definition=tools.find(tool=>tool.id==='bo4-ix-ra')
  assert.equal(definition.version,1)
  for (const name of ['Gladiator','Brawler','Tiger','Blightfather','Fire catalyst','Water catalyst','Electric catalyst','Poison catalyst']) {
    assert.ok(definition.fields[0].options.includes(name))
    assert.ok(raSymbols.some(symbol=>symbol.name===name))
  }
})

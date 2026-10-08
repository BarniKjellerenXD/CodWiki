import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { expansionGuides } from '../shared/expansion-guides.mjs'
import { expansionTools } from '../shared/expansion-tools.mjs'
import { normalizeTool, evaluateTool, valveGraph, valveRoutes, morseDigits } from '../app/utils/expansionTools.mjs'
import { sanitizePuzzleState } from '../app/utils/puzzleState.mjs'
import { iceLabels, iceRuneLabels, tagRiddles } from '../shared/expansion-references.mjs'
import { emptyProgress, ensureRun, readProgress, resetRun } from '../app/utils/companion.mjs'

test('all expansion hubs, two Outbreak quests and every inline tool have valid associations', () => {
  const hubs=expansionGuides.filter(g=>!g.parent)
  assert.equal(hubs.length,90)
  assert.equal(hubs.filter(g=>g.gameId==='bo1').length,11)
  assert.equal(hubs.filter(g=>g.gameId==='waw').length,4)
  assert.equal(hubs.filter(g=>g.gameId==='bo2').length,12)
  assert.equal(hubs.filter(g=>g.gameId==='bo6').length,6)
  assert.equal(hubs.filter(g=>g.gameId==='bo3').length,14)
  assert.equal(hubs.filter(g=>g.gameId==='bo4').length,8)
  assert.equal(hubs.filter(g=>g.gameId==='cw').length,5)
  assert.equal(expansionGuides.filter(g=>g.parent).length,2)
  assert.equal(new Set(expansionTools.map(t=>t.id)).size,expansionTools.length)
  for(const guide of expansionGuides) {
    const ids=guide.phases.flatMap(p=>p.steps.map(s=>s.id))
    assert.equal(new Set(ids).size,ids.length,guide.id)
    for(const phase of guide.phases) for(const tool of phase.tools) assert.ok(expansionTools.some(t=>t.id===tool && (t.map===(guide.parent || guide.id) || t.sharedMaps?.includes(guide.id))),`${guide.id}: ${tool}`)
    assert.ok(guide.sources.every(url=>url.startsWith('https://')))
  }
  for(const tool of expansionTools) {
    assert.ok(hubs.some(g=>g.id===tool.map), tool.id)
    assert.equal(new Set(tool.fields.map(f=>f.id)).size,tool.fields.length)
    assert.deepEqual(sanitizePuzzleState(tool.id,{}),normalizeTool(tool.id,{}))
    assert.ok(fs.existsSync(`app/pages/tools/${tool.id}.vue`))
  }
})

test('all 30 valve pairs produce connected routes visiting every room exactly once', () => {
  for(const start of Object.keys(valveGraph)) for(const end of Object.keys(valveGraph)) {
    const routes=valveRoutes(start,end)
    if(start===end){assert.deepEqual(routes,[]);continue}
    assert.equal(routes.length,2,`${start} → ${end}`)
    for(const route of routes) {
      assert.equal(route[0],start);assert.equal(route.at(-1),end)
      assert.equal(new Set(route).size,6)
      route.slice(0,-1).forEach((room,i)=>assert.ok(valveGraph[room].includes(route[i+1])))
    }
  }
  // Independently documented Department Store → Supply Depot solution.
  assert.ok(valveRoutes('Department Store','Supply Depot').some(path=>path.join('|')==='Department Store|Armory|Tank Factory|Infirmary|Dragon Command|Supply Depot'))
  assert.equal(evaluateTool('bo3-gorod-valves',{start:'Armory',end:'Armory'}).status,'invalid')
})

test('Morse calculator accepts digits or Morse and covers every possible three-buoy sum', () => {
  assert.deepEqual(evaluateTool('bo4-blood-morse',{'slot-0':'7','slot-1':'6','slot-2':'2'}).lines,['7 + 6 + 2 = 15','.---- .....'])
  assert.equal(evaluateTool('bo4-blood-morse',{'slot-0':'0','slot-1':'0'}).status,'waiting')
  assert.equal(evaluateTool('bo4-blood-morse',{'slot-0':'.....','slot-1':'-----','slot-2':'----.'}).lines[0],'5 + 0 + 9 = 14')
  for(let a=0;a<10;a++)for(let b=0;b<10;b++)for(let c=0;c<10;c++){
    const result=evaluateTool('bo4-blood-morse',{'slot-0':String(a),'slot-1':morseDigits[b],'slot-2':String(c)})
    assert.equal(result.status,'ready')
    assert.equal(Number(result.lines[1].split(' ').map(code=>morseDigits.indexOf(code)).join('')),a+b+c)
  }
  assert.equal(evaluateTool('bo4-blood-morse',{'slot-0':'.-.-.','slot-1':'0','slot-2':'0'}).status,'invalid')
})

test('zodiac totals keep unknown separate from zero and never resolve ties arbitrarily', () => {
  const state={'sign-0':'Aries','sign-1':'Leo','sign-2':'Pisces'}
  for(let i=0;i<3;i++)for(let j=0;j<3;j++)state[`count-${i}-${j}`]=String(i+j)
  assert.deepEqual(evaluateTool('bo4-dead-of-the-night-zodiac',state).lines,['Aries: 3','Leo: 6','Pisces: 9'])
  state['count-0-0']='';assert.equal(evaluateTool('bo4-dead-of-the-night-zodiac',state).status,'waiting')
  state['count-0-0']='3';assert.equal(evaluateTool('bo4-dead-of-the-night-zodiac',state).status,'invalid')
})

test('clock parsing rejects malformed and duplicate assignments and preserves leading zeros', () => {
  const state=Object.fromEntries(['A0115','B1200','C1245','D0630','E0900'].map((value,i)=>[`slot-${i}`,value]))
  const result=evaluateTool('bo4-alpha-clocks',state)
  assert.equal(result.status,'ready');assert.equal(result.lines[0],'Yellow House: 01:15');assert.match(result.lines.at(-1),/APD Interrogation/)
  assert.equal(evaluateTool('bo4-alpha-clocks',{...state,'slot-4':'A0915'}).status,'invalid')
  assert.equal(evaluateTool('bo4-alpha-clocks',{...state,'slot-4':'E0960'}).status,'invalid')
  const classified=Object.fromEntries(['0001','0615','1234','9999'].map((value,i)=>[`slot-${i}`,value]))
  assert.match(evaluateTool('bo4-classified-codes',classified).lines[0],/0001$/)
})

test('recorders retain observed order, reject bomb duplicates and handle sequence gaps', () => {
  const safe={'slot-2':'09','slot-0':'21','slot-1':'00'}
  assert.deepEqual(evaluateTool('cw-mauer-safe',safe).lines,['21 → 00 → 09'])
  const bombs=Object.fromEntries(Object.keys(valveGraph).map((room,i)=>[`slot-${i}`,room]))
  assert.equal(evaluateTool('bo3-gorod-bombs',bombs).status,'ready')
  bombs['slot-5']=bombs['slot-0'];assert.equal(evaluateTool('bo3-gorod-bombs',bombs).status,'invalid')
  assert.equal(evaluateTool('bo3-moon-simon',{'screen-0':'Red','screen-1':'Green','screen-2':'Blue','screen-3':'Yellow','slot-1':'Red'}).status,'invalid')
  assert.deepEqual(evaluateTool('cw-firebase-darts',{'slot-0':'1','slot-1':'6','slot-2':'1'}).lines,['20','6','20','Bullseye'])
})

test('launch notebook filters actual observations and flags contradictions', () => {
  assert.equal(evaluateTool('cw-outbreak-launch',{}).lines.length,6)
  assert.deepEqual(evaluateTool('cw-outbreak-launch',{first:'A',second:'D'}).lines,['A → D → B'])
  assert.equal(evaluateTool('cw-outbreak-launch',{first:'A','reject-0-A':true}).status,'invalid')
  assert.equal(evaluateTool('cw-outbreak-launch',{first:'A',second:'A'}).status,'invalid')
})

test('new tool state discards unknown keys and wrong types without losing valid observations', () => {
  assert.deepEqual(normalizeTool('cw-mauer-safe',{'slot-0':'09','slot-1':9,'slot-2':null,answer:'fake'}),{'slot-0':'09','slot-1':'','slot-2':''})
  assert.equal(normalizeTool('cw-die-variants',{'check-0':'true'})['check-0'],false)
  assert.equal(evaluateTool('bo3-shang-tiles',{'tile-0-0':'Sun','tile-1-8':' sun '}).lines[0],'Side A 1 ↔ Side B 9: Sun')
})

test('Outbreak quests survive reload and reset independently', () => {
  const state=emptyProgress();ensureRun(state,'cw-outbreak-ravenov').done=['radio-1'];ensureRun(state,'cw-outbreak-excision').done=['rifts-1']
  const restored=readProgress(JSON.stringify(state));resetRun(restored,'cw-outbreak-ravenov')
  assert.deepEqual(restored.runs['cw-outbreak-excision'].done,['rifts-1'])
  assert.deepEqual(restored.runs['cw-outbreak-ravenov'].done,[])
})

test('Origins glyph facts cover all twelve observed pairs and the four-torch selection', () => {
  assert.deepEqual(iceRuneLabels, ['Downward triangle','Vertical stem','L-shaped stem','Stem with two right branches','Vertical stem + triangle','Two vertical stems','Vertical stem + L','Vertical stem + double-branch stem','L + triangle','L + vertical stem','Two L shapes','L + double-branch stem'])
  iceLabels.forEach((pattern,i)=>assert.equal(evaluateTool('bo3-origins-ice',{pattern}).lines[0],iceRuneLabels[i]))
  assert.equal(evaluateTool('bo3-origins-ice',{}).status,'waiting')
  assert.deepEqual(evaluateTool('bo3-origins-fire',{'fire-11':true,'fire-9':true,'fire-6':true,'fire-4':true}).lines,['Torch 11','Torch 9','Torch 6','Torch 4 — bloodstain'])
  assert.equal(evaluateTool('bo3-origins-fire',{'fire-11':true}).status,'waiting')
})

test('Tag offering and Seal clues resolve only exact selections and remain distinct', () => {
  assert.equal(tagRiddles.length,24)
  assert.equal(new Set(tagRiddles.map(r=>r[0])).size,24)
  assert.equal(evaluateTool('bo4-tag-riddles',{clue:'cages'}).status,'waiting')
  assert.match(evaluateTool('bo4-tag-riddles',{clue:'Seal: Where cages hang'}).lines[0],/Boathouse.*Dynamite/)
  assert.match(evaluateTool('bo4-tag-riddles',{clue:'Offering: Where north is found'}).lines[0],/Bridge.*compass/)
})

test('Voyage rejects duplicate planets and keeps Sun last; Rushmore lookup needs no quest notes', () => {
  const sequence = ['Mercury','Venus','Moon','Mars','Jupiter','Saturn','Uranus','Neptune','Sun']
  const state = Object.fromEntries(sequence.map((body,i)=>[`slot-${i}`,body]))
  assert.match(evaluateTool('bo4-voyage-sky',state).lines[0], /Mail Rooms/)
  assert.match(evaluateTool('bo4-voyage-sky',state).lines[8], /Forecastle/)
  assert.equal(evaluateTool('bo4-voyage-sky',{...state,'slot-0':'Sun','slot-8':'Mercury'}).status,'invalid')
  assert.equal(evaluateTool('bo4-voyage-sky',{...state,'slot-8':'Moon'}).status,'invalid')
  assert.match(evaluateTool('bo4-alpha-rushmore',{bonus:'Boom · 2666 · Spawns a live grenade.'}).lines[0], /2666.*live grenade/)
})

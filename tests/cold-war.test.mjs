import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { coldWarGuides, coldWarTools } from '../shared/cold-war-guides.mjs'
import { retiredTools } from '../shared/retired-tools.mjs'
import { normalizeTool } from '../app/utils/expansionTools.mjs'
import { emptyProgress, ensureRun, readProgress, resetRun } from '../app/utils/companion.mjs'
import {
  dartboardNumbers, dartSectorPath, firebaseDartResult, mauerSafeResult, safeRooms,
  outbreakLaunchResult, tvSequence, outbreakLocation, outbreakQuests, outbreakRegions,
  outbreakStages, coldWarToolImages, dieVariants
} from '../app/utils/coldWar.mjs'

const root = new URL('../', import.meta.url)
const read = file => fs.readFileSync(new URL(file, root), 'utf8')
const json = file => JSON.parse(read(file))
const phases = guide => [...guide.phases, ...guide.sidePhases]
const catalogue = json('shared/catalogue.json')
const quick = json('app/data/quickQuests.json')
const search = json('app/data/searchIndex.json')
const oldProgress = json('tests/fixtures/cold-war-progress-v1.json')
const anchors = Object.fromEntries(coldWarGuides.map(g => [g.id, [...read(`app/components/guide/${g.id}.vue`).matchAll(/\bid="([^"]+)"/g)].map(m => m[1])]))

test('Cold War has all five hubs, separate Outbreak quests, discoverable side quests and six useful tools', () => {
  assert.deepEqual(coldWarGuides.map(g => g.id), ['cw-die-maschine','cw-firebase-z','cw-mauer-der-toten','cw-forsaken','cw-outbreak','cw-outbreak-ravenov','cw-outbreak-excision'])
  assert.equal(coldWarTools.length, 6)
  assert.ok(coldWarTools.every(t => t.kind !== 'tracker'))
  assert.equal(catalogue.maps.filter(m => m.gameId === 'cw').length, 5)
  assert.equal(catalogue.guides.filter(m => m.gameId === 'cw').length, 2)
  for (const guide of coldWarGuides) {
    const all = phases(guide), steps = all.flatMap(p => p.steps)
    assert.equal(new Set(all.map(p => p.id)).size, all.length, `${guide.id}: phase IDs`)
    assert.equal(new Set(steps.map(s => s.id)).size, steps.length, `${guide.id}: step IDs`)
    assert.equal(new Set(anchors[guide.id]).size, anchors[guide.id].length, `${guide.id}: generated anchors`)
    assert.ok(guide.sidePhases.length, guide.id)
    assert.ok(guide.sources.some(s => new URL(s).hostname === 'www.reddit.com'), guide.id)
    assert.ok(new Set(guide.sources.map(s => new URL(s).hostname)).size >= 3, guide.id)
    assert.ok(!guide.sources.some(s => s.includes('/wiki/outbreak')), 'Do not cite the Advanced Warfare wiki as Cold War')
    assert.deepEqual(quick[guide.id].flatMap(p => p.steps.map(s => s.id)), guide.phases.flatMap(p => p.steps.map(s => s.id)))
    for (const phase of all) {
      assert.ok(search.some(s => s.route === `/guides/${guide.id}#details-${phase.id}`), `${guide.id} / ${phase.id} indexed`)
      for (const tool of phase.tools) assert.ok(coldWarTools.some(t => t.id === tool && t.map === (guide.parent || guide.id)))
    }
    for (const [oldPhase, steps] of Object.entries(oldProgress[guide.id])) {
      const current = guide.phases.find(p => p.id === oldPhase)
      assert.ok(current, `${guide.id}: preserved ${oldPhase}`)
      for (const id of steps) assert.ok(current.steps.some(s => s.id === id), `${guide.id}: preserved progress ${id}`)
    }
  }
  for (const tool of coldWarTools) {
    assert.equal(tool.version, 1, 'Keep existing browser storage keys')
    assert.ok(catalogue.tools.some(t => t.id === tool.id))
    assert.ok(search.some(s => s.id === tool.id && s.kind === 'Tool'))
  }
})

test('guide, tool and retired-tool links resolve to actual Cold War sections', () => {
  const links = coldWarGuides.flatMap(g => phases(g).flatMap(p => p.steps.flatMap(s => (s.links || []).map(l => l.href))))
  links.push(...Object.entries(retiredTools).filter(([id]) => id.startsWith('cw-')).map(([,href]) => href))
  links.push(...[...read('app/components/puzzle/ColdWar.vue').matchAll(/(?:to|href)="(\/guides\/cw-[^"`]+)"/g)].map(m => m[1]))
  links.push(...dieVariants.map(v => `/guides/cw-die-maschine#${v.anchor}`))
  for (const href of links.filter(h => h.startsWith('/guides/cw-'))) {
    const [route, hash] = href.split('#'), id = route.split('/').at(-1)
    assert.ok(anchors[id], href)
    if (hash) assert.ok(anchors[id].includes(hash), href)
  }
  for (const id of ['cw-firebase-memories','cw-forsaken-neutralizer']) {
    assert.ok(!catalogue.tools.some(t => t.id === id))
    assert.ok(!search.some(s => s.id === id && s.kind === 'Tool'))
    assert.ok(read(`app/pages/tools/${id}.vue`).includes(retiredTools[id]))
  }
})

test('dartboard maps all sectors clockwise, permits repeated stops and never invents missing observations', () => {
  const documented = [20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5]
  assert.deepEqual(dartboardNumbers, documented)
  for (let i = 1; i <= 20; i++) {
    const result = firebaseDartResult({'slot-0':String(i),'slot-1':'1','slot-2':String(i)})
    assert.equal(result.status, 'ready')
    assert.deepEqual(result.numbers, [documented[i-1],20,documented[i-1]])
    assert.ok(!dartSectorPath(i-1).includes('NaN'))
  }
  assert.equal(firebaseDartResult({'slot-0':'1','slot-2':'6'}).status, 'waiting')
  for (const bad of ['0','21','-1','6.5','left']) assert.equal(firebaseDartResult({'slot-0':bad}).status, 'invalid')
})

test('Mauer code preserves leading zeros and fixed room order and rejects partial values', () => {
  assert.deepEqual(safeRooms.map(r => r.name), ['Garment Factory','Service Passage','Grocery Store'])
  assert.deepEqual(safeRooms.map(r => r.images.length), [3,3,3])
  assert.deepEqual(mauerSafeResult({'slot-2':'09','slot-1':'00','slot-0':'21'}).code, ['21','00','09'])
  assert.equal(mauerSafeResult({'slot-0':'00'}).status, 'waiting')
  for (const bad of ['9','123','-1','a0']) assert.equal(mauerSafeResult({'slot-0':bad}).status, 'invalid')
})

test('launch-light solver handles all six orders, two-observation deduction and conflicting lights', () => {
  for (const order of ['ABD','ADB','BAD','BDA','DAB','DBA']) {
    const state = Object.fromEntries([...order].map((c,i) => [`light-${c}`, String(i+1)]))
    const result = outbreakLaunchResult(state)
    assert.equal(result.status,'ready'); assert.deepEqual(result.order,[...order]); assert.deepEqual(result.inferred,[])
    for (const missing of order) {
      const partial = {...state}; delete partial[`light-${missing}`]
      const deduced = outbreakLaunchResult(partial)
      assert.deepEqual(deduced.order,[...order]); assert.deepEqual(deduced.inferred,[missing])
    }
  }
  assert.equal(outbreakLaunchResult({'light-A':'1'}).status,'waiting')
  assert.equal(outbreakLaunchResult({'light-A':'1','light-D':'1'}).status,'invalid')
  assert.equal(outbreakLaunchResult({'light-A':'4'}).status,'invalid')
})

test('TV memory keeps separate 4/8/12 stages and requires every observed flash before playback', () => {
  const state = {}
  for (const n of [4,8,12]) for(let i=0;i<n;i++)state[`tv-${n}-${i}`] = ['Blue','Green','Red','Orange'][i%4]
  const restored = normalizeTool('cw-forsaken-tvs', JSON.parse(JSON.stringify(state)))
  for(const n of [4,8,12]) {
    assert.equal(tvSequence(restored,n).status,'ready')
    assert.equal(tvSequence(restored,n).sequence.length,n)
    const gap = {...restored,[`tv-${n}-1`]:''}
    assert.equal(tvSequence(gap,n).status,'waiting')
    for(const other of [4,8,12].filter(v=>v!==n))assert.equal(tvSequence(gap,other).status,'ready')
  }
  assert.equal(tvSequence({'tv-4-0':'Purple'},4).status,'invalid')
  assert.equal(tvSequence(state,5).status,'invalid')
})

test('Outbreak maps cover every supported region and explain unavailable quest stages', () => {
  assert.equal(outbreakRegions.length,8)
  for(const quest of outbreakQuests)for(const stage of outbreakStages(quest))for(const region of outbreakRegions){
    const result = outbreakLocation({quest,stage,region})
    assert.ok(['ready','unavailable'].includes(result.status), `${quest}/${stage}/${region}`)
    assert.equal(result.images.length > 0,result.status === 'ready')
  }
  assert.equal(outbreakLocation({quest:outbreakQuests[0],region:'Ruka',stage:'Projector'}).status,'unavailable')
  assert.equal(outbreakLocation({quest:outbreakQuests[1],region:'Sanatorium',stage:'Red rift'}).status,'unavailable')
  assert.equal(outbreakLocation({quest:outbreakQuests[0],region:'Zoo',stage:'Red rift'}).status,'invalid')
  assert.equal(outbreakLocation({quest:outbreakQuests[0],region:'Zoo'}).status,'waiting')
  assert.equal(outbreakLocation({quest:outbreakQuests[0],region:'Zoo',stage:'D.I.E. upgrade'}).status,'unavailable')
})

test('Cold War local references match the provenance manifest and contain genuine WebP bytes', () => {
  const manifest = json('docs/cold-war-assets.json').assets
  const required = new Set([...coldWarGuides.flatMap(g => [g.image,...phases(g).flatMap(p=>p.steps.flatMap(s=>(s.images||[]).map(i=>i.src)))]),...coldWarToolImages])
  assert.equal(new Set(manifest.map(a=>a.src)).size,manifest.length)
  assert.equal(required.size,manifest.length)
  for(const src of required){
    assert.ok(src.startsWith('/images/cw-'))
    const entry = manifest.find(a=>a.src===src)
    assert.ok(entry?.url.startsWith('https://mmmrkennedy.com/'),src)
    const bytes=fs.readFileSync(new URL(`public${src}`,root))
    assert.ok(bytes.length>128,src)
    assert.equal(bytes.subarray(8,12).toString(),'WEBP',src)
    if(entry.bytes)assert.equal(bytes.length,entry.bytes,src)
  }
})

test('legacy clues and independent quest progress survive normalization, reload and map reset', () => {
  const oldLaunch = {first:'A',second:'D',third:'B','reject-1-A':true}
  const normalized = normalizeTool('cw-outbreak-launch',oldLaunch)
  for(const [key,value] of Object.entries(oldLaunch))assert.equal(normalized[key],value)
  assert.equal(normalized['light-A'],'')
  assert.equal(normalizeTool('cw-die-variants',{'check-3':true})['check-3'],true)
  assert.deepEqual(normalizeTool('cw-firebase-darts',{'slot-0':'1','slot-1':'6','slot-2':'1'}),{'slot-0':'1','slot-1':'6','slot-2':'1'})
  for(const tool of coldWarTools){
    const input = Object.fromEntries(tool.fields.map(f=>[f.id,f.type==='check'?true:f.options?.[0]||'09']))
    const saved = normalizeTool(tool.id,input)
    assert.deepEqual(normalizeTool(tool.id,JSON.parse(JSON.stringify(saved))),saved,tool.id)
    assert.equal(Object.hasOwn(normalizeTool(tool.id,{...input,unexpected:'x'}),'unexpected'),false)
  }
  const progress=emptyProgress()
  for(const guide of coldWarGuides)ensureRun(progress,guide.id).done=[guide.phases[0].steps[0].id]
  const loaded=readProgress(JSON.stringify(progress));resetRun(loaded,'cw-outbreak-ravenov')
  assert.deepEqual(loaded.runs['cw-outbreak-ravenov'].done,[])
  for(const guide of coldWarGuides.filter(g=>g.id!=='cw-outbreak-ravenov'))assert.deepEqual(loaded.runs[guide.id].done,[guide.phases[0].steps[0].id])
})

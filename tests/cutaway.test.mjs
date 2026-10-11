import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { cutawayConnections, locationFootprints } from '../app/utils/mapCutaway.mjs'

const data=JSON.parse(fs.readFileSync(new URL('../app/data/maps/bo4-voyage-of-despair.json',import.meta.url)))
const layout=data.cutaway
const ids=new Set(layout.footprints.map(f=>f.id))
const roomIds=new Set(layout.rooms.map(r=>r.id))
const levelIds=new Set(layout.levels.map(l=>l.id))
const at=(room,index)=>layout.footprints.find(f=>f.roomId===room&&layout.levels.find(l=>l.id===f.levelId).index===index).id

test('Voyage cutaway separates nine ordered heights and 23 named rooms',()=>{
  assert.deepEqual(layout.levels.map(l=>l.index),[3,2,1,0,-1,-2,-3,-4,-5])
  assert.equal(layout.rooms.length,23)
  assert.equal(ids.size,layout.footprints.length)
  assert.ok(ids.has(layout.defaultFootprint))
  for(const f of layout.footprints){
    assert.ok(roomIds.has(f.roomId)&&levelIds.has(f.levelId),f.id)
    assert.ok(f.start>=0&&f.end<=1&&f.start<f.end,f.id)
  }
  assert.ok(layout.footprints.filter(f=>f.roomId==='lower-grand-staircase').every(f=>f.start<.4))
  assert.ok(layout.footprints.find(f=>f.roomId==='cargo-hold').end<layout.footprints.find(f=>f.roomId==='boiler-room').start)
})

test('cutaway connections resolve, cite evidence and preserve regional precision',()=>{
  assert.equal(new Set(layout.connections.map(c=>c.id)).size,layout.connections.length)
  const guide=fs.readFileSync(new URL('../app/components/guide/bo4-voyage-of-despair.vue',import.meta.url),'utf8')
  for(const c of layout.connections){
    assert.ok(c.from.length&&c.to.length,c.id)
    for(const id of [...c.from,...c.to])assert.ok(ids.has(id),`${c.id}: ${id}`)
    assert.ok(c.note&&c.source,c.id)
    assert.ok(['regional','level'].includes(c.precision))
    if(c.source.startsWith('/guides/'))assert.ok(guide.includes(`id="${c.source.split('#')[1]}"`),c.source)
    if(c.arrival==='level')assert.equal(new Set(c.to.map(id=>layout.footprints.find(f=>f.id===id).levelId)).size,1,c.id)
  }
})

test('portals stay directed, and unknown arrival floors remain multiple candidates',()=>{
  const portals=layout.connections.filter(c=>c.kind==='portal')
  assert.equal(portals.length,8)
  assert.ok(portals.every(c=>c.direction==='forward'&&c.cost===500))
  const cargo=at('cargo-hold',-3)
  const outgoing=cutawayConnections(layout,[cargo],true)
  assert.ok(outgoing.some(c=>c.id==='portal-cargo-boiler'))
  assert.ok(!outgoing.some(c=>c.id==='portal-turbine-cargo'),'No fabricated reverse portal')
  assert.equal(outgoing.find(c=>c.id==='portal-cargo-boiler').destinations.length,3)
  assert.equal(outgoing.find(c=>c.id==='portal-cargo-boiler').arrival,'room')
  assert.ok(cutawayConnections(layout,[cargo]).every(c=>c.kind!=='portal'))
})

test('only documented reverse movement is available for height changes',()=>{
  const mailLower=at('mail-rooms',-2)
  assert.ok(!cutawayConnections(layout,[mailLower]).some(c=>c.id==='mail-down'))
  const bottom=at('lower-grand-staircase',-1)
  const stair=cutawayConnections(layout,[bottom]).find(c=>c.kind==='stairs')
  assert.deepEqual(stair.destinations,[at('lower-grand-staircase',0)])
})

test('service positions and room-wide uncertainty survive filter/selection resolution',()=>{
  const pap=data.locations.find(l=>l.id==='pap-stairs')
  assert.deepEqual(locationFootprints(layout,pap).map(f=>f.id),[at('lower-grand-staircase',-1)])
  assert.equal(pap.availability,'candidate')
  const boiler=data.locations.find(l=>l.id==='boiler-valve')
  assert.equal(locationFootprints(layout,boiler).length,3,'Unknown valve level must not become a precise point')
  assert.deepEqual(locationFootprints(layout,{roomIds:['boiler-room'],footprintIds:['missing']}),[],'Invalid explicit position must not silently broaden')
})

test('the annotated reference separates spawn, Sentinel platform and lower stern services',()=>{
  assert.equal(layout.defaultFootprint,at('forecastle',1),'The spawn star is on reference level +1')
  const landingFor=id=>locationFootprints(layout,data.locations.find(l=>l.id===id)).map(f=>f.id)
  assert.deepEqual(landingFor('sentinel'),[at('poop-deck',2)])
  assert.deepEqual(landingFor('pap-poop'),[at('poop-deck',1)])
  assert.deepEqual(landingFor('shield-bench'),[at('poop-deck',0)])
  const stair=cutawayConnections(layout,[at('poop-deck',1)]).find(c=>c.id==='poop-sentinel-stairs')
  assert.deepEqual(stair.destinations,[at('poop-deck',2)])
  const upperForecastle=layout.footprints.find(f=>f.id===at('forecastle',2))
  const bridge=layout.footprints.find(f=>f.id===at('bridge',3))
  assert.ok(upperForecastle.start>=bridge.start&&upperForecastle.end<=bridge.end,'Upper bow stairs align beneath Bridge')
  const turbine=layout.footprints.filter(f=>f.roomId==='turbine-room')
  assert.ok(turbine.every(f=>f.start>=.6&&f.end<.75),'Turbine sits below the upper aft rooms, not at the stern tip')
})

test('ordinary navigation keeps the intervening decks and rooms visible',()=>{
  const canTravel=(from,to)=>cutawayConnections(layout,[from]).some(c=>c.destinations.includes(to))
  const routes=[
    [['forecastle',1],['forecastle',2],['bridge',3],['upper-grand-staircase',3],['upper-grand-staircase',2],['1st-class-lounge',2],['promenade-port-deck',2],['aft-decks',2],['aft-decks',1],['poop-deck',0],['poop-deck',1],['poop-deck',2]],
    [['poop-deck',0],['3rd-class-berths',0],['3rd-class-berths',-1],['3rd-class-berths',-2],['provisions',-3],['engine-room',-3],['engine-room',-4],['turbine-room',-4],['turbine-room',-5]],
    [['forecastle',1],['forecastle',0],['mail-rooms',-1],['mail-rooms',-2],['cargo-hold',-3]],
  ]
  for(const route of routes)for(let i=1;i<route.length;i++)assert.ok(canTravel(at(...route[i-1]),at(...route[i])),`${route[i-1]} → ${route[i]}`)
  for(const c of layout.connections.filter(c=>c.kind!=='portal')){
    const levels=[...c.from,...c.to].map(id=>layout.levels.find(l=>l.id===layout.footprints.find(f=>f.id===id).levelId).index)
    assert.ok(Math.max(...levels)-Math.min(...levels)<=1,`${c.id} skips an intervening deck`)
  }
  const cargo=cutawayConnections(layout,[at('cargo-hold',-3)])
  assert.ok(cargo.every(c=>c.destinations.every(id=>id.startsWith('mail-rooms-'))),'No imaginary lower corridor from Cargo to machinery')
})

test('legacy room groups, service IDs and guide target IDs continue to resolve',()=>{
  const all=new Set([...data.locations,...data.targets].map(l=>l.id))
  for(const id of ['area-forecastle','area-upper','area-poop','area-mail','area-stairs','area-berths','area-cargo','area-turbine','area-engine','sentinel','pap-poop','pap-stairs','pap-cargo','pap-turbine','shield-bench','distillation-bench','cargo-valve','boiler-valve'])assert.ok(all.has(id),id)
  for(const target of data.targets)for(const id of target.locationIds)assert.ok(data.locations.some(l=>l.id===id),`${target.id}/${id}`)
  for(const id of Object.values(data.quickLinks))assert.ok(data.targets.some(t=>t.id===id),id)
  assert.deepEqual(data.targets.find(t=>t.id==='area-upper').locationIds,['area-bridge','area-state-rooms','area-1st-class-lounge'])
})

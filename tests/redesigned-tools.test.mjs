import test from 'node:test'
import assert from 'node:assert/strict'
import { planRingRoute } from '../app/utils/ringRoute.mjs'
import { solveMurder } from '../app/utils/murder.mjs'
import { sanitizePuzzleState, migratePuzzleState } from '../app/utils/puzzleState.mjs'

// Independent reverse-graph Dijkstra oracle, with numeric costs instead of the
// production planner's forward layered search and per-state direction tiebreak.
function ringOracle(target = 'tour') {
  const destinations = [1, 2, 4, 5], nodes = [], reverse = [], index = new Map(), unit = 10000
  for (let mask=0;mask<(target==='tour'?16:1);mask++) for(let a=0;a<6;a++) for(let b=0;b<6;b++) for(let c=0;c<6;c++) for(const last of [0,1,-1]) {
    index.set([a,b,c,mask,last].join('/'),nodes.length); nodes.push([a,b,c,mask,last]); reverse.push([])
  }
  nodes.forEach(([a,b,c,mask,last],id)=>{
    for(let ring=0;ring<3;ring++) for(const dir of [-1,1]) {
      const next=[a,b,c].map((position,i)=>(position+dir*(ring===i?1:2)+6)%6)
      let nextMask=mask
      if(target==='tour'&&next[0]===next[1]&&next[1]===next[2]&&destinations.includes(next[0])) nextMask|=1<<destinations.indexOf(next[0])
      reverse[index.get([...next,nextMask,dir].join('/'))].push([id,unit+(last!==0&&last!==dir?1:0)])
    }
  })
  const costs=new Float64Array(nodes.length).fill(Infinity), heap=[]
  function push(pair){let i=heap.length;heap.push(pair);while(i){const p=(i-1)>>1;if(heap[p][0]<=pair[0])break;heap[i]=heap[p];i=p}heap[i]=pair}
  function pop(){const out=heap[0],tail=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let child=i*2+1;if(child+1<heap.length&&heap[child+1][0]<heap[child][0])child++;if(heap[child][0]>=tail[0])break;heap[i]=heap[child];i=child}heap[i]=tail}return out}
  nodes.forEach(([a,b,c,mask],id)=>{if(target==='tour'?mask===15:a===target&&b===target&&c===target){costs[id]=0;push([0,id])}})
  while(heap.length){const [cost,id]=pop();if(cost!==costs[id])continue;for(const [prev,weight] of reverse[id])if(cost+weight<costs[prev]){costs[prev]=cost+weight;push([cost+weight,prev])}}
  return (positions,mask)=>{
    if(target==='tour'&&positions.every(p=>p===positions[0])&&destinations.includes(positions[0]))mask|=1<<destinations.indexOf(positions[0])
    const cost=costs[index.get([...positions,mask,0].join('/'))]
    return [Math.floor(cost/unit),cost%unit]
  }
}

test('all 216 ring positions × 16 completion masks have globally optimal tours and direction changes',()=>{
  const oracle=ringOracle(), temples=[1,2,4,5]
  for(let a=0;a<6;a++)for(let b=0;b<6;b++)for(let c=0;c<6;c++)for(let mask=0;mask<16;mask++){
    const start=[a,b,c], completed=temples.filter((_,i)=>mask&(1<<i)), route=planRingRoute(start,'tour',completed)
    assert.ok(route)
    assert.deepEqual([route.presses,route.switches],oracle(start,mask),`start=${start}, done=${mask}`)
    const seen=new Set(completed), expectedStops=[];let state=start.slice()
    const arrive=press=>{if(state.every(p=>p===state[0])&&temples.includes(state[0])&&!seen.has(state[0])){seen.add(state[0]);expectedStops.push([state[0],press])}}
    arrive(0)
    route.moves.forEach(([ring,direction],i)=>{state=state.map((p,j)=>(p+direction*(ring===j?1:2)+6)%6);assert.deepEqual(route.states[i+1],state);arrive(i+1)})
    assert.equal(seen.size,4)
    assert.deepEqual(route.legs.map(l=>[l.temple,l.press]),expectedStops)
    const expanded=[]
    for(const leg of route.legs)for(const group of leg.groups){assert.ok(group.to<=leg.press);for(let i=0;i<group.count;i++)expanded.push([group.ring,group.direction])}
    assert.deepEqual(expanded,route.moves)
  }
})

test('single-temple routes also minimise direction changes and reject incomplete positions',()=>{
  for(const target of [1,2,4,5]){
    const oracle=ringOracle(target)
    for(let a=0;a<6;a++)for(let b=0;b<6;b++)for(let c=0;c<6;c++){
      const route=planRingRoute([a,b,c],target)
      assert.deepEqual([route.presses,route.switches],oracle([a,b,c],0))
      assert.deepEqual(route.states.at(-1),[target,target,target])
      assert.equal(route.legs.at(-1).temple,target)
    }
  }
  for(const start of [[null,0,0],[6,0,0],[],null])assert.equal(planRingRoute(start),null)
  assert.equal(planRingRoute([0,0,0],3),null)
  assert.deepEqual(planRingRoute([2,2,2],'tour',[1,2,4,5]).legs,[])
  assert.equal(planRingRoute([2,2,2]).legs[0].press,0)
})

test('murder deduction matches all nine Margwa combinations and keeps unknowns unresolved',()=>{
  const fixture={merchant:[null,'plumPit','pufferfish'],noble:['pufferfish','monkshood',null],gardener:['plumPit',null,'monkshood']}
  for(const [suspect,answers] of Object.entries(fixture))for(const [i,symptom] of ['emesis','plant','paralysis'].entries()){
    const result=solveMurder({suspect,symptom,poison:'ignored'})
    assert.equal(result.poison,answers[i]);assert.equal(result.status,answers[i]?'known':'unknown')
  }
  assert.equal(solveMurder({symptom:'plant'}).status,'incomplete')
  assert.equal(solveMurder({suspect:'merchant'}).poison,null)
  const result=solveMurder({suspect:'gardener',symptom:'paralysis',hour:0,delay:5,painting:'mountains'})
  assert.deepEqual(result.items,['comb','shears','monkshood','horse','medallion']);assert.equal(result.dial,7)
  for(const [painting,item] of Object.entries({fish:'teaWhisk',mountains:'horse',bird:'brush'}))assert.equal(solveMurder({painting}).items[3],item)
  for(let hour=0;hour<12;hour++)for(let delay=1;delay<=5;delay++)assert.equal(solveMurder({hour,delay}).dial,(hour+12-delay)%12)
  for(const delay of [0,6,12,null,NaN])assert.equal(solveMurder({hour:0,delay}).dial,null)
})

test('redesigned tools retain compatible clues, discard manual poison and require actual positions',()=>{
  assert.deepEqual(sanitizePuzzleState('rings',{}),{positions:[null,null,null],target:'tour',visited:[]})
  assert.deepEqual(sanitizePuzzleState('rings',{positions:[2,0,1],target:5,visited:[1,4]}),{positions:[2,0,1],target:5,visited:[1,4]})
  const old={suspect:'courtier',symptom:'plant',poison:'plumPit',hour:3,delay:9,painting:'fish'}
  const migrated=sanitizePuzzleState('murder',old)
  assert.equal(migrated.suspect,'noble');assert.equal(migrated.poison,undefined);assert.equal(migrated.delay,null)
  assert.equal(solveMurder(migrated).poison,'monkshood');assert.equal(old.poison,'plumPit')
  assert.equal(migratePuzzleState('murder',{suspect:'gardener',symptom:'paralysie'}).symptom,'paralysis')
})

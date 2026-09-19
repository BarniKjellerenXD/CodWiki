import test from 'node:test'
import assert from 'node:assert/strict'
import { ingredients,rocketCode,organOrder,solveScroll,scrollMasks,solveFlags,moveRing,solveRings,temples,uraniumGroups,solveUranium,noteOrder,zodiacHour,pillarRiddles } from '../app/utils/puzzles.mjs'
import {sanitizePuzzleState,migratePuzzleState} from '../app/utils/puzzleState.mjs'
import {partStatus,togglePart,emptyProgress,ensureRun,readProgress,resetRun} from '../app/utils/companion.mjs'

test('chalkboard mapping and four verified two-digit rocket outputs',()=>{
  assert.deepEqual(ingredients.map(i=>[i.word,i.name]),[['FUNGI','Widow’s Lantern'],['LIMBS','Mysterious Limb'],['OCULI','Ravager Eyes'],['CONCH','Hoard Hunk Chunks'],['TALUS','Human Bones']])
  for(const [word,answer] of Object.entries({LAUNCH:'11 00 20 13 02 07',WEAPON:'22 04 00 15 14 13',ENGINE:'04 13 06 08 13 04',ROCKET:'17 14 02 10 04 19'})) assert.equal(rocketCode(word).join(' '),answer)
  assert.deepEqual(rocketCode('UNKNOWN'),[])
})
test('organ inserts the missing symbol at any static slot; rejects incomplete/duplicate input',()=>{
  const expected=[1,4,3,2,5]
  for(let i=0;i<5;i++){const input=expected.slice();input[i]=0;assert.deepEqual(organOrder(input),expected)}
  for(const input of [[1,4,0,2,null],[1,1,0,2,5],[0,0,3,2,5],[1,4,3,2,5]])assert.equal(organOrder(input),null)
})
test('scroll solver reaches all-IN for every one of 512 boards under one independent rule',()=>{
  const masks=[11,23,38,89,186,308,200,464,416]
  assert.deepEqual(scrollMasks,masks)
  for(let board=0;board<512;board++) {
    const moves=solveScroll(board);assert.ok(moves,`board ${board}`)
    assert.equal(moves.reduce((s,i)=>s^masks[i],board),0)
  }
  assert.deepEqual(solveScroll(0),[])
  assert.equal(solveScroll(-1),null)
})
test('flags respect two holders and global inventory; edits cannot return stale answers',()=>{
  assert.equal(solveFlags([null,2,3,4],[8,8,8,8,8,8]),null)
  assert.deepEqual(solveFlags([3,3,3,3],[8,0,0,0,0,0]),[]) // Three 1s are forbidden.
  const targets=[7,8,9,10], inventory=[0,1,2,2,0,3]
  const results=solveFlags(targets,inventory);assert.ok(results.length)
  for(const solution of results){const used=[0,0,0,0,0,0];solution.forEach((flags,i)=>{assert.ok(flags.length<=2);assert.equal(flags.reduce((a,b)=>a+b,0),targets[i]);flags.forEach(n=>used[n-1]++)});assert.ok(used.every((n,i)=>n<=inventory[i]))}
  assert.deepEqual(solveFlags([12,12,12,12],inventory),[])
})
test('ring fixtures match independent solver and every starting state can be replayed',()=>{
  // Reference: inner Caltheris, middle Empty, outer Dravakar → Veytharion:
  // clockwise inner 3, middle 1, outer 2 (codzombiessolver.com).
  let fixture=[2,0,1];for(const [ring,count] of [[0,3],[1,1],[2,2]])for(let n=0;n<count;n++)fixture=moveRing(fixture,ring,1)
  assert.deepEqual(fixture,[5,5,5])
  const replay=(s,[ring,direction])=>s.map((p,i)=>(p+direction*(i===ring?1:2)+6)%6)
  for(let a=0;a<6;a++)for(let b=0;b<6;b++)for(let c=0;c<6;c++)for(const target of temples){const start=[a,b,c],moves=solveRings(start,target);assert.ok(moves);assert.deepEqual(moves.reduce(replay,start),[target,target,target])}
  const visits=new Set([1]);let state=[1,1,1];for(const move of solveRings(state,'tour')){state=replay(state,move);if(state.every(n=>n===state[0])&&temples.includes(state[0]))visits.add(state[0])}assert.equal(visits.size,4)
  assert.deepEqual(solveRings([1,1,1],'tour',[1,2,4,5]),[])
})
test('lever fixture columns follow physical landmarks, including the lower crank',()=>{
  assert.deepEqual(pillarRiddles.map(r=>r.counts),[[0,3,2],[3,1,2],[1,2,2],[2,2,0]])
})
test('uranium activates only orthogonal groups containing new pieces',()=>{
  assert.deepEqual(uraniumGroups([0,1,2,3,4,5],[11,14,15]),[3])
  assert.deepEqual(uraniumGroups([0,1,2,3,4,5],[6,11,12]),[1,1,7])
  assert.ok(solveUranium([0,1,2,3,4,5]).some(s=>s.added.join(',')==='6,11,12'))
  assert.deepEqual(solveUranium([0,1,2,9,10,11]),[])
  assert.deepEqual(solveUranium([0,0,1,2,3,4]),[])
})
test('uranium reproduces the published historical 8008-board model census',()=>{
  let solved=0,unsolved=0
  for(let a=0;a<11;a++)for(let b=a+1;b<12;b++)for(let c=b+1;c<13;c++)for(let d=c+1;d<14;d++)for(let e=d+1;e<15;e++)for(let f=e+1;f<16;f++){
    if(solveUranium([a,b,c,d,e,f]).length)solved++;else unsolved++
  }
  assert.equal(solved,7934);assert.equal(unsolved,74)
})
test('note order preserves locations and exposes incomplete/duplicate clues',()=>{
  const result=noteOrder([8,3,6,1,7,2,5,4]);assert.equal(result.complete,true)
  assert.deepEqual(result.assigned.map(n=>n.id),['teleporter','wall','garden','exfil','rock','bus','garage','bunker'])
  assert.deepEqual(noteOrder([1,1,3,4,5,6,7,null]).duplicates,[1]);assert.equal(noteOrder([1,1,3,4,5,6,7,null]).complete,false)
  assert.deepEqual(noteOrder([1,2,3,4,5,6,7,null]).missing,[8])
  for(let offset=0;offset<8;offset++){const counts=Array.from({length:8},(_,i)=>(i+offset)%8+1);assert.deepEqual(noteOrder(counts).assigned.map(n=>n.count),[1,2,3,4,5,6,7,8])}
})
test('poison hour subtraction wraps the zodiac and requires both recorded clues',()=>{
  assert.equal(zodiacHour(1,3),10);assert.equal(zodiacHour(0,12),0);assert.equal(zodiacHour(null,3),null);assert.equal(zodiacHour(0,0),null)
})
test('saved puzzle input is validated and incompatible fields are discarded',()=>{
  assert.deepEqual(sanitizePuzzleState('organ',{slots:[1,6,'3',0,5,2],answer:[1]}),{slots:[1,null,null,0,5]})
  assert.deepEqual(sanitizePuzzleState('notes',{counts:[1,1,9,-1,'2',2]}),{counts:[1,1,null,null,null,2,null,null]})
  assert.deepEqual(sanitizePuzzleState('uranium',{existing:[0,0,16,-1,2]}),{existing:[0,2]})
  assert.deepEqual(sanitizePuzzleState('wunder',{counts:[8,8,7,9]}),{counts:[null,8,7,null]})
  assert.deepEqual(sanitizePuzzleState('planets',{slots:['N','N','S']}),{slots:['N','N','S']})
  assert.deepEqual(sanitizePuzzleState('serum',{slots:['fungi','bad','talus'],picked:['conch']}),{slots:['fungi',null,'talus']})
})
test('part completion keeps legacy partial progress and unrelated maps/preferences',()=>{
  const steps=[{id:'a'},{id:'b'}],done=['a','other'];assert.equal(partStatus(done,steps),'partial')
  const complete=togglePart(done,steps);assert.equal(partStatus(complete,steps),'complete');assert.deepEqual(togglePart(complete,steps),['other'])
  const progress=emptyProgress();Object.assign(ensureRun(progress,'ashes'),{done,hideCompleted:true});ensureRun(progress,'rex').done=['x'];progress.toys.ashes=true
  const restored=readProgress(JSON.stringify(progress));assert.equal(restored.runs.ashes.hideCompleted,true);resetRun(restored,'ashes');assert.deepEqual(restored.runs.rex.done,['x']);assert.equal(restored.toys.ashes,true);assert.equal(restored.runs.ashes.hideCompleted,true)
})

test('legacy migration preserves compatible clues but never imports obsolete solutions',()=>{
 assert.deepEqual(migratePuzzleState('rocket',{selected:'ENGINE'}),{word:'ENGINE'})
 assert.deepEqual(migratePuzzleState('mars',{picked:['venus','mars','neptune']}),{slots:[2,4,8]})
 assert.deepEqual(migratePuzzleState('planets',{assignment:{N:'mars',SW:'saturn',E:'neptune'}}),{slots:['N','SW','E']})
 assert.deepEqual(migratePuzzleState('uranium',{placed:[0,1,2,3,4,5],solution:[6,7,8]}),{existing:[0,1,2,3,4,5]})
 assert.equal(migratePuzzleState('organ',{picked:[1,4,2,5]}),null)
 assert.equal(migratePuzzleState('serum',{picked:['fungi','talus']}),null)
})

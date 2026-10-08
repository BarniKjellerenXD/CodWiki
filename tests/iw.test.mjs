import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluateIW, decodeDigitMorse, filterShaolinWords, chemicalRoute, reactionCost, solveDisks, queenSolutions, skullSequences } from '../app/utils/iw.mjs'
import { chemicalRecipes, chemicalRaw, chemicalFinals, diskRows, skullWords } from '../shared/iw-data.mjs'
import { iwTools } from '../shared/iw-tools.mjs'
import { iwGuides } from '../shared/iw-guides.mjs'
import { groupVisible, changeObservation, clearScope } from '../app/utils/remainingUi.mjs'

test('digit Morse preserves zeroes and rejects a bad middle group without merging neighbors',()=>{
  assert.equal(decodeDigitMorse('----- .---- ..---').message,'Poster number: 012')
  assert.equal(decodeDigitMorse('----- / .---- / ..---').message,'Poster number: 012')
  assert.equal(decodeDigitMorse('...').status,'waiting')
  assert.equal(decodeDigitMorse('----- ...... ..---').status,'invalid')
  assert.equal(decodeDigitMorse('----- ...... ..---').lines.length,3)
  assert.equal(decodeDigitMorse('----- ..-.. ..---').status,'invalid')
  assert.equal(decodeDigitMorse('----- .---- ..--- ...--').status,'invalid')
})

test('word filtering respects positions, absent letters and repeated-letter counts',()=>{
  assert.deepEqual(filterShaolinWords({mask:'RAT____',length:'7'}).candidates,['RATKING'])
  assert.deepEqual(filterShaolinWords({inventory:'AAAA'},['RATKING','AAAA','AAA','BAAA']).candidates,['AAAA'])
  assert.deepEqual(filterShaolinWords({mask:'_A_',rejected:'T',length:'3'},['CAT','BAR','CAR']).candidates,['BAR','CAR'])
  assert.equal(evaluateIW('iw-shaolin-word',{mask:'ZZZZ'}).status,'invalid')
  assert.equal(evaluateIW('iw-shaolin-word',{mask:'R'}).status,'ambiguous')
})

test('speaker memory preserves repeats and rejects unknown holes and duplicate layout',()=>{
  const state={'speaker-0':'Red','speaker-1':'Green','speaker-2':'Blue','speaker-3':'Yellow','flash-0':'Blue','flash-1':'Blue','flash-2':'Red'}
  assert.deepEqual(evaluateIW('iw-spaceland-speakers',state).lines,['1. Blue → speaker 3','2. Blue → speaker 3','3. Red → speaker 1'])
  assert.equal(evaluateIW('iw-spaceland-speakers',{...state,'flash-1':''}).status,'invalid')
  assert.equal(evaluateIW('iw-spaceland-speakers',{...state,'speaker-1':'Red'}).status,'invalid')
})

test('every chemistry route is topological, deduplicated and contains only final dependencies',()=>{
  for(const final of chemicalFinals){
    const route=chemicalRoute(final)
    assert.equal(route.at(-1),final)
    assert.equal(new Set(route).size,route.length)
    route.forEach((id,index)=>chemicalRecipes[id].ingredients.filter(k=>chemicalRecipes[k]).forEach(k=>assert.ok(route.indexOf(k)<index)))
    assert.equal(route.filter(id=>chemicalRecipes[id].final).length,1)
  }
  assert.deepEqual(chemicalRoute('tetra-nitro-phenol'),['phenol','phenolsulfonic-acid','tetra-nitro-phenol'])
  assert.deepEqual(chemicalRoute('tetra-nitrite'),['glycerol','mixed-acid','nitrated-glycerol','tetra-nitrite'])
  assert.deepEqual(chemicalRoute('not-a-recipe'),[])
})

test('reaction calculations subtract O once, preserve intermediate diamond distinction and reject impossible input',()=>{
  assert.deepEqual(reactionCost(['vodka','pennies'],{vodka:[6,2],pennies:[3,4]},4),{total:11,arithmetic:'6 + 2 + 3 + 4 − 4 = 11'})
  assert.equal(reactionCost(['wheel-cleaner','motor-oil','insect-repellent'],{'wheel-cleaner':[4,7],'motor-oil':[2,4],'insect-repellent':[2,3]},8).total,14)
  assert.equal(reactionCost(['vodka'],{vodka:[1,1]},3).error.includes('impossible'),true)
  assert.equal(reactionCost(['hexamine'],{hexamine:[null,4]},4).missing,'hexamine')
  // The keypad code for manufacturing Hexamine must not replace its observed diamond pair.
  assert.equal(reactionCost(['hexamine','vinegar','detergent','plant-food'],{hexamine:[2,3],vinegar:[1,2],detergent:[3,1],'plant-food':[2,2]},4).total,12)
})

function chemistryState(){
  const state={m:'26','tv-low':'107','tv-high':'109','tv-below':'Green','tv-middle':'Blue','tv-above':'Red',final:'tetra-nitrite','value-filter':'Green'}
  for(let i=0;i<4;i++){state[`o-${i}`]=String(i+1);for(const colour of ['Red','Green','Blue'])state[`o-${i}-${colour}`]=i===3?'Equal':'Not equal'}
  for(const ingredient of [...Object.keys(chemicalRaw),...Object.keys(chemicalRecipes)]){state[`top-${ingredient}`]='5';state[`left-${ingredient}`]='5'}
  return state
}
test('chemistry requires confirmed O, uses inclusive TV bands and invalidates mismatched diamond context',()=>{
  const state=chemistryState()
  assert.equal(evaluateIW('iw-attack-chemistry',state).status,'ready')
  assert.ok(evaluateIW('iw-attack-chemistry',state).lines.some(line=>line.includes('Required reaction filter: Green')))
  assert.equal(evaluateIW('iw-attack-chemistry',{...state,'o-2-Red':'Equal','o-2-Green':'Equal','o-2-Blue':'Equal'}).status,'ambiguous')
  assert.equal(evaluateIW('iw-attack-chemistry',{...state,'o-3-Blue':''}).status,'waiting')
  assert.equal(evaluateIW('iw-attack-chemistry',{...state,'value-filter':'Red'}).status,'waiting')
  const boundary={...state,m:'27','value-filter':'Blue'}
  assert.ok(evaluateIW('iw-attack-chemistry',boundary).lines.some(line=>line.includes('Required reaction filter: Blue')))
})

test('life-ray and bomb strings remain independent; rejection is scoped to an exact accepted prefix',()=>{
  const state=Object.fromEntries(['3','4','5','6','8'].map((n,i)=>[`life-${i}`,n]))
  assert.deepEqual(evaluateIW('iw-attack-codes',{...state,bomb:'0048'}).lines.slice(0,2),['Life ray: 34568.','Death ray: 86543.'])
  assert.ok(evaluateIW('iw-attack-codes',{...state,bomb:'0048'}).lines.some(line=>line.includes('0048')))
  assert.equal(evaluateIW('iw-attack-codes',{bomb:'048'}).status,'invalid')
  const rejected=evaluateIW('iw-attack-codes',{'reject-prefix':'34','reject-digit':'5'})
  assert.ok(rejected.lines[0].startsWith('118 '))
  assert.equal(evaluateIW('iw-attack-codes',{'life-0':'3','life-1':'3'}).status,'invalid')
})

test('disk matching exhausts all 495 distinct subsets and agrees with every matching row',()=>{
  let count=0,unmatched=0,ambiguous=0
  for(let a=0;a<9;a++)for(let b=a+1;b<10;b++)for(let c=b+1;c<11;c++)for(let d=c+1;d<12;d++){
    const selected=[a,b,c,d],answer=solveDisks(selected)
    const expected=[...new Map(diskRows.filter(row=>selected.every(n=>row.includes(n))).map(row=>{const sequence=row.filter(n=>selected.includes(n));return [sequence.join(','),sequence]})).values()]
    assert.deepEqual(answer.orders,expected)
    const state=Object.fromEntries(selected.map((n,i)=>[`disk-${i}`,String(n)]))
    assert.equal(evaluateIW('iw-beast-disks',state).status,expected.length===0?'invalid':expected.length===1?'ready':'ambiguous')
    count++;if(!expected.length)unmatched++;if(expected.length>1)ambiguous++
  }
  assert.equal(count,495)
  assert.ok(unmatched>0)
  assert.ok(ambiguous>0)
  assert.deepEqual(solveDisks([1,2,3,4]).orders,[[1,2,3,4]])
  assert.ok(solveDisks([1,1,2,3]).error)
})

test('eight queens enumerates 92 solutions and preserves every fixed square',()=>{
  const solutions=queenSolutions()
  assert.equal(solutions.length,92)
  for(const board of solutions){assert.equal(new Set(board).size,8);for(let r=0;r<8;r++)for(let s=r+1;s<8;s++)assert.notEqual(Math.abs(board[r]-board[s]),s-r)}
  for(let row=0;row<8;row++)for(let col=0;col<8;col++)assert.deepEqual(queenSolutions({[row]:col}),solutions.filter(board=>board[row]===col))
  assert.equal(queenSolutions({0:0,1:1}).length,0)
  assert.equal(evaluateIW('iw-beast-queens',{'fixed-row':'0','fixed-column':'0','extra-1':'1'}).status,'invalid')
})

test('handle performed-action edits do not mutate the frozen snapshot',()=>{
  const state={pass:'Initial snapshot',frozen:true,...Object.fromEntries(Array.from({length:16},(_,i)=>[`initial-${i}`,i===0?'Horizontal':'Vertical']))}
  const before=structuredClone(state)
  assert.equal(evaluateIW('iw-beast-handles',state).lines[0],'A1: not marked flipped.')
  assert.equal(evaluateIW('iw-beast-handles',{...state,'action-0':true}).lines[0],'A1: marked flipped.')
  assert.deepEqual(state,before)
  assert.equal(evaluateIW('iw-beast-handles',{...state,frozen:false}).status,'waiting')
  const reobserved={...state,pass:'Re-observed snapshot','current-frozen':true,...Object.fromEntries(Array.from({length:16},(_,i)=>[`current-${i}`,i===5?'Horizontal':'Vertical']))}
  assert.deepEqual(evaluateIW('iw-beast-handles',reobserved).lines,['B2: not marked flipped.'])
  assert.equal(reobserved['initial-0'],'Horizontal')
})

test('shared UI integration exposes one handle pass and preserves its independent state',()=>{
  const definition=iwTools.find(tool=>tool.id==='iw-beast-handles')
  assert.deepEqual(definition.groups.filter(group=>groupVisible(group,{pass:'Initial snapshot'})).map(group=>group.id),['pass','initial','freeze','actions'])
  assert.deepEqual(definition.groups.filter(group=>groupVisible(group,{pass:'Re-observed snapshot'})).map(group=>group.id),['pass','current','current-freeze','current-actions'])
  const state={pass:'Re-observed snapshot',frozen:true,'initial-0':'Horizontal','current-0':'Vertical','current-frozen':true}
  assert.equal(changeObservation(definition,state,'initial-0','Vertical')['initial-0'],'Horizontal')
  assert.equal(changeObservation(definition,state,'current-0','Horizontal')['current-0'],'Vertical')
  assert.equal(clearScope(definition,state,definition.resetScopes[0])['initial-0'],'Horizontal')
  assert.equal(evaluateIW('iw-beast-handles',{}).status,'waiting')
})

test('Skull Hop gives the original BENZENE fixture and wraps zero remainder to Z',()=>{
  const byLetter=skullSequences(['A','B','C','D'])
  assert.deepEqual([...'BENZENE'].map(letter=>byLetter[letter]),[[2],[1,1],[2,3],[1,1,3],[1,1],[2,3],[1,1]])
  assert.deepEqual(skullSequences(['Z','B','C','D']).Z,[1])
  const state={word:'BENZENE','symbol-0':'A','symbol-1':'B','symbol-2':'C','symbol-3':'D'}
  assert.equal(evaluateIW('iw-attack-skull-hop',state).status,'ready')
  for(const word of skullWords)assert.equal(evaluateIW('iw-attack-skull-hop',{...state,word}).status,'ready')
})

test('all ten tools use flat unique fields and link to a phase on their owner guide',()=>{
  assert.equal(iwTools.length,10)
  assert.equal(iwGuides.length,5)
  for(const map of iwGuides){const ids=[...map.phases,...map.sidePhases].flatMap(part=>part.steps.map(item=>item.id));assert.equal(new Set(ids).size,ids.length)}
  for(const definition of iwTools){
    const map=iwGuides.find(g=>g.id===definition.map)
    assert.ok(map)
    assert.ok([...map.phases,...map.sidePhases].some(p=>p.id===definition.guidePhase))
    assert.equal(new Set(definition.fields.map(f=>f.id)).size,definition.fields.length)
    assert.ok(definition.fields.every(f=>f.options===null||Array.isArray(f.options)))
  }
  assert.equal(evaluateIW('unowned-tool',{}),null)
})

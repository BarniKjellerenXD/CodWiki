import refs from '../data/bo2References.json' with {type:'json'}
export const {mahjongColours,mahjongTiles,mineSigns,leverColours,bellRooms,mahjongLocations,toolSections}=refs
const result=(status,message,extra={})=>({status,message,lines:[],...extra})
const duplicates=values=>new Set(values.filter(Boolean)).size!==values.filter(Boolean).length
export function mahjongResult(state={}){
 const numbers=[1,2,3,4].map(n=>state[`number-${n}`]||'')
 const directions=['North','East','South','West']
 const colours=directions.map(d=>state[`direction-${d}`]||'')
 if([...numbers,...colours].some(v=>v&&!mahjongColours.includes(v)))return result('invalid','Choose one of the four tile colours.')
 if(duplicates(numbers)||duplicates(colours))return result('invalid','Each colour appears once among the numbers and once among the directions. Recheck repeated colours.')
 if([...numbers,...colours].some(v=>!v))return result('waiting','Record all eight tile colours before striking the tower.')
 const order=numbers.map(colour=>({direction:directions[colours.indexOf(colour)],colour}))
 return result('ready','Strike the legs in this order with Galvaknuckles.',{order,lines:order.map((p,i)=>`${i+1}. ${p.direction} (${p.colour})`)})
}
export function signResult(state={}){
 const ids=[0,1,2].map(i=>state[`line-${i}`]||'')
 if(ids.some(id=>id&&!mineSigns.some(s=>s.id===id)))return result('invalid','Choose a pictured sign for each code line.')
 if(duplicates(ids))return result('invalid','The three signs should be different. Check the red strokes on Bone Orchard and Consumption Cross.')
 const signs=ids.map(id=>mineSigns.find(s=>s.id===id)||null)
 return result(signs.every(Boolean)?'ready':'waiting',signs.every(Boolean)?'These are your three mine signs.':'Match each line of the code to a photographed pair.',{signs,lines:signs.map((s,i)=>`${i+1}. ${s?.name||'Not matched'}`)})
}
const permutations=items=>items.length===0?[[]]:items.flatMap((v,i)=>permutations(items.filter((_,j)=>i!==j)).map(rest=>[v,...rest]))
export const leverOrders=permutations(leverColours)
export function validateLeverAttempt(order,feedback){
 if(order.length!==4||order.some(c=>!leverColours.includes(c))||duplicates(order))return 'Use every lever colour exactly once.'
 if(feedback.length!==4||feedback.some(f=>!['','spark','dark'].includes(f)))return 'Feedback must be spark, dark or unknown.'
 if(feedback.every(f=>!f))return 'Record at least one observed spark or dark lever.'
 return ''
}
export function leverTrials(state={}){
 return Array.from({length:24},(_,index)=>({index,order:[0,1,2,3].map(i=>state[`trial-${index}-${i}`]||''),feedback:[0,1,2,3].map(i=>state[`spark-${index}-${i}`]||'')})).filter(t=>state[`saved-${t.index}`]===true)
}
export const leverFeedback=(order,answer)=>order.map((colour,i)=>colour===answer[i]?'spark':'dark')
export function leverCandidates(trials){
 if(trials.some(t=>validateLeverAttempt(t.order,t.feedback)))return []
 return leverOrders.filter(answer=>trials.every(t=>t.order.every((colour,i)=>!t.feedback[i]||(t.feedback[i]==='spark'?answer[i]===colour:answer[i]!==colour))))
}
export function nextLeverOrder(candidates){
 if(!candidates.length)return null
 // Minimise the largest remaining group after exact-position spark feedback.
 let best=candidates[0],bestWorst=Infinity,bestSum=Infinity
 for(const trial of candidates){
  const buckets=new Map()
  for(const answer of candidates){const key=trial.map((v,i)=>v===answer[i]?'1':'0').join('');buckets.set(key,(buckets.get(key)||0)+1)}
  const sizes=[...buckets.values()],worst=Math.max(...sizes),sum=sizes.reduce((a,n)=>a+n*n,0)
  if(worst<bestWorst||(worst===bestWorst&&sum<bestSum)){best=trial;bestWorst=worst;bestSum=sum}
 }
 return [...best]
}
export function leverResult(state={}){
 const trials=leverTrials(state),bad=trials.find(t=>validateLeverAttempt(t.order,t.feedback))
 if(bad)return result('invalid',`Attempt ${bad.index+1}: ${validateLeverAttempt(bad.order,bad.feedback)}`,{trials,candidates:[],suggestion:null})
 const candidates=leverCandidates(trials)
 if(!candidates.length)return result('invalid','No order matches this feedback. Correct or remove a saved attempt before trying again.',{trials,candidates,suggestion:null})
 const suggestion=nextLeverOrder(candidates)
 return result(candidates.length===1?'ready':'waiting',candidates.length===1?'Only one order fits your observations.':`${candidates.length} possible orders remain.`,{trials,candidates,suggestion,lines:[suggestion.join(' → ')]})
}
export function bellResult(state={}){
 for(let col=0;col<3;col++){
  const values=[0,1,2].map(row=>state[`bell-${row*3+col}`]||'')
  if(values.some(v=>v&&!bellRooms[col].bells.includes(v))||duplicates(values))return result('invalid',`Check ${bellRooms[col].name}: each bell must map to a different row.`)
 }
 const calibrated=Array.from({length:9},(_,i)=>Boolean(state[`bell-${i}`])).filter(Boolean).length
 if(!/^[0-8]$/.test(String(state.light??'')))return result('waiting','Select the lit bulb on the board.',{calibrated})
 const index=Number(state.light),room=bellRooms[index%3].name,bell=state[`bell-${index}`]
 if(!bell)return result('waiting',`Test and map the ${['top','middle','bottom'][Math.floor(index/3)]} ${room} bulb first.`,{calibrated})
 return result('ready','Ring this bell now.',{calibrated,room,bell,lines:[`${room}: ${bell}`]})
}

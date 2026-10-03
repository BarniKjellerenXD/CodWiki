import references from '../data/bo3References.json' with { type:'json' }
export const { rooms, bombLocations, shadowGlyphs, voidNames, voidGlyphs, terminalGlyphs, plantRecipes, plantWaters, plantSupplies, plantPlanter, revelationLocations, collectionActions } = references
export const roomSlug = room => room.toLowerCase().replaceAll(' ', '-')
export function observedSequence(state,prefix,count,allowed,{unique=false}={}) {
  const values = Array.from({length:count},(_,i)=>state[`${prefix}-${i}`] || '')
  if (values.some(v=>v && !allowed.includes(v))) return {status:'invalid',values,message:'An observation is not recognized. Select it again.'}
  if (unique && new Set(values.filter(Boolean)).size !== values.filter(Boolean).length) return {status:'invalid',values,message:'A choice appears more than once. Recheck the observed sequence.'}
  if (values.some(v=>!v)) return {status:'waiting',values,message:`${values.filter(Boolean).length} of ${count} recorded.`}
  return {status:'ready',values,message:'All observations recorded. Recheck them against your match.'}
}
export function terminalPosition(state,station,symbol) {
  const board=observedSequence(state,`board-${station}`,4,terminalGlyphs.map(g=>g.id),{unique:true})
  if (board.status !== 'ready') return { ...board, position:null }
  const index=board.values.indexOf(symbol)
  return {...board,position:index < 0 ? null : index+1}
}
export function plantPlan(state) {
  const recipe=plantRecipes[state.goal]
  const validRound=/^[1-9]\d{0,2}$/.test(state.planted || '')
  const round=validRound?Number(state.planted):null
  if (!recipe) return {recipe:null,round,harvest:null,status:'waiting',message:'Choose the reward you want to grow.'}
  const water=[0,1,2].map(i=>state[`water-${i}`] || '')
  const complete=water.every(Boolean)
  const matches=state.goal==='fruit' ? new Set(water).size===3 && water.every(w=>['Blue','Green','Purple'].includes(w)) : state.goal==='imprint' ? water.every(w=>['Blue','Green','Purple'].includes(w)) : water.every((w,i)=>w===recipe.water[i])
  const shots=[0,1,2].every(i=>state[`shot-${i}`])
  const unnecessaryShots=!recipe.shots && state.goal!=='masamune' && [0,1,2].some(i=>state[`shot-${i}`])
  let status='waiting',message='After caring for the plant in-game, record the water you used below each round. Leave future rounds empty.'
  if (complete && (!matches || (recipe.shots && !shots) || unnecessaryShots)) {status='invalid';message=unnecessaryShots?'KT-4 treatment changes the ordinary plant’s possible rewards. Use the untreated recipe for this goal.':'Recorded care differs from the recipe. Recheck the water and KT-4 treatment; a missed round needs a new plant.'}
  else if (complete) {status='ready';message=`All three care rounds recorded. ${recipe.result}`}
  if (state.planted && !validRound) {status='invalid';message='Enter a whole planting round from 1 to 999.'}
  return {recipe,round,harvest:round===null?null:round+3,status,message}
}

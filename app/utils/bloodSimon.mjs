// Helper labels are spatial markers, not the in-game symbols or a translation.
// Layout: epicpine's Building 64 schematic; photographic joins: Kennedy references.
export const bloodSimonPanels = [
  {id:'A',name:'Punchcard corner',x:48,y:15,photo:'near_china_alley.webp'},
  {id:'B',name:'Right wall · upper',x:89,y:40,photo:'right_of_power_box_2.webp'},
  {id:'C',name:'Right wall · lower',x:89,y:66,photo:'right_of_power_box_1.webp'},
  {id:'D',name:'Power-switch island',x:62,y:64,photo:'left_of_power_box.webp'},
  {id:'E',name:'ICR-7 island',x:38,y:35,photo:'middle_of_room.webp'},
  {id:'F',name:'Generator-side wall',x:13,y:46,photo:'right_of_generator.webp'}
].map(panel=>({...panel,image:`/images/blood-of-the-dead/simon/${panel.photo}`}))

export function simonRound(state={}) {
  return /^[1-5]$/.test(state['simon-round']) ? Number(state['simon-round']) : 1
}
export function simonSequence(state={}) {
  const sequence=[]
  for(let i=0;i<simonRound(state);i++) {
    const panel=bloodSimonPanels.find(panel=>panel.id===state[`simon-map-${i}`])
    if(!panel)break
    sequence.push(panel)
  }
  return sequence
}
export function recordSimonFlash(state,panelId) {
  const sequence=simonSequence(state)
  if(sequence.length>=simonRound(state)||!bloodSimonPanels.some(panel=>panel.id===panelId))return state
  const next=clearSimonSequence(state)
  sequence.forEach((panel,index)=>{next[`simon-map-${index}`]=panel.id})
  return {...next,[`simon-map-${sequence.length}`]:panelId}
}
export function clearSimonSequence(state,round=simonRound(state)) {
  if(!Number.isInteger(round)||round<1||round>5)return state
  return {...state,'simon-round':String(round),...Object.fromEntries(Array.from({length:5},(_,i)=>[`simon-map-${i}`,'']))}
}
export function removeSimonFlash(state) {
  const sequence=simonSequence(state)
  if(!sequence.length)return state
  const next=clearSimonSequence(state)
  sequence.slice(0,-1).forEach((panel,index)=>{next[`simon-map-${index}`]=panel.id})
  return next
}
export function steadySimonPanels(state={}) {
  return bloodSimonPanels.filter(panel=>state[`simon-steady-${panel.id}`]===true)
}
export function toggleSteadySimonPanel(state,panelId) {
  if(!bloodSimonPanels.some(panel=>panel.id===panelId))return state
  const key=`simon-steady-${panelId}`
  if(!state[key]&&steadySimonPanels(state).length>=3)return state
  return {...state,[key]:!state[key]}
}

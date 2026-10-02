// Symbol values checked against the photographed Research Office reference.
// viewBox selects the original pixels; these are not invented replacement glyphs.
export const terminusSymbols = [
  {value:'0',label:'One empty circle',viewBox:'720 45 155 155'},
  {value:'10',label:'Two circles vertically; upper circle striped',viewBox:'480 0 155 242'},
  {value:'11',label:'Two diagonal circles; lower-left circle striped',viewBox:'185 22 215 235'},
  {value:'20',label:'Four petals upright; left and right striped',viewBox:'725 306 230 264'},
  {value:'21',label:'Four diagonal petals; upper-right and lower-left striped',viewBox:'460 305 262 245'},
  {value:'22',label:'Four diagonal petals; upper-left and lower-right striped',viewBox:'185 316 264 236'}
]
export function terminusLabResult(state={}) {
  const selected=['x','y','z'].map(key=>state[key])
  if(selected.some(v=>v===undefined||v===null||v==='')) return {status:'waiting',message:'Choose the symbol on each X, Y and Z sticky note.',values:[],equations:[]}
  if(selected.some(v=>!terminusSymbols.some(s=>s.value===v))) return {status:'invalid',message:'One symbol is not recognized. Select it again from the reference images.',values:[],equations:[]}
  const [x,y,z]=selected.map(Number)
  const values=[2*x+11,2*z+y-5,Math.abs(y+z-x)]
  if(values[1]<0) return {status:'invalid',message:'Y and Z are both the empty circle, giving a negative second entry. Recheck those two sticky notes; do not change the second equation to absolute value.',values:[],equations:[]}
  return {status:'ready',message:'Enter these three values from left to right.',values,code:values.map(v=>String(v).padStart(2,'0')),equations:[`2 × ${x} + 11 = ${values[0]}`,`(2 × ${z} + ${y}) − 5 = ${values[1]}`,`|(${y} + ${z}) − ${x}| = ${values[2]}`]}
}
export const straussProjectors=[
  {id:'hill',name:'Hilltop Stairs',location:'Grass beside the stairs above Liberty Lanes, near PhD Flopper.',image:'/images/bo6-liberty-falls/liberty-falls-second-projector.webp'},
  {id:'yard',name:'Groundskeeper’s Yard',location:'Grass beside the toolshed where you collected the handbrake.',image:'/images/bo6-liberty-falls/liberty-falls-first-projector.webp'},
  {id:'roof',name:'Yummy Freeze rooftop',location:'Buy the wooden debris on The Alamo bank roof, then drop to the lower roof.',image:'/images/bo6-liberty-falls/liberty-falls-final-projector.webp'}
]
export const straussReadings=[{value:'red',name:'Red · High'},{value:'yellow',name:'Yellow · Medium'},{value:'green',name:'Green · Low'}]
export function straussSetting(reading) { return ({red:'green',yellow:'yellow',green:'red'})[reading]||null }
export function straussRoute(state={}) {return straussProjectors.map(p=>({...p,reading:straussReadings.find(r=>r.value===state[p.id])?.name||'',target:straussSetting(state[p.id]),done:state[`${p.id}-done`]===true&&!!straussSetting(state[p.id])}))}
export const aetherellaFigures=[
  {id:'comic-table',name:'Olly’s Comics · entrance table',location:'Inside the shop, on the table just right of the door.',image:'aetherella-1.jpeg'},
  {id:'comic-perk',name:'Olly’s Comics · Quick Revive',location:'Look up at the shelf above Quick Revive.',image:'aetherella-2.png'},
  {id:'comic-window',name:'Olly’s Comics · boarded window',location:'Low shelf beside the boarded zombie window.',image:'aetherella-3.jpeg'},
  {id:'comic-trap',name:'Olly’s Comics · statue display',location:'Shelf to the left of the large Aetherella trap display.',image:'aetherella-4.jpeg'},
  {id:'hill',name:'Hill Street · air conditioner',location:'From the Washington Avenue roof above Speed Cola, aim across toward the figure on the air conditioner at the house window.',image:'aetherella-5.jpeg'},
  {id:'church',name:'Church · front window',location:'At the church entrance, look up to the right-hand front window ledge.',image:'aetherella-6.jpeg'},
  {id:'lanes',name:'Liberty Lanes · sign',location:'Climb onto the West Main Street bus and vacuum the figure on the front ledge beneath the Liberty Lanes lettering.',image:'aetherella-7.jpeg'},
  {id:'roof',name:'Fast Forward · rooftop',location:'Drop from The Alamo to Yummy Freeze’s roof; aim across to the figure between the air-conditioning units on Fast Forward.',image:'aetherella-8.jpeg'},
  {id:'motel',name:'Motor Lodge · motel sign',location:'Stand beside the motel and aim up at the figure on the ledge of the red MOTEL sign.',image:'aetherella-9.jpeg'}
].map(p=>({...p,image:`/images/bo6-liberty-falls/${p.image}`}))
export function aetherellaProgress(state={}) {const collected=aetherellaFigures.filter(p=>state[p.id]===true).length;return {collected,remaining:9-collected,complete:collected===9}}

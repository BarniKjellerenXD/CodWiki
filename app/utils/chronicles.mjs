import data from '../data/chroniclesReferences.json' with {type:'json'}
export const {iceSymbols,fireSymbols,tileSymbols,locationAtlases,gongLocations,moonColours}=data
export function tilePairs(state){
 const duplicates=[]
 for(let side=0;side<2;side++)for(const symbol of tileSymbols){
  const found=Array.from({length:12},(_,i)=>state[`symbol-${side}-${i}`]===symbol.id?i:-1).filter(i=>i>=0)
  if(found.length>1)duplicates.push({side,symbol:symbol.label,tiles:found.map(i=>i+1)})
 }
 const pairs=tileSymbols.map(symbol=>({symbol,...Object.fromEntries([0,1].map(side=>{
  const index=Array.from({length:12},(_,i)=>i).find(i=>state[`symbol-${side}-${i}`]===symbol.id)
  return [side===0?'minecart':'bridge',index===undefined?null:{index,label:state[`place-${side}-${index}`]?.trim()||`Tile ${index+1}`}]
 })),matched:state[`matched-${symbol.id}`]===true}))
 return {duplicates,pairs,ready:pairs.filter(p=>p.minecart&&p.bridge).length}
}
export function moonSequence(state){
 const values=Array.from({length:16},(_,i)=>state[`slot-${i}`]||'');const last=values.findLastIndex(Boolean)
 const entries=values.slice(0,last+1)
 return {entries,hasGap:entries.includes(''),positions:entries.map(v=>moonColours.indexOf(v)+1)}
}
export function gongResult(state,locations=gongLocations){
 const correct=locations.filter(g=>state[g.key]==='Correct'),wrong=locations.filter(g=>state[g.key]==='Wrong')
 return {correct,wrong,status:correct.length>4||wrong.length>4?'invalid':correct.length===4?'ready':'waiting'}
}

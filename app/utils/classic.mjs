import references from '../data/classicReferences.json' with {type:'json'}
export const {lighthouseDials,classicAtlases,classicGongs,classicSections}=references
export function classicToolSection(tool,state={}){
 const atlas=classicAtlases[tool]
 const group=atlas?.groups.find(g=>g.id===state.collection)||atlas?.groups[0]
 return group?.section||classicSections[tool]
}
const mod=n=>((n%10)+10)%10
export function lighthouseResult(state){
 const values=lighthouseDials.map(d=>state?.[d.id])
 if(values.some(v=>v!==undefined&&v!==''&&!/^[0-9]$/.test(String(v))))return {status:'invalid',message:'Use one digit from 0 to 9 for each dial.',lines:[],turns:[]}
 if(values.some(v=>v===undefined||v===''))return {status:'waiting',message:'Read all four current digits to calculate the turns.',lines:[],turns:[]}
 const d=lighthouseDials.map((dial,i)=>mod(dial.target-Number(values[i])))
 // Every press advances this floor and its immediate neighbours. Solve A*x=d mod 10.
 const blue=mod(d[1]-d[0]),purple=mod(d[3]-blue),orange=mod(d[2]-d[3]),yellow=mod(d[0]-orange)
 const counts=[yellow,orange,blue,purple]
 const turns=lighthouseDials.map((dial,i)=>({...dial,count:counts[i]}))
 const total=counts.reduce((a,b)=>a+b,0)
 return {status:'ready',message:total?`${total} turns to 2 · 7 · 4 · 6`:'Already set to 2 · 7 · 4 · 6',turns,total,lines:turns.map(d=>`${d.name}: ${d.count===0?'leave untouched':`turn ${d.count} ${d.count===1?'time':'times'}`}`)}
}

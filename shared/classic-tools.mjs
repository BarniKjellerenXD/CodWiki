import {chroniclesTools} from './chronicles-tools.mjs'
import {classicAtlases,classicGongs,lighthouseDials} from './classic-references.mjs'
const f=(id,label,options)=>({id,label,options})
export const classicTools=[
 {id:'bo1-cotd-dials',map:'bo1-call-of-the-dead',name:'Lighthouse dial solver',help:'Co-op quest only. Enter the four digits currently visible in your lighthouse. The answer accounts for the neighbouring dials that move with each turn.',kind:'solver',version:1,ui:'classic',evaluate:'lighthouse',fields:lighthouseDials.map(d=>f(d.id,`${d.name} · current digit`,Array.from({length:10},(_,i)=>String(i))))},
 ...Object.entries(classicAtlases).map(([id,a])=>({id,map:`bo1-${a.map}`,name:({'bo1-cotd-locations':'Quest item & location finder','bo1-shang-locations':'Wall tile & mud-dial finder','bo1-moon-labs':'Hacker panel & cable finder'})[id],help:'Choose what you are looking for, narrow by area and select a photograph to enlarge it. Use the instructions for the current step before interacting.',fields:[f('collection','Current collection',a.groups.map(g=>g.id)),f('region','Area',[...new Set(a.groups.flatMap(g=>g.locations.map(l=>l.region)))])],kind:'reference',version:1,ui:'classic'})),
 ...['bo3-shang-tiles','bo3-shang-gongs','bo3-moon-simon'].map(id=>{
  const original=chroniclesTools.find(t=>t.id===id)
  return {...structuredClone(original),id:id.replace('bo3-','bo1-'),map:original.map.replace('bo3-','bo1-'),ui:'classic',...(id==='bo3-shang-gongs'?{fields:classicGongs.map(g=>f(g.key,g.name,['Correct','Wrong']))}:{})}
 })
]

import { ingredients,rocketWords,directions,temples } from './puzzles.mjs'
const int=(v,min,max,fallback=null)=>Number.isInteger(v)&&v>=min&&v<=max?v:fallback
const one=(v,values,fallback=null)=>values.includes(v)?v:fallback
const fixed=(v,length,clean)=>Array.from({length},(_,i)=>clean(Array.isArray(v)?v[i]:undefined,i))
const unique=(v,min,max,length)=>Array.isArray(v)?[...new Set(v.filter(n=>Number.isInteger(n)&&n>=min&&n<=max))].slice(0,length):[]
export function sanitizePuzzleState(id, input) {
  const v=input&&typeof input==='object'?input:{}
  switch(id) {
    case 'serum': return {slots:fixed(v.slots,3,n=>one(n,ingredients.map(i=>i.id)))}
    case 'rocket': return {word:one(v.word,rocketWords)}
    case 'organ': return {slots:fixed(v.slots,5,n=>int(n,0,5))}
    case 'mars': return {slots:fixed(v.slots,3,n=>int(n,1,8))}
    case 'planets': return {slots:fixed(v.slots,3,n=>one(n,directions))}
    case 'scroll': return {board:int(v.board,0,511,511)}
    case 'flags': return {targets:fixed(v.targets,4,n=>int(n,1,12)),inventory:fixed(v.inventory,6,n=>int(n,0,8,0))}
    case 'murder': return {suspect:one(v.suspect==='courtier'?'noble':v.suspect,['merchant','noble','gardener']),symptom:one(v.symptom,['emesis','plant','paralysis']),hour:int(v.hour,0,11),delay:int(v.delay,1,5),painting:one(v.painting,['fish','mountains','bird'])}
    case 'uranium': return {existing:unique(v.existing,0,15,6)}
    case 'wunder': return {counts:fixed(v.counts,4,(n,i)=>int(n,1,i%2===0?7:8))}
    case 'notes': return {counts:fixed(v.counts,8,n=>int(n,1,8))}
    case 'books': return {selected:unique(v.selected,0,8,9)}
    case 'rings': return {positions:fixed(v.positions,3,n=>int(n,0,5)),target:one(v.target,[...temples,'tour'],'tour'),visited:unique(v.visited,0,5,4).filter(n=>temples.includes(n))}
    case 'pillars': return {riddle:int(v.riddle,0,3)}
    case 'house': {
      // Preserve saved locations from the former preset tracker as editable points.
      const previous=[{x:33,y:60},{x:43,y:59},{x:75.5,y:44.5},{x:83.5,y:66}]
      const points=Array.isArray(v.points)?v.points:unique(v.order,0,3,4).map(i=>previous[i])
      return {points:points.filter(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=100&&p.y>=0&&p.y<=100).slice(0,4).map(p=>({x:p.x,y:p.y}))}
    }
    default: return {}
  }
}
export const legacyPuzzleKeys = {
 serum:'ashes-serum',rocket:'ashes-rocket-launch',organ:'astra-harmonic-organ',mars:'astra-mars-code',planets:'astra-planet-sheets',scroll:'kowakujo-pestle-solver',flags:'kowakujo-clock-solver',murder:'kowakujo-murder-solver',uranium:'totenreich-uranium-pincers',wunder:'totenreich-wunderbarrage',rings:'rex-infernus-ring-solver',pillars:'rex-infernus-pillars'
}
export function migratePuzzleState(id, old) {
 if(!old || typeof old!=='object') return null
 let input
 switch(id) {
  case 'rocket': input={word:old.selected};break
  case 'mars': input={slots:Array.isArray(old.picked)?old.picked.map(p=>['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune'].indexOf(p)+1):[]};break
  case 'planets': input={slots:['mars','saturn','neptune'].map(p=>directions.find(d=>old.assignment?.[d]===p))};break
  case 'uranium': input={existing:old.placed};break
  case 'wunder': input={counts:[old.s1a,old.s1f,old.s2a,old.s2f]};break
  case 'rings': input={positions:old.cur,target:old.mode==='tour'?'tour':old.target};break
  case 'murder': input={...old,symptom:({paralysie:'paralysis',vomissement:'emesis',vegetal:'plant'})[old.symptom] || old.symptom};break
  case 'pillars': input={riddle:['runnerStars','driftRunner','driftStars','galaxiesMoons'].indexOf(old.selected)};break
  default:return null // Old collection order, organ gaps and ambiguous rule/result states are incompatible.
 }
 return sanitizePuzzleState(id,input)
}

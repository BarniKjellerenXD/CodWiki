// Sources and validation limits: docs/puzzle-verification.md
export const ingredients = [
  { id:'fungi', word:'FUNGI', name:"Widow’s Lantern", hint:'Jar of Spores: Blackwater cabin → mushroom-covered horse at Vandorn Farm → wait three rounds.' },
  { id:'limbs', word:'LIMBS', name:'Mysterious Limb', hint:'Kill a Zursa with Ol’ Tessie’s Abomination Beam.' },
  { id:'oculi', word:'OCULI', name:'Ravager Eyes', hint:'Kill a Ravager with a Saw Trap.' },
  { id:'conch', word:'CONCH', name:'Hoard Hunk Chunks', hint:'Destroy purple Aether Flora with the Abomination Beam.' },
  { id:'talus', word:'TALUS', name:'Human Bones', hint:'Tomahawk the hanging corpse’s foot in Vandorn Barn, then burn the fallen foot with a Molotov.' },
]
export const rocketWords = ['LAUNCH', 'WEAPON', 'ENGINE', 'ROCKET']
export const rocketCode = word => rocketWords.includes(word) ? [...word].map(c => String(c.charCodeAt(0)-65).padStart(2,'0')) : []
export const planets = ['Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune']
export const directions = ['N','NE','E','SE','S','SW','W','NW']
export const zodiac = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig']
export const zodiacHour = (hour, delay) => Number.isInteger(hour) && hour >= 0 && hour < 12 && Number.isInteger(delay) && delay >= 1 && delay <= 12 ? (hour-delay+12)%12 : null
export function organOrder(slots) {
  if (!Array.isArray(slots) || slots.length !== 5 || slots.filter(v=>v===0).length !== 1) return null
  const known = slots.filter(v=>v!==0)
  if (known.some(v=>!Number.isInteger(v)||v<1||v>5) || new Set(known).size!==4) return null
  const missing = [1,2,3,4,5].find(n=>!known.includes(n))
  return slots.map(n=>n===0 ? missing : n)
}
export const scrollNames = ['Top left','Top middle','Top right','Middle left','Center','Middle right','Bottom left','Bottom middle','Bottom right']
export const scrollMasks = Array.from({length:9},(_,i)=>{
  const r=Math.floor(i/3), c=i%3
  return [i,r>0?i-3:-1,r<2?i+3:-1,c>0?i-1:-1,c<2?i+1:-1].filter(n=>n>=0).reduce((mask,n)=>mask|1<<n,0)
})
export function solveScroll(start) {
  if (!Number.isInteger(start)||start<0||start>511) return null
  const queue=[start], prev=new Map([[start,null]])
  for(let head=0;head<queue.length;head++) {
    const current=queue[head]
    if(current===0) {
      const moves=[]; let state=0
      while(prev.get(state)) { const [parent,move]=prev.get(state); moves.unshift(move); state=parent }
      return moves
    }
    for(let move=0;move<9;move++) {
      const next=current^scrollMasks[move]
      if(!prev.has(next)) { prev.set(next,[current,move]); queue.push(next) }
    }
  }
  return null
}
export function solveFlags(targets, inventory) {
  if(targets.length!==4||targets.some(n=>!Number.isInteger(n)||n<1||n>12)||inventory.length!==6||inventory.some(n=>!Number.isInteger(n)||n<0||n>8)) return null
  const solutions=[]
  function visit(i,left,used) {
    if(i===4) { solutions.push(used); return }
    const options=[]
    for(let a=1;a<=6;a++) {
      if(left[a-1] && a===targets[i]) options.push([a])
      for(let b=a;b<=6;b++) if(a+b===targets[i] && left[a-1] >= (a===b?2:1) && left[b-1]) options.push([a,b])
    }
    for(const option of options) { const next=left.slice(); option.forEach(n=>next[n-1]--); visit(i+1,next,[...used,option]) }
  }
  visit(0,inventory,[])
  return solutions.sort((a,b)=>a.flat().length-b.flat().length)
}
export const ringNames = ['Inner','Middle','Outer']
export const ringStops = ['Empty','Dravakar','Caltheris','House','Nyxara','Veytharion']
export const temples = [1,2,4,5]
export const moveRing = (state, ring, direction) => state.map((v,i)=>(v+(i===ring?direction:2*direction)+12)%6)
export function solveRings(start,target,visited=[]) {
  if(start.length!==3||start.some(n=>!Number.isInteger(n)||n<0||n>5)||!(target==='tour'||temples.includes(target))) return null
  const alignedMask = s => s.every(n=>n===s[0]) && temples.includes(s[0]) ? 1<<temples.indexOf(s[0]) : 0
  const initialMask=visited.reduce((m,n)=>temples.includes(n)?m|1<<temples.indexOf(n):m,0)|alignedMask(start)
  const key=(s,m)=>s.join(',')+':'+m
  const initialKey=key(start,initialMask), queue=[[start,initialMask]], prev=new Map([[initialKey,null]])
  for(let head=0;head<queue.length;head++) {
    const [state,mask]=queue[head], id=key(state,mask)
    if(target==='tour' ? mask===15 : state.every(n=>n===target)) {
      const moves=[]; let cur=id
      while(prev.get(cur)) { const [p,move]=prev.get(cur); moves.unshift(move); cur=p }
      return moves
    }
    for(let ring=0;ring<3;ring++) for(const direction of [1,-1]) {
      const next=moveRing(state,ring,direction), nextMask=target==='tour'?mask|alignedMask(next):0, nextKey=key(next,nextMask)
      if(!prev.has(nextKey)) { prev.set(nextKey,[id,[ring,direction]]); queue.push([next,nextMask]) }
    }
  }
  return null
}
export function uraniumGroups(existing, added) {
  const occupied=new Set([...existing,...added]), uranium=new Set(added), seen=new Set(), groups=[]
  for(const cell of occupied) {
    if(seen.has(cell)) continue
    const stack=[cell], group=[]; seen.add(cell)
    while(stack.length) {
      const n=stack.pop(), row=Math.floor(n/4), col=n%4; group.push(n)
      for(const next of [row>0?n-4:-1,row<3?n+4:-1,col>0?n-1:-1,col<3?n+1:-1]) {
        if(occupied.has(next)&&!seen.has(next)) { seen.add(next); stack.push(next) }
      }
    }
    // Rod groups without an inserted uranium piece are not activated.
    if(group.some(n=>uranium.has(n))) groups.push(group.length)
  }
  return groups.sort((a,b)=>a-b)
}
const uraniumPatterns=new Set(['8','7','1,7','2,7','3,6','1,1,7'])
export function solveUranium(existing) {
  if(existing.length!==6||new Set(existing).size!==6||existing.some(n=>!Number.isInteger(n)||n<0||n>15)) return []
  const empty=Array.from({length:16},(_,i)=>i).filter(n=>!existing.includes(n)), results=[]
  for(let a=0;a<empty.length;a++) for(let b=a+1;b<empty.length;b++) for(let c=b+1;c<empty.length;c++) {
    const added=[empty[a],empty[b],empty[c]], groups=uraniumGroups(existing,added)
    if(uraniumPatterns.has(groups.join(','))) results.push({added,groups})
  }
  return results
}
export const noteLocations = [
  {id:'bunker',image:'https://codzombiesguides.com/content/paradox-junction/paradox-junction-green-house-backyard-note.webp',name:'Green backyard · bunker',hint:'Left side of the bunker.'},
  {id:'garden',image:'https://codzombiesguides.com/content/paradox-junction/paradox-junction-yellow-house-backyard-note.webp',name:'Yellow backyard · garden fence',hint:'Fence inside the garden area.'},
  {id:'bus',image:'https://codzombiesguides.com/content/paradox-junction/paradox-junction-cul-de-sac-bus-note.webp',name:'Cul-de-Sac · yellow bus',hint:'On the bus.'},
  {id:'teleporter',image:'https://codzombiesguides.com/content/paradox-junction/paradox-junction-cul-de-sac-fence-note.webp',name:'Cul-de-Sac · teleporter fence',hint:'Fence to the right of the teleporter.'},
  {id:'garage',image:'https://codzombiesguides.com/content/paradox-junction/paradox-junction-trinity-ave-garage-note.webp',name:'Trinity Ave · garage door',hint:'Left of the alleyway.'},
  {id:'wall',image:'https://codzombiesguides.com/content/paradox-junction/paradox-junction-trinity-ave-brick-wall-note.webp',name:'Trinity Ave · brick wall',hint:'Left of the M8A1 wall buy.'},
  {id:'rock',image:'https://codzombiesguides.com/content/paradox-junction/paradox-junction-trinity-ave-rock-note.webp',name:'Trinity Ave · tree rock',hint:'Left of Pack-a-Punch, near the Strange Tree.'},
  {id:'exfil',image:'https://codzombiesguides.com/content/paradox-junction/paradox-junction-trinity-ave-exfil-note.webp',name:'Trinity Ave · broken fence',hint:'Right of the Exfil phone.'},
]
export const pianoCode=[8,6,7,5,6,5,3,5]
export function noteOrder(counts) {
  const assigned=noteLocations.map((location,i)=>({...location,count:counts[i]})).filter(n=>Number.isInteger(n.count)&&n.count>=1&&n.count<=8)
  const duplicates=[...new Set(assigned.filter((n,i)=>assigned.some((o,j)=>j!==i&&n.count===o.count)).map(n=>n.count))]
  const missing=Array.from({length:8},(_,i)=>i+1).filter(n=>!assigned.some(o=>o.count===n))
  return {assigned:assigned.sort((a,b)=>a.count-b.count),duplicates,missing,complete:assigned.length===8&&!duplicates.length}
}
export const pillarLevers=['Left · beside Armor wall buy','Right · opposite Armor wall buy','Bottom · lower crank']
export const pillarRiddles=[
  {label:'I remember the runner…',counts:[0,3,2]},
  {label:'I drift to the runner…',counts:[3,1,2]},
  {label:'I drift to stars…',counts:[1,2,2]},
  {label:'I remember galaxies…',counts:[2,2,0]},
]

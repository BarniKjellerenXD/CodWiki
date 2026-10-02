export const zodiacSigns = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
export const follyColors = ['Blue','Green','Yellow','Red']
export const follyShapes = ['glyph-1','glyph-2','glyph-3','glyph-4']
export const stakeShapes = ['down-bar','up-bar','down','up']
export const stakeLocations = ['Gazebo','Behind Vapr','Fountain by perk','Railing by barrier']
export const skadiPictures = [
  { name:'Shi No Numa', image:'numbers_nameplate', location:'Deserted Hallway nameplates', action:'Upgraded gun: shoot plates 1 → 3 → 2 → 4.' },
  { name:'Der Riese', image:'numbers_drawers', location:'Main Offices desk drawer', action:'Take the War Room key; open the center desk.' },
  { name:'Shangri-La', image:'numbers_shang', location:'South Laboratories barrier', action:'Explosive behind machinery; photo appears right of window.' },
  { name:'Kino der Toten', image:'numbers_panic_room', location:'Panic Room static TV', action:'DEFCON: upper far → Server → upper near → lower. Use Server teleporter.' }
]
const result = (status,message,entries=[]) => ({status,message,entries})

export function solveZodiac(state) {
  const rows=[0,1,2].map(i=>({sign:state[`sign-${i}`]||'',room:state[`room-${i}`]||`Clue ${i+1}`,counts:[0,1,2].map(j=>state[`count-${i}-${j}`])}))
  if(rows.some(row=>!zodiacSigns.includes(row.sign)||row.counts.some(n=>n===undefined||n===''))) return result('waiting','Choose three signs and inspect all nine scratch positions. Enter 0 only after checking an empty position.')
  if(rows.some(row=>row.counts.some(n=>!/^\d$/.test(String(n))))) return result('invalid','Scratch groups must be whole counts from 0 to 9.')
  if(new Set(rows.map(row=>row.sign)).size!==3) return result('invalid','Two clues use the same sign. Recheck your observations before entering the dial.')
  const entries=rows.map(row=>({...row,total:row.counts.reduce((sum,n)=>sum+Number(n),0)}))
  if(new Set(entries.map(row=>row.total)).size!==3) return result('invalid','Two totals tie. Recheck every scratch position; no tie-break is assumed.',entries)
  return result('ready','Turn each symbol to the top, then melee to submit. Lowest total first.',entries.sort((a,b)=>a.total-b.total))
}

export function solveStake(state) {
  const trees=[0,1,2,3].map(i=>state[`tree-${i}`])
  const stones=[0,1,2,3].map(i=>state[`stone-${i}`])
  if([...trees,...stones].some(shape=>!stakeShapes.includes(shape))) return result('waiting','Record four tree shapes and the shape at all four Gardens stones.')
  if(new Set(trees).size!==4||new Set(stones).size!==4) return result('invalid','Each set must contain four different shapes. Recheck before shooting: a wrong shot cannot be retried in this match.')
  return result('ready','Shoot the Gardens stones in this order. Use the same shapes for the Bowie Knife tree.',trees.map(shape=>({shape,location:stakeLocations[stones.indexOf(shape)]})))
}

export function skadiResult(state) {
  const entries=skadiPictures.map((picture,i)=>({...picture,code:state[`slot-${i}`]||'',accepted:state[`accepted-${i}`]===true,index:i}))
  if(entries.some(entry=>entry.code&&!/^\d{4}$/.test(entry.code))) return result('invalid','Each photograph has exactly four digits. Keep leading zeroes.',entries)
  if(entries.some((entry,i)=>entry.accepted&&(!entry.code||entries.slice(0,i).some(previous=>!previous.accepted)))) return result('invalid','Acceptance must follow the shown order, with a valid code in every accepted slot.',entries)
  if(entries.some(entry=>!entry.code)) return result('waiting','Collect all four pictured codes; the screenshots show examples only.',entries)
  const next=entries.find(entry=>!entry.accepted)
  if(next) return result('ready',`Next: enter ${next.code} from ${next.name}; confirm only after the green acceptance light.`,entries)
  const rounds=Number(state.rounds||0)
  return result('ready',rounds===3?'Three full rounds recorded. Check the cleared area left of Pack-a-Punch and collect the case reward.':`Wait for PROJECT SKADI RETRIEVED, then stay at Groom Lake together. ${rounds} / 3 full rounds recorded.`,entries)
}

export function updateSkadiCode(state,index,value) {
  const next={...state,[`slot-${index}`]:value,rounds:'0'}
  // Changing a submitted clue invalidates it and every later acceptance.
  for(let i=index;i<4;i++) next[`accepted-${i}`]=false
  return next
}

// Shared evaluator adapter for catalogue previews/tests; the component renders the entries as visuals.
export function evaluateNightClassified(id,state) {
  if(id.endsWith('-zodiac')) {
    const output=solveZodiac(state)
    return {...output,lines:output.status==='ready'?output.entries.map(entry=>`${entry.sign}: ${entry.total}`):[]}
  }
  if(id.endsWith('-stake')) {
    const output=solveStake(state)
    return {...output,lines:output.status==='ready'?output.entries.map((entry,i)=>`${i+1}. ${entry.location}`):[]}
  }
  if(id==='bo4-classified-codes') {
    const output=skadiResult(state)
    return {...output,lines:output.entries.filter(entry=>/^\d{4}$/.test(entry.code)).map(entry=>`${entry.name}: ${entry.code}`)}
  }
  const known=follyColors.filter(color=>follyShapes.includes(state[`shape-${color.toLowerCase()}`]))
  return {status:known.length===4?'ready':'waiting',message:known.length===4?'Set the four color dials to your recorded shapes.':'Choose the observed shape under each color.',lines:known.map(color=>`${color}: shape ${state[`shape-${color.toLowerCase()}`].slice(-1)}`)}
}

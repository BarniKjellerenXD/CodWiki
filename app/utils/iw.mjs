import { morseDigits, shaolinWords, diskRows, chemicalRaw, chemicalRecipes, chemicalFinals, chemicalLabel, skullWords, souvenirRecipes } from '../data/iwData.mjs'

const response = (status,message,lines=[],extra={}) => ({status,message,lines,...extra})
const waiting = (message,lines=[]) => response('waiting',message,lines)
const invalid = (message,lines=[]) => response('invalid',message,lines)
const ready = (message,lines=[],extra={}) => response('ready',message,lines,extra)
const ambiguous = (message,lines=[]) => response('ambiguous',message,lines)
const present = value => value !== undefined && value !== null && String(value).trim() !== ''
const integer = value => present(value) && /^\d+$/.test(String(value)) ? Number(value) : null

export function decodeDigitMorse(input) {
  const text = String(input || '').trim()
  if (!text) return waiting('Record the three five-pulse digits from the ringing phone.')
  if (/[^.\-\s/]/.test(text)) return invalid('Use dots for short pulses, dashes for long pulses, and a space or / between digits.')
  const groups = text.split(/[\s/]+/)
  const decoded = groups.map(group => morseDigits.indexOf(group))
  const bad = groups.findIndex(group => group.length > 5 || (group.length === 5 && !morseDigits.includes(group)))
  const lines = groups.map((group,i) => `Digit ${i+1}: ${group} → ${decoded[i] < 0 ? 'unrecorded / invalid' : decoded[i]}`)
  if (bad >= 0) return invalid(`Digit ${bad+1} is not valid digit Morse. Keep its position and re-listen.`,lines)
  if (groups.length > 3) return invalid('The poster number has three digits. Check your group separators.',lines)
  if (groups.length < 3 || groups.some(group => group.length < 5)) return waiting('Finish all three digits; every digit needs five pulses.',lines)
  return ready(`Poster number: ${decoded.join('')}`,lines)
}

export function filterShaolinWords({mask='',length='',rejected='',inventory=''}={},words=shaolinWords) {
  mask = String(mask).toUpperCase().replaceAll(' ','').replaceAll('?','_')
  rejected = String(rejected).toUpperCase().replaceAll(' ','')
  inventory = String(inventory).toUpperCase().replaceAll(' ','')
  if (!/^[A-Z_]*$/.test(mask) || !/^[A-Z]*$/.test(rejected+inventory)) return { error: 'Use A–Z letters and _ for an unknown position.' }
  const size = integer(length)
  if (present(length) && (size === null || size < 1 || size > 20)) return {error:'Word length must be from 1 to 20.'}
  if (size && mask.length > size) return {error:'The mask has more positions than the recorded length.'}
  const counts = text => [...text].reduce((acc,c) => ({...acc,[c]:(acc[c]||0)+1}),{})
  const required = counts(inventory)
  const candidates = words.filter(word => (!size || word.length===size) && word.length>=mask.length && [...mask].every((c,i)=>c==='_'||word[i]===c) && ![...rejected].some(c=>word.includes(c)) && Object.entries(required).every(([c,n])=>(counts(word)[c]||0)>=n))
  return { candidates, mask, size }
}

export function chemicalRoute(finalId) {
  if (!chemicalFinals.includes(finalId)) return []
  const route=[],seen=new Set()
  const visit = id => { if(seen.has(id)||!chemicalRecipes[id])return; seen.add(id); chemicalRecipes[id].ingredients.forEach(visit); route.push(id) }
  visit(finalId)
  return route
}
export function reactionCost(ingredients,observations,O) {
  if (!Number.isInteger(O)||O<0) return {error:'Record a non-negative integer O.'}
  const pairs=[]
  for (const id of ingredients) {
    const pair=observations[id]
    if (!pair||pair.some(n=>!Number.isInteger(n)||n<0||n>9)) return {missing:id}
    pairs.push(...pair)
  }
  const total=pairs.reduce((sum,n)=>sum+n,0)-O
  if(total<0 || total>999) return {error:'This produces an impossible keypad value; recheck the diamonds, ingredients and O.'}
  return {total,arithmetic:`${pairs.join(' + ')} − ${O} = ${total}`}
}

export function solveDisks(selected,rows=diskRows) {
  if(selected.length!==4) return {error:'Select all four disk symbols.'}
  if(selected.some(n=>!Number.isInteger(n)||n<0||n>11)||new Set(selected).size!==4) return {error:'The four observed symbols must be distinct.'}
  const matches=rows.filter(row=>selected.every(n=>row.includes(n))).map(row=>row.filter(n=>selected.includes(n)))
  return {orders:[...new Map(matches.map(order=>[order.join(','),order])).values()]}
}

export function queenSolutions(forced={}) {
  const entries=Object.entries(forced).map(([row,col])=>[Number(row),Number(col)])
  if(entries.some(([r,c])=>!Number.isInteger(r)||!Number.isInteger(c)||r<0||r>7||c<0||c>7)) return []
  const solutions=[],board=[]
  const visit=row=>{
    if(row===8){solutions.push([...board]);return}
    const choices=Object.hasOwn(forced,row)?[Number(forced[row])]:[0,1,2,3,4,5,6,7]
    for(const col of choices){ if(board.some((other,r)=>other===col||Math.abs(other-col)===row-r))continue;board.push(col);visit(row+1);board.pop() }
  }
  visit(0)
  return solutions
}

export function skullSequences(symbols) {
  if(symbols.length!==4||symbols.some(s=>!/^([A-Z])$/.test(s))) return null
  const values=symbols.map(s=>s.charCodeAt(0)-64), byLetter={}
  // Breadth by length, then lexicographic order gives the shortest physical input.
  for(let size=1;size<=4;size++){
    const enumerate=sequence=>{if(sequence.length===size){const sum=sequence.reduce((n,p,j)=>n+values[p-1]+3*p*j,0);const letter=String.fromCharCode(65+(sum-1)%26);if(!byLetter[letter])byLetter[letter]=sequence;return};for(let p=1;p<=4;p++)enumerate([...sequence,p])}
    enumerate([])
  }
  return byLetter
}

export function evaluateIW(id,state={},definition={}) {
  if(id==='iw-spaceland-speakers') {
    const layout=[0,1,2,3].map(i=>state[`speaker-${i}`]), sequence=Array.from({length:16},(_,i)=>state[`flash-${i}`])
    if(layout.some(value=>!present(value)))return waiting('Record the colour at all four physical speakers.')
    if(new Set(layout).size!==4)return invalid('Every speaker must have a different observed colour.')
    const last=sequence.findLastIndex(present)
    if(last<0)return waiting('Record the UFO flashes in order. Repeated colours are allowed.')
    if(sequence.slice(0,last+1).some(value=>!present(value)))return invalid('A flash is missing in the middle; preserve its position and re-listen.')
    if(sequence.slice(0,last+1).some(value=>!layout.includes(value)))return invalid('A recorded flash is not one of the observed speaker colours.')
    return ready('Replay the recorded sequence when the UFO and speakers turn white.',sequence.slice(0,last+1).map((colour,i)=>`${i+1}. ${colour} → speaker ${layout.indexOf(colour)+1}`))
  }
  if(id==='iw-spaceland-souvenirs') {
    const coins=[0,1,2].map(i=>state[`coin-${i}`])
    if(coins.some(c=>!present(c)))return waiting('Choose the three observed coin colours; order does not matter.')
    if(coins.some(c=>!['Red','Green','Blue'].includes(c)))return invalid('Choose Red, Green or Blue.')
    const key=['Red','Green','Blue'].map(colour=>colour[0].repeat(coins.filter(c=>c===colour).length)).join('')
    const lines=[`Any souvenir station: ${souvenirRecipes[key]}.`]
    if(key==='GGG')lines.push('At the Polar Peak station: Head-Cutter’s Yeti Plush also ejects.')
    if(key==='BBB')lines.push('At the Journey Into Space station: Face-Melter’s Rocket Toy also ejects.')
    if(key==='RGB')lines.push('At the Astrocade rear station: Dischord’s Disco Ball also ejects.')
    if(key==='RRR')lines.push('At the Kepler station: Shredder’s Alien Souvenir also ejects.')
    return ready(souvenirRecipes[key],lines)
  }
  if(id==='iw-shaolin-morse') return decodeDigitMorse(state.message)
  if(id==='iw-shaolin-word') {
    const query=filterShaolinWords(state)
    if(query.error)return invalid(query.error)
    if(!present(state.mask)&&!present(state.length)&&!present(state.rejected)&&!present(state.inventory))return waiting('Record confirmed letters, a positional mask or the observed length. _ means unknown.')
    if(!query.candidates.length)return invalid('No dictionary word fits. Recheck the mask, rejected letters and repeated-letter observations.')
    const unknown=[...query.mask].findIndex(c=>c==='_'), next=unknown>=0?unknown:query.mask.length
    const nextLetters=[...new Set(query.candidates.map(w=>w[next]).filter(Boolean))].sort()
    const lines=[...query.candidates, ...(nextLetters.length?[`Check position ${next+1}: ${nextLetters.join(', ')}.`]:[])]
    return query.candidates.length===1?ready(`Candidate: ${query.candidates[0]}. Confirm it against the rooftop symbols.`,lines):ambiguous(`${query.candidates.length} possible words remain; no word is selected automatically.`,lines)
  }
  if(id==='iw-attack-chemistry') {
    const M=integer(state.m),markers=Array.from({length:4},(_,i)=>({number:integer(state[`o-${i}`]),values:['Red','Green','Blue'].map(c=>state[`o-${i}-${c}`])}))
    if(M===null)return waiting('Record the M number from the Motel office.')
    if(markers.some(marker=>marker.number===null))return waiting('Record the numbers at all four O-marker locations.')
    const possible=markers.filter(marker=>!marker.values.includes('Not equal')).map(marker=>marker.number)
    const OValues=[...new Set(possible)]
    if(!OValues.length)return invalid('Every O candidate was excluded. Recheck your equality observations.')
    if(OValues.length>1)return ambiguous('More than one O candidate remains. Read the missing filtered markers.',OValues.map(n=>`Possible O: ${n}`))
    const O=OValues[0]
    const proven=markers.some(marker=>marker.number===O&&marker.values.every(value=>value==='Equal'))
    if(!proven)return waiting(`O=${O} remains, but its equality must be confirmed in Red, Green and Blue.`)
    const low=integer(state['tv-low']),high=integer(state['tv-high']),bands=['tv-below','tv-middle','tv-above'].map(key=>state[key])
    if(low===null||high===null||bands.some(c=>!present(c)))return waiting(`Confirmed O=${O}. M × O = ${M*O}. Record the actual TV bands.`)
    if(low>high||new Set(bands).size!==3)return invalid('TV bounds must be ordered and its three colours must be distinct.')
    const product=M*O,filter=product<low?bands[0]:product>high?bands[2]:bands[1]
    const summary=[`O=${O}; M × O = ${M} × ${O} = ${product}.`,`Required reaction filter: ${filter}. Boundaries ${low}–${high} are inclusive.`, 'Read each ingredient’s own top/left diamond values in that filter. Manufacturing keypad codes are different values.']
    const route=chemicalRoute(state.final)
    if(!route.length)return waiting('Select the chemical positively endorsed by the radio.',summary)
    if(state['value-filter']!==filter)return waiting(`Board context is not ${filter}. Re-read or select the recorded filter before calculating.`,summary)
    const observations={}
    for(const ingredient of [...Object.keys(chemicalRaw),...Object.keys(chemicalRecipes)])observations[ingredient]=[integer(state[`top-${ingredient}`]),integer(state[`left-${ingredient}`])]
    const lines=[...summary]
    let missing=false,impossible=false
    route.forEach((recipeId,i)=>{
      const recipe=chemicalRecipes[recipeId],cost=reactionCost(recipe.ingredients,observations,O)
      lines.push(`${i+1}. ${recipe.label}: ${recipe.ingredients.map(chemicalLabel).join(' + ')}.`)
      if(cost.error){impossible=true;lines.push(cost.error)}else if(cost.missing){missing=true;lines.push(`Read ${chemicalLabel(cost.missing)}: ${chemicalRaw[cost.missing]?.[2]||chemicalRecipes[cost.missing]?.board} board.`)}else lines.push(`Keypad ${cost.total}: ${cost.arithmetic}${state[`made-${recipeId}`]?' · marked made successfully':''}.`)
      recipe.ingredients.filter(k=>chemicalRaw[k]).forEach(k=>lines.push(`${chemicalLabel(k)}: ${chemicalRaw[k][1]}.`))
    })
    if(impossible)return invalid('One reaction gives an impossible value. Recheck it before using the keypad.',lines)
    if(missing)return waiting('The dependency route is ready; fill its missing diamond observations.',lines)
    return ready('Codes calculated. Confirm each successful reaction in the game before advancing.',lines)
  }
  if(id==='iw-attack-codes') {
    const accepted=Array.from({length:5},(_,i)=>state[`life-${i}`])
    const selected=accepted.filter(present)
    if(selected.some(digit=>!['3','4','5','6','8'].includes(digit)))return invalid('Life-ray observations must use 3, 4, 5, 6 or 8.')
    if(new Set(selected).size!==selected.length)return invalid('The life-ray order uses 3, 4, 5, 6 and 8 once each.')
    const permutations=[]
    const visit=prefix=>{if(prefix.length===5){permutations.push(prefix);return};for(const digit of ['3','4','5','6','8'])if(!prefix.includes(digit))visit([...prefix,digit])}
    visit([])
    // A rejection is scoped to the exact accepted prefix, rather than applied to a digit globally.
    const rejectionPrefix=String(state['reject-prefix']||'')
    const rejected=state['reject-digit']
    if(rejectionPrefix&&!/^[34568]{1,4}$/.test(rejectionPrefix))return invalid('The rejected-attempt prefix contains only previously accepted digits.')
    if(new Set(rejectionPrefix).size!==rejectionPrefix.length||rejectionPrefix.includes(rejected))return invalid('A rejected attempt cannot repeat a life-ray digit.')
    const candidates=permutations.filter(p=>accepted.every((a,i)=>!present(a)||p[i]===a)&&!(present(rejected)&&p.join('').startsWith(rejectionPrefix+rejected)))
    const lines=[]
    if(!candidates.length)return invalid('No life-ray order fits these observations. Recheck the accepted positions and rejected attempt.')
    if(selected.length===5)lines.push(`Life ray: ${accepted.join('')}.`,`Death ray: ${[...accepted].reverse().join('')}.`)
    else lines.push(`${candidates.length} life-ray permutations remain.`,...candidates.slice(0,8).map(c=>c.join('')))
    const gauges=['Gas Station','Snack Shack','Power Station','Motel']
    if(gauges.some((_,i)=>present(state[`gauge-${i}`])&&integer(state[`gauge-${i}`])===null))return invalid('Pressure-gauge observations must be whole numbers.',lines)
    gauges.forEach((label,i)=>{if(present(state[`gauge-${i}`]))lines.push(`${label} gauge: ${state[`gauge-${i}`]}.`)})
    if(present(state.bomb)){if(!/^\d{4}$/.test(state.bomb))return invalid('The bomb code is exactly four digits. Preserve zeroes.',lines);lines.push(`Belly bomb code: ${state.bomb}. Each player enters this original order.`)}
    return selected.length===5||present(state.bomb)?ready('Recorded codes are separate from pressure observations.',lines):ambiguous('Continue observing the TV Studio reels or accepted inputs.',lines)
  }
  if(id==='iw-beast-disks') {
    const selected=Array.from({length:4},(_,i)=>integer(state[`disk-${i}`]))
    if(selected.some(n=>n===null))return waiting('Select the four photographed symbols on this attempt’s disks.')
    const answer=solveDisks(selected)
    if(answer.error)return invalid(answer.error)
    if(!answer.orders.length)return invalid('No reference row contains this set. Recheck the four symbols; a rejected insertion may change them.')
    if(answer.orders.length>1)return ambiguous('Matching reference rows disagree. Recheck the symbols before inserting.',answer.orders.map(order=>order.map(n=>`Symbol ${n+1}`).join(' → ')))
    const order=answer.orders[0]
    return ready('Insert from slot 1 to 4 in this order; the supplied chart is read left to right.',order.map((n,i)=>`${i+1}. Symbol ${n+1}`),{images:order.map(n=>({src:`/images/remaining/asset-${String(1851+n).padStart(4,'0')}.webp`,alt:`Disk symbol ${n+1}`}))})
  }
  if(id==='iw-beast-handles') {
    if(!state.pass)return waiting('Choose Initial snapshot for your first pass, or Re-observed snapshot for the next pass. The original record stays saved.')
    const reobserved=state.pass==='Re-observed snapshot',prefix=reobserved?'current':'initial',actions=reobserved?'current-action':'action'
    const board=Array.from({length:16},(_,i)=>state[`${prefix}-${i}`])
    if(!state[reobserved?'current-frozen':'frozen'])return waiting('Record all 16 orientations, then freeze this pass’s snapshot.')
    if(board.some(v=>!['Horizontal','Vertical'].includes(v)))return invalid('A frozen snapshot needs all 16 orientations. Unfreeze to complete it.')
    const horizontal=board.map((v,i)=>v==='Horizontal'?i:-1).filter(i=>i>=0)
    const position=i=>`${String.fromCharCode(65+i%4)}${Math.floor(i/4)+1}`
    if(!horizontal.length)return ready('Snapshot is all vertical; confirm that N31L is hacked in the game.')
    return ready('Flip only this pass’s initially horizontal handles, even if they spin while you work.',horizontal.map(i=>`${position(i)}: ${state[`${actions}-${i}`]?'marked flipped':'not marked flipped'}.`),{note:'After the pass, select a re-observed snapshot if horizontal handles remain. Your original snapshot stays intact. This recorder does not model neighbour toggles.'})
  }
  if(id==='iw-beast-queens') {
    const row=integer(state['fixed-row']),column=integer(state['fixed-column'])
    if(row===null||column===null)return waiting('Record the preplaced queen’s row and column using the photographed board orientation.')
    const forced={[row]:column}
    for(let r=0;r<8;r++)if(present(state[`extra-${r}`])){const c=integer(state[`extra-${r}`]);if(c===null||c>7)return invalid('An extra queen needs an A–H column.');if(r===row&&c!==column)return invalid('The preplaced queen is locked; an extra placement conflicts with it.');forced[r]=c}
    const solutions=queenSolutions(forced)
    if(!solutions.length)return invalid('The confirmed queens attack each other or leave no completion. Recheck the extra placements.')
    const choice=integer(state.solution)??0,board=solutions[choice%solutions.length]
    return ready(`${solutions.length} valid completions. Add the seven queens below.`,board.map((c,r)=>`${String.fromCharCode(65+c)}${r+1}${r===row?' · original queen, do not move':Object.hasOwn(forced,r)?' · already confirmed':' · add queen'}`),{board:{size:8,queens:board,fixed:{row,column}}})
  }
  if(id==='iw-attack-skull-hop') {
    const symbols=[0,1,2,3].map(i=>String(state[`symbol-${i}`]||'').toUpperCase()),word=String(state.word||'').toUpperCase()
    if(!word||symbols.some(s=>!s))return waiting('Choose the wall word and the four swingset glyph letters, left to right.')
    if(!skullWords.includes(word))return invalid('Choose one of the photographed wall’s target words.')
    const sequences=skullSequences(symbols)
    if(!sequences)return invalid('Each swingset glyph must be a letter from A to Z.')
    const missing=[...new Set([...word].filter(letter=>!sequences[letter]))]
    if(missing.length)return invalid(`No four-symbol sequence reaches ${missing.join(', ')}. Recheck your glyphs.`)
    return ready('Use each physical-position sequence, then shoot the top-right glyph to commit that letter.',[...word].map((letter,i)=>`${i+1}. ${letter}: ${sequences[letter].join(' → ')}`))
  }
  return null
}

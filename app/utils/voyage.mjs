export const voyageSymbols = [
  {id:'fire',name:'Fire',shape:'Up triangle',hourControl:'Engine Room · bottom-left control'},
  {id:'water',name:'Water',shape:'Down triangle',hourControl:'Engine Room · top-right control'},
  {id:'air',name:'Air',shape:'Up triangle with bar',hourControl:'Poop Deck · left of the wheel'},
  {id:'earth',name:'Earth',shape:'Down triangle with bar',hourControl:'Poop Deck · right of the wheel'}
]
export const clockLocations = [
  {name:'Mail Rooms',image:'mail-room',hint:'Clock by Cargo Hold doorway; symbol beneath the stairs.'},
  {name:'Bridge',image:'bridge',hint:'Clock above wheel; symbol underneath the desk behind you.'},
  {name:'Upper Grand Staircase',image:'upper-grand-staircase',hint:'Clock in wooden carving; symbol above side doorway.'},
  {name:'1st Class Lounge',image:'1st-class-lounge',hint:'Clock on fireplace; symbol on wall beside Mystery Box.'},
  {name:'Galley',image:'galley',hint:'Clock and cabinet symbol in the room with the hanging body.'},
  {name:'3rd Class Berths',image:'3rd-class-berths',hint:'Clock faces wooden stairs; symbol behind their luggage.'}
]
export const outletLocations = [
  {name:'Upper Grand Staircase',image:'upper-grand-staircase',hint:'Top floor, side wall near the clock.'},
  {name:'State Rooms',image:'state-rooms',hint:'Left-side room from Forecastle, next to paintings.'},
  {name:'Dining Hall',image:'dining-hall',hint:'Behind the small white wall left of Ra.'},
  {name:'Aft Decks',image:'aft-decks',hint:'Inside the window opposite the Mystery Box.'},
  {name:'3rd Class Berths',image:'3rd-class-berths',hint:'Near the bottom of the stairs from Poop Deck.'},
  {name:'1st Class Lounge',image:'1st-class-lounge',hint:'Wooden pillar beside Zeus.'}
]
export const outletOrder = ['Poison','Water','Electric','Fire']
export const voyagePlanets = [
  {name:'Mercury',glyph:'☿',room:'Mail Rooms',image:'mail-room',hint:'Wall beside metal stairway, left of clock.',sky:'Small, dim purple body nearest the Sun.'},
  {name:'Venus',glyph:'♀',room:'Millionaire Suites',image:'millionaire-suites',hint:'Under the bedside table.',sky:'Dim red body closer to the Sun than Mars.'},
  {name:'Moon',glyph:'☽',room:'Lower Grand Staircase',image:'lower-grand-staircase',hint:'Wall beside the open window.',sky:'Large familiar Moon.'},
  {name:'Mars',glyph:'♂',room:'Boiler Room',image:'boiler-room',hint:'Beneath the pipe on the catwalk.',sky:'Bright red body farther from the Sun than Venus.'},
  {name:'Jupiter',glyph:'♃',room:'Engine Room',image:'engine-room',hint:'Floor in front of Odin.',sky:'Largest planet; orange.'},
  {name:'Saturn',glyph:'♄',room:'Bridge',image:'bridge',hint:'On the wooden cabinet.',sky:'Yellow body with visible rings.'},
  {name:'Uranus',glyph:'♅',room:'State Rooms',image:'state-rooms',hint:'Bathroom wall behind the green plant.',sky:'Larger purple body farther from the Sun.'},
  {name:'Neptune',glyph:'♆',room:'Aft Decks',image:'aft-decks',hint:'Inside the lifebuoy beside the lifeboat.',sky:'Blue body in the WATER beside the ship.'},
  {name:'Sun',glyph:'☉',room:'Forecastle',image:'forecastle',hint:'Metal vent in the spawn area.',sky:'Brightest body. Shoot last; collecting its orb starts the ice sprint.'}
]
export const voyageImage = name => `/images/bo4-voyage-of-despair/${name}.webp`
export function movesFromTwelve(mark) {
  if(!Number.isInteger(mark) || mark<0 || mark>12) return ''
  const n=mark%12
  return n===0?'Leave at 12':n<=6?`${n} right / clockwise`:`${12-n} left / anticlockwise`
}
export function clockTargets(state) {
  return voyageSymbols.map(symbol=>{
    const hour=Number(state[`${symbol.id}-hour`]); const rawMinute=state[`${symbol.id}-minute`]
    const minute=Number(rawMinute)
    const valid=Number.isInteger(hour)&&hour>=1&&hour<=12 && typeof rawMinute==='string'&&/^\d{2}$/.test(rawMinute)&&minute>=0&&minute<=55&&minute%5===0
    return {...symbol,room:state[`${symbol.id}-room`]||'',hour,minute,valid,hourMove:valid?movesFromTwelve(hour):'',minuteMove:valid?movesFromTwelve(minute/5):''}
  })
}
const result=(status,message,lines=[])=>({status,message,lines})
export function voyageClockResult(state) {
  const rows=clockTargets(state); const assigned=rows.map(r=>r.room).filter(Boolean)
  if(new Set(assigned).size!==assigned.length) return result('invalid','A clock room can have only one symbol. Recheck the duplicate room.')
  const ready=rows.filter(r=>r.valid)
  if(!ready.length) return result('waiting','Choose a symbol and record both clock hands to reveal its controls.')
  return result('ready',`${ready.length} / 4 clocks recorded`,ready.flatMap(r=>[`${r.name} — Bridge minutes: ${String(r.minute).padStart(2,'0')} (${r.minuteMove} from 12).`,`${r.hourControl}: hour ${r.hour} (${r.hourMove} from 12).`]))
}
export function voyageOutletResult(state) {
  const locations=outletOrder.map((_,i)=>state[`outlet-${i}`]).filter(Boolean)
  if(new Set(locations).size!==locations.length) return result('invalid','Two elements cannot use the same active outlet. Recheck its effect.')
  const route=outletOrder.map((element,i)=>`${i+1}. ${element}: ${state[`outlet-${i}`] || 'location not recorded'}`)
  return result(locations.length===4?'ready':'waiting',locations.length===4?'Your trial route':'Record the four elemental outlet locations.',route)
}
export function voyageSkyResult(state) {
  const names=voyagePlanets.map(p=>p.name)
  const first=Array.from({length:8},(_,i)=>state[`slot-${i}`]||'')
  if(first.some(n=>n&&!names.includes(n)) || first.includes('Sun') || (state['slot-8'] && state['slot-8']!=='Sun')) return result('invalid','Sun must be last. Record the other eight bodies in the model’s order.')
  if(new Set(first.filter(Boolean)).size!==first.filter(Boolean).length) return result('invalid','A body occurs twice. Recheck the recorded sequence.')
  const last=first.findLastIndex(Boolean)
  if(first.slice(0,last+1).some(n=>!n)) return result('invalid','Fill the gap in the model sequence before using this route.')
  if(first.some(n=>!n)) return result('waiting',`Record all eight flashes (${first.filter(Boolean).length} / 8). Sun is fixed last.`)
  const sequence=[...first,'Sun']
  return result('ready','Shoot one body, then collect its orb before the next.',sequence.map(name=>{const p=voyagePlanets.find(p=>p.name===name);return `${name}: collect its orb at ${p.room} — ${p.hint}`}))
}

export const alphaRooms = {
  A: 'Yellow House', B: 'Green House', C: 'Prisoner Holding',
  D: 'Transfusion Facility', E: 'Operations', F: 'APD Interrogation'
}
export const alphaClockLocations = {
  A: 'Upstairs in Yellow House', B: 'Upstairs in Green House', C: 'Inside Prisoner Holding',
  D: 'Inside Transfusion Facility', E: 'Inside Operations', F: 'Inside APD Interrogation'
}
export function parseAlphaClock(value) {
  const match = /^([A-F])(0[1-9]|1[0-2])(00|15|30|45)$/.exec(String(value || '').trim().toUpperCase())
  return match ? { letter: match[1], room: alphaRooms[match[1]], hour: Number(match[2]), minute: Number(match[3]), time: `${match[2]}:${match[3]}` } : null
}
export function alphaClockRoute(state = {}) {
  const entries = Array.from({length:5}, (_,i) => ({raw:state[`slot-${i}`] || '', index:i}))
  const entered = entries.filter(row => row.raw)
  const clues = entered.map(row => ({...parseAlphaClock(row.raw), index:row.index}))
  if (entered.some(row => !parseAlphaClock(row.raw))) return {status:'invalid', message:'Use a room letter A–F and four digits: A0115. Minutes must be 00, 15, 30 or 45.', clues:[], remaining:null}
  if (new Set(clues.map(row=>row.letter)).size !== clues.length) return {status:'invalid', message:'A room appears twice. Recheck the TV broadcast before setting any clocks.', clues:[], remaining:null}
  const remaining = clues.length===5 ? Object.keys(alphaRooms).find(letter=>!clues.some(row=>row.letter===letter)) : null
  return {status:clues.length===5?'ready':'waiting', message:clues.length===5?'Set these five clocks in broadcast order.':`Record all five TV clues (${clues.length}/5).`, clues, remaining}
}
export function alphaFinalCode(hour, minute) {
  if (!/^(?:[1-9]|1[0-2])$/.test(String(hour || '')) || !['00','15','30','45'].includes(minute)) return null
  return String(hour).padStart(2,'0') + minute
}
const riddle = (key, kind, clue, location, action, file, aliases = '') => ({key,kind,clue,location,action,aliases,image:`/images/bo4-tag-der-toten/tag-der-toten-${file}.webp`})
// Clue keys retain the existing saved picker values. Landmarks cross-checked with
// Glitchalodon's original offering post and the illustrated COD Zombies Guides page.
export const tagRiddleLocations = [
  riddle('Offering: Where one mysteries','Offering','Where one mysteries','Lighthouse — broken stairs by the Mystery Box','Check the broken staircase behind the Mystery Box position; the offering rests on a stair tread. Use the pictured staircase as your landmark.','where-one-mysteries'),
  riddle('Offering: Where preservation freezes','Offering','Where preservation freezes','Main Deck — life preserver','On the right-side route toward Forecastle, inspect the life preserver on your left.','where-preservation-freezes'),
  riddle('Offering: Where crows roost','Offering','Where crows roost','Forecastle — fallen barrels','Search the knocked-over barrels beside the crow’s nest.','where-crows-roost'),
  riddle('Offering: Where bounded slept','Offering','Where bounded slept','Forecastle — blue shipping container','Look above the light fitting inside the blue container.','where-bounded-slept'),
  riddle('Offering: Where bread breaks','Offering','Where bread breaks / bakes','Gangway — kitchen counter','Inspect the corner of the kitchen island / salad counter beneath the ship’s Bridge.','where-bread-bakes','bread bakes'),
  riddle('Offering: Where earth crumbles','Offering','Where earth crumbles','Geological Processing — conveyor','Face the conveyor from the entrance and check its front-left edge.','where-earth-crumbles'),
  riddle('Offering: Where falls freeze','Offering','Where falls freeze','Cargo Hold — flooded floor','Search the water beside the fuel can in the flooded hold.','where-falls-freeze'),
  riddle('Offering: Where feet slip','Offering','Where feet slip','Ice Grotto — slide','Hold interact while sliding down the left side to collect the offering halfway down.','where-feet-slip'),
  riddle('Offering: Where filth cleanses','Offering','Where filth cleanses','Decontamination — tipped cart','Search the overturned cart at the back-left of the room.','where-filth-cleanses'),
  riddle('Offering: Where fire sinks','Offering','Where fire sinks','Sunken Path — lantern by the campfire','Inspect the ground just to the lantern’s right.','where-fire-sinks'),
  riddle('Offering: Where helixes peak','Offering','Where helixes peak','Lighthouse Level 4 — jars','Check the tops of the jars beside the Hermit’s room.','where-helixes-peak'),
  riddle('Offering: Where lightning aims','Offering','Where lightning aims','Security Lobby — workbench','Entering from the zipline, turn right to the bench below the Wunderwaffe blueprint.','where-lightning-aims'),
  riddle('Offering: Where lines berth','Offering','Where lines berth','Docks — Lighthouse zipline','Check the snow at the left side of the zipline leading to Lighthouse Level 4.','where-lines-berth'),
  riddle('Offering: Where lungs close','Offering','Where lungs close','Lagoon ↔ Lighthouse Cove — underwater tunnel','Swim into the connecting cave and inspect its floor toward the far left end; leave enough time to get air.','where-lungs-close'),
  riddle('Offering: Where madness sleeps','Offering','Where madness sleeps','Specimen Storage — cell mattress','Search the mattress inside the cell.','where-madness-sleeps'),
  riddle('Offering: Where mountains throw','Offering','Where mountains throw','Outer Walkway — behind the flinger','Use dynamite to access the walkway. Standing on its flinger, turn around and check the floor edge / red pipe directly behind you.','where-mountains-throw'),
  riddle('Offering: Where north is found','Offering','Where north is found','Bridge — compass','Check the compass in front of the ship power switch.','where-north-is-found'),
  riddle('Offering: Where power ends','Offering','Where power ends','Human Infusion — power terminal','Inspect the console immediately to the right of the facility power switch.','where-power-ends'),
  riddle('Offering: Where hidden burns','Offering','Where hidden burns','Hidden Path — generator','On the side route between Beach and Cargo Hold, search the generator beside the fire.','where-hidden-burns'),
  riddle('Offering: Where thirst dawns','Offering','Where thirst dawns','Stern — crane / ship edge','Inspect the ship edge near the crane, to the left of the Soda perk area.','where-thirst-dawns'),
  riddle('Seal: Where humans suffer','Seal','Where humans suffer','Specimen Storage — bulletin board','Melee the bulletin board to uncover a safe. Place a built Dynamite Bomb on it, then collect the Seal.','where-humans-suffered'),
  riddle('Seal: Inside an icy hall','Seal','Inside an icy hall','Ice Grotto — wooden panel','Melee the wooden board to uncover a safe. Place a built Dynamite Bomb on it, then collect the Seal.','icy-hall-seal','inside a icy hall'),
  riddle('Seal: Where Aether was gathered','Seal','Where Aether was gathered','Geological Processing — bulletin board','Melee the bulletin board to uncover a safe. Place a built Dynamite Bomb on it, then collect the Seal.','where-aether-was-gathered'),
  riddle('Seal: Where cages hang','Seal','Where cages hang','Boathouse — framed map','Melee the framed wall map to uncover a safe. Place a built Dynamite Bomb on it, then collect the Seal.','where-cages-hang')
]
export function findTagRiddles(query = '', kind = 'All') {
  const words=String(query).toLowerCase().trim().split(/\s+/).filter(Boolean)
  return tagRiddleLocations.filter(row => (kind==='All'||row.kind===kind) && words.every(word=>`${row.clue} ${row.location} ${row.aliases}`.toLowerCase().includes(word)))
}

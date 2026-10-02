// Reviewed gameplay facts and pure helpers. No browser state or timers here.
const pic = (map, name, alt) => ({ src: `/images/cw-${map}/${name}.webp`, alt })
export const dartboardNumbers = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5]
export function firebaseDartResult(state = {}) {
  const sectors = [0, 1, 2].map(i => state[`slot-${i}`] ?? '')
  if (sectors.some(v => v !== '' && (!/^\d+$/.test(v) || Number(v) < 1 || Number(v) > 20))) return { status: 'invalid', message: 'Choose a sector from the board for each stop.', numbers: [] }
  if (sectors.some(v => v === '')) return { status: 'waiting', message: 'Record all three computer stops in order.', numbers: [] }
  return { status: 'ready', message: 'Shoot these outer numbers, then the bullseye.', numbers: sectors.map(v => dartboardNumbers[Number(v) - 1]) }
}
export function dartSectorPath(index, radius = 138, center = 170) {
  const point = angle => [center + radius * Math.sin(angle), center - radius * Math.cos(angle)]
  const [x1, y1] = point((index * 18 - 9) * Math.PI / 180), [x2, y2] = point((index * 18 + 9) * Math.PI / 180)
  return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`
}
export const safeRooms = [
  { name: 'Garment Factory', places: [['garment_chalkboard', 'Chalkboard beside ammo crate'], ['garment_doorway', 'Above doorway beside ammo crate'], ['garment_graffiti', 'Graffiti wall at bottom of short stairs']] },
  { name: 'Service Passage', places: [['passage_doorway', 'Above ladder-room doorway'], ['passage_pipes', 'Under pipe beside ladder'], ['passage_electricalbox', 'Above electrical box in passage']] },
  { name: 'Grocery Store', places: [['store_mugsposter', 'Beside Bier Fest poster near entrance'], ['store_shelf', 'Middle shelving unit'], ['store_watermelon', 'Corner below watermelon poster']] }
].map((r, i) => ({ ...r, field: `slot-${i}`, dial: i + 1, images: r.places.map(([file, label]) => pic('mauer-der-toten', file, `${r.name}: ${label}`)) }))
export function mauerSafeResult(state = {}) {
  const code = safeRooms.map(r => state[r.field] ?? '')
  if (code.some(v => v !== '' && !/^\d{2}$/.test(v))) return { status: 'invalid', message: 'Enter exactly two digits for each room, including a leading zero.', code: [] }
  if (code.some(v => v === '')) return { status: 'waiting', message: 'Read one blacklight value in each of the three rooms.', code: [] }
  return { status: 'ready', message: 'Hotel 305 safe · left to right', code }
}
export const dieVariants = [
  { id: 'cryo', name: 'Cryo-Emitter', color: 'Blue port', port: 'port_blue', crate: 'cryo_crate', prerequisite: 'Base D.I.E.; a Megaton is needed to charge the Pond fungus.', route: ['Blast the Penthouse ledge box with D.I.E. and collect the flask below.', 'Bait a Megaton blast into the Pond tree fungus; put the flask beneath the purple growth.', 'Wait for the flask to fill, then use it on the chained Medical Bay crate.', 'Take Cryo-Emitter and shoot the photographed blue chamber port.'], anchor: 'guide-step-variants-1' },
  { id: 'nova', name: 'Nova-5', color: 'Green port', port: 'port_green', crate: 'nova_crate', prerequisite: 'Base D.I.E.; leave a Plaguehound available for the cleaning unit.', route: ['Suck the unreachable canister toward you from Nacht’s Mezzanine and pick it up.', 'Install it in the Weapons Lab cleaning unit and kill a Plaguehound next to it.', 'Put the filled canister on the Crash Site crate and melee it to remove the vines.', 'Take Nova-5 and shoot the photographed green chamber port.'], anchor: 'guide-step-variants-2' },
  { id: 'fire', name: 'Thermophasic', color: 'Orange port', port: 'port_orange', crate: 'firebox', prerequisite: 'Aetherscope + diary reflections + Medical Bay computer. Enter the Pond anomaly specifically.', route: ['In the Dark Aether, break the fuse box beneath the floating Crash Site plane and take the fuse.', 'Insert the fuse into the Weapons Lab plasma cutter.', 'In the normal world, open the crate on the Pond truck for Thermophasic.', 'Shoot the photographed orange chamber port with Thermophasic.'], anchor: 'guide-step-variants-3' },
  { id: 'electric', name: 'Electrobolt', color: 'Yellow port', port: 'port_yellow', crate: 'elec_crate', prerequisite: 'Aetherscope + diary reflections + Medical Bay computer. Use the lowest Particle Accelerator anomaly.', route: ['Use base Shockwave suction on one crystal: Crash Site near Juggernog, Pond near Mystery Box, or Penthouse near Wunderfizz.', 'Carry its energy to the lower Particle Accelerator crate and shoot it into the crate.', 'Repeat separately for the other two crystals. All three crate lights must glow.', 'Take Electrobolt and shoot the photographed yellow chamber port.'], anchor: 'guide-step-variants-4' }
].map(v => ({ ...v, image: pic('die-maschine', v.port, `${v.color} takes ${v.name}`), crateImage: pic('die-maschine', v.crate, `${v.name} upgrade crate`) }))

export const launchConsoles = ['A', 'B', 'D']
export function outbreakLaunchResult(state = {}) {
  const observations = launchConsoles.map(c => ({ console: c, position: state[`light-${c}`] || '' }))
  if (observations.some(x => x.position && !['1', '2', '3'].includes(x.position))) return { status: 'invalid', message: 'Each green light must be left, middle or right.', order: [], inferred: [] }
  const known = observations.filter(x => x.position)
  if (new Set(known.map(x => x.position)).size !== known.length) return { status: 'invalid', message: 'Two consoles have the same position. Recheck the three small lights below each key switch.', order: [], inferred: [] }
  if (known.length < 2) return { status: 'waiting', message: 'Read the green-light position at two or three consoles.', order: [], inferred: [] }
  const order = Array(3).fill('')
  for (const x of known) order[Number(x.position) - 1] = x.console
  const inferred = launchConsoles.filter(c => !order.includes(c))
  if (inferred.length) order[order.indexOf('')] = inferred[0]
  return { status: 'ready', message: inferred.length ? `${inferred[0]} is deduced from the two different observed positions. Check its light before starting.` : 'Insert keys in this order. The sequence is timed once started.', order, inferred }
}
export const tvScreens = [
  { id: 'Blue', label: 'Blue · left middle', x: 28.8, y: 41.3, color: '#76baff', viewBox: '666 547 131 99' },
  { id: 'Green', label: 'Green · lower left', x: 39.7, y: 56, color: '#a5da7b', viewBox: '934 755 154 107' },
  { id: 'Red', label: 'Red · upper right', x: 59.4, y: 31, color: '#f19481', viewBox: '1458 404 138 86' },
  { id: 'Orange', label: 'Orange · right middle', x: 72.2, y: 41.7, color: '#efb56c', viewBox: '1783 552 127 88' }
]
export function tvSequence(state = {}, length = 4) {
  if (![4, 8, 12].includes(length)) return { status: 'invalid', message: 'Choose the 4, 8 or 12-flash stage.', sequence: [] }
  const sequence = Array.from({ length }, (_, i) => state[`tv-${length}-${i}`] || '')
  if (sequence.some(v => v && !tvScreens.some(t => t.id === v))) return { status: 'invalid', message: 'Re-record the unrecognized TV color.', sequence: [] }
  const remaining = sequence.filter(v => !v).length
  return { status: remaining ? 'waiting' : 'ready', message: remaining ? `${remaining} flash${remaining === 1 ? '' : 'es'} still to record.` : 'Shoot the TVs in this order. Advance the replay after each shot.', sequence }
}

export const outbreakRegions = ['Alpine', 'Armada', 'Collateral', 'Duga', 'Golova', 'Ruka', 'Sanatorium', 'Zoo']
export const outbreakQuests = ['Ravenov Implications', 'Operation Excision']
export const outbreakStages = quest => quest === 'Ravenov Implications' ? ['Radio', 'Monkeys', 'Projector', 'Zoo mask', 'D.I.E. upgrade'] : quest === 'Operation Excision' ? ['Red rift', 'Sanatorium rover', 'Zoo mask', 'D.I.E. upgrade'] : []
export const zooMasks = {
  Alpine: 'At the base of the red fan in Lower Chairlift.', Armada: 'Inside the central ship’s Control Room.', Collateral: 'On a bucket beside the Warehouse door.', Duga: 'At the Unused Lot bus stop.', Golova: 'In front of the Town Center statue.', Ruka: 'On a barrel in the Obstacle Course.', Sanatorium: 'At the bottom of the Sanatorium Pool.'
}
export const outbreakDieCrates = {
  Alpine: { name: 'Cryo-Emitter', file: 'cryo_box', map: 'cryo_map', location: 'Frozen pond near Upper Highway at the south of Alpine.' },
  Duga: { name: 'Electrobolt', file: 'electro_box', map: 'electro_box_map', location: 'Climb to the top of the large radar-array structure on the right/east of the map.' },
  Golova: { name: 'Nova-5', file: 'nova_box', map: 'nova_box_map', location: 'On the silo/platform at the train loading area near the western boundary.' },
  Ruka: { name: 'Thermophasic', file: 'thermo_box', map: 'thermo_map', location: 'Inside the Burnt Forest near the southern boundary.' }
}
export function outbreakLocation(state = {}) {
  const { quest, region, stage } = state
  const empty = (status, message) => ({ status, message, images: [] })
  if (!outbreakQuests.includes(quest) || !outbreakRegions.includes(region) || !stage) return empty('waiting', 'Choose your quest, current region and objective to reveal its location reference.')
  if (!outbreakStages(quest).includes(stage)) return empty('invalid', 'This objective belongs to the other quest. Choose a step from the current quest.')
  const r = region.toLowerCase()
  if (stage === 'D.I.E. upgrade') {
    const crate = outbreakDieCrates[region]
    return crate ? { status: 'ready', message: `${crate.name}: ${crate.location} Bring a D.I.E.; interact with the crate to change its element.`, images: [pic('outbreak', crate.map, `${region}: ${crate.name} crate map`), pic('outbreak', crate.file, `${region}: ${crate.name} crate sightline`)] } : empty('unavailable', `No D.I.E. elemental crate in ${region}. Cryo: Alpine; Nova-5: Golova; Electrobolt: Duga; Thermophasic: Ruka.`)
  }
  if (stage === 'Zoo mask') return region === 'Zoo' ? { status: 'ready', message: 'You are already in Zoo. Visit the ritual site shown below to make or update the Pact.', images: [pic('outbreak', 'pact_map', 'Zoo ritual site map'), pic('outbreak', 'ritual_site', 'Zoo Pact altar and quest pillars')] } : { status: 'ready', message: `${zooMasks[region]} Interact with the mask before using the beacon to direct the next ordinary warp to Zoo. Do this on a separate Pact visit, not during a quest-forced warp.`, images: [pic('outbreak', `${r}_mask_map`, `${region}: Zoo-mask map`), pic('outbreak', `${r}_mask`, `${region}: Zoo-mask sightline`)] }
  if (stage === 'Sanatorium rover') return region === 'Sanatorium' ? { status: 'ready', message: 'After the crash-site recording, push the red orb to the bridge rover, then defend a bunny at one of the broken Mystery Box locations. These are quest spawns, not the ordinary loot orb.', images: [pic('outbreak', 'crashed_heli_map', 'Crashed helicopter: begin the Sanatorium quest sequence'), pic('outbreak', 'red_orb_locs_map', 'Three possible red-orb locations'), pic('outbreak', 'mystery_box_map', 'Broken Mystery Box / bunny locations'), pic('outbreak', 'rover_map', 'Bridge rover destination')] } : empty('unavailable', 'Respond to Ravenov after the red-rift device; the quest takes you to Sanatorium. The special rover sequence is only there.')
  if ((stage === 'Monkeys' || stage === 'Projector') && region === 'Ruka') return empty('unavailable', 'Ruka has no projector. Warp to another region for the microfilm/projector phase; the completed projector later forces the return to Ruka for the bunker.')
  if (stage === 'Red rift' && region === 'Sanatorium') return empty('unavailable', 'Sanatorium has no starting red rift. Advance to another region at world tier 3 or higher. The quest brings you back here later.')
  const prefixes = { Radio: 'radio_locations', Monkeys: 'stone_monkey_locations', Projector: 'projector_locations', 'Red rift': 'red_rift_locations' }
  const messages = {
    Radio: 'World tier 3+: find this quest radio, survive its wave, then tune the three nearby amplifiers to its signal. Return for the Beacon Listening Device; ordinary music radios do not give the quest device.',
    Monkeys: 'After contacting Maxis and warping, search these monkey sites. Shoot the monkey by the M marking and take its microfilm. The correct statue varies each match.',
    Projector: 'Bring the microfilm here and interact through all three dialogue sequences. Finish your preparations before the next warp forces Ruka.',
    'Red rift': 'World tier 3+: enter this ground rift and steer through the successive airborne red rifts. Follow the final beam to collect the Beacon Listening Device. A missed chain requires a later region.'
  }
  return { status: 'ready', message: messages[stage], images: [pic('outbreak', `${prefixes[stage]}_${r}`, `${region}: annotated ${stage.toLowerCase()} locations`)] }
}
export const coldWarToolImages = [...new Set([
  '/images/cw-firebase-z/dartboard_ref_new_numbered.webp', '/images/cw-firebase-z/dartboard.webp',
  ...safeRooms.flatMap(r => r.images.map(i => i.src)),
  ...dieVariants.flatMap(v => [v.image.src, v.crateImage.src]),
  '/images/cw-forsaken/vhs_four_tvs.webp', '/images/cw-outbreak/control_panel_three_lights.webp',
  ...outbreakQuests.flatMap(quest => outbreakStages(quest).flatMap(stage => outbreakRegions.flatMap(region => outbreakLocation({ quest, stage, region }).images.map(i => i.src))))
])]

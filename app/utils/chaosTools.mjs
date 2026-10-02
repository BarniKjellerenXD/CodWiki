// Source-backed references; coordinates crop the authentic Reddit Ra chart in the UI.
export const raSymbols = [
  { name: 'Tiger', x: 0, y: 0 }, { name: 'Gladiator', x: 0, y: 270 },
  { name: 'Brawler', x: 0, y: 540 }, { name: 'Blightfather', x: 0, y: 810 },
  { name: 'Fire catalyst', x: 1010, y: 0 }, { name: 'Water catalyst', x: 1010, y: 270 },
  { name: 'Poison catalyst', x: 1010, y: 540 }, { name: 'Electric catalyst', x: 1010, y: 810 }
]
export const dormantHands = [
  ['Chaos of the Treasuries', 'Intersection of Treasuries — break the purple-glowing chaos crystal.', 'chaos_of_the_treasuries'],
  ['Near the Purple Blossoms', 'Intersection of Treasuries — bottom of the stairs, right of the Auger DMR.', 'purple_blossoms'],
  ['Barque of Gold', 'Stoa of the Athenians — beside the right side of the boat.', 'barque_of_gold'],
  ["The Shieldbearer’s Fountain", 'Stoa of the Athenians — vase on the fountain.', 'shieldbearers_fountain'],
  ["General’s Column", 'Spartan Monument — base of the column below the Stoa stairs.', 'generals_column'],
  ['Fallen Statesman', 'Spartan Monument — top of the stairs near Zeus and the Mystery Box.', 'fallen_statesman'],
  ['Beneath the Watchful Gaze of Zeus', 'Spartan Monument — beside the Zeus perk statue.', 'watchful_gaze_of_zeus'],
  ['Golden Taurus', 'Spartan Monument — beside Gaia’s shrine.', 'golden_taurus'],
  ['Where the Arrow Splits the Road', 'Intersection of Treasuries — below the giant arrow.', 'arrow_splits_the_road'],
  ['Where Sorrow Flows Beneath', 'River of Sorrow — beside the upper stairs.', 'sorrow_flows_beneath'],
  ['Where Sorrow Washes Over', 'River of Sorrow — left of the Odin perk statue.', 'sorrow_washes_over'],
  ['Wheel of Water', 'Cliff Ruins — left of the forge fire.', 'wheel_of_water'],
  ['Workbench of Hephaestus', 'Cliff Ruins — on the table inside the forge.', 'workbench_of_hephaestus'],
  ['Where the Serpent Snared the Eagle', 'Cliff Ruins — left of the eagle cage.', 'serpent_snared_the_eagle'],
  ['On the Broken Bridge', 'Bridge between Cliff Ruins and Center of the World.', 'broken_bridge'],
  ['Shrine of Wind and Sky', 'Center of the World — rock pile left of the Ouranos shrine.', 'shrine_of_wind_and_sky'],
  ['Top of the Center of the World', 'Center of the World — below the fast-travel portal.', 'top_of_the_center'],
  ['Chaos of Venom', 'Python Pass — crystal beside the Venom Trap pedestal.', 'chaos_of_venom'],
  ['Where the Mighty Titan Points', 'Python Pass — crystal to the left of the Titan wallbuy.', 'mighty_titan_points'],
  ['Steps of Flesh and Bone', 'Python Pass — near Charon’s shrine.', 'steps_of_flesh_and_bone']
].map(([clue, location, file]) => ({ clue, location, image: `/images/bo4-ancient-evil/${file}.webp` }))

export const hands = [
  { name: 'Gaia', color: '#8ee2a0', shrine: 'Spartan Monument', catalyst: 'Fire', need: 'Fallen for roots; Redeemed if a player uses Gaia in theater.', tasks: ['Temple Terrace: plant right of MOG 12', 'Stoa: plant behind the Mozu wall', 'Treasuries: plant left of Auger DMR'], action: 'Shoot each plant’s red crystals with Gaia, collect its seedling and return it to the shrine. Complete the portal trial.' },
  { name: 'Hemera', color: '#f1d47a', shrine: 'Monument of Craterus', catalyst: 'Electric', need: 'Redeemed for Ra’s beam defense.', tasks: ['Gymnasium Bathhouse mirror / light', 'Upper Road mirror / light', 'Temple Terrace mirror / light'], action: 'Rotate each mirror with bullets; shoot it with Hemera. Melee its lit bowl, run to the shrine and melee it before the light fades. Complete the portal trial.' },
  { name: 'Charon', color: '#f3969c', shrine: 'Python Pass', catalyst: 'Poison', need: 'Redeemed for the statue step.', tasks: ['First real Obol deposited', 'Second real Obol deposited', 'Third real Obol deposited'], action: 'Kill with Charon in the river beside Odin until it turns red. Drink, collect three real Obols on the Dark Side, return them and complete the portal trial. Health does not regenerate during the coin hunt.' },
  { name: 'Ouranos', color: '#86c7f4', shrine: 'Center of the World', catalyst: 'Water', need: 'Redeemed to aim the ballista.', tasks: ['Arrow left of Pack-a-Punch: feather delivered', 'Python Pass near Charon: feather delivered', 'Cliff Ruins left of Mystery Box: feather delivered'], action: 'Use Ouranos to fling a zombie into each giant arrow, then shoot the airborne feather toward the shrine without letting it land. Complete the portal trial.' }
]

export function tributeResult(state) {
  const players = Number(state.players)
  if (!Number.isInteger(players) || players < 1 || players > 4) return { status: 'waiting', message: 'Choose the number of players in this match.' }
  const values = [['common', .5], ['rare', 1], ['legendary', 4], ['epic', 6]]
  let earned = 0
  for (const [field, points] of values) {
    const raw = state[field] ?? ''
    if (raw !== '' && !/^\d{1,3}$/.test(String(raw))) return { status: 'invalid', message: 'Reward counts must be whole numbers from 0 to 999.' }
    earned += Number(raw || 0) * points
  }
  const required = players * 9
  const remaining = Math.max(0, required - earned)
  return { status: 'ready', earned, required, remaining, message: remaining ? `${remaining} more tribute points needed.` : 'Target reached — check that the Eternal Flame is blue.', suggestion: remaining ? `${Math.ceil(remaining / 6)} more Epic reward${Math.ceil(remaining / 6) === 1 ? '' : 's'} would cover the remaining points.` : 'Melee the blue flame with Apollo’s Will to ignite the spear.' }
}

export const danuStages = [
  { id: 'wood', title: 'Burn wood', location: 'Odin Tower: Cauldron', rounds: 2, done: 'check-4', cue: 'Collect the charred wood when it is ready at the cauldron.' },
  { id: 'mix', title: 'Prepare fertilizer', location: 'Zeus Tower: Bath House bowl', rounds: 1, done: 'check-10', cue: 'Inspect after a full non-special round. Collect only when the mixture is ready; allow another round if necessary.' },
  { id: 'plant', title: 'Wait after planting', location: 'Danu Tower: Arboretum, between the trees', rounds: 2, done: 'planted-ready', cue: 'Wait for green smoke, then trigger a Fire Bomb kill over the fertilizer.' }
]
export function danuWait(stageId, start, current) {
  const stage = danuStages.find(item => item.id === stageId)
  if (!stage) return 'Choose a preparation stage.'
  if (!/^\d{1,3}$/.test(String(start ?? '')) || !/^\d{1,3}$/.test(String(current ?? ''))) return stage.cue
  const placed = Number(start), now = Number(current)
  if (now < placed) return 'The current round is earlier than the placement round. Check your entries.'
  // Placement mid-round is not a completed full round. Special rounds may not advance the item.
  const full = Math.max(0, now - placed - 1)
  return `${full} possible full round${full === 1 ? '' : 's'} since placement (special rounds may not count). ${stage.cue}`
}

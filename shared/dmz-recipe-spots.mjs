// World recipes: where each one has been found in Hajin, where finds cluster
// and how to search those places. Rows use the sightings shape with unit 'find'
// (shared/dmz-sightings.mjs): counts are published finds, not drop rates.
// Recipes from the level track or the Orders have no rows; their Unlock line
// already says where they come from.

import { SIGHTINGS_CHECKED, countLabel, rowTarget, topRows } from './dmz-sightings.mjs'

const ATH = 'allthings-how-to-get-weapon-manuals'
const META_LOOT = 'mw4meta-best-loot-spots'
const META_FARM = 'mw4meta-weapon-manual-farm'
const FOB = 'callofduty-call-of-duty-modern-warfare'
const BARRACKS_ROW = { report: 'chang-san-barracks', where: 'Chang-san Air Base barracks', square: 'B5' }
const CRATE_PAGES = ['dmzcodex-recipes-tempered-armor-vest', 'dmzcodex-the-doctors-command-office', 'dmzcodex-dmz-keys-loot-rooms-guide', 'allthings-mw4-dmz-how-to-get', 'allthings-modern-warfare-4-dmz-key', 'xboxplay-get-tempered-armor-vest', 'dmztracker-tempered-armor-vest']
const ANNEX_PAGES = ['dmzcodex-re-education-center-annex', 'dmzcodex-dmz-keys-loot-rooms-guide']

// Recipes found in game that nobody has published a place for yet.
export const RECIPES_WITHOUT_SPOT = ['legendary-parachute-recipe', 'bomb-glider-recipe', 'large-secure-backpack-recipe']

// Keyed by Intel recipe id. rows are the finds; how, fallback and videos are
// the way to go and get one.
export const recipePlaybooks = {
  'tempered-armor-vest-recipe': {
    rows: [
      {
        kind: 'seen', report: 'the-doctors-command-office', where: 'The Doctor\'s Command Office (Mirae General Hospital)', square: 'F5', search: 'Large Lieutenant crate', seen: 3,
        disputed: 'Guides disagree on the floor: second or seventh.', note: 'Not every crate holds the recipe.', sources: CRATE_PAGES,
      },
      { kind: 'seen', layer: 'police', where: 'Any police station', search: 'Blue duffel bag', seen: 1, sources: ['reddit-third-successful-extraction-somehow-got'] },
    ],
    how: [
      'Find The Doctor at Mirae General Hospital with a Lieutenant Hunt tower or his Boss Board intel.',
      'Take his Command Office key from the body and put it in a Secure Slot.',
      'Go up to his Command Office; guides disagree on the floor (second or seventh), so check both.',
      'Open the large Lieutenant crate.',
      'Extract with the recipe in a Secure Slot.',
    ],
    fallback: [
      'The crate is not guaranteed to hold the recipe; extract what is there and try another match.',
      'One player found it in a blue duffel bag at a police station; check police stations on your way.',
      'Not every kill drops the key.',
    ],
    videos: [
      { id: 'youtube-q0m5u2rkgyu', why: 'The whole Tempered recipe chain, from The Doctor to the extract' },
      { id: 'youtube-0dzj-fybpru', why: 'The Doctor fight at the hospital, without commentary' },
      { id: 'youtube-xs0gwceq_zw', why: 'Where the Command Office door is' },
      { id: 'youtube-qybvg2zqxqo', why: 'Finding the Command Office inside the hospital' },
      { id: 'youtube-3akva4miouw', why: 'Which door the Command Office key opens' },
    ],
    sources: [
      ...CRATE_PAGES, 'xboxplay-beat-doctor-at-mirae', 'gamingpromax-bosses', 'dmztracker-bosses-doctor', 'gamesgg-boss-locations',
      'allthings-mw4-dmz-how-to-beat', 'dmzcodex-dmz-armor-backpacks-guide', 'reddit-third-successful-extraction-somehow-got',
      'youtube-q0m5u2rkgyu', 'youtube-8lb8riyufq8', 'youtube-xs0gwceq_zw', 'youtube-qybvg2zqxqo', 'youtube-3akva4miouw',
    ],
  },
  'energy-drink-recipe': {
    rows: [{ kind: 'seen', ...BARRACKS_ROW, search: 'Washroom mirror cabinet', seen: 1, sources: [ATH] }],
  },
  'drill-charge-recipe': {
    rows: [
      {
        kind: 'seen', ...BARRACKS_ROW, search: 'Washroom medicine cabinets', seen: 3,
        note: 'One of the three came from an Air Base run that does not name the container.', sources: [ATH, META_FARM, META_LOOT],
      },
      {
        kind: 'unplaced', where: 'Place shown on video only', seen: 2, note: 'Two location videos; neither writes the place down.', sources: ['youtube-muogab_gdgq', 'youtube-fnncz21mxpo'],
        videos: [
          { id: 'youtube-muogab_gdgq', why: 'Shows a Drill Charge recipe find on screen', shows: true },
          { id: 'youtube-fnncz21mxpo', why: 'Another Drill Charge recipe find, shown on screen', shows: true },
        ],
      },
    ],
  },
  'pain-killers-recipe': {
    rows: [
      {
        kind: 'seen', ...BARRACKS_ROW, search: 'Washroom medicine cabinets', seen: 2,
        note: 'One of the two came from an Air Base run that does not name the container.', sources: [ATH, META_LOOT],
      },
      {
        kind: 'seen', pin: 'cheongun-outskirts', where: 'Cheongun Outskirts', square: 'E4', search: 'Chemical Storage container', seen: 1,
        note: 'A copy taken from a killed operator at the gas-station exfil is not counted.', sources: [META_LOOT],
      },
    ],
  },
  'zip-gun-recipe': {
    rows: [
      {
        kind: 'seen', report: 'counting-room-vault-heavenly-luck-casino', where: 'Counting Room Vault (Heavenly Luck Casino)', square: 'F4', search: 'Weapons locker', seen: 1, sources: [ATH],
        videos: [{ id: 'youtube-nu383z1yqjw', why: 'Where the vault key is and what the vault can hold' }],
      },
      { kind: 'seen', ...BARRACKS_ROW, search: 'Blue duffel bag', seen: 1, note: 'Both spots come from one guide.', sources: [ATH] },
    ],
  },
  'combat-drone-recipe': {
    rows: [
      { kind: 'seen', ...BARRACKS_ROW, search: 'Footlocker', seen: 1, sources: [ATH] },
      {
        kind: 'seen', report: 'supreme-leaders-bunker', where: 'Supreme Leader\'s Bunker (Chang-san Air Base)', square: 'B5', search: 'Bedroom footlocker', seen: 1,
        note: 'Needs the Supreme Leader Access Card. The key card reads B6.', sources: [META_LOOT],
      },
    ],
  },
  'large-scavenger-backpack-recipe': {
    rows: [
      { kind: 'seen', pin: 'fire-c6', where: 'Fire station near Deadtown', square: 'C6', search: 'First aid kit', seen: 1, sources: [ATH] },
      { kind: 'seen', ...BARRACKS_ROW, search: 'Footlocker', seen: 1, note: 'Found on the last run of a six-run test.', sources: [META_LOOT] },
      {
        kind: 'unplaced', where: 'Place shown on video only', seen: 1, sources: ['youtube-knfiaw6w_4m'],
        videos: [{ id: 'youtube-knfiaw6w_4m', why: 'Shows a Large Scavenger Backpack recipe find on screen', shows: true }],
      },
    ],
  },
  'medium-secure-backpack-recipe': {
    rows: [
      {
        kind: 'seen', pin: 'compound-echo', where: 'Compound Echo', square: 'G7', search: 'Gangbyeon Apartment B weapons locker', seen: 1,
        note: 'The Apartment B key is in Apartment A; cross to Apartment B over the roof.', sources: [META_LOOT],
      },
    ],
  },
  '2-plate-ballistic-gel-vest-recipe': {
    rows: [
      { kind: 'seen', pin: 'fortress-heavenly-luck-casino', where: 'Heavenly Luck Casino', square: 'F4', search: 'Grey filing cabinet on the parking level', seen: 1, sources: [ATH] },
      {
        kind: 'seen', report: 're-education-center-annex-deadtown', where: 'Re-Education Center Annex (Deadtown)', square: 'B7', search: 'Weapons locker in the key room', seen: 1,
        note: 'Needs the Re-Education Center Annex key. DMZ Codex gives B6.', sources: ANNEX_PAGES,
        videos: [{ id: 'youtube-s9ehl4z06ds', why: 'The way into the Annex key room' }],
      },
      {
        kind: 'unplaced', where: 'Place shown on video only', seen: 1, sources: ['youtube-hmqto5wpu0q'],
        videos: [{ id: 'youtube-hmqto5wpu0q', why: 'Shows a 2-Plate Ballistic Gel Vest recipe find on screen', shows: true }],
      },
    ],
  },
  'claymore-recipe': {
    rows: [
      {
        kind: 'seen', layer: 'police', where: 'Any police station', search: 'Filing cabinet', seen: 1,
        disputed: 'The guide\'s table says the armory, its text a filing cabinet.', note: 'The guide does not say which station.', sources: [META_LOOT],
      },
    ],
  },
  'stim-recipe': {
    rows: [
      { kind: 'seen', layer: 'clinic', where: 'Any clinic', search: 'Yellow cabinet', seen: 1, sources: ['reddit-1xb7he9'] },
      { kind: 'seen', where: 'An apartment closet', search: 'Duffel bag', seen: 1, sources: ['reddit-third-successful-extraction-somehow-got'] },
      {
        kind: 'unplaced', where: 'Place not given', seen: 3, note: 'One player gave no place, and two location videos show the find on screen only.',
        sources: ['reddit-1xcft4g', 'youtube-9jlj2whvqu0', 'youtube-vz5wpopoapo'],
        videos: [
          { id: 'youtube-9jlj2whvqu0', why: 'Shows a Stim recipe find on screen', shows: true },
          { id: 'youtube-vz5wpopoapo', why: 'An Ultra loot run that turns up a Stim recipe', shows: true },
        ],
      },
    ],
  },
  '3-plate-helmet-armor-vest-recipe': {
    rows: [
      {
        kind: 'unplaced', where: 'Place not given', seen: 2, note: 'One player found it in a random container; a location video shows another find on screen only.',
        sources: ['reddit-1xb7he9', 'youtube-o4qwphyfdko'],
        videos: [{ id: 'youtube-o4qwphyfdko', why: 'Shows a 3-Plate Helmet Armor Vest recipe find on screen', shows: true }],
      },
    ],
  },
  'door-breacher-charge-recipe': {
    rows: [
      {
        kind: 'seen', report: 'reactor-drc-locker', where: 'Reactor DRC Locker (Haneul Nuclear Reactor)', square: 'I4', search: 'The locker in the Reactor 02 pool', seen: 1,
        note: 'Needs the Ultra Reactor DRC Locker key and radiation gear. The key card reads H4.', sources: ['reddit-1xdlss1'],
      },
      {
        kind: 'seen', where: 'A toolbox in an Extreme zone', seen: 1, note: 'The video does not name the zone. Hajin\'s Extreme zones are the Air Base Bunker and the Nenshin Tech Complex.',
        sources: ['youtube-i2-adlsxbry'], videos: [{ id: 'youtube-i2-adlsxbry', why: 'The recipe coming out of an ordinary toolbox', shows: true }],
      },
    ],
  },
}
export const recipePlaybook = id => Object.hasOwn(recipePlaybooks, id) ? recipePlaybooks[id] : undefined

// The Chang-san barracks run, the place with the most published finds.
export const BARRACKS = {
  how: [
    'Run Operation Iron Citadel, or drop near Chang-san Air Base (B5) in free roam.',
    'Check the barracks washroom mirror and medicine cabinets first.',
    'Then the bunk-room duffel bags and footlockers.',
    'Put any recipe in a Secure Slot at once and extract.',
  ],
  fallback: [
    'Recipes are not there every run: one sample found 2 recipes in 7 runs, another 5 recipes or manuals in 6 runs.',
    'The armory code changes every match; do not rely on a code from a video.',
    'Colossus is part of Iron Citadel; skirt the fence if you only came for loot.',
  ],
  noVideo: 'No barracks loot video linked yet',
  sources: [ATH, META_FARM, META_LOOT, 'dmzcodex-iron-citadel-walkthrough', 'gamerfuzion-weapon-manual-farm-operation', 'reddit-1xbsgxs', 'codcentral-mw4-dmz-operation-iron-citadel', 'youtube-gxz8q9y-zgk'],
}

// Every world recipe find, counted by place.
export const recipeHotspots = [
  {
    kind: 'seen', ...BARRACKS_ROW, search: 'Washroom cabinets, bunk-room duffels and footlockers', seen: 14,
    note: 'Includes one find in the Supreme Leader\'s Bunker under Admin Complex No. 2 and the recipes from two run samples.',
    sources: [ATH, META_FARM, META_LOOT, 'dmzcodex-iron-citadel-walkthrough', 'reddit-1xbsgxs'], how: BARRACKS.how, fallback: BARRACKS.fallback,
  },
  {
    kind: 'seen', pin: 'mirae-general-hospital', where: 'Mirae General Hospital', square: 'F5', seen: 5,
    note: 'The Tempered recipe in The Doctor\'s Command Office crate, and two recipes on two bodies in the basement, one of them a Legendary backpack recipe (that player said only "the hospital").',
    sources: [...CRATE_PAGES, 'reddit-1xb7he9'],
  },
  {
    kind: 'seen', pin: 'fortress-heavenly-luck-casino', where: 'Heavenly Luck Casino', square: 'F4', seen: 2,
    note: 'A Zip Gun recipe in the Counting Room Vault and a 2-Plate Ballistic Gel Vest recipe on the parking level, both from one guide.', sources: [ATH],
  },
  {
    kind: 'seen', layer: 'police', where: 'Police stations', seen: 2,
    note: 'A Tempered recipe in a blue duffel bag and a Claymore recipe in a filing cabinet. Neither source says which station.',
    sources: ['reddit-third-successful-extraction-somehow-got', META_LOOT],
  },
  { kind: 'seen', pin: 'cheongun-outskirts', where: 'Cheongun Outskirts', square: 'E4', seen: 1, note: 'A Pain Killers recipe in a Chemical Storage container.', sources: [META_LOOT] },
  {
    kind: 'seen', report: 'reactor-drc-locker', where: 'Reactor DRC Locker (Haneul Nuclear Reactor)', square: 'I4', seen: 1,
    note: 'A Door Breacher Charge recipe. Needs the Ultra key; the key card reads H4.', sources: ['reddit-1xdlss1'],
  },
  {
    kind: 'seen', report: 're-education-center-annex-deadtown', where: 'Re-Education Center Annex (Deadtown)', square: 'B7', seen: 1,
    note: 'A 2-Plate Ballistic Gel Vest recipe in the weapons locker. DMZ Codex gives B6.', sources: ANNEX_PAGES,
  },
  { kind: 'seen', pin: 'compound-echo', where: 'Compound Echo', square: 'G7', seen: 1, note: 'A Medium Secure Backpack recipe in the Gangbyeon Apartment B weapons locker.', sources: [META_LOOT] },
  { kind: 'seen', pin: 'fire-c6', where: 'Fire station near Deadtown', square: 'C6', seen: 1, note: 'A Large Scavenger Backpack recipe in a first aid kit.', sources: [ATH] },
  { kind: 'seen', layer: 'clinic', where: 'Clinics', seen: 1, note: 'A Stim recipe in a yellow cabinet.', sources: ['reddit-1xb7he9'] },
]

// How often the barracks paid out. Always shown with the number of runs.
export const runSamples = [
  { where: 'Chang-san Air Base barracks, Iron Citadel route', runs: 7, text: '2 recipes and no Weapon Manuals in 7 runs', note: 'One reported sample, cited by a guide.', sources: ['dmzcodex-iron-citadel-walkthrough'] },
  { where: 'Chang-san Air Base', runs: 6, text: '4 recipes, 1 Weapon Manual and 1 backpack in 6 runs', sources: [META_LOOT] },
]

// World recipes found with no place given.
export const recipesNoPlace = [
  { name: 'Fulton Drop Marker', intel: 'fulton-balloon', seen: 1, note: 'One player. The post is a picture; the name comes from its comments.', sources: ['reddit-1xcffeo'] },
  { name: 'Trophy System', seen: 1, note: 'One player\'s only recipe after about five extracts, an Air Base raid among them.', sources: ['reddit-third-successful-extraction-somehow-got'] },
  {
    name: 'Bombing Run', seen: 1, note: 'A location video shows the find on screen only.', sources: ['youtube-lkh4dvnr2h8'],
    videos: [{ id: 'youtube-lkh4dvnr2h8', why: 'Shows a Bombing Run recipe find on screen', shows: true }],
  },
  {
    name: 'Heartbeat Sensor', seen: 1, note: 'A location video shows the find on screen only.', sources: ['youtube-nbha8tn3fk8'],
    videos: [{ id: 'youtube-nbha8tn3fk8', why: 'Shows a Heartbeat Sensor recipe find on screen', shows: true }],
  },
]

// What to open. Nobody has found a pattern for which recipe drops where.
export const containers = {
  lead: 'Recipes can come out of almost any container, and nobody has found a pattern for which recipe drops where.',
  items: [
    { name: 'Safes', text: 'In compounds and high-threat zones. One player found more Weapon Manuals in safes than anywhere else, plus about six consumable recipes.' },
    { name: 'Key rooms', text: 'Locked rooms behind a key. Players rate the yellow and red ones highest.' },
    { name: 'Small containers', text: 'Filing cabinets, first aid kits, toolboxes, duffel bags and medicine cabinets have all held recipes, so open every one.' },
  ],
  note: 'They are scarce: one player with two operators at the top level had found 10 recipes in all.',
  sources: ['reddit-1xchsle', 'reddit-1xec2gx', 'reddit-1xbsgxs', 'reddit-1xe33ab', 'reddit-1xc2i05', 'reddit-1xb7he9', 'youtube-adhcn7se7pw', 'youtube-i2-adlsxbry'],
}

export const exfilRule = {
  text: 'A recipe you extract is always used up and always pays $5,000, even if your printer already has it. The first one adds the recipe to your printer for good.',
  sources: [FOB],
}

export const secureSlotTip = {
  text: 'Move a recipe into a Secure Slot the moment you pick it up and head for exfil: other players can take it, and anything outside a Secure Slot is lost if you fail to extract. The Medium Backpack is the first with Secure Slots.',
  sources: ['windowscentral-gaming-most-essential-gear', 'gamerfuzion-weapon-manual-farm-operation', FOB],
}

const midSentence = text => text.replace(/^(A|An|Any) /, word => word.toLowerCase())

// One line for a recipe card: the place with the most finds, or why there is none.
// Level-track and Orders recipes get null, since their Unlock line says it.
export function recipeSpotLine(id) {
  const rows = recipePlaybook(id)?.rows || []
  const top = topRows(rows, 1, 'find')
  if (top.length) {
    const names = top.slice(0, 2).map((row, index) => index ? midSentence(row.where) : row.where).join(' or ')
    const more = top.length > 2 ? ` +${top.length - 2} more` : ''
    return {
      kind: 'found',
      text: `Found in Hajin: ${names}${more} · ${countLabel(top[0].seen, 'find')}${top.length > 1 ? ' each' : ''}`,
      target: rowTarget(top[0]),
    }
  }
  const unplaced = rows.filter(row => row.kind === 'unplaced').reduce((total, row) => total + row.seen, 0)
  if (unplaced) return { kind: 'unplaced', text: `Found in Hajin, place not given · ${countLabel(unplaced, 'find')}` }
  if (RECIPES_WITHOUT_SPOT.includes(id)) return { kind: 'none', text: `No find published yet (checked ${SIGHTINGS_CHECKED.replace(/ \d{4}$/, '')})` }
  return null
}

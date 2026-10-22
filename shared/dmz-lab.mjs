// DMZ Intel concepts for /dmz/lab: what each draft is, and the helpers the
// drafts share. Nothing here changes the live Intel page; delete this file
// together with app/pages/dmz/lab once a direction is chosen.

import { dmzLabPages, dmzStations } from './dmz.mjs'
import { dmzIntel } from './dmz-intel.mjs'
import { intelEntry, printerRecipes } from './dmz-stations.mjs'

const stationIcon = id => dmzStations.find(station => station.id === id).icon
const ICONS = {
  armory: 'M4 7.5l8-4.5 8 4.5v9l-8 4.5-8-4.5z M4 7.5l8 4.5 8-4.5 M12 12v9',
  status: 'M3 12h4l2.5-6 5 12 2.5-6h4',
  search: 'M10.5 18a7.5 7.5 0 1 0 0-15a7.5 7.5 0 0 0 0 15z M16 16l5 5',
  key: 'M8 15a4 4 0 1 0 0-8a4 4 0 1 0 0 8 M11.5 11H21 M18 11v3 M15 11v2',
  exfil: 'M12 21V9 M7 13l5-5 5 5 M5 3h14',
  bug: 'M9 7a3 3 0 0 1 6 0 M7 10h10v5a5 5 0 0 1-10 0z M12 10v10 M3 13h4 M17 13h4 M4 8l3 2 M20 8l-3 2 M4 19l3-2 M20 19l-3-2',
  clock: 'M12 21a9 9 0 1 0 0-18a9 9 0 1 0 0 18 M12 7v5l3 2',
  start: 'M5 21V4 M5 4h11l-2 4 2 4H5',
}

// ---------------------------------------------------------------- Concepts

export const labConcepts = [
  {
    id: 'a', letter: 'A', path: '/dmz/lab/intel-a', name: 'Stations',
    pitch: 'Split Intel into stations that match the FOB: a Boss Board, a 3D Printer, Operators, Missions, an Armory, a Field manual and Status. Locations and keys stay on the Tac-Map and the key tracker.',
    bestFor: 'Players who think in game terms: “I am at the printer”, “who is this Lieutenant?”',
    pros: [
      'Matches the FOB and the station menu, which already shows a locked Boss Board and 3D Printer.',
      'Each station gets a layout shaped to its job: a boss roster with places and drops, a print planner that adds up materials, trait trees side by side.',
      'Short pages, so phones scroll less and each page title says what it covers.',
    ],
    cons: [
      'Seven pages to keep in step instead of one.',
      'No search across everything unless it is added separately.',
      'Old #intel- links need mapping to the station that now owns each entry.',
    ],
    cost: 'High', costNote: 'Seven pages. The shaped ones, Boss Board, 3D Printer and traits, take the longest.',
  },
  {
    id: 'b', letter: 'B', path: '/dmz/lab/intel-b', name: 'Ask first',
    pitch: 'Intel opens with one question, “What are you doing right now?”, and eight answers. Each answer shows a short, ordered set of entries and the tool that helps, with a link to everything else.',
    bestFor: 'New players, and anyone who opens Intel without a name to search for.',
    pros: [
      'The friendliest first screen: one question instead of 590 cards.',
      'Each answer is short and in reading order, with the right tracker one tap away.',
      'Cheap: the database stays as it is; answers are lists of entry IDs and filters.',
    ],
    cons: [
      'Hand-picked answers go stale as Intel grows, so they need a check after each research round.',
      'One extra tap for players who already know what they want.',
      '“See everything” still ends on today’s long list.',
    ],
    cost: 'Low–medium', costNote: 'One page and a list of answers. Keeping the answers current is the ongoing cost.',
  },
  {
    id: 'c', letter: 'C', path: '/dmz/lab/intel-c', name: 'Dossiers',
    pitch: 'A compact directory of names replaces the wall of cards. Each entry opens as its own dossier page with every fact, its sources, where it sits on Hajin and related entries.',
    bestFor: 'Sharing one thing in squad chat, and reading sideways from a boss to their key to their mission.',
    pros: [
      'Every entry gets a link worth sharing.',
      'Room for all facts and sources, plus places from the Tac-Map and related entries.',
      'The directory is dense but calm: names only, grouped, with a filter.',
    ],
    cons: [
      '590 short pages could look thin to search engines, so most would need noindex or merging.',
      'Comparing things, such as traits or recipes, means opening them one by one.',
      'Related links are matched from text and need tuning to avoid noise.',
    ],
    cost: 'Medium', costNote: 'One directory and one dynamic page. Related links and search-engine care add more.',
  },
  {
    id: 'd', letter: 'D', path: '/dmz/lab/intel-d', name: 'In the field',
    pitch: 'No separate Intel page. Entries appear where the question comes up: an Order shows the recipes and places it names, a Tac-Map card lists its bosses and keys, a key shows its room. Any entry opens in a drawer without leaving the station.',
    bestFor: 'Players in the middle of a run who do not want to change page.',
    pros: [
      'Answers sit next to the task: the Preparation Order shows what its backpack and vest cost to print.',
      'No context switch mid-run; the drawer keeps your place.',
      'Makes the stations people use most, the trackers and the map, more useful.',
    ],
    cons: [
      'Rules, bugs and dates have no station, so they still need a home.',
      'Linking Orders and places to entries needs upkeep.',
      'Touches the Tac-Map and the trackers, which other work is changing now.',
    ],
    cost: 'Medium–high', costNote: 'Spread across three stations, plus a home for what is left over.',
  },
  {
    id: 'e', letter: 'E', path: '/dmz/lab/intel-e', name: 'Quick find',
    pitch: 'Intel becomes a search palette. Press / or Ctrl K on any DMZ page, type a few letters and pick from ranked results with a preview. Grid squares such as H6 list the places in them.',
    bestFor: 'Players who know the name: a key off the floor, a Lieutenant on the kill feed.',
    pros: [
      'The fastest path when you know the name: type, arrow, Enter.',
      'Ranked results put name matches first, unlike today’s plain filter.',
      'Works from every station, which suits a second screen during a match.',
    ],
    cons: [
      'No help for players who do not know what to ask.',
      'Little browsing; categories become a row of chips.',
      'Phone keyboards cover half the results, so the layout needs care.',
    ],
    cost: 'Low–medium', costNote: 'One component in the DMZ shell and a ranking helper.',
  },
]

export const labMix = {
  id: 'mix', path: '/dmz/lab/intel-mix', name: 'Stations + Quick find',
  parts: ['a', 'e', 'b'],
  pitch: 'Stations (A) for browsing, Quick find (E) on every page for names you know, and the Ask-first tiles (B) as the Intel landing that points at the right station.',
  why: [
    'It answers the complaint directly: no page dumps everything, and each station does one job.',
    'It finishes what the site already promises: the Boss Board and 3D Printer are locked stations in the menu today.',
    'Quick find keeps the one thing the current page does well, searching everything at once, and makes it reachable from any station.',
    'It ships one station at a time, and old #intel- links can redirect to the station that owns each entry.',
    'It skips the risky parts for now: no 590 thin pages (C), and no rework inside the Tac-Map while it is being changed (D). The drawer from D comes along for free.',
  ],
}

// At-a-glance comparison on /dmz/lab, scored 1 to 3 (3 is best, so cheap
// builds and light upkeep score high).
export const labCriteria = [
  { id: 'first', label: 'Friendly first screen' },
  { id: 'lookup', label: 'Finding a name you know' },
  { id: 'browse', label: 'Browsing a topic' },
  { id: 'run', label: 'Use mid-run' },
  { id: 'upkeep', label: 'Light upkeep' },
  { id: 'build', label: 'Cheap to build' },
]
export const labScores = {
  a: { first: 2, lookup: 1, browse: 3, run: 2, upkeep: 2, build: 1 },
  b: { first: 3, lookup: 1, browse: 2, run: 1, upkeep: 1, build: 2 },
  c: { first: 2, lookup: 2, browse: 2, run: 1, upkeep: 2, build: 2 },
  d: { first: 2, lookup: 1, browse: 1, run: 3, upkeep: 1, build: 1 },
  e: { first: 1, lookup: 3, browse: 1, run: 3, upkeep: 3, build: 3 },
  mix: { first: 3, lookup: 3, browse: 3, run: 3, upkeep: 2, build: 1 },
}

export const labConcept = id => id === labMix.id ? labMix : labConcepts.find(concept => concept.id === id)
export const labPage = path => dmzLabPages.find(page => page.path === path)

// ---------------------------------------------------------------- Shared bits

// The live stations grew out of these drafts; the helpers now live in
// shared/dmz-stations.mjs and keep their draft names here.
export {
  intelDetail as labDetail, intelEntry as labEntry, entryPlaces, placeLink, intelPlaces as labPlaces, placesInSquare,
  bossGroups as labBossGroups, PRINTER_RESOURCES as LAB_RESOURCES, recipeMaterials, printerRecipes as labRecipes, recipeUnlock, sumMaterials,
  traitTrees, traitPlace, issueStates, issueState, intelTimeline as labTimeline, mentionsIn, relatedIntel, orderIntel, rankIntel,
} from './dmz-stations.mjs'
const entriesOf = ids => ids.map(id => intelEntry(id)).filter(Boolean)

// ---------------------------------------------------------------- A: stations

// Each desk shows the categories one job needs. Locations and keys already
// have homes on the Tac-Map and in the key tracker, so those stations take them.
export const labDesks = [
  { id: 'boss', label: 'Boss Board', short: 'Bosses', icon: stationIcon('boss'), categories: ['enemies'], desc: 'Lieutenants and Commanders: where they show up, what they drop, and the forces around them.' },
  { id: 'printer', label: '3D Printer', short: 'Printer', icon: stationIcon('printer'), categories: ['crafting'], desc: 'Every recipe with its materials, and a planner that adds up what to loot this run.' },
  { id: 'operators', label: 'Operators', short: 'Traits', icon: stationIcon('operators'), categories: ['traits', 'operators'], desc: 'The three trait trees side by side, plus Active Duty, MIA and Dog Tags.' },
  { id: 'missions', label: 'Missions', short: 'Missions', icon: stationIcon('orders'), categories: ['missions'], desc: 'Story Missions, Dynamic Ops, Side Ops and the Orders the tracker does not cover yet.' },
  { id: 'armory', label: 'Armory', short: 'Armory', icon: ICONS.armory, categories: ['gear'], desc: 'Weapons, equipment, consumables, backpacks and kits.' },
  { id: 'manual', label: 'Field manual', short: 'Manual', icon: stationIcon('briefing'), categories: ['mechanics', 'exfil', 'vehicles', 'fob', 'economy', 'tips'], desc: 'How the zone works: rules, infil and exfil, vehicles, the FOB, cash and field notes.' },
  { id: 'status', label: 'Status', short: 'Status', icon: ICONS.status, categories: ['issues', 'dates'], desc: 'Known issues by fix status, and the dates that matter.' },
]
export const labHandoffs = [
  { id: 'deploy', category: 'map', label: 'Tac-Map', to: '/dmz/hajin', icon: stationIcon('deploy'), desc: 'Locations stay on the map.' },
  { id: 'stash', category: 'keys', label: 'Key tracker', to: '/dmz/stash', icon: stationIcon('stash'), desc: 'Keys and rooms stay in the tracker.' },
]
export const labDesk = id => labDesks.find(desk => desk.id === id)
export const deskOf = entry => labDesks.find(desk => desk.categories.includes(entry.category))
export const handoffOf = entry => labHandoffs.find(item => item.category === entry.category)
export const deskEntries = desk => dmzIntel.filter(entry => desk.categories.includes(entry.category))

// ---------------------------------------------------------------- E: ranked search

export const labSuggestions = ['Bale', 'Medkit', 'exfil', 'H6', 'Secure Slots', 'crash', 'Season 1', 'Colossus']

// ---------------------------------------------------------------- B: ask first

// kind: steps (reading order), choose (pick one), find (search a category),
// orders, issues or dates. ids must be real Intel entries; tests check them.
export const labNeeds = [
  {
    id: 'new', label: 'First deploy', ask: 'I am new to DMZ', icon: ICONS.start, kind: 'steps',
    intro: 'Ten short reads in the order you need them, from the Ready Up screen to getting out with your loot.',
    steps: [
      { title: 'Before you deploy', ids: ['deployment-options', 'recommended-infil-kit', 'free-loadout', 'persistent-stash-and-wipes'] },
      { title: 'In the zone', ids: ['threat-levels', 'start-in-low-threat-areas', 'health-and-the-tourniquet'] },
      { title: 'Getting out', ids: ['exfil-sites', 'extract-early-dont-get-greedy', 'death-and-failed-exfil'] },
    ],
    more: { to: '/dmz/briefing', label: 'Read the full briefing' },
  },
  {
    id: 'key', label: 'I found a key', ask: 'What does this key open?', icon: ICONS.key, kind: 'find', categories: ['keys'],
    intro: 'Type the name on the key card. Each key lists the room it opens, and the tracker shows the room on the map.',
    more: { to: '/dmz/stash', label: 'Open the key tracker' },
  },
  {
    id: 'boss', label: 'Hunting a boss', ask: 'Where is this Lieutenant?', icon: stationIcon('boss'), kind: 'choose',
    intro: 'Pick a Lieutenant or Commander to see where players find them and what they drop.',
    ids: dmzIntel.filter(entry => entry.category === 'enemies' && (['Lieutenant', 'Boss'].includes(entry.type)) && !['lieutenants', 'commanders'].includes(entry.id)).map(entry => entry.id),
    lead: ['lieutenants', 'commanders'],
    more: { to: '/dmz/intel?c=enemies', label: 'All enemies in Intel' },
  },
  {
    id: 'print', label: 'Printing gear', ask: 'What does it cost to print?', icon: stationIcon('printer'), kind: 'choose',
    intro: 'Pick a recipe to see its materials and how it unlocks.',
    ids: printerRecipes.map(entry => entry.id),
    lead: ['how-crafting-works'],
    more: { to: '/dmz/intel?c=crafting', label: 'All crafting in Intel' },
  },
  {
    id: 'order', label: 'Stuck on an Order', ask: 'How do I finish this Order?', icon: stationIcon('orders'), kind: 'orders',
    intro: 'Pick the Order. Its tasks come with the recipes, items and places they name.',
    more: { to: '/dmz/orders', label: 'Open the Orders tracker' },
  },
  {
    id: 'exfil', label: 'Getting out', ask: 'How do I extract safely?', icon: ICONS.exfil, kind: 'steps',
    intro: 'The ways out of Hajin, and what players say about holding an exfil.',
    steps: [
      { title: 'Ways out', ids: ['exfil-sites', 'alternate-exfil-methods', 'flare-exfil', 'fulton-balloon', 'story-mission-exfils'] },
      { title: 'Staying alive', ids: ['exfil-camping', 'plan-around-exfil-campers', 'extract-early-dont-get-greedy', 'successful-exfil'] },
    ],
    more: { to: '/dmz/intel?c=exfil', label: 'Infil and exfil in Intel' },
  },
  {
    id: 'broken', label: 'Something broke', ask: 'Is it the game or me?', icon: ICONS.bug, kind: 'issues',
    intro: 'Known issues since early access, sorted by whether a fix is out.',
    more: { to: '/dmz/intel?c=issues', label: 'All known issues in Intel' },
  },
  {
    id: 'next', label: 'What is coming', ask: 'When is Season 1?', icon: ICONS.clock, kind: 'dates',
    intro: 'Dates that are set, in order, then the plans without a date yet.',
    more: { to: '/dmz/intel?c=dates', label: 'Launch and seasons in Intel' },
  },
]
export const labNeed = id => labNeeds.find(need => need.id === id)
export const needEntries = need => entriesOf([...(need.steps || []).flatMap(step => step.ids), ...(need.ids || []), ...(need.lead || [])])

// The mix: each need points at the station that answers it.
export const mixNeedTargets = {
  new: { desk: 'manual' }, key: { to: '/dmz/stash' }, boss: { desk: 'boss' }, print: { desk: 'printer' },
  order: { to: '/dmz/orders' }, exfil: { desk: 'manual' }, broken: { desk: 'status' }, next: { desk: 'status' },
}

export const labIcons = ICONS

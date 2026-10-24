// DMZ progression guide: the order to do things in, from the first deploy to
// the endgame.
// Facts live in Intel; the guide adds the order and the advice and links to
// the entries for detail. Step kinds give each objective an icon.

import { dmzIntel, intelSources } from './dmz-intel.mjs'
import { guideSources } from './dmz-guide-sources.mjs'
import { mapReports, mapReportSources } from './dmz-map-reports.mjs'
import { bossPlaybook } from './dmz-playbooks.mjs'
import { BARRACKS, recipePlaybook } from './dmz-recipe-spots.mjs'

const intel = id => dmzIntel.find(entry => entry.id === id)

// ---------------------------------------------------------------- Step icons

// 24×24 stroke paths, drawn for CodWiki. A step takes the kind of its opening
// verb; a few nouns (a bomb, a fight) win over a plain "Find", and "Find" or
// "Reach" alone means moving to the next place.
export const stepKinds = [
  { id: 'kill', label: 'Kill', lead: /^(kill|eliminate|assassinate|hunt|repeat)\b/i, noun: /\b(fight|boss)\b/i, icon: 'M12 3v4 M12 17v4 M3 12h4 M17 12h4 M17 12a5 5 0 1 1-10 0a5 5 0 1 1 10 0 M12 11v2' },
  { id: 'defend', label: 'Defend', lead: /^(defend|survive|hold)\b/i, icon: 'M12 3l8 3v6c0 5-3.5 8-8 9c-4.5-1-8-4-8-9V6z' },
  { id: 'bomb', label: 'Bomb', lead: /^(plant|craft|destroy|get the bomb|find and destroy|attach)\b/i, noun: /\b(plant|bomb parts|explosive|warhead)\b/i, icon: 'M11 21a7 7 0 1 0 0-14a7 7 0 0 0 0 14z M15.5 8.5l2-2 M18 3v2 M20 6h2 M19.5 4.5l1.5-1.5' },
  { id: 'code', label: 'Unlock', lead: /^(use code|unlock|find the keypad code|crack|breach|rewire)\b/i, icon: 'M6 11h12v10H6z M8.5 11V7.5a3.5 3.5 0 0 1 7 0V11 M12 15v2' },
  { id: 'hack', label: 'Hack', lead: /^(hack|download|decrypt|reprogram|upload)\b/i, icon: 'M4 5h16v10H4z M2 19h20 M9.5 8.5L7.5 10l2 1.5 M14.5 8.5l2 1.5-2 1.5' },
  { id: 'tower', label: 'Capture', lead: /^(capture|request|approach the target sam)\b/i, icon: 'M12 9v12 M8.5 21L12 9l3.5 12 M8 6a5.5 5.5 0 0 1 8 0 M5.5 3.5a9 9 0 0 1 13 0' },
  { id: 'drive', label: 'Drive', lead: /^(hijack|deliver|drive)\b/i, icon: 'M3 7h11v9H3z M14 10h4l3 3v3h-7 M7 19.5a2 2 0 1 0 0-4a2 2 0 0 0 0 4 M17 19.5a2 2 0 1 0 0-4a2 2 0 0 0 0 4' },
  { id: 'rescue', label: 'Rescue', lead: /^(rescue|escort|carry|reach the scientist|place the scientist)\b/i, icon: 'M12 9a3 3 0 1 0 0-6a3 3 0 0 0 0 6 M6 21v-4a6 6 0 0 1 12 0v4 M9 15l3 2 3-2' },
  { id: 'wait', label: 'Wait', lead: /^(wait|take cover)\b/i, icon: 'M12 21a9 9 0 1 0 0-18a9 9 0 1 0 0 18 M12 7v5l3 2' },
  { id: 'loot', label: 'Loot', lead: /^(loot|collect|pick up|take|secure|deposit)\b/i, icon: 'M4 8l8-4 8 4v8l-8 4-8-4z M4 8l8 4 8-4 M12 12v8' },
  { id: 'exfil', label: 'Exfil', lead: /^(extract|exfil)\b/i, icon: 'M12 21V9 M7 13l5-5 5 5 M5 3h14' },
  { id: 'find', label: 'Go', move: /^(find|locate|search|investigate|proceed|reach|approach|get to|go to|enter)\b/i, icon: 'M10.5 18a7.5 7.5 0 1 0 0-15a7.5 7.5 0 0 0 0 15z M16 16l5 5' },
]
const plainStep = { id: 'step', label: 'Step', icon: 'M12 16a4 4 0 1 0 0-8a4 4 0 0 0 0 8' }
export const stepKind = text => stepKinds.find(kind => kind.lead?.test(text)) || stepKinds.find(kind => kind.noun?.test(text)) || stepKinds.find(kind => kind.move?.test(text)) || plainStep

// An Intel entry's Steps detail, split into single objectives.
export function intelSteps(id) {
  const steps = intel(id)?.details?.find(([label]) => label === 'Steps')?.[1]
  return steps ? steps.split(/,\s+(?=[A-Z])/).map(text => text.trim()).filter(Boolean) : []
}

// ---------------------------------------------------------------- Content

export const GUIDE_CHECKED = '24 Oct 2026'
export const guideSource = id => intelSources[id] || guideSources[id] || mapReportSources[id]

// Sources by id: Intel's own list first, then shared/dmz-guide-sources.mjs,
// then the map report sources.
// Advice marked advice: true is CodWiki's reading of the sourced facts; its
// confidence label covers the facts it rests on.

// Every vest, cheapest first. Rarity follows Activision's level table where
// guides disagree (the 3-plate is Legendary in some guides).
export const guideVests = [
  { id: '1-plate', name: '1-Plate Armor Vest', plates: 1, rarity: 'Uncommon', tier: 'early', get: 'Printer recipe at DMZ level 2', intel: '1-plate-armor-vest-recipe' },
  { id: '2-plate', name: '2-Plate Armor Vest', plates: 2, rarity: 'Rare', tier: 'early', get: 'Printer at level 2, Orders page 1, Basic Armor Kits at levels 6 and 21', intel: '2-plate-armor-vest-recipe' },
  { id: '2-plate-gel', name: '2-Plate Ballistic Gel Vest', plates: 2, rarity: 'Epic', tier: 'mid', get: 'Recipe found in Hajin; Ballistic Gel Armor Kit at level 54', side: true },
  { id: '2-plate-helmet', name: '2-Plate Helmet Armor Vest', plates: 2, rarity: 'Epic', tier: 'mid', get: 'One at DMZ level 63; recipe found in Hajin', intel: '2-plate-helmet-armor-vest', side: true },
  { id: '3-plate', name: '3-Plate Armor Vest', plates: 3, rarity: 'Epic', tier: 'mid', get: 'One at DMZ level 37, the Vendor ($50,000), or the printer once Orders unlock the recipe', intel: '3-plate-armor-vest' },
  { id: '3-plate-gel', name: '3-Plate Ballistic Gel Vest', plates: 3, rarity: 'Ultra', tier: 'late', get: 'Recipe found in Hajin; Commander parts', side: true },
  { id: '3-plate-helmet', name: '3-Plate Helmet Armor Vest', plates: 3, rarity: 'Ultra', tier: 'late', get: 'Recipe found in Hajin; Nano-Structured Alloy from the tank', side: true },
  { id: 'tempered', name: 'Tempered Armor Vest', plates: 3, rarity: 'Ultra', tier: 'late', get: 'Recipe from The Doctor\'s Command Office (not guaranteed); Military Composites from Colossus, per guides', intel: 'tempered-armor-vest-recipe', tempered: true },
]
export const guideVestSources = ['callofduty-call-of-duty-modern-warfare-5', 'codcentral-mw4-dmz-3d-printer-recipes', 'codcentral-mw4-dmz-fob-guide', 'dmzcodex-dmz-armor-backpacks-guide', 'allthings-mw4-dmz-how-to-get']

// The three ways into Hajin. Meters are CodWiki's 1–3 reading of the sourced
// pay and risk; Free Roam's risk is whatever route you pick.
export const guideDeployments = [
  {
    id: 'story', name: 'Story Missions', intel: 'story-missions',
    icon: 'M6 3h9l4 4v14H6z M15 3v4h4 M9 12h7 M9 16h7',
    line: 'Set missions with a briefing, played the same way every time. The biggest XP jumps.',
    meters: { xp: 3, cash: 1, gear: 2, risk: 2 },
    pick: 'The three Tier 1 missions, once you have a 2-plate vest and a Medkit.',
    how: ['Deploy menu, then Story Missions', 'Pick a mission, or Random once you have finished some', 'Ready Up and deploy; you start near the mission'],
    note: 'Cards list $25,000, but guides saw $5,000 paid at extraction. About 12,500 XP each.',
    confidence: 'confirmed', sources: ['allthings-how-to-start-every-dmz', 'codcentral-mw4-dmz-operation-critical-extraction', 'dmztracker-story-missions-guide', 'callofduty-call-of-duty-modern-warfare'],
  },
  {
    id: 'ops', name: 'Dynamic Operations', intel: 'dynamic-operations',
    icon: 'M12 3v4 M12 17v4 M3 12h4 M17 12h4 M17 12a5 5 0 1 1-10 0a5 5 0 1 1 10 0 M12 11v2',
    line: 'A generated op with several steps. Steady cash and XP, and a Supply Drop for the squad.',
    meters: { xp: 2, cash: 3, gear: 2, risk: 2 },
    pick: 'Most early runs, and your very first deploy: Orders page 1 asks for it.',
    how: ['Deploy menu, then Dynamic Operations', 'Pick an infil; Ground is free', 'Follow the op on the left of the HUD, then start more from green Dynamic Ops phones'],
    note: 'Supply Drops get better with each op you finish in one deployment: Common, Uncommon, then Rare.',
    confidence: 'official', sources: ['callofduty-call-of-duty-modern-warfare', 'callofduty-call-of-duty-modern-warfare-2', 'codcentral-mw4-dmz-dynamic-ops', 'dmztracker-dynamic-ops-side-ops-guide'],
  },
  {
    id: 'roam', name: 'Free Roam', intel: 'deployment-options',
    icon: 'M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z M9 4v14 M15 6v14',
    line: 'No mission attached. You choose the route, the loot and when to leave.',
    meters: { xp: 1, cash: 1, gear: 3, risk: 2 },
    pick: 'Farming printer materials, and Orders that ask you to activate a Dynamic Ops phone yourself.',
    how: ['Deploy menu, then Free Roam', 'Pick an infil; Ground is free', 'For an op of your own, find a green phone icon on the Tac-Map, follow the beeping to the phone indoors and hold interact on it'],
    note: 'Side Ops pay $500 each at extraction. Ops you start from a phone pay like any other op.',
    confidence: 'official', sources: ['callofduty-call-of-duty-modern-warfare', 'allthings-mw4-dmz-how-to-complete-3', 'codcentral-mw4-dmz-ingredient-locations', 'allthings-modern-warfare-4-dmz-how', 'pcgamer-dynamic-op-phone-dmz'],
  },
]
export const guideMeters = [
  { id: 'xp', label: 'XP' }, { id: 'cash', label: 'Cash' }, { id: 'gear', label: 'Loot' }, { id: 'risk', label: 'Risk' },
]

// How each Dynamic Op suits an early-game squad, still in 2-plate vests.
// CodWiki's reading of the reported routes and fights in each op.
export const guideOpFit = [
  { id: 'dead-mans-cache', fit: 'good', why: 'Mostly travel and searching, with one HVT fight at the end. A Cheongun Village phone starts it for the Operation Rewards Order.' },
  { id: 'chemical-denial', fit: 'good', why: 'A scavenger hunt with few fights. Cancel it if it heads for the Chang-san bunker.' },
  { id: 'toxic-intercept', fit: 'good', why: 'One defend and a drive. Fine for a squad in 2-plates.' },
  { id: 'broken-resupply', fit: 'good', why: 'One defend and a compound visit.' },
  { id: 'ghost-shipment', fit: 'caution', why: 'Depends on the route: runs through the prison or The Citadel are too hot early.' },
  { id: 'signal-breaker', fit: 'caution', why: 'The best pay seen, but the trucks sat in a High-threat area.' },
  { id: 'viral-reckoning', fit: 'caution', why: 'Long, with a timed defend. Take the partial-credit exfil if it drags on.' },
  { id: 'special-delivery', fit: 'caution', why: 'The bomb defend is a real fight. Re-plate before you plant.' },
  { id: 'hunt-operator', fit: 'avoid', why: 'A full rival squad. A coin flip in 2-plates, and you lose the kit.' },
  { id: 'sky-heist', fit: 'avoid', why: 'A High-threat SAM site, and nobody has published the ending yet.' },
  { id: 'domino-protocol', fit: 'avoid', why: 'A long chain of HVTs that seems to end at a Lieutenant.' },
  { id: 'ignition-point', fit: 'unknown', why: 'Only the first step has been published.' },
]
export const guideOpFitSources = ['codcentral-mw4-dmz-dynamic-ops', 'dmztracker-dynamic-ops-side-ops-guide', 'dmzcodex-dmz-dynamic-ops-side-ops', 'allthings-call-of-duty-modern-warfare-8']
export const guideFitLabels = { good: 'Good early on', caution: 'Pick your route', avoid: 'Leave for later', unknown: 'Not enough known' }

// Icons for the signs of each stage, 24×24 stroke paths drawn for CodWiki.
export const guideSignIcons = {
  level: 'M12 3l8 4.5v9L12 21l-8-4.5v-9z M8.5 14L12 11.5l3.5 2.5',
  armor: 'M9 3L5 6.5V20c2 1.2 4.5 1.8 7 1.8s5-.6 7-1.8V6.5L15 3 M9 3l1.5 4h3L15 3 M9 11h6 M9 15h6',
  orders: 'M8 3h8v3H8z M6 4.5H5V21h14V4.5h-1 M8 11h8 M8 15h5',
  story: 'M6 3h9l4 4v14H6z M15 3v4h4 M9 12h7 M9 16h7',
  boss: 'M12 3v4 M12 17v4 M3 12h4 M17 12h4 M17 12a5 5 0 1 1-10 0a5 5 0 1 1 10 0 M12 11v2',
  prestige: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
}

// The way to the Tempered vest recipe lives in shared/dmz-recipe-spots.mjs;
// the mid and late steps both read its how and fallback.
const tempered = recipePlaybook('tempered-armor-vest-recipe')

// A loot row for a reported site. Its name and sources come from the map
// report, and the card shows the report's own where, squares and note, so the
// guide never retypes them. extra.sources add to the report's.
const reportById = new Map(mapReports.map(report => [report.id, report]))
function reportRow(id, extra = {}) {
  const report = reportById.get(id)
  return { kind: 'listed', report: id, where: report?.name || id, ...extra, sources: [...new Set([...(report?.sources || []), ...(extra.sources || [])])] }
}

// The three stages of the game, early to late; the code calls each a tier.
// signs tell you which stage you are in, armor being one of several, and
// short sums them up for the picker. Steps run in order; "ready" is the
// checklist for the next stage. videos are Watch it done links (VideoRef).
// loot cards say where the loot is, in no order of worth: rows use the
// sightings shape (shared/dmz-sightings.mjs) and point at a report, a place
// or a layer; how, fallback and note are the card's own short text, intel
// adds Intel drawer links, and sources back that text.
export const guideTiers = [
  {
    id: 'early', name: 'Early', armor: '1–2 plate', vest: '2-plate', levels: 'DMZ level 1 to about 36',
    short: 'New to DMZ, below level 37',
    signs: [['level', 'Below DMZ level 37'], ['armor', '1- and 2-plate vests'], ['orders', 'The first Orders pages'], ['story', 'Tier 1 Story Missions']],
    pitch: 'Learn the three deployments, clear the first Orders pages and print your own 2-plate vests.',
    kit: [
      { label: 'Armor', text: '1-plate and 2-plate vests from the printer' },
      { label: 'Backpack', text: 'Medium Backpack: your first Secure Slot' },
      { label: 'Guns', text: 'What you find, then one Gunsmith build from level 10' },
      { label: 'Operators', text: 'Two Active Duty slots; a third at level 15' },
    ],
    steps: [
      { id: 'orders-1', title: 'Clear Orders page 1', when: 'First session', text: 'Play Breaking New Ground, then the three page 1 tasks. The page pays $20,000, a Medkit and a 2-plate vest, and its First Op task opens Story Missions.', intel: ['breaking-new-ground', 'dmz-orders'], confidence: 'confirmed', sources: ['allthings-mw4-dmz-breaking-new-ground', 'codcentral-mw4-dmz-orders'] },
      { id: 'printer', title: 'Reach DMZ level 2', when: 'Level 2', text: 'The 3D Printer opens with six starter recipes, including both early vests and the Medium Backpack.', intel: ['3d-printer-station', 'recipes-unlocked-by-dmz-level'], confidence: 'official', sources: ['callofduty-call-of-duty-modern-warfare-5', 'codcentral-mw4-dmz-level-rewards'] },
      { id: 'chapter', title: 'Pick your first Orders chapter', when: 'After page 1', text: 'Human Intel, Underground or Counterfeit. Each is two pages at $20,000 and ends in a Tier 1 Story Mission. Underground gives the NVG recipe, which helps in Shopping Hacks.', intel: ['dmz-orders'], confidence: 'confirmed', sources: ['allthings-which-dmz-orders-chapter-to', 'codcentral-mw4-dmz-orders'] },
      { id: 'print-2-plate', title: 'Print a Medium Backpack and a 2-plate vest', when: 'Levels 2–11', text: 'Bring home 5 Rigid Synthetics and 5 Reactive Metals. Page 4 of the Orders only counts gear you printed yourself.', intel: ['medium-backpack-recipe', '2-plate-armor-vest-recipe'], confidence: 'confirmed', sources: ['codcentral-mw4-dmz-orders', 'codcentral-mw4-dmz-3d-printer-recipes'] },
      { id: 'bank-1', title: 'Buy Bank Upgrade I', when: 'Once $20,000 is spare', text: 'Banked cash stops at $100,000 until you do, and anything above the cap is lost. The upgrade raises it to $250,000.', intel: ['bank-cap'], how: ['At the FOB, open the 3D Printer and pick Upgrades, the first category on the left.', 'Choose Bank Upgrade I and hold to buy once every cost shows green.', 'Bank Upgrade II ($50,000) later raises the cap to $500,000 and reveals Bank Upgrade III.'], confidence: 'confirmed', sources: ['codcentral-mw4-dmz-fob-guide', 'allthings-how-to-increase-stash-space', 'callofduty-call-of-duty-modern-warfare'] },
      { id: 'tier-1', title: 'Clear the three Tier 1 Story Missions', when: 'As chapters open them', text: 'Critical Extraction first, then Silent Ledger and Shopping Hacks. Each pays about 12,500 XP, and the three together open Tier 2.', intel: ['operation-critical-extraction', 'operation-silent-ledger', 'operation-shopping-hacks'], how: ['Deploy, then Story Missions: pick the mission and Ready Up. Finished missions can be replayed.', 'Critical Extraction (hospital): sedate General Kang and push his bed to the roof. The hard part is holding the lobby for about a minute while the lifts come, so bring extra ammo.', 'Silent Ledger (casino): start the generator, open the gate from the Penthouse Security camera and drill the vault. Hold the hallway while the drill runs; other squads can see the chopper exfil.', 'Shopping Hacks (NuriGO Mall): you need four robot-dog Battery Cores. Loot each core as soon as the dog goes down, before it blows up and leaves a useless one. Bring NVGs.'], confidence: 'confirmed', sources: ['codcentral-mw4-dmz-operation-critical-extraction', 'codcentral-mw4-dmz-operation-silent-ledger', 'codcentral-mw4-dmz-operation-shopping-hacks', 'allthings-how-to-start-every-dmz', 'allthings-call-of-duty-modern-warfare-4', 'allthings-mw4-dmz-operation-silent-ledger', 'dmztracker-story-missions-guide'] },
      { id: 'gunsmith', title: 'Build one gun you trust', when: 'Level 10', text: 'The Gunsmith opens at level 10. Extract that gun\'s Weapon Manual too, so you can buy it again after a death.', intel: ['gunsmith', 'weapon-manuals'], how: ['Loot crates, police stations, compounds and downed enemy Operators for items named Manual followed by a gun.', 'Put the manual in a Secure Slot and extract: it unlocks that base gun for good and pays $5,000.', 'At the Gunsmith, choose Buy New Weapon and buy the base gun, then buy attachment slots and the attachments you have unlocked.', 'A gun you extract without its manual is a single copy: lose it and it is gone.'], confidence: 'official', sources: ['callofduty-call-of-duty-modern-warfare', 'codcentral-mw4-dmz-fob-guide', 'allthings-how-to-unlock-the-gunsmith'] },
      { id: 'support', title: 'Unlock the Armor Box and a third Operator', when: 'Levels 12–15', text: 'Ammo Box at 12, Armor Box at 14, a third Active Duty slot at 15. Armor Boxes are the only way to bring spare plates, and a third Operator keeps you playing while one is MIA.', intel: ['armor-box-recipe', 'active-duty-slots'], confidence: 'official', sources: ['callofduty-call-of-duty-modern-warfare-5', 'codcentral-mw4-dmz-3d-printer-recipes'] },
      { id: 'orders-7', title: 'Push on to Orders pages 7 and 10', when: 'Second and third chapters', text: 'Page 7 sends you into High threat and radiation for the first time. Page 10 pays a Large Backpack with two Secure Slots.', intel: ['dmz-orders'], confidence: 'reported', sources: ['codcentral-mw4-dmz-orders'] },
      { id: 'stockpile', title: 'Stockpile for your first 3-plate', when: 'Levels 25–36', text: 'Keep Reactive Metals and Binding Catalysts instead of selling them, keep $50,000 spare, and buy Bank Upgrade II near the $250,000 cap. Level 37 gives you one 3-plate.', intel: ['3-plate-armor-vest'], advice: true, confidence: 'confirmed', sources: ['codcentral-mw4-dmz-3d-printer-recipes', 'codcentral-mw4-dmz-fob-guide', 'callofduty-call-of-duty-modern-warfare-5'] },
    ],
    print: [
      { name: 'Medium Backpack', cost: '50 Synthetics · 5 Rigid Synthetics', unlock: 'Level 2', why: 'First Secure Slot', intel: 'medium-backpack-recipe' },
      { name: '2-Plate Armor Vest', cost: '50 Synthetics · 5 Reactive Metals', unlock: 'Level 2', why: 'The vest Tier 1 missions ask for', intel: '2-plate-armor-vest-recipe' },
      { name: 'Bandage', cost: '15 Synthetics · 15 Chemicals', unlock: 'Level 2', why: 'Cheap healing from basic resources', intel: 'bandage-recipe' },
      { name: '1-Plate Vest and Small Backpack', cost: '25 Synthetics · 25 Metals each', unlock: 'Level 2', why: 'Throwaway kit for risky runs', intel: '1-plate-armor-vest-recipe' },
      { name: 'Throwing Knife', cost: '25 Chemicals · 25 Metals', unlock: 'Level 7', why: 'Needed for an Order on page 4', intel: 'throwing-knife-recipe' },
      { name: 'Armor Box', cost: '30 Metals · 3 Reactive Metals', unlock: 'Level 14', why: 'Spare plates mid-fight', intel: 'armor-box-recipe' },
      { name: 'Gas Mask', cost: '30 Chemicals · 3 Rigid Synthetics', unlock: 'Level 26', why: 'Radiation zones and the reactor', intel: 'gas-mask-recipe' },
    ],
    printSources: ['codcentral-mw4-dmz-3d-printer-recipes', 'destructoid-3d-printer-recipes', 'codcentral-mw4-dmz-orders'],
    farm: [
      { name: 'Rigid Synthetics', rarity: 'Uncommon', where: 'Homes, luggage and civilian duffel bags', pins: ['imjin-farmland'], for: 'Medium Backpack, Gas Mask, Stash upgrades' },
      { name: 'Reactive Metals', rarity: 'Uncommon', where: 'Toolboxes in garages, workshops and building sites; The Doctor\'s backpack', pins: ['mirae-general-hospital'], for: '2-plate vests, Armor Boxes, the 3-plate' },
      { name: 'Binding Catalyst', rarity: 'Rare', where: 'Mirae General Hospital and medical tents', pins: ['mirae-general-hospital'], for: 'Medkits. Not printable, so never sell one' },
    ],
    farmSources: ['codcentral-mw4-dmz-ingredient-locations', 'dmzcodex-dmz-biomaterials-binding-catalyst-guide', 'allthings-mw4-dmz-how-to-beat'],
    places: { go: ['songdo-wharf', 'mirae-general-hospital', 'imjin-farmland', 'deadtown', 'cheongun-village'], avoid: ['chang-san-air-base', 'the-grid', '14th-political-prison'] },
    placesSources: ['codcentral-mw4-dmz-fob-guide', 'callofduty-call-of-duty-modern-warfare-2'],
    mistakes: [
      'Bringing your best gear before you know the map. Use the Free Loadout or a printed 1-plate.',
      'Carrying a key, recipe or rare material outside your Secure Slot.',
      'Selling Rigid Synthetics or Reactive Metals for quick cash. Every vest and backpack needs them.',
      'Trying Tier 2 Story Missions in a 2-plate. Their cards ask for a 3-plate.',
      'Taking Dynamic Operations for an Order that says to activate a phone. Use Free Roam and activate it yourself.',
    ],
    mistakeSources: ['primagames-dmz-tips-hints', 'codcentral-mw4-dmz-3d-printer-recipes', 'codcentral-mw4-dmz-operation-iron-citadel', 'allthings-mw4-dmz-how-to-complete-3'],
    ready: [
      'You can replace a 3-plate: its recipe and materials, or $50,000 spare when the Vendor stocks one.',
      'Critical Extraction, Silent Ledger and Shopping Hacks are done.',
      'Bank Upgrade I is built and about $100,000 is banked.',
      'You are close to DMZ level 37, which gives you a 3-plate.',
    ],
    readySources: ['codcentral-mw4-dmz-3d-printer-recipes', 'codcentral-mw4-dmz-fob-guide', 'callofduty-call-of-duty-modern-warfare-5'],
    videos: [
      { id: 'youtube-uhmkgffxbpu', why: 'A long beginner guide in chapters: the FOB, printer, Vendor, Secure Slots, Orders and which deployment to pick' },
      { id: 'youtube-5l48scoonva', why: 'A short overview of how the new DMZ works, for players with no background' },
      { id: 'youtube-ioiqlpz8wey', why: 'What to do first in the early game, then setup tips for keeping your first Operators alive' },
      { id: 'youtube-glydmktlw5i', why: 'Early-game tips in chapters: playing solo, stealth, the Medium Backpack, looting fast and Lieutenants' },
      { id: 'youtube-f4hvia-4-dc', at: '22:41', why: 'The loot locations chapter of a things-to-know-first video' },
      { id: 'youtube-n0aygf1v8do', why: 'Tips to stop wasting time, including taking back enemy-held UAV Towers' },
    ],
    loot: [
      {
        id: 'loot-safes', title: 'Safes without a key',
        rows: [
          reportRow('cheonwang-peak-array-safes'),
          { kind: 'listed', layer: 'compound', where: 'Any compound safe', search: 'Usually the main building or the top of the tower', sources: ['dmzcodex-dmz-safes-robbery-guide', 'mw4meta-safes-cash-farm', 'mw4meta-best-loot-spots', 'reddit-1xconmn', 'reddit-1xb1m4g'] },
        ],
        note: 'Gold Bars and Gold Skulls can turn up in ordinary safes, though never for sure. Keep any gold until you have checked your upgrades.',
        how: [
          'A safe is a small cube: hold interact on it to open it. There is no key, code or alarm. Safes with a handprint keypad are another kind.',
          'Gunfire brings other squads, and one may have emptied the safe before you.',
          'Before you sell a Gold Bar or Gold Skull, check the upgrade list at the 3D Printer. Skulls turn up in Stash upgrade costs, and one player says what each player is asked for can differ.',
          'Park spare gold on a second Operator so it is not sold by accident.',
        ],
        intel: ['compounds', 'valuables'],
        videos: [
          { id: 'youtube-ap6kpzmgau8', why: 'Safes and server rooms in one run, from a video on farming Gold Bars from safes' },
          { id: 'youtube-3vvrydq1yqq', why: 'A three-minute explainer on spotting a safe and opening it' },
          { id: 'youtube-9crz7eenjxs', why: 'A compound safe opened for the Robbery Order' },
        ],
        sources: ['mw4meta-best-loot-spots', 'yahoo-gamespot-hot-spots', 'reddit-1xdvyoy', 'reddit-1xcncgm', 'reddit-1xcplj1', 'dmztracker-valuables', 'dmztracker-items-gold-bar', 'dmzcodex-loot-keep-sell-craft', 'reddit-1xconmn', 'reddit-1xb1m4g'],
      },
      {
        id: 'loot-free-kit', title: 'Free kit',
        rows: [
          { kind: 'listed', layer: 'fire', where: 'Any fire station', note: 'Players find parachutes, gas masks, a bag and a 1-plate vest.', sources: ['reddit-1xbxnum', 'reddit-where-are-the-parachutes'] },
          { kind: 'listed', where: 'Small military camps', search: 'Unmarked tents and encampments with trucks and crates', note: 'Plate carriers, bags and parachutes have turned up.', sources: ['reddit-1xcq7w7', 'reddit-where-are-the-parachutes'] },
        ],
        how: [
          'Start at a fire station, then sweep the small camps near it.',
          'Open any weapons locker on your way: two players found purple 2-plate vests in them.',
        ],
        intel: ['fire-stations', 'plate-carriers'],
        noVideo: 'No free-kit video linked yet',
        sources: ['reddit-1xbvee8', 'reddit-1xbr015'],
      },
      {
        id: 'loot-train', title: 'The train',
        rows: [
          { kind: 'listed', where: 'The passenger train', search: 'Duffel bags, suitcases, jackets, first aid kits, lockers and two supply crates', sources: ['mw4meta-best-loot-spots', 'mw4meta-safes-cash-farm', 'yahoo-gamespot-hot-spots'] },
        ],
        how: [
          'You loot it while it moves. One run parachuted onto the roof to get on.',
          'Work through it car by car, small containers on and between the seats included. Duffel bags are slow to open.',
          'Do not skip the front car: its supply crate and a locker have given a gun and Ballistic Fabric.',
          'Ride it across the map and get off near your next stop; one run used it to get between compounds.',
        ],
        intel: ['train'],
        videos: [
          { id: 'youtube-adhcn7se7pw', why: 'Clearing compounds, then looting the train' },
          { id: 'youtube-f4hvia-4-dc', at: '34:47', why: 'The train chapter at the end of a things-to-know-first video' },
        ],
        sources: ['mw4meta-best-loot-spots', 'mw4meta-safes-cash-farm', 'dmztracker-vehicles-train', 'gamerant-weapon-manuals-location-get', 'reddit-1xbxnum', 'reddit-1xchsle'],
      },
      {
        id: 'loot-first-route', title: 'A first loot route',
        rows: [reportRow('nurigo-east-loot-route')],
        noVideo: 'No video of this route linked yet',
      },
    ],
  },
  {
    id: 'mid', name: 'Mid', armor: '3-plate', vest: '3-plate', levels: 'From about DMZ level 37',
    short: 'Level 37 and up, hunting Lieutenants',
    signs: [['level', 'DMZ level 37 and up'], ['armor', 'Your first 3-plate vests'], ['boss', 'Lieutenants on the Boss Board'], ['story', 'Tier 2 Story Missions']],
    pitch: 'Keep a steady supply of 3-plate vests, hunt Lieutenants from the Boss Board and stockpile what the printer needs.',
    kit: [
      { label: 'Armor', text: '3-plate vests: one free at level 37, then the Vendor or the printer' },
      { label: 'Backpack', text: 'Large Backpack (level 34) or a Small Secure Backpack' },
      { label: 'Guns', text: 'Lieutenant weapons, and Gunsmith builds with their manuals' },
      { label: 'Bank', text: 'Upgrades I and II: a $500,000 cap' },
    ],
    steps: [
      { id: 'vendor-cash', title: 'Keep $50,000 beside your rescue money', when: 'Start of mid game', text: 'The Vendor has sold a 3-plate for $50,000, and its stock changes daily. With the cash ready you can buy one the day it shows up.', intel: ['vendor'], advice: true, how: ['Check the Vendor every day: stock resets on the timer at the top, and each player sees different offers.', 'Better gear shows up as your DMZ level rises. More slots open at levels 18 and 32, and with Vendor Item Upgrade I from the printer.', 'Buy the 3-plate the day it appears; it may not come back for a while.'], confidence: 'reported', sources: ['codcentral-mw4-dmz-fob-guide', 'callofduty-call-of-duty-modern-warfare', 'codcentral-mw4-dmz-level-rewards'] },
      { id: 'level-37', title: 'Save the level 37 vest for a boss run', when: 'Level 37', text: 'It is one vest, not the recipe. Wear a printed 2-plate on Low-threat farming runs and keep the 3-plate for Lieutenants and High-threat places.', intel: ['3-plate-armor-vest'], advice: true, confidence: 'official', sources: ['callofduty-call-of-duty-modern-warfare-5', 'codcentral-mw4-dmz-3d-printer-recipes'] },
      { id: 'secure', title: 'Protect what you carry', when: 'Early mid game', text: 'A Small Secure Backpack has three Secure Slots (Iskra can drop one), and Stash Item Upgrade I adds 18 slots for your stockpile.', intel: ['secure-slots', 'stash-capacity'], how: ['Equip a backpack with Secure Slots in your Loadout before you deploy. The Basic Pack has none.', 'In the match, open the backpack: the Secure Slots sit under the main grid. Move a key, manual, recipe or rare part there as soon as you pick it up.', 'If you die, Secure Slot items come back with you. The rest of the backpack and your loadout stay in Hajin.'], confidence: 'confirmed', sources: ['codcentral-mw4-dmz-3d-printer-recipes', 'codcentral-mw4-dmz-boss-board', 'allthings-how-to-increase-stash-space', 'allthings-mw4-dmz-death-rules-what', 'callofduty-call-of-duty-modern-warfare', 'dmzcodex-dmz-armor-backpacks-guide'] },
      { id: 'cloth', title: 'Stockpile Ballistic Fabric and Nylon Cloth', when: 'Every run', text: 'A 3-plate print takes 2 Ballistic Fabric, 5 Nylon Cloth and 10 Reactive Metals. Neither cloth can be printed in the mid game, so keep every one.', intel: ['3-plate-armor-vest'], confidence: 'confirmed', sources: ['codcentral-mw4-dmz-3d-printer-recipes', 'codcentral-mw4-dmz-ingredient-locations'] },
      { id: 'mask-nvg', title: 'Get a Gas Mask and NVGs', when: 'Before the reactor and casino', text: 'The Gas Mask recipe comes at level 26 and opens the reactor. The NVG recipe comes from the Underground chapter and lights up the casino and NuriGO.', intel: ['gas-mask-recipe', 'night-vision-goggles-recipe'], confidence: 'confirmed', sources: ['codcentral-mw4-dmz-3d-printer-recipes', 'codcentral-mw4-dmz-ingredient-locations'] },
      { id: 'lieutenants', title: 'Hunt Lieutenants in order', when: 'Once the Boss Board opens', text: 'Each one guards materials you need, and each extracted Dog Tag Case pays $25,000. A Lieutenant Hunt tower marks the nearest one for free.', intel: ['lieutenants', 'boss-board', 'lieutenant-hunt-towers'], how: ['Free: climb a Lieutenant Hunt tower, a tall radio mast with a yellow ladder and a skull icon on the Tac-Map. Use the laptop at the top and the nearest active Lieutenant\'s area is marked.', 'Towers stay put from match to match; the Hajin map here marks five. A tower picks the nearest active Lieutenant, so you cannot choose who.', 'Paid: buy a Lieutenant\'s intel on the Boss Board for $25,000. It lasts one deployment.', 'Pick your exfil before you take the Dog Tag Case: it shows you to every squad until you extract.'], confidence: 'confirmed', sources: ['codcentral-mw4-dmz-boss-board', 'callofduty-call-of-duty-modern-warfare', 'dmzcodex-dmz-bosses-boss-board-guide', 'callofduty-call-of-duty-modern-warfare-2', 'allthings-mw4-dmz-how-to-complete', 'codmunity-lt-towers', 'allthings-what-the-boss-board-is'] },
      { id: 'tier-2', title: 'Clear the Tier 2 Story Missions', when: 'With a squad in 3-plates', text: 'Iron Citadel and Grid Assault are Critical threat. They unlock the LTV and Helicopter infils and Roze\'s armory key.', intel: ['operation-iron-citadel', 'operation-grid-assault'], how: ['Both open after the three Tier 1 missions. Go with a full squad in 3-plates, with a Medkit and an Ammo Box.', 'Iron Citadel (Chang-san): find and upgrade the access card, crack the six-digit armory code from three notes, then mine three jets. Expect Colossus in the armory corridor and a hard hold at the SAM site.', 'Grid Assault (The Grid): hack the drone laptop, collect two code halves, which move between runs, and broadcast from the roof antenna. The Deathstalker strafes the roof, so stay under cover.'], confidence: 'confirmed', sources: ['codcentral-mw4-dmz-operation-iron-citadel', 'allthings-operation-iron-citadel-story-mission', 'dmzcodex-dmz-keys-loot-rooms-guide', 'allthings-call-of-duty-modern-warfare-5', 'codcentral-mw4-dmz-operation-grid-assault'] },
      { id: 'uncommon-print', title: 'Build Bank Upgrade II, then Uncommon Ingredient Printing', when: 'Later in mid game', text: 'Uncommon printing costs $50,000, 20 Biomaterials, 10 High-Tenacity Fibers and 5 Comms Modules. After it, Reactive Metals and Rigid Synthetics print from basic resources.', intel: ['bank-cap', 'fob-upgrades'], how: ['Open the 3D Printer, then Upgrades.', 'Bank Upgrade II costs $50,000. Uncommon Ingredient Printing costs $50,000, 20 Biomaterials, 10 High-Tenacity Fibers and 5 Comms Modules.', 'Hold to upgrade once every cost shows green.'], confidence: 'confirmed', sources: ['codcentral-mw4-dmz-3d-printer-recipes', 'codcentral-mw4-dmz-fob-guide', 'allthings-how-to-increase-stash-space'] },
      { id: 'tempered-recipe', title: 'Take the Tempered vest recipe early', when: 'Any time', text: 'The Doctor\'s Command Office key opens a Lieutenant crate that has held the Tempered Armor Vest recipe. Extract it now and print the vest in the late game.', intel: ['the-doctor', 'the-doctors-command-office', 'tempered-armor-vest-recipe'], how: tempered.how, fallback: tempered.fallback, confidence: 'confirmed', sources: ['allthings-mw4-dmz-how-to-get', 'allthings-mw4-dmz-how-to-beat', 'allthings-modern-warfare-4-dmz-key', 'dmzcodex-dmz-keys-loot-rooms-guide', 'dmzcodex-recipes-tempered-armor-vest', 'dmzcodex-the-doctors-command-office', 'xboxplay-get-tempered-armor-vest', 'reddit-third-successful-extraction-somehow-got'] },
      { id: 'grid-lts', title: 'Finish with Jang-ui and Roze', when: 'End of mid game', text: 'The two hardest Lieutenants, in the Extreme and Critical parts of The Grid. Killing all ten completes the Boss Board\'s first challenge.', intel: ['jang-ui', 'roze'], confidence: 'confirmed', sources: ['allthings-call-of-duty-modern-warfare-13', 'allthings-call-of-duty-modern-warfare-12', 'codcentral-mw4-dmz-boss-board'] },
    ],
    // Lieutenants in the order a mid-game squad can take them: easiest ground first.
    hunt: [
      { intel: 'the-scavenger', pins: ['cheongun-village', 'deadtown'], why: 'Low ground. His cache drops Infantry Invasion Plans for Bank Upgrade III.' },
      { intel: 'the-doctor', pins: ['mirae-general-hospital'], why: 'Low threat. His Command Office key is the route to the Tempered recipe.' },
      { intel: 'iskra', pins: ['cheonwang-peak-array'], why: 'Medium threat, next to the Comms Module server rooms. Can drop a Small Secure Backpack.' },
      { intel: 'jin-tae', pins: ['fortress-heavenly-luck-casino'], why: 'The casino nightclub is a Nylon Cloth spot. Bring NVGs.' },
      { intel: 'the-warden', pins: ['14th-political-prison'], why: 'A squad fight in High and Critical ground. The Citadel wings hold Nylon Cloth.' },
      { intel: 'the-chemist', pins: ['haneul-nuclear-reactor'], why: 'Inside radiation: bring a Gas Mask. The reactor holds Printed Circuit Boards.' },
      { intel: 'bale', pins: ['fortress-re-education-center'], why: 'Take his Medium-threat spawn in Deadtown. Needs all three Orders chapters.' },
      { intel: 'gorani', pins: ['mujin-pass'], why: 'Rated Low but plays harder. Drops Infantry Invasion Plans and Nitro Compounds.' },
      { intel: 'jang-ui', pins: ['the-grid'], why: 'Extreme threat. Drops the Paektu, an Ultra assault rifle.' },
      { intel: 'roze', pins: ['dbn-headquarters'], why: 'Critical threat, on Deathstalker ground. Her shots can down you in one.' },
    ],
    huntSources: ['codcentral-mw4-dmz-boss-board', 'allthings-call-of-duty-modern-warfare-12', 'gamerant-call-of-duty-cod-modern-3', 'codcentral-mw4-dmz-ingredient-locations', 'dmzcodex-dmz-bosses-boss-board-guide'],
    print: [
      { name: 'Armor Box', cost: '30 Metals · 3 Reactive Metals', unlock: 'Level 14', why: 'Bring it with the 3-plate on boss runs', intel: 'armor-box-recipe' },
      { name: 'Gas Mask', cost: '30 Chemicals · 3 Rigid Synthetics', unlock: 'Level 26', why: 'The reactor and the Chemist', intel: 'gas-mask-recipe' },
      { name: 'Night Vision Goggles', cost: '50 Metals · 3 Printed Circuit Boards · 10 Control Units', unlock: 'Underground chapter', why: 'The dark casino and NuriGO', intel: 'night-vision-goggles-recipe' },
      { name: '3-Plate Armor Vest', cost: '2 Ballistic Fabric · 5 Nylon Cloth · 10 Reactive Metals', unlock: 'DMZ Orders', why: 'The core item of the mid game', intel: '3-plate-armor-vest' },
      { name: 'Self-Revive Kit', cost: 'See the recipe', unlock: 'Level 48', why: 'Get up without a squadmate', intel: 'self-revive-kit-recipe' },
    ],
    printSources: ['codcentral-mw4-dmz-3d-printer-recipes', 'callofduty-call-of-duty-modern-warfare-5'],
    farm: [
      { name: 'Ballistic Fabric', rarity: 'Epic', where: 'By the game\'s hint: the Songdo Wharf rooftop (Low) or the Chang-san armory and barracks. No find published yet', pins: ['songdo-wharf', 'chang-san-air-base'], for: '3-plate (2), Tempered vest (4)' },
      { name: 'Nylon Cloth', rarity: 'Rare', where: 'The Citadel wings, the Deadtown holding area, the casino nightclub', pins: ['fortress-the-citadel', 'deadtown', 'fortress-heavenly-luck-casino'], for: '3-plate (5)' },
      { name: 'High-Tenacity Fibers', rarity: 'Rare', where: 'One find: a blue duffel in a barber shop on the south river road. The game\'s hint is the Songdo Wharf rooftop', pins: ['songdo-wharf'], for: 'Uncommon Ingredient Printing (10)' },
      { name: 'Comms Module', rarity: 'Epic', where: 'Top-floor computers in Deadtown, and server rooms at Cheonwang Peak Array', pins: ['deadtown', 'cheonwang-peak-array'], for: 'Uncommon Ingredient Printing (5)' },
      { name: 'Biomaterials', rarity: 'Uncommon', where: 'Hospitals, clinics and medical bags', pins: ['mirae-general-hospital'], for: 'Uncommon Ingredient Printing (20)' },
    ],
    farmSources: ['codcentral-mw4-dmz-ingredient-locations', 'dmzcodex-dmz-crafting-material-locations-guide', 'codcentral-mw4-dmz-3d-printer-recipes', 'allthings-electronic-sensors-fibers', 'destructoid-comms-modules'],
    places: { go: ['songdo-wharf', 'cheonwang-peak-array', 'deadtown', 'fortress-heavenly-luck-casino', '14th-political-prison', 'haneul-nuclear-reactor'], avoid: ['the-grid'] },
    placesSources: ['codcentral-mw4-dmz-ingredient-locations', 'callofduty-call-of-duty-modern-warfare-2'],
    mistakes: [
      'Wearing your only 3-plate on a Low-threat loot run.',
      'Buying a 3-plate at the Vendor just before level 37, which gives you one.',
      'Selling Ballistic Fabric, Nylon Cloth, Binding Catalyst or Comms Modules. None can be printed yet.',
      'Picking up a Lieutenant\'s Dog Tag Case with no plan to leave. Carrying it shows you on every map.',
      'Going into the reactor without a Gas Mask, or the casino without NVGs.',
    ],
    mistakeSources: ['codcentral-mw4-dmz-3d-printer-recipes', 'callofduty-call-of-duty-modern-warfare', 'callofduty-call-of-duty-modern-warfare-5', 'allthings-call-of-duty-modern-warfare-12'],
    ready: [
      'Losing a 3-plate no longer hurts: you always hold one print\'s materials or $50,000 spare.',
      'Bank Upgrade II and Uncommon Ingredient Printing are built.',
      'All three Orders chapters are done and most of the ten Lieutenants are down.',
      'Your squad clears the casino, The Citadel and Chang-san in 3-plates without wiping.',
    ],
    readySources: ['codcentral-mw4-dmz-3d-printer-recipes', 'callofduty-call-of-duty-modern-warfare-5', 'callofduty-call-of-duty-modern-warfare'],
    loot: [
      {
        id: 'loot-manuals', title: 'Weapon Manual spots',
        rows: [
          reportRow('chang-san-barracks', { how: BARRACKS.how, fallback: BARRACKS.fallback }),
          { kind: 'listed', where: 'Duffel bags on the train', note: 'One manual came out of a duffel bag as the train passed Cheongun Outskirts.', sources: ['dmztracker-vehicles-train', 'gamerant-weapon-manuals-location-get'] },
        ],
        intel: ['weapon-manuals', 'operation-iron-citadel', 'train'],
        // The barracks how-to comes from the recipe spots, so its sources do too.
        sources: BARRACKS.sources,
        videos: [
          { id: 'youtube-heipr3lrytk', why: 'A three-minute solo route for Weapon Manuals from a fresh start, easy to follow on screen' },
          { id: 'youtube-bk7v9jthxws', why: 'Why extracting Weapon Manuals, at $5,000 each, builds cash quickly' },
        ],
      },
      {
        id: 'loot-casino', title: 'The casino vault',
        rows: [
          reportRow('casino-vault-run'),
          reportRow('heavenly-luck-casino-basement-vault', { kind: 'mission', mission: 'operation-silent-ledger', where: 'Silent Ledger cash bags', seen: 1, sources: ['dmztracker-valuables'] }),
        ],
      },
      {
        id: 'loot-reactor', title: 'The reactor, no key needed',
        rows: [reportRow('haneul-reactor-loot-route')],
      },
    ],
  },
  {
    id: 'late', name: 'Late', armor: 'Ultra', vest: 'tempered', levels: 'No level gate',
    short: 'Lieutenants down, Commanders next',
    signs: [['boss', 'Commanders to kill'], ['armor', 'Tempered and other Ultra vests'], ['story', 'Operation Fallen Ember'], ['prestige', 'Prestige and DMZ level 70']],
    pitch: 'Kill Commanders for the parts only they drop, print Ultra vests and backpacks, and work through the endgame.',
    kit: [
      { label: 'Armor', text: 'The Tempered vest and the other Ultra vests' },
      { label: 'Backpack', text: 'Ultra secure backpacks: Large Secure or Secure Scavenger' },
      { label: 'Guns', text: 'Ultra Lieutenant guns such as the Paektu and the Incarcerator' },
      { label: 'Bank', text: 'Upgrade III: a $1 million cap' },
    ],
    steps: [
      { id: 'tempered', title: 'Extract the Tempered vest recipe', when: 'First', text: 'Kill The Doctor, take his Command Office key, open the Lieutenant crate and extract the recipe in a Secure Slot. Not every kill drops the key.', intel: ['the-doctor', 'tempered-armor-vest-recipe'], how: tempered.how, fallback: tempered.fallback, confidence: 'confirmed', sources: ['allthings-mw4-dmz-how-to-get', 'dmztracker-tempered-armor-vest', 'dmzcodex-dmz-armor-backpacks-guide', 'allthings-mw4-dmz-how-to-beat', 'allthings-modern-warfare-4-dmz-key', 'dmzcodex-dmz-keys-loot-rooms-guide', 'dmzcodex-recipes-tempered-armor-vest', 'dmzcodex-the-doctors-command-office', 'xboxplay-get-tempered-armor-vest', 'reddit-third-successful-extraction-somehow-got'] },
      { id: 'colossus', title: 'Hunt Colossus for Military Composites', when: 'Squad in 3-plates', text: 'Guides name him as the source and players report nothing guaranteed. Two players say fire works; whether other explosives hurt him is disputed. Look first in the story missions, then Cheonwang Peak Array or The Citadel.', intel: ['colossus', 'commanders'], how: ['He is always in Iron Citadel, in the Chang-san bunker and armory, and in the Fallen Ember warhead fight.', 'In free roam, try Cheonwang Peak Array (Medium threat) before The Citadel (Critical). He shows on the Tac-Map once you are close.', 'Hold hard cover with height, such as stairs, a roof or a truck bed, and let him walk to you.', 'Peek in the pauses between his minigun bursts and aim for the head. Throw Thermite or Molotovs in the pauses too.', 'Wait for the gas from his canister to clear, search around the body, then exfil: drops only count once you extract.'], confidence: 'confirmed', sources: ['allthings-how-to-beat-the-colossus', 'dmzcodex-colossus', 'codcentral-mw4-dmz-boss-board', 'codcentral-mw4-dmz-ingredient-locations', 'codcentral-mw4-dmz-operation-iron-citadel', 'codcentral-mw4-dmz-operation-fallen-ember', 'yahoo-gamespot-hot-spots', 'gamesgg-boss-locations', 'gamespot-mw4-dmz-tips', 'callofduty-call-of-duty-modern-warfare', 'reddit-1xdvyoy', 'reddit-ai-make-no-footstep-sounds', 'reddit-1xclnhe'] },
      { id: 'fallen-ember', title: 'Clear Operation Fallen Ember', when: 'After Tier 2', text: 'Extreme threat at the reactor. Wear the hazmat suits and carry Radiation Blockers. It pays the Cargo Plane infil and a key to the Reactor DRC Locker, said to hold one Ultra item.', intel: ['operation-fallen-ember', 'reactor-drc-locker'], how: ['It opens after Iron Citadel and Grid Assault. Bring 3-plates, a Medkit, Gas Masks, Radiation Blockers and spare plates.', 'Hazmat suits hang in Fire Stations and around the reactor, one in the Reactor 01 control room. Get one per player; a Radiation Blocker lasts about a minute.', 'Release the Reactor 01 lockdown, then fetch three fuel rods: the console shows a grid code, you dive to the matching container in the pool and confirm at the console. One player reads codes while another dives.', 'Carry the rods to the Reactor 02 decontamination station and defend the room.', 'At the warhead, plate up and fight the waves, then Colossus. In a reported run he dropped the boathouse key.', 'Take the patrol boat from the boathouse to the chopper, one player driving and one on the gun. Then exfil as normal to keep your loot.'], confidence: 'confirmed', sources: ['codcentral-mw4-dmz-operation-fallen-ember', 'allthings-call-of-duty-modern-warfare-7', 'gamerant-mw4-dmz-reactor-drc-locker', 'dmzcodex-operation-fallen-ember', 'dmzcodex-dmz-radiation-gas-mask-guide'] },
      { id: 'epic-print', title: 'Build Epic Ingredient Printing', when: 'Once you hold the parts', text: '$100,000, 10 Binding Catalysts, 10 Printed Circuit Boards and 5 Military Composites. After it, Ballistic Fabric and the other Epic parts print from basic resources.', intel: ['fob-upgrades'], how: ['Open the 3D Printer, then Upgrades, and pick Epic Ingredient Printing.', 'It needs $100,000, 10 Binding Catalysts, 10 Printed Circuit Boards and 5 Military Composites from Colossus.'], confidence: 'reported', sources: ['codcentral-mw4-dmz-3d-printer-recipes', 'codcentral-mw4-dmz-ingredient-locations', 'allthings-how-to-increase-stash-space', 'codcentral-mw4-dmz-fob-guide'] },
      { id: 'commanders', title: 'Take down the Deathstalker and the tank', when: 'For Ultra backpacks', text: 'The Deathstalker drops Prototype RF Modules for the Large Secure Backpack: capture a SAM site and let it shoot; it may flare several missiles before one hits. Hit the tank in the rear, not the front. Guides name Nano-Structured Alloy, for the Ultra Helmet vest, as its drop; no player has named it yet.', intel: ['deathstalker', 'main-nk-battle-tank', 'sam-sites'], how: ['Deathstalker: capture a SAM site near The Grid or NuriGO Mall first and stay by it. It may flare several missiles before one hits.', 'Hide from its gun runs under cover and shoot the cockpit between runs.', 'Tank: bring launchers for several players and an Ammo Box, and leave your vehicle before it sees you.', 'Use buildings to block its main gun while one player draws its fire, and put your rockets into its rear, not the front.', 'Search the wrecks, then exfil to keep the parts. Nothing is guaranteed.'], confidence: 'reported', sources: ['dmzcodex-deathstalker', 'gamerant-call-of-duty-cod-modern-3', 'codcentral-mw4-dmz-boss-board', 'callofduty-call-of-duty-modern-warfare-2', 'allthings-call-of-duty-modern-warfare-5', 'reddit-tips-killing-bosses-as-solo', 'dmzcodex-tank', 'mw4map-bosses', 'reddit-1xd5fv9', 'reddit-1xdvyoy', 'codcentral-mw4-dmz-ingredient-locations', 'destructoid-3d-printer-recipes'] },
      { id: 'print-ultra', title: 'Print your Ultra vest', when: 'When the parts are in', text: 'The Tempered vest takes 2 Military Composites, 4 Ballistic Fabric and 10 Rigid Synthetics. Keep the materials for a second one before you wear the first.', intel: ['tempered-armor-vest-recipe'], advice: true, confidence: 'confirmed', sources: ['codcentral-mw4-dmz-3d-printer-recipes', 'allthings-mw4-dmz-how-to-get'] },
      { id: 'bank-3', title: 'Raise the Bank to $1 million', when: 'Before Prestige', text: 'Bank Upgrade III costs $100,000 and 5 Infantry Invasion Plans, which Gorani and the Scavenger drop. Prestige costs up to $500,000.', intel: ['bank-cap'], how: ['Open the 3D Printer, then Upgrades. Bank Upgrade III appears once Bank Upgrade II is built.', 'Hold to upgrade once you have the cash and all 5 Infantry Invasion Plans.'], confidence: 'reported', sources: ['codcentral-mw4-dmz-fob-guide', 'callofduty-call-of-duty-modern-warfare', 'allthings-how-to-increase-stash-space'] },
      { id: 'prestige', title: 'Prestige your Operators', when: 'At 18 Trait Points', text: 'At Onyx III, trade cash, two guns and gear for a random permanent Prestige Trait, up to three. Empty the backpack first: Prestige takes what is equipped.', intel: ['operator-prestige', 'permanent-prestige-traits'], how: ['Get one Operator to Onyx III, 18 Trait Points earned. The Operator must not be MIA.', 'Equip what the first Prestige asks for: two Rare guns with three attachment slots, a Rare vest, a Rare backpack and four Rare printer ingredients, plus $200,000 in the Bank.', 'Move anything you want to keep off that Operator first.', 'Pick Prestige at the Operators station. Traits reset and a random Permanent Prestige Trait is added.', 'Later Prestiges ask for Epic gear and $300,000, then Legendary gear and $500,000.'], confidence: 'official', sources: ['callofduty-call-of-duty-modern-warfare', 'gamerant-cod-mw4-dmz-prestige-unlocks', 'codcentral-mw4-dmz-fob-guide'] },
      { id: 'endgame', title: 'Finish the Boss Board and reach level 70', when: 'Endgame', text: 'Extract every Lieutenant and Commander tag. Level 70 adds 18 Stash slots, double bounty payouts and a Legendary Advanced SERE Kit.', intel: ['boss-board', 'level-unlocks-1-to-70', 'king-slayer'], how: ['Lieutenant challenges: kill all ten once, then extract each one\'s tag twice and five times.', 'A Commander counts once you kill it and extract.'], confidence: 'official', sources: ['callofduty-call-of-duty-modern-warfare-5', 'codcentral-mw4-dmz-boss-board', 'allthings-what-the-boss-board-is'] },
    ],
    // Commander pins come from their playbooks in shared/dmz-playbooks.mjs.
    hunt: [
      { intel: 'colossus', pins: bossPlaybook('colossus').pins, why: 'Military Composites, per guides: the Tempered vest and Epic Ingredient Printing.' },
      { intel: 'deathstalker', pins: bossPlaybook('deathstalker').pins, why: 'Prototype RF Modules: the Large Secure Backpack.' },
      { intel: 'main-nk-battle-tank', pins: bossPlaybook('main-nk-battle-tank').pins, why: 'Nano-Structured Alloy, per guides: the Ultra 3-plate Helmet vest.' },
    ],
    huntSources: ['allthings-how-to-beat-the-colossus', 'dmzcodex-colossus', 'dmzcodex-deathstalker', 'dmzcodex-tank', 'codcentral-mw4-dmz-boss-board', 'codcentral-mw4-dmz-ingredient-locations'],
    print: [
      { name: 'Tempered Armor Vest', cost: '2 Military Composites · 4 Ballistic Fabric · 10 Rigid Synthetics', unlock: 'Found recipe', why: 'Ultra plates', intel: 'tempered-armor-vest-recipe' },
      { name: 'Large Secure Backpack', cost: '2 Prototype RF Modules · 4 Alloyed Plating · 10 Rigid Synthetics', unlock: 'Found recipe', why: 'More Secure Slots' },
      { name: '3-Plate Helmet Armor Vest', cost: '2 Nano-Structured Alloy · 4 Alloyed Plating · 10 Reactive Metals', unlock: 'Found recipe', why: 'Three plates and a helmet' },
    ],
    printSources: ['codcentral-mw4-dmz-3d-printer-recipes', 'dmztracker-crafting'],
    farm: [
      { name: 'Military Composites', rarity: 'Legendary', where: 'Colossus, per guides; not yet confirmed by players', pins: bossPlaybook('colossus').pins, for: 'Tempered vest (2), Epic Ingredient Printing (5)' },
      { name: 'Prototype RF Module', rarity: 'Unknown', where: 'The Deathstalker only', pins: bossPlaybook('deathstalker').pins, for: 'Large Secure Backpack (2)' },
      { name: 'Nano-Structured Alloy', rarity: 'Unknown', where: 'The tank, per guides', pins: bossPlaybook('main-nk-battle-tank').pins, for: '3-plate Helmet vest (2)' },
      { name: 'Ballistic Fabric', rarity: 'Epic', where: 'Chang-san armory and barracks, or print it after Epic Ingredient Printing', pins: ['chang-san-air-base'], for: 'Tempered vest (4)' },
    ],
    farmSources: ['codcentral-mw4-dmz-ingredient-locations', 'codcentral-mw4-dmz-3d-printer-recipes', 'dmzcodex-colossus', 'dmzcodex-tank', 'reddit-1xclnhe'],
    places: { go: ['chang-san-air-base', 'the-grid', 'haneul-nuclear-reactor', '14th-political-prison'], avoid: [] },
    placesSources: ['callofduty-call-of-duty-modern-warfare-2', 'codcentral-mw4-dmz-operation-iron-citadel'],
    mistakes: [
      'Wearing Ultra gear you cannot rebuild. Only Secure Slot items survive a failed exfil.',
      'Killing a Commander and dying before exfil. The parts only count once you extract.',
      'Shooting the tank from the front: the rear is its weak spot.',
      'Leaving gear equipped when you Prestige. Everything in the backpack and loadout is used up.',
    ],
    mistakeSources: ['callofduty-call-of-duty-modern-warfare', 'reddit-1xd5fv9', 'mw4map-bosses'],
    ready: [],
    readySources: [],
    loot: [
      {
        id: 'loot-bunker', title: 'The Supreme Leader\'s Bunker',
        rows: [reportRow('supreme-leaders-bunker')],
        how: [
          'The access card is reported as an Operation Iron Citadel reward. Keep it in a Secure Slot; one guide says it opens the door once.',
          'Inside, check the chest to the left of the bedroom, which one guide says always holds a Legendary weapon, then the lockers and the weapon room.',
        ],
        intel: ['operation-iron-citadel'],
        sources: ['gamerant-supreme-leader-bunker-location', 'mw4meta-best-loot-spots'],
      },
      {
        id: 'loot-drc', title: 'The DRC lockers',
        rows: [reportRow('reactor-drc-locker'), reportRow('shopping-drc-locker-drc-labs-under-nurigo'), reportRow('air-base-drc-weapons-locker')],
        note: 'Each locker takes its own key. In game all three show as Elite Weapons Lockers.',
        noVideo: 'No DRC locker video linked yet',
        sources: ['dmzcodex-drc-lockers', 'dmzcodex-air-base-drc-locker', 'dmzcodex-shopping-drc-locker-guide', 'mw4meta-best-loot-spots'],
      },
      {
        id: 'loot-irradiated', title: 'Irradiated Containers',
        rows: [reportRow('reactor-02-decontamination-machine')],
        note: 'Bring Radiation Gear and a Gas Mask.',
        noVideo: 'No decontamination video linked yet',
      },
      {
        id: 'loot-silos', title: 'Missile silo bunkers',
        rows: [reportRow('silo-bunkers-chang-san'), reportRow('silo-bunkers-prison')],
        noVideo: 'No silo bunker video linked yet',
      },
    ],
  },
]
export const guideTier = id => guideTiers.find(tier => tier.id === id)
// Everything a stage's loot cards cite: their rows, then the cards' own text.
export const guideLootSources = tier => [...new Set((tier.loot || []).flatMap(card => [...card.rows.flatMap(row => row.sources), ...(card.sources || [])]))]
export const guideTierSources = tier => [...new Set([
  ...tier.steps.flatMap(step => step.sources), ...tier.printSources, ...tier.farmSources, ...tier.placesSources,
  ...tier.mistakeSources, ...tier.readySources, ...(tier.huntSources || []), ...guideLootSources(tier),
])]
// A loot card's Watch it done links: its own first, then any its reports
// carry, each video once.
export function guideLootVideos(card) {
  const refs = [...(card.videos || []), ...card.rows.flatMap(row => (row.report && reportById.get(row.report)?.videos) || [])]
  return refs.filter((ref, index) => refs.findIndex(other => other.id === ref.id) === index)
}

// ---------------------------------------------------------------- Progress

// Ticked steps stay in this browser, like the trackers. Keys are tier:step.
// tier is the last stage picked, so the guide reopens on it.
export const DMZ_GUIDE_KEY = 'codwiki-dmz-guide-v1'
const stepKeys = new Set(guideTiers.flatMap(tier => tier.steps.map(step => `${tier.id}:${step.id}`)))
export function normalizeGuideProgress(value) {
  const done = Array.isArray(value?.done) ? [...new Set(value.done.filter(key => stepKeys.has(key)))] : []
  const tier = guideTier(value?.tier) ? value.tier : ''
  return { done, tier }
}
export function readGuideProgress(text) {
  try { return normalizeGuideProgress(JSON.parse(text || '{}')) } catch { return normalizeGuideProgress({}) }
}

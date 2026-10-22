// Hajin Tac-Map: the places, services and reported sites behind /dmz/hajin.
// Marker names and positions come from Activision's interactive Hajin Tac Map
// (checked 22 Oct 2026), which places markers on a 4096-unit square. The art is the
// official Tactical Map from DMZ Deep Dive Part 1, cropped to the map. toArt maps
// official units onto it; it was fitted on the seven fortress icons drawn in the art
// and lands within about 10 px of each.

import { dmzIntel, intelSources } from './dmz-intel.mjs'
import { mapReports, mapReportSources } from './dmz-map-reports.mjs'

export const HAJIN_MAP_CHECKED = '22 Oct 2026'

export const hajinMap = {
  image: '/maps/mw4-hajin/tac-map.webp', width: 1166, height: 1080,
  toArt: { scale: 0.40777, x: -233.05, y: -306.75 },
  // Ten lettered columns centred on the official square and nine numbered rows,
  // in official units. Fitted to the official example (D7 is Imjin Farmland) and to
  // squares read in game (COD Central screenshots, key cards). Close to a line, a
  // square can read one off.
  grid: { left: 668, top: 976, cell: 276, columns: 'ABCDEFGHIJ', rows: 9 },
  sources: [
    { label: 'Hajin Tac Map (Activision, interactive map)', url: 'https://www.callofduty.com/guides/modernwarfare4/dmz-maps/hajin', note: 'Marker names and positions' },
    { label: 'DMZ Deep Dive, Part 1: Tour of Duty (Activision)', url: 'https://www.callofduty.com/blog/2026/10/call-of-duty-modern-warfare-4-dmz-deep-dive-hajin', note: 'Tactical Map art, threat ratings, place and building descriptions' },
  ],
}

export const threatLevels = ['Low', 'Medium', 'High', 'Critical', 'Extreme']

// desc paraphrases the Deep Dive's notes on each marker type.
export const hajinLayers = [
  { id: 'poi', group: 'Places', label: 'Major locations', one: 'Major location', desc: 'One of Hajin\'s 13 points of interest. The Deep Dive rates each part from Low to Extreme threat.', on: true },
  { id: 'fortress', group: 'Places', label: 'Fortresses', one: 'Fortress', desc: 'The hardest-held building inside a major location, marked with its own icon on the official map.', on: true },
  { id: 'area', group: 'Places', label: 'Named areas', one: 'Named area', desc: 'A smaller place named on the Tac-Map.', on: true },
  { id: 'compound', group: 'Places', label: 'Compounds', one: 'Compound', desc: 'A fortified military position with better loot and intel. Expect heavy resistance and armored vehicles such as the LTV.', on: true },
  { id: 'police', group: 'Services', label: 'Police stations', one: 'Police station', desc: 'Blue buildings with several rooms to clear and sometimes roof access. Military gear and a locked armory.', on: true },
  { id: 'clinic', group: 'Services', label: 'Clinics', one: 'Clinic', desc: 'Green-fronted buildings with medical loot. Squads sometimes wait here for injured players.', on: true },
  { id: 'fire', group: 'Services', label: 'Fire stations', one: 'Fire station', desc: 'Red buildings in built-up areas, usually guarded. Look for radiation gear and parachutes.', on: true },
  { id: 'gas', group: 'Services', label: 'Gas stations', one: 'Gas station', desc: 'Repairs and refuels ground vehicles and helicopters, and refills carried Gas Cans.', on: false },
  { id: 'marine-gas', group: 'Services', label: 'Marine gas', one: 'Marine gas station', desc: 'A small jetty with two pumps. Repairs and refuels boats first of all, and refills Gas Cans.', on: false },
  { id: 'ammo', group: 'Services', label: 'Ammo and armor caches', one: 'Ammo and armor cache', desc: 'Refills ammo and hands out armor plates, then cools down for a while. Often inside compounds.', on: false },
  { id: 'uav', group: 'Services', label: 'UAV towers', one: 'UAV tower', desc: 'A guarded comms tower. Activating it completes a Side Op, pays DMZ Cash and pings nearby operators and enemies.', on: true },
  { id: 'lt-tower', group: 'Services', label: 'Lieutenant towers', one: 'Lieutenant tower', desc: 'Climb it and use the laptop at the top to locate a nearby Lieutenant. This also completes a Side Op.', on: true },
  { id: 'key-room', group: 'Reported', label: 'Key rooms', one: 'Key room', desc: 'A locked room that guides tie to a key. The in-game key card names its grid square.', on: true },
  { id: 'boss', group: 'Reported', label: 'Bosses', one: 'Boss', desc: 'Where guides have met a Lieutenant or Commander. Commanders roam, and some Lieutenants move between matches.', on: true },
  { id: 'exfil', group: 'Reported', label: 'Exfil sites', one: 'Exfil site', desc: 'Exfils switch on from a pool each match and show green smoke. Call the helicopter, then hold the site until it lands.', on: true },
  { id: 'sam', group: 'Reported', label: 'SAM sites', one: 'SAM site', desc: 'Hack the control computer and defend it. Once captured, it shoots down enemy aircraft, Deathstalkers included.', on: true },
  { id: 'mission-exit', group: 'Reported', label: 'Story Mission exits', one: 'Story Mission exit', desc: 'Where a Story Mission ends its run. Not a regular exfil.', on: false },
  { id: 'bounty', group: 'Reported', label: 'Bounty stations', one: 'Bounty station', desc: 'A laptop for reviewing bounties on other operators or paying off your own.', on: false },
  { id: 'station', group: 'Reported', label: 'Train stations', one: 'Station', desc: 'A train, tram or monorail stop.', on: false },
  { id: 'landmark', group: 'Reported', label: 'Landmarks', one: 'Landmark', desc: 'A building or spot that guides and missions refer to.', on: false },
]
export const hajinLayer = id => hajinLayers.find(layer => layer.id === id)

// [name, x, y] for places and [x, y] for services, in official units.
const OFFICIAL = {
  poi: [['14th Political Prison', 1248, 1622], ['Chang-san Air Base', 1024, 2316], ['Deadtown', 1240, 2727], ['Imjin Farmland', 1595, 2799], ['Cheongun Village', 2106, 2015], ['Haneul Nuclear Reactor', 2878, 1921], ['Mirae General Hospital', 2280, 2184], ['NuriGO Mall', 2636, 2380], ['Cheonwang Peak Array', 2039, 2554], ['The Grid', 2473, 2555], ['Songdo Wharf', 2868, 2691], ['Wolves Stadium', 2352, 2779], ['Hajin River Heights', 2539, 2932]],
  area: [['Jayon Warehouses', 1048, 1171], ['Russian Border Crossing (West)', 1321, 1242], ['Russian Border Crossing', 1945, 1806], ['Russian Border Crossing (East)', 2584, 1909], ['Hanrim Village', 1424, 1386], ['Revolution Dam', 1667, 1468], ['Tong-il Village', 1696, 1779], ['Pyonghwa Village', 1515, 2063], ['Namjin Riverside', 1805, 3199], ['South Island', 2684, 3075], ['Cheongun Outskirts', 1926, 1909], ['Imjin Suburb', 1728, 2383], ['Mujin Pass', 2024, 2348], ['Daesong Ridge', 2019, 2722], ['Oamsik Turtle Islands', 3004, 2302], ['NuriGO West', 2476, 2373], ['Shoreline Station', 2888, 2390], ['NuriGO East', 2752, 2441], ['DBN Headquarters', 2546, 2489], ['Hanex Bank', 2578, 2547], ['Construction Zone', 2731, 2654], ['Songdo Pier', 3093, 2753]],
  compound: [['Compound Foxtrot', 1107, 1999], ['Compound Alpha', 1911, 2865], ['Compound Bravo', 2120, 3022], ['Compound Charlie', 1679, 2106], ['Compound Delta', 2786, 2174], ['Compound Echo', 2544, 2855]],
  fortress: [['The Citadel', 1200, 1671], ['Heavenly Luck Casino', 2221, 1924], ['Mirae General Hospital', 2285, 2253], ['Admin Complex No. 2', 1044, 2321], ['Re-Education Center', 1159, 2699], ['Rice Mill', 1680, 2943], ['NuriGO Mall', 2654, 2412]],
  gas: [[1568, 1479], [1577, 1953], [1415, 2135], [1226, 2539], [1061, 2786], [1645, 3099], [1937, 3246], [1960, 2028], [2413, 1988], [2628, 2094], [1730, 2403], [2182, 2442], [2451, 2366], [2721, 2319], [2076, 2827], [2309, 2874], [2715, 2710], [2968, 2568]],
  'marine-gas': [[1348, 1304], [2229, 1779], [3079, 1994], [3104, 2701], [2423, 3060], [2489, 3306]],
  fire: [[1303, 1350], [1399, 2097], [1295, 2466], [2029, 2035], [2741, 2449], [1602, 3090]],
  police: [[1643, 1523], [1426, 2058], [2086, 1916], [2677, 2322], [2444, 2806]],
  clinic: [[1650, 1758], [1480, 1995], [1075, 2258], [2087, 2039], [1766, 2172], [1861, 2681], [2258, 2792]],
  ammo: [[1208, 1708], [1095, 2000], [1111, 2220], [970, 2404], [1181, 2701], [1696, 2092], [1747, 2266], [2094, 1974], [2160, 1936], [2201, 1923], [2214, 2046], [2237, 2228], [2948, 1849], [2851, 1887], [2799, 2162], [2652, 2365], [2665, 2546], [2540, 2608], [2454, 2667], [2707, 2757], [2952, 2720], [2364, 2824], [2567, 2990], [1619, 2651], [1931, 2841], [2133, 3006], [1527, 2914], [1707, 2923]],
  uav: [[1151, 1672], [968, 2194], [1217, 2609], [1647, 2623], [1673, 3039], [2038, 1943], [2372, 1940], [2701, 1931], [2337, 2274], [2686, 2310], [2030, 2547], [2307, 2884], [2644, 2928], [2919, 2726]],
  'lt-tower': [[1705, 1685], [1117, 2834], [2548, 2029], [2258, 2677], [2782, 2921]],
}

// Threat by part, from the Deep Dive's list for each point of interest.
const POI_PARTS = {
  '14th Political Prison': [['Prison', 'High'], ['The Fortress Prison Yard', 'High'], ['The Citadel', 'Critical']],
  'Chang-san Air Base': [['Air Base Exterior', 'Critical'], ['Air Base Bunker', 'Extreme']],
  'Deadtown': [['Deadtown Exterior', 'Low'], ['Re-Education Center', 'Medium']],
  'Imjin Farmland': [['Farmland Exterior', 'Low'], ['Jeong Loading Dock', 'Low'], ['Rice Mill', 'Medium']],
  'Cheongun Village': [['Cheongun Village', 'Low'], ['Cheongun Outskirts', 'Low'], ['Russian Border Crossing', 'Low'], ['Heavenly Luck Casino', 'High']],
  'Mirae General Hospital': [['Mirae General Hospital', 'Low']],
  'Cheonwang Peak Array': [['Cheonwang Peak Array', 'Medium']],
  'Haneul Nuclear Reactor': [['Reactor', 'High'], ['South Korean Border Zone', 'Medium']],
  'NuriGO Mall': [['NuriGO East', 'Medium'], ['NuriGO West', 'High']],
  'The Grid': [['The Grid', 'Critical'], ['Nenshin Tech Complex', 'Extreme'], ['DBN Headquarters', 'Critical'], ['Hanex Bank', 'Critical'], ['Minsok Art School', 'Critical'], ['Construction Zone', 'Critical']],
  'Songdo Wharf': [['Songdo Wharf', 'Low'], ['Oamsik Turtle Islands', 'Low'], ['Shoreline Station', 'Low']],
  'Wolves Stadium': [['Wolves Stadium', 'Medium'], ['Theatre', 'Medium']],
  'Hajin River Heights': [['Hajin River Heights', 'Medium'], ['South Island', 'Medium'], ['Jinseo Park Towers', 'Medium']],
}
// The fortress or area each named place belongs to, when it is part of a major location.
const PARENT = {
  'The Citadel': '14th Political Prison', 'Heavenly Luck Casino': 'Cheongun Village', 'Admin Complex No. 2': 'Chang-san Air Base',
  'Re-Education Center': 'Deadtown', 'Rice Mill': 'Imjin Farmland', 'Cheongun Outskirts': 'Cheongun Village', 'Russian Border Crossing': 'Cheongun Village',
  'NuriGO East': 'NuriGO Mall', 'NuriGO West': 'NuriGO Mall', 'DBN Headquarters': 'The Grid', 'Hanex Bank': 'The Grid', 'Construction Zone': 'The Grid',
  'Oamsik Turtle Islands': 'Songdo Wharf', 'Shoreline Station': 'Songdo Wharf', 'Songdo Pier': 'Songdo Wharf', 'South Island': 'Hajin River Heights',
}
// The Deep Dive's notes on the smaller places, paraphrased.
const AREA_DESC = {
  'Tong-il Village': 'A farming village on the Hajin River\'s north delta, with a large statue of a former leader.',
  'Revolution Dam': 'An intact dam with a strong military police presence. Tong-il Village lies just to the south-east.',
  'Pyonghwa Village': 'Houses and fields on flat ground west of the river. A half-wrecked pontoon bridge gives vehicles a quick crossing.',
  'Imjin Suburb': 'A small hamlet of farm workers\' homes by the river, at the foot of a wooded hill near the railway.',
  'Mujin Pass': 'Farmland in a hollow on a main road between two forests, with the hospital to the north and the Array to the south.',
  'Daesong Ridge': 'A rural settlement on a cratered road lined with burned-out APCs, north-east of Imjin Farmland.',
  'Namjin Riverside': 'Hajin\'s southern edge, where abandoned civilian cars cluster near a tunnel by the river\'s South Fork.',
}
// Other names the Intel database uses for a place. Matched case-sensitively as whole words.
const ALIASES = {
  '14th Political Prison': ['Political Prison'], 'Chang-san Air Base': ['Changsan Air Base', 'Air Base'], 'Cheongun Village': ['Cheongun'],
  'Haneul Nuclear Reactor': ['Haneul', 'Nuclear Reactor', 'Reactor 01', 'Reactor 02'], 'Mirae General Hospital': ['Mirae'],
  'NuriGO Mall': ['NuriGo Mall', 'NuriGO'], 'Cheonwang Peak Array': ['Cheonwang'], 'The Grid': ['Nenshin', 'Netshin'], 'Songdo Wharf': ['Songdo'],
  'Hajin River Heights': ['River Heights'], 'The Citadel': ['Citadel'], 'Heavenly Luck Casino': ['Heavenly Luck', 'casino', 'Casino'],
  'Admin Complex No. 2': ['Admin Complex'], 'Re-Education Center': ['Re-Education'], 'Rice Mill': ['Imjin Mill'], 'Oamsik Turtle Islands': ['Oamsik'],
}
// Intel categories that describe places on the map.
const PLACE_CATEGORIES = ['map', 'keys', 'enemies', 'missions', 'exfil', 'crafting', 'gear', 'vehicles', 'tips']
const WHERE_LABEL = /^(location|locations|spawn|area|where|door|found|site|route|spots?|farm|position|poi|room|loot room)\b/i

const slug = text => String(text).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const wholeWord = name => new RegExp(`(?<![\\w-])${name === 'Citadel' ? '(?<!Iron )' : ''}${escape(name)}(?![\\w])`)

export function toArt([x, y]) {
  const { scale, x: dx, y: dy } = hajinMap.toArt
  return [x * scale + dx, y * scale + dy]
}
export function squareOf([x, y]) {
  const { left, top, cell, columns, rows } = hajinMap.grid
  const column = Math.floor((x - left) / cell), row = Math.floor((y - top) / cell) + 1
  return column >= 0 && column < columns.length && row >= 1 && row <= rows ? `${columns[column]}${row}` : null
}
// The middle of a square, in official units.
export function squareCentre(square) {
  const { left, top, cell, columns } = hajinMap.grid
  return [left + (columns.indexOf(square[0]) + 0.5) * cell, top + (Number(square.slice(1)) - 0.5) * cell]
}
const peak = threats => threats.reduce((top, level) => threatLevels.indexOf(level) > threatLevels.indexOf(top) ? level : top, threats[0])

// Places first, so services can name the place they sit in.
const pins = []
for (const layer of ['poi', 'fortress', 'area', 'compound']) {
  for (const [name, x, y] of OFFICIAL[layer]) {
    const parts = layer === 'poi' ? POI_PARTS[name] : undefined
    const own = Object.values(POI_PARTS).flat().find(([part]) => part === name)?.[1]
    const parent = layer !== 'poi' ? PARENT[name] || (layer === 'fortress' ? name : undefined) : undefined
    const threat = parts ? peak(parts.map(([, level]) => level)) : own || (layer === 'fortress' && parent ? peak(POI_PARTS[parent].map(([, level]) => level)) : undefined)
    pins.push({
      id: `${layer === 'fortress' ? 'fortress-' : ''}${slug(name)}`, layer, name, at: [x, y], square: squareOf([x, y]),
      ...(threat ? { threat } : {}), ...(parts ? { parts } : {}), ...(parent ? { parent: slug(parent) } : {}), ...(AREA_DESC[name] ? { desc: AREA_DESC[name] } : {}),
      // A fortress named like its location opens that location's card.
      ...(layer === 'fortress' && POI_PARTS[name] ? { same: slug(name) } : {}),
    })
  }
}
const places = [...pins]
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])
for (const layer of ['police', 'clinic', 'fire', 'gas', 'marine-gas', 'ammo', 'uav', 'lt-tower']) {
  const taken = new Map()
  for (const at of [...OFFICIAL[layer]].sort((a, b) => a[1] - b[1] || a[0] - b[0])) {
    const square = squareOf(at)
    const count = (taken.get(square) || 0) + 1
    taken.set(square, count)
    const near = places.filter(place => place.layer !== 'compound' || layer === 'ammo').sort((a, b) => distance(a.at, at) - distance(b.at, at))[0]
    pins.push({ id: `${layer}-${square.toLowerCase()}${count > 1 ? `-${count}` : ''}`, layer, name: hajinLayer(layer).one, at, square, near: near.id })
  }
}

// Reported sites sit on the place they belong to; one with no place keeps its square.
const reportName = name => slug(name.replace(/\s*\(.*\)$/, '').replace(/\s+key$/i, '')).replace(/^the-/, '').replace(/-/g, '')
const intelByName = new Map(dmzIntel.filter(entry => !entry.tracked).map(entry => [reportName(entry.name), entry.id]))
// Reports whose Intel card goes by another name.
const REPORT_INTEL = {
  'supreme-leaders-bunker': 'supreme-leader-access-card', 'the-citadel-south-wing': 'citadel-south-wing-supply-room',
  'gun-store-weapons-lockers-western-cheongun-village': 'gun-store-weapons-locker-key', 'gun-store-weapons-lockers-northern-songdo-wharf': 'gun-store-weapons-locker-key',
  'jang-ui-encampment-nurigo-mall': 'jang-ui', 'tank': 'main-nk-battle-tank', 'gorani-loot-room-rice-mill-rooftop': 'gorani',
}
export const hajinReports = mapReports.map(report => {
  const intel = REPORT_INTEL[report.id] || intelByName.get(reportName(report.name))
  return { ...report, ...(intel ? { intel } : {}) }
})
for (const pin of pins) {
  const own = hajinReports.filter(report => report.anchor === pin.id)
  if (own.length) pin.reports = own.map(report => report.id)
}

// Intel entries that name a place in their title, summary or location facts.
function intelFor(names) {
  const patterns = names.map(wholeWord)
  return dmzIntel.filter(entry => PLACE_CATEGORIES.includes(entry.category) && !entry.tracked).filter(entry => {
    const text = [entry.name, entry.summary, ...(entry.details || []).filter(([label]) => WHERE_LABEL.test(label)).map(([, value]) => value)].join(' \n ')
    return patterns.some(pattern => pattern.test(text))
  }).map(entry => entry.id)
}
for (const pin of places) {
  const children = places.filter(other => other !== pin && other.parent === pin.id && other.layer !== 'fortress')
  const names = [pin.name, ...(ALIASES[pin.name] || []), ...children.flatMap(child => [child.name, ...(ALIASES[child.name] || [])])]
  const intel = intelFor(names)
  if (intel.length) pin.intel = intel
}

// Threat zones. The Deep Dive rates the parts of each location but draws no borders, so
// the threat view colours the ground near each rated part's label on the official map:
// a location's own label stands for its main part, and a fortress or named area for the
// part it names. Other places in a location widen its main part. Places the Deep Dive
// does not rate claim their own ground and stay uncoloured. A part with no label of its
// own is listed but not drawn.
const LABEL_PART = { '14th Political Prison': 'Prison', 'Chang-san Air Base': 'Air Base Exterior', 'Deadtown': 'Deadtown Exterior', 'Imjin Farmland': 'Farmland Exterior', 'Haneul Nuclear Reactor': 'Reactor' }
// How far a zone reaches from its label, in official units.
const REACH = { poi: 200, area: 140, fortress: 90, compound: 90 }
const threatParts = []
const threatSeeds = []
for (const poi of places.filter(place => place.layer === 'poi')) {
  const labelPart = LABEL_PART[poi.name] || (poi.parts.some(([part]) => part === poi.name) ? poi.name : null)
  const own = []
  for (const [name, level] of poi.parts) {
    const place = name === labelPart ? poi : places.find(other => other.name === name && other.layer !== 'poi' && !other.same)
    const part = { id: `${poi.id}--${slug(name)}`, name, level, poi: poi.id, pin: place?.id || null, at: place?.at || null }
    own.push(part)
    if (place) threatSeeds.push({ at: place.at, reach: REACH[place.layer], part: part.id, poi: poi.id, level })
  }
  const main = own.find(part => part.name === labelPart)
  if (main) {
    for (const place of places.filter(other => other.parent === poi.id && other.layer !== 'poi' && !own.some(part => part.pin === other.id))) {
      threatSeeds.push({ at: place.at, reach: REACH[place.layer], part: main.id, poi: poi.id, level: main.level })
    }
  }
  // A part rated above everything drawn for its location still has to show somewhere.
  const drawnPeak = Math.max(...own.filter(part => part.at).map(part => threatLevels.indexOf(part.level)))
  for (const part of own) threatParts.push(!part.at && threatLevels.indexOf(part.level) > drawnPeak ? { ...part, hotter: true } : part)
}
for (const place of places.filter(place => !place.parent && !place.threat)) threatSeeds.push({ at: place.at, reach: REACH[place.layer], part: null, poi: null, level: null })

export const hajinThreatParts = threatParts
export const hajinThreatSeeds = threatSeeds
export const hajinPins = pins
export const hajinPin = id => pins.find(pin => pin.id === id)
export const mapSources = { ...intelSources, ...mapReportSources }

// Modern Warfare 4 DMZ section: station menu, routes, Orders tracker data and
// briefing facts. Facts come from early-access reporting (checked 2026-10-20);
// counts that were single-source or conflicting stay out until confirmed.

export const DMZ_CHECKED = '24 Oct 2026'

// Station icons are 24×24 stroke paths drawn for CodWiki.
export const dmzStations = [
  {
    id: 'deploy', label: 'Deploy', short: 'Map', title: 'Hajin Exclusion Zone', route: '/dmz/hajin',
    icon: 'M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z M9 4v14 M15 6v14',
    desc: 'The Hajin Tac-Map: 13 major locations rated Low to Extreme, the official service markers, and the key rooms, bosses and exfils players report at each place.',
    // Counts match shared/dmz-map.mjs; tests/dmz-map.test.mjs checks them.
    facts: ['13 major locations · 137 official markers', '122 reported sites, by place'],
  },
  {
    id: 'stash', label: 'Stash', short: 'Keys', title: 'Key tracker', route: '/dmz/stash',
    icon: 'M3 9h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M8 9V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3 M3 13h18',
    desc: 'Every key and locked room in Intel, with the room it opens, its place and grid square. Mark the keys you hold or have used; marks stay on this device.',
    // Counts match shared/dmz-keys.mjs; tests/dmz-keys.test.mjs checks them.
    facts: ['53 keys · 47 reported rooms', 'Held and used marks, kept between matches'],
  },
  {
    id: 'orders', label: 'DMZ Orders', short: 'Orders', title: 'Orders tracker', route: '/dmz/orders',
    icon: 'M8 3h8v3H8z M6 4.5H5V21h14V4.5h-1 M8 11h8 M8 15h5',
    desc: 'Tick off DMZ Order tasks as you finish them. Progress stays on this device between matches.',
    facts: ['Pages 1 to 9 · 27 Orders', 'Boss Board opens after your 2nd Orders page'],
  },
  {
    // Counts match shared/dmz-stations.mjs; tests/dmz-stations.test.mjs checks them.
    id: 'boss', label: 'Boss Board', title: 'Lieutenants and Commanders', route: '/dmz/boss-board',
    icon: 'M12 3v4 M12 17v4 M3 12h4 M17 12h4 M17 12a5 5 0 1 1-10 0a5 5 0 1 1 10 0 M12 11v2',
    desc: 'Who roams Hajin, where players find them and what they drop, plus the forces that escalate around you.',
    facts: ['10 Lieutenants · 4 Commanders and bosses', 'Where to find them, how to kill them, what they drop'],
  },
  {
    id: 'printer', label: '3D Printer', title: 'Materials calculator', route: '/dmz/printer',
    icon: 'M4 3h16v18H4z M4 8h16 M10 8v4h4V8 M8 17h8 M12 12v2',
    desc: 'Pick what to print and see which materials to loot this run. The plan stays on this device.',
    facts: ['36 recipes with their materials', 'Where world recipes turn up, with find counts'],
  },
  {
    id: 'operators', label: 'Operators', title: 'Operators and traits', route: '/dmz/operators',
    icon: 'M12 11a4 4 0 1 0 0-8a4 4 0 1 0 0 8 M4 21c0-4 4-6 8-6s8 2 8 6',
    desc: 'The Warfighter, Scout and Survivalist trait trees drawn like the game screen. Plan where your 18 points go and read what players say about each trait.',
    // Counts match shared/dmz-traits.mjs; tests/dmz-traits.test.mjs checks them.
    facts: ['66 traits · 22 per tree, 3 trees', '18 Trait Points · plan a build'],
  },
  {
    // Counts match shared/dmz-weapons.mjs; tests/dmz-weapons.test.mjs checks them.
    id: 'gunsmith', label: 'Gunsmith', title: 'Meta weapons', route: '/dmz/gunsmith',
    icon: 'M2 10h14l3-2h3v4h-6l-2 2h-3l-1 4H6l1-4H2z M9 10v2',
    desc: 'What players on r/DMZ recommend so far, next to four guide-site tier lists, and every way to get a gun in DMZ.',
    facts: ['33 launch weapons · 4 site tier lists', 'Reddit picks and loadout tips'],
  },
  {
    id: 'briefing', label: 'Briefing', title: 'How DMZ works', route: '/dmz/briefing',
    icon: 'M6 3h9l4 4v14H6z M15 3v4h4 M9 12h7 M9 16h7',
    desc: 'Lobbies, the FOB, missions, threats and the economy, in one read before your first deploy.',
    facts: ['60 players · 20 squads of up to 3', 'Persistent stash, no planned wipes'],
  },
  {
    // Counts match shared/dmz-guide.mjs; tests/dmz-guide.test.mjs checks them.
    id: 'guide', label: 'Guide', title: 'Progression guide', route: '/dmz/guide',
    icon: 'M6 9l6-4 6 4 M6 14l6-4 6 4 M6 19l6-4 6 4',
    desc: 'What to do next, from your first deploy to the endgame: the steps in order for each stage, what to print and farm, and which bosses to hunt.',
    facts: ['3 stages · 29 steps in order', 'Early, mid and late game'],
  },
  {
    id: 'intel', label: 'Intel', title: 'Intel database', route: '/dmz/intel',
    icon: 'M12 10v11 M8 6.5a6 6 0 0 0 0 8 M16 6.5a6 6 0 0 1 0 8 M5 3.5a10 10 0 0 0 0 14 M19 3.5a10 10 0 0 1 0 14',
    desc: 'Start from what you are doing right now, or search everything known about DMZ. Every entry lists its sources and a confidence label.',
    facts: ['Missions, Armory, Field manual and Status', 'Official · Confirmed · Reported'],
  },
]

// Phone dock: four stations around the menu button (null), in rail order.
export const dmzDock = ['deploy', 'orders', null, 'guide', 'intel']

// A thin divider above these in the rail and the station menu:
// field tools | FOB stations | reading.
export const dmzRailBreaks = ['boss', 'briefing']

// Intel's own pages, for the rail and Intel's chip row. They live here so the
// shell never imports the Intel data; tests/dmz-nav.test.mjs checks them
// against intelStations.
export const dmzIntelShelves = [
  { id: 'missions', label: 'Missions', path: '/dmz/intel/missions' },
  { id: 'armory', label: 'Armory', path: '/dmz/intel/armory' },
  { id: 'manual', label: 'Field manual', path: '/dmz/intel/field-manual' },
  { id: 'status', label: 'Status', path: '/dmz/intel/status' },
  { id: 'all', label: 'Everything', path: '/dmz/intel/all' },
]

// Menu bulletin. Update it when the next milestone passes.
export const dmzBulletin = { title: 'DMZ is live', detail: 'Launch fixes 23 Oct · Season 1 on 6 Nov' }

// Indexable DMZ pages. The SEO and search generators read this list.
export const dmzPages = [
  {
    path: '/dmz', name: 'DMZ stations',
    title: 'MW4 DMZ Guides and Tools — CodWiki',
    description: 'Modern Warfare 4 DMZ companion: Hajin Exclusion Zone points of interest, DMZ Orders and key trackers, and a briefing on how the mode works.',
  },
  {
    path: '/dmz/hajin', name: 'Hajin Exclusion Zone',
    title: 'Hajin Interactive Map — MW4 DMZ — CodWiki',
    description: 'Interactive Hajin Tac-Map for Modern Warfare 4 DMZ: all 13 major locations with threat ratings, police stations, clinics, UAV and Lieutenant towers, plus reported key rooms, bosses and exfils.',
  },
  {
    path: '/dmz/orders', name: 'DMZ Orders tracker',
    title: 'DMZ Orders Tracker — MW4 DMZ — CodWiki',
    description: 'Track Modern Warfare 4 DMZ Order tasks between matches. Ticks and counters are saved on this device.',
  },
  {
    path: '/dmz/stash', name: 'DMZ key tracker',
    title: 'DMZ Key Tracker — MW4 DMZ — CodWiki',
    description: 'Modern Warfare 4 DMZ key tracker: every key and locked room with its Hajin room, place, grid square and confidence label. Mark keys held or used; marks are saved on this device.',
  },
  {
    path: '/dmz/intel', name: 'DMZ Intel database',
    title: 'DMZ Intel Database — MW4 DMZ — CodWiki',
    description: 'Modern Warfare 4 DMZ Intel: start from what you are doing, such as hunting a boss, printing gear or getting out, or search keys, missions, traits and mechanics with sources.',
  },
  {
    path: '/dmz/boss-board', name: 'DMZ Boss Board',
    title: 'DMZ Boss Locations: Colossus, Deathstalker and Lieutenants — MW4 DMZ — CodWiki',
    description: 'Modern Warfare 4 DMZ Boss Board: where players report meeting Colossus, the Deathstalker, the tank and every Lieutenant on Hajin, with report counts, how to kill them and what they drop.',
  },
  {
    path: '/dmz/printer', name: 'DMZ 3D Printer recipes',
    title: 'DMZ 3D Printer Recipes and Where They Drop — MW4 DMZ — CodWiki',
    description: 'Modern Warfare 4 DMZ 3D Printer recipes with materials and unlocks, where world recipes have been found on Hajin with find counts, and a planner for your next prints.',
  },
  {
    path: '/dmz/operators', name: 'DMZ Operators and traits',
    title: 'DMZ Traits and Operators — MW4 DMZ — CodWiki',
    description: 'Modern Warfare 4 DMZ trait trees side by side: Warfighter, Scout and Survivalist major and minor traits, plus Active Duty Operators, MIA and Dog Tags.',
  },
  {
    path: '/dmz/intel/missions', name: 'DMZ missions',
    title: 'DMZ Story Missions, Dynamic Ops and Side Ops — MW4 DMZ — CodWiki',
    description: 'Modern Warfare 4 DMZ missions in one list: Story Missions, Dynamic Ops, Side Ops and contracts, with sources and a confidence label.',
  },
  {
    path: '/dmz/intel/armory', name: 'DMZ Armory',
    title: 'DMZ Weapons, Equipment and Gear — MW4 DMZ — CodWiki',
    description: 'Modern Warfare 4 DMZ weapons, contraband, equipment, consumables, backpacks and kits, each with sources and a confidence label.',
  },
  {
    path: '/dmz/intel/field-manual', name: 'DMZ Field manual',
    title: 'DMZ Rules, Exfil, Vehicles and FOB — Field Manual — MW4 DMZ — CodWiki',
    description: 'How Modern Warfare 4 DMZ works: rules of the zone, infil and exfil, vehicles, FOB stations, DMZ Cash and field notes from players.',
  },
  {
    path: '/dmz/intel/status', name: 'DMZ Status',
    title: 'DMZ Known Issues and Season Dates — MW4 DMZ — CodWiki',
    description: 'Modern Warfare 4 DMZ known issues sorted by fix status, and launch, season and patch dates in order.',
  },
  {
    path: '/dmz/intel/all', name: 'All DMZ Intel',
    title: 'All DMZ Intel Entries — MW4 DMZ — CodWiki',
    description: 'Every Modern Warfare 4 DMZ Intel entry on one page: filter by category or confidence label, or search names, details and sources.',
  },
  {
    path: '/dmz/guide', name: 'DMZ progression guide',
    title: 'DMZ Progression Guide: Early, Mid and Late Game — MW4 DMZ — CodWiki',
    description: 'What to do next in Modern Warfare 4 DMZ, from your first deploy to the endgame: early, mid and late game steps in order, which deployment and Dynamic Ops to pick, what to print and farm, and which Lieutenants to hunt first.',
  },
  {
    path: '/dmz/gunsmith', name: 'DMZ meta weapons',
    title: 'DMZ Meta Weapons: What Players Use — MW4 DMZ — CodWiki',
    description: 'Modern Warfare 4 DMZ meta weapons: the guns players on Reddit recommend, side by side with guide-site tier lists, plus how to get each gun through Weapon Manuals, the Gunsmith and blueprints.',
  },
  {
    path: '/dmz/briefing', name: 'How DMZ works',
    title: 'How DMZ Works in Modern Warfare 4 — CodWiki',
    description: 'Modern Warfare 4 DMZ basics: lobbies, the FOB, Active Duty Operators and MIA, missions, threat levels, DMZ Cash and progression.',
  },
]

// Draft Intel and guide layouts under /dmz/lab, for picking a direction. They are
// noindex and stay out of dmzPages, the sitemap and search until one is chosen.
export const dmzLabPages = [
  { path: '/dmz/lab', name: 'Intel concepts', title: 'Intel Concepts — DMZ Lab — CodWiki', description: 'Draft layouts for a friendlier MW4 DMZ Intel page, compared side by side. Concepts only; the live Intel database is unchanged.' },
  { path: '/dmz/lab/intel-a', name: 'Concept A: Stations', title: 'Concept A: Intel Stations — DMZ Lab — CodWiki', description: 'Draft: DMZ Intel split into FOB-style stations such as a Boss Board, a 3D Printer planner and trait trees.' },
  { path: '/dmz/lab/intel-b', name: 'Concept B: Ask first', title: 'Concept B: Ask First — DMZ Lab — CodWiki', description: 'Draft: DMZ Intel that starts by asking what you are doing, then shows a short answer for that job.' },
  { path: '/dmz/lab/intel-c', name: 'Concept C: Dossiers', title: 'Concept C: Intel Dossiers — DMZ Lab — CodWiki', description: 'Draft: a compact DMZ Intel directory with one dossier page per entry and related links.' },
  { path: '/dmz/lab/intel-d', name: 'Concept D: In the field', title: 'Concept D: Intel in the Field — DMZ Lab — CodWiki', description: 'Draft: DMZ Intel shown inside the Orders tracker, the Tac-Map and the key tracker instead of on a page of its own.' },
  { path: '/dmz/lab/intel-e', name: 'Concept E: Quick find', title: 'Concept E: Intel Quick Find — DMZ Lab — CodWiki', description: 'Draft: a search-first DMZ Intel palette with ranked results and a preview, opened from any station.' },
  { path: '/dmz/lab/intel-mix', name: 'Recommended mix', title: 'Recommended Mix: Stations and Quick Find — DMZ Lab — CodWiki', description: 'Draft: DMZ Intel as stations with quick find on top and an ask-first landing, the recommended direction.' },
  { path: '/dmz/lab/guide', name: 'Guide concepts', title: 'Guide Concepts — DMZ Lab — CodWiki', description: 'Draft layouts for an MW4 DMZ progression guide, early to late game, compared side by side. Concepts only.' },
  { path: '/dmz/lab/guide-ladder', name: 'Guide G1: Armor ladder', title: 'Concept G1: Armor Ladder — DMZ Lab — CodWiki', description: 'Draft: the DMZ guide as a ladder of vests, Early to Late, with every tier in order on one page.' },
  { path: '/dmz/lab/guide-vest', name: 'Guide G2: Pick your vest', title: 'Concept G2: Pick Your Vest — DMZ Lab — CodWiki', description: 'Draft: the DMZ guide starts by asking which vest you wear, then shows that tier as a briefing.' },
  { path: '/dmz/lab/guide-tabs', name: 'Guide G3: Tabs and dropdowns', title: 'Concept G3: Guide Tabs — DMZ Lab — CodWiki', description: 'Draft: the DMZ guide as Early, Mid and Late tabs, each a list of questions that open into answers.' },
  { path: '/dmz/lab/guide-ask', name: 'Guide G4: Ask the handler', title: 'Concept G4: Ask the Handler — DMZ Lab — CodWiki', description: 'Draft: three quick questions about your vest, your goal and your squad lead to a short DMZ plan.' },
  { path: '/dmz/lab/traits', name: 'Trait tree concepts', title: 'Trait Tree Concepts — DMZ Lab — CodWiki', description: 'Draft layouts for a visual MW4 DMZ trait tree, compared side by side with their scores. Concepts only.' },
  { path: '/dmz/lab/traits-replica', name: 'Traits T1: In-game replica', title: 'Concept T1: Trait Tree Replica — DMZ Lab — CodWiki', description: 'Draft: the DMZ trait trees drawn like the in-game screen, climbed from the bottom, with random Minors shown as question marks.' },
  { path: '/dmz/lab/traits-planner', name: 'Traits T2: Build planner', title: 'Concept T2: Trait Build Planner — DMZ Lab — CodWiki', description: 'Draft: plan where 18 DMZ Trait Points go, one pick per row and nine per tree, saved on this device.' },
  { path: '/dmz/lab/traits-forks', name: 'Traits T3: Fork comparison', title: 'Concept T3: Trait Forks — DMZ Lab — CodWiki', description: 'Draft: each DMZ trait tree as its three Major forks side by side, with what players say about each.' },
]

// Briefing sections, in page order. Search entries link to these anchors.
export const dmzBriefingSections = [
  { id: 'overview', title: 'What DMZ is' },
  { id: 'lobbies', title: 'Lobbies and squads' },
  { id: 'fob', title: 'The FOB' },
  { id: 'operators', title: 'Operators, MIA and traits' },
  { id: 'missions', title: 'Orders and missions' },
  { id: 'threats', title: 'Threats and bosses' },
  { id: 'economy', title: 'DMZ Cash, crafting and weapons' },
  { id: 'timeline', title: 'Dates and seasons' },
  { id: 'unconfirmed', title: 'Not confirmed yet' },
]

export const hajinPois = [
  '14th Political Prison', 'Chang-san Air Base', 'Deadtown', 'Imjin Farmland', 'Cheongun Village',
  'Mirae General Hospital', 'Cheonwang Peak Array', 'Haneul Nuclear Reactor', 'NuriGO Mall',
  'The Grid', 'Songdo Wharf', 'Wolves Stadium', 'Hajin River Heights',
]

export const DMZ_ORDERS_CHECKED = '22 Oct 2026'

// Orders for the tracker. The Intel database lists them too, with these
// summaries and sources (ids from intelSources in dmz-intel.mjs). An Order is
// added once its task text is checked in-game or matches across two guides;
// chapter is the page title the Orders screen shows. Pages 1, 4 and 7 are the
// same for everyone; the three chapters fill the pages between them in the
// order each player picks, so the tracker lists them in one possible order.
// Task IDs are saved on players' devices: never rename one.
export const dmzOrders = [
  {
    id: 'gear-up', chapter: 'Page 1', name: 'Gear Up',
    summary: 'The tutorial Order at the FOB: put a weapon, a backpack, an armor vest and a Medkit on your operator from the Stash.',
    note: 'A Bandage does not count as the Medkit. Players who sold or deleted the starting Medkit could not finish this Order until the 20 Oct fix.',
    confidence: 'confirmed', sources: ['thebasedotaku-cod-mw4-dmz-hub-page', 'nintendo-insider-call-of-duty-modern-warfare', 'reddit-stuck-in-the-dmz-tutorial', 'reddit-is-anyone-else-stuck-without', 'reddit-accidentally-deleted-medkit-and-cant', 'reddit-potential-dmz-lobby-orders-bug', 'codcentral-mw4-dmz-orders', 'game8-archives-3', 'dmzcodex-dmz-orders-walkthrough'],
    tasks: [
      { id: 'equip-stash-kit', text: 'Equip a Weapon, a Backpack, an Armor Vest, and a Medkit from Your Stash' },
    ],
  },
  {
    id: 'crack-shot', chapter: 'Page 1', name: 'Crackshot',
    summary: 'Knock down three targets on the Firing Range inside the FOB.',
    note: 'Most guides spell it Crackshot; DMZ Codex writes Crack Shot.',
    confidence: 'confirmed', sources: ['thebasedotaku-cod-mw4-dmz-hub-page', 'nintendo-insider-call-of-duty-modern-warfare', 'codcentral-mw4-dmz-orders', 'game8-archives-3', 'allthings-which-dmz-orders-chapter-to'],
    tasks: [
      { id: 'firing-range-targets', text: 'Knock Down 3 Firing Range Targets', max: 3 },
    ],
  },
  {
    id: 'first-op', chapter: 'Page 1', name: 'First Op',
    summary: 'Deploy into Hajin on a Dynamic Op. Deploying is enough; you do not have to extract.',
    note: 'Coming back from this deployment unlocks story missions and the chapter choice. Some guides write First OP.',
    confidence: 'confirmed', sources: ['thebasedotaku-cod-mw4-dmz-hub-page', 'nintendo-insider-call-of-duty-modern-warfare', 'codcentral-mw4-dmz-orders', 'game8-archives-3', 'allthings-which-dmz-orders-chapter-to', 'steamcommunity-discussions-12'],
    tasks: [
      { id: 'deploy-dynamic-ops', text: 'Deploy to DMZ in Dynamic Ops' },
    ],
  },
  {
    id: 'eye-in-the-sky', chapter: 'Underground 1/2', name: 'Eye in the Sky',
    summary: 'A SAM site Order: take one over, use it to bring down a cargo chopper, then loot the wreck.',
    confidence: 'confirmed', proof: 'in-game', sources: ['in-game-orders', 'thebasedotaku-cod-mw4-dmz-order-eye', 'youtube-r9qx18kd6ty', 'codcentral-mw4-dmz-orders', 'game8-archives-3'],
    tasks: [
      { id: 'commandeer-sam', text: 'Commandeer a SAM Site' },
      { id: 'shoot-down-chopper', text: 'Shoot Down a Chopper Carrying Cargo With a SAM Site' },
      { id: 'loot-chopper-crate', text: 'Loot a Crate From a Downed Chopper' },
    ],
  },
  {
    id: 'watch-for-bumps', chapter: 'Underground 1/2', name: 'Watch for Bumps',
    summary: 'A vehicle Order: steal an enemy vehicle, keep it running at a gas station and use it on enemy soldiers.',
    confidence: 'confirmed', proof: 'in-game', sources: ['in-game-orders', 'thebasedotaku-cod-mw4-dmz-order-watch', 'youtube-r9qx18kd6ty', 'codcentral-mw4-dmz-orders', 'game8-archives-3'],
    tasks: [
      { id: 'steal-vehicle', text: 'Steal an Enemy Vehicle' },
      { id: 'refuel-repair', text: 'Refuel and Repair a Vehicle at a Gas Station' },
      { id: 'run-over-enemies', text: 'Run Over 7 Enemies in a Vehicle', max: 7 },
    ],
  },
  {
    id: 'triangulation', chapter: 'Underground 1/2', name: 'Triangulation',
    summary: 'A transmitter Order: plant transmitters on top of two radio towers and on La Grande Vie in Songdo Wharf.',
    confidence: 'confirmed', proof: 'in-game', sources: ['in-game-orders', 'youtube-r9qx18kd6ty', 'game8-archives-8', 'reddit-transmitter-locations', 'codcentral-mw4-dmz-orders', 'game8-archives-3'],
    tasks: [
      { id: 'radio-towers', text: 'Place a Transmitter on Top of 2 Radio Towers', max: 2 },
      { id: 'la-grande-vie', text: 'Place a Transmitter on Top of La Grande Vie in Songdo Wharf' },
    ],
  },
  {
    id: 'dead-battery', chapter: 'Underground 2/2', name: 'Dead Battery',
    summary: 'Print a DDOS field upgrade with the recipe from Underground 1/2, then use it to knock out three enemy vehicles or drones.',
    confidence: 'confirmed', sources: ['thebasedotaku-cod-mw4-dmz-hub-page', 'codcentral-mw4-dmz-orders', 'game8-archives-3', 'allthings-mw4-dmz-dead-battery-guide', 'dmzcodex-dmz-orders-walkthrough'],
    tasks: [
      { id: 'print-ddos', text: 'Print a DDOS Field Upgrade' },
      { id: 'ddos-disables', text: 'Disable 3 Enemy Vehicles or Drones With the DDOS Field Upgrade', max: 3 },
    ],
  },
  {
    id: 'death-from-above', chapter: 'Underground 2/2', name: 'Death From Above',
    summary: 'Lure a drone with a Decoy Grenade, destroy three drones and loot a Drone Motherboard from one of the wrecks.',
    note: 'The Decoy Grenade recipe comes from Underground 1/2. Guides point to the drones around La Grande Vie in Songdo Wharf.',
    confidence: 'confirmed', sources: ['thebasedotaku-cod-mw4-dmz-hub-page', 'youtube-watch-34', 'youtube-watch-35', 'codcentral-mw4-dmz-orders', 'game8-archives-3', 'allthings-mw4-dmz-death-from-above', 'thebasedotaku-cod-mw4-dmz-death-from'],
    tasks: [
      { id: 'decoy-drone', text: 'Trick a Drone With a Decoy Grenade' },
      { id: 'destroy-drones', text: 'Destroy 3 Drones', max: 3 },
      { id: 'drone-motherboard', text: 'Loot a Drone Motherboard From a Destroyed Drone' },
    ],
  },
  {
    id: 'operation-shopping-hacks', chapter: 'Underground 2/2', name: 'Operation Shopping Hacks',
    summary: 'Finish the Operation Shopping Hacks story mission. If you already have, the Order ticks itself.',
    confidence: 'confirmed', sources: ['codcentral-mw4-dmz-orders', 'game8-archives-3', 'dmzcodex-dmz-orders-walkthrough'],
    tasks: [
      { id: 'shopping-hacks', text: 'Complete the Operation Shopping Hacks Story Mission' },
    ],
  },
  {
    id: 'operation-rewards', chapter: 'Page 4', name: 'Operation Rewards',
    summary: 'Pick up a Dynamic Op phone in Cheongun Village, finish any Dynamic Op and loot the crate it pays out.',
    confidence: 'confirmed', sources: ['codcentral-mw4-dmz-orders', 'game8-archives-3', 'allthings-mw4-dmz-how-to-complete-3', 'allthings-every-task-on-dmz-orders', 'reddit-dmz-orders-pg-4-collect', 'reddit-dmz-orders-pg-4', 'reddit-dmz-dynamic-op-phone-pg4', 'youtube-eqwof4pzvpe'],
    tasks: [
      { id: 'cheongun-op-phone', text: 'Collect a Dynamic Op Phone in Cheongun Village' },
      { id: 'complete-dynamic-op', text: 'Complete a Dynamic Op' },
      { id: 'loot-op-crate', text: 'Loot a Dynamic Op Crate' },
    ],
  },
  {
    id: 'preparation', chapter: 'Page 4', name: 'Preparation',
    summary: 'Print a Medium Backpack and a 2-Plate Armor Vest at the FOB 3D Printer. Looted ones do not count.',
    note: 'The Medium Backpack costs 50 Synthetics and 5 Rigid Synthetics; the 2-Plate Armor Vest costs 50 Synthetics and 5 Reactive Metals.',
    confidence: 'confirmed', sources: ['codcentral-mw4-dmz-orders', 'game8-archives-3', 'allthings-every-task-on-dmz-orders', 'dmzcodex-dmz-orders-walkthrough'],
    tasks: [
      { id: 'print-medium-backpack', text: 'Print a Medium Backpack' },
      { id: 'print-2-plate-vest', text: 'Print a 2-Plate Armor Vest' },
    ],
  },
  {
    id: 'work-quietly', chapter: 'Page 4', name: 'Work Quietly',
    summary: 'Fit a suppressor at the Gunsmith, print a Throwing Knife, then get eight kills in a row without taking damage.',
    note: 'The Throwing Knife costs 25 Chemicals and 25 Metals and can be printed from DMZ level 7.',
    confidence: 'confirmed', sources: ['codcentral-mw4-dmz-orders', 'game8-archives-3', 'allthings-mw4-dmz-how-to-complete-4', 'allthings-every-task-on-dmz-orders'],
    tasks: [
      { id: 'gunsmith-suppressor', text: 'Gunsmith a Suppressor Onto a Weapon' },
      { id: 'print-throwing-knife', text: 'Print a Throwing Knife' },
      { id: 'kills-without-damage', text: 'Kill 8 Enemies in a Row Without Being Damaged', max: 8 },
    ],
  },
  {
    id: 'hostile-force', chapter: 'Counterfeit 1/2', name: 'Hostile Force',
    summary: 'A Police Station Order: get inside one, search its containers and fight the soldiers holding it.',
    confidence: 'confirmed', sources: ['gamerfuzion-modern-warfare-4-dmz-dynamic', 'mw4map-missions', 'codmunity-guide', 'codcentral-mw4-dmz-orders', 'game8-archives-3'],
    tasks: [
      { id: 'enter-police-station', text: 'Locate and Enter a Police Station' },
      { id: 'police-containers', text: 'Search 3 Containers in a Police Station', max: 3 },
      { id: 'police-soldiers', text: 'Eliminate 5 Soldiers While Inside a Police Station', max: 5 },
    ],
  },
  {
    id: 'robbery', chapter: 'Counterfeit 1/2', name: 'Robbery',
    summary: 'A safe-cracking Order: open a safe, then extract with at least $5,000 of value in your backpack and loadout together.',
    note: 'Earlier guides shortened the second task to Extract $5,000 Cash Value.',
    confidence: 'confirmed', sources: ['gamerfuzion-modern-warfare-4-dmz-dynamic', 'mw4map-missions', 'codmunity-guide', 'codcentral-mw4-dmz-orders', 'game8-archives-3', 'dmzcodex-dmz-safes-robbery-guide'],
    tasks: [
      { id: 'open-safe', text: 'Open a Safe (Often Found in Compounds and Locked Spaces)' },
      { id: 'extract-cash', text: 'Extract $5,000 Total Backpack and Loadout Value' },
    ],
  },
  {
    id: 'execute-intel', chapter: 'Counterfeit 1/2', name: 'Execute Intel',
    summary: 'A UAV Tower Order in Deadtown: hack the tower, hunt the soldiers it pings and loot the counterfeit cash they drop.',
    note: 'One guide spells the location Downtown; three others say Deadtown, which is a Hajin location.',
    confidence: 'confirmed', sources: ['allthings-call-of-duty-modern-warfare', 'gamerfuzion-modern-warfare-4-dmz-dynamic', 'mw4map-missions', 'codmunity-guide', 'codcentral-mw4-dmz-orders', 'game8-archives-3'],
    tasks: [
      { id: 'hack-deadtown-uav', text: 'Hack a UAV Tower in Deadtown' },
      { id: 'pinged-soldiers', text: 'Kill 5 NK Soldiers Pinged by a UAV Tower', max: 5 },
      { id: 'counterfeit-cash', text: 'Loot Counterfeit Cash Dropped by Pinged NK Soldiers' },
    ],
  },
  {
    id: 'suit-breach', chapter: 'Counterfeit 2/2', name: 'Suit Breach',
    summary: 'Kill 15 enemies in hazmat suits. They stay near irradiated areas such as the Haneul Nuclear Reactor.',
    confidence: 'confirmed', sources: ['codcentral-mw4-dmz-orders', 'game8-archives-3'],
    tasks: [
      { id: 'hazmat-kills', text: 'Kill 15 Enemies in Hazmat Suits (Often Found in Irradiated Areas)', max: 15 },
    ],
  },
  {
    id: 'eyes-everywhere', chapter: 'Counterfeit 2/2', name: 'Eyes Everywhere',
    summary: 'Print a Recon Drone with the recipe from Counterfeit 1/2 and mark ten enemies with it inside the Heavenly Luck Casino.',
    note: 'Operation Silent Ledger is also set in the casino, so both fit in one run.',
    confidence: 'confirmed', sources: ['codcentral-mw4-dmz-orders', 'game8-archives-3', 'dmzcodex-dmz-orders-walkthrough'],
    tasks: [
      { id: 'print-recon-drone', text: 'Print a Recon Drone' },
      { id: 'casino-drone-marks', text: 'Mark 10 Enemies in the Heavenly Luck Casino With a Recon Drone', max: 10 },
    ],
  },
  {
    id: 'operation-silent-ledger', chapter: 'Counterfeit 2/2', name: 'Operation Silent Ledger',
    summary: 'Finish the Operation Silent Ledger story mission. If you already have, the Order ticks itself.',
    confidence: 'confirmed', sources: ['codcentral-mw4-dmz-orders', 'game8-archives-3', 'dmzcodex-dmz-orders-walkthrough'],
    tasks: [
      { id: 'silent-ledger', text: 'Complete the Operation Silent Ledger Story Mission' },
    ],
  },
  {
    id: 'recognition', chapter: 'Page 7', name: 'Recognition',
    summary: 'Get 15 kills with a weapon that has no suppressor inside a High threat area. Critical and Extreme areas count too.',
    confidence: 'confirmed', sources: ['codcentral-mw4-dmz-orders', 'allthings-call-of-duty-modern-warfare-3', 'dmzcodex-dmz-orders-walkthrough'],
    tasks: [
      { id: 'unsuppressed-kills', text: 'Kill 15 Enemies With an Unsuppressed Weapon in a High Threat Level Location', max: 15 },
    ],
  },
  {
    id: 'radiation-station', chapter: 'Page 7', name: 'Radiation Station',
    summary: 'Find a fire station, loot three gas masks or radiation pill bottles, then search five containers while standing in radiation.',
    note: 'Guides used the fire station in Hanrim Village and the containers around the Haneul Nuclear Reactor.',
    confidence: 'confirmed', sources: ['codcentral-mw4-dmz-orders', 'allthings-call-of-duty-modern-warfare-3', 'allthings-how-to-complete-radiation-station'],
    tasks: [
      { id: 'locate-fire-station', text: 'Locate a Fire Station' },
      { id: 'gas-masks-pills', text: 'Loot 3 Gas Masks or Radiation Pill Bottles', max: 3 },
      { id: 'radiation-containers', text: 'Search 5 Containers While in Radiation', max: 5 },
    ],
  },
  {
    id: 'healer', chapter: 'Page 7', name: 'Healer',
    summary: 'Done at the FOB 3D Printer: track the Medkit recipe, then print a Medkit.',
    note: 'A Medkit costs 30 Chemicals, 1 Binding Catalyst and 5 Biomaterials. One guide lists a different Page 10 Order with the same name.',
    confidence: 'confirmed', sources: ['codcentral-mw4-dmz-orders', 'allthings-call-of-duty-modern-warfare-3', 'dmzcodex-dmz-orders-walkthrough'],
    tasks: [
      { id: 'track-medkit-recipe', text: 'Track the Medkit Recipe in the 3D Printer' },
      { id: 'print-medkit', text: 'Print a Medkit' },
    ],
  },
  {
    id: 'hunter', chapter: 'Human Intel 1/2', name: 'Hunter',
    summary: 'Climb a Lieutenant Hunt Tower and use the terminal at the top. You do not have to kill the Lieutenant it points to.',
    confidence: 'confirmed', sources: ['codcentral-mw4-dmz-orders', 'game8-archives-3', 'allthings-mw4-dmz-how-to-complete'],
    tasks: [
      { id: 'climb-hunt-tower', text: 'Locate and Climb a Hunt Lieutenant Tower' },
      { id: 'hunt-tower-terminal', text: 'Use the Terminal at the Top to Locate the Nearest Lieutenant' },
    ],
  },
  {
    id: 'triage-protocol', chapter: 'Human Intel 1/2', name: 'Triage Protocol',
    summary: 'Visit a Clinic, pick up a Bandage and gather 30 Chemicals from medical cabinets or broken-down loot.',
    confidence: 'confirmed', sources: ['codcentral-mw4-dmz-orders', 'game8-archives-3', 'allthings-how-to-complete-triage-protocol'],
    tasks: [
      { id: 'head-to-clinic', text: 'Head to a Clinic' },
      { id: 'loot-bandage', text: 'Loot a Bandage' },
      { id: 'loot-chemicals', text: 'Loot 30 Chemicals', max: 30 },
    ],
  },
  {
    id: 'no-one-left', chapter: 'Human Intel 1/2', name: 'No One Left',
    summary: 'Clear a military compound, then pick up the Medical Extraction Intel that drops once it is clear.',
    note: 'The Clear the Military Compound side op counts for the first task.',
    confidence: 'confirmed', sources: ['codcentral-mw4-dmz-orders', 'game8-archives-3', 'allthings-how-to-complete-no-one', 'dmzcodex-dmz-orders-walkthrough'],
    tasks: [
      { id: 'clear-compound', text: 'Clear a Compound' },
      { id: 'medical-extraction-intel', text: 'Loot Dropped Medical Extraction Intel Found After Clearing a Compound' },
    ],
  },
  {
    id: 'blindness', chapter: 'Human Intel 2/2', name: 'Blindness',
    summary: 'Print four Flash grenades with the recipe from Human Intel 1/2, then kill eight enemies while they are flashed.',
    note: 'Each Flash costs 10 Synthetics and 10 Chemicals.',
    confidence: 'confirmed', sources: ['codcentral-mw4-dmz-orders', 'game8-archives-3', 'allthings-mw4-dmz-how-to-complete-2', 'allthings-call-of-duty-modern-warfare-2'],
    tasks: [
      { id: 'print-flashes', text: 'Print 4 Flash Grenades', max: 4 },
      { id: 'flashed-kills', text: 'Kill 8 Flashed Enemies', max: 8 },
    ],
  },
  {
    id: 'payment-due', chapter: 'Human Intel 2/2', name: 'Payment Due',
    summary: 'Pick up a Dynamic Op phone in the field, then earn $11,500 from Dynamic Ops.',
    note: 'Queuing into Dynamic Ops from the menu does not count as collecting a phone. Partial op payouts count toward the cash.',
    confidence: 'confirmed', sources: ['codcentral-mw4-dmz-orders', 'game8-archives-3', 'allthings-how-to-complete-payment-due', 'allthings-modern-warfare-4-dmz-how'],
    tasks: [
      { id: 'collect-op-phone', text: 'Collect a Dynamic Op Phone' },
      { id: 'dynamic-op-cash', text: 'Earn $11,500 Cash From Completing Dynamic Ops' },
    ],
  },
  {
    id: 'operation-critical-extraction', chapter: 'Human Intel 2/2', name: 'Operation Critical Extraction',
    summary: 'Finish the Operation Critical Extraction story mission. If you already have, the Order ticks itself.',
    confidence: 'confirmed', sources: ['codcentral-mw4-dmz-orders', 'game8-archives-3', 'dmzcodex-dmz-orders-walkthrough'],
    tasks: [
      { id: 'critical-extraction', text: 'Complete the Operation Critical Extraction Story Mission' },
    ],
  },
]

// What each page pays once all three of its Orders are done.
export const dmzOrderRewards = {
  'Page 1': '$20,000 · Medkit · 2-Plate Armor Vest',
  'Underground 1/2': '$20,000 · DDOS, Decoy Grenade and Night Vision Goggles recipes',
  'Underground 2/2': '$20,000 · Basic Restock Kit · Operator Rescue Beacon · Weapon Insurance Contract',
  'Page 4': '$20,000 · Medium Backpack · Ammo Box',
  'Counterfeit 1/2': '$20,000 · Recon Drone recipe · Explosives Equipment Kit',
  'Counterfeit 2/2': '$20,000 · Operator Rescue Beacon · Weapon Insurance Contract',
  'Page 7': '$20,000 · UAV · Armor Box',
  'Human Intel 1/2': '$20,000 · Flash recipe · Basic Triage Kit',
  'Human Intel 2/2': '$20,000 · 3 UAVs · Operator Rescue Beacon · Weapon Insurance Contract',
}

// Orders grouped by their chapter page, in tracker order.
export function dmzOrderChapters(orders = dmzOrders) {
  const chapters = []
  for (const order of orders) {
    const chapter = chapters.find(item => item.title === order.chapter)
    if (chapter) chapter.orders.push(order)
    else chapters.push({ title: order.chapter, inGame: order.proof === 'in-game', reward: dmzOrderRewards[order.chapter], orders: [order] })
  }
  return chapters
}

export const dmzSources = [
  { label: 'Call of Duty: DMZ Deep Dive, Part 2 — How to Play', url: 'https://www.callofduty.com/blog/2026/10/call-of-duty-modern-warfare-4-dmz-how-to-play-forward-operating-base-guide' },
  { label: 'Call of Duty: Modern Warfare 4 DMZ Deep Dive', url: 'https://www.callofduty.com/blog/2026/06/call-of-duty-modern-warfare-4-dmz-deep-dive' },
  { label: 'PlayStation Blog: Everything you need to know about DMZ', url: 'https://blog.playstation.com/2026/10/05/everything-you-need-to-know-about-dmz-mode-in-call-of-duty-modern-warfare-4/' },
  { label: 'Dexerto: Hajin map and all POIs', url: 'https://www.dexerto.com/call-of-duty/hajin-map-in-modern-warfare-4-dmz-and-warzone-revealed-all-pois-3415624/' },
  { label: 'Dexerto: DMZ FOB stations', url: 'https://www.dexerto.com/wikis/modern-warfare-4/dmz-fob-explained/' },
  { label: 'KeenGamer: DMZ deep dive, Hajin and level 70 progression', url: 'https://keengamer.com/articles/news/call-of-duty-modern-warfare-4-dmz-deep-dive-reveals-hajin-level-70-progression-and-more/' },
  { label: 'All Things How: what each FOB station does', url: 'https://allthings.how/call-of-duty-modern-warfare-4-dmz-fob-what-each-station-does-and-when-it-unlocks/' },
]

export const DMZ_ORDERS_KEY = 'codwiki-dmz-orders-v1'

export const dmzTaskMax = task => task.max || 1

// Keeps only known task IDs with whole counts inside each task's range.
export function normalizeDmzOrders(raw) {
  const counts = {}
  const collapsed = {}
  for (const order of dmzOrders) {
    if (raw?.collapsed?.[order.id] === true) collapsed[order.id] = true
    for (const task of order.tasks) {
      const value = Number(raw?.counts?.[task.id])
      counts[task.id] = Number.isInteger(value) ? Math.min(Math.max(value, 0), dmzTaskMax(task)) : 0
    }
  }
  return { counts, collapsed }
}

export function readDmzOrders(raw) {
  try {
    const value = JSON.parse(raw)
    return normalizeDmzOrders(value?.version === 1 ? value : {})
  } catch { return normalizeDmzOrders({}) }
}

export function orderComplete(order, counts) {
  return order.tasks.every(task => (counts[task.id] || 0) >= dmzTaskMax(task))
}

export function orderProgress(counts) {
  const tasks = dmzOrders.flatMap(order => order.tasks)
  return { done: tasks.filter(task => (counts[task.id] || 0) >= dmzTaskMax(task)).length, total: tasks.length }
}

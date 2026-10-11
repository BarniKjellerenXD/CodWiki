const define = (label, icon, family, group) => ({ label, icon, family, group })
export const mapTypes = {
  'power-switch': define('Power switches','Power','green','Power & upgrades'),
  generator: define('Generators','Zap','green','Power & upgrades'),
  'pack-a-punch': define('Pack-a-Punch','Sparkles','green','Power & upgrades'),
  arsenal: define('Arsenal','Wrench','green','Power & upgrades'),
  'upgrade-station': define('Upgrade stations','Wrench','green','Power & upgrades'),
  'armor-station': define('Armor stations','Shield','green','Power & upgrades'),
  'perk-machine': define('Perk machines','CupSoda','blue','Perks'),
  wunderfizz: define('Wunderfizz','CircleDot','blue','Perks'),
  'perk-reward': define('Perk rewards','CupSoda','blue','Perks'),
  'cursed-peeks': define('Cursed Mister Peeks','Rabbit','blue','Perks'),
  'wall-buy': define('Wall weapons','Crosshair','orange','Weapons & supplies'),
  'mystery-box': define('Mystery Box','Package','orange','Weapons & supplies'),
  'ammo-cache': define('Ammo','Boxes','orange','Weapons & supplies'),
  'armor-buy': define('Armor buys','Shield','orange','Weapons & supplies'),
  'crafting-table': define('Crafting tables','Wrench','orange','Weapons & supplies'),
  gobblegum: define('GobbleGum','CircleDot','orange','Weapons & supplies'),
  'fuel-station': define('Fuel stations','Fuel','orange','Weapons & supplies'),
  doghouse: define('Doghouses','Dog','orange','Weapons & supplies'),
  'buildable-part': define('Buildable parts','Puzzle','purple','Parts & collectibles'),
  'quest-item': define('Quest items','Puzzle','purple','Parts & collectibles'),
  key: define('Keys','Key','purple','Parts & collectibles'),
  clue: define('Clues','FileText','purple','Parts & collectibles'),
  'code-symbol': define('Symbols & codes','CircleHelp','purple','Parts & collectibles'),
  'music-item': define('Music items','Music','purple','Parts & collectibles'),
  'dig-site': define('Dig sites','Shovel','purple','Parts & collectibles'),
  collectible: define('Collectibles','FileText','purple','Parts & collectibles'),
  'power-up': define('Hidden power-ups','Sparkles','orange','Weapons & supplies'),
  'door-buy': define('Doors','DoorOpen','gold','Travel & exits'),
  'fast-travel': define('Fast travel','Signpost','gold','Travel & exits'),
  teleporter: define('Teleporters','Orbit','gold','Travel & exits'),
  portal: define('Portals','Orbit','gold','Travel & exits'),
  zipline: define('Ziplines','Signpost','gold','Travel & exits'),
  'launch-pad': define('Launch pads','Signpost','gold','Travel & exits'),
  exfil: define('Exits & exfil','LogOut','gold','Travel & exits'),
  'entry-point': define('Entrances','DoorOpen','gold','Travel & exits'),
  trap: define('Traps','Zap','red','Traps & mechanisms'),
  turret: define('Turrets','Crosshair','red','Traps & mechanisms'),
  workbench: define('Quest workbenches','Wrench','purple','Traps & mechanisms'),
  'ritual-site': define('Ritual sites','Flame','purple','Traps & mechanisms'),
  'quest-mechanism': define('Quest mechanisms','CircleDot','purple','Traps & mechanisms'),
  'fishing-site': define('Fishing spots','Fish','blue','Traps & mechanisms'),
  'challenge-starter': define('Challenges','Flag','purple','Traps & mechanisms'),
  radio: define('Radios','Radio','purple','Parts & collectibles'),
  amplifier: define('Amplifiers','Volume2','purple','Parts & collectibles'),
  orb: define('Orbs','CircleDot','purple','Parts & collectibles'),
  npc: define('Characters','User','neutral','Areas & landmarks'),
  'weapon-crate': define('Weapon crates','Package','orange','Weapons & supplies'),
  'arcade-machine': define('Arcade machines','Gamepad2','purple','Traps & mechanisms'),
  reactor: define('Reactors','Zap','green','Power & upgrades'),
  'collection-unit': define('Collection units','Zap','purple','Traps & mechanisms'),
  robot: define('Robots','Bot','neutral','Areas & landmarks'),
  'teddy-bear': define('Teddy bears','Rabbit','purple','Parts & collectibles'),
  'named-area': define('Areas & rooms','Landmark','neutral','Areas & landmarks'),
  'spawn-area': define('Spawn areas','MapPin','neutral','Areas & landmarks'),
  'boss-arena': define('Boss arenas','Flag','neutral','Areas & landmarks'),
  'reference-landmark': define('Landmarks','Landmark','neutral','Areas & landmarks'),
  area: define('Areas & rooms','Landmark','neutral','Areas & landmarks'),
  quest: define('Quest locations','Puzzle','purple','Parts & collectibles'),
  perk: define('Perks','CupSoda','blue','Perks'),
  upgrade: define('Upgrades','Sparkles','green','Power & upgrades'),
  travel: define('Travel','Signpost','gold','Travel & exits'),
  ammo: define('Ammo','Boxes','orange','Weapons & supplies'),
  equipment: define('Equipment','Wrench','orange','Weapons & supplies'),
  weapon: define('Weapons','Crosshair','orange','Weapons & supplies'),
}
export const locationType = location => location.typeId || (location.perkType === 'mister-peeks' ? 'cursed-peeks' : location.category)
export const typeInfo = type => mapTypes[type] || define(String(type).replace(/[-_]/g,' ').replace(/^./,s=>s.toUpperCase()),'MapPin','neutral','Other locations')
export function buildMapFilters(data) {
  const sets = new Map()
  for (const location of data.locations) {
    const type = locationType(location)
    if (!sets.has(type)) sets.set(type,[])
    sets.get(type).push(location.id)
  }
  const options = [...sets].map(([type,locationIds])=>({id:`type:${type}`,type,locationIds,...typeInfo(type)}))
  for (const group of data.filterGroups || []) for (const filter of group.filters) options.push({id:`activity:${group.id}:${filter.id}`,label:filter.label,icon:'Flag',family:'purple',group:group.label,locationIds:[...new Set(filter.locationIds)],note:filter.note})
  for (const id of new Set(data.locations.flatMap(l=>l.activityIds || []))) {
    if (options.some(o=>o.id===`activity:${id}`)) continue
    options.push({id:`activity:${id}`,label:typeInfo(id).label,icon:'Flag',family:'purple',group:'Quests & activities',locationIds:data.locations.filter(l=>l.activityIds?.includes(id)).map(l=>l.id)})
  }
  return options
}
export function defaultMapFilters(data, options=buildMapFilters(data)) {
  const quiet = options.filter(o=>['area','quest','named-area','spawn-area','pack-a-punch','power-switch','perk-machine'].includes(o.type)).map(o=>o.id)
  return quiet.length ? quiet : options.filter(o=>o.id.startsWith('type:')).slice(0,3).map(o=>o.id)
}
export function filterMapLocations(data,options,checked,query='') {
  const enabled=new Set(checked)
  const ids=new Set(options.filter(o=>enabled.has(o.id)).flatMap(o=>o.locationIds))
  const term=query.trim().toLocaleLowerCase()
  return data.locations.filter(l=>ids.has(l.id)&&matchesMapSearch(l,data,term))
}
export function matchesMapSearch(location,data,term) {
  return !term || [location.label,location.description,typeInfo(locationType(location)).label,location.grid,location.floor,location.state,location.conditions,data.layers.find(l=>l.id===location.layerId)?.label].filter(Boolean).join(' ').toLocaleLowerCase().includes(term.toLocaleLowerCase())
}
export function migrateMapFilters(data, options, saved, current=false) {
  const fallback=defaultMapFilters(data,options)
  if (!saved || typeof saved!=='object' || Array.isArray(saved)) return fallback
  if (current && Array.isArray(saved.checked)) {
    const valid=[...new Set(saved.checked.filter(id=>typeof id==='string'&&options.some(o=>o.id===id)))]
    return saved.checked.length && !valid.length ? fallback : valid
  }
  if (saved.category==='all') return options.filter(o=>o.id.startsWith('type:')).map(o=>o.id)
  if (saved.category==='overview') return fallback
  if (saved.category==='quest-areas') return options.filter(o=>o.type&&data.locations.some(l=>['area','quest'].includes(l.category)&&locationType(l)===o.type)).map(o=>o.id)
  const group=data.filterGroups?.find(g=>g.id===saved.category)
  if (group) {
    const filter=group.filters.find(f=>f.id===saved.subfilter)||group.filters.find(f=>f.id===group.defaultFilter)
    return filter ? [`activity:${group.id}:${filter.id}`] : fallback
  }
  if (saved.category==='perk'&&saved.perkFilter==='mister-peeks'&&options.some(o=>o.type==='cursed-peeks')) return ['type:cursed-peeks']
  const matches=options.filter(o=>o.type&&data.locations.some(l=>l.category===saved.category&&locationType(l)===o.type)).map(o=>o.id)
  return matches.length ? matches : fallback
}

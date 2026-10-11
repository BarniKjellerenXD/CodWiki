// Authored adaptation of pinned DECLASSIFIED data. See cw-implementation.md.
import fs from 'node:fs/promises';
import path from 'node:path';
import { root, research, sourceRoot, layouts, records, upstream } from './prepare-cw-maps.mjs';

const excluded = {
  p3Ots: 'Klaus battery drops from a mobile Krasny Soldat; no fixed location.',
  XFd3U: 'Tempered Crystal Heart drops from a Tormentor killed with fire; no fixed location.',
  mVUTb: 'Energetic Geode can come from any suitable crystal; no fixed location.',
  qRTu_: 'Silo A interior is not represented by the surface Ruka artwork.',
  grcbU: 'Silo B interior is not represented by the surface Ruka artwork.',
  '2GHxO': 'Silo D interior is not represented by the surface Ruka artwork.',
  Fhzza: 'Central silo interior is not represented by the surface Ruka artwork.',
};
const miscTypes = { craftingTable:'crafting-table',rampageInducer:'challenge-starter',exfillRadio:'exfil',
  requiemRadio:'radio',omegaRadio:'radio',maxisRadio:'radio',mysteryBox:'mystery-box',ammoCrate:'ammo-cache',
  aetherTunnel:'fast-travel',workbench:'workbench',papMachine:'pack-a-punch',trialComputer:'challenge-starter',
  arsenal:'arsenal',power:'power-switch',teleporter:'teleporter',collector:'collection-unit',reactor:'reactor',
  jumpPad:'launch-pad',landingPad:'launch-pad',airSupport:'quest-mechanism',zipline:'zipline',ziplineDown:'zipline',
  trap:'trap',klausRadio:'radio',rift:'portal',fishing:'fishing-site' };
const specificTypes = { thermo:'weapon-crate',thermophasic:'weapon-crate',nova5:'weapon-crate',electrobolt:'weapon-crate',
  cryoemitter:'weapon-crate',darkAetherPortal:'portal',dieMaschinePaPPortal:'portal',essenceHarvester:'collection-unit',
  aetherCrystal:'quest-item',monkey:'quest-item',projector:'quest-mechanism',redRift:'portal',maxisQuestRadio:'radio',
  maxisAmp:'amplifier',bunny:'teddy-bear',step2Helicopter:'reference-landmark',step3Orb:'orb',
  cassetteTape:'music-item',dieMaschineAntenna:'quest-mechanism',dieMaschineFloatingBodies:'quest-item',
  dieMaschineOrdaHand:'trap',dieMaschineBonusChest:'orb',firebaseZBonusChest:'teddy-bear',mauerDerTotenBonusChest:'teddy-bear',
  forsakenBonusChest:'arcade-machine',forsakenPizza:'quest-mechanism',dementedEcho:'spawn-area',
  aetherialOrb:'orb',unknownSignal:'radio',unknownSignalAmp:'amplifier',zooMask:'quest-item' };
const questTypes = { questCollectible:'quest-item',mainQuest:'quest-mechanism',secretArea:'entry-point',interactable:'quest-mechanism',
  wonderWeapon:'weapon-crate',wonderWeaponCollectible:'buildable-part',wonderWeaponStep:'quest-mechanism',bossFight:'boss-arena',clue:'clue',bonus:'challenge-starter' };
const typeOverrides = {
  wgKEY:'buildable-part',N29aN:'buildable-part',Kgdjc:'buildable-part',sdUX5:'npc','4HGj2':'npc',I_o9o:'robot',
  G107e:'code-symbol',PwmRS:'code-symbol',muHxa:'code-symbol',WzV96:'upgrade-station',
  '5pm__':'dig-site','3S1gY':'dig-site',WkqxY:'dig-site',N7CSE:'dig-site','27K0v':'dig-site',
  '1QoYt':'buildable-part',aWlqt:'buildable-part',rhCLH:'buildable-part',veYA5:'buildable-part',pKjFl:'teleporter',
  rN5Pg:'buildable-part',Jvfzd:'buildable-part',RV0mf:'buildable-part',VzBDN:'npc',UjJ2J:'npc',
  VMpbM:'arcade-machine',j21QQ:'arcade-machine',vHgbN:'arcade-machine',YCmuv:'arcade-machine',
  '41iYu':'ritual-site',NuoPB:'boss-arena',_dw2s:'boss-arena',BhVQV:'spawn-area',guuWl:'spawn-area',pOuZZ:'spawn-area',
};
// These source pins describe a room, route, candidate dig field or fight rather than a single fixed object.
const areaIds = new Set(['G107e','PwmRS','muHxa','eOTNC','5pm__','3S1gY','mwfRX','50_41','27K0v','1QoYt','aWlqt','rhCLH','veYA5','NuoPB','_dw2s','BcQMe','8tI4t','guuWl','pOuZZ','BhVQV','rRnc1','yNwtb','6Z0wX','8JYiv']);
const roomNotes = {
  G107e:'Service Passage: search the three possible blacklight number positions in this room.',
  PwmRS:'Garment Factory: search the three possible blacklight number positions in this room.',
  muHxa:'Grocery Store: search the three possible blacklight number positions in this room.',
  eOTNC:'Electronics Store: shoot the radios with the CRBR-S until one drops the transistor. The marked room is approximate.',
  '1QoYt':'Video Store back room: one of the room’s possible circuit-board spawns. Search the surfaces inside.',
  aWlqt:'Cinema entrance: one of the room’s possible focusing-lens spawns. Search the room.',
  rhCLH:'TV Store: one of the room’s possible cathode-ray-tube spawns. Search the room.',
  veYA5:'Burger Town: one of the room’s possible fryer-cage spawns. Search the room.',
  '27K0v':'Barracks / Field Hospital dig start. After digging, the crystal teleports within the nearby area; this is not its guaranteed final position.',
  NuoPB:'Legion surface encounter area. Enter through the missile silo and complete its keys and launch sequence first. The underground interior is not mapped.',
  _dw2s:'Excision finale area beyond the bridge. Follow the quest rover, recording and live exfil objective; this pin is not a complete route through the gas.',
  I_o9o:'Klaus in the Safe House. Bring the Hotel 305 hands and the battery dropped by the first Krasny Soldat. The battery has no fixed map pin. Upgrade Klaus at the Garment Factory, and assemble his hacking headgear for the main quest.',
  UjJ2J:'Ronald Raygun’s pizza room. Enter with upgraded Aether Shroud and use the four delivery destinations marked separately.',
};
const labelOverrides = { G107e:'Blacklight code — Service Passage search',PwmRS:'Blacklight code — Garment Factory search',muHxa:'Blacklight code — Grocery Store search',
  VzBDN:'Bubby defense',_dw2s:'Excision finale area',NuoPB:'Legion surface arena',UTXXu:'Pack-a-Punch part room',
  '6WnTv':'Pack-a-Punch part room',CWAYy:'Stopped train — keycard and warhead',H953x:'Missile-silo elevator',
  mwfRX:'RAI K-84 Barracks lockers', '50_41':'RAI K-84 Barracks lockers',
};
const locationId = raw => `dc-${Buffer.from(raw,'utf8').toString('hex')}`;
function physicalType(r) { return typeOverrides[r.id] || (r.file === 'perks' ? (r.type === 'wunderFizz' ? 'wunderfizz' : 'perk-machine') : r.file === 'wallbuys' ? 'wall-buy' : miscTypes[r.type] || specificTypes[r.type] || questTypes[r.type]); }
function availability(r) {
  if (['ruka','alpine','golova','sanatorium','duga','zoo','collateral','armada'].includes(r.sourceMap)
      && ['papMachine','arsenal','craftingTable','trialComputer','mysteryBox','wunderFizz'].includes(r.type)) return 'candidate';
  if (/possible|random|can spawn|one of|1 of 2 places/i.test(r.description) || ['mysteryBox','monkey','bunny','step3Orb','unknownSignalAmp'].includes(r.type) || ['G107e','PwmRS','muHxa','eOTNC','5pm__','3S1gY','1QoYt','aWlqt','rhCLH','veYA5'].includes(r.id)) return 'candidate';
  if (r.file === 'mainQuest' || r.file === 'easterEggs' || /after|dark aether/i.test(r.description)) return 'conditional';
  return 'fixed';
}
const datasets = [];
const bindings = {};
for (const id of [...new Set(layouts.map(l => l[0]))]) {
  const mapLayers = layouts.filter(l => l[0] === id);
  const sourceMaps = new Set(mapLayers.map(l => l[2]));
  const own = records.filter(r => sourceMaps.has(r.sourceMap) && !excluded[r.id]);
  const d = { id, name: mapLayers[0][1], defaultLayer: mapLayers[0][3],
    coverage: { kind:'guide-linked',note: id === 'cw-outbreak'
      ? 'Eight regions with sourced facilities, quest candidates and selected side activities. Missile-silo interiors, moving objectives, random enemy drops and the full Intel collection are not mapped. Match objectives and active spawns vary.'
      : 'Sourced facilities, quest locations and selected side activities on schematic layers. Several floors share one plan; read marker floor and state notes. Random enemy drops and the full Intel collection are not mapped.' },
    sources: [
      { name:'DECLASSIFIED — layouts and published location data',url:'https://declassified.app/',note:'Layout and coordinates by Odinn H, Ben Ashley and DECLASSIFIED contributors; MIT license retained beside each SVG. Pinned source commit e3b8a56f3a4c44a8f9d3fabaf185f5aeac328df0.' },
      { name:'DECLASSIFIED source and MIT license',url:`${upstream}LICENSE`,note:'Source pins use Leaflet CRS.Simple: x = longitude / 512; y = 1 − latitude / 512. All legacy/current overlay geometry matched before import.' },
      { name:'CodWiki authored walkthrough',url:`/guides/${id}`,note:'Quest prerequisites, variable drops and guide anchor interpretation reviewed against the existing walkthrough.' },
    ],
    layers: mapLayers.map(([, , ,layer,label]) => ({ id:layer,label,image:`/maps/${id}/${layer}.svg`,width:512,height:512,
      note: id === 'cw-outbreak' && layer === 'ruka' ? 'Surface region only. The missile-silo elevator is marked, but silos A/B/D and launch controls have no mapped interior. Use the Ravenov guide and launch helper.'
        : `${label} schematic by DECLASSIFIED. Overlapping elevations can share this layer; marker notes identify upstairs, roofs or underground objects.` })),
    locations:own.map(r => {
      const typeId = physicalType(r); if (!typeId) throw new Error(`Unclassified ${r.id} ${r.type}`);
      const layer = mapLayers.find(l => l[2] === r.sourceMap);
      const precision = areaIds.has(r.id) || typeId === 'boss-arena' ? 'area' : 'point';
      const av = availability(r);
      const description = roomNotes[r.id] || r.description || `${r.title} position published by DECLASSIFIED. Use the in-game prompt to confirm availability.`;
      const floorHint = /(?:upstairs|second floor|floor 2|top shelf|on the roof|on top|penthouse|underground|downstairs|under the roof)[^.\n]*/i.exec(description)?.[0];
      return { id:locationId(r.id),sourceId:r.id,label:labelOverrides[r.id] || (r.file === 'wallbuys' ? `${r.title} wall buy` : r.title),
        layerId:layer[3],x:Number((r.loc[1]/512).toFixed(8)),y:Number((1-r.loc[0]/512).toFixed(8)),
        category:typeId,typeId,availability:av,overview:['power-switch','reactor','pack-a-punch','arsenal','wunderfizz'].includes(typeId),
        precision,...(precision === 'area' ? { areaRadius:id === 'cw-outbreak' ? 0.028 : 0.02 } : {}),
        description,source:r.source,...(floorHint ? { floor:floorHint } : {}),
        ...(av !== 'fixed' ? { state:av === 'candidate' ? 'Possible location — confirm the active spawn in your match' : 'Requires the relevant quest, world tier or game state' } : {}),
      };
    }),targets:[],quickLinks:{},filterGroups:[] };
  const target = (key,title,selection,anchors = [],kind,description,guideId=id) => {
    const chosen = typeof selection === 'function' ? own.filter(selection).map(r => r.id) : selection;
    const locationIds = [...new Set(chosen)].map(locationId);
    if (!locationIds.length) throw new Error(`Empty target ${id}/${key}`);
    if (locationIds.some(v => !d.locations.some(l => l.id === v))) throw new Error(`Unknown location in ${id}/${key}`);
    d.targets.push({ id:key,title,locationIds,kind:kind || (locationIds.length === 1 ? 'single' : 'candidates'),...(description ? {description} : {}),...(anchors[0] ? { guideAnchor:anchors[0] } : {}),...(guideId !== id ? {guideId} : {}) });
    bindings[guideId] ||= {};
    for (const a of anchors) { const stepId=a.replace(/^guide-step-/,''); bindings[guideId][stepId] = key; if (guideId === id) d.quickLinks[stepId] = key; }
    return key;
  };
  const byType = (...types) => r => types.includes(r.type);
  target('facilities','Power, upgrades and supplies',r => ['power','reactor','papMachine','arsenal','craftingTable'].includes(r.type));
  if (id === 'cw-die-maschine') {
    target('power-pap','Power and Pack-a-Punch route',r => ['power','papMachine','aetherTunnel'].includes(r.type) || ['LHGAv','UTXXu','6WnTv'].includes(r.id),['guide-step-setup-1']);
    target('die-remote','D.I.E. remote and weapon',['EKc_L','XW3JZ'],['guide-step-setup-2','guide-step-setup-3'],'sequence');
    target('aetherscope','Aetherscope parts and workbench',['wgKEY','N29aN','Kgdjc','azfbH'],['guide-step-scope-1'],'candidates','All three parts are required. Only one is visible at a time; the pickup order changes.');
    target('reflections','Diary reflections and computer',['sHpo9','af5QE','xpxgz','rj9BH','JFz4Z'],['guide-step-scope-2','guide-step-scope-3'],'sequence');
    target('die-cryo','Cryo-Emitter route',['G7SE2','O0QxP','VpIJu'],['guide-step-variants-1'],'sequence');
    target('die-nova','Nova-5 route',['yLQtN','5oG2A','9ySyg'],['guide-step-variants-2'],'sequence');
    target('die-fire','Thermophasic route',['mlZBU','3eput','5M9A0','w_xnt'],['guide-step-variants-3'],'sequence');
    target('die-electric','Electrobolt crystals and crate',['270nl','nS4PT','Vc_0w','nhHde','VNWWl'],['guide-step-variants-4']);
    target('chamber','Medical Bay chamber',['UyMmA','JFz4Z'],['guide-step-chamber-1','guide-step-chamber-3']);
    target('wrench-tank','Wrench reflection and Yard tank',['mR1Ye','fwG9Z','pfJ2L'],['guide-step-chamber-2'],'sequence','The Decontamination Agent itself is not separately pinned. Follow the tank shot and the guide.');
    target('final-photo','Final reflection and family photo',['vm_wB','TbPJZ'],['guide-step-finale-1'],'sequence');
    target('orlov-defense','Orlov defense area',['rRnc1'],['guide-step-finale-2'],'area');
    target('coffin-orbs','Five Coffin Dance orbs',byType('dieMaschineBonusChest'),['guide-step-coffin-orbs']);
    target('hand-trap','Medical Bay hand-trap sightline',byType('dieMaschineOrdaHand'),['guide-step-legendary-buttons']);
    target('music-tapes','Alone cassette tapes',byType('cassetteTape'),['guide-step-music-tapes']);
    target('floating-zombies','Floating zombie search sites',byType('dieMaschineFloatingBodies'),['guide-step-floating-route','guide-step-floating-reward']);
    target('satellite-dishes','Satellite dishes',byType('dieMaschineAntenna'),['guide-step-satellite-route']);
    target('orda-sighting','Orda forest sightline',['8tI4t'],['guide-step-orda-sighting'],'area');
  } else if (id === 'cw-firebase-z') {
    target('reactors','Three Aether Reactors and Pack-a-Punch',byType('reactor','papMachine','teleporter'),['guide-step-setup-1','guide-step-crystals-4']);
    target('rai-parts','RAI K-84 workbench, eye and lockers',['Spi3p','SWJb1','mwfRX','50_41'],['guide-step-setup-2']);
    target('rai-darts','Weapons Lab computer and village dartboard',['SWJb1','sDGIO'],['guide-step-setup-3'],'sequence');
    target('rai-cell','Weapons Lab power-cell charger',['vHAbq'],['guide-step-setup-4']);
    target('truth-serum','Ravenov, Peck and three chemical cabinets',['sdUX5','4HGj2','xkABv','dpWeL','gafr1'],['guide-step-serum-1']);
    target('serum-delivery','Serum mixer and air conditioner',['5PdCL','eu2st'],['guide-step-serum-2'],'sequence');
    target('memory-station','Memory Transference Station',['_56GU'],['guide-step-serum-3','guide-step-memories-1','guide-step-memories-2'],undefined,'This marks the trap dispenser and return station. The three special Mimic search areas are not pinned as exact spawns.');
    target('aethermeter-shovel','OPC, Aethermeter and shovel',['LX_RL','q_skj','8YQJG','bWebw'],['guide-step-memories-3']);
    target('crystal-copies','Open Lot crystal dig site',['N7CSE'],['guide-step-crystals-1'],undefined,'The white-smoke container varies. This marks the dig start, not the correct container among the copies.');
    target('crystal-lockdown','Jungle Defense crystal dig site',['WkqxY'],['guide-step-crystals-2']);
    target('crystal-moving','Barracks moving-crystal search area',['27K0v'],['guide-step-crystals-3'],'area');
    target('satellite-opc','Satellite computer and OPC',['dMdFW','q_skj'],['guide-step-boss-1','guide-step-boss-2'],'sequence');
    target('orda-arena','Village Orda arena',['yNwtb'],['guide-step-boss-3'],'area');
    target('bunny','Village bunny sightline',byType('firebaseZBonusChest'),['guide-step-bunny-loot']);
    target('jump-pads','Jump-pad locations',byType('jumpPad'),['guide-step-pads-start']);
    target('music-tapes','Lost cassette tapes',byType('cassetteTape'),['guide-step-music-tapes']);
  } else if (id === 'cw-mauer-der-toten') {
    target('power-pap','Power and Checkpoint Charlie Pack-a-Punch',byType('power','papMachine'),['guide-step-setup-1','guide-step-setup-3']);
    target('klaus-hands','Hotel 305 hands and safe',['0ZFbr','msude'],['guide-step-klaus-1']);
    target('klaus','Klaus in the Safe House',['I_o9o'],['guide-step-klaus-2']);
    target('klaus-upgrade','Blacklight, dish search and upgrade station',['2wAit','5pm__','3S1gY','WzV96'],['guide-step-klaus-3','guide-step-klaus-4']);
    target('blacklight-codes','Three blacklight code rooms',['PwmRS','G107e','muHxa'],['guide-step-safe-1'],'area','Room-level search areas, in code order 1, 2, 3. Each room has multiple possible number positions; use the photographs.');
    target('crbr-safe','Hotel 305 CRBR-S safe',['msude'],['guide-step-safe-2']);
    target('secret-lab','Secret Lab entrance and equipment',['4QpYx','v9aLr','xLLmm'],['guide-step-safe-3','guide-step-safe-4','guide-step-canisters-2']);
    target('harvesters','Seven possible Essence Harvesters',byType('essenceHarvester'),['guide-step-canisters-1'],'candidates','Only three harvesters are active in a match.');
    target('headgear','Klaus hacking headgear parts',['h8fAY','eOTNC','DwMIE','I_o9o'],['guide-step-canisters-3']);
    target('train','Track controls and stopped train',['GYRE6','CWAYy'],['guide-step-train-1','guide-step-train-2'],'sequence');
    target('satellite-computers','Satellite computer candidates',['HxZ4L','aqK7n','zq5i8'],['guide-step-train-3','guide-step-uranium-1']);
    target('uranium-hvts','Uranium HVT encounter areas',['guuWl','pOuZZ'],['guide-step-uranium-2'],'area');
    target('uranium-ziplines','Uranium ziplines and collision pickup',['suL35','0vSdg','yg8rq'],['guide-step-uranium-3','guide-step-uranium-4']);
    target('valentina','Valentina start and Klaus escort areas',['6Z0wX','BcQMe'],['guide-step-finale-1','guide-step-finale-2'],'area');
    target('klaus-disks','Klaus disk-box candidates',r=>r.title === 'Klaus Disk Box',['guide-step-klaus-symbol','guide-step-klaus-disks']);
    target('bunny-parts','Six nightclub bunny pieces',byType('mauerDerTotenBonusChest'),['guide-step-nightclub-parts']);
    target('music-tapes','Amoeba cassette tapes',byType('cassetteTape'),['guide-step-music-tapes']);
  } else if (id === 'cw-forsaken') {
    target('teleporter-parts','Four teleporter-part search rooms',['1QoYt','aWlqt','rhCLH','veYA5','pKjFl'],['guide-step-setup-1'],'area','Search each marked room for its part; individual spawn surfaces vary.');
    target('power-pap','Power, observation tower and Pack-a-Punch',r=>['power','papMachine'].includes(r.type)||['BhVQV','ae_ve'].includes(r.id),['guide-step-setup-2','guide-step-setup-3']);
    target('chrysalax-core','Polymorphic Crystal Core',['Ja2jc'],['guide-step-chrysalax-core']);
    target('chrysalax-build','Chrysalax water tank',['BjO0P'],['guide-step-chrysalax-build'],undefined,'Heart and geode drops depend on enemy/crystal interactions and have no fixed map pins.');
    target('fuel-tank','Fuel Processing lockdown tank',['Jvfzd'],['guide-step-parts-1']);
    target('housing-unit','Processing housing unit',['rN5Pg'],['guide-step-parts-2']);
    target('monitor','Grand Prix arcade and monitoring-device pickup',['VMpbM','RV0mf'],['guide-step-parts-3'],'sequence');
    target('crystals','Three large Dark Aether crystals',byType('aetherCrystal'),['guide-step-parts-4']);
    target('neutralizer','Aetherium Neutralizer build and escort start',['JCpmh'],['guide-step-escort-1','guide-step-escort-2']);
    target('forsaken-arena','Forsaken boss arena',['8JYiv'],['guide-step-boss-1','guide-step-boss-2'],'area');
    target('pizza-unlock','Ronald Raygun pizza room',['UjJ2J'],['guide-step-pizza-unlock']);
    target('pizza-deliveries','Four pizza delivery destinations',byType('forsakenPizza'),['guide-step-pizza-destinations']);
    target('bubby-landings','PHD landing candidates',['aIGFd','yjPIh','JcFu8'],['guide-step-bubby-landings']);
    target('bubby','Bubby defense',['VzBDN'],['guide-step-bubby-defend']);
    target('arcade','Arcade token dispenser and machines',['j21QQ','E5bOF','SsF1e','YCmuv','VMpbM'],['guide-step-arcade-token','guide-step-arcade-games']);
    target('bar-race','Anytown Grand Prix',['vHgbN'],['guide-step-bar-race']);
    target('pistol-challenge','Pistol shooting challenge',['u2RLm'],['guide-step-pistol-course']);
    target('sniper-challenge','Sniper shooting challenge',['fiK5X'],['guide-step-sniper-course']);
    target('smg-challenge','SMG shooting challenge',['UKMsS'],['guide-step-smg-course']);
  } else {
    target('radio','Maxis quest radios and amplifiers',byType('maxisQuestRadio','maxisAmp'),['guide-step-radio-prep','guide-step-radio-1','guide-step-radio-2'],'candidates','Choose the current region. Requires world tier 3+. These are separate from Unknown Signal music radios.','cw-outbreak-ravenov');
    target('monkeys','Microfilm stone-monkey candidates',byType('monkey'),['guide-step-slides-1'],'candidates','Four candidates per region. Look for the M mark; only the correct monkey drops the slides.','cw-outbreak-ravenov');
    target('projectors','Projectors in seven regions',byType('projector'),['guide-step-slides-2'],'candidates','Ruka has no projector. Carry the slides onward if necessary.','cw-outbreak-ravenov');
    target('silo-entrance','Ruka missile-silo elevator',['H953x'],['guide-step-slides-3'],undefined,'Surface entrance only. Silo A/B/D interiors, keys and launch consoles are not mapped. Use the guide and launch helper.','cw-outbreak-ravenov');
    target('legion','Legion surface arena',['NuoPB'],['guide-step-launch-2','guide-step-launch-3'],'area',undefined,'cw-outbreak-ravenov');
    target('red-rifts','Excision starting red-rift candidates',byType('redRift'),['guide-step-rifts-1'],'candidates','Ground starts only. Sanatorium has no starting rift; airborne rifts and the falling device must be followed in-game.','cw-outbreak-excision');
    target('crash-site','Sanatorium crashed helicopter',byType('step2Helicopter'),['guide-step-rover-1'],undefined,undefined,'cw-outbreak-excision');
    target('red-orbs','Sanatorium quest red-orb candidates',byType('step3Orb'),['guide-step-rover-2'],'candidates','Only one is active. These are not ordinary purple loot orbs. The moving escort route is not pinned.','cw-outbreak-excision');
    target('bunnies','Sanatorium Aether Bunny candidates',byType('bunny'),['guide-step-rover-3'],'candidates',undefined,'cw-outbreak-excision');
    target('excision-finale','Sanatorium finale area',['_dw2s'],['guide-step-exfil-2','guide-step-exfil-3'],'area','Broad destination only. Use the live rooftop recording and exfil objective; no fixed route through the gas is implied.','cw-outbreak-excision');
    for (const [type,region] of [['cryoemitter','alpine'],['electrobolt','duga'],['nova5','golova'],['thermophasic','ruka']]) target(`die-${region}`,`D.I.E. crate — ${region[0].toUpperCase()+region.slice(1)}`,r=>r.file==='easterEggs'&&r.type===type,[`guide-step-die-${region}`]);
    target('pact','Zoo Pact altar',['41iYu'],['guide-step-pact-unlock','guide-step-pact-rewards']);
    target('zoo-masks','Zoo warp masks',byType('zooMask'),['guide-step-pact-mask']);
    target('loot-orbs','Ordinary purple loot-orb candidates',byType('aetherialOrb'),['guide-step-loot-orb']);
    target('music-radios','Unknown Signal radios and amplifiers',byType('unknownSignal','unknownSignalAmp'),['guide-step-music-radio']);
    target('fishing','Fishing spots',byType('fishing'),['guide-step-fishing']);
    d.guideQuickLinks = { 'cw-outbreak-ravenov':bindings['cw-outbreak-ravenov'], 'cw-outbreak-excision':bindings['cw-outbreak-excision'] };
  }
  // Activity sets compose with physical-type toggles without duplicating one POI.
  d.filterGroups.push({ id:'activities',label:'Quests & activities',defaultFilter:d.targets[0].id,
    filters:d.targets.filter(t => t.id !== 'facilities').map(t=>({id:t.id,label:t.title,locationIds:t.locationIds,...(t.description?{note:t.description}:{})})) });
  // Preserve a simple source-linked floor selector; don't force eight region pins into a single map.
  if (id === 'cw-outbreak') d.quickLinks['setup-1'] = 'facilities';
  const ids = new Set(); for (const l of d.locations) { if (ids.has(l.id)) throw new Error(`Duplicate ${l.id}`); ids.add(l.id); }
  datasets.push(d);
  await fs.writeFile(path.join(root,'app/data/maps',`${id}.json`),JSON.stringify(d,null,2)+'\n');
}
await fs.writeFile(path.join(sourceRoot,'guide-bindings.json'),JSON.stringify(bindings,null,2)+'\n');
await fs.writeFile(path.join(sourceRoot,'editorial-exclusions.json'),JSON.stringify(Object.entries(excluded).map(([id,reason])=>({id,reason})),null,2)+'\n');
console.log(JSON.stringify(datasets.map(d=>({id:d.id,layers:d.layers.length,locations:d.locations.length,targets:d.targets.length,quickLinks:Object.keys(d.quickLinks).length})),null,2));

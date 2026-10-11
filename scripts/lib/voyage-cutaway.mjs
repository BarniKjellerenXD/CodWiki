// Original longitudinal region diagram. Height and approximate fore/aft spans
// follow the inspected atlases, including the user's annotated image. These are
// simplified room regions, not traced walls or historical Titanic deck letters.
const atlas = 'https://www.reddit.com/r/CODZombies/comments/9ztkzk/voyage_of_despair_complete_map_with_location/'
const annotatedAtlas = 'https://www.reddit.com/r/CODZombies/comments/cxfzzg/detailed_maps_for_all_black_ops_4_zombies_maps/'
const wiki = 'https://www.reddit.com/r/CODZombies/wiki/voyage-of-despair/'
const routeSource = 'https://www.gamesradar.com/call-of-duty-black-ops-4-zombies-voyage-of-despair-easter-eggs/'
const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const levelId = n => n >= 0 ? `level-${n}` : `level-minus-${-n}`
const short = { Forecastle:'Forecastle', 'Upper Grand Staircase':'Upper stairs', 'Lower Grand Staircase':'Lower stairs', '1st Class Lounge':'Lounge', 'Promenade Port Deck':'Port promenade', 'Promenade Starboard Deck':'Starboard promenade', 'Millionaire Suites':'Suites', '3rd Class Berths':'3rd Class', 'Engine Room':'Engine', 'Boiler Room':'Boiler', 'Turbine Room':'Turbine' }
// [room name, fore/aft start, fore/aft end, visual overlap lane]
const slices = [
  [3,'Bridge / upper decks', [['Bridge',.166,.278],['Upper Grand Staircase',.278,.321],['Boat Deck',.321,.443],['Mid Deck',.443,.559],['Sun Deck',.559,.666],['Aft Decks',.666,.745]]],
  [2,'Lounge / promenades / Sentinel', [['Forecastle',.174,.216],['Upper Grand Staircase',.278,.321],['1st Class Lounge',.321,.489],['Promenade Port Deck',.489,.726],['Promenade Starboard Deck',.489,.726,1],['Aft Decks',.726,.805],['Poop Deck',.956,.976]]],
  [1,'Dining / Galley / decks', [['Forecastle',.054,.207],['Lower Grand Staircase',.249,.350],['Dining Hall',.350,.486],['Galley',.486,.533],['Aft Decks',.753,.805],['Poop Deck',.864,1]]],
  [0,'Cabins / suites / stern', [['Forecastle',.100,.182],['State Rooms',.182,.278],['Lower Grand Staircase',.278,.321],['Millionaire Suites',.278,.359,1],['Poop Deck',.785,.865],['3rd Class Berths',.865,.900]]],
  [-1,'Mail / lowest stairs / berths', [['Mail Rooms',.077,.120],['Lower Grand Staircase',.278,.321],['3rd Class Berths',.750,.911]]],
  [-2,'Mail Rooms / berths', [['Mail Rooms',.069,.120],['3rd Class Berths',.730,.813]]],
  [-3,'Cargo / machinery / Provisions', [['Cargo Hold',0,.142],['Boiler Room',.499,.536],['Engine Room',.536,.682],['Provisions',.682,.818]]],
  [-4,'Machinery upper', [['Boiler Room',.493,.536],['Engine Room',.536,.630],['Turbine Room',.630,.685]]],
  [-5,'Machinery lower', [['Boiler Room',.493,.536],['Engine Room',.536,.652],['Turbine Room',.652,.710]]],
]
const landingLabels = {
  'forecastle-level-1':'Spawn deck',
  'forecastle-level-2':'Stair landings',
  'poop-deck-level-2':'Sentinel platform',
  'poop-deck-level-1':'Pack-a-Punch deck',
  'poop-deck-level-0':'Lower deck / shield bench',
  'lower-grand-staircase-level-minus-1':'Lowest landing / Pack-a-Punch',
}

export function createVoyageCutaway(legacy, guide) {
  const rooms = [...new Set(slices.flatMap(([, , places]) => places.map(p => p[0])))].map(label => ({id:slug(label),label,shortLabel:short[label] || label}))
  const levels = slices.map(([index,label]) => ({id:levelId(index),index,label}))
  const footprints = slices.flatMap(([index,,places]) => places.map(([name,start,end,lane=0]) => {
    const id=`${slug(name)}-${levelId(index)}`
    return {id,roomId:slug(name),levelId:levelId(index),start,end,lane,...(landingLabels[id]?{label:landingLabels[id]}:{})}
  }))
  const at = (room, index) => footprints.filter(f => f.roomId === slug(room) && (index === undefined || f.levelId === levelId(index))).map(f => f.id)
  const connections = []
  const add = (id, from, to, kind, direction, label, note, source=atlas, precision='regional', arrival='level') => connections.push({id,from,to,kind,direction,label,note,source,precision,arrival})
  // Contiguous named regions in the inspected atlas, not exact doorway pins.
  const corridors = [
    [3,'Bridge','Upper Grand Staircase'],[3,'Upper Grand Staircase','Boat Deck'],[3,'Boat Deck','Mid Deck'],[3,'Mid Deck','Sun Deck'],[3,'Sun Deck','Aft Decks'],
    [2,'Upper Grand Staircase','1st Class Lounge'],[2,'1st Class Lounge','Promenade Port Deck'],[2,'1st Class Lounge','Promenade Starboard Deck'],[2,'Promenade Starboard Deck','Aft Decks'],
    [1,'Lower Grand Staircase','Dining Hall'],[1,'Dining Hall','Galley'],
    [0,'Forecastle','State Rooms'],[0,'State Rooms','Lower Grand Staircase'],[0,'Lower Grand Staircase','Millionaire Suites'],[0,'Poop Deck','3rd Class Berths'],
    [-3,'Boiler Room','Engine Room'],[-4,'Boiler Room','Engine Room'],[-4,'Engine Room','Turbine Room'],[-5,'Boiler Room','Engine Room'],[-5,'Engine Room','Turbine Room'],
  ]
  for(const [index,a,b] of corridors)add(`passage-${slug(a)}-${slug(b)}-${levelId(index)}`,at(a,index),at(b,index),'route','both','Room connection','Connected regions in the reference atlas. Corridors and exact doorway positions are simplified; open the relevant doors before travelling.')
  for(const [room,a,b] of [['Aft Decks',3,2],['3rd Class Berths',0,-1],['Engine Room',-3,-4],['Engine Room',-4,-5],['Boiler Room',-3,-4],['Boiler Room',-4,-5],['Turbine Room',-4,-5]])add(`vertical-${slug(room)}-${levelId(a)}`,at(room,a),at(room,b),'route','both','Between room levels','Use the internal route between these levels of the same room. Exact stairs and landing positions are not mapped.')
  // Stair runs visible on the paired slices. Room-level endpoints are supported;
  // their position within each room and door/debris conditions stay schematic.
  for(const [id,a,ai,b,bi] of [
    ['forecastle-lower-stairs','Forecastle',0,'Forecastle',1],
    ['forecastle-upper-stairs','Forecastle',1,'Forecastle',2],
    ['forecastle-bridge-stairs','Forecastle',2,'Bridge',3],
    ['aft-stairs','Aft Decks',2,'Aft Decks',1],
    ['aft-poop-stairs','Aft Decks',1,'Poop Deck',0],
    ['poop-main-stairs','Poop Deck',0,'Poop Deck',1],
    ['poop-sentinel-stairs','Poop Deck',1,'Poop Deck',2],
  ])add(id,at(a,ai),at(b,bi),'stairs','both','Deck stairs','Stair runs in the paired reference slices connect these room levels. Door and debris access may be required; the line does not mark an exact landing.',annotatedAtlas,'level')
  // Stairs are shown as a regional stairwell; landing geometry is not claimed.
  for (const [a,b] of [[3,2],[2,1],[1,0],[0,-1]]) add(`grand-stairs-${a}-${b}`.replaceAll('--','-minus-'), at(a>1?'Upper Grand Staircase':'Lower Grand Staircase',a),at(b>1?'Upper Grand Staircase':'Lower Grand Staircase',b),'stairs','both','Grand Staircase','Use the Grand Staircase between these height levels. Landing positions are schematic.',routeSource)
  for (const [id,a,ai,b,bi] of [
    ['forecastle-mail','Forecastle',0,'Mail Rooms',-1],['mail-down','Mail Rooms',-1,'Mail Rooms',-2],
    ['berths-down','3rd Class Berths',-1,'3rd Class Berths',-2],['berths-provisions','3rd Class Berths',-2,'Provisions',-3],
  ]) add(id,at(a,ai),at(b,bi),'descent','forward','Downward connection','The reference marks this downward level change. The exact stair, ladder or drop and reverse route are not mapped.',atlas,'level')
  add('mail-cargo',at('Mail Rooms',-2),at('Cargo Hold',-3),'route','both','Cargo access','Descend through Mail Rooms and open the Cargo Hold door. The approach is compressed; this is not a measured doorway.',routeSource)
  add('provisions-engine',at('Provisions',-3),at('Engine Room',-3),'route','both','Machinery access','Continue from Provisions into Engine Room; door access may be required.',routeSource)
  // Keep the intervening rooms visible when travelling down the rear of the ship,
  // rather than jumping from Poop Deck to Provisions or Engine -3 to Turbine -5.
  add('promenade-aft',at('Promenade Port Deck',2),at('Aft Decks',2),'route','both','Toward aft decks','Continue along the port route toward Aft Decks. This regional connection does not locate an exact door.','/guides/bo4-voyage-of-despair#guide-step-boss-1')
  const portals = [
    ['forecastle-poop','Forecastle',1,'Poop Deck'],['poop-forecastle','Poop Deck',undefined,'Forecastle'],
    ['suites-provisions','Millionaire Suites',0,'Provisions',-3],['turbine-cargo','Turbine Room',undefined,'Cargo Hold',-3],
    ['cargo-boiler','Cargo Hold',-3,'Boiler Room'],['boiler-boat','Boiler Room',-3,'Boat Deck',3],
    ['boiler-stairs','Boiler Room',-5,'Lower Grand Staircase'],['mid-engine','Mid Deck',3,'Engine Room'],
  ]
  for(const [id,a,ai,b,bi] of portals){
    add(`portal-${id}`,at(a,ai),at(b,bi),'portal','forward','Fast travel',`500 points. Activate the Sentinel Artifact and check destination access.${bi===undefined?' Arrival level is not mapped; all source-listed levels of the destination room are highlighted.':''}${ai===undefined?' The departure landing is not pinned.':''}`,wiki,'regional',bi===undefined?'room':'level')
    connections.at(-1).cost=500
  }
  const cutaway={kind:'ship',defaultFootprint:at('Forecastle',1)[0],levels,rooms,footprints,connections}
  const point = f => ({x:.08 + ((f.start+f.end)/2)*.86,y:.12 + levels.findIndex(l=>l.id===f.levelId)*.088})
  const locations=rooms.map(room=>({id:`area-${room.id}`,label:room.label,layerId:'overview',...point(footprints.find(f=>f.roomId===room.id)),category:'area',typeId:'named-area',precision:'area',overview:true,activityIds:['navigation'],roomIds:[room.id],floor:footprints.filter(f=>f.roomId===room.id).map(f=>levels.find(l=>l.id===f.levelId).index).join(', '),description:`${room.label} on the ship cutaway. Height and approximate fore/aft position follow the reference floor plans. Select a level to inspect this room and its documented connections.`,source:annotatedAtlas}))
  const serviceRooms={sentinel:['Poop Deck',2],'pap-poop':['Poop Deck',1],'pap-stairs':['Lower Grand Staircase',-1],'pap-cargo':['Cargo Hold',-3],'pap-turbine':['Turbine Room',-5],'shield-bench':['Poop Deck',0],'distillation-bench':['Engine Room',-3],'cargo-valve':['Cargo Hold',-3],'boiler-valve':['Boiler Room']}
  for(const old of legacy.locations.filter(l=>l.category!=='area')){
    const [room,index]=serviceRooms[old.id], ids=at(room,index)
    const description=old.description.replace('This marker identifies the named region on a diagram, not a measured object coordinate.','Shown at room precision; the object coordinate is not measured.')
    locations.push({...old,...point(footprints.find(f=>f.id===ids[0])),roomIds:[slug(room)],...(index===undefined?{}:{footprintIds:ids}),floor:index===undefined?'Room spans several height levels':`Level ${index>0?'+':''}${index}`,description, ...(old.typeId==='pack-a-punch'?{availability:'candidate',conditions:'Possible pedestal site; only the active site has the machine.'}:{})})
  }
  const steps=[...guide.phases,...guide.sidePhases].flatMap(p=>p.steps)
  const aliases={ 'area-upper':['Bridge','State Rooms','1st Class Lounge'], 'area-poop':['Poop Deck'], 'area-mail':['Mail Rooms'], 'area-stairs':['Upper Grand Staircase','Lower Grand Staircase'], 'area-berths':['3rd Class Berths','Provisions'], 'area-cargo':['Cargo Hold'], 'area-turbine':['Turbine Room'], 'area-engine':['Engine Room','Boiler Room'] }
  const expandedIds=id=>aliases[id]?.map(name=>`area-${slug(name)}`)||[id]
  const targets=legacy.targets.map(target=>{
    const step=steps.find(s=>`guide-${s.id}`===target.id)
    const text=[step?.text,step?.note,...(step?.bullets||[])].join(' ').toLowerCase()
    const named=rooms.filter(room=>text.includes(room.label.toLowerCase()) || (room.label.includes('Grand Staircase')&&text.includes('grand staircase'))).map(room=>`area-${room.id}`)
    return {...target,locationIds:[...new Set([...target.locationIds.filter(id=>!id.startsWith('area-')), ...(named.length?named:target.locationIds.filter(id=>id.startsWith('area-')).flatMap(expandedIds))])],description:'Relevant rooms and service areas on the ship cutaway. Room-level positions and regional connections are schematic.'}
  })
  for(const [id,names] of Object.entries(aliases))if(!locations.some(l=>l.id===id))targets.push({id,title:names.join(' / '),kind:'area',locationIds:names.map(name=>`area-${slug(name)}`),description:'Saved regional link expanded into its individual rooms.'})
  return {...legacy,coverage:{kind:'schematic',note:'Ship cutaway aligned to the reference floor plans. Room shapes are simplified; port and starboard overlap. Dashed links show regional routes. Pack-a-Punch pins are possible pedestal sites.'},cutaway,locations,targets,sources:[...legacy.sources,{name:'TRPG Voyage height atlas',url:atlas,note:'Reference for relative height slices (+3 to −5) and approximate room spans.'},{name:'Annotated Voyage floor plans',url:annotatedAtlas,note:'RayPoopertonIII / TRPG reference: stair runs, spawn deck and separate Sentinel platform. Original CodWiki cutaway; no map artwork copied.'},{name:'Voyage travel and water reference',url:wiki},{name:'Voyage regional descent walkthrough',url:routeSource}],layers:[{id:'overview',label:'Ship cutaway · all levels',image:'/maps/bo4-voyage-of-despair/overview.svg',width:1600,height:1000}]}
}

export function renderVoyageCutaway(data){
 const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
 const rows=data.cutaway.levels.map((l,i)=>{
   const places=data.cutaway.footprints.filter(f=>f.levelId===l.id)
   const shapes=places.map((f,n)=>`<rect x="${120+f.start*1370}" y="${100+i*88+f.lane*28}" width="${(f.end-f.start)*1370}" height="26" rx="4" fill="#35424b" stroke="#9aabaf"/><text x="${120+(f.start+f.end)/2*1370}" y="${119+i*88+f.lane*28}" text-anchor="middle" fill="#f2eee4" font-size="15">${n+1}</text>`).join('')
   const key=places.map((f,n)=>`${n+1} ${data.cutaway.rooms.find(r=>r.id===f.roomId).shortLabel}${f.label?' ('+f.label+')':''}`).join(' · ')
   return `<text x="30" y="${135+i*88}" fill="#ead4a2" font-size="24">${l.index>0?'+':''}${l.index}</text>${shapes}<text x="120" y="${174+i*88}" fill="#d5dde0" font-size="13">${escape(key)}</text>`
 }).join('')
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000"><rect width="1600" height="1000" fill="#181f25"/><text x="30" y="45" fill="#ead4a2" font-size="28">Voyage of Despair · Ship cutaway</text><path d="M105 80H1550L1500 920H155Q105 920 105 780Z" fill="#252e35" stroke="#667581"/>${rows}<text x="30" y="970" fill="#c4cacf" font-size="18">Bow left · Stern right · Relative heights · Simplified room regions from the reference floor plans</text></svg>\n`
}

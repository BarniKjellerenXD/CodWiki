/** Original, partial regional diagrams. Every line represents a guide-described
 * route or transport connection; no creator artwork or surveyed geometry copied. */
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { voyage } from '../shared/bo4-voyage.mjs'
import { bloodOfTheDead } from '../shared/blood-of-the-dead.mjs'
import { guides as ixAncient } from '../shared/bo4-ix-ancient.mjs'
import { guides as nightClassified } from '../shared/bo4-night-classified.mjs'
import { guides as alphaTag } from '../shared/bo4-alpha-tag.mjs'
import { renderMapSchematic } from './lib/map-schematic.mjs'
import { createVoyageCutaway, renderVoyageCutaway } from './lib/voyage-cutaway.mjs'

const root = process.cwd()
const write = (relative, text) => { const file=path.join(root,relative); fs.mkdirSync(path.dirname(file),{recursive:true}); if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==text) fs.writeFileSync(file,text) }
const n=(id,label,x,y,match,floor='Region')=>({id,label,x,y,match,floor})
const e=(from,to,evidence,kind='path',label='Route · rooms omitted')=>({from,to,evidence,kind,label})
const p=(id,label,node,typeId,steps,note='')=>({id,label,node,typeId,steps:steps.split(','),note})
const guides=[voyage,bloodOfTheDead,...ixAncient,...nightClassified,...alphaTag].filter(g=>g.id!=='bo4-tag-der-toten')
const layouts={
  'bo4-voyage-of-despair': {
    nodes:[n('forecastle','Forecastle',.16,.24,'Forecastle','Forward deck'),n('upper','Bridge / upper decks',.5,.24,'Bridge|upper decks|State Rooms|Staterooms|1st Class Lounge','Upper ship'),n('poop','Poop Deck',.84,.24,'Poop Deck','Rear deck'),n('mail','Mail Rooms',.16,.51,'Mail Rooms','Forward interior'),n('stairs','Grand Staircase',.5,.51,'Grand Staircase','Upper + lower levels'),n('berths','Provisions / 3rd Class',.84,.51,'Provisions|3rd Class Berths','Rear interior'),n('cargo','Cargo Hold',.16,.78,'Cargo Hold','Flooded / drained'),n('turbine','Turbine Room',.5,.78,'Turbine Room','Lower rear'),n('engine','Engine / Boiler rooms',.84,.78,'Engine Room|Boiler Room','Lower rear')],
    edges:[e('forecastle','upper','setup-1'),e('upper','poop','setup-1'),e('mail','cargo','clocks-1','path','Cargo doorway'),e('berths','poop','setup-shield','path','Stairs'),e('turbine','engine','setup-1','path','Adjacent machinery rooms')],
    essentials:[p('sentinel','Sentinel Artifact','poop','quest-mechanism','setup-1'),p('pap-poop','PaP pedestal · Poop Deck','poop','pack-a-punch','setup-1'),p('pap-stairs','PaP pedestal · lower stairs','stairs','pack-a-punch','setup-1'),p('pap-cargo','PaP pedestal · Cargo Hold','cargo','pack-a-punch','setup-1'),p('pap-turbine','PaP pedestal · Turbine','turbine','pack-a-punch','setup-1,pipes-artifact'),p('shield-bench','Shield workbench','poop','workbench','setup-shield'),p('distillation-bench','Distillation Kit workbench','engine','workbench','setup-2,distillery-parts'),p('cargo-valve','Cargo drain valve','cargo','quest-mechanism','setup-drain'),p('boiler-valve','Boiler drain valve','engine','quest-mechanism','setup-drain')],
    note:'Partial multi-deck route diagram. Bridge, State Rooms and Lounge are grouped under upper decks; internal stairs and many rooms are omitted. PaP markers are possible machine pedestals, not four active machines. Flooding changes access, not schematic placement.',
  },
  'bo4-ix': {
    nodes:[n('arena','Arena',.5,.23,'Arena','Surface'),n('danu','Danu tower',.17,.42,'Danu|Arboretum','Three floors'),n('ra','Ra tower',.17,.68,'Ra (?:Altar|Tower)|Ra’s|Ra\u2019s|Ra tower|Ra Altar|Burial Chamber','Three floors'),n('odin','Odin tower',.83,.42,'Odin','Three floors'),n('zeus','Zeus tower',.83,.68,'Zeus|Bath House','Three floors'),n('temple','Temple',.5,.57,'Temple|Pack-a-Punch','Underground'),n('pit','The Pit',.37,.81,'The Pit','Underground'),n('crypt','Flooded Crypt',.63,.81,'Flooded Crypt','Underground')],
    edges:[e('danu','ra','setup-1','path','Tower-pair bridge'),e('odin','zeus','setup-1','path','Tower-pair bridge'),e('arena','zeus','setup-2','path','Arena doorway'),e('ra','temple','setup-1','path','Underground corridors'),e('zeus','temple','setup-1','path','Underground corridors')],
    essentials:[p('banners','Challenge banners / podium','arena','challenge-starter','setup-1'),p('danu-gong','Danu gong & champion','danu','challenge-starter','setup-1'),p('ra-gong','Ra gong & champion','ra','challenge-starter','setup-1'),p('odin-gong','Odin gong & champion','odin','challenge-starter','setup-1'),p('zeus-gong','Zeus gong & champion','zeus','challenge-starter','setup-1'),p('pap','Temple Pack-a-Punch altar','temple','pack-a-punch','setup-1'),p('shield-bench','Brazen Bull workbench','pit','workbench','setup-2'),p('skull-grinders','Skull-grinder search area','crypt','quest-mechanism','danu-1,danu-grinder-locations','Three candidate recesses; consult the photographs.'),p('danu-fertilizer','Danu fertilizer ritual','danu','ritual-site','danu-plant'),p('zeus-bowl','Fertilizer bowl','zeus','quest-mechanism','danu-2')],
    note:'The four towers each combine three floors. Named bridges and underground routes are compressed; Pit/Crypt interior links are not asserted. Diagram directions and distances are illustrative, and every object marker is an area reference.',
  },
  'bo4-blood-of-the-dead': {
    nodes:[n('spawn','Spawn / West Grounds',.16,.24,'Power House|Richtofen.{1,2}s Laboratory|Laboratory|New Industries|West Grounds|Model Industries','Spawn buildings'),n('catwalk','Catwalk',.5,.24,'Catwalk','Connecting route'),n('yard','Recreation Yard',.84,.24,'Recreation Yard','Prison approach'),n('cells','Cell Block / Michigan',.84,.51,'Cell Block|Michigan Avenue|C-D Street|Times Square|Library','Prison floors'),n('wardens','Warden’s House / Eagle',.5,.51,'Warden.{1,2}s House|Warden.{1,2}s Office|Ritual Room|Eagle Plaza','House + nearby plaza'),n('citadel','Citadel Tunnels',.16,.51,'Citadel','Prison lower route'),n('docks','Docks / Building 64',.16,.79,'Docks|Building 64','Waterfront'),n('showers','Showers',.5,.79,'Showers','Lower prison'),n('roof','Roof / Infirmary',.84,.79,'Roof|Infirmary','Upper prison')],
    edges:[e('spawn','catwalk','setup-1','path','Cross Catwalk'),e('catwalk','yard','setup-1','path','Prison approach'),e('yard','cells','side-magma-route','path','Cell Block entrance'),e('cells','wardens','side-magma-route','path','Michigan → Eagle'),e('cells','docks','setup-1','path',''),e('wardens','showers','setup-1','teleport','House ↔ Showers')],
    essentials:[p('power-spawn','Power House switch','spawn','power-switch','setup-1'),p('power-docks','Building 64 switch','docks','power-switch','setup-1'),p('pap-roof','Roof PaP / voltmeter','roof','pack-a-punch','setup-1'),p('pap-spawn','Power House PaP candidate','spawn','pack-a-punch','setup-1'),p('pap-docks','Building 64 PaP candidate','docks','pack-a-punch','setup-1'),p('shield-cell','Cell Block 3rd-floor bench','cells','workbench','setup-1'),p('shield-docks','Docks workbench','docks','workbench','setup-1'),p('citadel-pad','Citadel number pad','citadel','code-symbol','setup-spoon,birds-2,birds-3,side-song'),p('ritual-chair','Ritual Room chair','wardens','quest-mechanism','setup-2,birds-3,finale-1'),p('lab-map','Laboratory quest map','spawn','quest-mechanism','setup-3,finale-1')],
    note:'Blood of the Dead only. Several spawn buildings and prison floors are grouped into regions. Paths represent the stated route with intermediate rooms omitted. Roof and Citadel exact stair connections are not drawn. PaP can move between its three areas.',
  },
  'bo4-classified': {
    nodes:[n('offices','Main Offices / hallways',.18,.25,'Main Offices|Central Filing|Side Passage|Deserted Hallway|Offices','Upper floor'),n('war','War Room / Server Room',.5,.47,'War Room|Server Room|DEFCON','Middle floor'),n('labs','Laboratories / Morgue',.82,.70,'Laborator|Morgue|Weapon Testing','Lower floor'),n('panic','Panic Room',.82,.25,'Panic Room','Separate room'),n('groom','Groom Lake',.18,.77,'Groom Lake','Separate destination')],
    edges:[e('offices','war','setup-1','teleport','Elevator'),e('war','labs','setup-1','teleport','Lower elevator'),e('war','panic','classified-pad','teleport','DEFCON 5 / pre-install'),e('war','groom','setup-2','teleport','Amplifier + DEFCON 5')],
    essentials:[p('power','South Labs power switch','labs','power-switch','setup-1'),p('shield','Weapon Testing shield bench','labs','workbench','setup-1,classified-bench'),p('defcon','Four DEFCON switches','war','quest-mechanism','classified-pad,classified-kino'),p('amplifier-pad','Amplifier pad search','offices','buildable-part','classified-pad'),p('amplifier-wires','Amplifier wire search','labs','buildable-part','classified-pad'),p('amplifier-part','Panic Room amplifier','panic','buildable-part','classified-pad'),p('teleporter','War Room teleporter','war','teleporter','setup-2'),p('pap','Groom Lake Pack-a-Punch','groom','pack-a-punch','setup-2'),p('code-machine','Four-code submission machine','war','code-symbol','codes-2'),p('howl','Winter’s Howl reward case','groom','weapon-crate','codes-3')],
    note:'Classified floor/transport diagram, not the BO1 Five layout. Labs and office side rooms are grouped. Before amplifier installation the main teleporter reaches Panic Room; afterward use the Server Room link at DEFCON 5. Groom Lake is not adjacent floor space.',
  },
  'bo4-dead-of-the-night': {
    nodes:[n('smoking','Smoking Room',.17,.24,'Smoking Room','Mansion'),n('hall','Main Hall / galleries',.5,.24,'Main Hall|Grand Staircase|Entrance Hall|East Gallery|West Gallery|Billiards','Mansion'),n('bedrooms','Bedrooms / Dining route',.83,.24,'Master Bedroom|Bedroom Hallway|Trophy Room|Music Room|Dining Room|Tea Room','Multiple mansion rooms'),n('library','Library / Study',.17,.51,'Library|Study','Mansion'),n('terrace','Forest Terrace',.5,.51,'Forest Terrace','Gate approach'),n('cellar','Wine Cellar',.83,.51,'Wine Cellar','Lower mansion'),n('cemetery','Cemetery / Mausoleum',.17,.79,'Cemetery|Mausoleum','Outside'),n('forest','Forest',.5,.79,'Forest(?! Terrace)|Forest paths|Forest door','Outside'),n('gardens','Gardens / Greenhouse',.83,.79,'Gardens|Greenhouse|Laboratory','Outside / laboratory')],
    edges:[e('smoking','library','knights-2','path','Fireplace route'),e('library','hall','knights-2','path','To Billiards'),e('hall','cemetery','effigy-1','path','Mansion → Cemetery Path'),e('terrace','forest','setup-3','path','Three-fork gate')],
    essentials:[p('sentinel','Grand Staircase Artifact','hall','quest-mechanism','setup-1'),p('shield','Ballistic Shield bench','smoking','workbench','setup-shield'),p('silver-smelter','Silver melting bench','cellar','workbench','weapons-1'),p('silver-bullets','Silver bullet bench','library','workbench','weapons-1'),p('folly','Alistair’s Folly case','library','weapon-crate','weapons-2'),p('processing','Materia processing machine','gardens','quest-mechanism','weapons-3,weapons-7'),p('upgrade-benches','Wonder weapon upgrade benches','gardens','workbench','weapons-3,weapons-7'),p('forest-gate','Forest gate','terrace','door-buy','setup-3'),p('pap','Forest Pack-a-Punch','forest','pack-a-punch','setup-3'),p('stake-bench','Cemetery Path Stake bench','cemetery','workbench','stake-craft')],
    note:'Partial mansion/outdoor diagram. Connections shown are explicitly described routes, often through omitted rooms. Bedroom/Dining, Cemetery/Mausoleum and Gardens/Greenhouse are search regions, not single rooms. Fixed point or complete candidate coverage is not claimed.',
  },
  'bo4-ancient-evil': {
    nodes:[n('apollo','Temple of Apollo',.17,.24,'Temple of Apollo|Temple flame|Eternal Flame|Ra perk','Main city'),n('amphitheater','Amphitheater',.5,.24,'Amphitheater|theater entrance','Main city'),n('market','Marketplace / Attalids',.83,.24,'Marketplace|Offering of the Attalids|sundial','Main city'),n('stoa','Stoa / Treasuries',.17,.51,'Stoa|Treasuries','Main city'),n('spartan','Spartan Monument',.5,.51,'Spartan Monument','Pegasus departure'),n('riverpass','River Pass / Upper Road',.83,.51,'River Pass|Upper Road','Main city'),n('sorrow','River of Sorrow',.17,.79,'River of Sorrow','Dark Side'),n('cliffs','Python Pass / Cliff Ruins',.5,.79,'Python Pass|Cliff Ruins','Dark Side'),n('center','Center of the World',.83,.79,'Center of the World|behind Pack-a-Punch','Dark Side')],
    edges:[e('stoa','spartan','flame-oil','path','Descending Stoa stairs'),e('spartan','sorrow','setup-2','drop','Outbound Pegasus ride'),e('sorrow','cliffs','boss-1','path','Venom Trap route'),e('cliffs','center','setup-2','path','Dark Side route')],
    essentials:[p('artifact','Sentinel Artifact','amphitheater','quest-mechanism','setup-1'),p('shield','Apollo’s Will workbench','market','workbench','setup-2'),p('bridle','Golden Bridle candidates','stoa','quest-item','setup-1'),p('pegasus','Pegasus departure circle','spartan','fast-travel','setup-2'),p('eagles','Two eagle cage regions','cliffs','quest-mechanism','setup-2'),p('pap','Pack-a-Punch','center','pack-a-punch','setup-2'),p('flame','Eternal Flame / tribute bowls','apollo','ritual-site','flame-1,flame-oil'),p('ballista','Ballista / symbol door','sorrow','quest-mechanism','ballista-door,boss-1'),p('boss-portal','Boss portal entrance','center','portal','ballista-ready')],
    note:'Partial main-city / Dark Side diagram. The Pegasus arrow shows the documented outbound ride. Post-PaP portal destinations and the separate boss islands are not drawn. Shrine and Dormant Hand locations remain guide/photo references rather than fabricated pins.',
  },
  'bo4-alpha-omega': {
    nodes:[n('power','Cul-de-sac / Power House',.17,.24,'Cul-de-sac|Power House','Surface'),n('operations','Operations',.83,.24,'Operations|Rushmore','Surface + upstairs'),n('prisoner','Prisoner Holding',.5,.24,'Prisoner Holding','Surface'),n('houses','Yellow / Green House',.17,.81,'Yellow House|Green House','Surface + upstairs'),n('transfusion','Transfusion / Interrogation',.5,.81,'Transfusion Facility|APD Interrogation','Surface'),n('apd','APD Control / Solitary',.83,.5,'APD Control|Solitary','Bunker'),n('generators','Generators',.17,.54,'Generators|ventilation console','Bunker'),n('beds','Beds',.5,.48,'Beds','Bunker'),n('storage','Storage / Diner / Lounge',.83,.79,'Storage|Diner|Lounge','Bunker')],
    edges:[e('power','generators','setup-1','path','Enter bunker / route'),e('generators','beds','telepads-parts','path','Beds tunnel'),e('generators','storage','extras-1','path','Storage tunnel'),e('power','prisoner','tasks-2','teleport','Player-placed Telepads'),e('prisoner','operations','tasks-2','path','Core delivery run')],
    essentials:[p('power-switch','Power House switch','power','power-switch','setup-1,tasks-3'),p('ventilation','Ventilation lockdown console','generators','quest-mechanism','setup-1'),p('pap','Beds Pack-a-Punch','beds','pack-a-punch','setup-1'),p('rushmore','Rushmore terminal','operations','quest-mechanism','setup-2,clocks-3'),p('knuckles','Galvaknuckles wall-buy','power','wall-buy','setup-2'),p('green-bench','Green House Upstairs bench','houses','workbench','setup-shield,telepads-parts'),p('apd-bench','APD Control workbench','apd','workbench','setup-shield,telepads-parts'),p('mark-ii-bench','Ray Gun Mark II variant bench','operations','workbench','extras-1'),p('server-origin','Power House server core','power','quest-mechanism','tasks-2'),p('server-target','Operations server slot','operations','quest-mechanism','tasks-2')],
    note:'Alpha Omega only, with surface and bunker regions grouped separately. The dashed Power House–Prisoner Holding connection requires player-placed Telepads. Exact house doors, bunker corridors, moving enemies and randomized active vents are not plotted.',
  },
}

const summary=[], edgeEvidence=[]
const allSteps=g=>[...g.phases.map(p=>({...p,activity:'main-quest'})),...g.sidePhases.map(p=>({...p,activity:'side-quests'}))].flatMap(phase=>phase.steps.map(step=>({phase,step})))
const textOf=s=>[s.text,...(s.bullets||[])].join(' ')
const matches=(node,s)=>new RegExp(`\\b(?:${node.match})\\b`,'i').test(textOf(s))
const categoryFor=t=>({'named-area':'area','power-switch':'upgrade','pack-a-punch':'upgrade',workbench:'equipment',teleporter:'travel','fast-travel':'travel',portal:'travel','door-buy':'travel','wall-buy':'weapon','weapon-crate':'weapon'}[t]||'quest')
// Detect a route drawn through an unrelated region card; that would falsely
// suggest an extra physical connection even on a not-to-scale diagram.
function crossesCard(a,b,node){
  const start=[a.x*1400,a.y*980], delta=[(b.x-a.x)*1400,(b.y-a.y)*980]
  const min=[node.x*1400-124,node.y*980-70], max=[node.x*1400+124,node.y*980+71]
  let lo=0,hi=1
  for(let axis=0;axis<2;axis++){
    if(Math.abs(delta[axis])<1e-9){if(start[axis]<min[axis]||start[axis]>max[axis])return false;continue}
    const first=(min[axis]-start[axis])/delta[axis],last=(max[axis]-start[axis])/delta[axis]
    lo=Math.max(lo,Math.min(first,last));hi=Math.min(hi,Math.max(first,last))
    if(lo>hi)return false
  }
  return lo<=hi
}
for(const guide of guides){
  const layout=layouts[guide.id], steps=allSteps(guide), stepById=new Map(steps.map(s=>[s.step.id,s.step]))
  assert.ok(layout,`Missing ${guide.id}`)
  for(const edge of layout.edges){
    const step=stepById.get(edge.evidence)
    assert.ok(step,`Missing route evidence ${guide.id}/${edge.evidence}`)
    const from=layout.nodes.find(n=>n.id===edge.from),to=layout.nodes.find(n=>n.id===edge.to)
    assert.ok(from&&to,`${guide.id}: missing edge endpoint`)
    for(const node of layout.nodes.filter(n=>n.id!==edge.from&&n.id!==edge.to))assert.ok(!crossesCard(from,to,node),`${guide.id}: ${edge.from}–${edge.to} crosses unrelated ${node.id}`)
    if(guide.id!=='bo4-voyage-of-despair')edgeEvidence.push({mapId:guide.id,...edge,source:`/guides/${guide.id}#guide-step-${step.id}`,sourceText:textOf(step),interpretation:'Regional route or transport, not a claim of direct room adjacency. Intermediate rooms can be omitted.'})
  }
  const locations=layout.nodes.map(node=>{
    const first=steps.find(({step})=>matches(node,step))?.step
    assert.ok(first,`Unreferenced region ${guide.id}/${node.id}`)
    return {id:`area-${node.id}`,label:node.label,layerId:'overview',x:node.x,y:node.y+.029,category:'area',typeId:'named-area',precision:'area',areaRadius:.035,overview:true,activityIds:['navigation'],floor:node.floor,description:`Region on an original schematic; spacing and angles are illustrative. ${layout.note} ${first.quick||first.text}`,source:`/guides/${guide.id}#guide-step-${first.id}`}
  })
  const membersByStep=new Map(), counts=new Map()
  for(const pin of layout.essentials){
    const node=layout.nodes.find(n=>n.id===pin.node)
    assert.ok(node,`Missing region ${guide.id}/${pin.node}`)
    for(const id of pin.steps)assert.ok(stepById.has(id),`Missing pin evidence ${guide.id}/${id}`)
    const count=counts.get(node.id)||0; counts.set(node.id,count+1)
    const offsets=[[-.047,.048],[.047,.048],[-.06,.013],[.06,.013],[0,.06]]
    const [dx,dy]=offsets[count%offsets.length]
    locations.push({id:pin.id,label:pin.label,layerId:'overview',x:node.x+dx,y:node.y+dy,category:categoryFor(pin.typeId),typeId:pin.typeId,precision:'area',areaRadius:.022,overview:true,activityIds:['essentials'],floor:node.floor,availability:'conditional',description:`${pin.note?pin.note+' ':''}${textOf(stepById.get(pin.steps[0]))} This marker identifies the named region on a diagram, not a measured object coordinate.`,source:`/guides/${guide.id}#guide-step-${pin.steps[0]}`})
    for(const id of pin.steps){if(!membersByStep.has(id))membersByStep.set(id,[]);membersByStep.get(id).push(pin.id)}
  }
  const targets=[],quickLinks={}
  const fullGuide=fs.readFileSync(path.join(root,`app/components/guide/${guide.id}.vue`),'utf8')
  for(const {phase,step} of steps){
    const named=layout.nodes.filter(node=>matches(node,step)).map(node=>`area-${node.id}`)
    const ids=[...new Set([...(membersByStep.get(step.id)||[]),...named])]
    if(!ids.length)continue
    assert.ok(fullGuide.includes(`id="guide-step-${step.id}"`),`${guide.id}: no full anchor ${step.id}`)
    const id=`guide-${step.id}`
    targets.push({id,title:step.quick||phase.title,kind:'area',locationIds:ids,guideAnchor:`guide-step-${step.id}`,description:'Relevant named regions and authored service areas. Exact item positions, room geometry and unshown routes are not implied.'})
    quickLinks[step.id]=id
    for(const location of locations.filter(l=>ids.includes(l.id)))location.activityIds=[...new Set([...location.activityIds,phase.activity])]
  }
  assert.ok(targets.length)
  assert.equal(new Set(locations.map(l=>l.id)).size,locations.length)
  assert.ok(locations.every(l=>l.x>0&&l.x<1&&l.y>0&&l.y<1))
  const dataset={id:guide.id,name:guide.name,defaultLayer:'overview',coverage:{kind:'schematic',note:layout.note},sources:[{name:'CodWiki BO4 authored guide',url:`/guides/${guide.id}`,note:'Guide passages supply named regions, service locations and explicitly described routes. Original CodWiki schematic; no external creator map image is copied.'},...guide.sources.slice(0,3).map((url,i)=>({name:`Guide reference ${i+1}`,url}))],layers:[{id:'overview',label:'Regions · schematic',image:`/maps/${guide.id}/overview.svg`,width:1400,height:980,note:`Schematic, not to scale. Lines show regional routes with intermediate rooms omitted. ${layout.note}`}],locations,targets,quickLinks}
  const output=guide.id==='bo4-voyage-of-despair'?createVoyageCutaway(dataset,guide):dataset
  if(output.cutaway)edgeEvidence.push(...output.cutaway.connections.map(connection=>({mapId:guide.id,...connection,interpretation:connection.note})))
  write(`app/data/maps/${guide.id}.json`,JSON.stringify(output,null,2)+'\n')
  const svg=output.cutaway?renderVoyageCutaway(output):renderMapSchematic({title:guide.name,edition:'Black Ops 4',nodes:layout.nodes,edges:layout.edges,subtitle:'Partial regional routes · not to scale'})
  write(`public/maps/${guide.id}/overview.svg`,svg)
  if(!output.cutaway)write(`public/maps/${guide.id}/SOURCE.txt`,`Original CodWiki regional schematic, 2026-10-11.\nCoordinates place labels on a diagram and do not measure the game world.\nEvidence: /guides/${guide.id} and docs/map-expansion-research/bo4-implementation.json.\nNo external fan artwork copied. ${layout.note}\n`)
  if(output.cutaway)write(`public/maps/${guide.id}/SOURCE.txt`,`Original CodWiki ship cutaway; no external artwork traced or copied.\nNine relative height slices and simplified longitudinal spans from the TRPG atlas and annotated Voyage floor plans supplied as a user reference.\nStair links identify room levels, not exact landing coordinates. Regional routes remain marked separately.\nSources and per-connection evidence: app/data/maps/${guide.id}.json\n`)
  summary.push({id:guide.id,locations:output.locations.length,targets:output.targets.length,regions:output.cutaway?.rooms.length||layout.nodes.length,routes:output.cutaway?.connections.length||layout.edges.length,note:output.coverage.note})
}
write('docs/map-expansion-research/bo4-implementation.json',JSON.stringify({generatedAt:'2026-10-11',coverage:'Original source-backed regional schematics',maps:summary,edgeEvidence,gaps:[{id:'bo4-tag-der-toten',reason:'No accepted source layout. Do not substitute Call of the Dead.'}]},null,2)+'\n')
console.log(JSON.stringify(summary.map(({id,locations,targets,routes})=>({id,locations,targets,routes})),null,2))

if(process.argv.includes('--render')){
  const {chromium}=createRequire(path.join(root,'desktop-app/package.json'))('playwright')
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true})
  const page=await browser.newPage({viewport:{width:1400,height:980},deviceScaleFactor:1})
  const previews='docs/map-expansion-research/bo4-previews'
  fs.mkdirSync(path.join(root,previews),{recursive:true})
  for(const {id} of summary){
    await page.goto(pathToFileURL(path.join(root,`public/maps/${id}/overview.svg`)).href)
    await page.screenshot({path:path.join(root,previews,`${id}.png`)})
  }
  await browser.close()
}

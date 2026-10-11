import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { classicGuides } from '../shared/classic-guides.mjs'
import { bo2Guides } from '../shared/bo2-guides.mjs'
import { bo3Guides } from '../shared/bo3-guides.mjs'
import { chroniclesGuides } from '../shared/chronicles-guides.mjs'
import { classicLayouts, classicMapGaps } from './classic-map-layouts.mjs'
import { renderMapSchematic } from './lib/map-schematic.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const guides = [...classicGuides,...bo2Guides,...bo3Guides,...chroniclesGuides]
const catalogue = JSON.parse(fs.readFileSync(path.join(root,'shared/catalogue.json'),'utf8'))
const edition = g => g.group === 'chronicles' ? 'BO3 · Zombies Chronicles' : ({waw:'World at War',bo1:'Black Ops',bo2:'Black Ops II',bo3:'Black Ops III'}[g.gameId])
const stepsOf = g => [...g.phases.map(p=>({...p,activity:p.group==='Key Features'?'essentials':'main-quest'})),...g.sidePhases.map(p=>({...p,activity:'side-quests'}))].flatMap(phase=>phase.steps.map(step=>({phase,step})))
const plain = step => [step.text,...(step.bullets||[])].join(' ')
const categoryFor = type => ({'named-area':'area','spawn-area':'spawn','power-switch':'power',generator:'power','perk-machine':'perk','pack-a-punch':'upgrade',workbench:'equipment','crafting-table':'equipment',teleporter:'transport','fast-travel':'transport','mystery-box':'weapon','wall-buy':'weapon','quest-item':'quest','buildable-part':'quest',key:'quest','quest-mechanism':'quest','code-symbol':'quest','ritual-site':'quest','challenge-starter':'quest','door-buy':'door'}[type] || 'quest')
const summary = []
const write = (relative,content) => {const target=path.join(root,relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,content)}
const quote = text => String(text).replace(/\s+/g,' ').trim()
const matchesRegion = (node,step) => {
  const text=plain(step)
  // Word boundaries prevent aliases such as Pi, cell and bar matching unrelated words.
  const aliases=node.match.split('|')
  return aliases.some(alias=>{
    // These words describe mechanics or unspecified rooms, not a defensible destination.
    if(/^(?:Box|switch|power|rooms|Earth|panel|central|crew|yellow|ring|pedestal|Nan Sapwe|shield|tablet|stairs|altar|upper|power-up)$/i.test(alias))return false
    if(alias.toLowerCase()==='spawn'){
      // Distinguish the spawn room from statements that an item can spawn elsewhere.
      return /\bSpawn\b/.test(text)||/\b(?:at|in|near|from|by|beside|towards?|outside|around|through|opposite|leave|to|return to)(?: the)? spawn\b|\bspawn (?:room|table|chest|area|exit|door|reward|window|terminal|locker|pad|route|building|platform|altar|gravestone|panel|bunker)\b/i.test(text)
    }
    return new RegExp(`\\b(?:${alias})\\b`,'i').test(text)
  })
}
const evidenceGuide = (family,stepId) => guides.find(g=>{
  const slug=g.id.replace(/^(waw|bo1|bo2|bo3)-/,'')
  return (slug===family||(family==='der-riese'&&slug==='the-giant'))&&stepsOf(g).some(({step})=>step.id===stepId)
})

function buildDataset(guide,layout,{layers,defaultLayer='overview',actualBase=false,extraSources=[]}={}) {
  const steps=stepsOf(guide), anchors=new Set(steps.map(x=>x.step.id)), baseLayer=defaultLayer
  const locations=[], targets=[], quickLinks={}, essentialByStep=new Map()
  const markerPoint=node=>({x:node.x,y:node.y+(actualBase?0:.037)})
  for(const node of layout.nodes){
    const matching=steps.filter(({step})=>matchesRegion(node,step))
    const first=matching[0]?.step
    locations.push({id:`area-${node.id}`,label:node.label,layerId:node.layerId||baseLayer,...markerPoint(node),category:'area',typeId:'named-area',activityIds:['navigation'],precision:'area',areaRadius:actualBase?.022:.035,overview:true,floor:node.floor,description:`${edition(guide)} · ${node.floor || 'Region'}. ${node.note || (actualBase?'Approximate region on the credited creator map.':'Region on a schematic, not an exact object position.')} ${first ? quote(first.quick || first.text) : 'Use the connected route and guide landmarks; detailed interior geometry is not represented.'}`,source:first?`/guides/${guide.id}#guide-step-${first.id}`:`/guides/${guide.id}`})
  }
  const perNode=new Map()
  for(const pin of layout.essentials||[]){
    const existing=pin.steps.filter(id=>anchors.has(id))
    if(!existing.length) continue
    const node=layout.nodes.find(n=>n.id===pin.node)
    if(!node)throw new Error(`${guide.id}: missing node ${pin.node}`)
    const count=perNode.get(node.id)||0;perNode.set(node.id,count+1)
    const first=steps.find(x=>x.step.id===existing[0]).step
    const offset=[[-.038,.038],[.038,.038],[0,.061],[-.060,.005],[.060,.005]][count%5]
    const point=pin.position?{x:pin.position[0],y:pin.position[1]}:actualBase?{x:node.x+offset[0]*.45,y:node.y+offset[1]*.45}:{x:node.x+offset[0],y:node.y+offset[1]}
    locations.push({id:pin.id,label:pin.label,layerId:node.layerId||baseLayer,...point,category:categoryFor(pin.typeId),typeId:pin.typeId,activityIds:['essentials'],precision:'area',areaRadius:pin.areaRadius||(actualBase?.014:.025),overview:true,floor:node.floor,description:`${pin.note?pin.note+' ':''}${quote(first.text)}${first.bullets?.length?' '+first.bullets.map(quote).join(' '):''} ${actualBase?'The overlay highlights the surrounding area, not a surveyed pickup point.':'Area shown on an original schematic; use these landmark directions for the exact interaction.'}`,source:`/guides/${guide.id}#guide-step-${first.id}`})
    for(const id of existing){if(!essentialByStep.has(id))essentialByStep.set(id,[]);essentialByStep.get(id).push(pin.id)}
  }
  for(const {phase,step} of steps){
    const related=layout.nodes.filter(node=>matchesRegion(node,step)).map(node=>`area-${node.id}`)
    const pins=essentialByStep.get(step.id)||[]
    const locationIds=[...new Set([...pins,...related])]
    if(!locationIds.length)continue
    const id=`guide-${step.id}`
    targets.push({id,title:step.quick||`${phase.title}: ${step.id}`,locationIds,kind:'area',description:`Related mapped areas for this ${edition(guide)} instruction. ${layout.note}`,guideAnchor:`guide-step-${step.id}`})
    quickLinks[step.id]=id
    for(const location of locations.filter(l=>locationIds.includes(l.id))){location.activityIds=[...new Set([...location.activityIds,phase.activity])]}
  }
  if(!Object.keys(quickLinks).length)throw Error(`${guide.id}: no location-bearing guide links`)
  const images=layers||[{id:'overview',label:'Regions · schematic',image:`/maps/${guide.id}/overview.svg`,width:1400,height:980,note:`Schematic · not to scale. ${layout.note}`}]
  const dataset={id:guide.id,name:guide.name,defaultLayer,sources:[{name:`CodWiki ${edition(guide)} guide`,url:`/guides/${guide.id}`,note:actualBase?'Edition-specific instructions supply area overlays and guide links. The base is the credited Origins creator image.':'Edition-specific instructions supply marker descriptions and guide links. Original schematic geometry is limited to the cited connections; no unlicensed fan image is copied.'},...guide.sources.slice(0,3).map((url,i)=>({name:`Guide reference ${i+1}`,url})),...extraSources],coverage:{kind:actualBase?'guide-linked':'schematic',note:actualBase?`Credited community layout with area overlays. Baked-in symbols remain visible when filters are changed. Interior floors and Crazy Place are not fully drawn; markers describe their access regions. ${layout.note}`:layout.note},layers:images,locations,targets,quickLinks}
  const locationIds=new Set(locations.map(l=>l.id))
  if(locationIds.size!==locations.length)throw Error(`${guide.id}: duplicate locations`)
  for(const target of targets){if(!anchors.has(target.guideAnchor.slice('guide-step-'.length)))throw Error(`Invalid anchor ${target.guideAnchor}`);for(const id of target.locationIds)if(!locationIds.has(id))throw Error(`Invalid location ${id}`)}
  for(const location of locations)if(location.x<0||location.x>1||location.y<0||location.y>1)throw Error(`Off-sheet location ${location.id}`)
  write(`app/data/maps/${guide.id}.json`,JSON.stringify(dataset,null,2)+'\n')
  if(!actualBase)write(`public/maps/${guide.id}/overview.svg`,renderMapSchematic({title:guide.name,edition:edition(guide),nodes:layout.nodes,edges:layout.edges}))
  summary.push({id:guide.id,kind:dataset.coverage.kind,locations:locations.length,guideLinks:targets.length,note:layout.note})
}

for(const guide of guides){
  const slug=guide.id.replace(/^(waw|bo1|bo2|bo3)-/,'')
  const family=slug==='the-giant'?'der-riese':slug
  if(family==='origins')continue
  const layout=classicLayouts[family]
  if(!layout)continue
  // Evidence may belong to the original edition when only its structural connection is reused.
  for(const edge of layout.edges){if(!evidenceGuide(family,edge.evidence))throw Error(`Unresolved evidence ${family}/${edge.evidence}`)}
  buildDataset(guide,layout)
}

const originsLayout={
  nodes:[
    {id:'spawn',label:'Spawn / Generator 1',x:.849,y:.781,match:'Spawn|Generator 1|brain',floor:'Spawn bunker'},
    {id:'tank',label:'Tank Station / Generator 2',x:.771,y:.431,match:'Tank Station|Generator 2|Generators 2|blue record|stone tablet',floor:'Bunker / outside'},
    {id:'gen3',label:'Generator 3 route',x:.644,y:.546,match:'Generator 3|Generators 2–3|Fire Tunnel',floor:'Trench route'},
    {id:'workshop',label:'Workshop',x:.674,y:.362,match:'Workshop|workshop',floor:'Two floors'},
    {id:'gen4',label:'Generator 4 / Wind Tunnel',x:.468,y:.824,match:'Generator 4|Generators 4|Wind Tunnel|purple record|Jugger',floor:'Surface / tunnel'},
    {id:'gen5',label:'Generator 5 / Lightning Tunnel',x:.467,y:.099,match:'Generator 5|Lightning Tunnel|Stamin-Up|yellow record|stone seal',floor:'Surface / tunnel'},
    {id:'excavation',label:'Excavation',x:.451,y:.456,match:'Excavation|gramophone|black record|Pack-a-Punch',floor:'Surface + lower chambers',note:'The circular drawing groups several Excavation levels; use the guide for stairs and pedestals.'},
    {id:'church',label:'Church',x:.226,y:.546,match:'Church|Freya|red record|basin|torch',floor:'Two floors'},
    {id:'gen6',label:'Generator 6 / Ice Tunnel',x:.137,y:.622,match:'Generator 6|Ice Tunnel|Generator 6|Freya',floor:'Church rear / tunnel'}
  ],edges:[],essentials:[
    {id:'gen1',label:'Generator 1',node:'spawn',typeId:'generator',steps:['setup-1'],position:[.844,.775],areaRadius:.018},
    {id:'gen2',label:'Generator 2',node:'tank',typeId:'generator',steps:['setup-1'],position:[.727,.415],areaRadius:.018},
    {id:'gen3-power',label:'Generator 3',node:'gen3',typeId:'generator',steps:['setup-1'],position:[.641,.534],areaRadius:.018},
    {id:'gen4-power',label:'Generator 4',node:'gen4',typeId:'generator',steps:['setup-1'],position:[.464,.820],areaRadius:.018},
    {id:'gen5-power',label:'Generator 5',node:'gen5',typeId:'generator',steps:['setup-1'],position:[.464,.081],areaRadius:.018},
    {id:'gen6-power',label:'Generator 6',node:'gen6',typeId:'generator',steps:['setup-1'],position:[.125,.608],areaRadius:.018},
    {id:'pap',label:'Pack-a-Punch / excavation top',node:'excavation',typeId:'pack-a-punch',steps:['setup-1']},
    {id:'gramophone',label:'Gramophone / excavation interior',node:'excavation',typeId:'quest-item',steps:['setup-3']},
    {id:'staff-pedestals',label:'Lower Excavation staff pedestals',node:'excavation',typeId:'crafting-table',steps:['staff-build-5','upgrades-5']},
    {id:'tablet',label:'Tank Station stone tablet',node:'tank',typeId:'quest-item',steps:['equipment-2','equipment-3']},
    {id:'basin',label:'Upstairs Church tablet basin',node:'church',typeId:'quest-mechanism',steps:['equipment-2']}
  ],note:'BO2 and Chronicles overlays use their own guide instructions. Static art includes possible spawn locations; they are not all active at once.'
}
const originsAsset='public/maps/bo2-origins/origins-zedz.jpg'
if(!fs.existsSync(path.join(root,originsAsset)))throw Error('Acquire the creator-permitted Origins image before building')
for(const guide of guides.filter(g=>g.id==='bo2-origins'||g.id==='bo3-origins'))buildDataset(guide,originsLayout,{actualBase:true,layers:[{id:'overview',label:'Origins · creator overview',image:'/maps/bo2-origins/origins-zedz.jpg',width:5760,height:3240,note:'Map by u/ZedzDEMIZie. Used with the creator’s stated permission and attribution. Baked symbols cannot be hidden by filters. Region overlays are approximate; no standalone Crazy Place floor plan is provided.'}],extraSources:[{name:'Origins map by u/ZedzDEMIZie',url:'https://www.reddit.com/r/CODZombies/comments/6wh7nx/hq_map_i_made_to_celebrate_originss_4th_birthday/',note:'Creator explicitly permits any use with credit in the linked discussion. The selected golden-dig revision is https://i.imgur.com/9aPCMFq.jpg. Inspected at 5760 × 3240; original attribution is retained in the artwork.'}]})

const enabled=new Set(summary.map(s=>s.id))
const gaps=catalogue.maps.filter(m=>['waw','bo1','bo2','bo3'].includes(m.gameId)&&!enabled.has(m.id)).map(m=>({id:m.id,reason:classicMapGaps[m.id.replace(/^(waw|bo1|bo2|bo3)-/,'')]||'No verified useful navigational layer authored.'}))
const evidence=Object.entries(classicLayouts).flatMap(([family,layout])=>layout.edges.map(edge=>{const sourceGuide=evidenceGuide(family,edge.evidence);const step=stepsOf(sourceGuide).find(x=>x.step.id===edge.evidence).step;return {family,...edge,sourceGuideId:sourceGuide.id,sourceAnchor:`guide-step-${step.id}`,sourceText:plain(step)}}))
write('docs/map-expansion-research/classic-map-implementation.json',JSON.stringify({generatedAt:'2026-10-11',maps:summary,gaps,edgeEvidence:evidence,rights:'All new SVGs are original logical connection schematics, not traced fan art. The sole acquired raster is Origins with the creator’s explicit attribution permission.'},null,2)+'\n')
write('docs/map-expansion-research/classic-map-implementation.md',`# Classic map implementation\n\n${summary.length} maps have useful source-backed layers; ${gaps.length} remain explicitly unavailable. Every guide link uses a real authored step ID and an existing guide-step anchor.\n\n## Added maps\n\n| Guide ID | Coverage | Markers | Guide targets | Limits |\n|---|---|---:|---:|---|\n${summary.map(s=>`| ${s.id} | ${s.kind} | ${s.locations} | ${s.guideLinks} | ${s.note} |`).join('\n')}\n\n## Remaining gaps\n\n${gaps.map(g=>`- **${g.id}:** ${g.reason}`).join('\n')}\n\n## Provenance\n\nThe new SVGs are original CodWiki connection diagrams derived from the edition guides’ stated relationships. They do not copy or trace the fan images whose usage was unresolved in research. Every drawn edge has a source guide, exact step ID and evidence text in [classic-map-implementation.json](classic-map-implementation.json). Shape, distance and angle are illustrative; markers use area precision. Disconnected regions mean their intermediate route is not asserted.\n\nThe Origins image is by **u/ZedzDEMIZie**, used under the creator’s explicit permission to use it with credit in [the original post](https://www.reddit.com/r/CODZombies/comments/6wh7nx/hq_map_i_made_to_celebrate_originss_4th_birthday/). It was visually inspected at 5760 × 3240; the credit remains on the image. Baked icons remain visible when overlay filters are changed. BO2 and Chronicles get independent targets and descriptions.\n\nRegenerate only these owned outputs with \`node scripts/build-classic-maps.mjs\`. The generator does not touch the catalogue, shared loader, guide files or viewer.\n`)
console.log(JSON.stringify({maps:summary.length,locations:summary.reduce((n,s)=>n+s.locations,0),guideTargets:summary.reduce((n,s)=>n+s.guideLinks,0),gaps:gaps.map(g=>g.id)}))

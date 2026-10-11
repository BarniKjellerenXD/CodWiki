import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { awGuides } from '../shared/aw-guides.mjs';
import { iwGuides } from '../shared/iw-guides.mjs';
import { ww2Guides } from '../shared/ww2-guides.mjs';
import { vanguardGuides } from '../shared/vanguard-guides.mjs';
import { otherLayouts } from './other-map-layouts.mjs';
import { renderOtherSchematic } from './lib/other-map-schematic.mjs';
const allGuides=[...awGuides,...iwGuides,...ww2Guides,...vanguardGuides];
const root=process.cwd();
const research=path.join(root,'docs/map-expansion-research');
const textSources=JSON.parse(fs.readFileSync(path.join(research,'other-topology/sources.json'),'utf8'));
const sourcesByKey=Object.fromEntries(textSources.filter(s=>s.path).map(s=>['topology:'+path.basename(s.path,'.txt'),s]));
const edition={aw:'Advanced Warfare · Exo Zombies',iw:'Infinite Warfare',ww2:'World War II',vanguard:'Vanguard'};
const reports=[];
const normalize=t=>String(t).replace(/\s+/g,' ').trim();
const write=(relative,content)=>{const target=path.join(root,relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,content);};
for(const [guideId,layout] of Object.entries(otherLayouts)){
 const guide=allGuides.find(g=>g.id===guideId);assert.ok(guide,guideId);
 const steps=[...guide.phases,...(guide.sidePhases||[])].flatMap(phase=>phase.steps.map(step=>({phase,step})));
 const stepsById=new Map(steps.map(x=>[x.step.id,x]));
 const textOf=s=>[s.text,...(s.bullets||[])].join(' ');
 const locations=[],targets=[],quickLinks={},essentialByStep=new Map();
 const routeEvidence=[];
 for(const edge of layout.edges){
  const record=sourcesByKey[edge.evidence];
  assert.ok(record||stepsById.has(edge.evidence),`Missing topology evidence ${guideId}/${edge.evidence}`);
  routeEvidence.push({...edge,source:record?.url||`/guides/${guideId}#guide-step-${edge.evidence}`});
 }
 for(const node of layout.nodes){
  const relevant=steps.filter(({step})=>new RegExp(node.match,'i').test(textOf(step)));
  const first=relevant[0]?.step;
  locations.push({id:`area-${node.id}`,label:node.label,layerId:'overview',x:node.x,y:node.y+.037,category:'area',typeId:'named-area',
   precision:'area',areaRadius:.035,overview:true,floor:node.floor,availability:'fixed',
   description:`${edition[guide.gameId]}. Named region on an original diagram; spacing and angles are not geographical. ${first?normalize(first.quick||first.text):'Only the documented connections are drawn; detailed object placements and unshown paths require the guide.'}`,
   source:first?`/guides/${guideId}#guide-step-${first.id}`:routeEvidence.find(e=>e.from===node.id||e.to===node.id)?.source||`/guides/${guideId}`});
 }
 const perNode=new Map();
 for(const item of layout.essentials){
  const node=layout.nodes.find(n=>n.id===item.node);assert.ok(node,`${guideId}/${item.node}`);
  for(const id of item.steps)assert.ok(stepsById.has(id),`Unknown guide step ${guideId}/${id}`);
  const count=perNode.get(node.id)||0;perNode.set(node.id,count+1);
  const offsets=[[-.04,.015],[.04,.015],[0,.063],[-.07,.05],[.07,.05]];
  const offset=offsets[count%offsets.length];
  const description=stepsById.get(item.steps[0]).step;
  const source=`/guides/${guideId}#guide-step-${item.steps[0]}`;
  locations.push({id:item.id,label:item.label,layerId:'overview',x:node.x+offset[0],y:node.y+offset[1],category:item.typeId,typeId:item.typeId,
   precision:'area',areaRadius:.026,overview:false,floor:node.floor,availability:'conditional',
   description:`${item.note?item.note+' ':''}${normalize(description.text)} Region-level overlay only: consult the guide photographs for the exact object and current match conditions.`,source});
  for(const stepId of item.steps){if(!essentialByStep.has(stepId))essentialByStep.set(stepId,[]);essentialByStep.get(stepId).push(item.id);}
 }
 for(const {step} of steps){
  const regions=layout.nodes.filter(n=>new RegExp(n.match,'i').test(textOf(step))).map(n=>`area-${n.id}`);
  const ids=[...new Set([...(essentialByStep.get(step.id)||[]),...regions])];if(!ids.length)continue;
  const id=`guide-${step.id}`;
  targets.push({id,title:step.quick||step.id,locationIds:ids,kind:'area',description:`Related regions for this instruction. ${layout.note}`,guideAnchor:`guide-step-${step.id}`});
  quickLinks[step.id]=id;
 }
 const groups=[['essentials','Key Features'],['main-quest','Main Quest'],['side-quests','Side Quests']].map(([id,label])=>{
  const matching=steps.filter(x=>x.phase.group===label).map(x=>`guide-${x.step.id}`);
  const ids=[...new Set(targets.filter(t=>matching.includes(t.id)).flatMap(t=>t.locationIds))];
  return{id,label,locationIds:ids};
 }).filter(f=>f.locationIds.length);
 const external=[...new Set(routeEvidence.filter(e=>e.source.startsWith('https://')).map(e=>e.source))];
 const data={id:guideId,name:guide.name,defaultLayer:'overview',coverage:{kind:'schematic',note:layout.note},
  sources:[{name:`CodWiki ${edition[guide.gameId]} guide`,url:`/guides/${guideId}`,note:'Edition-specific walkthrough supplies object directions, prerequisites and guide links. Positions are diagram areas, not measured coordinates.'},
   ...external.map((url,i)=>({name:`Documented region connections ${i+1}`,url,note:'Textual route evidence. External artwork is not copied, traced or redistributed.'})),
   ...guide.sources.slice(0,2).filter(url=>!external.includes(url)).map((url,i)=>({name:`Illustrated guide reference ${i+1}`,url}))],
  layers:[{id:'overview',label:'Regions · schematic',image:`/maps/${guideId}/overview.svg`,width:1400,height:980,note:`Original regional diagram, not an overhead floor plan. ${layout.note}`}],
  locations,targets,quickLinks,filterGroups:groups.length?[{id:'activities',label:'Guide activities',defaultFilter:groups[0].id,filters:groups}]:[]};
 const locationIds=new Set(locations.map(l=>l.id));assert.equal(locationIds.size,locations.length);
 for(const l of locations){assert.match(l.id,/^[a-z0-9-]+$/);assert.ok(l.x>0&&l.x<1&&l.y>0&&l.y<1);assert.equal(l.precision,'area');}
 for(const t of targets){assert.ok(t.locationIds.length);t.locationIds.forEach(id=>assert.ok(locationIds.has(id)));}
 assert.ok(targets.length>0);
 const component=fs.readFileSync(path.join(root,'app/components/guide',guideId+'.vue'),'utf8');
 for(const stepId of Object.keys(quickLinks))assert.ok(component.includes(`id="guide-step-${stepId}"`),`${guideId}/${stepId}`);
 write(`app/data/maps/${guideId}.json`,JSON.stringify(data,null,2)+'\n');
 write(`public/maps/${guideId}/overview.svg`,renderOtherSchematic({id:guideId,title:guide.name,edition:edition[guide.gameId],nodes:layout.nodes,edges:routeEvidence}));
 reports.push({id:guideId,regions:layout.nodes.length,locations:locations.length,targets:targets.length,edges:routeEvidence,note:layout.note});
}
write('docs/map-expansion-research/other-topology/implementation.json',JSON.stringify(reports,null,2)+'\n');
console.log(JSON.stringify(reports.map(({edges,note,...r})=>({...r,verifiedEdges:edges.length})),null,2));

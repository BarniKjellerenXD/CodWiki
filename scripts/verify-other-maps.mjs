import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {otherLayouts} from './other-map-layouts.mjs';
const root=process.cwd(),folder=path.join(root,'docs/map-expansion-research/other-previews');
const reports=[];
for(const id of Object.keys(otherLayouts)){
 const d=JSON.parse(await fs.readFile(path.join(root,'app/data/maps',id+'.json'),'utf8'));
 const svg=await fs.readFile(path.join(root,'public',d.layers[0].image),'utf8');
 assert.equal(d.coverage.kind,'schematic');assert.ok(svg.includes('not to scale'));
 assert.ok(!/<(?:script|image|foreignObject)\b|(?:href|onload)\s*=/i.test(svg));
 const ids=new Set(d.locations.map(l=>l.id));assert.equal(ids.size,d.locations.length);
 for(const l of d.locations){assert.equal(l.precision,'area');assert.ok(l.areaRadius>0);assert.ok(l.source&&l.typeId&&l.description);}
 const content=await fs.readFile(path.join(root,'app/components/guide',id+'.vue'),'utf8');
 for(const [step,target] of Object.entries(d.quickLinks)){
  assert.ok(content.includes(`id="guide-step-${step}"`),`${id}/${step}`);
  assert.ok(d.targets.some(t=>t.id===target));
 }
 for(const t of d.targets)t.locationIds.forEach(id=>assert.ok(ids.has(id)));
 reports.push({id,locations:d.locations.length,targets:d.targets.length,regions:otherLayouts[id].nodes.length,edges:otherLayouts[id].edges.length});
}
console.log(JSON.stringify(reports,null,2));
if(process.argv.includes('--render')){
 const require=createRequire(import.meta.url);const sharp=process.env.CW_NODE_MODULES?require(path.join(process.env.CW_NODE_MODULES,'sharp')):require('sharp');
 await fs.mkdir(folder,{recursive:true});const panels=[];
 for(const {id} of reports){
  const svg=await fs.readFile(path.join(root,'public/maps',id,'overview.svg'));
  await sharp(svg).png().toFile(path.join(folder,id+'.png'));
  panels.push(await sharp(svg).resize(700,490).png().toBuffer());
 }
 for(let i=0;i<3;i++)await sharp({create:{width:1400,height:980,channels:4,background:'#0b141d'}}).composite(panels.slice(i*4,i*4+4).map((input,j)=>({input,left:(j%2)*700,top:Math.floor(j/2)*490}))).png().toFile(path.join(folder,`contact-${i+1}.png`));
}

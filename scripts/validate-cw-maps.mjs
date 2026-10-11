import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const root = process.cwd();
const research = path.join(root,'docs/map-expansion-research');
const sourceRoot = path.join(research,'cw-source');
const manifest = JSON.parse(await fs.readFile(path.join(sourceRoot,'layout-manifest.json'),'utf8'));
const records = JSON.parse(await fs.readFile(path.join(sourceRoot,'parsed-records.json'),'utf8'));
const byId = Object.fromEntries(records.map(r=>[`dc-${Buffer.from(r.id,'utf8').toString('hex')}`,r]));
const round = await fs.readFile(path.join(research,'assets/declassified/src/data/maps/coldWarMaps.tsx'),'utf8');
const outbreak = await fs.readFile(path.join(research,'assets/declassified/src/data/maps/coldWarOutbreakMaps.tsx'),'utf8');
function geometry(text) {
  return [...text.matchAll(/<(path|polyline|polygon|rect|circle|ellipse|line)\b[^>]*>/gs)].map(m=>m[1]+':'+[...m[0].matchAll(/\b(d|points|x|y|x1|x2|y1|y2|width|height|rx|ry|cx|cy|r)="([^"]*)"/g)].map(a=>a[1]+'='+a[2].replace(/\s+/g,' ')).sort().join('|'));
}
const results = []; const datasets = {};
for (const entry of manifest) {
  const file = path.join(root,'public',entry.image);
  const svg = await fs.readFile(file,'utf8');
  assert.ok(!/<(?:script|foreignObject|image)\b|(?:href|onload)\s*=/i.test(svg),'Self-contained SVG only');
  assert.ok(svg.includes('Copyright (c) 2024 Odinn H & Ben Ashley'));
  const current = (entry.dataset==='cw-outbreak'?outbreak:round).split(entry.sourceMap+': (')[1]?.split('</SVGOverlay>')[0];
  assert.ok(current,`Current source overlay ${entry.sourceMap}`);
  assert.deepEqual(geometry(svg),geometry(current),`Exact shape registration: ${entry.sourceMap}`);
  if (!datasets[entry.dataset]) datasets[entry.dataset] = JSON.parse(await fs.readFile(path.join(root,'app/data/maps',entry.dataset+'.json'),'utf8'));
  results.push({dataset:entry.dataset,layer:entry.layer,identicalGeometryPrimitives:geometry(svg).length});
}
for (const d of Object.values(datasets)) {
  const ids = new Set(d.locations.map(l=>l.id)); assert.equal(ids.size,d.locations.length);
  assert.ok(d.layers.some(l=>l.id===d.defaultLayer));
  for (const l of d.locations) {
    assert.match(l.id,/^[a-z0-9-]+$/);
    assert.equal(l.sourceId,Buffer.from(l.id.slice(3),'hex').toString('utf8'));
    assert.ok(d.layers.some(layer=>layer.id===l.layerId));
    assert.ok(Number.isFinite(l.x)&&Number.isFinite(l.y)&&l.x>=0&&l.x<=1&&l.y>=0&&l.y<=1);
    assert.ok(Math.abs(l.x-byId[l.id].loc[1]/512)<1e-8&&Math.abs(l.y-(1-byId[l.id].loc[0]/512))<1e-8);
    assert.ok(l.typeId&&l.source&&l.description&&l.availability);
    if(l.precision==='area') assert.ok(l.areaRadius>0);
  }
  assert.equal(new Set(d.targets.map(t=>t.id)).size,d.targets.length);
  for (const t of d.targets) { assert.ok(t.locationIds.length); t.locationIds.forEach(id=>assert.ok(ids.has(id),id)); }
  for (const g of d.filterGroups) for (const f of g.filters) f.locationIds.forEach(id=>assert.ok(ids.has(id),id));
  for (const [guide,links] of Object.entries({[d.id]:d.quickLinks,...d.guideQuickLinks})) {
    const content = await fs.readFile(path.join(root,'app/components/guide',guide+'.vue'),'utf8');
    for (const [anchor,target] of Object.entries(links)) {
      assert.ok(content.includes(`id="guide-step-${anchor}"`),`Guide anchor ${guide}#guide-step-${anchor}`);
      assert.ok(d.targets.some(t=>t.id===target),`Target ${d.id}/${target}`);
    }
  }
}
const report = { sourceCommit:'e3b8a56f3a4c44a8f9d3fabaf185f5aeac328df0',coordinateTransform:'x = longitude / 512; y = 1 - latitude / 512',
  geometry:results,datasets:Object.values(datasets).map(d=>({id:d.id,layers:d.layers.length,locations:d.locations.length,targets:d.targets.length,guideLinks:Object.keys(d.quickLinks).length+Object.values(d.guideQuickLinks||{}).reduce((s,v)=>s+Object.keys(v).length,0)})) };
await fs.writeFile(path.join(sourceRoot,'validation.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));

if(process.argv.includes('--render')) {
  const require = createRequire(import.meta.url);
  const moduleRoot = process.env.CW_NODE_MODULES;
  const sharp = moduleRoot ? require(path.join(moduleRoot,'sharp')) : require('sharp');
  const previewDir = path.join(research,'cw-previews'); await fs.mkdir(previewDir,{recursive:true});
  const panels = [];
  const escape = t=>t.replaceAll('&','&amp;').replaceAll('<','&lt;');
  for (const entry of manifest) {
    const svg = await fs.readFile(path.join(root,'public',entry.image),'utf8');
    const locations = datasets[entry.dataset].locations.filter(l=>l.layerId===entry.layer);
    const essentials = locations.filter(l=>l.overview);
    const points = [...essentials,...locations.filter(l=>!l.overview).filter((_,i)=>i%Math.max(1,Math.floor(locations.length/10))===0)];
    const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">${points.map((l,i)=>`<circle cx="${l.x*512}" cy="${l.y*512}" r="4.5" fill="${l.overview?'#22d3ee':'#e9b54d'}" stroke="#161c25" stroke-width="1.5"/><text x="${l.x*512+6}" y="${l.y*512+3}" font-family="Arial" font-weight="bold" font-size="9" stroke="#111" stroke-width="2" paint-order="stroke" fill="#fff">${i+1}</text>`).join('')}</svg>`;
    await sharp(Buffer.from(svg)).resize(1024,1024).png().toFile(path.join(previewDir,`${entry.dataset}-${entry.layer}.png`));
    const base = await sharp(Buffer.from(svg)).resize(512,512).composite([{input:Buffer.from(overlay)}]).png().toBuffer();
    const title = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="42"><rect width="512" height="42" fill="#141923"/><text x="12" y="27" font-family="Arial" font-size="18" fill="#fff">${escape(entry.dataset+' / '+entry.layer)}</text></svg>`;
    const panel = await sharp({create:{width:512,height:554,channels:4,background:'#141923'}}).composite([{input:Buffer.from(title),left:0,top:0},{input:base,left:0,top:42}]).png().toBuffer();
    panels.push(panel);
    await fs.writeFile(path.join(previewDir,`${entry.dataset}-${entry.layer}-calibration.json`),JSON.stringify(points.map((l,i)=>({number:i+1,id:l.id,label:l.label,x:l.x,y:l.y})),null,2)+'\n');
  }
  for(let i=0;i<4;i++) await sharp({create:{width:1024,height:1108,channels:4,background:'#141923'}}).composite(panels.slice(i*4,i*4+4).map((input,j)=>({input,left:(j%2)*512,top:Math.floor(j/2)*554}))).png().toFile(path.join(previewDir,`contact-${i+1}.png`));
}

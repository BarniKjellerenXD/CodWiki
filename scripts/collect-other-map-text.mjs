// Text-only research snapshots. No unlicensed map artwork is redistributed.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const folder='docs/map-expansion-research/other-topology';
await fs.mkdir(folder,{recursive:true});
const manifest=JSON.parse(await fs.readFile('docs/map-expansion-research/other-sources.json','utf8'));
const entries=manifest.entries.filter(e=>e.sourceCandidates.some(c=>c.imageUrls?.length));
let prior=[];try{prior=JSON.parse(await fs.readFile(path.join(folder,'sources.json'),'utf8'));}catch{}
let implementations=[];try{implementations=JSON.parse(await fs.readFile(path.join(folder,'implementation.json'),'utf8'));}catch{}
const result=[];
for(const entry of entries){
  const pages=entry.relatedLayoutPages||entry.sourceCandidates.slice(0,1).map(c=>c.pageUrl);
  for(const [i,url] of pages.entries()){
    const dest=path.join(folder,`${entry.guideId}-${i+1}.txt`);
    try{
      let text;
      try{text=await fs.readFile(dest,'utf8');}catch{
        const response=await fetch(url);if(!response.ok)throw Error('HTTP '+response.status);
        const html=await response.text();
        const body=html.includes("class='post-body entry-content'")?html.split("class='post-body entry-content'")[1].split("class='post-footer'")[0]:html;
        text=body.replace(/<script\b[\s\S]*?<\/script>/gi,'').replace(/<style\b[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/&#39;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
      }
      const previous=prior.find(p=>p.url===url);
      const cachedSummary=text.startsWith('Reference: ');
      const originalLength=cachedSummary?previous?.length:text.length;
      const sha256=cachedSummary?previous?.sha256:crypto.createHash('sha256').update(text).digest('hex');
      const used=implementations.find(r=>r.id===entry.guideId)?.edges.filter(e=>e.source===url)||[];
      const summary=[`Reference: ${url}`,`Guide: ${entry.guideId}`,'Read for factual room/transport relationships; external artwork and article text are not redistributed.',
        ...used.map(e=>`Diagram relationship: ${e.from} → ${e.to}; ${e.kind}; ${e.label||'documented connection'}.`),
        ...(used.length?[]:['Research reference only; no direct connection from this page was added to the current diagram.'])].join('\n')+'\n';
      await fs.writeFile(dest,summary);
      result.push({guideId:entry.guideId,url,path:dest,length:originalLength,sha256,retained:'Original factual relationship summary, not full article text'});
    }catch(error){result.push({guideId:entry.guideId,url,error:String(error)});}
  }
}
await fs.writeFile(path.join(folder,'sources.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result.map(x=>({id:x.guideId,path:x.path,error:x.error,length:x.length})),null,2));

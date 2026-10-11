import fs from 'node:fs/promises'
const base=new URL('./',import.meta.url)
const read=async file=>JSON.parse((await fs.readFile(new URL(file,base),'utf8')).replace(/^\uFEFF/,''))
const [catalog,classic,modern,other]=await Promise.all([read('../../app/data/catalogue.json'),read('classic-sources.json'),read('modern-sources.json'),read('other-sources.json')])
const records=new Map()
const add=(id,value)=>{if(records.has(id))throw Error('Duplicate research row '+id);records.set(id,value)}
for(const row of classic.entries){
 const raw=row.coverageStatus
 const status=raw==='no-single-base-map-found'?'gap':raw.startsWith('source-gap')?'lead':/room-series/.test(raw)?'partial':'candidate'
 add(row.guideId,{status,evidenceStatus:raw,sourcePages:row.sourcePageUrls,sourceInventory:'classic-sources.json',research:row})
}
for(const row of modern.maps)add(row.id,{status:row.readiness,evidenceStatus:row.evidence,sourcePages:[row.sourcePage,row.alternativeProvider,row.mirror,row.alternative].filter(Boolean),sourceInventory:'modern-sources.json',research:row})
for(const row of other.entries){
 const status=row.status.startsWith('no-')?'gap':row.status==='search-lead'?'lead':/partial|schematic/.test(row.status)?'partial':'candidate'
 add(row.guideId,{status,evidenceStatus:row.status,sourcePages:row.sourceCandidates.map(s=>s.pageUrl).filter(Boolean),sourceInventory:'other-sources.json',research:row})
}
const rows=[]
for(const map of catalog.maps){
 let research=records.get(map.id)
 if(map.interactiveMap){
  if(research)throw Error('Existing dataset unexpectedly treated as new '+map.id)
  const data=await read('../../app/data/maps/'+map.id+'.json')
  research={status:'existing',evidenceStatus:'local-dataset-audited',sourcePages:data.sources.map(s=>s.url),sourceInventory:'existing-datasets.json',research:{locations:data.locations.length,layers:data.layers.length,targets:data.targets.length}}
 }else if(!research)throw Error('Missing source disposition '+map.id)
 rows.push({id:map.id,name:map.name,gameId:map.gameId,route:map.route,...research})
}
const known=new Set(catalog.maps.map(m=>m.id));for(const id of records.keys())if(!known.has(id))throw Error('Unknown catalog ID '+id)
const counts=Object.fromEntries(['existing','candidate','partial','lead','gap'].map(status=>[status,rows.filter(r=>r.status===status).length]))
const result={reviewed:'2026-10-11',scope:'96 current catalog entries; two child Outbreak quest guides inherit a future shared dataset and are not additional map rows.',definitions:{existing:'Interactive dataset exists; existing coverage limits still apply.',candidate:'Specific layout candidate located; not necessarily correct-edition, visually verified, permission-cleared or production-ready.',partial:'Room/regional series or schematic evidence; full spatial coverage unverified.',lead:'Source or creator lead exists but image identity, provenance or access remains unresolved.',gap:'No adequate spatial source verified in this research pass; not proof none exists.'},counts,maps:rows}
await fs.writeFile(new URL('coverage.json',base),JSON.stringify(result,null,2)+'\n')
const lines=['# Map source coverage','', 'Research dispositions for every current catalog entry · 11 October 2026. **No new maps have been implemented.**','',`**${rows.length} entries: ${counts.existing} existing, ${counts.candidate} layout candidates, ${counts.partial} partial references, ${counts.lead} leads, ${counts.gap} gaps.** Candidate/partial counts include edition-sharing references that still require version-specific validation.`,'','[Main plan](../map-expansion-plan.md) · [Machine-readable complete inventory](coverage.json) · [Classic sources](classic-sources.md) · [BO4/CW/BO6 sources](modern-sources.md) · [AW/IW/WWII/Vanguard/MWIII sources](other-sources.md)','',...Object.entries(result.definitions).map(([key,value])=>`- **${key}**: ${value}`),'','Every ID was reconciled against app/data/catalogue.json. The 85 entries without datasets each have one source-research row. No catalog map was added to make the research fit. Two Outbreak child guides need shared dataset ownership when that map is implemented.','']
for(const gameId of [...new Set(catalog.maps.map(m=>m.gameId))]){
 lines.push('## '+gameId.toUpperCase(),'','| Guide | Disposition | Source / evidence |','| --- | --- | --- |')
 for(const row of rows.filter(r=>r.gameId===gameId)){
  const page=row.sourcePages[0]
  const source=page?`[Source](${page})`:'No spatial source verified'
  lines.push(`| ${row.name} \`${row.id}\` | ${row.status} | ${source} · [details](${row.sourceInventory}) · ${row.evidenceStatus} |`)
 }
 lines.push('')
}
lines.push('## Before implementation','','Do not treat this count as an estimate of finished maps. Resolve the artwork gate, edition and missing-layer questions recorded in each detailed row. Candidate files can contain baked-in pins, partial rooms or inherited layouts; source position data must be reviewed independently. Retain gaps until usable evidence is obtained.','','## Verification of this research package','','Coverage generation rejects duplicate, missing and unknown IDs. Asset-file hashes are verified separately. Product tests and in-game geographic verification are not claimed by this research pass.','')
await fs.writeFile(new URL('coverage.md',base),lines.join('\n'))
console.log(JSON.stringify({entries:rows.length,...counts}))

// Research-pack validation only. This does not build or modify the application.
import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'

const root=path.dirname(fileURLToPath(import.meta.url))
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'))
const data=read('puzzle-data.json'),maps=read('maps.json').maps,tools=read('tools.json').tools,sources=read('sources.json').sources,assets=read('assets.json').assets
const errors=[],checks=[]
const check=(condition,label,detail)=>{if(!condition)errors.push({label,detail});return condition}
const mod=(value,n)=>((value%n)+n)%n
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b)
const unique=(rows,field)=>check(new Set(rows.map(r=>r[field])).size===rows.length,'unique '+field)
for(const rows of [maps,tools,sources,assets])unique(rows,'id')
check(maps.length===30,'thirty destination records')
const counts=maps.reduce((n,m)=>(n[m.gameId]=(n[m.gameId]??0)+1,n),{})
check(same(counts,{iw:5,ww2:11,aw:4,vanguard:4,mw3:6}),'exact game coverage',counts)
const sourceIds=new Set(sources.map(s=>s.id)),assetIds=new Set(assets.map(a=>a.id)),toolIds=new Set(tools.map(t=>t.id)),mapIds=new Set(maps.map(m=>m.id))
for(const map of maps){
  check(new Set(map.phasePlan.map(p=>p.id)).size===map.phasePlan.length,'unique phases '+map.id)
  for(const id of map.sourceIds)check(sourceIds.has(id),'map source '+map.id,id)
  for(const id of [...map.toolIds,...map.optionalToolIds,...map.sharedToolIds])check(toolIds.has(id),'map tool '+map.id,id)
}
for(const tool of tools){
  check(mapIds.has(tool.ownerMapId),'tool owner',tool.id)
  const owner=maps.find(m=>m.id===tool.ownerMapId)
  for(const id of tool.phaseIds??[])check([...owner.phasePlan.map(p=>p.id),...owner.sidePhaseIds].includes(id),'tool phase '+tool.id,id)
  for(const key of tool.datasetKeys??[])check(Object.hasOwn(data,key),'tool dataset '+tool.id,key)
}
function references(value,where='data'){
  if(!value||typeof value!=='object')return
  for(const [key,v]of Object.entries(value)){
    if(key==='sourceIds')for(const id of v)check(sourceIds.has(id),'dataset source '+where,id)
    else if(['referenceAssetId','chartAssetId','codeAssetId','contextAssetId','assetId'].includes(key))check(assetIds.has(v),'dataset asset '+where,v)
    else if(['symbolAssets','assetIds'].includes(key))for(const id of v)check(assetIds.has(id),'dataset assets '+where,id)
    else references(v,where+'.'+key)
  }
}
references(data)

const vectors=n=>Array.from({length:4**n},(_,code)=>Array.from({length:n},(_,i)=>Math.floor(code/4**(n-i-1))%4))
function rotationStates(matrix,target,sign){
  const n=matrix.length,actions=vectors(n).sort((a,b)=>a.reduce((x,y)=>x+y,0)-b.reduce((x,y)=>x+y,0)||a.join('').localeCompare(b.join('')))
  let solvable=0,maxActions=0
  for(const state of vectors(n)){
    const routes=actions.filter(shots=>state.every((s,row)=>mod(s+sign*matrix[row].reduce((sum,rate,col)=>sum+rate*shots[col],0),4)===target[row]))
    if(!routes.length)continue
    solvable++
    const total=routes[0].reduce((a,b)=>a+b,0);maxActions=Math.max(total,maxActions)
    check(routes.every(r=>r.reduce((a,b)=>a+b,0)>=total),'minimum rotation route')
  }
  return{states:4**n,solvable,unreachable:4**n-solvable,maxActions}
}
const statueResults=data.shadowedStatues.rateVectors.map((rates,index)=>rotationStates(rates.map((rate,row)=>rates.map((_,col)=>Math.abs(row-col)<=1?rate:0)),rates.map(()=>2),1))
const statueFixture=[0,2,2],statueShots=[0,2,2]
check(statueFixture.every((v,row)=>mod(v+statueShots.reduce((sum,shot,col)=>sum+(Math.abs(row-col)<=1?shot:0),0),4)===2),'statue B2 C2 fixture')
checks.push({name:'Shadowed Throne rotation state enumeration',walls:statueResults})
const hammer=rotationStates(data.frozenHammer.matrix,data.frozenHammer.target,-1)
check(hammer.solvable===256,'all 256 hammer states reachable',hammer)
const hf=data.frozenHammer.fixture
check(hf.observed.every((v,row)=>mod(v-data.frozenHammer.matrix[row].reduce((sum,c,i)=>sum+c*hf.shots[i],0),4)===hf.expected[row]),'hammer fixture')
checks.push({name:'Frozen Dawn base hammer enumeration',...hammer})

const queenSolutions=[]
function queens(board=[]){const row=board.length;if(row===8){queenSolutions.push(board);return}for(let col=0;col<8;col++)if(board.every((c,r)=>c!==col&&Math.abs(c-col)!==row-r))queens([...board,col])}
queens();check(queenSolutions.length===92,'92 queens solutions')
check(queenSolutions.some(s=>same(s,data.queens.exampleRowToColumn)),'queen example')
const queenCellCounts=Array.from({length:8},(_,r)=>Array.from({length:8},(_,c)=>queenSolutions.filter(s=>s[r]===c).length))
check(queenCellCounts.every(row=>row.every(n=>n>0)),'every single preplaced queen supported')
checks.push({name:'Eight queens',solutions:queenSolutions.length,fixedCellCounts:queenCellCounts})

let subsets=0,impossible=0,ambiguous=0,uniqueOrder=0
for(let a=0;a<9;a++)for(let b=a+1;b<10;b++)for(let c=b+1;c<11;c++)for(let d=c+1;d<12;d++){
  subsets++;const selected=[a,b,c,d],matches=data.beastDisks.rows.filter(row=>selected.every(x=>row.includes(x)))
  const orders=[...new Set(matches.map(row=>row.filter(x=>selected.includes(x)).join(',')))]
  if(!orders.length)impossible++;else if(orders.length>1)ambiguous++;else uniqueOrder++
}
check(subsets===495,'all 495 disk subsets considered')
checks.push({name:'Beast distinct four-symbol selections',subsets,impossible,ambiguous,uniqueOrder})

const recipeNames=Object.keys(data.attackChemistry.recipes),raw=new Set(Object.keys(data.attackChemistry.rawIngredients))
const finalNames=recipeNames.filter(id=>data.attackChemistry.recipes[id].final),recipeRoutes={}
function recipeRoute(id,stack=[],done=new Set(),ordered=[]){
 if(raw.has(id))return ordered
 check(!stack.includes(id),'acyclic recipe',stack.concat(id));if(stack.includes(id))return ordered
 const recipe=data.attackChemistry.recipes[id];if(!check(!!recipe,'recipe ingredient exists',id))return ordered
 if(done.has(id))return ordered
 for(const ingredient of recipe.ingredients)recipeRoute(ingredient,[...stack,id],done,ordered)
 done.add(id);ordered.push(id);return ordered
}
for(const id of finalNames)recipeRoutes[id]=recipeRoute(id)
check(finalNames.length===5&&recipeNames.length===16,'five complete final recipes and eleven intermediates')
for(const f of data.attackChemistry.fixtures)check(f.topLeftPairs.flat().reduce((a,b)=>a+b,0)-f.O===f.expected,'chemical arithmetic fixture')
check(data.attackChemistry.rawIngredients.pennies.board==='Market exterior'&&data.attackChemistry.recipes.dinitro.board==='Gas Station','corrected diamond-board references')
checks.push({name:'Recipe graph and arithmetic',rawIngredients:raw.size,recipes:recipeNames.length,finalRoutes:recipeRoutes})

const signals=Object.values(data.morseDigits);check(new Set(signals).size===10&&signals.every(s=>s.length===5&&/^[.-]+$/.test(s)),'ten five-signal Morse digits')
const reverseMorse=Object.fromEntries(Object.entries(data.morseDigits).map(([a,b])=>[b,a]))
check('----- .---- ..---'.split(' ').map(s=>reverseMorse[s]).join('')==='012','Morse leading zero')
check(data.shaolinWords.words.length===71&&new Set(data.shaolinWords.words).size===71,'71 distinct Shaolin words')
check(data.shaolinWords.words.filter(w=>/^RAT....$/.test(w)).includes('RATKING'),'Shaolin seven-letter mask')
checks.push({name:'Morse and word inventory',morseDigits:10,shaolinWords:71})

function sequences(max=4,out=[],prefix=[]){if(prefix.length)out.push(prefix);if(prefix.length<max)for(let p=1;p<=4;p++)sequences(max,out,[...prefix,p]);return out}
const choices=sequences().sort((a,b)=>a.length-b.length||a.join('').localeCompare(b.join('')))
check(choices.length===340,'340 Skull Hop sequences')
const f=data.skullHop.fixture,values=f.symbols.map(l=>l.charCodeAt(0)-64)
const skullValue=sequence=>mod(sequence.reduce((sum,p,j)=>sum+values[p-1]+3*p*j,0)-1,26)+1
const solved=[...f.word].map(letter=>choices.find(s=>skullValue(s)===letter.charCodeAt(0)-64))
check(same(solved,f.expectedSequences),'BENZENE source-arithmetic fixture',solved)
check(skullValue([1,1,3])===26,'remainder zero maps to Z')
checks.push({name:'Skull Hop original-rule fixture',enumerated:340,word:f.word,sequences:solved})

check(data.terraPages.positions.length===4&&data.terraPages.permutations===24,'Terra page permutations')
check(data.vanguardCipherPairs.pairs.length===15&&new Set(data.vanguardCipherPairs.pairs.map(p=>p.paper)).size===15,'fifteen paper glyph pairs')
check(new Set(data.vanguardCipherPairs.pairs.map(p=>p.column+':'+p.row)).size===15,'fifteen distinct plate cells')
check(data.mwRunePortals.entrances.length===17&&data.mwRunePortals.destinations.length===24,'portal marker coverage')
const glyphIds=new Set(data.mwRunePortals.glyphs.map(g=>g.id))
check(glyphIds.size===8,'eight photographic portal glyph identities')
for(const row of data.mwRunePortals.destinations)check(row.glyphIds.length===3&&row.glyphIds.every(g=>glyphIds.has(g)),'portal code '+row.id)
check(new Set(data.mwRunePortals.destinations.map(r=>r.glyphIds.join('|'))).size===24,'24 distinct portal codes')
check(data.redWorm.candidateLocations.length===12&&data.redWorm.clueRooms.length===4,'Red Worm atlas coverage')
check(data.mwRifts.length===4&&data.mwRifts.every(r=>r.relics.length===4&&r.schematics.length===3),'seasonal relic and schematic sets')
checks.push({name:'Vanguard and MWZ reference inventories',vanguardPairs:15,portalEntrances:17,portalDestinations:24,portalGlyphs:8,redWormCandidates:12,riftSets:4})

const anchor=text=>text.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu,'').replace(/\s/g,'-')
function verifyLink(link,label){if(/^https?:|^mailto:/.test(link))return;const [file,fragment]=link.split('#');if(!file)return;const target=path.resolve(root,file);check(fs.existsSync(target),'local reference '+label,link);if(fragment&&target.endsWith('.md')&&fs.existsSync(target)){const headings=[...fs.readFileSync(target,'utf8').matchAll(/^#{1,6} (.+)$/gm)].map(m=>anchor(m[1].trim()));check(headings.includes(fragment),'heading reference '+label,link)}}
for(const m of maps)verifyLink(m.brief,m.id)
for(const t of tools)verifyLink(t.spec,t.id)
for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.md')))for(const m of fs.readFileSync(path.join(root,file),'utf8').matchAll(/\[[^\]]*\]\(([^)]+)\)/g))verifyLink(m[1],file)
let local=0,bytes=0,validated=0
for(const a of assets){
 check(!!a.source&&!!a.page&&!!a.credit&&!!a.rightsStatus,'asset provenance',a.id)
 if(!a.localPath)continue
 local++;const target=path.resolve(root,a.localPath);check(target.startsWith(root+path.sep),'asset stays within pack',a.id)
 if(!check(fs.existsSync(target),'asset exists',a.id))continue
 const buffer=fs.readFileSync(target);bytes+=buffer.length
 check(buffer.length===a.bytes&&createHash('sha256').update(buffer).digest('hex')===a.sha256,'asset integrity',a.id)
 if(a.fileValidation==='decoded-and-sha256-checked')validated++
}
check(validated===local,'all local images decoded', {local,validated})
const report={schemaVersion:1,checked:'2026-10-07',scope:'Research consistency and independent mathematics; no website build or gameplay verification',status:errors.length?'failed':'passed',counts:{games:5,maps:maps.length,plannedPhases:maps.reduce((n,m)=>n+m.phasePlan.length,0),coreTools:tools.filter(t=>t.status==='selected-core').length,optionalTools:tools.filter(t=>t.status==='optional-later').length,sources:sources.length,imageReferences:assets.length,localImages:local,imageBytes:bytes,decodedImages:validated},checks,errors,remainingPublicationWork:['Capture or clear production artwork and confirm captions','In-game acceptance for solo/co-op, edition, gates and success cues','Optional map projection/coordinate calibration']}
fs.writeFileSync(path.join(root,'verification.json'),JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({status:report.status,counts:report.counts,errors},null,2))
process.exitCode=errors.length?1:0

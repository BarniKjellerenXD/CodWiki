const fs=require('node:fs/promises');const path=require('node:path');
const {chromium}=require('C:/Users/MainLocalUser/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const base=process.argv[2]||'http://127.0.0.1:3000';
 const out='docs/map-expansion-research/implementation-previews';await fs.mkdir(out,{recursive:true});
 const catalog=JSON.parse(await fs.readFile('app/data/catalogue.json','utf8'));
 const maps=catalog.maps.filter(m=>m.interactiveMap);let artRequests=0;
 for(const map of maps){const data=JSON.parse(await fs.readFile('app/data/maps/'+map.id+'.json','utf8'));for(const layer of data.layers){const response=await fetch(base+layer.image);if(!response.ok)throw Error(map.id+' missing art '+response.status);await response.arrayBuffer();artRequests++}}
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const cases=['bo6-liberty-falls','bo6-terminus','bo6-reckoning','cw-die-maschine','cw-firebase-z','cw-outbreak','bo1-kino-der-toten','bo2-origins','bo3-revelations','bo4-ancient-evil','bo4-voyage-of-despair','aw-infection','iw-rave-in-the-redwoods','ww2-the-shadowed-throne','vanguard-the-archon'];
 const verified=[];
 for(const id of cases){if(!maps.some(m=>m.id===id))continue;await page.goto(base+'/guides/'+id+'#map',{waitUntil:'networkidle'});await page.locator('.atlas-marker, .ship-board').first().waitFor({timeout:60000});if(await page.locator('.atlas-image-error').count())throw Error(id+' image/viewer error');await page.screenshot({path:path.join(out,id+'.png')});verified.push(id)}
 for(const id of ['cw-outbreak-ravenov','cw-outbreak-excision']){
  const dataset=JSON.parse(await fs.readFile('app/data/maps/cw-outbreak.json','utf8'));const target=Object.values(dataset.guideQuickLinks[id])[0];
  await page.goto(base+'/guides/'+id+'#map:'+target,{waitUntil:'networkidle'});await page.locator('.atlas-marker').first().waitFor();await page.getByRole('button',{name:'← Back to step',exact:true}).first().click();await page.waitForFunction(()=>!location.hash.startsWith('#map'));verified.push(id+' shared atlas + Back to step');
 }
 await page.goto(base+'/guides/bo6-liberty-falls#map',{waitUntil:'networkidle'});await page.locator('.atlas-marker').first().waitFor();
 for(const theme of ['archive','midnight','forest','ember','paper']){await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);await page.screenshot({path:path.join(out,'liberty-'+theme+'.png')})}
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,'liberty-mobile.png'),fullPage:true});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('New map mobile overflow');
 await browser.close();if(errors.length)throw Error(errors.join('\n'));
 const report={checked:new Date().toISOString(),origin:base,mapsWithArtChecked:maps.length,artRequests,verified,runtimeErrors:errors,checks:['all accepted artwork routes return bytes','representative map lazy data and viewer render','child Outbreak atlas ownership and return navigation','five theme screenshots','390px no horizontal overflow']};await fs.writeFile(path.join(out,'expansion-browser-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
})().catch(e=>{console.error(e);process.exitCode=1});

const fs=require('node:fs/promises');
const {chromium}=require('C:/Users/MainLocalUser/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const base=process.argv[2]||'http://127.0.0.1:3001';
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const cases=['paradox-junction','mw3-urzikstan','bo6-liberty-falls','cw-firebase-z','bo4-voyage-of-despair','bo1-kino-der-toten','bo2-origins','aw-infection','iw-zombies-in-spaceland','ww2-the-shadowed-throne','vanguard-the-archon'];
 const verified=[];
 for(const id of cases){
  await page.goto(base+'/guides/'+id,{waitUntil:'networkidle'});
  for(const view of ['Quick Parts','Full Details']){
   const viewButton=page.getByRole('button',{name:view,exact:true});await viewButton.click();
   const link=page.locator('.show-on-map:visible').first();await link.waitFor();
   const target=await link.getAttribute('href');const origin=await link.elementHandle();
   await link.click();await page.locator('[aria-label="Selected locations"] h3').waitFor();
   if(decodeURIComponent(await page.evaluate(()=>location.hash))!==target)throw Error(id+' '+view+' target hash mismatch');
   if(!await page.locator('.atlas-marker-selected, .ship-room-highlight').count())throw Error(id+' '+view+' selected target not rendered');
   await page.getByRole('button',{name:'← Back to step',exact:true}).first().click();
   await page.waitForFunction(()=>!location.hash.startsWith('#map'));
   if(await viewButton.getAttribute('aria-pressed')!=='true')throw Error(id+' did not restore '+view);
   if(!await origin.evaluate(el=>el===document.activeElement))throw Error(id+' '+view+' did not restore origin focus');
   verified.push({id,view,target,focusRestored:true});
  }
 }
 await browser.close();if(errors.length)throw Error(errors.join('\n'));
 const report={checked:new Date().toISOString(),origin:base,verified,runtimeErrors:errors,checks:['guide click opens its target','lazy client map renders highlighted locations','Back to step restores Quick/Full reader and the originating link focus']};
 await fs.writeFile('docs/map-expansion-research/implementation-previews/guide-flow-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({flows:verified.length,runtimeErrors:errors}));
})().catch(e=>{console.error(e);process.exit(1)});

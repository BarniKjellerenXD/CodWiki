import {photoSets} from './chronicles-photos.mjs'
import {iceLabels,iceRuneLabels,fireValues} from './expansion-references.mjs'
export const iceSymbols=iceLabels.map((label,i)=>({id:String(i),label,rune:iceRuneLabels[i],input:[Math.floor(i/4)*593+20,(i%4)*275+12,260,252],output:[Math.floor(i/4)*593+305,(i%4)*275+12,265,252]}))
export const fireSymbols=fireValues.map((value,i)=>({id:String(value),value,label:value===4?'Two side-by-side dots':({11:'Dot · hollow · two stacked dots',5:'Dot · two stacked dots',9:'Dot · hollow · hollow',7:'Two stacked dots · dot',6:'Two stacked dots · hollow',3:'Dot · hollow'})[value],box:[[5,270,500,777,1025,1275,1540][i],5,[245,214,257,227,226,247,245][i],250]}))
export const tileSymbols=['Circle with cross','Double cross','Diamond','Eight-spoke star','Crescent','Circle with bar','Circle with dot','Three dots','Triangle','D shape','Tall cross','Crossed curves'].map((label,i)=>({id:String(i+1),label,box:[i%4*157+20,Math.floor(i/4)*190,135,[130,125,118][Math.floor(i/4)]]}))
const group=(map,id,name,description,ids,region='')=>({id,name,description,locations:ids.map(key=>{
 const p=photoSets[map].find(p=>p.id===key);if(!p)throw Error(`Unknown atlas photo ${map}/${key}`)
 return {...p,region:region||p.alt.split(' - ')[0]}
})})
const ids=(map,prefix)=>photoSets[map].filter(p=>p.id.startsWith(prefix)).map(p=>p.id)
export const locationAtlases={
 'bo3-nacht-secrets':{map:'nacht-der-untoten',section:'samantha',groups:[
  group('nacht-der-untoten','dolls','Active doll locations','Five targets appear one at a time from these eight spots. Follow nearby music; a timeout means restarting at the RK5 doll.',ids('nacht-der-untoten','free_max_ammo/doll_')),
  group('nacht-der-untoten','buttons','Four starting buttons','Interact with all four, then start the hunt at the doll in front of the RK5.',ids('nacht-der-untoten','free_max_ammo/button_'))
 ]},
 'bo3-verruckt-dolls':{map:'verruckt',section:'secrets',groups:[group('verruckt','dolls','Ten possible doll locations','After right/centre/left toilet counts 9/3/5, start at Wunderfizz. Shoot five active targets, one at a time. If you hear the failure laugh, restart at that same starter doll.',ids('verruckt','free_max_ammo/').filter(id=>id!=='free_max_ammo/sam_doll'))]},
 'bo3-kino-dolls':{map:'kino-der-toten',section:'samantha',groups:[group('kino-der-toten','dolls','Ten possible doll locations','First answer three different Alley knock patterns, then interact with the stage doll. Five targets appear one at a time. Return to the starter doll to claim the reward or restart a failed hunt.',ids('kino-der-toten','free_max_ammo/doll_').filter(id=>id!=='free_max_ammo/doll_init_loc'))]},
 'bo3-ascension-dolls':{map:'ascension',section:'samantha',groups:[
  group('ascension','capture','Capture with Gersh','Unlock Pack-a-Punch. Pull each of these three dolls into a Gersh Device. The extra wide/close views help line up the Widow’s Wine throw.',['free_max_ammo/doll_pap','free_max_ammo/doll_widows_wine','free_max_ammo/doll_widows_wine_zoomed','free_max_ammo/stand_here','free_max_ammo/aim_here','free_max_ammo/doll_stamin_up'],'Capture targets'),
  group('ascension','shoot','Shoot in this order','Start at the bush behind the Pack-a-Punch Box spot. Shoot targets 1–5 in the order below, then return to the bush doll.',['free_max_ammo/doll_1','free_max_ammo/doll_2','free_max_ammo/doll_3','free_max_ammo/doll_4','free_max_ammo/doll_5'],'Ordered targets')
 ]},
 'bo3-moon-labs':{map:'moon',section:'simon',groups:[
  group('moon','panels','Timed green panel boxes','After hacking the floor-2 starter button, find four green-lit boxes among these eight. The photos mark three boxes on floor 1, two on floor 2 and three on floor 3. Hack only the green ones in your match.',['moon-white-panel-boxes-first-floor','moon-white-panel-boxes-second-floor','moon-white-panel-boxes-third-floor'],'Laboratory'),
  group('moon','wall','Start and finish at this wall','Hack the far-left button to start. After the four green boxes, return and press all four buttons normally; the glowing wall confirms completion.',['moon-button-wall','moon-glowing-button-wall'],'Laboratory floor 2'),
  group('moon','cable','S-shaped cable reference','Search all laboratory levels and the outside area near Mule Kick. These views identify the cable and outside area, not every possible spawn.',['moon-s-cable','moon-s-cables-outside-spawn'],'Laboratory / outside')
 ]},
 'bo3-origins-locations':{map:'origins',section:'staff-build',groups:[
  group('origins','records','Records and gramophone','Choose an element in the area filter. Each coloured record has three possible locations; only one appears. Take the record and gramophone to its matching tunnel.',photoSets.origins.filter(p=>/-disc-|gramophone-spawn/.test(p.id)).map(p=>p.id)),
  group('origins','lightning','Lightning tank jumps','The first jump is on the Church → Tank Station trip. The second and third are on the return trip. Use extra rides rather than rushing an unsafe jump.',ids('origins','origins-lightning-part-'),'Tank route'),
  group('origins','ice','Ice tombstones','Complete the Crazy Place Ice puzzle first. Freeze each stone with Ice, then shatter it with a bullet weapon.',ids('origins','origins-ice-tombstone-'),'Middle / Generator 2'),
  group('origins','wind','Wind chimneys','After the ceiling puzzle, blow each chimney’s smoke toward Excavation with the Wind Staff.',ids('origins','origins-wind-chimney-'),'Middle / Church'),
  group('origins','drone','Maxis Drone parts','The brain is fixed in Spawn; rotor and frame each have three possible spawns. Collect one of each type and assemble at a workbench.',ids('origins','origins-maxis-drone-')),
  group('origins','blood','Zombie Blood carts','Extinguish all three burning carts with Ice, then collect the Zombie Blood beside Pack-a-Punch. Available once per round when the carts are burning.',ids('origins','origins-flaming-chariot-'),'Middle'),
  group('origins','red-digs','Sixteen red dig sites','You need the Golden Shovel and active Zombie Blood. Look for the active glowing pile at these marked spots. An empty bottle adds a perk slot; buy the perk afterwards.',['red-dig-map'],'Whole map'),
  group('origins','shield','All shield-part spawns','Find one piece in each of the three regions shown on the chart, then assemble at a workbench. Select the chart to enlarge it.',['shield-locations'],'Whole map')
 ]}
}
// Region labels identify a useful search group, rather than repeating a photo caption.
for(const g of locationAtlases['bo3-origins-locations'].groups){for(const p of g.locations){
 if(g.id==='records')p.region=p.id.includes('black-disc')||p.id.includes('gramophone')?'Black record / gramophone':p.id.includes('ice-disc')?'Ice · Tank Station':p.id.includes('fire-disc')?'Fire · Church':p.id.includes('wind-disc')?'Wind · Generator 5':'Lightning · Generator 4'
 if(g.id==='drone')p.region=p.id.includes('brain')?'Brain · Spawn':p.id.includes('rotor')?'Rotor · Excavation':'Frame · Church'
}}
export const gongLocations=photoSets['shangri-la'].filter(p=>p.id.startsWith('free_max_ammo/gong_')).map((p,i)=>({...p,key:`gong-${i}`,name:['Bridge bottom','Bridge top · left','Bridge top · right','Mud Room exit','Spawn · Sheiva','Minecart start','Minecart slope','Tunnel entrance'][i]}))
export const moonColours=['Red','Green','Blue','Yellow']

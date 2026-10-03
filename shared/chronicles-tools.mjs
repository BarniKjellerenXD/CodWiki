import {iceLabels,fireValues} from './expansion-references.mjs'
import {locationAtlases,tileSymbols,gongLocations,moonColours} from './chronicles-references.mjs'
const f=(id,label,options=null,extra={})=>({id,label,options,...extra})
const slots=(n,prefix,options=null,extra={})=>Array.from({length:n},(_,i)=>f(`${prefix}-${i}`,`${prefix} ${i+1}`,options,extra))
const t=(id,map,name,help,fields,kind='reference',extra={})=>({id:`bo3-${id}`,map:`bo3-${map}`,name,help,fields,kind,version:1,ui:'chronicles',...extra})
const atlasNames={'bo3-nacht-secrets':'Samantha buttons & doll finder','bo3-verruckt-dolls':'Samantha doll location finder','bo3-kino-dolls':'Samantha doll location finder','bo3-ascension-dolls':'Samantha captures & target order','bo3-moon-labs':'Hacker panel & cable finder','bo3-origins-locations':'Staff parts & secret locations'}
export const chroniclesTools=[
 ...Object.entries(locationAtlases).map(([id,a])=>t(id.slice(4),a.map,atlasNames[id],'Choose the step you are working on, narrow the locations and select any photograph to enlarge it.',[
  f('collection','Current collection',a.groups.map(g=>g.id)),f('region','Area',[...new Set(a.groups.flatMap(g=>g.locations.map(p=>p.region)))]),
  ...(id==='bo3-nacht-secrets'?slots(4,'check',null,{type:'check'}):[])
 ])),
 t('origins-ice','origins','Ice staff symbol matcher','Select the pattern on the blue tablet. Shoot the matching ceiling rune with the Ice Staff, then read the next tablet.',[f('pattern','Tablet pattern',iceLabels)],'solver',{evaluate:'ice'}),
 t('origins-fire','origins','Fire staff torch decoder','After lighting the Crazy Place cauldrons, select the four glowing church patterns. The result tells you which basement torches to shoot.',fireValues.map(v=>f(`fire-${v}`,`Glowing pattern ${v.toString(3)}`,null,{type:'check',glyph:v})),'solver',{evaluate:'fire'}),
 t('moon-simon','moon','Samantha Says sequence recorder','Facing the four outside computers, their order is Red, Green, Blue, Yellow from left to right. Tap what flashes, then use the numbered result in-game.',[
  ...slots(4,'screen',moonColours),...slots(16,'slot',moonColours),f('stage','Quest stage',['First game','Final three games'])
 ],'recorder',{evaluate:'moon'}),
 t('kino-knocks','kino-der-toten','Alley knock recorder','Listen to three groups at the blue Alley door. Record their counts, repeat them with melee hits, then listen for a new pattern. You must answer three different patterns.',[
  ...slots(3,'slot',Array.from({length:9},(_,i)=>String(i+1))),f('round','Pattern being answered',['1','2','3'])
 ],'recorder',{evaluate:'ordered'}),
 t('shang-tiles','shangri-la','Matching tile symbol notebook','Record the symbols revealed by your floor tiles. Give tiles your own landmark names so teammates can find the same pair; their positions change each match.',[
  ...[0,1].flatMap(side=>slots(12,`tile-${side}`,null,{maxLength:30})),
  ...[0,1].flatMap(side=>slots(12,`symbol-${side}`,tileSymbols.map(s=>s.id))),
  ...[0,1].flatMap(side=>slots(12,`place-${side}`,null,{maxLength:40})),
  ...tileSymbols.map(s=>f(`matched-${s.id}`,`Pair ${s.id} disappeared`,null,{type:'check'}))
 ],'recorder',{evaluate:'tiles'}),
 t('shang-gongs','shangri-la','Gong locations & match notes','Test the eight photographed gongs and record the four that do not turn the crystals red. Wrong gongs reset the ringing, not which four are correct.',gongLocations.map(g=>f(g.key,g.name,['Correct','Wrong'])),'recorder')
]

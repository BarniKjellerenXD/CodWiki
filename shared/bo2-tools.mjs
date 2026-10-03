import {mahjongColours,mahjongTiles,mineSigns,leverColours,bellRooms} from './bo2-references.mjs'
import {iceLabels,fireValues} from './expansion-references.mjs'
const f=(id,label,options,extra={})=>({id,label,options,...extra})
const t=(id,map,name,help,fields,extra={})=>({id:`bo2-${id}`,map:`bo2-${map}`,name,help,fields,version:1,kind:'solver',ui:'bo2',...extra})
export const bo2Tools=[
 t('die-rise-mahjong','die-rise','Mahjong tower order','Match each pictured shape to the colour seen in your match. A number and direction with the same colour tell you which tower leg to strike.',mahjongTiles.map(p=>f(p.id,`${p.label}: observed colour`,mahjongColours))),
 t('buried-signs','buried','Mine sign cipher matcher','Match the first two shapes on each lantern-code line. Preserve the red stroke’s position, especially for Bone Orchard and Consumption Cross.',[0,1,2].map(i=>f(`line-${i}`,`Code line ${i+1}`,mineSigns.map(s=>s.id)))),
 t('buried-levers','buried','Maze lever order solver','Flip all four levers, then record which colours sparked. Each spark confirms that lever’s position; a dark lever rules that position out. Leave the maze together before the next attempt.',[
  ...[0,1,2,3].flatMap(i=>[f(`current-${i}`,`Current pull ${i+1}`,leverColours),f(`feedback-${i}`,`Pull ${i+1}: spark after all four`,['spark','dark'])]),
  ...Array.from({length:24},(_,a)=>[f(`saved-${a}`,`Attempt ${a+1} recorded`,null,{type:'check'}),...[0,1,2,3].flatMap(i=>[f(`trial-${a}-${i}`,`Attempt ${a+1}, pull ${i+1}`,leverColours),f(`spark-${a}-${i}`,`Attempt ${a+1}, pull ${i+1}: feedback`,['spark','dark'])])]).flat()
 ]),
 t('buried-bells','buried','Mansion bell callouts','First test the bells with your team and map each one to its light. During the sequence, tap the lit bulb for an immediate room-and-bell callout.',[
  f('light','Currently lit bulb',Array.from({length:9},(_,i)=>String(i))),
  ...Array.from({length:9},(_,i)=>f(`bell-${i}`,`${bellRooms[i%3].name}, ${['top','middle','bottom'][Math.floor(i/3)]} bulb`,bellRooms[i%3].bells))
 ],{kind:'reference'}),
 t('origins-ice','origins','Ice staff symbol matcher','Select the pattern on the blue tablet. Shoot the matching ceiling rune with the Ice Staff, then read the next tablet.',[f('pattern','Tablet pattern',iceLabels)],{evaluate:'ice'}),
 t('origins-fire','origins','Fire staff torch decoder','After lighting the Crazy Place cauldrons, select the four glowing church patterns. The result tells you which basement torches to shoot.',fireValues.map(v=>f(`fire-${v}`,`Glowing pattern ${v.toString(3)}`,null,{type:'check',glyph:v})),{evaluate:'fire'})
]

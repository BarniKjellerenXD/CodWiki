// Coordinates point into credited, locally stored reference images. No glyphs are invented.
export const castleImage = name => `/images/bo6-citadelle-des-morts/citadelle-${name}.webp`
export const tombImage = name => `/images/bo6-the-tomb/the-tomb-${name}.webp`
export const ravenTrophies = [
 {id:'ram',name:"Ram's horn",zodiac:'Aries',element:'Fire',description:'Upright triangle, without a bar',y:120},
 {id:'lion',name:"Lion's jaw",zodiac:'Leo',element:'Fire',description:'Upright triangle, without a bar',y:225},
 {id:'bird',name:'Two-headed bird skull',zodiac:'Gemini',element:'Air',description:'Upright triangle, with a horizontal bar',y:330},
 {id:'fish',name:'Fish fossil',zodiac:'Pisces',element:'Water',description:'Downward triangle, without a bar',y:445},
 {id:'scorpion',name:'Scorpion fossil',zodiac:'Scorpio',element:'Water',description:'Downward triangle, without a bar',y:555}
].map(row=>({...row,photo:`/images/bo6-citadelle-des-morts/trophy-${row.id}.jpg`}))
export function ravenSolution(id){return ravenTrophies.find(row=>row.id===id)||null}
const runeLabels=['Ram horns','Circle with vertical line','Arch on a baseline','Circle with right-side cross','Circle with arrow','Three small circles','Circle with cross','Circle on cross','Downward triangle with loop','Circle with inward ticks','Triangle with tail','Line beside angular hook','Diamond with curl','Trident','Circle with tail','Divided ring','Umbrella shape','Double cross','Plain circle','Square-topped fork']
export const castleRunes=runeLabels.map((label,i)=>({id:`rune-${i+1}`,label,src:castleImage('symbol-board'),width:1899,height:1135,box:`${683+(i%5)*110} ${329+Math.floor(i/5)*110} 82 80`}))
export const trapEyes=[
 {id:'eye-ring',label:'Eye with outer ring',box:'834 416 90 63'},
 {id:'eye',label:'Eye without outer ring',box:'818 507 94 65'},
 {id:'eight-rays',label:'Eye with eight rays',box:'981 411 101 68'},
 {id:'four-rays',label:'Eye with four rays',box:'975 499 127 78'}
].map(row=>({...row,src:castleImage('book-pages'),width:1901,height:1064}))
export const trapLocations=['Village Ascent','Hilltop / Nature Path','Courtyard','Dungeon','Undercroft','Sitting Rooms']
export const bookPositions=['Top left','Bottom left','Top right','Bottom right']
export function castleSequence(state={},prefix='vase',count=6,choices=castleRunes){
 const rows=Array.from({length:count},(_,i)=>({index:i,symbol:choices.find(row=>row.id===state[`${prefix}-${i}`])||null}))
 const complete=rows.every(row=>row.symbol)
 return {rows,complete,filled:rows.filter(row=>row.symbol).length}
}
export const tombRockSymbols=[
 ['Forked zigzag','795 115 112 112'],['Branch with diamond','794 279 116 119'],['Loop with top and side marks','794 454 114 113'],['Tall hourglass','796 608 108 105'],
 ['Peaked zigzag','1102 117 105 112'],['Bent hook with diamond','1101 285 108 100'],['Layered downward triangle','1102 448 110 109'],['Crossed hourglass','1103 610 105 104']
].map(([label,box],i)=>({id:`rock-${i+1}`,label,box,src:tombImage('symbols'),width:1242,height:800,row:i%4+1,column:i<4?'Left':'Right'}))
export function tombDoorSelection(state={}){
 const selected=tombRockSymbols.filter(row=>state[row.id]===true)
 return {selected,complete:selected.length===3,invalid:selected.length>3,message:selected.length===3?'Shoot these three matching glyphs on the blocked gateway.':selected.length>3?'Only three rocks are marked in a match. Deselect the extra observations.':`Choose the three symbols actually visible on your rocks (${selected.length}/3).`}
}
export const romanNumerals=['I','II','III','IV','V','VI','VII','VIII','IX','X']
export const tombVases=[
 ['Dig Site','Scaffolding above the Rampage Inducer','first'],['Dig Site','Above the Neolithic Catacombs doorway','second'],['Roman Mausoleum / Dig Site','Above the blue Nexus gateway','third'],['Tombs','Ledge right of the Shrine of the Hierophants doorway','fourth'],['Shrine of the Hierophants','High window above Stamin-Up','fifth'],['Subterranean Temple','Above the red Nexus gateway','sixth'],['Subterranean Temple','Rim of the ceiling opening with the shaft of light','seventh'],['Deep Excavation','Distant rock ledge left of Quick Revive','eigth'],['Neolithic Catacombs','Beyond the zombie window behind the Mystery Box','ninth'],['Ossuary','Above the left doorway when entering from Catacombs','final']
].map(([room,landmark,file],i)=>({id:`vase-${i}`,room,landmark,image:tombImage(`free-self-res-${file}-vase`)}))
export const knightPairs=[{animal:'Dragon',sword:'Caliburn',incantation:'Fire',location:'Courtyard'},{animal:'Stag',sword:'Durendal',incantation:'Electric',location:'Town Square'},{animal:'Raven',sword:'Balmung',incantation:'Dark',location:'Undercroft'},{animal:'Lion',sword:'Solais',incantation:'Light',location:'Dining Hall'}]

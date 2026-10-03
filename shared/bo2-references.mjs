import {photoSets} from './bo2-photos.mjs'
// Crops preserve the photographed reference. No Unicode substitutes for game glyphs.
export const mahjongColours=['Red','Green','Blue','Black']
export const leverColours=['Red','Green','Blue','Yellow']
export const mahjongTiles=[
 {id:'number-1',label:'1 · bird',box:[108,414,96,148]},
 {id:'number-2',label:'2 · two bamboo',box:[237,414,99,148]},
 {id:'number-3',label:'3 · three bamboo',box:[367,414,99,148]},
 {id:'number-4',label:'4 · four bamboo',box:[495,414,100,148]},
 {id:'direction-North',label:'North',box:[826,411,98,148]},
 {id:'direction-East',label:'East',box:[697,411,98,148]},
 {id:'direction-South',label:'South',box:[957,411,98,148]},
 {id:'direction-West',label:'West',box:[1084,411,100,148]}
]
export const mineSigns=[
 {id:'dry',name:'Dry Gulcher Shaft',label:'U, then open-right box',box:[208,70,278,120]},
 {id:'bone',name:'Bone Orchard Vein',label:'Lower-right corner, then square',box:[232,309,263,115]},
 {id:'lunger',name:'Lunger Undermines',label:'Open-left box, then top-right corner',box:[275,558,248,108]},
 {id:'ground',name:'Ground Biter Pits',label:'Lower-left corner, then open-right box',box:[242,804,260,113]},
 {id:'consumption',name:'Consumption Cross',label:'Lower-right corner, then square; red stroke shifted',box:[227,1045,238,112]}
]
export const bellRooms=[
 {name:'Candy Store',bells:['Square table by wall','Two-pot table by couch barrier','Chair by stair doorway']},
 {name:'Barn',bells:['Hay bale by wall opening','Hay bale by railing gap','Hay bale near jail drop']},
 {name:'Courthouse',bells:['Corner inside entrance','Judge’s bench','Table right of judge’s bench']}
]
export const mahjongLocations=photoSets['die-rise'].filter(p=>p.id.endsWith('tile-spawn'))
export const toolSections={'bo2-die-rise-mahjong':'mahjong','bo2-buried-signs':'cipher','bo2-buried-levers':'levers','bo2-buried-bells':'bells','bo2-origins-ice':'upgrades','bo2-origins-fire':'upgrades'}

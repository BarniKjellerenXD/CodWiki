import { field, tool, image, numbers } from './remaining-common.mjs'
import { chemicalRaw, chemicalRecipes, chemicalFinals, chemicalLabel, skullWords } from './iw-data.mjs'

const colours=['Red','Green','Blue','Yellow']
const filters=['Red','Green','Blue']
const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const kennedy=slug=>`https://mmmrkennedy.com/games/IW/${slug}/${slug}_guide`
const base=(id,map,name,help,fields,extra={})=>tool(id,map,name,help,fields,{kind:'solver',evaluate:'remaining',widget:'remaining',...extra})
const slots=(prefix,count,label,options,extra={})=>Array.from({length:count},(_,i)=>field(`${prefix}-${i}`,`${label} ${i+1}`,options,extra))
const group=(id,title,fields,help)=>({id,title,fields:fields.map(f=>typeof f==='string'?f:f.id),...(help?{help}: {})})
const check=(id,label)=>field(id,label,null,{type:'check'})
const digits=(id,label,maxLength=2)=>field(id,label,null,{maxLength,inputmode:'numeric',pattern:'^\\d+$'})
const glyphImages=Object.fromEntries(letters.map(letter=>[letter,image(`wyler-${letter.toLowerCase()}`,`Wyler glyph ${letter}`)]))

const speakers=slots('speaker',4,'Speaker',colours)
const flashes=slots('flash',16,'UFO flash',colours)
const markerLocations=['Gas Station door','Market backroom above couch','Concrete bridge underside','RV refrigerator']
const markers=markerLocations.flatMap((location,i)=>[digits(`o-${i}`,`${location}: O number`),...filters.map(filter=>field(`o-${i}-${filter}`,`${location}: ${filter} observation`,['Equal','Not equal']))])
const tv=[digits('m','Motel office M',3),digits('tv-low','TV lower threshold',4),digits('tv-high','TV upper threshold',4),field('tv-below','TV below lower threshold: colour',filters),field('tv-middle','TV inclusive middle band: colour',filters),field('tv-above','TV above upper threshold: colour',filters)]
const chemicalObservations=[...Object.keys(chemicalRaw),...Object.keys(chemicalRecipes).filter(id=>!chemicalRecipes[id].final)].flatMap(id=>[digits(`top-${id}`,`${chemicalLabel(id)}: top diamond`,1),digits(`left-${id}`,`${chemicalLabel(id)}: left diamond`,1)])
const made=Object.keys(chemicalRecipes).map(id=>check(`made-${id}`,`${chemicalLabel(id)} made successfully`))
const routeFor=final=>{
  const route=[],seen=new Set()
  const visit=id=>{if(seen.has(id)||!chemicalRecipes[id])return;seen.add(id);chemicalRecipes[id].ingredients.forEach(visit);route.push(id)}
  visit(final);return route
}
const chemicalGroups=chemicalFinals.flatMap(final=>{
  const route=routeFor(final),ingredients=new Set(route.flatMap(id=>chemicalRecipes[id].ingredients))
  return [
    ...['Spawn','Market rear','Beach','RV Park','TV Station','Gas Station'].map(board=>({...group(`${final}-${board.toLowerCase().replaceAll(' ','-')}`,`${board} diamonds`,chemicalObservations.filter(f=>{const id=f.id.replace(/^(top|left)-/,'');return ingredients.has(id)&&(chemicalRaw[id]?.[2]||chemicalRecipes[id]?.board)===board})),showWhen:{field:'final',value:final}})).filter(g=>g.fields.length),
    {...group(`${final}-made`,'Confirmed reactions',made.filter(f=>route.includes(f.id.replace('made-',''))),'Mark only when the chemical appears successfully, not when its code is calculated.'),showWhen:{field:'final',value:final}}
  ]
})
const life=slots('life',5,'Accepted life-ray position',['3','4','5','6','8'])
const gauges=['Gas Station','Snack Shack','Power Station','Motel'].map((label,i)=>digits(`gauge-${i}`,`${label}: observed pressure`,3))
const handleInitial=slots('initial',16,'Initial handle',['Horizontal','Vertical'],{lockedBy:'frozen'})
const handleActions=slots('action',16,'Handle flipped',null,{type:'check'})
const handleCurrent=slots('current',16,'Re-observed handle',['Horizontal','Vertical'],{lockedBy:'current-frozen'})
const handleCurrentActions=slots('current-action',16,'Re-observed handle flipped',null,{type:'check'})
const inPass=(value,definition)=>({...definition,showWhen:{field:'pass',value}})

export const iwTools=[
  base('iw-spaceland-speakers','iw-zombies-in-spaceland','Spaceland speaker sequence','Number the four physical speakers with the photograph. Record their colours from this match, then record the UFO flashes. Repetitions count.',[...speakers,...flashes],{
    guidePhase:'speakers',reference:kennedy('zombies_in_spaceland'),images:[image('asset-0907','The three regional floor-symbol speaker positions'),image('asset-0908','The fourth speaker position in front of the projector gateway')],
    groups:[group('layout','Physical speaker colours',speakers),group('sequence','Current UFO sequence',flashes)],layout:{type:'sequence',positions:4,sequencePrefix:'flash'},
    resetScopes:[{id:'sequence',label:'Next sequence',fields:flashes.map(f=>f.id)},{id:'layout',label:'New speaker layout',fields:[...speakers,...flashes].map(f=>f.id)}]
  }),
  base('iw-spaceland-souvenirs','iw-zombies-in-spaceland','Souvenir recipe lookup','Choose the coins you have. Any insertion order makes the same souvenir; Weapons of Rock bonus parts require their named station.',slots('coin',3,'Coin',['Red','Green','Blue']),{guidePhase:'equipment',kind:'reference',reference:kennedy('zombies_in_spaceland')}),
  base('iw-shaolin-morse','iw-shaolin-shuffle','Nightmare Summer phone Morse','Record three digit groups. Use . for short, - for long, and a space or / between five-pulse digits. Let the in-game call hang up before collecting the poster.',[field('message','Three Morse digits',null,{maxLength:30,placeholder:'----- .---- ..---'})],{guidePhase:'phone',reference:kennedy('shaolin_shuffle'),layout:{type:'morse',field:'message',digitCount:3}}),
  base('iw-shaolin-word','iw-shaolin-shuffle','Rooftop word candidates','Use confirmed letters only. A positional mask accepts _ for unknown. Rejected letters apply to the current word; a failed attempt may choose another word.',[
    field('mask','Confirmed letter mask / prefix',null,{maxLength:20,placeholder:'RAT____'}),field('length','Observed word length',numbers(20,1)),field('rejected','Confirmed absent letters',null,{maxLength:26}),field('inventory','Observed letters, repetitions counted',null,{maxLength:20}),
  ],{guidePhase:'word',reference:kennedy('shaolin_shuffle'),images:letters.map(letter=>glyphImages[letter]),resetScopes:[{id:'attempt',label:'New word attempt',fields:['mask','length','rejected','inventory']}]}),
  base('iw-attack-chemistry','iw-attack-of-the-radioactive-thing','Radioactive Thing chemistry','Confirm O in every colour, record the TV bands, select the radio’s positively endorsed final compound, and read each diamond in the calculated filter. The chart is by RayPoopertonIII.',[
    ...tv,...markers,field('final','Positively endorsed radio chemical',chemicalFinals,{optionLabels:Object.fromEntries(chemicalFinals.map(id=>[id,chemicalLabel(id)]))}),field('value-filter','Filter used for these diamond observations',filters),...chemicalObservations,...made
  ],{guidePhase:'chemistry',reference:kennedy('attack_of_the_radioactive_thing'),images:[image('asset-1499','Chemical recipes and ingredient reference by RayPoopertonIII'),image('asset-1474','Elvira television comparison bands')],
    groups:[group('tv','M and observed TV bands',tv),...markerLocations.map((location,i)=>group(`marker-${i}`,location,markers.slice(i*4,i*4+4))),group('route','Radio and diamond context',['final','value-filter']),
      ...chemicalGroups],
    resetScopes:[{id:'diamonds',label:'New filter observations',fields:['value-filter',...chemicalObservations.map(f=>f.id),...made.map(f=>f.id)]},{id:'radio',label:'New radio route',fields:['final',...made.map(f=>f.id)]}],
    invalidates:[{field:'value-filter',fields:[...chemicalObservations.map(f=>f.id),...made.map(f=>f.id)]}]
  }),
  base('iw-attack-codes','iw-attack-of-the-radioactive-thing','Life ray, pressure and bomb memory','The TV Studio’s film reels show the five life-ray digits (floor reel is third). Keep that order, its reversal and the later four-digit safe code separate.',[
    ...life,field('reject-prefix','Accepted prefix before a rejected digit',null,{maxLength:4,pattern:'^[34568]*$'}),field('reject-digit','Next digit rejected in that exact attempt',['3','4','5','6','8']),...gauges,field('bomb','Four-digit code from Market safe',null,{maxLength:4,inputmode:'numeric',pattern:'^\\d{4}$'})
  ],{guidePhase:'life-ray',reference:kennedy('attack_of_the_radioactive_thing'),groups:[group('life','Life / death ray',life.concat(['reject-prefix','reject-digit'])),group('pressure','Four pressure gauges',gauges),group('bomb','Belly bomb code',['bomb'])],resetScopes:[{id:'rejection',label:'Clear rejected attempt',fields:['reject-prefix','reject-digit']},{id:'bomb',label:'Clear bomb observation',fields:['bomb']}]}),
  base('iw-attack-skull-hop','iw-attack-of-the-radioactive-thing','Skull Hop spelling solver','Translate the four actual glyphs using the alphabet, in physical order from Slappy Taffy toward the Ice Cream Parlour. The solver uses positive positional offsets and wraps zero to Z.',[
    field('word','Wall target word',skullWords),...slots('symbol',4,'Swingset glyph letter',letters,{optionImages:glyphImages})
  ],{guidePhase:'skull-hop',reference:'https://www.zombieslayamr.com/pages/aotrt/aotrt_spelling_bee.html',images:[image('asset-1540','Skull Hop bottom-row symbol input'),image('asset-1541','Skull Hop top-right letter commit glyph')],groups:[group('word','Target word',['word']),group('glyphs','Four physical swingset symbols',['symbol-0','symbol-1','symbol-2','symbol-3'])]}),
  base('iw-beast-disks','iw-the-beast-from-beyond','N31L disk order','Select the four symbols photographed on your disks. All matching rows are checked. Do not reverse this chart using an older right-to-left reference.',slots('disk',4,'Observed disk symbol',numbers(12),{optionLabels:Object.fromEntries(numbers(12).map(v=>[v,`Symbol ${Number(v)+1}`])),optionImages:Object.fromEntries(numbers(12).map(v=>[v,image(`asset-${1851+Number(v)}`,`Disk symbol ${Number(v)+1}`)]))}),{guidePhase:'disks',reference:kennedy('the_beast_from_beyond'),images:[image('asset-1611','N31L disk order chart, left to right')]}),
  base('iw-beast-handles','iw-the-beast-from-beyond','N31L handle snapshots','Record the initial 4×4 board. Freeze the snapshot, then mark only initially horizontal handles as flipped. Make a fresh pass if handles remain horizontal; this is an observation recorder.',[
    field('pass','Snapshot to use',['Initial snapshot','Re-observed snapshot']),...handleInitial,check('frozen','Freeze this initial snapshot'),...handleActions,...handleCurrent,check('current-frozen','Freeze this re-observed snapshot'),...handleCurrentActions
  ],{guidePhase:'handles',kind:'recorder',reference:kennedy('the_beast_from_beyond'),images:[image('asset-1615','N31L handle board orientation')],groups:[group('pass','Active pass',['pass']),inPass('Initial snapshot',group('initial','Initial board',handleInitial)),inPass('Initial snapshot',group('freeze','Initial snapshot lock',['frozen'])),inPass('Initial snapshot',group('actions','Initial performed actions',handleActions)),inPass('Re-observed snapshot',group('current','Re-observed board',handleCurrent)),inPass('Re-observed snapshot',group('current-freeze','Re-observed snapshot lock',['current-frozen'])),inPass('Re-observed snapshot',group('current-actions','Re-observed performed actions',handleCurrentActions))],layout:{type:'grid',size:4,prefix:'initial',lockedBy:'frozen'},resetScopes:[{id:'pass',label:'New re-observed pass',fields:['current-frozen',...handleCurrent.map(f=>f.id),...handleCurrentActions.map(f=>f.id)]},{id:'initial',label:'Clear initial board',fields:['frozen',...handleInitial.map(f=>f.id),...handleActions.map(f=>f.id)]}]}),
  base('iw-beast-queens','iw-the-beast-from-beyond','Skullbreaker eight queens','Orient the board to the photograph. Lock the existing queen, add any confirmed placements, then use a completion that avoids shared columns and diagonals.',[
    field('fixed-row','Original queen row',numbers(8),{optionLabels:Object.fromEntries(numbers(8).map(v=>[v,String(Number(v)+1)]))}),field('fixed-column','Original queen column',numbers(8),{optionLabels:Object.fromEntries(numbers(8).map(v=>[v,String.fromCharCode(65+Number(v))]))}),
    ...slots('extra',8,'Confirmed queen in row',numbers(8),{optionLabels:Object.fromEntries(numbers(8).map(v=>[v,String.fromCharCode(65+Number(v))]))}),field('solution','Completion index',numbers(92))
  ],{guidePhase:'skullbreaker',reference:kennedy('the_beast_from_beyond'),images:[image('asset-1669','Skullbreaker chessboard orientation')],layout:{type:'queens',size:8},groups:[group('original','Original queen',['fixed-row','fixed-column']),group('extra','Optional confirmed placements',Array.from({length:8},(_,i)=>`extra-${i}`)),group('choice','Choose another valid completion',['solution'])]})
]

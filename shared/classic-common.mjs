import {photoSets as newPhotos} from './classic-photos.mjs'
import {photoSets as sharedPhotos} from './chronicles-photos.mjs'
export {step,phase} from './bo3-common.mjs'
export const reddit=map=>`https://www.reddit.com/r/CODZombies/wiki/${map}/`
export const kennedy=map=>`https://mmmrkennedy.com/games/${['nacht-der-untoten','verruckt','shi-no-numa','der-riese'].includes(map)?'WAW':'BO1'}/${map.replaceAll('-','_')}/${map.replaceAll('-','_')}_guide`
export const illustrated=map=>`https://www.codzombiesguides.com/main-quests/black-ops-1/${map}/`
export const originalCaption=caption=>caption.replaceAll('M14/Sheiva','M14').replaceAll('PM63/L-CAR 9','PM63').replaceAll('MPL/Pharo','MPL').replaceAll('AK74u/Kuda','AK74u').replaceAll('M16/KN-44','M16').replaceAll('Olympia/RK5','Olympia').replaceAll('Claymore/Trip Mine','Claymore').replaceAll('Spikemores/Trip Mines','Spikemores').replaceAll("PhD Flopper/Widow's Wine",'PhD Flopper').replaceAll("Widow's Wine/PhD Flopper",'PhD Flopper')
const captions={
 'call-of-the-dead':{
  'power/power_ship':'The broken ship: climb to the upper control room for power.',
  'main_ee/yellow':'Yellow dial · lighthouse top floor · target 2.',
  'main_ee/orange':'Orange dial · lighthouse floor 3 · target 7.',
  'main_ee/blue':'Blue dial · lighthouse floor 2 · target 4.',
  'main_ee/purple':'Purple dial · lighthouse bottom floor · target 6.',
  'main_ee/levers_post':'Completed levers: left pulled once, middle untouched, right pulled three times.',
  'main_ee/wheel_post':'Completed wheel: the brown handle points down-right, around five o’clock.',
  'main_ee/electrical_box':'Fuse box immediately to the right of the crew’s metal door.',
  'main_ee/tube':'Delivery tube to the left of the crew’s metal door.',
  'main_ee/metal_door':'The crew’s metal door in the lighthouse annex, downstairs from PhD Flopper.',
  'main_ee/sub':'The submarine surfaces beyond the ship near Jugger-Nog.',
  'main_ee/beam_lighthouse_stairs':'The green beam rises through the lighthouse’s central stairwell.',
  'main_ee/downed_human':'Damage the transformed human until it is downed before it reaches the top.',
  'main_ee/golden_rod':'The Golden Rod arrives at the bottom of the lighthouse after the sacrifice.',
  'main_ee/bottle_box':'Lighthouse front: high railing beside the Box spot, above the PhD stairs.',
  'george_romero/low_health_george':'George’s stagelight glows orange when he is close to defeat.'
 },
 'shangri-la':{
  'main_ee/gong_down_the_slope':'Minecart area: downhill from the cart, right of the zombie window.'
 }
}
export const photoSets=Object.fromEntries([...new Set([...Object.keys(sharedPhotos),...Object.keys(newPhotos)])].map(map=>[map,[...(newPhotos[map]||[]),...(sharedPhotos[map]||[]).filter(p=>!(newPhotos[map]||[]).some(n=>n.id===p.id))].map(p=>({...p,alt:captions[map]?.[p.id]||originalCaption(p.alt)}))]))
export const photos=(map,...ids)=>ids.map(id=>{
 const p=photoSets[map]?.find(p=>p.id===id)
 if(!p)throw Error(`Missing classic reference: ${map}/${id}`)
 return {src:p.src,alt:p.alt}
})
export const collection=(map,prefix)=>photoSets[map].filter(p=>p.id.startsWith(prefix)).map(({src,alt})=>({src,alt}))
export const guide=(game,map,name,intro,cover,phases,sidePhases=[],sources=[reddit(map),kennedy(map)],extra={})=>({
 id:`${game}-${map}`,gameId:game,name,intro,image:cover?photos(map,cover)[0].src:'',phases,sidePhases,sources,
 questLabel:'Setup and secrets',reviewed:'2026-10-03',
 reviewNote:`Written for ${game==='waw'?'the original World at War PC/console maps':'Black Ops (2010), with its title updates'}; mobile editions and modded maps can differ. Community guides and illustrated references were cross-checked on 3 October 2026. Gameplay: Activision / Treyarch; photographs: the credited community authors below. Reused photographs may show a remaster of the same location; the instructions describe this edition. Source review and software checks are not an in-game playthrough.`,...extra
})

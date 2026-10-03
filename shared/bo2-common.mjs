import {photoSets} from './bo2-photos.mjs'
export {step,phase} from './bo3-common.mjs'
export const reddit=map=>`https://www.reddit.com/r/CODZombies/wiki/${map}/`
export const illustrated=map=>`https://www.codzombiesguides.com/main-quests/black-ops-2/${map}/`
export const joker=map=>`https://www.codzombieguides.com/${map}`
export const photos=(map,...ids)=>ids.map(id=>{
 const found=photoSets[map]?.find(p=>p.id===id)
 if(!found)throw Error(`Missing BO2 image: ${map}/${id}`)
 return {src:found.src,alt:found.alt}
})
export const collection=(map,prefix)=>photoSets[map].filter(p=>p.id.startsWith(prefix)).map(({src,alt})=>({src,alt}))
export const guide=(map,name,intro,phases,sidePhases,sources,extra={})=>({
 id:`bo2-${map}`,gameId:'bo2',name,intro,image:photoSets[map]?.find(p=>p.id===map)?.src||'',phases,sidePhases,sources,reviewed:'2026-10-03',
 reviewNote:'Written for the original Black Ops II release, on Original difficulty unless a mode is specified. Instructions were cross-checked against the linked community sources on 3 October 2026. Gameplay: Activision / Treyarch; photographs and charts: COD Zombies Guides, its credited contributors, mmmrkennedy and other sources named below. Shared-layout images may show another edition; follow the BO2 instructions. Source review and website checks are not an in-game playthrough.',...extra
})

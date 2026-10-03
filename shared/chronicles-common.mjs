import { photoSets } from './chronicles-photos.mjs'
export { step, phase } from './bo3-common.mjs'
export const reddit = map => `https://www.reddit.com/r/CODZombies/wiki/${map}/`
export const kennedy = map => {
 const waw=['nacht-der-untoten','verruckt','shi-no-numa'].includes(map)
 const key=map.replaceAll('-','_')
 return `https://mmmrkennedy.com/games/${waw?'WAW':'BO1'}/${key}/${key}_guide`
}
export const photo = (map, file, alt) => {
 const found=photoSets[map]?.find(p=>p.id===file||p.src.endsWith('/'+file))
 if(!found)throw new Error(`Missing Chronicles photograph: ${map}/${file}`)
 return {src:found.src,alt:alt||found.alt}
}
export const photos = (map, ...files) => files.map(file=>photo(map,file))
export const collection = (map, prefix) => photoSets[map].filter(p=>p.id.startsWith(prefix)).map(({src,alt})=>({src,alt}))
export const guide = (map,name,intro,cover,phases,sidePhases=[],sources=[reddit(map),kennedy(map)]) => ({
 id:`bo3-${map}`,gameId:'bo3',group:'chronicles',name,intro,
 questLabel:['nacht-der-untoten','verruckt','shi-no-numa','kino-der-toten'].includes(map)?'Setup and secrets':'Main quest',
 image:photo(map,cover).src,phases,sidePhases,sources,reviewed:'2026-10-03',
 reviewNote:'Written for Black Ops III: Zombies Chronicles. Community instructions and illustrated references were cross-checked on 3 October 2026. Gameplay: Activision / Treyarch; photographs and charts: the credited community sources below. Some shared-layout references show the original release; follow the BO3 instructions in the text. Source review and website checks do not replace an in-game playthrough.'
})

import {photoSets} from './classic-common.mjs'
import {locationAtlases as remasterAtlases} from './chronicles-references.mjs'
const photo=(map,id,region,alt)=>{
 const p=photoSets[map].find(p=>p.id===id)
 if(!p)throw Error(`Unknown classic photo: ${map}/${id}`)
 return {...p,region,...(alt?{alt}: {})}
}
const cotd=(id,region,alt)=>photo('call-of-the-dead',`main_ee/${id}`,region,alt)
export const lighthouseDials=[
 {id:'yellow',name:'Yellow',floor:'Top floor · 4',target:2,affected:['Yellow','Orange'],...cotd('yellow','Lighthouse','Yellow dial on the top floor of the lighthouse.')},
 {id:'orange',name:'Orange',floor:'Floor 3',target:7,affected:['Yellow','Orange','Blue'],...cotd('orange','Lighthouse','Orange dial, one floor below Yellow.')},
 {id:'blue',name:'Blue',floor:'Floor 2',target:4,affected:['Orange','Blue','Purple'],...cotd('blue','Lighthouse','Blue dial, one floor above the lighthouse base.')},
 {id:'purple',name:'Purple',floor:'Bottom floor · 1',target:6,affected:['Blue','Purple'],...cotd('purple','Lighthouse','Purple dial on the lowest lighthouse floor.')}
].map(d=>({...d,id:d.name.toLowerCase()}))
const g=(id,name,description,locations,section=id)=>({id,name,description,locations,section})
export const classicAtlases={
 'bo1-cotd-locations':{map:'call-of-the-dead',section:'fuse',groups:[
  g('fuse','Fuse · 3 possible spawns','Both routes. Search upstairs only after the crew asks for a fuse. Pick up the one that appears, then fit it into the box beside the downstairs door.',[
   cotd('fuse_desk','PhD room'),cotd('fuse_locker','PhD room'),cotd('fuse_table','PhD room')]),
  g('generators','Generators · all 4','Both routes. Explode each red light after inserting the fuse. These are fixed locations; each light must go out.',[
   cotd('gen_door','Lighthouse'),cotd('gen_mpl','Ship'),cotd('gen_shortcut','Ship / Spawn'),cotd('gen_stamin_up','Stamin-Up')]),
  g('vodka','Vodka · 4 possible spawns','Co-op only. One player stands below the bottle; another knifes it. A missed bottle breaks and respawns, so check the next spot before another catch.',[
   cotd('bottle_below_the_box','Lighthouse'),cotd('bottle_box','Lighthouse'),cotd('bottle_mpl','Ship'),cotd('bottle_shortcut','Ship')]),
  g('radios','Quest radios · ordered 1–4','Co-op only. Use the radios in the numbered order. If four presses fail, wait for the buzz to finish and restart at number 1.',[
   cotd('radio_power','Ship','1 · Below power: on the computer by the Box location.'),cotd('radio_staminup','Stamin-Up','2 · Stamin-Up building: on the barrel.'),cotd('radio_crate','Ship','3 · Ship bow: inside the cargo crate by the zipline landing.'),cotd('radio_door','Lighthouse','4 · Quest-door room: on the cabinet below the stairs.')]),
  g('horns','Foghorns · ordered 1–4','Co-op only. Wait for the submarine to surface. The two lighthouse horns and two slide horns must be alternated in this order.',[
   cotd('horn_lighthouse_1','Lighthouse','1 · Pool of water beside the lighthouse.'),cotd('horn_speed_cola_1','Speed Cola slide','2 · Slide exit: turn right into the water.'),cotd('horn_lighthouse_2','Lighthouse','3 · Lighthouse wall, left of the building.'),cotd('horn_speed_cola_2','Speed Cola slide','4 · Behind the large rock on the slide-exit island.')]),
  g('pap','Pack-a-Punch · 3 beam destinations','Follow the current lighthouse beam. Only its active destination has the machine; upgrade promptly and collect your weapon.',[
   photo('call-of-the-dead','pap/pap_spawn','Spawn'),photo('call-of-the-dead','pap/pap_behind_lighthouse','Lighthouse'),photo('call-of-the-dead','pap/pap_jug','Ship')],'setup')
 ]},
 'bo1-shang-locations':{map:'shangri-la',section:'dials',groups:[
  g('walls','Twelve wall tiles','During the wall-tile eclipse, melee each tile until it glows. These fixed wall tiles are separate from the random matching floor tiles. Filter by your route through the map.',[
   ['tile_minecart_start','Minecart'],['tile_below_dynamite','Minecart'],['tile_minecart_spikes','Minecart'],['tile_quick_machine_left','Spawn'],['tile_quick_machine_right','Spawn'],['tile_spikes_mud','Mud Room'],['tile_pap_stairs','Spawn'],['tile_mud_water_slide','Mud Room'],['tile_pm63','Waterfall'],['tile_stakeout','Waterfall'],['tile_stakeout_2','Waterfall'],['tile_power','Power']
  ].map(([id,region])=>photo('shangri-la',`main_ee/${id}`,region)),'dials'),
  g('dials','Mud-room dial reference','After the twelve wall tiles and distant teepee, enter a fresh eclipse. Enter Mud Room from Spawn and work clockwise starting on your left: 4, 3, 16, 1.',[
   photo('shangri-la','main_ee/first_dial','Mud Room'),photo('shangri-la','main_ee/shang_dials_cheat_sheet','Mud Room')])
 ]},
 'bo1-moon-labs':structuredClone(remasterAtlases['bo3-moon-labs'])
}
for(const group of classicAtlases['bo1-moon-labs'].groups)group.section=group.id==='cable'?'device':'simon'
// Photographs from the original main quest, with the original weapon landmarks.
export const classicGongs=[
 ['gong_rope_bottom','Bridge bottom'],['gong_rope_pm63_left','Bridge top · left'],['gong_rope_pm63_right','Bridge top · right'],['gong_mud_spikes','Mud Room exit'],['gong_m14','Spawn · M14'],['gong_minecart_start','Minecart start'],['gong_down_the_slope','Minecart slope'],['gong_right_of_tunnel','Tunnel entrance']
].map(([id,name],i)=>({...photo('shangri-la',`main_ee/${id}`,name),name,key:`gong-${i}`}))
export const classicSections={'bo1-cotd-dials':'dials','bo1-shang-tiles':'tiles','bo1-shang-gongs':'stone','bo1-moon-simon':'simon',...Object.fromEntries(Object.entries(classicAtlases).map(([id,a])=>[id,a.section]))}

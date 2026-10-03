<script setup>
import {gongLocations,gongResult} from '~/utils/chronicles.mjs'
const props=defineProps({state:Object,locations:{type:Array,default:()=>gongLocations},samantha:{type:Boolean,default:true}});const emit=defineEmits(['change']);const uid=useId();const result=computed(()=>gongResult(props.state,props.locations))
</script>
<template>
 <p class="chr-context">For the main quest, test during an eclipse after completing the crystal trials. A correct gong gives the positive sound/character cue; a wrong one flashes the crystals red. Leave uncertain gongs as “Untested”.</p>
 <div class="chr-status" :class="result.status" role="status">
  <strong>{{result.correct.length}} of 4 correct gongs recorded</strong>
  <p v-if="result.status==='invalid'">Only four can be correct and four wrong. Recheck your observations; no valid set can be shown yet.</p>
  <p v-else-if="result.status==='ready'">Ring {{result.correct.map(g=>g.name).join(', ')}} close together so all four sound at once. Confirm the crystals glow yellow in-game.</p>
  <p v-else>Record only what you have tested. A previous failure does not shuffle the correct set.</p>
 </div>
 <div class="chr-photo-grid"><div v-for="g in locations" :key="g.key" class="chr-location"><h3>{{g.name}}</h3><GuideIllustrations :images="[{src:g.src,alt:g.alt}]"/><label :for="`${uid}-${g.key}`">{{g.name}} result<select :id="`${uid}-${g.key}`" :value="state[g.key]" @change="emit('change',{...state,[g.key]:$event.target.value})"><option value="">Untested</option><option>Correct</option><option>Wrong</option></select></label></div></div>
 <details><summary>What to do after ringing the four correct gongs</summary><p><strong>Main quest:</strong> in the eclipse, use the Fractalizer to shoot the Minecart geyser crystal and catch the dynamite. Recharge the gongs, then shoot the Mud Room crystal to shrink the meteor.</p><template v-if="samantha"><p><strong>Samantha secret:</strong> with all four gongs ringing, use the starting pistol on the five pans at the bottom of the slide: leftmost twice, fifth/rightmost once. Then start the doll beside the Minecart Danger sign.</p><GuideIllustrations :images="[{src:'/images/chronicles/shangri-la/free_max_ammo/wall_with_pans.webp',alt:'Samantha pans: hit the first twice, then the fifth once with your starting pistol.'}]"/></template></details>
</template>

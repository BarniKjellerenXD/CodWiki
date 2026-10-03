<script setup>
import {mineSigns,signResult} from '~/utils/bo2.mjs'
import Bo2Glyph from './Bo2Glyph.vue'
const props=defineProps({state:Object})
const emit=defineEmits(['change'])
const active=ref(0)
const answer=computed(()=>signResult(props.state))
function choose(id){const next={...props.state,[`line-${active.value}`]:id};emit('change',next);const empty=[0,1,2].find(i=>!next[`line-${i}`]);if(empty!==undefined)active.value=empty}
</script>
<template>
 <div class="bo2-code-lines" role="group" aria-label="Choose a lantern-code line"><button v-for="(name,i) in ['Top line','Middle line','Bottom line']" :key="name" type="button" :aria-pressed="active===i" @click="active=i"><small>{{name}}</small><strong>{{mineSigns.find(s=>s.id===state[`line-${i}`])?.name||'Choose its shapes'}}</strong></button></div>
 <fieldset><legend>Match the {{['top','middle','bottom'][active]}} line’s first two shapes</legend><p class="chr-muted">Compare the white outline and the red stroke. Bone Orchard and Consumption Cross look almost identical; enlarge the full chart if needed.</p><div class="bo2-sign-palette"><button v-for="sign in mineSigns" :key="sign.id" type="button" :aria-pressed="state[`line-${active}`]===sign.id" :aria-label="`Match ${sign.name}: ${sign.label}`" @click="choose(sign.id)"><Bo2Glyph kind="sign" :symbol="sign.id"/><strong>{{sign.name}}</strong></button></div></fieldset>
 <section class="bo2-result" :class="answer.status" aria-live="polite" aria-atomic="true"><h3>Your mine signs</h3><p>{{answer.message}}</p><ol v-if="answer.signs"><li v-for="(sign,i) in answer.signs" :key="i">{{sign?.name||'Not matched yet'}}</li></ol></section>
 <p class="chr-context">Find these signs in the tunnels and strike them promptly with Galvaknuckles. On Maxis’s route, prepare a Time Bomb and live zombies before the last strike; the last sign changes the wisp’s route. If your set includes Consumption Cross, using it last gives the barn–saloon route explained in the guide.</p>
 <details><summary>Full cipher chart and where the code appears</summary><GuideIllustrations :images="[{src:'/images/bo2/buried/cipher-key.webp',alt:'Complete mine sign cipher. Match the red strokes as well as the white outlines.'},{src:'/images/bo2/buried/lantern-symbol-atop-the-gunsmith-roof.webp',alt:'Place the charged lantern on the Gunsmith roof symbol to reveal your match’s code.'}]"/></details>
</template>

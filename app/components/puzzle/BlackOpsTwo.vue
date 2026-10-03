<script setup>
import {toolDefinitions} from '~/utils/expansionTools.mjs'
import {toolSections} from '~/utils/bo2.mjs'
import Bo2Mahjong from './Bo2Mahjong.vue'
import Bo2Signs from './Bo2Signs.vue'
import Bo2Levers from './Bo2Levers.vue'
import Bo2Bells from './Bo2Bells.vue'
import ChroniclesSymbols from './ChroniclesSymbols.vue'
import '~/assets/css/chronicles.css'
import '~/assets/css/bo2.css'
const props=defineProps({tool:String})
const definition=computed(()=>toolDefinitions[props.tool])
const {state,change,undo,reset,canUndo,saveError}=usePuzzleState(props.tool)
const confirmReset=ref(false)
function update(next){change(next);confirmReset.value=false}
function clear(){reset();confirmReset.value=false}
</script>
<template>
 <div class="puzzle chronicles-workspace bo2-workspace">
  <p class="chr-intro">{{definition.help}}</p>
  <Bo2Mahjong v-if="tool==='bo2-die-rise-mahjong'" :state="state" @change="update"/>
  <Bo2Signs v-else-if="tool==='bo2-buried-signs'" :state="state" @change="update"/>
  <Bo2Levers v-else-if="tool==='bo2-buried-levers'" :state="state" @change="update"/>
  <Bo2Bells v-else-if="tool==='bo2-buried-bells'" :state="state" @change="update"/>
  <ChroniclesSymbols v-else :tool="tool" :state="state" @change="update"/>
  <div class="chr-actions"><button type="button" :disabled="!canUndo" @click="undo();confirmReset=false">Undo last change</button><button v-if="!confirmReset" type="button" @click="confirmReset=true">Reset this helper</button><template v-else><span>Clear this helper’s saved observations?</span><button type="button" @click="clear">Yes, clear</button><button type="button" @click="confirmReset=false">Keep them</button></template></div>
  <p v-if="saveError" class="chr-status invalid" role="alert">Your browser could not save these observations. Keep this page open or copy the result before leaving.</p>
  <p class="chr-muted">Saved in this browser, shared with the inline helper. Reset for a new match. <NuxtLink :to="`/guides/${definition.map}#details-${toolSections[tool]}`">Open this step in the map guide →</NuxtLink></p>
  <details class="chr-credit"><summary>Reference credits</summary><p>Game: Activision / Treyarch. Photographs and charts: COD Zombies Guides and its credited contributors. Origins shares the photographed symbol references with its Chronicles helper; BO2 observations are saved separately. See the <NuxtLink :to="`/guides/${definition.map}#guide-sources`">map’s source links</NuxtLink> for the original walkthroughs.</p></details>
 </div>
</template>

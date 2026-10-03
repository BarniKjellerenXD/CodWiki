<script setup>
import {toolDefinitions} from '~/utils/expansionTools.mjs'
import {locationAtlases} from '~/utils/chronicles.mjs'
import ChroniclesAtlas from './ChroniclesAtlas.vue'
import ChroniclesSymbols from './ChroniclesSymbols.vue'
import ChroniclesTiles from './ChroniclesTiles.vue'
import ChroniclesMemory from './ChroniclesMemory.vue'
import ChroniclesGongs from './ChroniclesGongs.vue'
import '~/assets/css/chronicles.css'
const props=defineProps({tool:String})
const definition=computed(()=>toolDefinitions[props.tool])
const {state,change,undo,reset,canUndo,saveError}=usePuzzleState(props.tool)
const confirmReset=ref(false)
function update(next){change(next);confirmReset.value=false}
function clear(){reset();confirmReset.value=false}
const section=computed(()=>locationAtlases[props.tool]?.section||({'bo3-origins-ice':'upgrades','bo3-origins-fire':'upgrades','bo3-shang-tiles':'tiles','bo3-shang-gongs':'stone','bo3-moon-simon':'simon','bo3-kino-knocks':'secrets'})[props.tool])
</script>
<template>
 <div class="puzzle chronicles-workspace">
  <p class="chr-intro">{{definition.help}}</p>
  <ChroniclesAtlas v-if="locationAtlases[tool]" :tool="tool" :state="state" @change="update" />
  <ChroniclesSymbols v-else-if="tool==='bo3-origins-ice'||tool==='bo3-origins-fire'" :tool="tool" :state="state" @change="update" />
  <ChroniclesTiles v-else-if="tool==='bo3-shang-tiles'" :state="state" @change="update" />
  <ChroniclesGongs v-else-if="tool==='bo3-shang-gongs'" :state="state" @change="update" />
  <ChroniclesMemory v-else :tool="tool" :state="state" @change="update" />
  <div class="chr-actions">
   <button type="button" :disabled="!canUndo" @click="undo();confirmReset=false">Undo last change</button>
   <button v-if="!confirmReset" type="button" @click="confirmReset=true">Reset this helper</button>
   <template v-else><span>Clear this helper’s saved observations?</span><button type="button" @click="clear">Yes, clear</button><button type="button" @click="confirmReset=false">Keep them</button></template>
  </div>
  <p v-if="saveError" class="chr-status invalid" role="alert">Your browser could not save these observations. Keep this page open or copy the result before leaving.</p>
  <p class="chr-muted">Observations save in this browser. Reset for a new match. <NuxtLink :to="`/guides/${definition.map}#details-${section}`">Open this step in the map guide →</NuxtLink></p>
  <details class="chr-credit"><summary>Image sources</summary><p>Gameplay: Activision / Treyarch. Screenshots and symbol references: mmmrkennedy, COD Zombies Guides, Glitching Queen and the r/CODZombies community, as applicable. Some shared-layout references show the original release. The <NuxtLink :to="`/guides/${definition.map}#guide-sources`">map’s sources</NuxtLink> credit the walkthroughs and their contributors.</p></details>
 </div>
</template>

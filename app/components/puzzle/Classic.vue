<script setup>
import {toolDefinitions} from '~/utils/expansionTools.mjs'
import {classicAtlases,classicGongs,classicToolSection} from '~/utils/classic.mjs'
import ChroniclesAtlas from './ChroniclesAtlas.vue'
import ChroniclesTiles from './ChroniclesTiles.vue'
import ChroniclesMemory from './ChroniclesMemory.vue'
import ChroniclesGongs from './ChroniclesGongs.vue'
import ClassicDials from './ClassicDials.vue'
import '~/assets/css/chronicles.css'
const props=defineProps({tool:String})
const definition=computed(()=>toolDefinitions[props.tool])
const {state,change,undo,reset,canUndo,saveError}=usePuzzleState(props.tool)
const confirmReset=ref(false)
const section=computed(()=>classicToolSection(props.tool,state.value))
function update(next){change(next);confirmReset.value=false}
function clear(){reset();confirmReset.value=false}
</script>
<template>
 <div class="puzzle chronicles-workspace classic-workspace">
  <p class="chr-intro">{{definition.help}}</p>
  <ClassicDials v-if="tool==='bo1-cotd-dials'" :state="state" @change="update" />
  <ChroniclesAtlas v-else-if="classicAtlases[tool]" :tool="tool" :atlas-override="classicAtlases[tool]" :state="state" @change="update" />
  <ChroniclesTiles v-else-if="tool==='bo1-shang-tiles'" :state="state" @change="update" />
  <ChroniclesGongs v-else-if="tool==='bo1-shang-gongs'" :locations="classicGongs" :samantha="false" :state="state" @change="update" />
  <ChroniclesMemory v-else :tool="tool" :state="state" @change="update" />
  <div class="chr-actions">
   <button type="button" :disabled="!canUndo" @click="undo();confirmReset=false">Undo last change</button>
   <button v-if="!confirmReset" type="button" @click="confirmReset=true">Reset this helper</button>
   <template v-else><span>Clear this helper’s saved observations?</span><button type="button" @click="clear">Yes, clear</button><button type="button" @click="confirmReset=false">Keep them</button></template>
  </div>
  <p v-if="saveError" class="chr-status invalid" role="alert">Your browser could not save these observations. Keep this page open or copy the result before leaving.</p>
  <p class="chr-muted">Saved for this BO1 helper in this browser. <NuxtLink :to="`/guides/${definition.map}#details-${section}`">Open this step in the map guide →</NuxtLink></p>
  <details class="chr-credit"><summary>Image sources and editions</summary><p>Gameplay: Activision / Treyarch. Photographs and symbol references: mmmrkennedy, COD Zombies Guides and their credited community contributors. Shared-location photographs can show a remaster; the instructions and weapon landmarks here describe Black Ops (2010). See the <NuxtLink :to="`/guides/${definition.map}#guide-sources`">map’s sources</NuxtLink>.</p></details>
 </div>
</template>

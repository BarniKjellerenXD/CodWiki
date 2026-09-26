<script setup lang="ts">
import { ingredients } from '~/utils/puzzles.mjs'
const {state,change,undo,reset,canUndo,saveError}=usePuzzleState('serum')
const active=ref(0)
const chosen=computed(()=>state.value.slots.map((id:string)=>ingredients.find(g=>g.id===id)))
const duplicate=computed(()=>state.value.slots.filter(Boolean).length!==new Set(state.value.slots.filter(Boolean)).size)
function pick(id:string) { const slots=state.value.slots.slice(); slots[active.value]=id; change({slots}); const next=slots.indexOf(null); if(next>=0) active.value=next }
</script>
<template><div class="puzzle">
  <p>Match the chalkboard in Yuri’s Lab <strong>top to bottom</strong>. Select a row, then its Pigpen word.</p>
  <div class="p-grid"><button v-for="(label,i) in ['Top','Middle','Bottom']" :key="label" :aria-pressed="active===i" @click="active=i"><small>{{ i+1 }} · {{ label }}</small><br>{{ chosen[i]?.name || 'Choose symbol' }}</button></div>
  <div class="p-grid"><button v-for="g in ingredients" :key="g.id" class="p-card" :aria-label="`${g.word}: ${g.name}`" @click="pick(g.id)"><span class="pigpen-symbol" aria-hidden="true">{{ g.word }}</span><strong>{{ g.word }}</strong><span>{{ g.name }}</span></button></div>
  <div class="p-result" aria-live="polite"><strong>Interact with these ingredients</strong><ol class="p-sequence"><li v-for="(g,i) in chosen" :key="i"><small>{{ i+1 }}</small><img v-if="g" :src="`/tools/ashes-serum/${g.id}.png`" alt="" width="48" height="48"><span>{{ g?.name || '—' }}</span></li></ol><p v-if="duplicate" class="p-error">An ingredient is selected twice. Recheck the chalkboard rows.</p><span v-else-if="chosen.every(Boolean)">Then add blood at the central beaker and charge the serum with zombie souls.</span></div>
  <details><summary>Where to collect the ingredients</summary><p v-for="g in ingredients" :key="g.id"><strong>{{ g.name }}:</strong> {{ g.hint }}</p><p>The Powder of the Forgotten reveals the chalkboard. Collection order does not determine this sequence.</p></details>
  <PuzzleActions :can-undo="canUndo" :save-error="saveError" @undo="undo" @reset="reset" />
</div></template>

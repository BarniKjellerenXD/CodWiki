<script setup lang="ts">
import { noteLocations, noteOrder, pianoCode } from '~/utils/puzzles.mjs'
const {state,change,undo,reset,canUndo,saveError}=usePuzzleState('notes')
const result=computed(()=>noteOrder(state.value.counts))
const current=ref(0)
watch(state,()=>current.value=0)
function set(i:number,value:string|number) {const counts=state.value.counts.slice(); counts[i]=value===''?null:Number(value); change({counts})}
function infer() {set(state.value.counts.indexOf(null),result.value.missing[0])}
</script>
<template><div class="puzzle">
  <p><strong>Destroyed Nuketown:</strong> record how many times each blue note blinks. Collect them from 1 blink to 8 blinks.</p>
  <div class="notes-layout"><div class="note-inputs"><label v-for="(location,i) in noteLocations" :key="location.id"><span>{{ location.name }}<small>{{ location.hint }}</small></span><select :aria-label="`${location.name} blink count`" :value="state.counts[i] ?? ''" @change="set(i,($event.target as HTMLSelectElement).value)"><option value="">—</option><option v-for="n in 8" :key="n" :value="n">{{ n }}</option></select></label></div>
  <div class="p-result" aria-live="polite"><strong>{{ result.complete?'Pickup order ready':'Pickup order · incomplete' }}</strong><p v-if="result.duplicates.length" class="p-error">Count {{ result.duplicates.join(', ') }} is assigned twice. Recheck those notes.</p><p v-if="result.missing.length" class="p-muted">Missing counts: {{ result.missing.join(', ') }}</p><ol class="note-route"><li v-for="note in result.assigned" :key="note.id" :value="note.count">{{ note.name }}</li></ol><button v-if="result.assigned.length===7 && !result.duplicates.length" @click="infer">Use inferred count {{ result.missing[0] }} for the remaining location</button>
    <details v-if="result.complete"><summary>Follow the pickup route</summary><p>{{ current+1 }} / 8 · <strong>{{ result.assigned[current]?.name }}</strong></p><div class="p-row"><button :disabled="current===0" @click="current--">Back</button><button :disabled="current===7" @click="current++">Next location</button></div></details>
  </div></div>
  <details class="piano" open><summary>Normal Nuketown · piano reference</summary><p>After collecting all eight notes, return to Green House and play:</p><div class="p-sequence"><strong v-for="(key,i) in pianoCode" :key="i">{{ key }}</strong></div><div class="piano-keys" role="img" aria-label="Piano white keys numbered 1 through 8 from left to right"><span v-for="key in 8" :key="key">{{ key }}</span></div><p class="p-muted">Number the white keys from left to right. This fixed tune is separate from the randomized outdoor pickup order.</p></details>
  <details><summary>Location photos</summary><p class="p-muted">Reference photos from <a href="https://codzombiesguides.com/main-quests/black-ops-7/paradox-junction/" target="_blank" rel="noopener noreferrer">Call of Duty: Zombies Guides</a>.</p><div class="p-grid"><figure v-for="location in noteLocations" :key="location.id"><a :href="location.image" target="_blank" rel="noopener noreferrer"><img :src="location.image" :alt="location.name" loading="lazy" style="width:100%;height:auto"></a><figcaption>{{ location.name }}</figcaption></figure></div></details>
  <PuzzleActions :can-undo="canUndo" :save-error="saveError" @undo="undo" @reset="reset" />
</div></template>
<style scoped>
.notes-layout {display:grid;grid-template-columns:1fr 1fr;gap:1rem;align-items:start}.note-inputs label{display:flex;flex-direction:row;align-items:center;justify-content:space-between;gap:.5rem;padding:.35rem 0;border-bottom:1px solid var(--wp-line)}.note-inputs small{display:block;font-weight:400;font-size:.73rem;color:var(--wp-muted)}.note-inputs select{width:4rem;flex:none}.note-route{list-style:decimal;padding-left:1.4rem;line-height:1.65}.piano{margin-top:1rem}.piano-keys{display:flex;max-width:24rem;margin:.6rem 0}.piano-keys span{flex:1;padding:1.8rem 0 .3rem;text-align:center;background:#eae8e1;color:#252321;border:1px solid #666;border-radius:0 0 4px 4px}.p-sequence strong{font-size:1.15rem;padding:.35rem .55rem}@media(max-width:650px){.notes-layout{grid-template-columns:1fr}}
</style>

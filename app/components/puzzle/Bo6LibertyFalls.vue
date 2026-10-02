<script setup lang="ts">
import {straussReadings,straussRoute} from '~/utils/bo6Launch.mjs'
const props=defineProps<{tool:string}>()
const {state,change,undo,reset,canUndo,saveError}=usePuzzleState(props.tool)
const projectors=computed(()=>straussRoute(state.value))
const confirmReset=ref(false)
function read(key:string,value:string){change({...state.value,[key]:value})}
</script>
<template>
 <div class="puzzle bo6-liberty">
   <p>Take the Strauss Counter after returning your first charged canister. Stand beside each projector, hold the tactical button to read the counter, then choose its reading here. The target below is the <strong>projector’s light</strong>.</p>
   <section v-for="projector in projectors" :key="projector.id" class="projector"><h3>{{projector.name}}</h3><p>{{projector.location}}</p><GuideIllustrations :images="[{src:projector.image,alt:projector.name+' projector location'}]" /><div class="reading-buttons" :aria-label="projector.name+' counter reading'" role="group"><button v-for="reading in straussReadings" :key="reading.value" :aria-pressed="state[projector.id]===reading.value" @click="read(projector.id,reading.value)"><span :class="['swatch',reading.value]" aria-hidden="true"></span>{{reading.name}}</button></div><div class="setting" role="status" aria-live="polite"><template v-if="projector.target"><span>Set this projector to</span><strong><span :class="['swatch',projector.target]" aria-hidden="true"></span>{{projector.target.toUpperCase()}}</strong></template><p v-else>Choose the counter reading to see the target.</p></div></section>
   <p class="muted">Projector interactions cycle Green → Yellow → Red. When all three lamps are set correctly, their beams meet at Pump & Pay and release the second canister.</p>
  <div class="actions"><button :disabled="!canUndo" @click="undo">Undo last change</button><button @click="confirmReset=!confirmReset">Reset helper</button></div><div v-if="confirmReset" class="result"><p>Clear this helper’s saved observations?</p><div class="actions"><button @click="reset();confirmReset=false">Clear observations</button><button @click="confirmReset=false">Keep observations</button></div></div><p v-if="saveError" role="alert">Your browser could not save these observations. Keep this page open.</p><p class="muted">Saved on this device; inline and full-page helpers share observations.</p>
 </div>
</template>
<style scoped>
.bo6-liberty{line-height:1.6;color:var(--text);min-width:0}.bo6-liberty p{margin:.7rem 0}.bo6-liberty h3{font-size:1rem;margin:.2rem 0}.bo6-liberty button{min-height:44px;padding:.55rem .75rem;font:inherit;color:var(--text);background:var(--surface-2);border:1px solid var(--line);border-radius:7px;cursor:pointer}.bo6-liberty button[aria-pressed=true],.bo6-liberty button:hover:not(:disabled){border-color:var(--gold);background:var(--gold-dim)}.bo6-liberty button:disabled{opacity:.45;cursor:default}.bo6-liberty :focus-visible{outline:2px solid var(--gold);outline-offset:3px}.projector{margin:1.4rem 0;padding-top:1rem;border-top:1px solid var(--line)}.projector :deep(.guide-illustrations){max-width:560px}.reading-buttons{display:flex;gap:.5rem;flex-wrap:wrap;margin:1rem 0}.swatch{display:inline-block;width:14px;height:14px;border-radius:50%;margin-right:.45rem;vertical-align:middle;border:1px solid #ffffff66}.swatch.red{background:#dd706a}.swatch.yellow{background:#efcf6b}.swatch.green{background:#78b68b}.setting,.result{padding:.85rem 1rem;border:1px solid var(--line);background:var(--surface-2);border-radius:8px}.setting>span{font-size:.78rem}.setting strong{display:block;color:var(--gold);font-size:1.4rem;margin:.25rem 0}.actions{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:1rem}.muted{font-size:.78rem;color:var(--muted)}.bo6-liberty a{color:var(--gold)}
</style>

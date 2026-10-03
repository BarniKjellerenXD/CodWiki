<script setup>
import {lighthouseDials,lighthouseResult} from '~/utils/classic.mjs'
const props=defineProps({state:Object})
const emit=defineEmits(['change'])
const uid=useId()
const result=computed(()=>lighthouseResult(props.state))
</script>
<template>
 <div class="classic-dial-layout">
  <fieldset class="classic-dial-inputs"><legend>Read the lighthouse from top to bottom</legend>
   <div v-for="d in lighthouseDials" :key="d.id" class="classic-floor" :class="`classic-${d.id}`">
    <div><span class="classic-floor-label">{{d.floor}}</span><label :for="`${uid}-${d.id}`">{{d.name}} <span class="chr-muted">· current digit</span></label></div>
    <select :id="`${uid}-${d.id}`" :value="state[d.id]" @change="emit('change',{...state,[d.id]:$event.target.value})"><option value="">Read…</option><option v-for="n in 10" :key="n" :value="String(n-1)">{{n-1}}</option></select>
   </div>
  </fieldset>
  <section class="classic-dial-answer" aria-live="polite" aria-atomic="true">
   <h3>{{result.status==='ready'?'Turn each dial this many times':'Your turn instructions'}}</h3>
   <p v-if="result.status!=='ready'" class="chr-muted">{{result.message}}</p>
   <template v-else>
    <p class="classic-total">{{result.message}}</p>
    <ol class="classic-turns"><li v-for="d in result.turns" :key="d.id"><span>{{d.name}}</span><strong>{{d.count}}</strong><span>{{d.count===0?'leave it':d.count===1?'turn':'turns'}}</span></li></ol>
    <p>{{result.total?'Apply all four counts in any order. Don’t correct a neighbouring dial midway through.':'No more turns needed. Continue when the green beam is active.'}}</p>
   </template>
   <p class="classic-target"><span>Final digits · top → bottom</span><strong>2 <i>·</i> 7 <i>·</i> 4 <i>·</i> 6</strong></p>
  </section>
 </div>
 <p class="chr-context">One press advances that dial and its immediate neighbours by 1; 9 wraps to 0. If a turn is missed or added, read the four new digits and replace your inputs to get a fresh solution.</p>
 <details><summary>Find the four dials and see which ones move together</summary><div class="chr-photo-grid"><div v-for="d in lighthouseDials" :key="d.id" class="chr-location"><h3>{{d.floor}} · {{d.name}}</h3><GuideIllustrations :images="[{src:d.src,alt:d.alt}]"/><p>One {{d.name.toLowerCase()}} turn moves {{d.affected.join(' + ')}}.</p></div></div></details>
</template>
<style scoped>
.classic-dial-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(250px,.9fr);gap:2rem;align-items:start}
.classic-dial-layout fieldset{margin:0}.classic-floor{display:grid;grid-template-columns:minmax(0,1fr) 6.25rem;gap:1rem;align-items:center;padding:.85rem 0 .85rem 1rem;border-left:4px solid var(--dial-colour);border-bottom:1px solid var(--chr-border)}
.classic-yellow{--dial-colour:#e4c56c}.classic-orange{--dial-colour:#eeac72}.classic-blue{--dial-colour:#7dacf4}.classic-purple{--dial-colour:#c5a1e8}.classic-floor-label{display:block;color:var(--muted);font-size:.82rem;margin-bottom:.25rem}.classic-floor select{font-size:1.15rem;margin:0}.classic-floor label .chr-muted{font-size:.84rem;font-weight:400}
.classic-dial-answer{padding-top:1rem;border-top:2px solid var(--gold);position:sticky;top:5rem}.classic-dial-answer h3{margin:0}.classic-total{font-size:1.1rem;color:var(--gold)}.classic-turns{list-style:none;padding:0;margin:1rem 0}.classic-turns li{display:grid;grid-template-columns:1fr 3rem 5rem;gap:.5rem;align-items:baseline;padding:.55rem 0;border-bottom:1px solid var(--chr-border)}.classic-turns strong{font-size:1.8rem;color:var(--gold);text-align:right}.classic-turns li>span:last-child{color:var(--muted);font-size:.9rem}.classic-target{padding-top:1rem;border-top:1px solid var(--chr-border)}.classic-target span{display:block;font-size:.82rem;color:var(--muted)}.classic-target strong{display:block;font-size:1.8rem;letter-spacing:.08em;margin-top:.35rem}.classic-target i{font-style:normal;color:var(--muted)}
@media(max-width:740px){.classic-dial-layout{grid-template-columns:1fr;gap:1.5rem}.classic-dial-answer{position:static}.classic-floor{gap:.5rem;padding-left:.75rem}.classic-floor label .chr-muted{display:block}.classic-turns{display:grid;grid-template-columns:1fr 1fr;gap:0 1.2rem}.classic-turns li{grid-template-columns:1fr auto;gap:.25rem}.classic-turns li>span:last-child{grid-column:2;text-align:right;font-size:.8rem}.classic-turns strong{font-size:1.55rem}.classic-dial-answer>p{margin-bottom:.8rem}}
</style>

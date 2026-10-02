<script setup lang="ts">
import { alphaRooms, alphaClockRoute, alphaFinalCode, tagRiddleLocations, findTagRiddles } from '~/utils/bo4AlphaTag.mjs'
import AlphaClock from './AlphaClock.vue'
const props=defineProps<{tool:string}>()
const {state,change,undo,reset,canUndo,saveError}=usePuzzleState(props.tool)
const confirmReset=ref(false)
const isClock=computed(()=>props.tool==='bo4-alpha-clocks')
const route=computed(()=>alphaClockRoute(state.value))
const finalCode=computed(()=>route.value.status==='ready'?alphaFinalCode(state.value['final-hour'],state.value['final-minute']):null)
const kind=computed(()=>state.value.kind||'All')
const results=computed(()=>findTagRiddles(state.value.search||'',kind.value))
const selected=computed(()=>tagRiddleLocations.find(row=>row.key===state.value.clue))
const selectedPanel=ref<HTMLElement|null>(null)
const fieldId=useId()
function update(key:string,value:any) {change({...state.value,[key]:value})}
function clueInput(event:Event,i:number) {
  const value=(event.target as HTMLInputElement).value.toUpperCase().replace(/\s/g,'')
  change({...state.value,[`slot-${i}`]:value,[`done-${i}`]:false,'final-hour':'','final-minute':''})
}
async function choose(key:string) {update('clue',key);await nextTick();selectedPanel.value?.focus({preventScroll:true});selectedPanel.value?.scrollIntoView({behavior:'smooth',block:'nearest'})}
</script>
<template>
  <div class="puzzle alpha-tag-tool">
    <template v-if="isClock">
      <p class="eyebrow">TV broadcast → clock route → keypad</p>
      <p>Record all five clues in the order spoken. Each starts with a house letter and ends with four time digits. For example, <strong>A0115</strong> means Yellow House at 1:15.</p>
      <div class="clue-inputs"><label v-for="i in 5" :key="i" :for="`${fieldId}-clue-${i}`">TV clue {{i}}<input :id="`${fieldId}-clue-${i}`" :value="state[`slot-${i-1}`]" maxlength="5" placeholder="A0115" autocomplete="off" autocapitalize="characters" spellcheck="false" @input="clueInput($event,i-1)" /></label></div>
      <p class="result" :class="route.status" role="status" aria-live="polite">{{route.message}}</p>
      <ol v-if="route.clues.length" class="clock-route">
        <li v-for="clue in route.clues" :key="clue.index" :class="{done:state[`done-${clue.index}`]}">
          <span class="order">{{clue.index+1}}</span><AlphaClock :hour="clue.hour" :minute="clue.minute" :label="`${clue.room}: target ${clue.time}`" />
          <div class="clock-info"><strong>{{clue.letter}} · {{clue.room}}</strong><span class="time">{{clue.time}}</span><span class="controls">Interact = +15 minutes<br />Melee = +1 hour</span><label class="check"><input type="checkbox" :checked="state[`done-${clue.index}`]" :disabled="route.status!=='ready'" @change="update(`done-${clue.index}`,($event.target as HTMLInputElement).checked)" />Set in game</label></div>
        </li>
      </ol>
      <section v-if="route.remaining" class="remaining">
        <p class="eyebrow">Read this clock yourself</p><h3>{{route.remaining}} · {{alphaRooms[route.remaining]}}</h3>
        <p>After setting the five clocks, interact with this remaining clock and wait for it to stop spinning. Enter the time it actually shows below.</p>
        <div class="final-reading"><label :for="`${fieldId}-hour`">Hour<select :id="`${fieldId}-hour`" :value="state['final-hour']" @change="update('final-hour',($event.target as HTMLSelectElement).value)"><option value="">Choose hour</option><option v-for="n in 12" :key="n" :value="String(n)">{{n}}</option></select></label><label :for="`${fieldId}-minute`">Minute<select :id="`${fieldId}-minute`" :value="state['final-minute']" @change="update('final-minute',($event.target as HTMLSelectElement).value)"><option value="">Choose minute</option><option v-for="n in ['00','15','30','45']" :key="n" :value="n">{{n}}</option></select></label><AlphaClock v-if="finalCode" :hour="Number(state['final-hour'])" :minute="Number(state['final-minute'])" label="Your observed final clock reading" /></div>
        <div v-if="finalCode" class="result keypad-result" role="status" aria-live="polite"><span>Enter at Rushmore</span><strong>{{finalCode}}</strong><p>Keep all four digits, including the leading zero. Wait for Rushmore’s confirmation, then interact with him again.</p></div><p v-else class="muted">The five TV clues identify the remaining room. They do not reveal its final time.</p>
      </section>
      <details><summary>Clock recognition and room key</summary><GuideIllustrations :images="[{src:'/images/bo4-alpha-omega/alpha-omega-clock.webp',alt:'The circular wall clock upstairs in Yellow House; the target time changes each run'}]" /><dl class="room-key"><template v-for="(room,letter) in alphaRooms" :key="letter"><dt>{{letter}}</dt><dd>{{room}}</dd></template></dl><p class="muted">The drawn faces are target-time diagrams. They are not screenshots of your current match. If the sequence fails, advance a round and read the broadcast again.</p></details>
    </template>
    <template v-else>
      <p class="eyebrow">Match the spoken clue to its photographed landmark</p>
      <p>Collect three offerings first. The later Seal clue reveals a hidden safe that needs dynamite. Search narrows the cards; select the matching clue to keep its instructions open.</p>
      <div class="filters"><label :for="`${fieldId}-search`">Words from the clue or location<input :id="`${fieldId}-search`" :value="state.search" type="search" placeholder="e.g. lungs, bread, or Boathouse" @input="update('search',($event.target as HTMLInputElement).value)" /></label><label :for="`${fieldId}-kind`">Clue type<select :id="`${fieldId}-kind`" :value="kind" @change="update('kind',($event.target as HTMLSelectElement).value)"><option>All</option><option>Offering</option><option>Seal</option></select></label></div>
      <section v-if="selected" ref="selectedPanel" tabindex="-1" class="selected-riddle"><span class="eyebrow">Selected {{selected.kind}}</span><h3>“{{selected.clue}}”</h3><strong>{{selected.location}}</strong><GuideIllustrations :images="[{src:selected.image,alt:selected.location}]" /><p>{{selected.action}}</p><button class="quiet-button" @click="update('clue','')">Clear selected clue</button></section>
      <p class="muted" role="status" aria-live="polite">{{results.length}} matching {{results.length===1?'clue':'clues'}}. {{selected?'Your selected clue stays open while filtering.':''}}</p>
      <div v-if="results.length" class="riddle-grid"><button v-for="row in results" :key="row.key" class="riddle-card" :aria-pressed="state.clue===row.key" @click="choose(row.key)"><img :src="row.image" :alt="row.location" loading="lazy" width="1280" height="720" /><span class="eyebrow">{{row.kind}}</span><strong>“{{row.clue}}”</strong><span>{{row.location}}</span></button></div>
      <div v-else class="result"><p>No matching clue. Try one distinctive word, such as “cages” or “bread”, and check the clue type.</p><button @click="change({...state,search:'',kind:'All'})">Show all clues</button></div>
      <p class="muted">Screenshots: <a href="https://www.codzombiesguides.com/main-quests/black-ops-4/tag-der-toten/" target="_blank" rel="noopener noreferrer">COD Zombies Guides</a>. Landmark descriptions checked against <a href="https://www.reddit.com/r/CODZombies/comments/da2wgh/all_20_offering_locations/" target="_blank" rel="noopener noreferrer">Glitchalodon’s offering reference</a>.</p>
    </template>
    <div class="actions"><button :disabled="!canUndo" @click="undo">Undo last change</button><button @click="confirmReset=!confirmReset">Reset helper</button></div>
    <div v-if="confirmReset" class="result"><p>Clear this helper’s saved observations?</p><div class="actions"><button @click="reset();confirmReset=false">Clear observations</button><button @click="confirmReset=false">Keep observations</button></div></div>
    <p v-if="saveError" role="alert">The browser could not save these observations. Keep this page open.</p>
    <p class="muted">Saved on this device. Inline and full-page helpers share the same observations.</p>
  </div>
</template>
<style scoped>
.alpha-tag-tool{color:var(--text);line-height:1.65;min-width:0}.alpha-tag-tool p{margin:.8rem 0}.eyebrow{display:block;font-size:.7rem;letter-spacing:.09em;text-transform:uppercase;color:var(--gold)}.alpha-tag-tool h3{font-size:1.2rem;margin:.4rem 0}.alpha-tag-tool button,.alpha-tag-tool input,.alpha-tag-tool select{font:inherit}.alpha-tag-tool button{min-height:44px;padding:.55rem .8rem;color:var(--text);background:var(--surface-2);border:1px solid var(--line);border-radius:7px;cursor:pointer}.alpha-tag-tool button:hover:not(:disabled),.alpha-tag-tool button[aria-pressed=true]{border-color:var(--gold);background:var(--gold-dim)}.alpha-tag-tool button:disabled{opacity:.45;cursor:default}.alpha-tag-tool :focus-visible{outline:2px solid var(--gold);outline-offset:3px}.alpha-tag-tool input:not([type=checkbox]),.alpha-tag-tool select{display:block;margin-top:.35rem;min-height:44px;width:100%;padding:.5rem .65rem;border:1px solid var(--line);border-radius:6px;color:var(--text);background:var(--surface)}.alpha-tag-tool label{font-size:.8rem}.clue-inputs{display:grid;grid-template-columns:repeat(auto-fit,minmax(95px,1fr));gap:.65rem}.clue-inputs input{font-family:monospace;letter-spacing:.08em}.result,.remaining,.selected-riddle{border:1px solid var(--line);border-left:3px solid var(--gold);border-radius:8px;padding:1rem;margin:1rem 0;background:var(--surface-2)}.result.invalid{border-left-color:#e69772}.clock-route{list-style:none;margin:1rem 0;padding:0;display:grid;gap:.7rem;grid-template-columns:repeat(auto-fit,minmax(min(100%,295px),1fr))}.clock-route li{display:flex;align-items:center;gap:.65rem;padding:.85rem;border:1px solid var(--line);border-radius:8px;background:var(--surface-2)}.clock-route li.done{border-color:#789d7e}.order{align-self:flex-start;color:var(--gold);font-weight:700}.clock-info{min-width:0;display:flex;flex-direction:column;gap:.3rem}.clock-info>strong{font-size:.86rem}.time{font-weight:700;font-size:1.3rem;color:var(--gold)}.controls{font-size:.73rem;color:var(--muted)}.check{display:flex;gap:.5rem;align-items:center;min-height:44px}.check input{accent-color:var(--gold);height:18px;width:18px}.final-reading{display:flex;align-items:center;gap:1rem;flex-wrap:wrap}.final-reading label{min-width:120px;flex:1}.keypad-result>strong{display:block;letter-spacing:.2em;font-size:2rem;font-family:monospace;color:var(--gold)}.keypad-result>span{font-size:.8rem}.room-key{display:grid;grid-template-columns:30px 1fr;gap:.4rem}.room-key dt{font-weight:700;color:var(--gold)}.room-key dd{margin:0}.alpha-tag-tool summary{cursor:pointer;min-height:44px;padding:.6rem 0;color:var(--gold)}.filters{display:grid;grid-template-columns:minmax(0,1fr) 120px;gap:.7rem}.riddle-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:.8rem;margin:1rem 0}.riddle-grid .riddle-card{padding:0 0 .8rem;text-align:left;display:flex;flex-direction:column;align-items:flex-start;overflow:hidden;gap:.3rem}.riddle-card img{width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;margin-bottom:.4rem}.riddle-card>span,.riddle-card>strong{padding:0 .75rem}.riddle-card>strong{font-size:.86rem}.riddle-card>span:last-child{font-size:.75rem;color:var(--muted)}.selected-riddle:deep(.guide-illustrations){display:block}.selected-riddle:deep(figure){max-width:760px}.actions{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:1rem}.muted{font-size:.78rem;color:var(--muted)}.alpha-tag-tool a{color:var(--gold)}@media(max-width:400px){.filters{grid-template-columns:1fr}.clock-route li{padding:.65rem;gap:.4rem}.clock-route :deep(.alpha-clock){width:96px;height:96px}}
</style>

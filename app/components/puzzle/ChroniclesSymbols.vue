<script setup>
import {iceSymbols,fireSymbols} from '~/utils/chronicles.mjs'
import ChroniclesGlyph from './ChroniclesGlyph.vue'
const props=defineProps({tool:String,state:Object})
const emit=defineEmits(['change'])
const ice=computed(()=>props.tool==='bo3-origins-ice')
const selected=computed(()=>iceSymbols.find(s=>s.label===props.state.pattern))
const torches=computed(()=>fireSymbols.filter(s=>props.state[`fire-${s.id}`]))
const instructions=computed(()=>ice.value?(selected.value?'Use the Ice Staff. Read the tablet again after the shot and select its new pattern.':'Choose the pattern you see on the tablet. Its matching ceiling rune will appear here.'):(torches.value.length===4?'Find these downstairs in Church. Shoot them with the Fire Staff quickly enough that all four burn together. Any order is fine.':'Select all four before using a result. The blood smear marks torch 4; it has no chalk numeral.'))
function choose(s){emit('change',ice.value?{...props.state,pattern:s.label}:{...props.state,[`fire-${s.id}`]:!props.state[`fire-${s.id}`]})}
</script>
<template>
 <div class="chr-symbol-solver">
  <div class="chr-symbol-input">
   <fieldset><legend>{{ice?'What is on the blue tablet?':'Which four patterns glow upstairs?'}}</legend>
    <p class="chr-muted">{{ice?'Match the whole pattern, including hollow circles and vertical pairs. These reference images preserve the actual shapes.':'Select glowing patterns only. Hollow rings count as part of a pattern; an unlit wall symbol does not.'}}</p>
    <div class="chr-palette" :class="{'chr-fire-palette':!ice}">
     <button v-for="s in ice?iceSymbols:fireSymbols" :key="s.id" type="button" :aria-label="`${ice?'Select':'Toggle'} ${s.label}`" :aria-pressed="ice?selected?.id===s.id:!!state[`fire-${s.id}`]" @click="choose(s)"><ChroniclesGlyph :kind="ice?'ice-input':'fire'" :symbol="s.id"/><small>{{s.label}}</small></button>
    </div>
   </fieldset>
   <p class="chr-mobile-instructions">{{instructions}}</p>
  </div>
  <section class="chr-answer" aria-live="polite" aria-atomic="true">
   <template v-if="ice">
    <h3>{{selected?'Shoot this ceiling rune':'Your matching rune'}}</h3>
    <ChroniclesGlyph kind="ice-output" :symbol="selected?.id" />
    <p v-if="selected" class="chr-rune-name"><strong>{{selected.rune}}</strong></p>
    <p class="chr-answer-description">{{instructions}}</p>
   </template>
   <template v-else>
    <h3>{{torches.length===4?'Light these four torches':`${torches.length} of 4 patterns selected`}}</h3>
    <p v-if="torches.length>4" class="chr-status invalid">Too many selected. Deselect the patterns that are not glowing in your match.</p>
    <div v-else-if="torches.length===4" class="chr-torches"><strong v-for="s in torches" :key="s.id">{{s.value===4?'Blood (4)':s.value}}</strong></div>
    <p class="chr-answer-description">{{instructions}}</p>
   </template>
  </section>
 </div>
 <details><summary>{{ice?'Where to look, and the full symbol chart':'Where to look, and the full torch chart'}}</summary><GuideIllustrations :images="ice?[
  {src:'/images/chronicles/origins/origins-ice-symbol-tile.webp',alt:'Read the blue tablet beside the Ice area in the Crazy Place.'},
  {src:'/images/chronicles/origins/origins-ice-floating-tiles.webp',alt:'Shoot the corresponding rune on these overhead tiles.'},
  {src:'/images/chronicles/origins/origins-ice-cipher-key.webp',alt:'Complete Ice tablet-to-rune reference.'}
 ]:[
  {src:'/images/chronicles/origins/origins-fire-puzzle.webp',alt:'The glowing patterns upstairs in Church, after the cauldrons are complete.'},
  {src:'/images/chronicles/origins/origins-fire-puzzle-cipher.webp',alt:'Complete Fire pattern-to-torch reference. The blood mark represents 4.'}
 ]"/></details>
</template>

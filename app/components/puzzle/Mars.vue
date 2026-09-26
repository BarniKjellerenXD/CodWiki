<script setup lang="ts">
import { planets } from '~/utils/puzzles.mjs'
const {state,change,undo,reset,canUndo,saveError}=usePuzzleState('mars')
const active=ref(0)
function pick(n:number) { const slots=state.value.slots.slice(); slots[active.value]=n; change({slots}); const next=slots.indexOf(null); if(next>=0) active.value=next }
</script>
<template><div class="puzzle"><p>Select the three planets from O.S.C.A.R.’s recording, in spoken order.</p><div class="p-row"><button v-for="(n,i) in state.slots" :key="i" :aria-label="`Edit planet ${i+1}`" :aria-pressed="active===i" @click="active=i">{{ i+1 }} · {{ n?planets[n-1]:'Choose planet' }}</button></div><div class="p-grid"><button v-for="(planet,i) in planets" :key="planet" @click="pick(i+1)">{{ planet }}</button></div><div class="p-result" aria-live="polite"><strong>Observatory Dome terminal</strong><ol class="p-sequence"><li v-for="(n,i) in state.slots" :key="i"><b>{{ n || '—' }}</b></li></ol><p class="p-muted">This is the three-digit code by distance from the Sun. The telescope’s four-digit Mars DEC code is a separate step.</p></div><PuzzleActions :can-undo="canUndo" :save-error="saveError" @undo="undo" @reset="reset" /></div></template>

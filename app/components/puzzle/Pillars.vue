<script setup lang="ts">
import {pillarRiddles,pillarLevers} from '~/utils/puzzles.mjs'
const {state,change,undo,reset,canUndo,saveError}=usePuzzleState('pillars')
const result=computed(()=>pillarRiddles[state.value.riddle])
</script>
<template><div class="puzzle"><p>Match the opening words of the riddle in Dravakar Sanctuary.</p><div class="p-grid"><button v-for="(riddle,i) in pillarRiddles" :key="i" :aria-pressed="state.riddle===i" @click="change({riddle:i})">{{ riddle.label }}</button></div><div v-if="result" class="p-result" aria-live="polite"><strong>Pull counts from the starting positions</strong><div class="p-grid"><div v-for="(lever,i) in pillarLevers" :key="lever"><b>{{ lever }}</b><p>{{ result.counts[i]===0?'Leave alone':result.counts[i]+' pulls' }}</p></div></div><p>Then use the confirm switch on the center pillar.</p></div><p class="p-muted">These counts assume no earlier pulls. Resetting this helper only clears your recorded riddle; it does not reset the in-game pillars.</p><PuzzleActions :can-undo="canUndo" :save-error="saveError" @undo="undo" @reset="reset" /></div></template>

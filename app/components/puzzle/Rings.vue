<script setup lang="ts">
import { ringNames, ringStops, temples } from '~/utils/puzzles.mjs'
import { planRingRoute } from '~/utils/ringRoute.mjs'
const { state, change, undo, reset, canUndo, saveError } = usePuzzleState('rings')
const active = ref(0)
const route = ref<any>(null)
const playback = ref(0)
const ready = computed(() => state.value.positions.every((n: any) => Number.isInteger(n)))
const shown = computed(() => route.value ? route.value.states[playback.value] : state.value.positions)
const rotations = computed(() => {
  const values = state.value.positions.map((n: number | null) => (n ?? 0) * 60)
  for (const [ring, direction] of route.value?.moves.slice(0, playback.value) || []) values.forEach((_: number, i: number) => { values[i] += direction * (i === ring ? 60 : 120) })
  return values
})
const currentMove = computed(() => playback.value ? route.value?.moves[playback.value - 1] : null)
const currentTemple = computed(() => shown.value.every((n: number | null) => n === shown.value[0]) && temples.includes(shown.value[0]) ? ringStops[shown.value[0]] : null)
function clearPreview() { route.value = null; playback.value = 0 }
watch(state, clearPreview, { deep: true, flush: 'sync' })
function place(stop: number) {
  const positions = state.value.positions.slice(); positions[active.value] = stop
  change({ ...state.value, positions })
  const missing = positions.findIndex((n: any) => n === null)
  if (missing >= 0) active.value = missing
}
function setMode(tour: boolean) { change({ ...state.value, target: tour ? 'tour' : temples[0] }) }
function toggleCompleted(temple: number) {
  const visited = state.value.visited.includes(temple) ? state.value.visited.filter((n: number) => n !== temple) : [...state.value.visited, temple]
  change({ ...state.value, visited })
}
function generate() {
  playback.value = 0
  route.value = planRingRoute(state.value.positions, state.value.target, state.value.visited)
}
function adoptPreview() { change({ ...state.value, positions: shown.value.slice() }); generate() }
function completeNext() {
  const next = route.value?.legs[0]
  if (!next) return
  const positions = route.value.states[next.press].slice()
  change({ ...state.value, positions, visited: [...new Set([...state.value.visited, next.temple])] })
  generate()
}
const directionName = (direction: number) => direction === 1 ? 'Clockwise' : 'Counter-clockwise'
</script>

<template>
  <div class="puzzle workbench rings-workbench">
    <p class="wb-intro">Set the three pillars as they are in your game. Find the fewest presses through every temple, then follow the route one temple at a time.</p>
    <div class="wb-mode" role="group" aria-label="Route mode">
      <button type="button" :aria-pressed="state.target==='tour'" @click="setMode(true)">All four temples</button>
      <button type="button" :aria-pressed="state.target!=='tour'" @click="setMode(false)">One temple</button>
    </div>
    <div class="wb-columns ring-layout">
      <section class="wb-panel ring-panel" aria-label="Ring positions and visualiser">
        <div class="wb-panel-heading"><div><span class="wb-eyebrow">THE NEXUS</span><h2>{{ route ? 'Route preview' : 'Current positions' }}</h2></div><button v-if="route" type="button" class="wb-subtle" @click="clearPreview">Edit positions</button></div>
        <div class="ring-pickers" role="group" aria-label="Choose a pillar to position">
          <button v-for="(name,i) in ringNames" :key="name" type="button" :aria-pressed="active===i" :disabled="!!route" @click="active=i"><span class="ring-letter" :class="`ring-letter-${i}`">{{ name[0] }}</span><span>{{ name }}<small>{{ state.positions[i]===null?'Not set':ringStops[state.positions[i]] }}</small></span></button>
        </div>
        <PuzzleRingDiagram :positions="shown" :rotations="rotations" :active="active" :preview="!!route" @place="place" />
        <p v-if="!route" class="wb-caption">Tap a named stop to place the <strong>{{ ringNames[active] }}</strong> pillar. Empty and House are positions, not temples.</p>
        <template v-else>
          <div class="ring-playback"><button type="button" :disabled="playback===0" aria-label="Preview previous press" @click="playback--">←</button><span>Press <strong>{{ playback }}</strong> / {{ route.presses }}</span><button type="button" :disabled="playback===route.presses" aria-label="Preview next press" @click="playback++">→</button></div>
          <p class="preview-action" role="status">{{ currentMove ? `${ringNames[currentMove[0]]} · ${directionName(currentMove[1])}` : 'Your recorded starting positions' }}</p>
          <div class="ring-position-readout"><span v-for="(name,i) in ringNames" :key="name">{{ name }} <b>{{ ringStops[shown[i]] }}</b></span></div>
          <p v-if="currentTemple" class="wb-caption">Aligned at <strong>{{ currentTemple }}</strong>. {{ state.visited.includes(shown[0]) ? 'This temple is already marked complete.' : 'Complete its quest before moving on.' }}</p>
          <button type="button" class="wb-adopt" :disabled="playback===0" @click="adoptPreview">Use shown positions &amp; replan</button>
          <p class="wb-caption">Use this only when the in-game pillars match the preview. Previewing alone changes no saved progress.</p>
        </template>
      </section>

      <section class="wb-panel ring-route" aria-label="Temple route">
        <div class="wb-panel-heading"><div><span class="wb-eyebrow">ROUTE PLANNER</span><h2>{{ state.target==='tour'?'Through the temples':'Align to a temple' }}</h2></div></div>
        <fieldset v-if="state.target==='tour'" class="wb-field"><legend>Already completed <span>optional</span></legend><div class="temple-toggles"><button v-for="temple in temples" :key="temple" type="button" :aria-pressed="state.visited.includes(temple)" @click="toggleCompleted(temple)"><span aria-hidden="true">{{ state.visited.includes(temple)?'✓':'○' }}</span> {{ ringStops[temple] }}</button></div></fieldset>
        <label v-else class="wb-field">Destination<select :value="state.target" @change="change({...state,target:Number(($event.target as HTMLSelectElement).value)})"><option v-for="temple in temples" :key="temple" :value="temple">{{ ringStops[temple] }}</option></select></label>
        <button type="button" class="wb-primary" :disabled="!ready" @click="generate">{{ state.target==='tour' ? (state.visited.length ? 'Find shortest remaining route' : 'Find shortest route through all 4') : 'Find shortest alignment' }} <span aria-hidden="true">→</span></button>
        <p v-if="!ready" class="wb-caption">Set all three current positions to calculate a route.</p>
        <p v-else class="wb-caption">Fewest presses first. Fewer direction changes break ties.</p>
        <div v-if="route" class="route-output">
          <div class="route-stats" role="status"><div><strong>{{ route.presses }}</strong><span>ring presses</span></div><div><strong>{{ route.switches }}</strong><span>direction changes</span></div></div>
          <p v-if="state.target==='tour' && state.visited.length===4" class="wb-success">All temples marked complete.</p>
          <p v-else-if="route.presses===0" class="wb-success">Already aligned — finish this temple before moving.</p>
          <ol v-if="route.legs.length" class="temple-itinerary" aria-label="Temple visit order"><li v-for="(leg,i) in route.legs" :key="leg.temple"><button type="button" :aria-label="`Preview arrival at ${leg.name}`" @click="playback=leg.press"><span>{{ i+1 }}</span>{{ leg.name }}</button><span v-if="i<route.legs.length-1" aria-hidden="true">→</span></li></ol>
          <details v-for="(leg,i) in route.legs" :key="leg.temple" class="route-leg" :open="i===0">
            <summary><span class="leg-number">{{ i+1 }}</span><strong>{{ leg.name }}</strong><span>{{ leg.presses }} {{ leg.presses===1?'press':'presses' }}</span></summary>
            <p v-if="!leg.presses" class="wb-caption">You are here now. Complete the temple quest first.</p>
            <ol v-else class="route-instructions"><li v-for="(group,j) in leg.groups" :key="j"><span class="turn-icon" aria-hidden="true">{{ group.direction===1?'↻':'↺' }}</span><div><strong>{{ ringNames[group.ring] }} × {{ group.count }}</strong><span>{{ directionName(group.direction) }}</span></div><button type="button" :aria-label="`Preview ${leg.name}, instruction ${j+1}`" @click="playback=group.to">Preview</button></li></ol>
            <p class="temple-stop">Stop here and complete {{ leg.name }}’s quest.</p>
            <button v-if="i===0 && state.target==='tour'" type="button" class="wb-continue" @click="completeNext">Temple completed — continue →</button>
          </details>
        </div>
        <div v-else class="wb-empty"><span aria-hidden="true">◎</span><strong>Your route will appear here</strong><p>See every temple stop and exactly which ring to turn.</p></div>
      </section>
    </div>
    <details class="wb-help"><summary>How the rings move</summary><p>One press moves the chosen ring one stop and the other two rings two stops, in the lever’s direction. Match the direction before each instruction. Follow tour instructions in order so you do not skip an alignment.</p></details>
    <PuzzleActions :can-undo="canUndo" :save-error="saveError" @undo="undo" @reset="reset" />
  </div>
</template>

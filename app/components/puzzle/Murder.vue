<script setup lang="ts">
import { zodiac } from '~/utils/puzzles.mjs'
import { murderSuspects, murderSymptoms, murderPaintings, murderItems, solveMurder } from '~/utils/murder.mjs'
const { state, change, undo, reset, canUndo, saveError } = usePuzzleState('murder')
const result = computed(() => solveMurder(state.value))
const itemLabels = murderItems as Record<string, string>
const animalName = (i: number) => i===3?'Hare / Rabbit':i===11?'Boar / Pig':zodiac[i]
function choose(field: string, value: string | number) { change({ ...state.value, [field]: state.value[field] === value ? null : value }) }
function dialPosition(i: number) { const a=(i*30-90)*Math.PI/180; return {left:`${(50+Math.cos(a)*40).toFixed(3)}%`,top:`${(50+Math.sin(a)*40).toFixed(3)}%`} }
const missing = computed(() => ['', 'Choose accomplice', result.value.status==='unknown'?'Recheck the two clues':'Choose accomplice + symptom', 'Choose painting', ''])
const solutionId = `murder-solution-${useId()}`
const answer = ref<HTMLElement | null>(null)
function showSolution() { answer.value?.scrollIntoView({ block: 'start' }); answer.value?.focus({ preventScroll: true }) }
</script>

<template>
  <div class="puzzle workbench murder-workbench">
    <p class="wb-intro">Match the clues from your game. Your evidence placements and zodiac dial update as you go.</p>
    <button type="button" class="wb-jump" :aria-controls="solutionId" @click="showSolution">Jump to placements &amp; dial ↓</button>
    <div class="wb-columns murder-layout">
      <section class="wb-panel murder-clues" aria-label="Murder clues">
        <div class="wb-panel-heading"><div><span class="wb-eyebrow">GATHER YOUR CLUES</span><h2>What did you find?</h2></div><span class="wb-counter">{{ [state.suspect,state.symptom,state.hour,state.delay,state.painting].filter(v=>v!==null).length }} / 5</span></div>
        <fieldset class="wb-field"><legend><span class="clue-number">1</span> Accomplice <span>Ghost witness</span></legend><div class="evidence-grid"><PuzzleEvidenceCard v-for="suspect in murderSuspects" :key="suspect.id" :label="suspect.name" :image="`/tools/kowakujo-murder/${suspect.item}.png`" :selected="state.suspect===suspect.id" @select="choose('suspect',suspect.id)" /></div></fieldset>
        <fieldset class="wb-field"><legend><span class="clue-number">2</span> Cause of death <span>Doctor’s Record</span></legend><div class="symptom-choices"><button v-for="symptom in murderSymptoms" :key="symptom.id" type="button" :aria-pressed="state.symptom===symptom.id" @click="choose('symptom',symptom.id)"><strong>{{ symptom.name }}</strong><span>{{ symptom.hint }}</span></button></div>
          <div v-if="result.poison" class="poison-deduction" role="status"><img :src="`/tools/kowakujo-murder/${result.poison}.png`" alt="" width="40" height="40"><span>These clues point to <strong>{{ itemLabels[result.poison] }}</strong></span></div>
          <p v-else-if="result.status==='unknown'" class="wb-warning" role="status">Recheck the accomplice and symptom. This combination is not documented; no poison has been guessed.</p>
        </fieldset>
        <fieldset class="wb-field"><legend><span class="clue-number">3</span> Time of death <span>Doctor’s Record</span></legend><div class="animal-choices" role="group" aria-label="Death-time animal"><button v-for="(animal,i) in zodiac" :key="animal" type="button" :aria-pressed="state.hour===i" :aria-label="animalName(i)" @click="choose('hour',i)"><img :src="`/tools/zodiac/${animal.toLowerCase()}.svg`" alt="" width="30" height="30"><span>{{ i===3?'Hare':i===11?'Boar':animal }}</span></button></div></fieldset>
        <fieldset class="wb-field"><legend><span class="clue-number">4</span> Poison delay <span>Toxin Note · positions back</span></legend><div class="delay-choices"><button v-for="n in 5" :key="n" type="button" :aria-pressed="state.delay===n" :aria-label="`Subtract ${n} ${n===1?'position':'positions'}`" @click="choose('delay',n)">{{ n }}</button></div><p v-if="result.dial!==null" class="wb-caption">Set the zodiac dial to <strong>{{ animalName(result.dial) }}</strong>.</p></fieldset>
        <fieldset class="wb-field"><legend><span class="clue-number">5</span> Fourth painting <span>Match the background</span></legend><div class="evidence-grid painting-choices"><PuzzleEvidenceCard v-for="painting in murderPaintings" :key="painting.id" :label="painting.name" :image="`/tools/kowakujo-murder/painting-${painting.id}.png`" :selected="state.painting===painting.id" @select="choose('painting',painting.id)" /></div></fieldset>
      </section>

      <section :id="solutionId" ref="answer" class="wb-panel murder-answer" aria-label="Murder solution" tabindex="-1">
        <div class="wb-panel-heading"><div><span class="wb-eyebrow">YOUR SOLUTION</span><h2>Place beneath the paintings</h2></div></div>
        <p class="wb-caption placement-direction">Left to right in the Meditation Room <span aria-hidden="true">→</span></p>
        <ol class="murder-placements" aria-label="Evidence placement order">
          <li v-for="(item,i) in result.items" :key="i" :class="{ unresolved: !item }"><span class="placement-number">{{ i+1 }}</span><span class="placement-art"><img v-if="item" :src="`/tools/kowakujo-murder/${item}.png`" alt="" width="80" height="80"><span v-else aria-hidden="true">?</span></span><span class="placement-name">{{ item ? itemLabels[item] : missing[i] }}</span></li>
        </ol>
        <div class="murder-dial-panel">
          <div class="wb-panel-heading"><div><span class="wb-eyebrow">ZODIAC DIAL</span><h3>{{ result.dial===null?'Set the time clues':'Set dial to '+animalName(result.dial) }}</h3></div></div>
          <div class="zodiac-dial" role="img" :aria-label="result.dial===null?'Enter death-time animal and toxin delay':`From ${animalName(state.hour)}, move ${state.delay} positions anticlockwise to ${animalName(result.dial)}`">
            <svg viewBox="0 0 320 320" aria-hidden="true"><circle cx="160" cy="160" r="127" fill="none" stroke="var(--line-strong)"/><circle cx="160" cy="160" r="95" fill="none" stroke="var(--line)" stroke-dasharray="2 6"/><line v-if="result.dial!==null" x1="160" y1="160" x2="160" y2="63" :transform="`rotate(${result.dial*30} 160 160)`" stroke="var(--gold)" stroke-width="3" stroke-linecap="round"/></svg>
            <span v-for="(animal,i) in zodiac" :key="animal" class="dial-animal" :class="{ 'dial-start':state.hour===i, 'dial-answer':result.dial===i }" :style="dialPosition(i)"><img :src="`/tools/zodiac/${animal.toLowerCase()}.svg`" alt="" width="28" height="28"><small>{{ i===3?'Hare':i===11?'Boar':animal }}</small></span>
            <span class="dial-centre"><span v-if="result.dial===null">Choose animal<br>and delay</span><template v-else><img :src="`/tools/zodiac/${zodiac[result.dial].toLowerCase()}.svg`" alt="" width="32" height="32"><strong>{{ result.dial===3?'Hare':result.dial===11?'Boar':zodiac[result.dial] }}</strong></template></span>
          </div>
          <div class="dial-legend"><span><i class="legend-start"/> Death time</span><span><i class="legend-result"/> Set dial here</span></div>
          <p class="dial-explanation" role="status">{{ result.dial===null ? 'Choose the animal from the Doctor’s Record and the delay from the Toxin Note.' : `Move ${state.delay} ${state.delay===1?'position':'positions'} anticlockwise from ${animalName(state.hour)}.` }}</p>
        </div>
        <p v-if="result.items.every(Boolean) && result.dial!==null" class="wb-success">All clues resolved. Match these placements and the dial in your game.</p>
      </section>
    </div>
    <details class="wb-help"><summary>Where to find the clues</summary><p>Get kills with a Ghostly Rifleman trap, then speak to the ghost witness. The accomplice and the Doctor’s Record symptom together identify the poison. The same record gives the death-time animal; the Toxin Note gives the delay. The fourth painting’s background selects its evidence item.</p><p>Combination reference: <a href="https://margwa.net/kowakujo-murder-solver.html" target="_blank" rel="noopener noreferrer">Margwa’s Murder Case Solver</a>. Unknown combinations stay unresolved.</p></details>
    <PuzzleActions :can-undo="canUndo" :save-error="saveError" @undo="undo" @reset="reset" />
  </div>
</template>

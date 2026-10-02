<script setup lang="ts">
import { raSymbols, dormantHands, hands, danuStages, danuWait, tributeResult } from '~/utils/chaosTools.mjs'
import RaGlyph from './RaGlyph.vue'
const props = defineProps<{ tool: string }>()
const { state, change, undo, reset, canUndo, saveError } = usePuzzleState(props.tool)
const activeSlot = ref(0)
const search = ref('')
const confirmReset = ref(false)
const clueChoices = computed(() => dormantHands.filter(item => `${item.clue} ${item.location}`.toLowerCase().includes(search.value.toLowerCase())))
const clue = computed(() => dormantHands.find(item => item.clue === state.value.clue))
const tribute = computed(() => tributeResult(state.value))
const completeSequence = computed(() => [0, 1, 2, 3].every(i => state.value[`slot-${i}`]))
const nextTarget = computed(() => [0, 1, 2, 3].find(i => !state.value[`done-${i}`]))
const danuChecks = [
  [{id:'check-0',label:'Wood collected'},{id:'check-1',label:'Wood placed over cauldron'},{id:'check-4',label:'Charred wood collected'}],
  [{id:'check-5',label:'Bone meal collected'},{id:'check-6',label:'Dung collected'},{id:'check-7',label:'All ingredients mixed'},{id:'check-10',label:'Ready fertilizer collected'}],
  [{id:'check-11',label:'Fertilizer planted'},{id:'planted-ready',label:'Green smoke visible'},{id:'check-12',label:'Fire Bomb caused blue cracks'}]
]
const rewardTiers = [{id:'common',name:'Common',value:'0.5'}, {id:'rare',name:'Rare',value:'1'}, {id:'legendary',name:'Legendary',value:'4'}, {id:'epic',name:'Epic',value:'6'}]
const attackCues:Record<string,string> = { Stands: 'Use a NORMAL shot at your colored zombies in the stands.', Floor: 'Use a CHARGED shot at your colored zombies on the floor.', Grayscale: 'Return to your HOME circle at the entrance.', 'No matching circle': 'Stay on your HOME circle until your hand is called.' }
function update(key:string, value:string|boolean) { change({ ...state.value, [key]:value }) }
function input(event:Event, key:string) { update(key, (event.target as HTMLInputElement).value) }
function chooseGlyph(name:string) {
  const next = { ...state.value, [`slot-${activeSlot.value}`]:name }
  for (let i = activeSlot.value; i < 4; i++) next[`done-${i}`] = false
  change(next)
  if (activeSlot.value < 3) activeSlot.value++
}
function markTarget(index:number) {
  const next = { ...state.value, [`done-${index}`]: !state.value[`done-${index}`] }
  if (!next[`done-${index}`]) for (let i = index + 1; i < 4; i++) next[`done-${i}`] = false
  change(next)
}
function freshDisplay() {
  change({ ...state.value, ...Object.fromEntries([0,1,2,3].flatMap(i => [[`slot-${i}`, ''], [`done-${i}`, false]])) })
  activeSlot.value = 0
}
function increment(key:string, amount:number) {
  const old = Number(state.value[key] || 0)
  update(key, String(Math.min(999, Math.max(0, (Number.isFinite(old) ? old : 0) + amount))))
}
function resetAll() { reset(); activeSlot.value = 0; confirmReset.value = false }
</script>

<template>
  <div class="puzzle chaos-tool">
    <template v-if="tool === 'bo4-ix-ra'">
      <p class="eyebrow">Look at the shape · record the display · kill in order</p>
      <p>Select a numbered slot, then tap the matching blue glyph below. The next slot opens automatically.</p>
      <div class="ra-slots" role="group" aria-label="Recorded obelisk sequence">
        <div v-for="i in 4" :key="i" class="target-card" :class="{finished:state[`done-${i-1}`]}">
          <button type="button" :aria-pressed="activeSlot === i-1" :aria-label="`Edit symbol ${i}${state[`slot-${i-1}`] ? ': '+state[`slot-${i-1}`] : ': not recorded'}`" @click="activeSlot=i-1">
            <span class="slot-number">{{ i }}</span><RaGlyph :name="state[`slot-${i-1}`] || ''" />
            <strong>{{ state[`slot-${i-1}`] || 'Choose symbol' }}</strong>
          </button>
          <button type="button" class="kill-button" :disabled="!completeSequence || (i > 1 && !state[`done-${i-2}`])" :aria-pressed="state[`done-${i-1}`]" @click="markTarget(i-1)">{{ state[`done-${i-1}`] ? '✓ Killed' : 'Mark killed' }}</button>
        </div>
      </div>
      <p class="p-muted">Choosing symbol {{ activeSlot+1 }}. The glyphs are authentic image references; names underneath tell you the corresponding enemy.</p>
      <div class="glyph-picker" role="group" aria-label="Obelisk glyph choices">
        <button v-for="symbol in raSymbols" :key="symbol.name" type="button" :aria-label="`Choose ${symbol.name} glyph for symbol ${activeSlot+1}`" @click="chooseGlyph(symbol.name)"><RaGlyph :name="symbol.name" /><span>{{ symbol.name }}</span></button>
      </div>
      <div class="p-result" role="status" aria-live="polite">
        <template v-if="!completeSequence">Record all four symbols before following the kill order.</template>
        <template v-else-if="nextTarget !== undefined"><strong>Next: {{ state[`slot-${nextTarget}`] }}</strong><br />Target {{ nextTarget+1 }} of 4. Avoid killing other special enemies.</template>
        <template v-else>All four targets marked. Wait for in-game success, then record the next display. Ra needs two successful displays.</template>
      </div>
      <button type="button" @click="freshDisplay">New display — clear these four targets</button>
      <p class="p-muted">Glyph chart: <a href="https://www.reddit.com/r/CODZombies/wiki/ix/" target="_blank" rel="noopener noreferrer">r/CODZombies IX community guide</a>.</p>
    </template>

    <template v-else-if="tool === 'bo4-ix-danu'">
      <p class="eyebrow">Three separate waits · trust the visual readiness cue</p>
      <label class="round-input">Current round<input type="text" inputmode="numeric" maxlength="3" :value="state['current-round']" placeholder="e.g. 15" @input="input($event,'current-round')" /></label>
      <div class="danu-grid">
        <section v-for="(stage,index) in danuStages" :key="stage.id" class="chaos-card">
          <h3>{{ index+1 }}. {{ stage.title }}</h3><p class="p-muted">{{ stage.location }}</p>
          <label>Placed during round<input type="text" inputmode="numeric" maxlength="3" :value="state[`${stage.id}-round`]" placeholder="Round" @input="input($event,`${stage.id}-round`)" /></label>
          <p class="wait-cue" aria-live="polite">{{ danuWait(stage.id,state[`${stage.id}-round`],state['current-round']) }}</p>
          <label v-for="item in danuChecks[index]" :key="item.id" class="check-line"><input type="checkbox" :checked="state[item.id]" @change="update(item.id,!state[item.id])" />{{ item.label }}</label>
        </section>
      </div>
      <p class="p-result">After the blue cracks appear, gather every player on them for about 15 seconds. In the defense, destroy the red tree growth and move upstairs when each floor opens.</p>
      <p class="p-muted">The round estimate excludes your partial placement round. Special rounds and the bowl’s readiness can vary; no checkbox here advances the game.</p>
    </template>

    <template v-else-if="tool === 'bo4-ancient-hands'">
      <p class="eyebrow">Find a Dormant Hand from the Oracle’s clue</p>
      <label>Search a word from the clue<input v-model="search" type="search" placeholder="e.g. serpent, fountain, purple" /></label>
      <label>Choose the phrase you heard<select :value="state.clue" @change="input($event,'clue')"><option value="">Choose an Oracle clue</option><option v-if="clue && !clueChoices.includes(clue)" :value="clue.clue">{{ clue.clue }} (saved)</option><option v-for="item in clueChoices" :key="item.clue" :value="item.clue">{{ item.clue }}</option></select></label>
      <p v-if="!clueChoices.length" class="p-muted">No matching clue. Try a shorter word or clear the search.</p>
      <div v-if="clue" class="clue-result" aria-live="polite"><strong>{{ clue.location }}</strong><p>Melee the purple-glowing object, then pick up the hand. Any Dormant Hand can be used at any god’s shrine.</p><GuideIllustrations :images="[{src:clue.image,alt:clue.location}]" /></div>
      <p v-else class="p-muted">Enable subtitles and listen near the Oracle in the Temple of Apollo. She repeats a clue until that hand is found.</p>
      <div class="hands-grid">
        <section v-for="(hand,i) in hands" :key="hand.name" class="chaos-card hand-card" :style="{'--hand-color':hand.color}">
          <h3><span class="color-dot" aria-hidden="true"></span>{{ hand.name }}</h3><p class="p-muted">{{ hand.shrine }}</p>
          <p class="hand-requirement">{{ hand.need }}</p>
          <div class="stage-checks"><label v-for="(stage,j) in ['Fallen','Redeemed','Exalted']" :key="stage" class="check-line"><input type="checkbox" :checked="state[`check-${i*3+j}`]" @change="update(`check-${i*3+j}`,!state[`check-${i*3+j}`])" />{{ stage }}</label></div>
          <details><summary>Redeemed route and pickup checklist</summary><p>{{ hand.action }}</p><label v-for="(task,j) in hand.tasks" :key="task" class="check-line"><input type="checkbox" :checked="state[`part-${i}-${j}`]" @change="update(`part-${i}-${j}`,!state[`part-${i}-${j}`])" />{{ task }}</label></details>
          <p class="p-muted">Optional Exalted shrine charge: {{ hand.catalyst }} Catalyst.</p>
        </section>
      </div>
      <p class="p-muted">Location screenshots: <a href="https://mmmrkennedy.com/games/BO4/ancient_evil/ancient_evil_guide" target="_blank" rel="noopener noreferrer">mmmrkennedy’s Ancient Evil guide</a>. Exalted is optional; every player needs a Redeemed hand for theater.</p>
    </template>

    <template v-else-if="tool === 'bo4-ancient-tribute'">
      <p class="eyebrow">Claimed rewards across the whole team</p>
      <label>Players in this match<select :value="state.players" @change="input($event,'players')"><option value="">Choose player count</option><option v-for="i in 4" :key="i" :value="String(i)">{{ i }} {{ i===1 ? 'player' : 'players' }}</option></select></label>
      <div class="rewards-grid">
        <section v-for="tier in rewardTiers" :key="tier.id" class="chaos-card"><h3>{{ tier.name }}</h3><p class="p-muted">{{ tier.value }} points per claimed reward</p><label>Rewards claimed<input type="text" inputmode="numeric" maxlength="3" :value="state[tier.id]" placeholder="0" :aria-label="`${tier.name} rewards claimed`" @input="input($event,tier.id)" /></label><div class="counter-buttons"><button type="button" :aria-label="`Remove one ${tier.name} reward`" @click="increment(tier.id,-1)">−</button><button type="button" :aria-label="`Add one ${tier.name} reward`" @click="increment(tier.id,1)">+ Claimed one</button></div></section>
      </div>
      <div class="p-result" role="status" aria-live="polite"><strong v-if="tribute.status==='ready'">{{ tribute.earned }} / {{ tribute.required }} tribute points</strong><p>{{ tribute.message }}</p><p v-if="tribute.status==='ready'">{{ tribute.suggestion }}</p></div>
      <p class="p-muted">Solo shortcut: one Epic + one Legendary = 10 points. Claim at the Temple pillars; unclaimed tiers do not count.</p>
    </template>

    <template v-else-if="tool === 'bo4-ancient-theater'">
      <p class="eyebrow">Assign Redeemed hands before stepping onto the home circles</p>
      <div class="assignment-grid"><label v-for="(hand,i) in hands" :key="hand.name" class="chaos-card" :style="{'--hand-color':hand.color}"><strong><span class="color-dot" aria-hidden="true"></span>{{ hand.name }}</strong><input type="text" maxlength="40" :value="state[`hand-${i}`]" placeholder="Player name / unused" @input="input($event,`hand-${i}`)" /></label></div>
      <p>What cue do you see?</p><div class="cue-buttons"><button v-for="(_,cue) in attackCues" :key="cue" type="button" :aria-pressed="state.cue === cue" @click="update('cue',String(cue))">{{ cue }}</button></div>
      <div class="p-result" role="status" aria-live="polite">{{ attackCues[state.cue] || 'Stand on your hand’s matching color. Wait for your stage circle to appear.' }}</div>
      <div class="performance-checks"><label v-for="i in 3" :key="i" class="check-line"><input type="checkbox" :checked="state[`performance-${i-1}`]" @change="update(`performance-${i-1}`,!state[`performance-${i-1}`])" />Performance {{ i }} successful</label></div>
      <p class="p-muted">Only mark in-game successes. Final white flash and rewards confirm completion. If ejected after failure, advance a round and retry.</p>
    </template>

    <PuzzleActions :can-undo="canUndo" :save-error="saveError" @undo="undo" @reset="confirmReset=true" />
    <div v-if="confirmReset" class="reset-confirm" role="alert"><p>Clear this helper’s saved observations?</p><button type="button" @click="resetAll">Clear this helper</button><button type="button" @click="confirmReset=false">Keep observations</button></div>
  </div>
</template>

<style scoped>
.chaos-tool{container-type:inline-size}.eyebrow{font-size:.72rem;text-transform:uppercase;letter-spacing:.09em;color:var(--gold-bright);font-weight:700}.chaos-tool h3{font-size:1rem;margin:0 0 .35rem;color:var(--text)}.chaos-tool input:not([type=checkbox]){width:100%;min-width:0;min-height:44px;background:var(--surface);border:1px solid var(--line-strong);border-radius:7px;padding:.5rem .7rem}.chaos-tool input[type=checkbox]{width:19px;height:19px;flex-shrink:0;accent-color:var(--gold)}.chaos-tool button:focus-visible,.chaos-tool input:focus-visible,.chaos-tool select:focus-visible{outline:2px solid var(--gold);outline-offset:3px}.chaos-tool .check-line{display:flex;flex-direction:row;align-items:center;gap:.6rem;min-height:40px;line-height:1.4}.chaos-card{padding:1rem;border:1px solid var(--line-strong);border-radius:10px;background:var(--surface-2);min-width:0}.ra-slots,.glyph-picker{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.55rem;margin:1rem 0}.target-card{min-width:0;display:flex;flex-direction:column;gap:.4rem}.target-card>button:first-child{position:relative;padding:.45rem;width:100%;height:100%}.target-card strong{display:block;font-size:.78rem;line-height:1.35;min-height:2.2em}.target-card.finished{opacity:.6}.slot-number{position:absolute;left:.5rem;top:.5rem;display:grid;place-items:center;background:var(--surface);border:1px solid var(--gold);border-radius:50%;width:23px;height:23px;font-weight:700;z-index:1}.glyph-picker button{padding:.5rem;display:flex;flex-direction:column;gap:.35rem;align-items:center}.glyph-picker span{font-size:.77rem;line-height:1.35}.kill-button{font-size:.76rem!important}.danu-grid,.hands-grid,.rewards-grid,.assignment-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem;margin:1rem 0}.danu-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.round-input{max-width:200px}.wait-cue{font-size:.81rem;border-left:2px solid var(--gold);padding-left:.7rem;margin:.9rem 0!important}.clue-result{margin:1rem 0;padding:1rem;border:1px solid var(--gold-border);border-radius:10px;background:var(--gold-dim)}.color-dot{display:inline-block;width:11px;height:11px;border-radius:50%;background:var(--hand-color);margin-right:.5rem}.hand-card{border-top:3px solid var(--hand-color)}.hand-requirement{font-size:.83rem;min-height:3em}.stage-checks{display:flex;gap:.65rem;flex-wrap:wrap}.stage-checks .check-line{font-size:.78rem}.counter-buttons,.cue-buttons,.performance-checks{display:flex;gap:.5rem;flex-wrap:wrap;margin:.6rem 0}.counter-buttons button{flex:1}.reset-confirm{border:1px solid var(--gold);border-radius:8px;padding:.8rem;margin-top:.6rem}.reset-confirm button{margin-right:.5rem}.assignment-grid input{margin-top:.4rem}@container(max-width:650px){.danu-grid{grid-template-columns:1fr}.hands-grid{grid-template-columns:1fr}.glyph-picker{grid-template-columns:repeat(4,minmax(0,1fr))}}@container(max-width:400px){.ra-slots{grid-template-columns:repeat(2,minmax(0,1fr))}.glyph-picker{grid-template-columns:repeat(2,minmax(0,1fr))}.rewards-grid,.assignment-grid{grid-template-columns:1fr}}
</style>

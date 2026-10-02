<script setup lang="ts">
import { evaluateTool, morseDigits } from '~/utils/expansionTools.mjs'
import { bloodSymbols } from '~/utils/bloodOfTheDead.mjs'
import { steadySimonPanels } from '~/utils/bloodSimon.mjs'
const props = defineProps<{ tool: string }>()
const { state, change, undo, reset, canUndo, saveError } = usePuzzleState(props.tool)
const isMorse = props.tool === 'bo4-blood-morse'
const result = computed(() => evaluateTool(props.tool, state.value))
const confirmReset = ref(false)
const showSymbols = computed(() => state.value['powerhouse-stage']==='symbols')
const rememberedPanels = computed(() => steadySimonPanels(state.value))
const cursor = ref(0)
const activeRow = ref(0)
const activeKind = ref<'source' | 'target'>('source')
const activeKey = computed(() => `${activeKind.value}-${activeRow.value}`)
const symbolChoices = computed(() => activeKind.value === 'source' ? ['1','2','3','4','5','6'] : ['A','B','C','D','E','F'])
const buoys = [
  { name: 'Upper Gondola', hint: 'Look out from the upper platform.', image: 'gondola' },
  { name: 'Recreation Yard', hint: 'Look out near the Swordfish wallbuy.', image: 'yard' },
  { name: 'Model Industries', hint: 'Look through the barrier toward the water.', image: 'model' }
]
function update(key:string, value:string|boolean) { change({ ...state.value, [key]: value }) }
function input(event:Event, key:string) { update(key, (event.target as HTMLInputElement).value) }
function decode(value:string) { return /^\d$/.test(value) ? Number(value) : morseDigits.indexOf(value) }
function appendPulse(i:number, pulse:string) {
  const current=state.value[`slot-${i}`]
  const prefix=/^[.-]*$/.test(current) ? current : ''
  if(prefix.length<5) update(`slot-${i}`,prefix+pulse)
}
const answerGroups = computed(() => isMorse && result.value.status==='ready' ? result.value.lines[1].split(' ') : [])
const pulses = computed(() => answerGroups.value.flatMap((group:string,digit:number)=>[...group].map((pulse,index)=>({pulse,digit,index}))))
watch(() => JSON.stringify(state.value), () => { cursor.value=0 })
const hasLegacy = computed(() => [0,1,2].some(i=>state.value[`generator-${i}`] || state.value[`number-${i}`] || state.value[`monitor-${i}`]))
function chooseSymbol(symbol:string) {
  const next={...state.value,[activeKey.value]:symbol,[`done-${activeRow.value}`]:false}
  // A new source observation invalidates its old translation, but never other rows.
  if(activeKind.value==='source' && state.value[activeKey.value]!==symbol) next[`target-${activeRow.value}`]=''
  change(next)
}
function selectCell(row:number, kind:'source'|'target') { activeRow.value=row; activeKind.value=kind }
const pickerId = useId()
</script>
<template>
  <div class="puzzle blood-tool">
    <template v-if="isMorse">
      <p class="eyebrow">Docks · decode → add → enter</p>
      <p>Look through the shield at each buoy. Enter its digit, type its five flashes, or use the dot and dash buttons. A short flash is a dot; a long flash is a dash.</p>
      <div class="buoy-grid">
        <section v-for="(buoy,i) in buoys" :key="buoy.name" class="buoy-card">
          <strong>{{ i+1 }}. {{ buoy.name }}</strong>
          <GuideIllustrations :images="[{src:`/images/blood-of-the-dead/buoy-${buoy.image}.webp`,alt:buoy.hint}]" />
          <label>Digit or five flashes<input :value="state[`slot-${i}`]" maxlength="5" :aria-label="`${buoy.name} digit or Morse`" placeholder="4 or ....-" autocomplete="off" spellcheck="false" @input="input($event,`slot-${i}`)" /></label>
          <div class="actions pulse-input">
            <button :disabled="/^[.-]{5}$/.test(state[`slot-${i}`])" :aria-label="`${buoy.name}: add dot`" @click="appendPulse(i,'.')">● Dot</button>
            <button :disabled="/^[.-]{5}$/.test(state[`slot-${i}`])" :aria-label="`${buoy.name}: add dash`" @click="appendPulse(i,'-')">━ Dash</button>
            <button :aria-label="`${buoy.name}: clear`" @click="update(`slot-${i}`,'')">Clear</button>
          </div>
          <p class="decoded" aria-live="polite">{{ !state[`slot-${i}`] ? 'Not recorded' : decode(state[`slot-${i}`]) >= 0 ? `Digit ${decode(state[`slot-${i}`])}` : /^[.-]{1,4}$/.test(state[`slot-${i}`]) ? `${state[`slot-${i}`].length} / 5 flashes` : 'Not a valid digit. Recheck the pattern.' }}</p>
        </section>
      </div>
      <div v-if="result.status==='ready'" class="result" role="status" aria-live="polite">
        <p class="eyebrow">Enter at the Sally Port telegraph</p>
        <strong class="answer">{{ result.lines[0] }}</strong>
        <p>Tap interact for <b>DOT</b>. Hold interact for about 2–3 seconds for <b>DASH</b>. Enter each digit in order; the gap between the groups is not another pulse.</p>
        <div class="answer-groups">
          <div v-for="(group,i) in answerGroups" :key="i"><span>Digit {{ i+1 }}: {{ morseDigits.indexOf(group) }}</span><div class="pulse-strip"><span v-for="(pulse,j) in [...group]" :key="j" :class="{current:cursor===i*5+j,entered:cursor>i*5+j}"><b>{{ pulse==='.' ? '●' : '━' }}</b><small>{{ pulse==='.' ? 'DOT' : 'DASH' }}</small></span></div></div>
        </div>
        <p class="current-pulse">{{ cursor < pulses.length ? `Pulse ${cursor+1} of ${pulses.length}: ${pulses[cursor].pulse==='.' ? 'DOT — tap' : 'DASH — hold'}` : 'Sequence entered. Listen for the in-game success quote.' }}</p>
        <div class="actions"><button :disabled="cursor===0" @click="cursor--">Previous pulse</button><button :disabled="cursor===pulses.length" @click="cursor++">{{ cursor===pulses.length-1 ? 'Finish sequence' : 'Next pulse' }}</button><button @click="cursor=0">Start again</button></div>
        <p class="muted">This cursor is a manual aid. The game confirms success; if the Warden laughs, restart the input and recheck the buoy readings.</p>
      </div>
      <p v-else class="result" role="status">Read all three buoys to calculate the answer. Each clue must be a digit 0–9 or one complete five-pulse digit.</p>
      <details><summary>Show all ten Morse digits</summary><div class="morse-reference"><span v-for="(code,i) in morseDigits" :key="code"><b>{{ i }}</b> <code>{{ code }}</code></span></div></details>
    </template>
    <template v-else>
      <div class="actions"><button :aria-pressed="!showSymbols" @click="update('powerhouse-stage','simon')">Simon Says room</button><button :aria-pressed="showSymbols" @click="update('powerhouse-stage','symbols')">Symbols & levers</button></div>
      <PuzzleBloodSimon v-if="!showSymbols" :state="state" @change="change" @symbols="update('powerhouse-stage','symbols')" />
      <template v-else>
      <h3>Pair your observed symbols</h3>
      <div v-if="rememberedPanels.length" class="remembered-panels"><strong>Your steady-light positions</strong><ul><li v-for="panel in rememberedPanels" :key="panel.id"><b>{{ panel.id }}</b> · {{ panel.name }}</li></ul><p class="muted">Read the symbol at each remembered position. Map letters identify locations only.</p></div>
      <p>After Simon Says, read the symbols beside the three steady lights. Collect the punchcard and take it to Model Industries. Interact with each matching monitor and record the replacement it actually shows.</p>
      <p class="notice">The numbers and letters name the pictures. They are <strong>not fixed translations</strong>: 1 does not automatically mean A. Select a slot below, then choose its picture.</p>
      <div class="pair-table">
        <div v-for="i in 3" :key="i" class="pair-row">
          <span class="pair-number">{{ i }}</span>
          <button :aria-pressed="activeRow===i-1 && activeKind==='source'" :aria-controls="pickerId" :aria-label="`Select steady symbol ${i}`" @click="selectCell(i-1,'source')"><span>Building 64</span><PuzzleBloodSymbol v-if="state[`source-${i-1}`]" :symbol="state[`source-${i-1}`]" /><span v-else class="unknown">?</span><b>{{ state[`source-${i-1}`] || 'Choose symbol' }}</b></button>
          <span class="arrow" aria-hidden="true">→</span>
          <button :aria-pressed="activeRow===i-1 && activeKind==='target'" :aria-controls="pickerId" :aria-label="`Select replacement symbol ${i}`" @click="selectCell(i-1,'target')"><span>Monitor → lever</span><PuzzleBloodSymbol v-if="state[`target-${i-1}`]" :symbol="state[`target-${i-1}`]" /><span v-else class="unknown">?</span><b>{{ state[`target-${i-1}`] || 'Choose replacement' }}</b></button>
        </div>
      </div>
      <div :id="pickerId" class="symbol-picker"><p aria-live="polite"><strong>Choosing {{ activeKind==='source' ? 'steady-light' : 'replacement' }} symbol {{ activeRow+1 }}</strong></p><div class="symbol-grid"><button v-for="symbol in symbolChoices" :key="symbol" :aria-label="`Choose ${symbol}: ${bloodSymbols[symbol].name}`" :aria-pressed="state[activeKey]===symbol" @click="chooseSymbol(symbol)"><PuzzleBloodSymbol :symbol="symbol" /><b>{{ symbol }}</b><small>{{ bloodSymbols[symbol].name }}</small></button></div><button class="clear-slot" @click="chooseSymbol('')">Clear selected slot</button></div>
      <div class="result" :class="result.status" role="status" aria-live="polite"><strong>{{ result.message }}</strong><template v-if="result.status==='ready'"><p>At the Power House, Spirit Blast the ghost as it attempts to pull each of these levers.</p><div class="lever-targets"><div v-for="i in 3" :key="i"><PuzzleBloodSymbol :symbol="state[`target-${i-1}`]" /><b>{{ state[`target-${i-1}`] }}</b></div></div><p>Collect the red stone after all three successful pulls.</p></template></div>
      <details v-if="hasLegacy"><summary>Your previous text notes</summary><p v-for="i in 3" :key="i">{{ i }}: {{ state[`generator-${i-1}`] }} · {{ state[`number-${i-1}`] }} → {{ state[`monitor-${i-1}`] }}</p><p class="muted">These notes are kept for reference. Use the picture slots to record your current run.</p></details>
      <a href="https://i.imgur.com/7nSaj1u.png" target="_blank" rel="noopener noreferrer">Original r/CODZombies symbol sheet ↗</a>
      </template>
    </template>
    <div class="actions state-actions"><button :disabled="!canUndo" @click="undo">Undo last change</button><button @click="confirmReset=!confirmReset">Reset helper</button></div>
    <div v-if="confirmReset" class="result"><p>Clear this helper’s observations? Other tools and guide progress stay saved.</p><div class="actions"><button @click="reset();confirmReset=false">Clear observations</button><button @click="confirmReset=false">Keep observations</button></div></div>
    <p v-if="saveError" role="alert">Your browser could not save these observations. Keep this page open.</p>
    <p class="muted">Saved on this device. The inline and full-page versions share your observations.</p>
  </div>
</template>
<style scoped>
.blood-tool{color:var(--text);line-height:1.65;min-width:0}.blood-tool p{margin:.7rem 0}.eyebrow{font-size:.73rem;letter-spacing:.1em;text-transform:uppercase;color:var(--gold)}.blood-tool button,.blood-tool input{font:inherit}.blood-tool button{min-height:44px;padding:.55rem .8rem;border:1px solid var(--line);border-radius:7px;background:var(--surface-2);color:var(--text);cursor:pointer}.blood-tool button:hover:not(:disabled),.blood-tool button[aria-pressed=true]{border-color:var(--gold);background:var(--gold-dim)}.blood-tool button:disabled{opacity:.45;cursor:default}.blood-tool :focus-visible{outline:2px solid var(--gold);outline-offset:3px}.blood-tool input:not([type=checkbox]){width:100%;min-height:44px;padding:.55rem .7rem;border:1px solid var(--line);border-radius:6px;background:var(--surface);color:var(--text)}.blood-tool label{display:block;font-size:.85rem}.blood-tool label input{display:block;margin-top:.35rem}.buoy-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,235px),1fr));gap:1rem;margin:1rem 0}.buoy-card{padding:1rem;border:1px solid var(--line);border-radius:10px;background:var(--surface-2)}.buoy-card :deep(.guide-illustrations){display:block}.buoy-card :deep(figcaption){font-size:.75rem}.actions{display:flex;gap:.5rem;flex-wrap:wrap}.pulse-input{margin-top:.7rem}.pulse-input button{flex:1;padding:.4rem}.decoded{font-weight:700;color:var(--gold)}.result,.notice,.symbol-picker{padding:1rem;border:1px solid var(--line);border-radius:9px;background:var(--surface-2);margin:1rem 0}.result{border-left:3px solid var(--gold)}.result.invalid{border-left-color:#ed8b63}.answer{font-size:clamp(1.3rem,4vw,2rem);color:var(--gold)}.answer-groups{display:flex;gap:1.5rem;flex-wrap:wrap}.pulse-strip{display:flex;gap:.35rem;margin-top:.4rem}.pulse-strip>span{display:flex;flex-direction:column;align-items:center;padding:.35rem .45rem;border:1px solid var(--line);border-radius:6px;min-width:38px}.pulse-strip b{font-size:1.25rem}.pulse-strip small{font-size:.62rem}.pulse-strip .current{border-color:var(--gold);background:var(--gold-dim)}.pulse-strip .entered{opacity:.4}.current-pulse{font-weight:700}.muted{font-size:.8rem;color:var(--muted)}.morse-reference{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:.6rem;margin:1rem 0}.morse-reference span{padding:.4rem;border:1px solid var(--line);border-radius:5px}.morse-reference code{letter-spacing:.15em;margin-left:.5rem}.blood-tool summary{cursor:pointer;color:var(--gold);min-height:44px;padding:.6rem 0}.blood-tool a{color:var(--gold);font-size:.8rem}.panel-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.7rem}.panel-grid button{width:100%;margin-top:.35rem}.sequence{display:flex;flex-wrap:wrap;gap:.6rem;list-style:none;padding:0}.sequence li{border:1px solid var(--gold);border-radius:6px;padding:.4rem .65rem}.pair-row{display:grid;grid-template-columns:20px 1fr 20px 1fr;gap:.5rem;align-items:center;margin-bottom:.9rem}.pair-row>button{display:flex;align-items:center;flex-direction:column;gap:.4rem;padding:.7rem .35rem}.pair-row>button>span:first-child{font-size:.72rem}.pair-row>button>b{font-size:.8rem}.pair-number{color:var(--gold);font-weight:700}.unknown{display:grid;place-items:center;width:64px;height:76px;border:1px dashed var(--line);border-radius:6px;font-size:2rem;color:var(--muted)}.pair-row .lever-check{grid-column:2/-1;display:flex;flex-direction:row;align-items:center;gap:.5rem;min-height:44px}.lever-check input{margin:0;width:19px;height:19px;accent-color:var(--gold)}.symbol-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.6rem}.symbol-grid button{display:flex;flex-direction:column;align-items:center;gap:.4rem;padding:.6rem .2rem}.symbol-grid small{font-size:.66rem;line-height:1.4;max-width:100px}.clear-slot{margin-top:.75rem}.lever-targets{display:flex;gap:1.5rem;margin:1rem 0}.lever-targets>div{display:flex;flex-direction:column;align-items:center;gap:.35rem}.state-actions{margin-top:1.5rem}@media(min-width:760px){.pair-row{grid-template-columns:24px 1fr 25px 1fr 110px}.pair-row .lever-check{grid-column:auto}.symbol-grid{grid-template-columns:repeat(6,minmax(0,1fr))}}
</style>
<style scoped>
.remembered-panels{margin:1rem 0;padding:.8rem 1rem;border-left:3px solid var(--gold);background:var(--surface-2)}.remembered-panels ul{list-style:none;padding:0;margin:.5rem 0}.remembered-panels b{color:var(--gold)}
@media(min-width:760px){.pair-row{grid-template-columns:24px 1fr 25px 1fr}}
</style>

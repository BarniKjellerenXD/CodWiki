<script setup lang="ts">
import {bloodSimonPanels,simonRound,simonSequence,recordSimonFlash,clearSimonSequence,removeSimonFlash,steadySimonPanels,toggleSteadySimonPanel} from '~/utils/bloodSimon.mjs'
const props=defineProps<{state:Record<string,any>}>()
const emit=defineEmits<{change:[state:Record<string,any>],symbols:[]}>()
const round=computed(()=>simonRound(props.state))
const sequence=computed(()=>simonSequence(props.state))
const steady=computed(()=>steadySimonPanels(props.state))
const steadyMode=computed(()=>props.state['simon-view']==='steady')
const cursor=ref(-1)
const reference=ref('A')
const photo=computed(()=>bloodSimonPanels.find(panel=>panel.id===reference.value)!)
const titleId=useId()
const legacy=computed(()=>Array.from({length:5},(_,i)=>props.state[`slot-${i}`]).filter(Boolean))
watch(()=>JSON.stringify(sequence.value),()=>{cursor.value=-1})
function write(next:Record<string,any>) {if(next!==props.state)emit('change',next)}
function choose(id:string) {reference.value=id;cursor.value=-1;write(steadyMode.value?toggleSteadySimonPanel(props.state,id):recordSimonFlash(props.state,id))}
function changeRound(event:Event) {write(clearSimonSequence(props.state,Number((event.target as HTMLSelectElement).value)))}
function showStep(index:number) {cursor.value=index;reference.value=sequence.value[index].id}
function positions(id:string) {return sequence.value.flatMap((panel,index)=>panel.id===id?[index+1]:[]).join(', ')}
</script>

<template>
  <section class="simon-tool" :aria-labelledby="titleId">
    <h3 :id="titleId">Building 64 · remember the lights</h3>
    <p>Face the room using the generator, ICR-7 island and Docks exit below. Tap the panel that flashes. Each round has a <strong>new sequence</strong>, and the same panel can flash more than once.</p>
    <div class="simon-mode" role="group" aria-label="What to remember">
      <button :aria-pressed="!steadyMode" @click="write({...state,'simon-view':'flashes'})">Flashing sequence</button>
      <button :aria-pressed="steadyMode" @click="write({...state,'simon-view':'steady'})">Final three steady lights</button>
    </div>
    <div v-if="!steadyMode" class="round-line"><label>Simon round <select :value="round" @change="changeRound"><option v-for="n in 5" :key="n" :value="n">{{n}} · {{n===1?'1 flash':`${n} flashes`}}</option></select></label><span>Changing rounds clears this sequence. Undo restores it.</span></div>
    <p v-else class="steady-help">After the fifth successful round, select the <strong>three lights that stay on</strong>. Ignore the blinking decoy. These positions stay saved while you match their symbols.</p>
    <div class="simon-workspace">
      <div>
        <div class="room-map" role="group" aria-label="Building 64 panel positions, overhead schematic">
          <svg viewBox="0 0 1000 660" aria-hidden="true" focusable="false">
            <path class="room-wall" d="M60 190V45H950V565H870M810 565H60V250" />
            <path class="fixture" d="M60 275H140V455H60M310 235H455V430H310ZM555 235H715V430H555ZM875 175H950V445H875ZM320 45V135H480V45M125 565V480H260V565" />
            <path class="door" d="M60 190H22M60 250H22M810 565V610M870 565V610" />
            <text x="10" y="224" class="exit">PaP exit</text>
            <text x="837" y="639" text-anchor="middle" class="exit">Docks exit</text>
            <text x="192" y="524" text-anchor="middle">Generator</text>
            <text x="382" y="345" text-anchor="middle">ICR-7</text>
            <text x="636" y="324" text-anchor="middle">Power</text><text x="636" y="350" text-anchor="middle">switch</text>
            <text x="325" y="83" text-anchor="middle">Punchcard</text>
          </svg>
          <button v-for="panel in bloodSimonPanels" :key="panel.id" class="panel-point" :class="{recalled:!steadyMode&&sequence[cursor]?.id===panel.id,remembered:steadyMode&&state[`simon-steady-${panel.id}`]}" :style="{left:`${panel.x}%`,top:`${panel.y}%`}" :aria-label="`${steadyMode?'Remember steady light':'Record flash'} ${panel.id}: ${panel.name}`" :aria-pressed="steadyMode?!!state[`simon-steady-${panel.id}`]:undefined" :disabled="steadyMode?steady.length===3&&!state[`simon-steady-${panel.id}`]:sequence.length>=round" @click="choose(panel.id)"><b>{{panel.id}}</b><span v-if="!steadyMode&&positions(panel.id)" class="position-badge">{{positions(panel.id)}}</span></button>
        </div>
        <p class="map-caption">Overhead schematic · not to scale. A–F are this helper’s position labels, <strong>not the symbols on the panels</strong>.</p>
      </div>
      <div class="sequence-area">
        <template v-if="!steadyMode">
          <h4>Your sequence</h4><p class="sequence-status" role="status" aria-live="polite">{{sequence.length}} / {{round}} flashes recorded{{sequence.length===round?' — repeat these in game.':'. Tap the next flashing panel.'}}</p>
          <ol class="map-sequence"><li v-for="(panel,index) in sequence" :key="index"><button :aria-pressed="cursor===index" :aria-label="`Locate step ${index+1}: ${panel.id}, ${panel.name}`" @click="showStep(index)"><span>{{index+1}}</span><b>{{panel.id}}</b><span>{{panel.name}}</span></button></li></ol>
          <p v-if="!sequence.length" class="empty-sequence">Your first flash will appear here. Record what you see; the helper does not detect the game screen.</p>
          <div class="simon-actions"><button :disabled="!sequence.length" @click="write(removeSimonFlash(state))">Remove last flash</button><button :disabled="!sequence.length" @click="write(clearSimonSequence(state))">Clear attempt</button></div>
          <p v-if="sequence.length" class="map-caption">Select a recorded step to highlight its position on the map. The numbered badges also show repeated flashes.</p>
          <button v-if="sequence.length===round&&round<5" class="next-round" @click="write(clearSimonSequence(state,round+1))">In-game round accepted · start round {{round+1}}</button>
          <button v-if="sequence.length===round&&round===5" class="next-round" @click="write({...state,'simon-view':'steady'})">Remember the final steady lights</button>
        </template>
        <template v-else>
          <h4>Steady light positions</h4><p role="status" aria-live="polite">{{steady.length}} / 3 positions remembered</p><ul class="steady-list"><li v-for="panel in steady" :key="panel.id"><b>{{panel.id}}</b> {{panel.name}}</li></ul>
          <p v-if="!steady.length" class="empty-sequence">Select the three lit positions on the map before leaving the room.</p>
          <button :disabled="!steady.length" @click="write({...state,...Object.fromEntries(bloodSimonPanels.map(panel=>[`simon-steady-${panel.id}`,false]))})">Clear steady lights</button>
          <button class="next-round" @click="emit('symbols')">Match their symbols →</button>
        </template>
      </div>
    </div>
    <details class="panel-reference"><summary>Find a panel in the room · photo references</summary><label>Panel photo <select v-model="reference"><option v-for="panel in bloodSimonPanels" :key="panel.id" :value="panel.id">{{panel.id}} · {{panel.name}}</option></select></label><GuideIllustrations :images="[{src:photo.image,alt:`Panel ${photo.id}: ${photo.name}. Compare the real machine and nearby landmarks.`}]" /><p class="map-caption">The photographs show real panels; the schematic keeps their relative positions. Match landmarks when approaching from another doorway.</p></details>
    <details v-if="legacy.length"><summary>Previous named-button sequence</summary><p>Earlier versions let you name panels yourself. These notes have been kept separately so their numbers are not mistaken for the map positions.</p><ol><li v-for="(panel,index) in legacy" :key="index">{{state[`panel-${Number(panel)-1}`]||`Your panel ${panel}`}}</li></ol></details>
    <p class="map-caption">Room layout adapted from <a href="https://ameblo.jp/epicpine99/entry-12416541869.html" target="_blank" rel="noopener noreferrer">epicpine’s Building 64 diagram</a>. Panel photographs and sequence rules: <a href="https://mmmrkennedy.com/games/BO4/blood_of_the_dead/blood_of_the_dead_guide" target="_blank" rel="noopener noreferrer">MMMrKennedy</a>. No in-game detection or automatic symbol translation.</p>
  </section>
</template>

<style scoped>
.simon-tool{min-width:0;line-height:1.55}.simon-tool h3{font-size:1.15rem;margin:.8rem 0}.simon-tool h4{font-size:1rem;margin:0 0 .7rem}.simon-tool p{max-width:75ch}.simon-tool button,.simon-tool select{font:inherit;min-height:44px;border:1px solid var(--line);border-radius:6px;background:var(--surface-2);color:var(--text);padding:.55rem .7rem}.simon-tool button{cursor:pointer}.simon-tool button:disabled{opacity:.55;cursor:default}.simon-tool button[aria-pressed=true],.simon-tool button:hover:not(:disabled){border-color:var(--gold);background:var(--gold-dim)}.simon-tool :focus-visible{outline:2px solid var(--gold);outline-offset:3px}.simon-mode,.simon-actions{display:flex;flex-wrap:wrap;gap:.5rem;margin:1rem 0}.round-line{display:flex;align-items:center;flex-wrap:wrap;gap:.75rem;margin:1rem 0}.round-line label{font-weight:600}.round-line select{margin-left:.4rem}.round-line>span,.map-caption,.empty-sequence{font-size:.8rem;color:var(--muted)}.simon-workspace{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(225px,1fr);gap:1.2rem;align-items:start}.room-map{position:relative;width:100%;aspect-ratio:1000/660;background:var(--surface);border:1px solid var(--line);border-radius:8px}.room-map svg{width:100%;height:100%;display:block}.room-wall,.fixture,.door{fill:none;stroke:var(--muted);stroke-width:4}.fixture{stroke:var(--line-strong,var(--muted));fill:var(--surface-2)}.door{stroke:var(--gold)}.room-map svg text{fill:var(--muted);font:22px ui-sans-serif,system-ui,sans-serif}.room-map svg .exit{fill:var(--gold);font-size:21px}.room-map .panel-point{position:absolute;transform:translate(-50%,-50%);display:grid;place-items:center;padding:0;width:48px;height:48px;min-height:48px;border:2px solid var(--gold);background:var(--surface-2);color:var(--gold);font-size:1.1rem;z-index:1}.room-map .panel-point:disabled{opacity:1;color:var(--muted);border-color:var(--line)}.room-map .panel-point.recalled,.room-map .panel-point.remembered{background:var(--gold);color:var(--on-gold,#19150d);border-color:var(--gold)}.position-badge{position:absolute;left:50%;top:calc(100% + 3px);transform:translateX(-50%);white-space:nowrap;font-size:.68rem;line-height:1.3;background:var(--surface);color:var(--gold);border:1px solid var(--line);border-radius:3px;padding:1px 4px;pointer-events:none}.map-sequence{list-style:none;padding:0;margin:.8rem 0}.map-sequence li{margin:.4rem 0}.map-sequence button{display:grid;grid-template-columns:20px 26px 1fr;gap:.5rem;align-items:center;width:100%;text-align:left}.map-sequence button>span:first-child{font-size:.72rem;color:var(--muted)}.map-sequence b{color:var(--gold);font-size:1.05rem}.map-sequence button>span:last-child{font-size:.82rem}.simon-tool .next-round{display:block;margin-top:.8rem;color:var(--gold);border-color:var(--gold)}.panel-reference{margin-top:1rem;border-top:1px solid var(--line);padding-top:.4rem}.panel-reference label{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin:.8rem 0}.panel-reference :deep(.guide-illustrations){max-width:700px}.simon-tool summary{cursor:pointer;color:var(--gold);min-height:44px;padding:.6rem 0}.simon-tool a{color:var(--gold)}.steady-list{list-style:none;padding:0}.steady-list li{padding:.4rem 0}.steady-list b{color:var(--gold);margin-right:.5rem}@media(max-width:800px){.simon-workspace{grid-template-columns:1fr}.sequence-area{border-top:1px solid var(--line);padding-top:1rem}.room-map .panel-point{width:44px;height:44px;min-height:44px;font-size:.95rem}.room-map svg text{font-size:25px}.room-map svg .exit{font-size:23px}}@media(prefers-reduced-motion:no-preference){.panel-point{transition:background-color .15s ease,color .15s ease}}
</style>
<style scoped>
.simon-tool .room-map .panel-point.recalled,.simon-tool .room-map .panel-point.remembered{background:var(--gold);color:var(--on-gold,#19150d);border-color:var(--gold)}
@media(max-width:800px){.room-map svg text{font-size:36px}.room-map svg .exit{font-size:32px}.position-badge{top:50%;left:auto;right:calc(100% + 2px);transform:translateY(-50%);font-size:.65rem}}
@media(max-width:800px){.panel-point:last-child .position-badge{top:calc(100% + 3px);left:0;right:auto;transform:none}}
</style>

<script setup>
import {moonSequence,moonColours} from '~/utils/chronicles.mjs'
const props=defineProps({tool:String,state:Object});const emit=defineEmits(['change']);const uid=useId();const edit=ref(-1)
const moon=computed(()=>props.tool.endsWith('-moon-simon'));const sequence=computed(()=>moonSequence(props.state))
const target=computed(()=>edit.value>=0?edit.value:Array.from({length:16},(_,i)=>i).find(i=>!props.state[`slot-${i}`])??-1)
const knocks=computed(()=>[0,1,2].map(i=>props.state[`slot-${i}`]))
function set(key,value){emit('change',{...props.state,[key]:value})}
function record(colour){if(target.value<0)return;set(`slot-${target.value}`,colour);edit.value=-1}
function newSequence(){emit('change',{...props.state,...Object.fromEntries(Array.from({length:moon.value?16:3},(_,i)=>[`slot-${i}`,'']))});edit.value=-1}
function nextPattern(){emit('change',{...props.state,round:String(Math.min(3,Number(props.state.round||'1')+1)),...Object.fromEntries([0,1,2].map(i=>[`slot-${i}`,'']))})}
</script>
<template>
 <template v-if="moon">
  <label :for="`${uid}-stage`">Quest stage<select :id="`${uid}-stage`" :value="state.stage||'First game'" @change="set('stage',$event.target.value)"><option>First game</option><option>Final three games</option></select></label>
  <p class="chr-context">{{state.stage==='Final three games'?'After the MPD body swap and Q.E.D. transfer, complete three more computer games.':'After power is on, start at the outside computers by Tunnel 6.'}} Watch the flashes, record them below, then press the same computers in-game. Repeated colours are allowed.</p>
  <fieldset><legend>{{edit>=0?`Correct flash ${edit+1}`:'Tap each colour as it flashes'}}</legend><div class="chr-computers"><button v-for="(colour,i) in moonColours" :key="colour" type="button" :class="`chr-${colour.toLowerCase()}`" :disabled="target<0" @click="record(colour)"><strong>{{i+1}}</strong><span>{{colour}}</span></button></div><p class="chr-muted">Four computers in one row, numbered from the left. The colour name and number stay visible together.</p></fieldset>
  <section aria-live="polite"><h3>Your recorded sequence</h3><p v-if="!sequence.entries.length" class="chr-muted">No flashes recorded yet. Tap a colour above to start.</p><div class="chr-sequence"><button v-for="(colour,i) in sequence.entries" :key="i" type="button" :aria-pressed="edit===i" :aria-label="`Edit flash ${i+1}: ${colour||'missing'}`" @click="edit=i"><small>Flash {{i+1}}</small><strong>{{colour?moonColours.indexOf(colour)+1:'?'}}</strong><span>{{colour||'Missing'}}</span></button></div>
   <p v-if="sequence.hasGap" role="alert" class="chr-status invalid">A flash is missing. Select the empty position and record it before using this order.</p>
   <p v-else-if="sequence.entries.length" class="chr-status ready">Press computers {{sequence.positions.join(' → ')}} from the left. Check this is the whole displayed sequence before entering it.</p>
  </section>
  <div class="chr-actions"><button v-if="edit>=0" type="button" @click="edit=-1">Continue recording</button><button type="button" :disabled="!sequence.entries.length" @click="set(`slot-${sequence.entries.length-1}`,'');edit=-1">Remove last flash</button><button type="button" :disabled="!sequence.entries.length" @click="newSequence">New sequence</button></div>
  <details><summary>See the computer positions</summary><GuideIllustrations :images="[{src:'/images/chronicles/moon/moon-simon-says-computers.webp',alt:'Facing the computers: 1 Red, 2 Green, 3 Blue, 4 Yellow, from left to right.'}]"/><p v-if="tool==='bo3-moon-simon'">The old helper used a two-by-two screen layout. The game’s row is fixed; any older screen-layout notes are retained in storage but are not used to calculate this result.</p></details>
 </template>
 <template v-else>
  <GuideIllustrations :images="[{src:'/images/chronicles/kino-der-toten/free_max_ammo/blue_door.webp',alt:'Listen and reply at this blue Alley door.'}]"/>
  <label :for="`${uid}-round`">Pattern being answered<select :id="`${uid}-round`" :value="state.round||'1'" @change="set('round',$event.target.value)"><option v-for="n in 3" :key="n" :value="String(n)">{{n}} of 3</option></select></label>
  <div class="chr-knocks"><label v-for="i in [0,1,2]" :key="i" :for="`${uid}-knock-${i}`">Knock group {{i+1}}<select :id="`${uid}-knock-${i}`" :value="state[`slot-${i}`]" @change="set(`slot-${i}`,$event.target.value)"><option value="">Count knocks…</option><option v-for="n in 9" :key="n" :value="String(n)">{{n}}</option></select></label></div>
  <div class="chr-status" role="status"><template v-if="knocks.every(Boolean)"><strong>Melee {{knocks[0]}} · pause · {{knocks[1]}} · pause · {{knocks[2]}}</strong><p>Leave a short pause between groups. Wait for the game to accept your reply before moving to the next pattern.</p></template><p v-else>Record all three groups you hear. This helper records counts; it does not listen to your microphone.</p></div>
  <button v-if="(state.round||'1')!=='3'" type="button" :disabled="!knocks.every(Boolean)" @click="nextPattern">Accepted in game → record next pattern</button>
  <p v-else class="chr-context">After this third reply is accepted, interact with the doll at the front-right of the stage. <NuxtLink to="/tools/bo3-kino-dolls">Open the ten-location doll finder →</NuxtLink></p>
  <p class="chr-muted">If the door rejects a reply, listen again and correct the counts. A new pattern needs a fresh observation.</p>
 </template>
</template>

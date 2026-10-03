<script setup>
import {bellRooms,bellResult} from '~/utils/bo2.mjs'
const props=defineProps({state:Object})
const emit=defineEmits(['change'])
const answer=computed(()=>bellResult(props.state))
const update=(key,value)=>emit('change',{...props.state,[key]:value})
const rowNames=['Top','Middle','Bottom']
</script>
<template>
 <p class="chr-context"><strong>Stand facing the couch board.</strong> The columns are Candy Store, Barn and Courthouse from left to right. Test bells before starting the timed sequence; the helper only uses your confirmed mapping.</p>
 <div class="bo2-bell-layout"><div><div class="bo2-bell-headings"><strong v-for="room in bellRooms" :key="room.name">{{room.name}}</strong></div><div class="bo2-bell-board" role="group" aria-label="Mansion light board, facing the couch"><button v-for="i in 9" :key="i" type="button" :aria-pressed="state.light===String(i-1)" :aria-label="`${rowNames[Math.floor((i-1)/3)]} bulb, ${bellRooms[(i-1)%3].name}${state[`bell-${i-1}`]?`: ${state[`bell-${i-1}`]}`:': not mapped'}`" @click="update('light',String(i-1))"><span class="bo2-bulb" aria-hidden="true"/><small>{{rowNames[Math.floor((i-1)/3)]}}</small><span>{{state[`bell-${i-1}`]?'Mapped':'Test first'}}</span></button></div></div>
  <section class="bo2-result bo2-bell-callout" :class="answer.status" aria-live="polite" aria-atomic="true"><h3>{{answer.status==='ready'?answer.room:'Your bell callout'}}</h3><strong v-if="answer.bell" class="bo2-bell-name">{{answer.bell}}</strong><p>{{answer.message}}</p><p v-if="answer.calibrated<9" class="chr-muted">{{answer.calibrated}} of 9 lights mapped. Test the remaining bells before starting.</p></section>
 </div>
 <details :open="answer.calibrated!==9||answer.status==='invalid'" class="bo2-calibration"><summary>Test and map the nine bells</summary><p>Have each room player ring one bell. The board player identifies the row that lights in that room’s column. Set its landmark below, then test the other two. Every bell appears once per room.</p><div class="bo2-bell-mappings"><fieldset v-for="(room,col) in bellRooms" :key="room.name"><legend>{{room.name}}</legend><label v-for="(row,r) in rowNames" :key="row">{{row}} bulb<select :value="state[`bell-${r*3+col}`]" :aria-label="`${room.name}: ${row.toLowerCase()} bulb mapping`" @change="update(`bell-${r*3+col}`,$event.target.value)"><option value="">Not tested yet…</option><option v-for="bell in room.bells" :key="bell">{{bell}}</option></select></label></fieldset></div></details>
 <p>Start the board only when the three room players are ready. Tap each live bulb, call the result, and have that player ring it promptly. Follow the actual board through the sequence. A wrong or late bell resets the sequence; the tested mapping stays useful.</p>
 <details><summary>Find the couch switchboard</summary><GuideIllustrations :images="[{src:'/images/bo2/buried/switchboard.webp',alt:'Nine-light switchboard on the mansion couch beyond the moving bookcase.'}]"/></details>
</template>

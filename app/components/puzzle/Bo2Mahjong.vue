<script setup>
import {mahjongTiles,mahjongColours,mahjongLocations,mahjongResult} from '~/utils/bo2.mjs'
import Bo2Glyph from './Bo2Glyph.vue'
const props=defineProps({state:Object})
const emit=defineEmits(['change'])
const answer=computed(()=>mahjongResult(props.state))
const change=(id,value)=>emit('change',{...props.state,[id]:value})
</script>
<template>
 <div class="bo2-mahjong-inputs">
  <fieldset v-for="(title,group) in ['Number tiles · when to strike','Direction tiles · which leg']" :key="title"><legend>{{title}}</legend>
   <div class="bo2-tile-grid"><label v-for="tile in mahjongTiles.slice(group*4,group*4+4)" :key="tile.id" class="bo2-tile"><Bo2Glyph kind="mahjong" :symbol="tile.id"/><strong>{{tile.label}}</strong><select :aria-label="`${tile.label}: observed colour`" :value="state[tile.id]" @change="change(tile.id,$event.target.value)"><option value="">Choose colour…</option><option v-for="colour in mahjongColours" :key="colour">{{colour}}</option></select></label></div>
  </fieldset>
 </div>
 <section class="bo2-result" :class="answer.status" aria-live="polite" aria-atomic="true"><h3>{{answer.status==='ready'?'Your tower strike order':'Read the eight tiles first'}}</h3><p>{{answer.message}}</p><ol v-if="answer.order" class="bo2-order"><li v-for="(leg,i) in answer.order" :key="leg.direction"><span>{{i+1}}</span><strong>{{leg.direction}}</strong><small>{{leg.colour}} pair</small></li></ol></section>
 <p class="chr-context"><strong>Find North before striking.</strong> It is the pylon leg beside the photographed tile spawn, facing away from the Power Building. The other legs follow compass order around the tower. Use Galvaknuckles only after the quest has lit the legs. A wrong order means waiting until the next round.</p>
 <details><summary>All 11 tile locations and the North anchor</summary><p>Eight tiles occupy these possible positions. The reference chart shows the shapes; its printed colours are not your match’s colour assignments.</p><GuideIllustrations :images="mahjongLocations.map(p=>({src:p.src,alt:p.alt}))"/></details>
</template>

<script setup>
import {tileSymbols,tilePairs} from '~/utils/chronicles.mjs'
import ChroniclesGlyph from './ChroniclesGlyph.vue'
const props=defineProps({state:Object});const emit=defineEmits(['change']);const uid=useId();const side=ref(0);const tile=ref(0)
const result=computed(()=>tilePairs(props.state));const key=computed(()=>`symbol-${side.value}-${tile.value}`)
const nameKey=computed(()=>`place-${side.value}-${tile.value}`)
const legacy=computed(()=>[0,1].flatMap(s=>Array.from({length:12},(_,i)=>({side:s,index:i,text:props.state[`tile-${s}-${i}`]}))).filter(n=>n.text))
function set(key,value){
 const next={...props.state,[key]:value}
 if(key.startsWith('symbol-')){if(props.state[key])next[`matched-${props.state[key]}`]=false;if(value)next[`matched-${value}`]=false}
 emit('change',next)
}
function switchSide(s){side.value=s;tile.value=0}
</script>
<template>
 <p class="chr-context">During the eclipse, explore one side while the other player stays off every tile. Once both locations are known, stand on the matching pair together. A wrong pair resets the puzzle.</p>
 <div class="chr-tabs" aria-label="Tile area"><button type="button" :aria-pressed="side===0" @click="switchSide(0)">Minecart side</button><button type="button" :aria-pressed="side===1" @click="switchSide(1)">Rope Bridge side</button></div>
 <p class="chr-muted">These are your own tile numbers, not a map layout. Add a landmark name when you record a tile.</p>
 <div class="chr-tile-layout">
  <fieldset><legend>{{side===0?'Minecart':'Rope Bridge'}} observations</legend><label class="chr-tile-select" :for="`${uid}-tile`">Tile to record<select :id="`${uid}-tile`" v-model.number="tile"><option v-for="i in 12" :key="i" :value="i-1">Tile {{i}} · {{state[`place-${side}-${i-1}`]|| (state[`symbol-${side}-${i-1}`]?'Symbol recorded':'Not recorded')}}</option></select></label><div class="chr-tile-slots"><button v-for="i in 12" :key="i" type="button" :aria-pressed="tile===i-1" :aria-label="`Edit ${side===0?'Minecart':'Rope Bridge'} tile ${i}`" @click="tile=i-1"><span>Tile {{i}}</span><ChroniclesGlyph kind="tile" :symbol="state[`symbol-${side}-${i-1}`]"/><small>{{state[`place-${side}-${i-1}`]||'Add landmark'}}</small></button></div></fieldset>
  <fieldset class="chr-tile-editor"><legend>Record tile {{tile+1}} · {{side===0?'Minecart':'Rope Bridge'}}</legend>
   <label :for="`${uid}-place`">Landmark name<input :id="`${uid}-place`" :value="state[nameKey]" maxlength="40" placeholder="e.g. beside the tunnel steps" @input="set(nameKey,$event.target.value)"/></label>
   <p>Which symbol appears when you stand on it?</p>
   <div class="chr-palette chr-tile-palette"><button v-for="s in tileSymbols" :key="s.id" type="button" :aria-pressed="state[key]===s.id" :aria-label="`Record ${s.label}`" @click="set(key,s.id)"><ChroniclesGlyph kind="tile" :symbol="s.id"/><small>{{s.label}}</small></button></div>
   <button type="button" :disabled="!state[key]" @click="set(key,'')">Clear this symbol</button>
  </fieldset>
 </div>
 <p v-if="result.duplicates.length" class="chr-status invalid" role="alert">A symbol has been recorded more than once on the same side. Correct {{result.duplicates.map(d=>`${d.side===0?'Minecart':'Rope Bridge'} tiles ${d.tiles.join(' and ')} (${d.symbol})`).join('; ')}} before using the pairs.</p>
 <section v-else class="chr-pairs" aria-live="polite"><h3>{{result.ready}} of 12 pairs located</h3><p>Mark “Matched in game” only after both tiles disappear. Finding a pair here does not activate it in the game.</p>
  <div v-for="p in result.pairs.filter(p=>p.minecart&&p.bridge)" :key="p.symbol.id" class="chr-pair" :class="{'is-matched':p.matched}"><ChroniclesGlyph kind="tile" :symbol="p.symbol.id"/><div><strong>{{p.symbol.label}}</strong><p>Minecart: {{p.minecart.label}}<br/>Rope Bridge: {{p.bridge.label}}</p></div><label><input type="checkbox" :checked="p.matched" @change="set(`matched-${p.symbol.id}`,$event.target.checked)"/> Matched in game</label></div>
  <p v-if="!result.ready" class="chr-muted">Record the same symbol on both sides to see a pair here.</p>
 </section>
 <details v-if="legacy.length"><summary>Your earlier text observations</summary><p>Kept as notes. Choose photographed symbols above to build verified pairs.</p><ul><li v-for="n in legacy" :key="`${n.side}-${n.index}`">{{n.side===0?'Side A':'Side B'}} · tile {{n.index+1}}: {{n.text}}</li></ul></details>
 <details><summary>See the floor tiles and complete symbol chart</summary><GuideIllustrations :images="[{src:'/images/chronicles/shangri-la/main_ee/tiles_minecart.webp',alt:'The floor-tile area on the Minecart side.'},{src:'/images/chronicles/shangri-la/main_ee/tiles_rope_bridge.webp',alt:'The Rope Bridge floor-tile area.'},{src:'/images/chronicles/shangri-la/main_ee/shangri_la_symbols.webp',alt:'The twelve possible matching-tile symbols.'}]"/></details>
</template>

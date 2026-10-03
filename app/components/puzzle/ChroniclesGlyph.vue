<script setup>
import {iceSymbols,fireSymbols,tileSymbols} from '~/utils/chronicles.mjs'
const props=defineProps({kind:String,symbol:String})
const clipId=useId()
const config=computed(()=>props.kind==='tile'?{items:tileSymbols,src:'/images/chronicles/shangri-la/main_ee/shangri_la_symbols.webp',width:670,height:592}:props.kind==='fire'?{items:fireSymbols,src:'/images/chronicles/origins/origins-fire-puzzle-cipher.webp',width:1795,height:561}:{items:iceSymbols,src:'/images/chronicles/origins/origins-ice-cipher-key.webp',width:1771,height:1102})
const glyph=computed(()=>config.value.items.find(g=>g.id===props.symbol))
const box=computed(()=>glyph.value&&(props.kind==='ice-input'?glyph.value.input:props.kind==='ice-output'?glyph.value.output:glyph.value.box))
</script>
<template>
 <svg v-if="glyph" :viewBox="box.join(' ')" role="img" :aria-label="kind==='ice-output'?glyph.rune:glyph.label" class="chr-glyph"><title>{{kind==='ice-output'?glyph.rune:glyph.label}}</title><defs><clipPath :id="clipId"><rect :x="box[0]" :y="box[1]" :width="box[2]" :height="box[3]"/></clipPath></defs><image :href="config.src" :width="config.width" :height="config.height" :clip-path="`url(#${clipId})`" /></svg>
 <span v-else class="chr-glyph-empty" aria-label="Symbol not recorded">?</span>
</template>

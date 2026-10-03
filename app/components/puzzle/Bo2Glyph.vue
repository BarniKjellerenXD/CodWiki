<script setup>
import {mahjongTiles,mineSigns} from '~/utils/bo2.mjs'
const props=defineProps({kind:String,symbol:String})
const clip=useId()
const config=computed(()=>props.kind==='mahjong'?{items:mahjongTiles,src:'/images/bo2/die-rise/mahjong-tiles.webp',width:1280,height:720}:{items:mineSigns,src:'/images/bo2/buried/cipher-key.webp',width:2560,height:1275})
const glyph=computed(()=>config.value.items.find(g=>g.id===props.symbol))
</script>
<template>
 <svg v-if="glyph" :viewBox="glyph.box.join(' ')" role="img" :aria-label="glyph.label" class="bo2-glyph"><title>{{glyph.label}}</title><defs><clipPath :id="clip"><rect :x="glyph.box[0]" :y="glyph.box[1]" :width="glyph.box[2]" :height="glyph.box[3]"/></clipPath></defs><image :href="config.src" :width="config.width" :height="config.height" :clip-path="`url(#${clip})`" /></svg>
</template>

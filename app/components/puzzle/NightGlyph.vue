<script setup lang="ts">
const props=defineProps<{kind:'folly'|'zodiac'|'stake',value:string}>()
const clipId=useId()
const folly:Record<string,{file:string,x:number,y:number,w:number,h:number,iw:number,ih:number}>={
  'glyph-1':{file:'dotn-alistairs-folley-safe.webp',x:710,y:628,w:36,h:35,iw:1944,ih:1181},
  'glyph-2':{file:'dotn-alistairs-folley-safe.webp',x:771,y:633,w:33,h:32,iw:1944,ih:1181},
  'glyph-3':{file:'dotn-alistairs-folley-safe.webp',x:828,y:633,w:40,h:32,iw:1944,ih:1181},
  'glyph-4':{file:'folly-IWyR5Bp.png',x:941,y:519,w:43,h:42,iw:1920,ih:1080}
}
// Explicit glyph bounds exclude the chart's handwritten names and neighboring cells.
const zodiacBounds:Record<string,number[]>={
  Aries:[70,0,140,160],Taurus:[245,0,135,165],Gemini:[420,0,120,165],Cancer:[585,15,150,135],
  Leo:[70,225,130,160],Virgo:[245,225,150,155],Libra:[410,245,160,110],Scorpio:[600,225,150,150],
  Sagittarius:[60,445,115,120],Aquarius:[380,445,200,110],Pisces:[600,450,150,110]
}
const crop=computed(()=>{
  if(props.kind==='folly')return folly[props.value]
  if(props.kind!=='zodiac')return null
  if(props.value==='Capricorn')return {file:'dotn-zodiac-wheel.webp',x:779,y:476,w:26,h:26,iw:1779,ih:1078}
  const bounds=zodiacBounds[props.value]
  if(!bounds)return null
  const [x,y,w,h]=bounds
  return {file:'dotn-zodiac-symbols.webp',x,y,w,h,iw:752,ih:637}
})
const up=computed(()=>props.value.startsWith('up'))
</script>
<template>
  <svg v-if="crop" :viewBox="`${crop.x} ${crop.y} ${crop.w} ${crop.h}`" class="night-glyph" :class="{'folly-glyph':kind==='folly'}" role="img" :aria-label="kind==='zodiac'?value:`Observed lock shape ${value.slice(-1)}`">
    <defs><clipPath :id="clipId" clipPathUnits="userSpaceOnUse"><rect :x="crop.x" :y="crop.y" :width="crop.w" :height="crop.h" /></clipPath></defs>
    <image :href="`/images/bo4-dead-of-the-night/${crop.file}`" :width="crop.iw" :height="crop.ih" :clip-path="`url(#${clipId})`" />
  </svg>
  <svg v-else-if="kind==='stake' && value" viewBox="0 0 64 64" class="night-glyph triangle" role="img" :aria-label="`${up?'Upward':'Downward'} triangle${value.endsWith('bar')?' with horizontal bar':''}`">
    <path :d="up?'M8 54 L32 9 L56 54 Z':'M8 10 L56 10 L32 55 Z'" />
    <path v-if="value.endsWith('bar')" d="M8 32 H56" />
  </svg>
  <span v-else class="unknown" aria-label="Not recorded">?</span>
</template>
<style scoped>
.night-glyph{display:block;width:3.5rem;height:3.5rem;overflow:hidden;border-radius:.2rem;background:#111}.folly-glyph{filter:grayscale(1) brightness(2.3)}.triangle{color:var(--wp-text);background:transparent;fill:none;stroke:currentColor;stroke-width:3;stroke-linejoin:round}.unknown{display:grid;place-items:center;width:3.5rem;height:3.5rem;color:var(--wp-muted);font-size:2rem}
</style>

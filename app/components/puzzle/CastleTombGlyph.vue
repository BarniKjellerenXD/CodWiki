<script setup lang="ts">
const props=defineProps<{glyph:{src:string,box:string,width:number,height:number,label:string}}>()
const clipId=`glyph-clip-${useId()}`
const crop=computed(()=>props.glyph.box.split(' ').map(Number))
</script>
<template><svg class="source-glyph" :viewBox="glyph.box" role="img" :aria-label="glyph.label"><defs><clipPath :id="clipId" clipPathUnits="userSpaceOnUse"><rect :x="crop[0]" :y="crop[1]" :width="crop[2]" :height="crop[3]" /></clipPath></defs><image :href="glyph.src" :width="glyph.width" :height="glyph.height" :clip-path="`url(#${clipId})`" /></svg></template>
<style scoped>.source-glyph{display:block;width:100%;height:78px;max-width:140px;overflow:hidden}</style>

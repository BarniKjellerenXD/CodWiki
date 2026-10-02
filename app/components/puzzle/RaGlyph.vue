<script setup lang="ts">
import { raSymbols } from '~/utils/chaosTools.mjs'
const props = defineProps<{ name: string }>()
const symbol = computed(() => raSymbols.find(item => item.name === props.name))
const clipId = useId()
</script>
<template>
  <svg v-if="symbol" :viewBox="`${symbol.x} ${symbol.y} 280 270`" overflow="hidden" role="img" :aria-label="`${name} obelisk glyph`" class="ra-glyph">
    <title>{{ name }} obelisk glyph</title>
    <defs><clipPath :id="clipId"><rect :x="symbol.x" :y="symbol.y" width="280" height="270" /></clipPath></defs>
    <image href="/images/bo4-ix/ra-symbols.png" width="1980" height="1080" :clip-path="`url(#${clipId})`" />
  </svg>
  <span v-else class="empty-glyph" aria-hidden="true">?</span>
</template>
<style scoped>
.ra-glyph{display:block;width:100%;height:90px;overflow:hidden;background:#000;border-radius:6px}.empty-glyph{display:grid;place-items:center;height:90px;font-size:2rem;color:var(--muted)}
</style>

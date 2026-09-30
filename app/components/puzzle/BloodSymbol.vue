<script setup lang="ts">
import { bloodSymbols } from '~/utils/bloodOfTheDead.mjs'
const props = defineProps<{ symbol: string }>()
const info = computed(() => bloodSymbols[props.symbol])
const crop = computed(() => info.value?.view.split(' ').map(Number) || [])
const clipId = useId()
</script>
<template>
  <svg v-if="info" class="blood-symbol" :viewBox="info.view" role="img" :aria-label="`${symbol}: ${info.name}`">
    <title>{{ symbol }}: {{ info.name }}</title>
    <defs><clipPath :id="clipId"><rect :x="crop[0]" :y="crop[1]" :width="crop[2]" :height="crop[3]" /></clipPath></defs>
    <image href="/images/blood-of-the-dead/powerhouse-symbols.png" width="900" height="1200" :clip-path="`url(#${clipId})`" />
  </svg>
</template>
<style scoped>.blood-symbol{display:block;width:64px;height:76px;background:#fff;border-radius:6px;overflow:hidden}</style>

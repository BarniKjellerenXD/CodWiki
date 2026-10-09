<script setup lang="ts">
import { useId } from 'vue'
import type { ReferenceCrop } from '~/types/map'
defineProps<{ src: string; crop: ReferenceCrop; alt?: string }>()
const clipId = useId()
</script>

<template>
  <svg class="reference-crop" :viewBox="`${crop.x} ${crop.y} ${crop.width} ${crop.height}`" :width="crop.width" :height="crop.height" :role="alt ? 'img' : undefined" :aria-label="alt" :aria-hidden="!alt || undefined">
    <defs><clipPath :id="clipId"><rect :x="crop.x" :y="crop.y" :width="crop.width" :height="crop.height" /></clipPath></defs>
    <image :href="src" :width="crop.sourceWidth" :height="crop.sourceHeight" :clip-path="`url(#${clipId})`" />
  </svg>
</template>

<style scoped>
.reference-crop { display:block; width:100%; height:auto; overflow:hidden; }
</style>

<script setup lang="ts">
defineProps<{ symbol: string }>()
</script>
<template>
  <svg viewBox="0 0 80 80" role="img" :aria-label="`${symbol} clock symbol`" class="voyage-symbol">
    <path :d="['water','earth'].includes(symbol)?'M 12 17 L 68 17 L 40 65 Z':'M 12 63 L 68 63 L 40 15 Z'" />
    <path v-if="['air','earth'].includes(symbol)" :d="symbol==='air'?'M 9 43 H 71':'M 9 39 H 71'" />
  </svg>
</template>
<style scoped>.voyage-symbol{width:68px;height:68px;display:block;color:var(--wp-gold-bright)}path{fill:none;stroke:currentColor;stroke-width:4;stroke-linejoin:round;stroke-linecap:round}</style>

<script setup lang="ts">
// A stage's rank stripes, like sleeve chevrons: one filled per stage reached,
// the rest drawn as empty outlines. Decorative; the text beside it names the
// stage.
const props = withDefaults(defineProps<{ rank: number, of?: number }>(), { of: 3 })
// Chevrons are 16 tall and 9 apart, stacked from the bottom and centred in a
// 48×48 box; y is the tip of each.
const chevrons = computed(() => Array.from({ length: props.of }, (_, index) => {
  const y = 8 + (props.of * 9 + 7) / 2 - index * 9
  return { on: index < props.rank, points: `8,${y + 10} 24,${y} 40,${y + 10} 40,${y + 16} 24,${y + 6} 8,${y + 16}` }
}))
</script>

<template>
  <svg class="gr" viewBox="0 0 48 48" aria-hidden="true">
    <polygon v-for="(item, index) in chevrons" :key="index" :points="item.points" :class="{ 'is-on': item.on }" />
  </svg>
</template>

<style scoped>
.gr { display: block; width: 100%; height: auto; overflow: visible; }
.gr polygon { fill: none; stroke: currentColor; stroke-width: 1.25; stroke-linejoin: round; opacity: 0.35; }
.gr polygon.is-on { fill: currentColor; opacity: 1; }
</style>

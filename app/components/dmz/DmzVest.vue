<script setup lang="ts">
// A plate carrier drawn for CodWiki: the vest in its rarity colour with one
// pocket per plate. Decorative unless it gets a label.
const props = withDefaults(defineProps<{ plates: number, rarity: string, label?: string, tempered?: boolean }>(), { label: '', tempered: false })
const slots = computed(() => Array.from({ length: props.plates }, (_, i) => 34 + i * 20 + (3 - props.plates) * 10))
const uid = useId()
</script>

<template>
  <svg class="vest" :data-rarity="rarity.toLowerCase()" viewBox="0 0 120 120" :role="label ? 'img' : undefined" :aria-label="label || undefined" :aria-hidden="label ? undefined : 'true'">
    <defs v-if="tempered">
      <pattern :id="`${uid}-hatch`" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <path d="M0 0v6" class="vest-hatch" />
      </pattern>
    </defs>
    <path class="vest-body" d="M30 24L44 10h8l4 12h8l4-12h8l14 14 4 76c-10 6-22 9-34 9s-24-3-34-9z" />
    <path v-if="tempered" :fill="`url(#${uid}-hatch)`" d="M30 24L44 10h8l4 12h8l4-12h8l14 14 4 76c-10 6-22 9-34 9s-24-3-34-9z" />
    <path class="vest-strap" d="M44 10l-6 22 M76 10l6 22" />
    <rect v-for="y in slots" :key="y" class="vest-plate" x="40" :y="y" width="40" height="16" rx="2" />
    <path class="vest-belt" d="M27 88c11 5 22 7 33 7s22-2 33-7" />
  </svg>
</template>

<style scoped>
.vest { display: block; width: 100%; height: auto; --v: #b8b9ac; }
.vest[data-rarity='uncommon'] { --v: #a9d98a; }
.vest[data-rarity='rare'] { --v: #7fb8e6; }
.vest[data-rarity='epic'] { --v: #b99ae8; }
.vest[data-rarity='legendary'] { --v: #ddb363; }
.vest[data-rarity='ultra'] { --v: #ff6a5c; }
.vest-body { fill: rgba(22, 26, 25, 0.9); stroke: var(--v); stroke-width: 2; stroke-linejoin: round; }
.vest-hatch { stroke: var(--v); stroke-width: 1; opacity: 0.22; }
.vest-strap, .vest-belt { fill: none; stroke: var(--v); stroke-width: 1.5; stroke-linecap: round; opacity: 0.55; }
.vest-plate { fill: var(--v); fill-opacity: 0.82; stroke: rgba(11, 13, 12, 0.8); stroke-width: 1.5; }
</style>

<script setup lang="ts">
const props = defineProps<{ value: number, mode?: 'dots' | 'rune', label?: string }>()
const digits = computed(() => props.value.toString(props.mode === 'rune' ? 4 : 3).split('').map(Number))
</script>
<template>
  <svg :viewBox="`0 0 ${digits.length * 38 + 16} 80`" role="img" :aria-label="label || `${mode || 'dots'} ${value}`" class="origins-glyph">
    <g v-for="(digit,index) in digits" :key="index" :transform="`translate(${index * 38 + 12},0)`">
      <template v-if="mode !== 'rune'">
        <circle v-if="digit === 0" cx="12" cy="40" r="7" fill="none" stroke="currentColor" stroke-width="3" />
        <circle v-if="digit === 1" cx="12" cy="40" r="7" fill="currentColor" />
        <template v-if="digit === 2"><circle cx="12" cy="28" r="7" fill="currentColor" /><circle cx="12" cy="52" r="7" fill="currentColor" /></template>
      </template>
      <template v-else>
        <path :d="digit === 0 ? 'M5 34 H19 L12 44 Z' : 'M5 13 H19 L12 23 Z'" fill="currentColor" />
        <path v-if="digit > 0" d="M12 20 V63" fill="none" stroke="currentColor" stroke-width="3" />
        <template v-if="digit >= 2"><path d="M12 61 H29" stroke="currentColor" stroke-width="3" /><path d="M33 54 V68 L24 61 Z" fill="currentColor" /></template>
        <template v-if="digit === 3"><path d="M12 42 H29" stroke="currentColor" stroke-width="3" /><path d="M33 35 V49 L24 42 Z" fill="currentColor" /></template>
      </template>
    </g>
  </svg>
</template>
<style scoped>.origins-glyph{height:80px;max-width:150px;width:100%;color:var(--gold);display:block;margin:auto}</style>

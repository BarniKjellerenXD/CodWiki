<script setup lang="ts">
import type { PropType } from 'vue'
import { dmzIntel, intelCategory, intelConfidenceLabel } from '#shared/dmz-intel.mjs'

// One Intel entry as a compact, tappable row. The page decides what opening it does.
type Entry = (typeof dmzIntel)[number]
const props = defineProps({
  entry: { type: Object as PropType<Entry>, required: true },
  // Show the summary under the name (clamped to two lines).
  summary: { type: Boolean, default: false },
  // Replaces the type · category line, for example with a recipe cost.
  meta: { type: String, default: '' },
  active: { type: Boolean, default: false },
})
const emit = defineEmits<{ open: [entry: Entry] }>()
const kind = computed(() => props.meta || [props.entry.type, intelCategory(props.entry.category)?.label].filter(Boolean).join(' · '))
</script>

<template>
  <button type="button" class="lr" :class="{ 'is-active': active }" @click="emit('open', entry)">
    <span class="lr-top">
      <span class="lr-name w-semi">{{ entry.name }}</span>
      <span class="lab-badge" :class="`is-${entry.confidence}`">{{ intelConfidenceLabel(entry.confidence) }}</span>
    </span>
    <span class="lr-kind dmz-mono">{{ kind }}</span>
    <span v-if="summary" class="lr-summary">{{ entry.summary }}</span>
  </button>
</template>

<style scoped>
.lr { display: flex; flex-direction: column; gap: 0.2rem; width: 100%; min-height: 3rem; padding: 0.625rem 0.875rem; border: 1px solid var(--dz-line); border-radius: 12px; background: rgba(20, 24, 23, 0.72); color: inherit; font: inherit; text-align: left; cursor: pointer; }
.lr:hover { border-color: var(--dz-line-strong); background: rgba(34, 40, 38, 0.85); }
.lr.is-active { border-color: var(--dz-accent); box-shadow: inset 3px 0 var(--dz-accent); }
.lr-top { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
.lr-name { font-size: 1.0625rem; font-weight: 600; line-height: 1.25; color: #f3f1e5; }
.lr-kind { font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); }
.lr-summary { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-top: 0.15rem; color: #d6d3c4; font-size: 0.9375rem; line-height: 1.45; }
</style>

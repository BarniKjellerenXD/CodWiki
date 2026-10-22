<script setup lang="ts">
import type { PropType } from 'vue'
import { dmzIntel, intelCategory, intelConfidenceLabel } from '#shared/dmz-intel.mjs'

// One Intel entry as a compact row that opens it in the drawer.
type Entry = (typeof dmzIntel)[number]
const props = defineProps({
  entry: { type: Object as PropType<Entry>, required: true },
  // Show the summary under the name (clamped to two lines).
  summary: { type: Boolean, default: false },
  // Replaces the type · category line, for example with a fix status.
  meta: { type: String, default: '' },
})
const kind = computed(() => props.meta || [props.entry.type, intelCategory(props.entry.category)?.label].filter(Boolean).join(' · '))
</script>

<template>
  <DmzIntelLink :id="entry.id" anchor class="ir">
    <span class="ir-top">
      <span class="ir-name w-semi">{{ entry.name }}</span>
      <span class="dz-badge" :class="`is-${entry.confidence}`">{{ intelConfidenceLabel(entry.confidence) }}</span>
    </span>
    <span class="ir-kind dmz-mono">{{ kind }}</span>
    <span v-if="summary" class="ir-summary">{{ entry.summary }}</span>
  </DmzIntelLink>
</template>

<style scoped>
.ir { display: flex; flex-direction: column; gap: 0.2rem; width: 100%; height: 100%; min-height: 3rem; padding: 0.625rem 0.875rem; border: 1px solid var(--dz-line); border-radius: 12px; background: rgba(20, 24, 23, 0.72); color: inherit !important; text-decoration: none; }
.ir:hover { border-color: var(--dz-line-strong); background: rgba(34, 40, 38, 0.85); }
.ir.is-open { border-color: var(--dz-accent); box-shadow: inset 3px 0 var(--dz-accent); }
.ir-top { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
.ir-name { font-size: 1.0625rem; font-weight: 600; line-height: 1.25; color: #f3f1e5; }
.ir-kind { font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); }
.ir-summary { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-top: 0.15rem; color: #d6d3c4; font-size: 0.9375rem; line-height: 1.45; }
</style>

<script setup lang="ts">
import { guideTier } from '#shared/dmz-guide.mjs'
import { intelEntry } from '#shared/dmz-stations.mjs'
import { intelConfidenceLabel } from '#shared/dmz-intel.mjs'

// A stage's steps in order. Each opens like a dropdown; the tick beside it
// stays on this device. The first unticked step is marked Next and starts
// open, so ticking a step hands over to the one after it.
const props = withDefaults(defineProps<{ tier: string, open?: boolean }>(), { open: false })
const tier = computed(() => guideTier(props.tier)!)
const { isDone, toggle, doneIn } = useDmzGuide()
const nextId = computed(() => tier.value.steps.find(step => !isDone(tier.value.id, step.id))?.id)
const nameOf = (id: string) => intelEntry(id)?.name || id
</script>

<template>
  <div class="gs">
    <p class="gs-count dmz-mono" aria-live="polite">{{ doneIn(tier.id) }} of {{ tier.steps.length }} done</p>
    <ol class="gs-list">
      <li v-for="(step, index) in tier.steps" :key="step.id" class="gs-step" :class="{ 'is-done': isDone(tier.id, step.id), 'is-next': step.id === nextId }">
        <button type="button" class="gs-tick" :aria-pressed="isDone(tier.id, step.id)" :aria-label="`Done: ${step.title}`" @click="toggle(tier.id, step.id)">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </button>
        <details class="gs-body" :open="open || step.id === nextId || undefined">
          <summary>
            <span class="gs-index dmz-mono" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="gs-title">{{ step.title }}</span>
            <span v-if="step.id === nextId" class="gs-next dmz-mono">Next</span>
            <span class="gs-when dmz-mono">{{ step.when }}</span>
            <svg class="gs-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
          </summary>
          <div class="gs-detail">
            <p>{{ step.text }}</p>
            <div v-if="step.how?.length" class="gs-how">
              <p class="gs-how-label dmz-mono">How</p>
              <ol><li v-for="line in step.how" :key="line">{{ line }}</li></ol>
            </div>
            <div class="gs-links">
              <span class="dz-badge" :class="`is-${step.confidence}`">{{ step.advice ? 'Advice · ' : '' }}{{ intelConfidenceLabel(step.confidence) }}</span>
              <DmzIntelLink v-for="id in step.intel || []" :id="id" :key="id" class="gs-intel">{{ nameOf(id) }}</DmzIntelLink>
            </div>
          </div>
        </details>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.gs-count { margin: 0 0 0.5rem; font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-muted); }
.gs-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.375rem; }
.gs-step { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 0.5rem; align-items: start; }
.gs-tick { display: grid; place-items: center; width: 2.75rem; height: 2.75rem; border: 1.5px solid var(--dz-line-strong); border-radius: 10px; background: rgba(14, 16, 15, 0.5); color: transparent; cursor: pointer; }
.gs-tick:hover { border-color: var(--dz-ink); }
.gs-tick svg { width: 1.25rem; height: 1.25rem; fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
.gs-tick[aria-pressed='true'] { background: var(--dz-green); border-color: var(--dz-green); color: var(--dz-bg); }
.gs-body { border: 1px solid var(--dz-line); border-radius: 12px; background: rgba(20, 24, 23, 0.82); }
.gs-body[open] { border-color: var(--dz-line-strong); }
.gs-body summary { display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem 0.75rem; min-height: 2.75rem; padding: 0.5rem 0.875rem; cursor: pointer; list-style: none; }
.gs-body summary::-webkit-details-marker { display: none; }
.gs-index { font-size: 0.75rem; color: var(--dz-accent); }
.gs-title { flex: 1 1 14rem; font-size: 1.0625rem; font-weight: 600; color: var(--dz-ink); }
.is-done .gs-title { color: var(--dz-muted); text-decoration: line-through; text-decoration-color: rgba(233, 230, 214, 0.4); }
.gs-when { font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-teal); }
.is-next .gs-body { border-color: rgba(221, 179, 99, 0.7); box-shadow: inset 3px 0 0 var(--dz-accent); }
.gs-next { padding: 0.15rem 0.5rem; border-radius: 4px; background: var(--dz-accent); color: var(--dz-bg); font-size: 0.625rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; }
.gs-chev { flex: none; width: 1.125rem; height: 1.125rem; fill: none; stroke: var(--dz-muted); stroke-width: 2; transition: transform 0.15s; }
.gs-body[open] .gs-chev { transform: rotate(180deg); }
.gs-detail { padding: 0 0.875rem 0.875rem 2.6rem; }
.gs-detail p { margin: 0 0 0.625rem; max-width: 44rem; color: #dcd9cb; font-size: 1rem; line-height: 1.5; }
.gs-how { margin: 0 0 0.75rem; max-width: 44rem; padding: 0.625rem 0.875rem; border-left: 2px solid var(--dz-accent); background: rgba(11, 13, 12, 0.5); }
.gs-detail .gs-how-label { margin: 0 0 0.25rem; font-size: 0.625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-accent); }
.gs-how ol { margin: 0; padding-left: 1.15rem; list-style: decimal; display: grid; gap: 0.25rem; color: #dcd9cb; font-size: 0.9375rem; line-height: 1.45; }
.gs-links { display: flex; flex-wrap: wrap; align-items: center; gap: 0.375rem 0.5rem; }
.gs-intel { display: inline-flex; align-items: center; min-height: 2rem; padding: 0 0.75rem; border: 1px solid var(--dz-line-strong); border-radius: 999px; font-size: 0.875rem; text-decoration: none; color: var(--dz-ink-2) !important; }
.gs-intel:hover { border-color: var(--dz-ink); color: #fff !important; }
@media (prefers-reduced-motion: reduce) { .gs-chev { transition: none; } }
@media (max-width: 599px) {
  .gs-title { flex: 1 1 0; min-width: 0; }
  .gs-chev { order: 1; }
  .gs-when { order: 2; flex-basis: 100%; padding-left: 1.75rem; }
  .gs-detail { padding-left: 0.875rem; }
}
</style>

<script setup lang="ts">
import { guideTier, guideTiers } from '#shared/dmz-guide.mjs'

// A stage's mistakes to avoid, or its "ready for the next stage" checklist.
const props = defineProps<{ tier: string, kind: 'mistakes' | 'ready' }>()
const tier = computed(() => guideTier(props.tier)!)
const next = computed(() => guideTiers[guideTiers.findIndex(item => item.id === props.tier) + 1])
const items = computed<string[]>(() => props.kind === 'ready' ? tier.value.ready : tier.value.mistakes)
</script>

<template>
  <div class="gk" :class="`gk--${kind}`">
    <ul class="gk-list">
      <li v-for="item in items" :key="item">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="kind === 'ready' ? 'M5 12.5l4.5 4.5L19 7.5' : 'M7 7l10 10 M17 7L7 17'" /></svg>
        <span>{{ item }}</span>
      </li>
    </ul>
    <p v-if="kind === 'ready' && next" class="gk-next dmz-mono">All true? Move on to the {{ next.name.toLowerCase() }} game.</p>
  </div>
</template>

<style scoped>
.gk-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.375rem; }
.gk-list li { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 0.625rem; align-items: start; padding: 0.625rem 0.875rem; border-left: 2px solid var(--gk-c); background: rgba(20, 24, 23, 0.7); color: #dcd9cb; font-size: 0.975rem; line-height: 1.45; }
.gk-list svg { width: 1.125rem; height: 1.125rem; margin-top: 0.15rem; fill: none; stroke: var(--gk-c); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.gk--mistakes { --gk-c: #ef7a5a; }
.gk--ready { --gk-c: var(--dz-green); }
.gk-next { margin: 0.625rem 0 0; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-green); }
</style>

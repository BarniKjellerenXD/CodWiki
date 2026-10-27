<script setup lang="ts">
import { guideOpFit, guideFitLabels, intelSteps } from '#shared/dmz-guide.mjs'
import { intelEntry } from '#shared/dmz-stations.mjs'

// Every Dynamic Op, rated for an early-game squad. Each card shows its steps
// as icons and opens into the steps in words.
withDefaults(defineProps<{ heading?: boolean }>(), { heading: false })
const fit = ref('all')
const fits = ['good', 'caution', 'avoid']
const ops = computed(() => guideOpFit.filter(item => fit.value === 'all' || item.fit === fit.value).map(item => ({ ...item, entry: intelEntry(item.id)!, steps: intelSteps(item.id) })))
const titleId = useId()
</script>

<template>
  <section class="go" :aria-labelledby="heading ? titleId : undefined" :aria-label="heading ? undefined : 'The Dynamic Ops'">
    <header class="go-head">
      <h3 v-if="heading" :id="titleId" class="dz-h3">The Dynamic Ops</h3>
      <p>Steps, places and keypad codes change between matches. Ratings say how each op suits an early-game squad, still in 2-plate vests.</p>
      <div class="dz-chips" role="group" aria-label="Show ops">
        <button type="button" class="dz-chip" :aria-pressed="fit === 'all'" @click="fit = 'all'">All</button>
        <button v-for="item in fits" :key="item" type="button" class="dz-chip" :aria-pressed="fit === item" @click="fit = item"><i class="go-dot" :data-fit="item" aria-hidden="true" />{{ guideFitLabels[item] }}</button>
      </div>
    </header>
    <ul class="go-list">
      <li v-for="op in ops" :key="op.id">
        <details class="go-op" :data-fit="op.fit">
          <summary>
            <span class="go-name">{{ op.entry.name }}</span>
            <span class="go-fit dmz-mono"><i class="go-dot" :data-fit="op.fit" aria-hidden="true" />{{ guideFitLabels[op.fit] }}</span>
            <DmzStepChain v-if="op.steps.length" :steps="op.steps" :label="`${op.entry.name} steps`" compact class="go-icons" aria-hidden="true" />
          </summary>
          <div class="go-body">
            <p>{{ op.why }}</p>
            <DmzStepChain v-if="op.steps.length" :steps="op.steps" :label="`${op.entry.name} steps`" />
            <p v-else class="go-none dmz-mono">Steps not published yet</p>
            <DmzIntelLink :id="op.id" class="go-intel">{{ op.entry.name }} in Intel</DmzIntelLink>
          </div>
        </details>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.go-head { display: grid; gap: 0.5rem; margin-bottom: 0.75rem; }
.go-head p { margin: 0; max-width: 46rem; color: var(--dz-muted); font-size: 0.95rem; }
.go-dot { display: inline-block; width: 0.5rem; height: 0.5rem; border-radius: 50%; background: var(--dz-muted); }
.go-dot[data-fit='good'] { background: var(--dz-green); }
.go-dot[data-fit='caution'] { background: #d8c47c; }
.go-dot[data-fit='avoid'] { background: #ef7a5a; }
.go-list { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr)); gap: 0.5rem; align-items: start; }
.go-op { border: 1px solid var(--dz-line); border-left: 3px solid var(--go-f, var(--dz-line-strong)); border-radius: 0 12px 12px 0; background: rgba(20, 24, 23, 0.82); }
.go-op[data-fit='good'] { --go-f: var(--dz-green); }
.go-op[data-fit='caution'] { --go-f: #d8c47c; }
.go-op[data-fit='avoid'] { --go-f: #ef7a5a; }
.go-list > li:has(> .go-op[open]) { grid-column: 1 / -1; }
.go-op summary { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.375rem 0.75rem; align-items: center; padding: 0.75rem 0.875rem; cursor: pointer; list-style: none; }
.go-op summary::-webkit-details-marker { display: none; }
.go-name { font-size: 1.0625rem; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: var(--dz-ink); }
.go-fit { display: inline-flex; align-items: center; gap: 0.375rem; font-size: 0.625rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-muted); }
.go-icons { grid-column: 1 / -1; }
.go-op[open] .go-icons { display: none; }
.go-body { display: grid; gap: 0.75rem; padding: 0 0.875rem 0.875rem; }
.go-body p { margin: 0; color: #dcd9cb; font-size: 0.975rem; }
.go-none { font-size: 0.75rem !important; color: var(--dz-muted) !important; }
.go-intel { display: inline-flex; align-items: center; min-height: 2.5rem; font-size: 0.9375rem; font-weight: 600; color: var(--dz-ink) !important; text-underline-offset: 0.2em; }
@media (max-width: 599px) {
  .go-list { grid-template-columns: minmax(0, 1fr); }
}
</style>

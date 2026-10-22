<script setup lang="ts">
import { traitTrees, majorPair, traitsIn, tipsFor, traitIcon } from '#shared/dmz-traits.mjs'
import { intelConfidenceLabel } from '#shared/dmz-intel.mjs'

// Each tree as its three Major forks, A against B, with what players say about
// each side, then the Minors players have seen in that tree.
const props = withDefaults(defineProps<{ only?: string | null }>(), { only: null })
const trees = computed(() => traitTrees.filter(tree => !props.only || tree.id === props.only).map(tree => ({
  ...tree,
  forks: [3, 6, 9].map(row => ({ row, pair: majorPair(tree.id, row).map(trait => ({ ...trait, tips: tipsFor(trait.id) })) })),
  minors: traitsIn(tree.id, 'minor'),
})))
</script>

<template>
  <div class="tf">
    <section v-for="tree in trees" :key="tree.id" class="tf-tree" :style="{ '--tc': tree.colour }" :aria-labelledby="`tf-${tree.id}`">
      <header class="tf-head">
        <h3 :id="`tf-${tree.id}`" class="tf-name">{{ tree.name }}</h3>
        <p>{{ tree.role }}</p>
      </header>
      <ol class="tf-forks">
        <li v-for="fork in tree.forks" :key="fork.row" class="tf-fork">
          <span class="tf-row dmz-mono">Row {{ fork.row }}</span>
          <div class="tf-pair">
            <article v-for="(trait, index) in fork.pair" :key="trait.id" class="tf-side">
              <h4><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="traitIcon(trait)" /></svg>{{ trait.name }}</h4>
              <p>{{ trait.effect }}</p>
              <ul v-if="trait.tips.length" class="tf-tips"><li v-for="tip in trait.tips" :key="tip.say">{{ tip.say }}<span v-if="tip.players > 1" class="dmz-mono"> · {{ tip.players }} players</span></li></ul>
              <span v-if="index === 0" class="tf-or dmz-mono" aria-hidden="true">or</span>
            </article>
          </div>
        </li>
      </ol>
      <details class="tf-minors">
        <summary class="dmz-mono">Minors seen in {{ tree.name }} · {{ tree.minors.length }}</summary>
        <ul><li v-for="item in tree.minors" :key="item.id"><strong>{{ item.name }}.</strong> {{ item.effect }} <span class="dz-badge" :class="`is-${item.confidence}`">{{ intelConfidenceLabel(item.confidence) }}</span></li></ul>
      </details>
    </section>
  </div>
</template>

<style scoped>
.tf { display: grid; gap: 1.5rem; }
.tf-tree { --tc: #ccc; padding: 1rem; border: 1px solid var(--dz-line); border-top: 3px solid var(--tc); border-radius: 4px 4px 16px 16px; background: rgba(14, 16, 15, 0.6); }
.tf-head { margin-bottom: 0.75rem; }
.tf-name { margin: 0; color: var(--tc); font-size: 1.5rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; font-variation-settings: 'wdth' 75; }
.tf-head p { margin: 0.25rem 0 0; color: var(--dz-muted); }
.tf-forks { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.75rem; }
.tf-fork { display: grid; grid-template-columns: 4rem minmax(0, 1fr); gap: 0.75rem; align-items: start; }
.tf-row { padding-top: 0.75rem; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--tc); }
.tf-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.tf-side { position: relative; padding: 0.75rem 0.875rem; border: 1px solid var(--dz-line); border-radius: 12px; background: rgba(20, 24, 23, 0.85); }
.tf-side h4 { display: flex; align-items: center; gap: 0.5rem; margin: 0 0 0.25rem; color: #f3f1e5; font-size: 1.05rem; }
.tf-side h4 svg { flex: none; width: 1.75rem; height: 1.75rem; padding: 0.3rem; border-radius: 7px; background: var(--tc); fill: none; stroke: #fff; stroke-width: 1.75; stroke-linecap: round; stroke-linejoin: round; }
.tf-side p { margin: 0; color: #dcd9cb; font-size: 0.95rem; }
.tf-tips { margin: 0.5rem 0 0; padding: 0.5rem 0 0 1rem; border-top: 1px dashed var(--dz-line); display: grid; gap: 0.25rem; color: #cfccbd; font-size: 0.9rem; }
.tf-tips .dmz-mono { font-size: 0.7rem; color: var(--dz-muted); }
.tf-or { position: absolute; top: 50%; right: -1.3rem; transform: translateY(-50%); font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-muted); }
.tf-minors { margin-top: 0.75rem; }
.tf-minors summary { display: inline-flex; align-items: center; min-height: 2.75rem; cursor: pointer; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-ink-2); }
.tf-minors ul { margin: 0; padding-left: 1.1rem; display: grid; gap: 0.375rem; color: #dcd9cb; font-size: 0.95rem; }
@media (max-width: 899px) {
  .tf-fork { grid-template-columns: minmax(0, 1fr); gap: 0.25rem; }
  .tf-row { padding-top: 0; }
  .tf-pair { grid-template-columns: minmax(0, 1fr); gap: 1.375rem; }
  .tf-or { top: auto; right: auto; bottom: -1.2rem; left: 50%; transform: translateX(-50%); }
}
</style>

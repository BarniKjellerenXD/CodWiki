<script setup lang="ts">
import { dmzStations } from '#shared/dmz.mjs'
import { dmzIntel, intelConfidenceLabel } from '#shared/dmz-intel.mjs'
import { intelEntry } from '#shared/dmz-stations.mjs'
import { traitList, traitRules, traitTrees, TRAITS_CHECKED } from '#shared/dmz-traits.mjs'

// Operators station: the trait trees drawn like the in-game screen, with the
// build planner and fork cards (the mix chosen in /dmz/lab/traits), the trait
// rules, then the Operator rules: Active Duty, MIA and Dog Tags.
const icon = dmzStations.find(station => station.id === 'operators')!.icon
const overview = intelEntry('trait-trees')
const keyRules = ['Points per Operator', 'Tree cap', 'Branch rule', 'Minors are random', 'Permanence and respec']
  .map(label => traitRules.find(rule => rule.label === label)!)
const moreRules = traitRules.filter(rule => !keyRules.includes(rule))
const shown = new Set(['trait-trees', ...traitList.map(trait => trait.intel).filter(Boolean)])
const loose = dmzIntel.filter(entry => entry.category === 'traits' && !shown.has(entry.id) && !entry.type.startsWith('Trait tree'))
const operators = dmzIntel.filter(entry => entry.category === 'operators')
const count = (kind: string) => traitList.filter(trait => trait.kind === kind).length
</script>

<template>
  <div class="dmz-page">
    <DmzPageHead title="Operators" :icon="icon" :checked="TRAITS_CHECKED" :status="`${traitTrees.length} trees · ${count('major')} Majors · ${count('minor')} Minors seen · ${operators.length} Operator entries`">
      <p class="dz-lede">Each Operator earns up to 18 Trait Points and spends them in three trees that climb from the bottom, like the in-game TRAITS screen. Tap a node to see what it does and what players say about it, or plan a build.<template v-if="overview">{{ " " }}<DmzIntelLink :id="overview.id" anchor class="tt-more">How traits work</DmzIntelLink></template></p>
    </DmzPageHead>

    <section id="traits" class="dz-group" aria-labelledby="traits-title">
      <h2 id="traits-title" class="sr-only">Trait trees</h2>
      <DmzTraitsBoard planner />
    </section>

    <section id="trait-rules" class="dz-group" aria-labelledby="trait-rules-title">
      <header class="dz-group-head"><h2 id="trait-rules-title" class="dz-h2">Trait rules</h2></header>
      <dl class="tt-rules">
        <div v-for="rule in keyRules" :key="rule.label"><dt class="dmz-mono">{{ rule.label }}</dt><dd>{{ rule.value }}</dd></div>
      </dl>
      <details class="tt-all">
        <summary class="dmz-mono">More rules: Prestige, MIA, bugs · {{ moreRules.length }}</summary>
        <dl>
          <div v-for="rule in moreRules" :key="rule.label">
            <dt>{{ rule.label }} <span class="dz-badge" :class="`is-${rule.confidence}`">{{ intelConfidenceLabel(rule.confidence) }}</span></dt>
            <dd>{{ rule.value }}</dd>
          </div>
        </dl>
        <DmzGuideSources :ids="traitRules.flatMap(rule => rule.sources)" />
      </details>
    </section>

    <section v-if="loose.length" class="dz-group" aria-labelledby="loose-title">
      <header class="dz-group-head"><h2 id="loose-title" class="dz-h2">Other trait entries</h2><p>Trait names and claims in Intel that are not in the trees above, mostly because they are not confirmed.</p></header>
      <ul class="dz-rows"><li v-for="entry in loose" :key="entry.id"><DmzIntelRow :entry="entry" summary /></li></ul>
    </section>
    <section id="operators" class="dz-group" aria-labelledby="operators-title">
      <header class="dz-group-head">
        <h2 id="operators-title" class="dz-h2">Operators</h2>
        <p>Active Duty slots, what happens when an Operator goes missing in action, and Dog Tag levels.</p>
      </header>
      <ul class="dz-rows"><li v-for="entry in operators" :key="entry.id"><DmzIntelRow :entry="entry" summary /></li></ul>
    </section>
  </div>
</template>

<style scoped>
.tt-more { color: var(--dz-ink) !important; text-underline-offset: 0.2em; }
.tt-rules { display: grid; grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr)); gap: 0.5rem; margin: 0; }
.tt-rules > div { padding: 0.625rem 0.875rem; border: 1px solid var(--dz-line); border-radius: 12px; background: rgba(20, 24, 23, 0.7); }
.tt-rules dt { font-size: 0.625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-teal); }
.tt-rules dd { margin: 0.125rem 0 0; color: #e3e0d0; font-size: 0.95rem; }
.tt-all { margin-top: 0.75rem; }
.tt-all > summary { display: inline-flex; align-items: center; min-height: 2.75rem; cursor: pointer; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-ink-2); }
.tt-all dl { display: grid; gap: 0.625rem; margin: 0.25rem 0 0.5rem; }
.tt-all dt { display: flex; align-items: center; gap: 0.5rem; color: #f3f1e5; font-weight: 600; }
.tt-all dd { margin: 0.125rem 0 0; max-width: 52rem; color: #dcd9cb; font-size: 0.95rem; }
</style>

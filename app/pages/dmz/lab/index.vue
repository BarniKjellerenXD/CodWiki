<script setup lang="ts">
import { dmzStations } from '#shared/dmz.mjs'
import { dmzIntel, intelCategories } from '#shared/dmz-intel.mjs'
import { labConcepts, labMix, labCriteria, labScores } from '#shared/dmz-lab.mjs'

// The lab front page: every Intel concept side by side, with the recommendation.
const icon = dmzStations.find(station => station.id === 'intel')!.icon
const rows = [...labConcepts.map(concept => ({ id: concept.id, tag: concept.letter, name: concept.name, path: concept.path })), { id: labMix.id, tag: 'Mix', name: labMix.name, path: labMix.path }]
const score = (id: string, criterion: string) => (labScores as Record<string, Record<string, number>>)[id]![criterion]!
const parts = labMix.parts.map(id => labConcepts.find(concept => concept.id === id)!)
const today = intelCategories.map(category => ({ ...category, count: dmzIntel.filter(entry => entry.category === category.id).length }))
  .filter(item => item.count).sort((a, b) => b.count - a.count)
const scoreLabel = (value: number) => ['', 'weak', 'fair', 'strong'][value]
</script>

<template>
  <div class="dmz-page">
    <DmzPageHead title="Intel concepts" :icon="icon" :status="`${labConcepts.length} concepts and a recommended mix · drafts only`">
      <p class="lab-lede">Today Intel is one long page of {{ dmzIntel.length }} cards. These drafts show five other ways in, each built with the real Intel data and the DMZ look. Open them on a phone too. Nothing here replaces the live <NuxtLink to="/dmz/intel">Intel database</NuxtLink> until a direction is picked.</p>
    </DmzPageHead>

    <section class="x-rec" aria-labelledby="x-rec">
      <div class="x-rec-main">
        <p class="x-rec-tag dmz-mono"><span>Recommended</span><span>{{ parts.map(part => part.letter).join(' + ') }}</span></p>
        <h2 id="x-rec" class="x-rec-title">{{ labMix.name }}</h2>
        <p class="x-rec-pitch">{{ labMix.pitch }}</p>
        <NuxtLink :to="labMix.path" class="dmz-pill">Open the mix <span aria-hidden="true">→</span></NuxtLink>
      </div>
      <div class="x-rec-why">
        <span class="dmz-label dmz-mono">Why this one</span>
        <ul><li v-for="reason in labMix.why" :key="reason">{{ reason }}</li></ul>
      </div>
    </section>

    <section class="x-section" aria-labelledby="x-glance">
      <h2 id="x-glance" class="lab-h2">At a glance</h2>
      <div class="x-table-wrap" role="region" aria-labelledby="x-glance" tabindex="0">
        <table class="x-table">
          <thead>
            <tr>
              <th scope="col" class="dmz-mono">Concept</th>
              <th v-for="criterion in labCriteria" :key="criterion.id" scope="col" class="dmz-mono">{{ criterion.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id" :class="{ 'is-rec': row.id === labMix.id }">
              <th scope="row"><NuxtLink :to="row.path"><span class="x-letter dmz-mono">{{ row.tag }}</span>{{ row.name }}</NuxtLink></th>
              <td v-for="criterion in labCriteria" :key="criterion.id">
                <span class="x-dots" :aria-label="scoreLabel(score(row.id, criterion.id))"><span v-for="n in 3" :key="n" :class="{ 'is-on': n <= score(row.id, criterion.id) }" /></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="x-key dmz-mono">Three dots is best. For upkeep and build cost, more dots means less work.</p>
    </section>

    <section class="x-section" aria-labelledby="x-options">
      <h2 id="x-options" class="lab-h2">The five concepts</h2>
      <div class="x-grid">
        <article v-for="concept in labConcepts" :key="concept.id" class="x-card" :class="{ 'is-part': labMix.parts.includes(concept.id) }">
          <header class="x-card-head">
            <span class="x-big dmz-mono" aria-hidden="true">{{ concept.letter }}</span>
            <div>
              <h3 class="lab-h3">{{ concept.name }}</h3>
              <p class="x-cost dmz-mono">Cost: {{ concept.cost }}<template v-if="labMix.parts.includes(concept.id)"> · in the mix</template></p>
            </div>
          </header>
          <p class="x-pitch">{{ concept.pitch }}</p>
          <p class="x-best"><span class="dmz-mono">Best for</span>{{ concept.bestFor }}</p>
          <div class="x-pc">
            <div>
              <h4 class="x-pc-h dmz-mono is-pro">Pros</h4>
              <ul><li v-for="item in concept.pros" :key="item">{{ item }}</li></ul>
            </div>
            <div>
              <h4 class="x-pc-h dmz-mono is-con">Cons</h4>
              <ul><li v-for="item in concept.cons" :key="item">{{ item }}</li></ul>
            </div>
          </div>
          <p class="x-cost-note">{{ concept.costNote }}</p>
          <NuxtLink :to="concept.path" class="dmz-pill dmz-pill--ghost x-open">Open concept {{ concept.letter }}<span class="sr-only">: {{ concept.name }}</span> <span aria-hidden="true">→</span></NuxtLink>
        </article>
      </div>
    </section>

    <section class="x-section dmz-panel" aria-labelledby="x-today">
      <span id="x-today" class="dmz-label dmz-mono">What Intel holds today</span>
      <p class="x-today-text">The biggest groups are locations, gear and missions. Locations and keys already have better homes on the Tac-Map and in the key tracker, which is why every concept hands them over.</p>
      <ul class="x-today">
        <li v-for="item in today" :key="item.id"><span>{{ item.label }}</span><span class="dmz-mono">{{ item.count }}</span></li>
      </ul>
      <p class="x-plan">The full write-up, with the step-by-step plan, is in <code>docs/mw4-dmz-intel-concepts.md</code>.</p>
    </section>
  </div>
</template>

<style scoped>
.x-rec { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 1.5rem 2rem; margin-top: 2rem; padding: 1.5rem; border: 1px solid rgba(169, 217, 138, 0.45); border-radius: 20px; background: linear-gradient(135deg, rgba(169, 217, 138, 0.12), rgba(20, 24, 23, 0.7) 60%); }
.x-rec-main { display: flex; flex-direction: column; align-items: flex-start; gap: 0.75rem; }
.x-rec-tag { display: flex; gap: 0.375rem; margin: 0; }
.x-rec-tag span { padding: 0.2rem 0.55rem; border-radius: 4px; background: var(--dz-green); color: var(--dz-bg); font-size: 0.6875rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; }
.x-rec-tag span + span { background: rgba(233, 230, 214, 0.16); color: var(--dz-ink); }
.x-rec-title { margin: 0; font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 700; line-height: 1; letter-spacing: 0.03em; text-transform: uppercase; font-variation-settings: 'wdth' 75; color: #f7f5ea; }
.x-rec-pitch { margin: 0; color: #e3e0d0; font-size: 1.0625rem; }
.x-rec-why ul { margin: 0; padding-left: 1.1rem; display: grid; gap: 0.5rem; color: #dcd9cb; }
.x-section { margin-top: 2.5rem; }
.x-table-wrap { margin-top: 0.875rem; overflow-x: auto; border: 1px solid var(--dz-line); border-radius: 16px; background: rgba(14, 16, 15, 0.6); }
.x-table { width: 100%; min-width: 44rem; border-collapse: collapse; }
.x-table th, .x-table td { padding: 0.625rem 0.875rem; border-bottom: 1px solid var(--dz-line); text-align: left; vertical-align: middle; }
.x-table thead th { font-size: 0.625rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dz-teal); }
.x-table tbody tr:last-child > * { border-bottom: 0; }
.x-table tbody th { position: sticky; left: 0; background: #151918; font-weight: 600; white-space: nowrap; }
.x-table tbody th a { display: inline-flex; align-items: center; gap: 0.625rem; min-height: 2.75rem; text-underline-offset: 0.2em; }
.x-table tr.is-rec > * { background: rgba(169, 217, 138, 0.1); }
.x-table tr.is-rec th { background: #1d2620; }
.x-letter { display: inline-grid; place-items: center; min-width: 2.25rem; height: 1.75rem; padding: 0 0.375rem; border: 1px solid var(--dz-line-strong); border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
.is-rec .x-letter { background: var(--dz-green); border-color: var(--dz-green); color: var(--dz-bg); }
.x-dots { display: inline-flex; gap: 0.25rem; }
.x-dots span { width: 0.625rem; height: 0.625rem; border-radius: 50%; border: 1.5px solid var(--dz-line-strong); }
.x-dots span.is-on { background: var(--dz-ink); border-color: var(--dz-ink); }
.is-rec .x-dots span.is-on { background: var(--dz-green); border-color: var(--dz-green); }
.x-key { margin: 0.5rem 0 0; font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-muted); }
.x-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(19rem, 1fr)); gap: 0.875rem; margin-top: 0.875rem; }
.x-card { display: flex; flex-direction: column; gap: 0.75rem; padding: 1.125rem 1.25rem 1.25rem; background: rgba(20, 24, 23, 0.82); border: 1px solid var(--dz-line); border-radius: 18px; }
.x-card.is-part { border-color: rgba(169, 217, 138, 0.35); }
.x-card-head { display: flex; align-items: center; gap: 0.875rem; }
.x-big { flex: none; display: grid; place-items: center; width: 3rem; height: 3rem; border-radius: 12px; background: rgba(233, 230, 214, 0.12); font-size: 1.5rem; font-weight: 800; color: var(--dz-ink); }
.is-part .x-big { background: rgba(169, 217, 138, 0.2); color: var(--dz-green-ink); }
.x-cost { margin: 0.25rem 0 0; font-size: 0.6875rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--dz-teal); }
.x-pitch { margin: 0; color: #e3e0d0; }
.x-best { margin: 0; padding: 0.5rem 0.75rem; border-left: 2px solid var(--dz-line-strong); background: rgba(10, 12, 11, 0.35); color: #dcd9cb; font-size: 0.95rem; }
.x-best .dmz-mono { display: block; font-size: 0.625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dz-muted); }
.x-pc { display: grid; gap: 0.75rem; }
.x-pc ul { margin: 0.25rem 0 0; padding-left: 1.1rem; display: grid; gap: 0.25rem; color: #d6d3c4; font-size: 0.925rem; }
.x-pc-h { margin: 0; font-size: 0.625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
.x-pc-h.is-pro { color: var(--dz-green); }
.x-pc-h.is-con { color: #e39a6b; }
.x-cost-note { margin: 0; color: var(--dz-muted); font-size: 0.875rem; }
.x-open { align-self: flex-start; margin-top: auto; min-height: 2.75rem; font-size: 0.95rem; }
.x-today-text { margin: 0 0 0.875rem; max-width: 46rem; color: #dcd9cb; }
.x-today { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.375rem; }
.x-today li { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.75rem; border: 1px solid var(--dz-line); border-radius: 999px; font-size: 0.925rem; color: var(--dz-ink-2); }
.x-today .dmz-mono { font-size: 0.75rem; color: var(--dz-muted); }
.x-plan { margin: 1rem 0 0; color: var(--dz-muted); font-size: 0.925rem; }
.x-plan code { font-family: 'JetBrains Mono', ui-monospace, Consolas, monospace; font-size: 0.85rem; color: var(--dz-ink-2); }
@media (max-width: 899px) {
  .x-rec { grid-template-columns: 1fr; padding: 1.125rem; }
  .x-grid { grid-template-columns: 1fr; }
}
</style>
